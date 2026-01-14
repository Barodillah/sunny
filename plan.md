Dokumen Spesifikasi Aplikasi: SUN-Connect (Mitsubishi SUN Bekasi)
1. Ringkasan Eksekutif
SUN-Connect adalah platform Customer Engagement terpadu untuk Mitsubishi SUN Bekasi. Aplikasi ini menggabungkan Landing Page modern dengan asisten cerdas bernama SUNNY (AI Chatbot) yang mampu mengonversi pengunjung menjadi data prospek (leads) melalui antarmuka percakapan yang interaktif.
2. Identitas Brand & Visual
Nama Aplikasi: SUN-Connect
Nickname AI: SUNNY (SUN Assistant & Hybrid AI)
Tema Warna: - Primary: Mitsubishi Red (#E60012)
Secondary: Sun Yellow (#FFCE00 - Aksen hangat)
Background: Clean White & Light Gray (#F8F9FA)
Tipografi: Montserrat atau Roboto (Modern, tegas, dan mudah dibaca).
3. Arsitektur Modul Aplikasi
A. Frontend: Modern Landing Page (React)
Halaman depan yang berfungsi sebagai magnet konsumen dengan komponen:
Parallax Hero Section: Visual unit unggulan (Xpander/Pajero) dengan efek kedalaman.
Interactive Unit Showcase: Filter unit berdasarkan tipe (SUV, MPV, Commercial).
Floating Action Button (FAB): Icon "SUNNY" yang memicu munculnya Modal Chatbot.
Service Quick-Access: Grid interaktif untuk navigasi cepat ke fitur utama.
B. AI Chatbot Engine: SUNNY (The Core)
Sistem chatbot yang tidak hanya berbasis aturan (rule-based), tapi berbasis AI:
Initial Modal State:
Greeting: Pesan selamat datang personal.
Quick Question Chips: Tombol cepat (e.g., "Promo Xpander", "Booking Service").
Quick Chat Input: Field teks untuk pertanyaan bebas.
Transition Logic: Perpindahan mulus dari Modal ke Full Chat Page saat percakapan dimulai.
Lead Extraction: AI secara otomatis mendeteksi dan menyimpan informasi (Nama, HP, Jenis Layanan) dari percakapan natural.
C. Admin Dashboard (Operational Hub)
Panel kontrol untuk staf Mitsubishi SUN Bekasi:
Request Manager: - Dashboard untuk melihat data masuk.
Kategori: Sales Inquiry, Test Drive, Service Booking, Spareparts.
AI Knowledge Center (The "Brain" Setting):
Bulletin Uploader: Input teks atau upload dokumen (PDF/Doc) berisi promo terbaru.
Prompt Engineering: Pengaturan gaya bicara AI (Friendly, Formal, atau Sales-oriented).
Analytics: Grafik volume chat, unit paling populer, dan efektivitas konversi.
4. Alur Kerja Pengguna (User Flow)
1. Skenario Konsumen (Landing Page ke Chat)
Entry: User membuka website -> Terpesona dengan visual landing page.
Interaction: User klik icon SUNNY -> Modal muncul -> User klik "Booking Service" atau mengetik "Berapa harga Xpander?".
Redirection: Aplikasi melakukan transisi halus ke halaman /chat.
Engagement: SUNNY memberikan informasi akurat berdasarkan data terbaru di dashboard.
Conversion: SUNNY meminta data kontak (jika belum ada) -> Data masuk ke Dashboard Admin.
2. Skenario Admin (Update Ilmu AI)
Update: Dealer memiliki promo "Cicilan 0% Januari".
Action: Admin masuk ke Dashboard -> Menu Knowledge Center -> Input detail promo.
Effect: Secara instan, SUNNY "belajar" dan mulai menawarkan promo tersebut kepada user yang bertanya tentang harga/cicilan.
5. Spesifikasi Teknis (Tech Stack)
Layer
Teknologi
Deskripsi
Frontend
React.js (Vite)
Framework utama untuk UI yang reaktif.
Styling
Tailwind CSS
Utility-first CSS untuk desain modern & responsif.
Animation
Framer Motion
Untuk transisi modal dan page transition yang halus.
Backend
Laravel / Node.js
Pengolahan data, API, dan sistem autentikasi Dashboard.
AI Engine
OpenAI GPT-4o
Otak di balik SUNNY untuk pemrosesan bahasa alami.
Database
PostgreSQL
Penyimpanan data leads, user, dan konfigurasi AI.
Knowledge Base
Vector DB (Pinecone)
Menyimpan "ilmu" dari bulletin agar bisa dicari AI dengan cepat.

6. Struktur Data Utama (Database Schema)
Users/Leads Table: id, name, phone, email, last_interaction, status.
Inquiries Table: id, user_id, type (Service/Sales), unit_interest, message_log, created_at.
Knowledge_Base Table: id, title, content (text/blob), category, is_active, updated_by.
Appointments Table: id, user_id, type, preferred_date, status (Pending/Confirmed/Done).
7. Roadmap Pengembangan
Phase 1: Desain UI/UX & Pengembangan Landing Page (React).
Phase 2: Integrasi Chatbot Modal & Logic Transisi Halaman.
Phase 3: Pengembangan Dashboard Admin & Database.
Phase 4: Integrasi AI (OpenAI API) & Sistem Knowledge Base (RAG).
Phase 5: Testing, Bug Fixing, & Deployment.
Dibuat Oleh: Sistem Arsitek Mitsubishi SUN Bekasi Connector
Tanggal: 2024-05-24
