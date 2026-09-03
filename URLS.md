# Daftar Lengkap Path & URL Absolut — Same Page Redesigns

File ini dibuat agar Anda dapat dengan mudah menyalin (*copy-paste*) alamat URL dan path absolut file langsung dari editor Anda.

---

## 1. Halaman Analytics & Rangkuman (8 Kombinasi Ruangan)

### Opsi A: URL File Standar (Query Params `?combo=X`)

```text
Combo 1 (2 Orang · No Role · No SoT):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=1

Combo 2 (2 Orang · No Role · With SoT):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=2

Combo 3 (2 Orang · Roles Client ↔ Freelancer · No SoT):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=3

Combo 4 (2 Orang · Roles · With SoT Master SOW):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=4

Combo 5 (3+ Orang · No Role · No SoT - Group):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=5

Combo 6 (3+ Orang · No Role · With SoT Reference):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=6

Combo 7 (3+ Orang · Roles Dev/Design/Manager · No SoT):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=7

Combo 8 (3+ Orang · Roles · With SoT Master OKR):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html?combo=8
```

---

### Opsi B: URL File dengan Anchor Hash (`#combo-X`)
*(Didukung 100% oleh semua browser pada protokol `file://` tanpa batasan query string lokal)*

```text
Combo 1: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-1
Combo 2: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-2
Combo 3: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-3
Combo 4: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-4
Combo 5: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-5
Combo 6: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-6
Combo 7: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-7
Combo 8: file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html#combo-8
```

> **Catatan Tampilan Produksi:** Bar "Test Configuration" telah dihilangkan agar halaman 100% mencerminkan lingkungan produksi asli. Halaman analytics secara otomatis mendeteksi dan menampilkan analisis ruangan sesuai URL yang diakses (misal `?combo=1` s/d `?combo=8` atau `#combo-1` s/d `#combo-8`).

---

## 2. Alur Lengkap Sesi Pertanyaan (Question 1 s/d Question 2)

```text
1. Landing / Enter Room Code:
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/index.html

1b. Set Room Identity (Customize Name, Photo, or Join as Guest):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/join.html?code=SYNC-9021

2. Create Room Page:
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/create.html

3. Waiting Room:
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/waiting.html

4. Question 1 — Pengisian Jawaban:
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/session.html?q=1

5. Question 1 — Komparasi Hasil (2 Orang):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/comparison.html?q=1

6. Question 1 — Komparasi Hasil (Multi 5 Orang):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/comparison.html?q=1&view=multi

7. Meme Intermission Page (Hitungan 7s stuck di 00s):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/meme.html

8. Question 2 — Pengisian Jawaban (Pertanyaan Terakhir):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/session.html?q=2

9. Question 2 — Komparasi Hasil (2 Orang):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/comparison.html?q=2

10. Question 2 — Komparasi Hasil (Multi 5 Orang):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/comparison.html?q=2&view=multi

11. Final Session Analytics & Breakdown:
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html

11b. Team Perspectives & Individual Participant Analytics (Multi Toolbar & Modal Popup):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/participants.html

12. User Profile Settings (Edit Name, Photo, Age, Delete Account):
file:///home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/profile.html
```

---

## 3. Path File Lokal di Filesystem Linux Anda

```text
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/join.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/profile.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/analytics.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/comparison.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/meme.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/session.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/waiting.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/create.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/index.html
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/styles.css
/home/vert/Documents/Codes/Quarthar/same-page/redesigns/archive/app.js
```
