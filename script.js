document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.querySelector(".list-icon");
    const closeBtn = document.getElementById("closeBtn");
    const layout = document.querySelector(".layout");
    const chatBubble = document.getElementById("chatBubble");

    // MINIMIZE / EXPAND SIDEBAR
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("minimized");
    });

    // KELUAR → JADI BUBBLE
    closeBtn.addEventListener("click", () => {
        layout.style.opacity = "0";

        setTimeout(() => {
            layout.style.display = "none";
            chatBubble.style.display = "flex";
        }, 250);
    });

    // KLIK BUBBLE → TAMPILKAN PANEL + ANIMASI
    chatBubble.addEventListener("click", () => {
        chatBubble.style.display = "none";
        layout.style.display = "flex";

        // delay sebentar supaya animasi kelihatan
        setTimeout(() => {
            layout.classList.add("fade-in");
            layout.style.opacity = "1";
        }, 10);

        // hapus class animasi biar bisa dipakai lagi nanti
        setTimeout(() => {
            layout.classList.remove("fade-in");
        }, 300);
    });
});
