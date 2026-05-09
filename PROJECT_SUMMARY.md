# Laporan Eksekutif: Sistem Pakar Kesehatan Mental (MVP)

**Tanggal Penyelesaian:** 9 Mei 2026  
**Status Proyek:** SELESAI (Siap untuk Tahap Produksi/Deployment)  
**Tujuan Proyek:** Deteksi dini kondisi kesehatan mental mahasiswa berbasis *Knowledge Base* menggunakan mesin inferensi *Weighted Scoring*.  

---

## 1. Arsitektur Sistem & Stack Teknologi
Pengembangan telah berhasil dipivot dan dieksekusi dengan *Tech Stack* modern yang difokuskan pada ketepatan kalkulasi data dan antarmuka *user-friendly*:
- **Backend API:** Python (Django + Django REST Framework)
- **Database:** PostgreSQL via Supabase (Lokal didukung oleh SQLite untuk *Development*)
- **Frontend / Antarmuka:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Manajemen Versi:** Git & GitHub (Branching strategy: `feat/*` -> `main`)

---

## 2. Metodologi Sistem Pakar: *Weighted Scoring*
Sistem ini menggunakan adaptasi *Certainty Factor* (Weighted Scoring) yang akurat dan tervalidasi dari dataset. Fitur utama dalam mesin inferensi:
1. **Presisi Tinggi:** Menggunakan tipe data `DecimalField` (untuk persentase dan threshold) serta `IntegerField` (untuk bobot absolut gejala) pada tingkat database guna menghindari ambiguitas pembulatan matematis.
2. **Kalkulasi Dinamis:** Backend mengagregasi (*sum*) semua bobot (`weight`) gejala yang di-inputkan user untuk sebuah penyakit (`disease`), membaginya dengan total bobot maksimal (`max_weight`), dan mencocokannya dengan batas minimum (*Confidence Threshold*).
3. **Pencatatan Riwayat:** Setiap diagnosa (Symptom yang dipilih beserta Hasil Penyakit/Skor) secara otonom terekam pada tabel `Consultation` dan `ConsultationSymptom` demi kemudahan audit dan histori *user*.

---

## 3. Realisasi Pengembangan Berdasarkan Fase

### Fase 1: Pemodelan Database & Seeding (Backend)
- [x] Pembuatan *Entity-Relationship Diagram* (ERD) dan relasi antar tabel (Penyakit, Gejala, Basis Pengetahuan).
- [x] Implementasi skema tabel menggunakan ORM Django.
- [x] Pembuatan *Custom Django Management Command* (`seed_data.py`) yang berhasil melakukan ekstraksi murni menggunakan `pandas` terhadap `datasetUTS.xlsx` secara mandiri tanpa campur tangan data manual via Admin Panel.
- **Hasil:** *14 Penyakit, 82 Gejala, dan 147 Aturan Basis Pengetahuan berhasil diimpor otomatis secara presisi.*

### Fase 2: Kontrak API & Layanan Integrasi
- [x] *Endpoint* `GET /api/v1/symptoms/`: Mengembalikan daftar gejala yang diurutkan dan dikelompokkan secara terstruktur (*Category-based*).
- [x] *Endpoint* `POST /api/v1/diagnose/`: Menerima kumpulan *Symptom IDs* dan mengembalikan status lengkap, termasuk persentase keyakinan dan daftar gejala relevan.

### Fase 3: Pengembangan Antarmuka (Frontend UX/UI)
- [x] **Arsitektur Wizard:** Sistem *Multi-step form* diimplementasikan untuk menyajikan puluhan gejala agar tidak membebani sisi psikologis pengguna (kognitif terfokus per halaman kategori).
- [x] **State Management & Loading:** Tersedia animasi transisi antar langkah (`framer-motion`) dan status pengambilan data (`loading spinner`) yang mulus.
- [x] **Visualisasi Hasil (Data-Driven):** Diagnosis tak sebatas teks. *Progress Bar* interaktif lengkap dengan *Red Threshold Marker* disediakan guna menjustifikasi keputusan mesin terhadap penyakit indikatif.

### Fase 4: Optimasi Repositori
- [x] Penghapusan *boilerplate* (file statis SVG, markdown tak terpakai) dari Next.js.
- [x] Standardisasi `.gitignore` untuk direktori `.next/`, `__pycache__`, dan node modules.
- [x] Seluruh alur historis (*commits*) direkonstruksi lalu dieksekusi secara sukses (`git merge`) ke *branch* utama (`main`).

---

## 4. Kesimpulan
Proyek ***MindDiagnose*** (Sistem Pakar Kesehatan Mental) telah melampaui fase prototipe MVP. Sinergi antara ketegasan sistem arsitektur berbasis Python/Django dan fluiditas dari Next.js berhasil menelurkan produk yang aman (data presisi) dan menenangkan (*calming mental-health interface design*). Proyek kini stabil di *branch* `main` dan siap kapan pun dielevasi ke arsitektur server produksi (*Railway/Vercel*).
