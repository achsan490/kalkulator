# PayCalc - Kalkulator Unik dengan Fitur Paywall 💰

Aplikasi kalkulator unik berbasis **Node.js, Express.js, HTML5, CSS3, dan Vanilla JavaScript**. Aplikasi ini memiliki alur paywall unik di mana hasil kalkulasi matematika **tidak langsung ditampilkan** ketika tombol sama dengan (`=`) ditekan, melainkan meminta pengguna menyelesaikan pembayaran simulasi QRIS sebesar **Rp1.000**.

---

## 🚀 Cara Menjalankan Proyek di Lokal Komputer

### Prasyarat:
Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/) di komputer Anda (versi 16 atau yang lebih baru).

### Langkah-langkah:

1. **Buka Terminal / Command Prompt** di folder proyek ini (`d:\project\kalkulator`).

2. **Install Dependensi**:
   Jalankan perintah berikut untuk menginstall `express` dan `cors`:
   ```bash
   npm install
   ```

3. **Jalankan Server Backend**:
   Jalankan perintah:
   ```bash
   npm start
   ```

4. **Akses Aplikasi di Browser**:
   Buka browser Anda (Chrome, Edge, Firefox, dll) dan kunjungi:
   ```text
   http://localhost:3000
   ```

---

## 🎯 Fitur & Alur Penggunaan

1. **Memasukkan Angka & Operasi Hitung**:
   - Ketik angka dan operasi matematika seperti biasa (contoh: `15 + 25` atau `100 * 5`).
   - Dapat menggunakan tombol pada layar atau **keyboard komputer** (Numpad, +, -, *, /, Enter, Backspace, Esc).

2. **Memicu Paywall (`=`)**:
   - Saat tombol `=` ditekan, kalkulator tidak langsung menampilkan jawaban.
   - Pop-up modal **Paywall** akan terbuka menampilkan:
     - Teks humoris: *"Matematika itu mahal! Bayar Rp1.000 untuk melihat jawabannya."*
     - Desain QRIS otentik & ringkasan tagihan.
     - Tombol **"Simulasi Bayar Rp1.000 (Lunas)"** dan **"Batal"**.

3. **Membuka Jawaban (Success / Cancel)**:
   - Jika menekan **Simulasi Bayar Rp1.000 (Lunas)**: Modal memproses transaksi ke API Backend Express, menampilkan animasi sukses, dan membuka jawaban akurat (`40`) di layar kalkulator.
   - Jika menekan **Batal**: Modal tertutup dan kalkulator tetap menampilkan ekspresi tanpa membocorkan jawaban.

---

## 📁 Struktur File Proyek

```text
kalkulator/
├── index.html        # Tampilan UI Kalkulator & Modal Paywall
├── style.css         # Styling Glassmorphism Dark Modern Theme
├── script.js         # Logika Kalkulator, Modal, & Integrasi API
├── server.js         # Backend Express.js & Evaluasi Matematika Aman
├── package.json      # Konfigurasi & Dependensi Node.js
└── README.md         # Dokumentasi & Petunjuk Penggunaan
```
