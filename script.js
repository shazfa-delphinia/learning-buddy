/* file: script.js */

// Ambil elemen-elemen yang kita perlukan
const toggleButton = document.getElementById('toggle-sidebar-btn');
const container = document.getElementById('chatbot-container');
const toggleIcon = document.getElementById('toggle-icon');

// Tambahkan 'event listener' saat tombol di-klik
toggleButton.addEventListener('click', () => {
    // 'toggle' akan menambah/menghapus class 'sidebar-collapsed'
    // pada container utama
    container.classList.toggle('sidebar-collapsed');

    // Cek apakah sidebar sekarang tersembunyi (collapsed)
    if (container.classList.contains('sidebar-collapsed')) {
        // Jika ya (seperti gambar kanan), ganti ikonnya
        toggleIcon.classList.remove('fa-grip'); // Hapus ikon 9-dot
        toggleIcon.classList.add('fa-solid', 'fa-comment'); // Tambah ikon chat
    } else {
        // Jika tidak (seperti gambar kiri), kembalikan ikonnya
        toggleIcon.classList.remove('fa-solid', 'fa-comment'); // Hapus ikon chat
        toggleIcon.classList.add('fa-grip'); // Tambah ikon 9-dot
    }
});