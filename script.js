// =====================================
// 1. KONFIG API DICODING
// =====================================
const API_URL_learning_paths = "https://jrkqcbmjknzgpbtrupxh.supabase.co/rest/v1/learning_paths";
const API_URL_courses        = "https://jrkqcbmjknzgpbtrupxh.supabase.co/rest/v1/courses";
const API_URL_course_levels  = "https://jrkqcbmjknzgpbtrupxh.supabase.co/rest/v1/course_levels";
const API_URL_tutorials      = "https://jrkqcbmjknzgpbtrupxh.supabase.co/rest/v1/tutorials";

const API_KEY = "sb_publishable_h889CjrPIGwCMA9I4oTTaA_2L22Y__R"

// Penampung data
let dbLearningPaths = [];
let dbCourses       = [];
let dbCourseLevels  = [];
let dbTutorials     = [];

let knowledgeBase   = [];

// Helper fetch
async function fetchDicoding(url) {
  const res = await fetch(`${url}?apikey=${API_KEY}`);
  return res.json();
}

// Ambil semua data sekali di awal
async function loadAllData() {
  try {
    const [
      learningPaths,
      courses,
      courseLevels,
      tutorials,
    ] = await Promise.all([
      fetchDicoding(API_URL_learning_paths),
      fetchDicoding(API_URL_courses),
      fetchDicoding(API_URL_course_levels),
      fetchDicoding(API_URL_tutorials),
    ]);

    console.log("LEARNING PATHS:", learningPaths);
    console.log("COURSES:", courses);
    console.log("COURSE LEVELS:", courseLevels);
    console.log("TUTORIALS:", tutorials);

    dbLearningPaths = learningPaths;
    dbCourses       = courses;
    dbCourseLevels  = courseLevels;
    dbTutorials     = tutorials;

    // ==========================
    // BANGUN KNOWLEDGE BASE DI SINI
    // ==========================
    knowledgeBase = [];

    // learning paths
    dbLearningPaths.forEach(lp => {
      knowledgeBase.push({
        type: "learning_path",
        title: lp.learning_path_name || lp.title || "",
        description:
          lp.learning_path_description ||
          lp.description ||
          lp.short_description ||
          "",
        raw: lp,
      });
    });

    // courses
    dbCourses.forEach(c => {
      knowledgeBase.push({
        type: "course",
        title: c.course_name || c.title || "",
        description:
          c.course_description ||
          c.description ||
          c.short_description ||
          "",
        raw: c,
      });
    });

    // tutorials
    dbTutorials.forEach(t => {
      knowledgeBase.push({
        type: "tutorial",
        title: t.tutorial_title || t.title || "",
        description:
          t.description ||
          t.short_description ||
          "",
        raw: t,
      });
    });

    console.log("KNOWLEDGE BASE:", knowledgeBase.length, "item");
  } catch (e) {
    console.error("Gagal akses API:", e);
  }
}

// =====================================
// 2. OTAK CHATBOT: pilih jawaban paling relevan
// =====================================
function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúà-ùü \-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMatch(userText, itemTitle) {
  const u = normalize(userText);
  const t = normalize(itemTitle);

  if (!t) return 0;

  // kalau judul full ada di pertanyaan → skor tinggi
  if (u.includes(t)) return 1.0;

  const uWords = new Set(u.split(" ").filter(Boolean));
  const tWords = t.split(" ").filter(Boolean);
  if (!tWords.length) return 0;

  let matchCount = 0;
  tWords.forEach(w => {
    if (uWords.has(w)) matchCount++;
  });

  return matchCount / tWords.length; // 0–1
}

function getAnswerFromDicoding(userText) {
  if (!knowledgeBase.length) {
    return "Sebentar ya… aku masih memuat data dari Dicoding 🙂";
  }

  let bestItem = null;
  let bestScore = 0;

  knowledgeBase.forEach(item => {
    const score = scoreMatch(userText, item.title);
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  });

  console.log("BEST MATCH:", { bestItem, bestScore });

  // kalau skor terlalu kecil, anggap tidak relevan
  if (!bestItem || bestScore < 0.25) {
    return "Maaf, aku tidak menemukan materi yang pas. Coba gunakan nama course atau learning path yang lebih spesifik ya 😊";
  }

  const title = bestItem.title || "(tanpa judul)";
  const desc =
    bestItem.description && bestItem.description.trim().length > 0
      ? bestItem.description
      : "Belum ada deskripsi yang jelas di data.";

  if (bestItem.type === "learning_path") {
    return `👍 Learning Path yang paling relevan:\n\n${title}\n\n${desc}`;
  }

  if (bestItem.type === "course") {
    return `📘 Course yang paling relevan:\n\n${title}\n\n${desc}`;
  }

  if (bestItem.type === "tutorial") {
    return `📙 Tutorial paling relevan:\n\n${title}\n\n${desc}`;
  }

  return `Berikut materi paling relevan:\n\n${title}\n\n${desc}`;
}

// =====================================
// 3. UI: SIDEBAR + CHATBOT
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load data API
  loadAllData();

  // 2. Sidebar toggle
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".list-icon"); // tombol kotak

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("minimized");
    });
  }

  // 3. Chatbot
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  function addMessage(text, role = "user") {
    if (!chatMessages) return;

    const bubble = document.createElement("div");
    bubble.classList.add(
      "bubble",
      role === "user" ? "bubble-user" : "bubble-bot"
    );
    bubble.textContent = text;
    chatMessages.appendChild(bubble);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const text = chatInput.value.trim();
      if (!text) return;

      // tampilkan pesan user
      addMessage(text, "user");
      chatInput.value = "";

      console.log("User tanya:", text);

      let reply;
      try {
        reply = getAnswerFromDicoding(text);
        console.log("Jawaban bot (mentah):", reply);
      } catch (err) {
        console.error("Error di getAnswerFromDicoding:", err);
        reply = "Maaf, terjadi kesalahan di otak Learning Buddy 🙏";
      }

      if (!reply) {
        reply = "Maaf, aku belum bisa menjawab pertanyaan itu.";
      }

      addMessage(reply, "bot");
    });
  } else {
    console.warn("Elemen chat belum lengkap (chat-form / chat-input / chat-messages tidak ditemukan).");
  }
});
