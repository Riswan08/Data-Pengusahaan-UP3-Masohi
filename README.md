# Profil Pengusahaan — UP3 Masohi

Dokumen web interaktif profil pengusahaan & kelistrikan PT PLN (Persero) UP3 Masohi
(Pulau Seram): organisasi & SDM, wilayah kerja, neraca pelanggan, aset jaringan,
sistem pembangkitan, dan dashboard kinerja per unit.

## Cara membuka

Cukup buka `index.html` di browser (klik dua kali). Chart.js dan Leaflet sudah
tersedia lokal di folder `vendor/`, jadi profil tetap berfungsi **tanpa internet**
(hanya peta latar OpenStreetMap dan font Google yang butuh koneksi).

Halaman admin lebih stabil dijalankan lewat server lokal:

```bash
cd Pengusahaan
python3 -m http.server 8765
# buka http://localhost:8765           → profil
# buka http://localhost:8765/admin/    → admin data
```

## Struktur project

```
Pengusahaan/
├── index.html        Halaman profil (struktur & narasi)
├── css/style.css     Seluruh gaya tampilan (mode terang & gelap, cetak)
├── js/
│   ├── data.js       ★ SEMUA DATA — satu-satunya file yang diganti tiap bulan
│   ├── app.js        Logika bab 01–08 (tema, peta, grafik, tabel)
│   └── dashboard.js  Logika bab 09 (dashboard kinerja per unit, gauge)
├── img/              Foto pegawai struktur organisasi
├── vendor/           Chart.js & Leaflet (lokal, untuk offline)
├── admin/index.html  Halaman admin: editor data bulanan
└── Profil_Pengusahaan_UP3_Masohi_2026_1.html   Arsip file asli (backup)
```

## Update data bulanan (tanpa menyentuh kode)

### Cara cepat: upload file

1. Buka **halaman admin** (`admin/index.html`) → tab **⬆ Upload data**.
2. Pilih bagian yang mau diperbarui: **Semua bagian**, **Kinerja bulanan** (NKO & KPI),
   **Data pelanggan** (neraca), atau **Sistem kelistrikan**.
3. Pilih file: `data.js`/JSON (hasil unduhan halaman ini) untuk semua bagian, atau
   **CSV dari Excel** untuk Kinerja/Pelanggan/Sistem — unduh dulu **template CSV**
   agar nama kolom sesuai (pemisah `;` atau `,`, desimal koma didukung).
   Untuk kinerja tersedia dua template:
   - **NKO bulanan** — baris = unit, kolom = bulan; kolom bulan baru (mis. `Jun`)
     otomatis memperpanjang seluruh struktur data.
   - **Indikator kinerja (KPI)** — satu baris = satu indikator per unit per bulan
     (`unit;no;…;bulan;target;realisasi;pencapaian;nilai110`); identifikasi baris
     berdasarkan kolom `unit` + `no`, bulan baru pada kolom `bulan` otomatis
     ditambahkan, dan indikator utama UP3 ikut tersinkron.
4. Klik **✓ Terapkan ke data** → periksa ringkasan → **⬇ Unduh data.js** → ganti
   file `js/data.js`.

### Cara manual: sunting di halaman admin

1. Buka **halaman admin** (`admin/index.html`).
2. Sunting data pada tab yang tersedia:
   - **Metadata** — posisi data (mis. "Juni 2026") & tanggal monitoring; otomatis
     mengganti judul, badge «DATA …», «MONITORING …», dan footer profil.
   - **Neraca pelanggan** — pelanggan/daya/penjualan per unit; bisa tambah/hapus unit.
   - **Sistem kelistrikan** — DP/DM/BP per sistem; cadangan (CAD) dihitung otomatis.
   - **NKO bulanan** — nilai NKO per unit; tombol **+ Tambah bulan** memperpanjang
     seluruh struktur data ke bulan baru.
   - **KPI unit (lanjutan)** — rincian indikator bab 09 dalam format JSON.
3. Klik **✓ Periksa data** untuk validasi konsistensi.
4. Klik **⬇ Unduh data.js**, lalu ganti file `js/data.js` dengan hasil unduhan.
5. Muat ulang halaman profil — selesai.

Catatan: teks narasi (paragraf deskripsi tiap bab, angka pada kartu statis bab 04/08,
dan diagram satu garis di hero) masih ditulis langsung di `index.html`; sesuaikan
manual bila diperlukan.

## Fitur

- Mode terang/gelap (pilihan tersimpan di browser)
- **⎙ Cetak / simpan PDF dengan pilihan bab** — cetak semua, hanya kinerja (bab 08–09),
  atau kombinasi bab mana pun
- Sidebar navigasi dengan penanda bab aktif mengikuti posisi gulir (scroll-spy)
- Peta interaktif unit & sistem pembangkitan (Leaflet + OpenStreetMap)
- Grafik interaktif (Chart.js), tabel dengan pencarian & filter
- Dashboard kinerja per unit dengan gauge per sub-indikator
- Responsif untuk layar kecil (HP/tablet) dan siap cetak ke PDF
