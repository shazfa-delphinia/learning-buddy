const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("minimized");

    // Ganti ikon
    closeBtn.textContent =
        sidebar.classList.contains("minimized") ? "⮞" : "⮜";
});
