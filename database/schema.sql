-- =============================================================
-- SUN-Connect Database Schema
-- Mitsubishi SUN Bekasi - Customer Engagement Platform
-- =============================================================

-- Drop existing tables (if needed for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS analytics;
DROP TABLE IF EXISTS request_status_history;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS knowledge_base;
DROP TABLE IF EXISTS promos;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- 1. USERS TABLE - Login/Authentication Only
-- =============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    role ENUM('super_admin', 'admin', 'sales', 'service') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 2. CHAT_SESSIONS TABLE - Chat Sessions
-- =============================================================
CREATE TABLE chat_sessions (
    id VARCHAR(20) PRIMARY KEY COMMENT 'Format: SESS-XXX',
    guest_name VARCHAR(100) NULL COMMENT 'Guest name if provided',
    summary VARCHAR(500) NULL COMMENT 'AI-generated summary',
    duration_seconds INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    
    INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 3. REQUESTS TABLE - Incoming Requests (Flexible)
-- =============================================================
-- Semua data customer langsung di table ini
-- Data tambahan sesuai type disimpan di kolom JSON 'details'
CREATE TABLE requests (
    id VARCHAR(20) PRIMARY KEY COMMENT 'Format: REQ-XXX',
    type ENUM('Service Booking', 'Test Drive', 'Sparepart Info', 'Sales Inquiry') NOT NULL,
    status ENUM('pending', 'processed', 'completed', 'cancelled') DEFAULT 'pending',
    
    -- Customer Info (langsung di sini)
    name VARCHAR(255) NOT NULL COMMENT 'Nama customer',
    phone VARCHAR(50) NOT NULL COMMENT 'Nomor telepon',
    email VARCHAR(255) NULL COMMENT 'Email (opsional)',
    
    -- Vehicle Info
    vehicle VARCHAR(255) NULL COMMENT 'Nama kendaraan (misal: Xpander Ultimate 2023)',
    plat VARCHAR(20) NULL COMMENT 'Nomor plat kendaraan',
    
    -- Flexible Details (JSON) - sesuai type request
    -- Service Booking: {"service_date": "2024-01-15", "arrival_time": "09:00", "service_type": "Berkala 10.000km", "complaints": "AC kurang dingin"}
    -- Test Drive: {"test_date": "2024-01-16", "test_time": "14:00", "unit_interest": "Pajero Sport Dakar"}
    -- Sparepart Info: {"part_name": "Brake Pad", "part_code": "MZ320123", "quantity": 2}
    -- Sales Inquiry: {"unit_interest": "Xpander Cross", "budget": "300jt-350jt", "trade_in": true}
    details JSON NULL COMMENT 'Data tambahan sesuai type request',
    
    -- Notes & Session
    notes TEXT NULL COMMENT 'Catatan tambahan dari customer',
    session_id VARCHAR(20) NULL COMMENT 'Related chat session',
    
    -- Assignment
    assigned_to INT NULL COMMENT 'Staff yang ditugaskan',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_phone (phone),
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update chat_sessions to reference requests
ALTER TABLE chat_sessions 
    ADD COLUMN request_id VARCHAR(20) NULL COMMENT 'Generated request from this session',
    ADD FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;

-- =============================================================
-- 4. REQUEST_STATUS_HISTORY TABLE - Status Timeline
-- =============================================================
CREATE TABLE request_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL COMMENT 'Display label',
    changed_by INT NULL COMMENT 'User who changed status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_request (request_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 5. CHAT_MESSAGES TABLE - Individual Messages
-- =============================================================
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(20) NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 6. KNOWLEDGE_BASE TABLE - AI Knowledge
-- =============================================================
CREATE TABLE knowledge_base (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL COMMENT 'Question or topic',
    content TEXT NOT NULL COMMENT 'Answer or knowledge',
    keywords VARCHAR(500) NULL COMMENT 'Comma-separated keywords',
    category VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_active (is_active),
    INDEX idx_category (category),
    FULLTEXT INDEX ft_search (title, content, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 7. PROMOS TABLE - Promo Campaigns
-- =============================================================
CREATE TABLE promos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Promo code e.g. MERDEKA2024',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NULL COMMENT 'Thumbnail URL',
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NULL,
    end_date DATE NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- 8. ANALYTICS TABLE - Daily Statistics
-- =============================================================
CREATE TABLE analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_requests INT DEFAULT 0,
    total_chats INT DEFAULT 0,
    avg_response_time DECIMAL(5,2) NULL COMMENT 'Average response time in seconds',
    conversion_rate DECIMAL(5,2) NULL COMMENT 'Conversion rate percentage',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SAMPLE DATA
-- =============================================================

-- Insert default users (for login)
INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'admin@sunbekasi.com', '$2y$10$dummyhash', 'super_admin'),
('Sales Team', 'sales@sunbekasi.com', '$2y$10$dummyhash', 'sales'),
('Service Team', 'service@sunbekasi.com', '$2y$10$dummyhash', 'service');

-- Insert sample chat sessions
INSERT INTO chat_sessions (id, guest_name, summary, duration_seconds) VALUES 
('SESS-892', 'Budi Santoso', 'Asking about Xpander pricing and booking service', 320),
('SESS-891', 'Guest_21', 'Service booking inquiry', 130),
('SESS-890', 'Guest_20', 'General greeting', 45),
('SESS-889', 'Guest_19', 'Complaint about AC', 492);

-- Insert sample requests with JSON details
INSERT INTO requests (id, type, status, name, phone, email, vehicle, plat, details, notes, session_id) VALUES 
('REQ-001', 'Service Booking', 'completed', 'Budi Santoso', '+6281234567890', 'budisantoso@example.com', 
    'Mitsubishi Xpander Ultimate 2023', 'B 1234 XYZ',
    '{"service_date": "2024-01-15", "arrival_time": "09:00", "service_type": "Berkala 10.000km", "complaints": "AC kurang dingin"}',
    'Prefer weekend slot', 'SESS-892'),
    
('REQ-002', 'Test Drive', 'pending', 'Sarah Wijaya', '+6289876543210', 'sarah.wijaya@example.com',
    NULL, NULL,
    '{"test_date": "2024-01-16", "test_time": "14:00", "unit_interest": "Pajero Sport Dakar 2024"}',
    'Interested in test drive this weekend', NULL),
    
('REQ-003', 'Sparepart Info', 'cancelled', 'Ahmad Dani', '+6281122334455', NULL,
    'L300 2018', 'B 5678 ABC',
    '{"part_name": "Brake Pad", "part_code": "MZ320123", "quantity": 2}',
    'Asking about brake pad prices', NULL),

('REQ-004', 'Sales Inquiry', 'pending', 'Dewi Lestari', '+6281999888777', 'dewi@example.com',
    NULL, NULL,
    '{"unit_interest": "Xpander Cross", "budget": "300jt-350jt", "trade_in": true, "current_vehicle": "Toyota Avanza 2019"}',
    'Looking for family car upgrade', NULL);

-- Update chat session with request_id
UPDATE chat_sessions SET request_id = 'REQ-001' WHERE id = 'SESS-892';

-- Insert request status history
INSERT INTO request_status_history (request_id, status, label) VALUES 
('REQ-001', 'pending', 'Pending Review'),
('REQ-001', 'processed', 'In Progress'),
('REQ-001', 'completed', 'Completed'),
('REQ-002', 'pending', 'Pending Review');

-- Insert sample chat messages
INSERT INTO chat_messages (session_id, sender, message) VALUES 
('SESS-892', 'user', 'Halo, saya mau tanya harga Xpander terbaru.'),
('SESS-892', 'bot', 'Halo Kak! Tentu, untuk Mitsubishi Xpander harga OTR Jakarta saat ini mulai dari Rp 267.700.000 untuk tipe GLS MT hingga Rp 322.900.000 untuk tipe Ultimate CVT. Ada tipe tertentu yang Kakak minati?'),
('SESS-892', 'user', 'Kalau yang Ultimate CVT cicilannya berapa ya?'),
('SESS-892', 'bot', 'Untuk Xpander Ultimate CVT, kami ada program DP Ringan mulai 10% atau Bunga 0%. Kakak rencana ambil tenor berapa tahun?'),
('SESS-892', 'user', 'Rencana 3 tahun, DP sekitar 100jt.'),
('SESS-892', 'bot', 'Baik Kak. Dengan DP 100jt dan tenor 3 tahun, estimasi angsuran sekitar Rp 7.5jt/bulan. Kami juga bisa bantu jadwalkan Service berkala jika berminat.'),
('SESS-892', 'user', 'Boleh, sekalian booking service.'),
('SESS-892', 'bot', 'Siap Kak! Boleh dibantu nama lengkap dan no WA untuk konfirmasi jadwalnya?');

-- Insert sample knowledge base
INSERT INTO knowledge_base (title, content, keywords, category) VALUES 
('Apa saja syarat kredit Xpander?', 'Syarat kredit meliputi KTP, KK, NPWP, Slip Gaji 3 bulan terakhir, dan Rekening Koran.', 'syarat, kredit, xpander, dokumen', 'Sales'),
('Dimana lokasi bengkel resmi?', 'Kami berlokasi di Jl. Ir. H. Juanda No. 35 Bulak Kapal – Bekasi Timur.', 'lokasi, bengkel, alamat', 'General'),
('Apakah ada promo trade-in?', 'Ya, kami memiliki program trade-in dengan penawaran harga spesial untuk mobil lama Anda.', 'promo, trade-in, tukar tambah', 'Sales');

-- Insert sample promos
INSERT INTO promos (code, title, description, image_url, is_active) VALUES 
('MERDEKA2024', 'Promo Merdeka Xpander', 'Bunga 0% hingga 2 tahun & Gratis Asuransi.', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', TRUE),
('PAJEROVIP', 'Pajero Sport Special Edition', 'DP Ringan mulai 15% & Voucher Aksesoris 10jt.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800', TRUE),
('SERVICE20', 'Service Hemat Berkala', 'Diskon Jasa 20% khusus booking via Sunny AI.', 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800', FALSE);

-- Insert sample analytics
INSERT INTO analytics (date, total_requests, total_chats, avg_response_time, conversion_rate) VALUES 
('2024-01-14', 45, 89, 1.2, 24.5),
('2024-01-13', 38, 76, 1.4, 22.1),
('2024-01-12', 52, 102, 1.1, 26.8);

-- =============================================================
-- END OF SCHEMA
-- =============================================================
