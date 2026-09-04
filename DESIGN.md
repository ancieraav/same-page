# Same Page — Design MVP Hackathon

## 1. Tujuan Produk

Same Page membantu dua orang menyamakan pemahaman tentang sebuah topik. Peserta menerima pertanyaan yang dibuat agent berdasarkan topik, attachment, dan informasi tambahan. Setiap peserta menjawab secara independen, lalu agent merangkum persamaan, perbedaan, dan hal-hal yang belum jelas dari jawaban tersebut.

Dokumen ini mendefinisikan versi MVP untuk hackathon. Prioritasnya adalah alur inti yang dapat berjalan dalam waktu singkat dan mudah didemokan.

### Batasan MVP

- Satu room hanya memiliki tepat dua peserta.
- Tidak ada group.
- Tidak ada role.
- Tidak ada Source of Truth.
- Tidak ada anonymous mode.
- Durasi setiap pertanyaan tetap tiga menit.
- Sesi dasar berjalan sampai pertanyaan ke-5.
- Agent eksternal mengorkestrasi sesi melalui WebMCP.
- Jawaban peserta selalu dikirim oleh manusia melalui UI.

Website saat ini masih berupa prototype frontend Next.js dengan mock data dan penyimpanan browser. Implementasi produksi perlu mengganti state lokal tersebut dengan state room yang tersimpan di backend dan dapat disinkronkan secara real-time.

## 2. Peran dan Batas Akses

### Peserta

Ada tepat dua peserta di dalam room.

Peserta dapat:

- Bergabung sebelum sesi dimulai.
- Melihat topik, attachment, dan informasi room.
- Menjawab dan memperbarui jawaban selama ronde masih terbuka.
- Melihat jawaban serta analytics setelah ronde selesai.
- Melihat meme intermission jika fitur meme diaktifkan.

Peserta tidak dapat memulai sesi atau mengubah pertanyaan.

### Operator

Operator adalah identitas kontrol yang terhubung dengan agent dan browser yang digunakan untuk menjalankan agent. Operator bukan group atau role peserta.

Operator dapat:

- Meminta agent memulai sesi.
- Memberi arahan pada checkpoint setelah kelipatan 10 pertanyaan.
- Meminta agent melanjutkan sesi.
- Meminta agent menutup sesi.

Operator dapat berada di perangkat atau tab yang sama dengan salah satu peserta, tetapi agent tetap tidak boleh mengisi jawaban peserta.

### Agent

Agent bertugas untuk:

- Membuat pertanyaan.
- Membaca jawaban yang sudah terkumpul.
- Membuat rangkuman dan analytics.
- Menyiapkan pertanyaan berikutnya.
- Menutup sesi sesuai instruksi Operator.

Agent tidak boleh:

- Mengirim jawaban sebagai peserta.
- Mengubah jawaban peserta.
- Mengubah identitas peserta.
- Mengirim chat atau reaction sebagai peserta.

## 3. Alur Sesi

### 3.1 Membuat dan Bergabung ke Room

1. User membuat room dengan nama, topik, attachment, dan informasi tambahan. MVP hanya menerima PDF, DOCX, PNG, SVG, dan JPG.
2. Room dibuat dengan kapasitas tetap dua orang.
3. Peserta kedua masuk menggunakan room code atau invite link.
4. Peserta ketiga menerima pesan bahwa room sudah penuh.
5. Waiting room menampilkan status dua peserta dan status kesiapan mereka. Peserta melihat tombol `Ready`; tombol `Launch Session` hanya ada pada seat operator.
6. Ketika agent memulai sesi, room dikunci dan peserta baru tidak lagi dapat masuk.

Group, role, Source of Truth, role link, dan pengaturan anonymous tidak ditampilkan dalam MVP.

### 3.2 Memulai Sesi

Hanya agent (= operator) yang dapat memulai permainan dengan memanggil WebMCP tool `start_session`.

Start mengembalikan boolean `started` plus `workflow`. Response `start_session` otomatis menyertakan briefing room. Agent juga dapat memanggil `list_context` / `view_context` untuk mengambil ulang briefing tersebut. Briefing berisi:

- Topik dan field information dari room.
- Text hasil ekstraksi PDF dan DOCX.
- Source SVG yang sudah dibuang script-nya.
- `content_url` signed URL untuk file asli dan untuk PNG/JPG yang harus dibaca dengan vision.
- Instruksi eksplisit untuk membuat dan menerbitkan tepat Q1 dan Q2 via `publish_initial_questions`.

Setelah membaca briefing, agent harus:

1. Membaca topik, attachment, dan informasi tambahan room melalui briefing WebMCP.
2. Membuat dan menerbitkan tepat dua pertanyaan awal via `publish_initial_questions`; Q1 aktif dan Q2 queued.
3. Menunggu sampai seluruh peserta menjawab atau deadline 3 menit habis (blocking wait).
4. Mengirim rangkuman via `send_question_summary` sebelum mengaktifkan Q2 atau mengirim pertanyaan berikutnya.

### 3.3 Pengumpulan Jawaban

- Setiap ronde memiliki timer tetap tiga menit.
- Ronde selesai ketika kedua peserta sudah mengirim jawaban atau timer habis.
- Jawaban yang belum dikirim ditandai `missing`.
- Agent hanya boleh menganalisis data yang benar-benar tersimpan.
- Peserta dapat memperbarui jawaban selama timer belum habis.
- Setelah ronde ditutup, jawaban tidak dapat diubah lagi.

### 3.4 Pembuatan Pertanyaan Berikutnya

Setelah Q1 dan Q2 awal, sesi berjalan infinite (nomor auto-increment, tanpa batas 5). Aturan urutan:

```text
Qn aktif
  → Qn selesai (semua menjawab atau deadline)
  → Agent mengirim summary Qn via send_question_summary
  → Agent mengirim Qn+1 via send_question_context
```

Pertanyaan berikutnya mensyaratkan ronde sebelumnya tutup DAN sudah ada summary-nya. Spam saat ronde aktif ditolak 409.

Setiap kelipatan 5 pertanyaan selesai, agent boleh memakai `send_suggest_question` untuk menanyakan saran ke peserta (reuse UI pertanyaan). Di luar kelipatan 5, permintaan ditolak 409 plus workflow.

Pertanyaan berikutnya harus mempertimbangkan:

- Topik dan informasi awal room.
- Isi attachment yang relevan.
- Semua pertanyaan dan jawaban yang sudah selesai.
- Analytics ronde sebelumnya.
- Kontradiksi, ambiguity, atau disagreement yang ditemukan.

Jika jawaban sebelumnya menunjukkan hal yang janggal, pertanyaan berikutnya boleh dirancang untuk menguji atau memunculkan perbedaan pemahaman tersebut.

Jika analytics atau pertanyaan berikutnya belum siap ketika ronde aktif selesai, peserta melihat status bahwa agent sedang menyiapkan ronde berikutnya.

### 3.5 Penutupan Via Stop + Room Summary

Agent dapat memanggil `stop_session` pada nomor pertanyaan berapa pun dan dalam kondisi apa pun. Ronde aktif dipaksa tutup (yang belum menjawab ditandai `missing`), status berubah ke `finalization`.

Setelah itu agent wajib mengirim `send_room_summary` mengikuti template final. Jika format salah, hasil ditolak beserta template yang benar. Jika valid, summary disimpan dan sesi selesai (`completed`). Website menampilkan laporan final.

Checkpoint kelipatan 10 adalah fitur lanjutan, dengan pesan:

> Operator sedang menentukan arah permainan.

Operator mendapatkan UI berbentuk pertanyaan untuk menentukan kelanjutan sesi. Operator dapat:

- Meminta sesi dilanjutkan.
- Memberikan saran atau konteks untuk pertanyaan berikutnya.
- Memilih tombol untuk menutup sesi.

Jika sesi dilanjutkan, jumlah pertanyaan tambahan dapat disebutkan dalam instruksi. Jika jumlah tidak disebutkan, agent dapat menentukannya sendiri dengan batas maksimal 10 pertanyaan tambahan sebelum checkpoint berikutnya.

Checkpoint yang sama muncul setelah Q20, Q30, dan setiap kelipatan 10 berikutnya.

## 4. Analytics

Analytics dibuat setelah setiap ronde selesai dan dapat dilihat oleh kedua peserta.

Analytics MVP bersifat pairwise, bukan perbandingan terhadap benchmark. Isi minimalnya:

- Overall alignment antara dua peserta.
- Alignment masing-masing peserta terhadap perspektif room.
- Poin yang disepakati.
- Poin yang berbeda atau bertentangan.
- Hidden mismatch atau perbedaan definisi.
- Shared assumptions.
- Jawaban yang janggal atau tidak konsisten.
- Confidence dan keterbatasan data.

Angka alignment adalah indikator perbandingan perspektif, bukan kebenaran objektif. Agent harus menggunakan bukti dari jawaban peserta dan menandai jika data tidak cukup.

### Analytics Final

Saat Operator menutup sesi, agent membuat laporan final yang mencakup:

- Semua pertanyaan yang selesai.
- Semua jawaban yang berhasil dikumpulkan.
- Peserta yang tidak menjawab pada ronde tertentu.
- Tren alignment dari awal sampai akhir.
- Agreement dan disagreement utama.
- Rangkuman keputusan atau pemahaman bersama.
- Hal-hal yang masih perlu diklarifikasi.

## 5. Meme Intermission (Ditunda)

Meme bukan hasil generasi atau pilihan bebas agent. Website menggunakan katalog aset meme yang sudah ditentukan.

Fitur meme ditunda dari MVP-5. UI create-room dan WebMCP meme disembunyikan, dan room selalu dibuat tanpa intermission meme. Struktur katalog dan riwayat boleh dipertahankan untuk fase berikutnya.

Aturan saat fitur ini diaktifkan kembali:

- Satu meme yang sama ditampilkan untuk seluruh room.
- Aplikasi memilih meme berdasarkan alignment Operator jika Operator juga merupakan peserta, overall alignment room, dan riwayat meme.
- Jika Operator bukan peserta, aplikasi menggunakan alignment gabungan kedua peserta.
- Meme disiapkan ketika pertanyaan berikutnya sedang aktif.
- Meme baru ditampilkan sebagai intermission sebelum pertanyaan berikutnya.
- Riwayat meme digunakan untuk menghindari pengulangan yang terlalu sering.
- Jika opsi meme dimatikan, intermission dilewati.
- Tidak perlu membuat meme setelah sesi final ditutup.

## 6. State Sesi

State utama yang perlu dipahami oleh UI, backend, dan WebMCP:

```text
waiting
answering
analyzing
finalization
completed
```

Aturan transisi utama:

```text
waiting → answering       via start_session
answering → analyzing     ronde tutup (semua jawab / deadline)
analyzing → answering     via send_question_context (syarat summary ronde lalu ada)
analyzing → finalization  via stop_session
answering → finalization  via stop_session (ronde aktif dipaksa tutup)
finalization → completed  via send_room_summary (template valid)
```

State room harus authoritative di backend. UI browser boleh menyimpan draft jawaban sementara, tetapi jawaban yang sudah dikirim, deadline, dan status ronde harus berasal dari state server. Deadline dicap server selama 180 detik; submit setelah deadline ditolak dan peserta yang belum menjawab ditandai `missing`.

## 7. WebMCP Surface

WebMCP dipakai sebagai lapisan tool yang dapat dipanggil agent dari halaman Operator. Tool harus memiliki input dan output terstruktur serta mengembalikan error yang jelas.

### Tool baca (tanpa workflow, kecuali disebut)

- `view_goals_workflow`: tujuan Same Page, cara kerja session, peran AI.
- `view_current_workflow`: state, goal saat ini, dan fungsi yang harus dipakai.
- `list_context` / `view_context`: daftar identitas konteks (topic, information, attachment) lalu isinya.
- `list_question_context` / `view_question_context`: daftar nomor+status lalu teks soal (tanpa jawaban).
- `list_question_context_responses` / `view_question_context_responses`: siapa sudah jawab lalu body jawaban (bisa resume wait aktif).
- `list_question_summary` / `view_question_summary`: ketersediaan summary lalu isinya (view mengembalikan workflow).
- `view_question_suggest` / `view_question_suggest_responses`: soal saran lalu respons peserta.
- `view_room_summary`: summary akhir (status belum-dibuat bila kosong).

### Tool aksi

- `start_session`: valid saat 2 pemain ready di waiting room. Return briefing `room_context` dan workflow untuk membuat Q1/Q2.
- `publish_initial_questions`: wajib dipanggil sekali setelah start; menerbitkan tepat Q1 (active) dan Q2 (queued).
- `send_question_context`: setelah Q1/Q2, kirim tepat satu pertanyaan (auto-increment, infinite). Blocking wait sampai semua menjawab / deadline, lalu return workflow.
- `send_question_summary`: kirim summary+analisis satu ronde tutup. Duplikat ditolak. Return workflow.
- `send_suggest_question`: hanya tiap kelipatan 5 selesai. Di luar itu ditolak 409 plus workflow.
- `stop_session`: kapan saja, ke `finalization`. Return workflow.
- `send_room_summary`: wajib ikut template; salah ditolak plus template benar; valid menyimpan dan `completed`.

Setelah ronde ditutup, agent membaca respons, menerbitan summary, lalu membuka ronde berikutnya.

Tidak ada `submit_answer` WebMCP tool. Endpoint jawaban harus tetap hanya digunakan oleh interaksi manusia di UI dan seluruh perubahan tetap harus divalidasi oleh backend.

WebMCP adalah API tool di halaman browser, bukan backend transport. Integrasi WebMCP perlu diisolasi, menggunakan feature detection, dan tidak boleh menyimpan secret di client. Referensi: [WebMCP draft specification](https://webmachinelearning.github.io/webmcp/) dan [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp).

### Catatan kompatibilitas harness

- Beberapa harness (mis. chrome-devtools-mcp `execute_webmcp_tool`) meminta argumen sebagai string JSON (`input`), bukan objek `args`. Karena itu setiap error validasi me-gema argumen yang benar-benar diterima (`Received: …`) beserta contoh (`e.g. …`) supaya agent bisa mendiagnosis payload yang rusak.
- Setiap kegagalan tool juga dicatat ke console sebagai `[WebMCP] <nama-tool> failed: <pesan>` sebelum dilempar ulang, supaya alasan aslinya tetap terbaca via `list_console_messages` walau harness menelan pesan error.

## 8. Data MVP

Entitas minimal yang dibutuhkan:

- `room`: identitas, topik, informasi, status, dan konfigurasi meme.
- `operator`: identitas kontrol agent.
- `participants`: tepat dua identitas peserta.
- `attachments`: metadata, lokasi file private, dan context hasil ekstraksi untuk agent.
- `questions`: nomor, teks, status, dan waktu publikasi.
- `answers`: jawaban peserta, status, waktu kirim, dan waktu update terakhir.
- `round_analytics`: rangkuman, metrik, insight, dan confidence.
- `memes`: aset yang dipilih dan riwayat pemakaian.
- `checkpoint_instructions`: arahan Operator setelah kelipatan 10.
- `audit_events`: jejak start, publish, analyze, continue, dan close.

Field yang tidak digunakan dalam MVP:

- `groups`
- `roles`
- `sourceOfTruth`
- `roleInviteLinks`
- `anonymousNames`
- `participantMode`
- kapasitas peserta dinamis

## 9. Acceptance Criteria

- Room tidak dapat memiliki lebih atau kurang dari dua peserta saat sesi dimulai.
- Peserta ketiga ditolak.
- UI tidak menampilkan group, role, Source of Truth, atau anonymous mode.
- Peserta hanya melihat kontrol `Ready`; kontrol `Launch Session` tidak dirender pada seat peserta.
- Hanya agent melalui WebMCP yang dapat memulai sesi.
- Start session memberi agent briefing WebMCP yang dapat membaca PDF, DOCX, SVG, PNG, dan JPG, lalu menghasilkan tepat dua pertanyaan awal.
- Dua peserta dapat menjawab dari browser berbeda.
- Agent tidak dapat membuat atau mengirim jawaban peserta.
- Timer tiga menit menutup ronde dengan aman.
- Q3 dibuat setelah analytics Q1 tersedia ketika Q2 sedang berjalan.
- Pola prefetch berjalan sampai Q5.
- Analytics ronde terlihat oleh kedua peserta setelah ronde selesai.
- Analytics tidak memakai istilah atau benchmark Source of Truth.
- Meme tidak ditampilkan pada MVP.
- Setelah Q5, hanya Operator yang dapat menutup sesi.
- Analytics final mencakup semua ronde yang selesai.
- Refresh, retry WebMCP, dan koneksi terputus tidak menghilangkan jawaban yang sudah tersimpan.

## 10. Fitur yang Ditunda

Fitur berikut sengaja tidak diaktifkan untuk MVP, tetapi struktur desain tidak boleh menghalangi pengembangannya nanti:

- Group dan role.
- Source of Truth.
- Room dengan lebih dari dua peserta.
- Role-specific invite link.
- Anonymous response.
- Kapasitas fleksibel.
- Timer per ronde yang dapat dikustomisasi.
- Analytics benchmark lintas group.

Fitur tersebut hanya boleh dihidupkan kembali setelah alur dua peserta, pengumpulan jawaban, analytics, dan checkpoint Operator stabil.
