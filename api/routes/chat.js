import express from 'express';
import pool from '../db.js';

const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.VITE_OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';

// System prompt for SUNNY AI - Version 2.0 (Enhanced)
const SYSTEM_PROMPT = `INSTRUKSI SISTEM - BACA DENGAN SEKSAMA

Kamu adalah SUNNY, AI customer service dealer Mitsubishi SUN Bekasi.

═══════════════════════════════════════════════════════════════════
ATURAN OUTPUT #1 - WAJIB IKUTI ATAU GAGAL
═══════════════════════════════════════════════════════════════════
KAMU HARUS SELALU OUTPUT DALAM FORMAT JSON MURNI.
TIDAK ADA TEKS DI LUAR JSON.
TIDAK ADA MARKDOWN CODE BLOCK.
LANGSUNG MULAI DENGAN { DAN AKHIRI DENGAN }

═══════════════════════════════════════════════════════════════════
KARAKTER SUNNY
═══════════════════════════════════════════════════════════════════
- Bahasa Indonesia santai tapi sopan
- Panggil customer "Kak" atau nama mereka
- Ramah, helpful, antusias

═══════════════════════════════════════════════════════════════════
MISI UTAMA: KUMPULKAN DATA CUSTOMER
═══════════════════════════════════════════════════════════════════
TARGET DATA WAJIB (HARUS DAPAT):
1. NAMA - nama lengkap atau panggilan
2. NOMOR HP/WA - nomor telepon/WhatsApp

JIKA USER BELUM MEMBERI NAMA/HP:
- Tanyakan dengan cara natural dalam pesan
- Contoh: "Boleh saya tahu nama Kakak dan nomor WA yang bisa dihubungi?"

═══════════════════════════════════════════════════════════════════
DETEKSI DATA DARI PESAN USER
═══════════════════════════════════════════════════════════════════
EKSTRAK data dari pesan user dengan AGRESIF:

NAMA - tangkap jika user bilang:
- "nama saya Budi" → name: "Budi"
- "saya Andi" → name: "Andi"
- "panggil Dian" → name: "Dian"
- "Budi Hartono 08123456789" → name: "Budi Hartono"

NOMOR HP - tangkap jika ada angka 10-13 digit:
- "08123456789" → phone: "08123456789"
- "0812-3456-789" → phone: "08123456789"
- "WA saya 081234567890" → phone: "081234567890"

REQUEST TYPE - tangkap dari konteks:
- "mau service", "booking service" → request_type: "Service Booking"
- "mau test drive", "coba mobil" → request_type: "Test Drive"
- "mau beli", "harga xpander" → request_type: "Sales Inquiry"
- "sparepart", "suku cadang" → request_type: "Sparepart Info"

VEHICLE - tangkap nama mobil:
- "xpander", "pajero", "triton", "l300", "outlander", dll

═══════════════════════════════════════════════════════════════════
FORMAT OUTPUT JSON - WAJIB PERSIS SEPERTI INI
═══════════════════════════════════════════════════════════════════
{
  "message": "pesan untuk customer",
  "collected_data": {
    "name": "NAMA atau null",
    "phone": "NOMOR_HP atau null",
    "request_type": "Service Booking|Test Drive|Sales Inquiry|Sparepart Info|null",
    "vehicle": "NAMA_MOBIL atau null",
    "plat": "PLAT_NOMOR atau null",
    "details": {
      "service_date": "YYYY-MM-DD atau null",
      "arrival_time": "HH:MM atau null",
      "service_type": "jenis service atau null",
      "complaints": "keluhan atau null",
      "test_date": "YYYY-MM-DD atau null",
      "test_time": "HH:MM atau null",
      "unit_interest": "model minat atau null",
      "budget": "range budget atau null",
      "trade_in": "ya/tidak atau null",
      "current_vehicle": "mobil lama atau null",
      "part_name": "nama part atau null",
      "part_code": "kode part atau null",
      "quantity": "jumlah atau null"
    }
  },
  "is_data_complete": false
}

ISI DETAILS SESUAI REQUEST TYPE:
- Service Booking → service_date, arrival_time (WAJIB), service_type, complaints
- Test Drive → test_date, test_time, unit_interest (WAJIB)  
- Sales Inquiry → unit_interest (WAJIB), budget, trade_in, current_vehicle
- Sparepart Info → part_name (WAJIB), part_code, quantity

═══════════════════════════════════════════════════════════════════
KAPAN is_data_complete = true?
═══════════════════════════════════════════════════════════════════
SET TRUE JIKA SEMUA TERPENUHI:
1. "name" SUDAH TERISI (bukan null)
2. "phone" SUDAH TERISI (bukan null)
3. "request_type" SUDAH TERISI (bukan null)

CONTOH CASE TRUE:
- User: "Nama saya Budi, HP 081234567890, mau service"
  → name: "Budi", phone: "081234567890", request_type: "Service Booking", is_data_complete: true

- User sudah kasih nama+HP di chat sebelumnya, lalu bilang "ok lanjut"
  → is_data_complete: true

JANGAN TUNGGU DATA SEMPURNA. 
Nama + HP + Niat = CUKUP untuk TRUE.

═══════════════════════════════════════════════════════════════════
ATURAN KRITIS
═══════════════════════════════════════════════════════════════════
1. SELALU isi collected_data dengan data yang SUDAH diberikan user
2. JANGAN kosongkan collected_data jika user sudah kasih data sebelumnya
3. Jika data sudah ada di context, PERTAHANKAN di collected_data
4. Output HANYA JSON murni, tidak ada teks lain
5. JANGAN tanya email (tidak wajib)

═══════════════════════════════════════════════════════════════════
CONTOH OUTPUT YANG BENAR
═══════════════════════════════════════════════════════════════════
User: "Halo, mau tanya harga xpander"
Output:
{"message":"Halo Kak! 👋 Terima kasih sudah menghubungi Mitsubishi SUN Bekasi. Untuk Xpander, kami punya beberapa varian menarik. Boleh saya tahu nama Kakak dan nomor WA yang bisa dihubungi?","collected_data":{"name":null,"phone":null,"request_type":"Sales Inquiry","vehicle":"Xpander","plat":null,"details":{"service_date":null,"part_name":null,"unit_interest":"Xpander"}},"is_data_complete":false}

User: "Saya Budi, 081234567890"
Output:
{"message":"Terima kasih Kak Budi! 🙏 Data sudah saya catat. Tim sales kami akan segera menghubungi Kakak di 081234567890 untuk info lengkap Xpander. Ada yang ingin ditanyakan lagi?","collected_data":{"name":"Budi","phone":"081234567890","request_type":"Sales Inquiry","vehicle":"Xpander","plat":null,"details":{"service_date":null,"part_name":null,"unit_interest":"Xpander"}},"is_data_complete":true}`;

// Generate session ID
function generateSessionId() {
    const num = Math.floor(Math.random() * 900) + 100;
    return `SESS-${num}`;
}

// Generate request ID
function generateRequestId() {
    const num = Math.floor(Math.random() * 900) + 100;
    return `REQ-${num}`;
}

// Format date to UTC+7 (Asia/Jakarta timezone)
function formatToJakartaTime(date) {
    const options = { timeZone: 'Asia/Jakarta' };
    return {
        time: new Date(date).toLocaleTimeString('en-US', { ...options, hour: '2-digit', minute: '2-digit' }),
        date: new Date(date).toLocaleDateString('en-US', { ...options, month: 'short', day: 'numeric', year: 'numeric' }),
        full: new Date(date).toLocaleString('id-ID', { ...options })
    };
}

// Search knowledge base
async function searchKnowledge(query) {
    try {
        const [rows] = await pool.query(
            `SELECT title, content FROM knowledge_base 
             WHERE is_active = TRUE 
             AND (MATCH(title, content, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
                  OR title LIKE ? OR content LIKE ? OR keywords LIKE ?)
             LIMIT 3`,
            [query, `%${query}%`, `%${query}%`, `%${query}%`]
        );
        return rows;
    } catch (error) {
        console.error('Knowledge search error:', error);
        return [];
    }
}

// Get active promos
async function getActivePromos() {
    try {
        const [rows] = await pool.query(
            `SELECT title, description FROM promos 
             WHERE is_active = TRUE 
             AND (start_date IS NULL OR start_date <= CURDATE())
             AND (end_date IS NULL OR end_date >= CURDATE())
             LIMIT 3`
        );
        return rows;
    } catch (error) {
        console.error('Promo fetch error:', error);
        return [];
    }
}

// Call OpenRouter API
async function callOpenRouter(messages, knowledgeContext = '') {
    // Get current time in Jakarta
    const now = formatToJakartaTime(new Date());
    const timeContext = `\nWAKTU SAAT INI: ${now.full}\n(Gunakan informasi waktu ini untuk menjawab pertanyaan terkait hari, tanggal, atau jam)`;

    let systemPrompt = SYSTEM_PROMPT + timeContext;

    if (knowledgeContext) {
        systemPrompt += `\n\nINFORMASI TAMBAHAN DARI DATABASE:\n${knowledgeContext}`;
    }

    const requestBody = {
        model: OPENROUTER_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON output
        max_tokens: 1000
    };

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://sunbekasi.com',
                'X-Title': 'SUN Bekasi Chatbot'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter call failed:', error);
        throw error;
    }
}

// Server-side data extraction as fallback - Enhanced Version
function extractDataFromText(text, existingData = {}) {
    const extracted = { ...existingData };

    console.log('[EXTRACT] Processing text:', text.substring(0, 100));

    // Extract phone number (Indonesian format)
    const phonePatterns = [
        /(?:0|62|\+62)[\s.-]?8\d{1,2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
        /08\d{8,11}/g,
        /\b\d{10,13}\b/g
    ];

    for (const pattern of phonePatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            // Clean and normalize phone number
            let phone = matches[0].replace(/[\s.-]/g, '');
            if (phone.startsWith('62')) phone = '0' + phone.slice(2);
            if (phone.startsWith('+62')) phone = '0' + phone.slice(3);
            if (phone.length >= 10 && phone.length <= 14) {
                extracted.phone = phone;
                console.log('[EXTRACT] Phone found:', phone);
                break;
            }
        }
    }

    // Enhanced name extraction patterns - More comprehensive
    const namePatterns = [
        // "nama saya Budi", "nama Budi", "saya Budi"
        /(?:nama\s+(?:saya\s+)?(?:adalah\s+)?|saya\s+)([A-Za-z][A-Za-z\s]{1,30})/i,
        // "panggil saya Budi", "panggil Budi"
        /(?:panggil\s+(?:saya\s+)?)([A-Za-z][A-Za-z\s]{1,30})/i,
        // "ini Budi", "saya ini Budi"  
        /(?:ini\s+)([A-Za-z][A-Za-z\s]{1,30})/i,
        // "Budi 081234567890" - name before phone
        /^([A-Za-z][A-Za-z\s]{1,25})\s*[,\-]?\s*(?:0|08|\+62|\d{10})/im,
        // Simple name at start: "Budi, mau service"
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*[,.:]/m,
        // "nama: Budi" or "nama = Budi"
        /nama\s*[:=]\s*([A-Za-z][A-Za-z\s]{1,30})/i,
        // Just a capitalized name word followed by comma/phone
        /\b([A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)\s*[,]?\s*\d{10,13}/,
    ];

    // Common words to exclude from name detection
    const excludeWords = ['ok', 'ya', 'iya', 'siap', 'mau', 'halo', 'hi', 'hai', 'saya', 'nama', 'service', 'servis',
        'booking', 'test', 'drive', 'beli', 'harga', 'mobil', 'xpander', 'pajero', 'triton',
        'baik', 'terima', 'kasih', 'tolong', 'minta', 'besok', 'hari', 'ini', 'untuk'];

    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            let name = match[1].trim();
            // Remove trailing common words
            name = name.split(/\s+/).filter(word => !excludeWords.includes(word.toLowerCase())).join(' ').trim();

            // Validate name (at least 2 chars, not just numbers, not common words)
            if (name.length >= 2 &&
                !/^\d+$/.test(name) &&
                !excludeWords.includes(name.toLowerCase())) {
                extracted.name = name;
                console.log('[EXTRACT] Name found from user text:', name);
                break;
            }
        }
    }

    // Extract request type from keywords
    const lowerText = text.toLowerCase();
    if (!extracted.request_type) {
        if (lowerText.includes('service') || lowerText.includes('servis') || lowerText.includes('booking')) {
            extracted.request_type = 'Service Booking';
        } else if (lowerText.includes('test drive') || lowerText.includes('coba')) {
            extracted.request_type = 'Test Drive';
        } else if (lowerText.includes('sparepart') || lowerText.includes('part') || lowerText.includes('suku cadang')) {
            extracted.request_type = 'Sparepart Info';
        } else if (lowerText.includes('beli') || lowerText.includes('harga') || lowerText.includes('kredit') || lowerText.includes('cicilan')) {
            extracted.request_type = 'Sales Inquiry';
        }
    }

    // Extract vehicle names
    const vehicles = ['xpander', 'pajero', 'triton', 'l300', 'outlander', 'eclipse', 'colt', 'strada', 'delica'];
    for (const vehicle of vehicles) {
        if (lowerText.includes(vehicle)) {
            extracted.vehicle = vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
            break;
        }
    }

    // Extract plat nomor (Indonesian format)
    const platMatch = text.match(/\b([A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3})\b/i);
    if (platMatch) {
        extracted.plat = platMatch[1].toUpperCase().replace(/\s/g, ' ');
    }

    return extracted;
}

// Extract name from AI response message (e.g., "Kak Budi")
function extractNameFromAIMessage(aiMessage) {
    // Pattern: "Kak [Name]" or "Kakak [Name]"
    const patterns = [
        /(?:Kak|Kakak|Mas|Mbak|Pak|Bu|Bapak|Ibu)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
        /(?:Halo|Hi|Hai)\s+(?:Kak|Kakak|Mas|Mbak)?\s*([A-Z][a-z]+)/,
        /Terima kasih[,!]?\s+(?:Kak|Kakak)?\s*([A-Z][a-z]+)/,
    ];

    for (const pattern of patterns) {
        const match = aiMessage.match(pattern);
        if (match && match[1]) {
            const name = match[1].trim();
            if (name.length >= 2 && !/^(saya|anda|customer|user)$/i.test(name)) {
                console.log('[EXTRACT] Name found from AI message:', name);
                return name;
            }
        }
    }
    return null;
}

// Parse AI response (handle both JSON and plain text) - Enhanced Version
function parseAIResponse(content, userMessage = '', existingData = {}) {
    let result = {
        message: content,
        collected_data: { ...existingData },
        is_data_complete: false
    };

    try {
        let cleanContent = content;

        // 1. Remove markdown code blocks if present
        if (content.includes('```')) {
            cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
        }

        // 2. Remove any leading/trailing whitespace and newlines
        cleanContent = cleanContent.trim();

        // 3. Try to find valid JSON
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);

            // Try parsing
            const parsed = JSON.parse(jsonStr);

            // Validate required fields exist
            if (parsed.message) {
                result.message = parsed.message;
            }

            // Merge collected_data (AI data takes priority, but preserve existing)
            if (parsed.collected_data && typeof parsed.collected_data === 'object') {
                result.collected_data = {
                    ...existingData,
                    ...parsed.collected_data,
                    details: {
                        ...(existingData.details || {}),
                        ...(parsed.collected_data.details || {})
                    }
                };

                // Clean null values but keep actual data
                for (const key of Object.keys(result.collected_data)) {
                    if (result.collected_data[key] === null && existingData[key]) {
                        result.collected_data[key] = existingData[key];
                    }
                }
            }

            result.is_data_complete = parsed.is_data_complete === true;

            console.log('[PARSE] JSON parsed successfully');
        }
    } catch (e) {
        console.error("[PARSE] JSON Parse Error:", e.message);
        console.error("[PARSE] Raw content:", content.substring(0, 200));
    }

    // 4. Server-side extraction as fallback
    if (userMessage) {
        const serverExtracted = extractDataFromText(userMessage, result.collected_data);

        // Merge server-extracted data (only if AI missed it)
        if (serverExtracted.name && !result.collected_data.name) {
            result.collected_data.name = serverExtracted.name;
            console.log('[FALLBACK] Name extracted by server from user text:', serverExtracted.name);
        }
        if (serverExtracted.phone && !result.collected_data.phone) {
            result.collected_data.phone = serverExtracted.phone;
            console.log('[FALLBACK] Phone extracted by server:', serverExtracted.phone);
        }
        if (serverExtracted.request_type && !result.collected_data.request_type) {
            result.collected_data.request_type = serverExtracted.request_type;
        }
        if (serverExtracted.vehicle && !result.collected_data.vehicle) {
            result.collected_data.vehicle = serverExtracted.vehicle;
        }
        if (serverExtracted.plat && !result.collected_data.plat) {
            result.collected_data.plat = serverExtracted.plat;
        }
    }

    // 5. Extract name from AI message as last resort (e.g., "Kak Barod")
    if (!result.collected_data.name && result.message) {
        const nameFromAI = extractNameFromAIMessage(result.message);
        if (nameFromAI) {
            result.collected_data.name = nameFromAI;
            console.log('[FALLBACK] Name extracted from AI response:', nameFromAI);
        }
    }

    // 6. Auto-complete check: if we have name + phone + request_type, mark complete
    if (result.collected_data.name &&
        result.collected_data.phone &&
        result.collected_data.request_type &&
        !result.is_data_complete) {
        result.is_data_complete = true;
        console.log('[AUTO-COMPLETE] Data marked complete by server validation');
    }

    return result;
}

// GET /api/chat/sessions - Get all sessions for history page
router.get('/sessions', async (req, res) => {
    try {
        const [sessions] = await pool.query(`
            SELECT 
                cs.id,
                cs.guest_name,
                cs.summary,
                cs.duration_seconds,
                cs.started_at,
                cs.ended_at,
                cs.request_id,
                COUNT(cm.id) as message_count
            FROM chat_sessions cs
            LEFT JOIN chat_messages cm ON cs.id = cm.session_id
            GROUP BY cs.id
            ORDER BY cs.started_at DESC
            LIMIT 50
        `);

        const formattedSessions = sessions.map(s => {
            const jakartaTime = formatToJakartaTime(s.started_at);
            const duration = s.duration_seconds || 0;
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;

            return {
                id: s.id,
                user: s.guest_name || `Guest_${s.id.replace('SESS-', '')}`,
                summary: s.summary || 'Chat session',
                duration: duration > 0 ? `${minutes}m ${seconds}s` : 'Active',
                time: jakartaTime.time,
                date: jakartaTime.date,
                requestId: s.request_id,
                messageCount: s.message_count
            };
        });

        res.json(formattedSessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// GET /api/chat/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total sessions count
        const [[sessionCount]] = await pool.query('SELECT COUNT(*) as total FROM chat_sessions');
        const totalSessions = sessionCount.total || 0;

        // Get total requests count
        const [[requestCount]] = await pool.query('SELECT COUNT(*) as total FROM requests');
        const totalRequests = requestCount.total || 0;

        // Calculate conversion rate (requests / sessions * 100)
        const conversionRate = totalSessions > 0
            ? Math.round((totalRequests / totalSessions) * 100)
            : 0;

        // Calculate average response time from last 50 messages
        // Get pairs of user message followed by bot message and calculate time difference
        const [messages] = await pool.query(`
            SELECT 
                m1.created_at as user_time,
                m2.created_at as bot_time,
                TIMESTAMPDIFF(SECOND, m1.created_at, m2.created_at) as response_seconds
            FROM chat_messages m1
            INNER JOIN chat_messages m2 ON m1.session_id = m2.session_id 
                AND m2.sender = 'bot' 
                AND m2.created_at > m1.created_at
                AND m2.id = (
                    SELECT MIN(id) FROM chat_messages 
                    WHERE session_id = m1.session_id 
                    AND sender = 'bot' 
                    AND created_at > m1.created_at
                )
            WHERE m1.sender = 'user'
            ORDER BY m1.created_at DESC
            LIMIT 50
        `);

        let avgResponseTime = 0;
        if (messages.length > 0) {
            const totalSeconds = messages.reduce((sum, m) => sum + (m.response_seconds || 0), 0);
            avgResponseTime = (totalSeconds / messages.length).toFixed(1);
        }

        res.json({
            totalSessions,
            totalRequests,
            conversionRate,
            avgResponseTime: parseFloat(avgResponseTime)
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// GET /api/chat/daily-stats - Get daily sessions and requests for last 7 days
router.get('/daily-stats', async (req, res) => {
    try {
        // Get sessions per day for last 7 days
        const [sessionsData] = await pool.query(`
            SELECT 
                DATE(started_at) as date,
                COUNT(*) as count
            FROM chat_sessions
            WHERE started_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(started_at)
            ORDER BY date ASC
        `);

        // Get requests per day for last 7 days
        const [requestsData] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM requests
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Create array for last 7 days with 0 as default
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
                sessions: 0,
                requests: 0
            });
        }

        // Fill in sessions data
        sessionsData.forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            const dayEntry = last7Days.find(d => d.date === dateStr);
            if (dayEntry) {
                dayEntry.sessions = row.count;
            }
        });

        // Fill in requests data
        requestsData.forEach(row => {
            const dateStr = new Date(row.date).toISOString().split('T')[0];
            const dayEntry = last7Days.find(d => d.date === dateStr);
            if (dayEntry) {
                dayEntry.requests = row.count;
            }
        });

        res.json(last7Days);
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({ error: 'Failed to get daily stats' });
    }
});

// Helper to get current Jakarta timestamp for DB
function getJakartaDBTimestamp() {
    const now = new Date();
    // Create date with Jakarta offset (UTC+7) manually to ensure ISO format
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return jakartaTime.toISOString().slice(0, 19).replace('T', ' ');
}

// POST /api/chat/session - Create new session
router.post('/session', async (req, res) => {
    try {
        const sessionId = generateSessionId();
        const now = getJakartaDBTimestamp();

        await pool.query(
            'INSERT INTO chat_sessions (id, started_at) VALUES (?, ?)',
            [sessionId, now]
        );

        // Insert initial bot message
        const welcomeMessage = "Halo! Saya SUNNY, asisten AI Mitsubishi SUN Bekasi. Ada yang bisa saya bantu hari ini? 😊";
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message, created_at) VALUES (?, ?, ?, ?)',
            [sessionId, 'bot', welcomeMessage, now]
        );

        res.json({
            sessionId,
            message: {
                role: 'assistant',
                content: welcomeMessage
            }
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// GET /api/chat/session/:id - Get session history
router.get('/session/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [session] = await pool.query(
            'SELECT * FROM chat_sessions WHERE id = ?',
            [id]
        );

        if (session.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const [messages] = await pool.query(
            'SELECT sender, message, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
            [id]
        );

        res.json({
            session: session[0],
            messages: messages.map(m => ({
                role: m.sender === 'bot' ? 'assistant' : 'user',
                content: m.message,
                timestamp: m.created_at,
                formattedTime: formatToJakartaTime(m.created_at).time
            }))
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ error: 'Failed to get session' });
    }
});

// POST /api/chat/message - Send message and get AI response
router.post('/message', async (req, res) => {
    try {
        const { sessionId, message, collectedData = {} } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'sessionId and message are required' });
        }

        // Save user message
        const userMsgTime = getJakartaDBTimestamp();
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message, created_at) VALUES (?, ?, ?, ?)',
            [sessionId, 'user', message, userMsgTime]
        );

        // Get message history for context
        const [history] = await pool.query(
            'SELECT sender, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20',
            [sessionId]
        );

        const messages = history.map(m => ({
            role: m.sender === 'bot' ? 'assistant' : 'user',
            content: m.message
        }));

        // Search knowledge base for relevant info
        const knowledge = await searchKnowledge(message);
        const promos = await getActivePromos();

        let knowledgeContext = '';
        if (knowledge.length > 0) {
            knowledgeContext += 'Knowledge Base:\n' + knowledge.map(k => `- ${k.title}: ${k.content}`).join('\n');
        }
        if (promos.length > 0) {
            knowledgeContext += '\n\nPromo Aktif:\n' + promos.map(p => `- ${p.title}: ${p.description}`).join('\n');
        }

        // Add context about already collected data
        if (Object.keys(collectedData).length > 0) {
            knowledgeContext += `\n\nData customer yang sudah dikumpulkan: ${JSON.stringify(collectedData)}`;
        }

        // Call OpenRouter
        const aiResponse = await callOpenRouter(messages, knowledgeContext);
        console.log('[DEBUG] RAW AI Response:', aiResponse); // Debug raw response

        // Parse AI response with user message and existing data for fallback extraction
        const parsed = parseAIResponse(aiResponse, message, collectedData);
        console.log('[DEBUG] Parsed Object:', JSON.stringify(parsed, null, 2)); // Debug parsed object

        // Save bot response
        const botMsgTime = getJakartaDBTimestamp();
        await pool.query(
            'INSERT INTO chat_messages (session_id, sender, message, created_at) VALUES (?, ?, ?, ?)',
            [sessionId, 'bot', parsed.message, botMsgTime]
        );

        // Update session with guest name if collected
        if (parsed.collected_data?.name) {
            console.log(`[INFO] Guest name detected: ${parsed.collected_data.name}. Updating session...`);
            const updateResult = await pool.query(
                'UPDATE chat_sessions SET guest_name = ? WHERE id = ?',
                [parsed.collected_data.name, sessionId]
            );
            console.log('[DEBUG] Update Result:', updateResult);
        }

        // ============= DEBUG: Request Creation Check =============
        console.log('\n[REQUEST-CHECK] ==========================================');
        console.log('[REQUEST-CHECK] is_data_complete:', parsed.is_data_complete);
        console.log('[REQUEST-CHECK] collected_data.name:', parsed.collected_data?.name || 'MISSING');
        console.log('[REQUEST-CHECK] collected_data.phone:', parsed.collected_data?.phone || 'MISSING');
        console.log('[REQUEST-CHECK] collected_data.request_type:', parsed.collected_data?.request_type || 'MISSING');
        console.log('[REQUEST-CHECK] Full collected_data:', JSON.stringify(parsed.collected_data, null, 2));
        console.log('[REQUEST-CHECK] ==========================================\n');

        // If data is complete, create request
        const hasName = parsed.collected_data?.name && parsed.collected_data.name.trim().length > 0;
        const hasPhone = parsed.collected_data?.phone && parsed.collected_data.phone.trim().length > 0;
        const shouldCreateRequest = parsed.is_data_complete && hasName && hasPhone;

        console.log('[REQUEST-CHECK] hasName:', hasName, '| hasPhone:', hasPhone, '| shouldCreateRequest:', shouldCreateRequest);

        if (shouldCreateRequest) {
            console.log('[REQUEST-CREATE] Attempting to create request...');

            // Check if request already exists for this session
            const [existingRequest] = await pool.query(
                'SELECT id FROM requests WHERE session_id = ?',
                [sessionId]
            );

            if (existingRequest.length === 0) {
                try {
                    const requestId = generateRequestId();

                    // Normalize request type to match ENUM
                    let requestType = parsed.collected_data.request_type || 'Sales Inquiry';
                    const validTypes = ['Service Booking', 'Test Drive', 'Sparepart Info', 'Sales Inquiry'];

                    // Map common variations to valid types
                    if (requestType.toLowerCase().includes('service')) requestType = 'Service Booking';
                    else if (requestType.toLowerCase().includes('test')) requestType = 'Test Drive';
                    else if (requestType.toLowerCase().includes('part') || requestType.toLowerCase().includes('suku')) requestType = 'Sparepart Info';
                    else if (requestType.toLowerCase().includes('sales') || requestType.toLowerCase().includes('beli')) requestType = 'Sales Inquiry';

                    // Fallback if still invalid
                    if (!validTypes.includes(requestType)) requestType = 'Sales Inquiry';

                    const reqTime = getJakartaDBTimestamp();

                    console.log('[REQUEST-CREATE] Inserting request with data:', {
                        requestId,
                        requestType,
                        name: parsed.collected_data.name,
                        phone: parsed.collected_data.phone,
                        sessionId
                    });

                    await pool.query(
                        `INSERT INTO requests (id, type, status, name, phone, email, vehicle, plat, details, session_id, notes, created_at)
                         VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            requestId,
                            requestType,
                            parsed.collected_data.name,
                            parsed.collected_data.phone,
                            parsed.collected_data.email || null,
                            parsed.collected_data.vehicle || null,
                            parsed.collected_data.plat || null,
                            JSON.stringify(parsed.collected_data.details || {}),
                            sessionId,
                            `Request dari chat session ${sessionId}`,
                            reqTime
                        ]
                    );

                    console.log('[REQUEST-CREATE] Request INSERT success');

                    // Update session with request_id
                    await pool.query(
                        'UPDATE chat_sessions SET request_id = ? WHERE id = ?',
                        [requestId, sessionId]
                    );

                    // Add status history
                    await pool.query(
                        'INSERT INTO request_status_history (request_id, status, label, created_at) VALUES (?, ?, ?, ?)',
                        [requestId, 'pending', 'Request Baru dari Chat', reqTime]
                    );

                    parsed.requestId = requestId;
                    console.log(`[SUCCESS] ✅ Request created: ${requestId} for Session: ${sessionId}`);
                } catch (err) {
                    console.error('[REQUEST-CREATE] ❌ Failed to create request!');
                    console.error('[REQUEST-CREATE] Error Message:', err.message);
                    console.error('[REQUEST-CREATE] SQL State:', err.sqlState);
                    console.error('[REQUEST-CREATE] SQL Message:', err.sqlMessage);
                    console.error('[REQUEST-CREATE] Full Error:', err);
                }
            } else {
                // Request already exists, return existing ID
                parsed.requestId = existingRequest[0].id;
                console.log(`[INFO] Request already exists: ${existingRequest[0].id} for Session: ${sessionId}`);
            }
        } else {
            console.log('[REQUEST-CHECK] ⚠️ Skipping request creation - conditions not met');
        }

        // Check if user is asking about request/booking status
        const lowerMessage = message.toLowerCase();
        const isAskingStatus = lowerMessage.includes('sudah terkirim') ||
            lowerMessage.includes('sudah dikirim') ||
            lowerMessage.includes('sudah masuk') ||
            lowerMessage.includes('berhasil') ||
            lowerMessage.includes('request saya') ||
            lowerMessage.includes('booking saya') ||
            lowerMessage.includes('pesanan saya') ||
            lowerMessage.includes('data saya') ||
            lowerMessage.includes('sudah tercatat') ||
            lowerMessage.includes('sudah terdaftar') ||
            lowerMessage.includes('apakah sudah');

        if (isAskingStatus && collectedData?.name && collectedData?.phone) {
            // Check if request exists for this session
            const [existingRequest] = await pool.query(
                'SELECT id FROM requests WHERE session_id = ?',
                [sessionId]
            );

            if (existingRequest.length === 0) {
                // No request yet, create one now
                try {
                    const requestId = generateRequestId();

                    let requestType = collectedData.request_type || parsed.collected_data?.request_type || 'Sales Inquiry';
                    const validTypes = ['Service Booking', 'Test Drive', 'Sparepart Info', 'Sales Inquiry'];

                    if (requestType.toLowerCase().includes('service')) requestType = 'Service Booking';
                    else if (requestType.toLowerCase().includes('test')) requestType = 'Test Drive';
                    else if (requestType.toLowerCase().includes('part') || requestType.toLowerCase().includes('suku')) requestType = 'Sparepart Info';
                    else if (requestType.toLowerCase().includes('sales') || requestType.toLowerCase().includes('beli')) requestType = 'Sales Inquiry';
                    if (!validTypes.includes(requestType)) requestType = 'Sales Inquiry';

                    const reqTime = getJakartaDBTimestamp();

                    await pool.query(
                        `INSERT INTO requests (id, type, status, name, phone, email, vehicle, plat, details, session_id, notes, created_at)
                         VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            requestId,
                            requestType,
                            collectedData.name,
                            collectedData.phone,
                            collectedData.email || null,
                            collectedData.vehicle || null,
                            collectedData.plat || null,
                            JSON.stringify(collectedData.details || {}),
                            sessionId,
                            `Request dibuat saat user menanyakan status - Session ${sessionId}`,
                            reqTime
                        ]
                    );

                    await pool.query(
                        'UPDATE chat_sessions SET request_id = ? WHERE id = ?',
                        [requestId, sessionId]
                    );

                    await pool.query(
                        'INSERT INTO request_status_history (request_id, status, label, created_at) VALUES (?, ?, ?, ?)',
                        [requestId, 'pending', 'Request dibuat saat konfirmasi', reqTime]
                    );

                    parsed.requestId = requestId;
                    console.log(`[SUCCESS] Request auto-created on status check: ${requestId} for Session: ${sessionId}`);
                } catch (err) {
                    console.error('Failed to auto-create request:', err.message);
                }
            } else {
                parsed.requestId = existingRequest[0].id;
            }
        }

        res.json({
            message: {
                role: 'assistant',
                content: parsed.message
            },
            collected_data: parsed.collected_data || {},
            is_data_complete: parsed.is_data_complete || false,
            requestId: parsed.requestId
        });

    } catch (error) {
        console.error('Message error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            message: {
                role: 'assistant',
                content: 'Maaf, terjadi gangguan. Silakan coba lagi atau hubungi dealer kami langsung di (021) 8834 7777.'
            }
        });
    }
});

// POST /api/chat/end - End session with summary generation
router.post('/end', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        // Get session info
        const [session] = await pool.query(
            'SELECT started_at, guest_name FROM chat_sessions WHERE id = ?',
            [sessionId]
        );

        if (session.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Calculate duration
        const duration = Math.floor((Date.now() - new Date(session[0].started_at).getTime()) / 1000);

        // Get chat messages for summary generation
        const [messages] = await pool.query(
            'SELECT sender, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 30',
            [sessionId]
        );

        // Generate summary using AI
        let summary = 'Chat session';
        if (messages.length > 1) {
            try {
                const chatHistory = messages.map(m => `${m.sender === 'bot' ? 'Bot' : 'Customer'}: ${m.message}`).join('\n');

                const summaryPrompt = `Berdasarkan percakapan berikut, buat ringkasan singkat dalam 1 kalimat (maksimal 50 kata) dalam bahasa Indonesia. Fokus pada topik utama dan hasil percakapan.

Percakapan:
${chatHistory}

Ringkasan:`;

                const response = await fetch(OPENROUTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://sunbekasi.com',
                        'X-Title': 'SUN Bekasi Chatbot'
                    },
                    body: JSON.stringify({
                        model: OPENROUTER_MODEL,
                        messages: [{ role: 'user', content: summaryPrompt }],
                        temperature: 0.3,
                        max_tokens: 100
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    summary = data.choices[0].message.content.trim();
                    // Clean up summary - remove quotes if present
                    summary = summary.replace(/^["']|["']$/g, '').substring(0, 500);
                }
            } catch (err) {
                console.error('Summary generation error:', err);
                // Use fallback summary based on guest name
                summary = session[0].guest_name
                    ? `Percakapan dengan ${session[0].guest_name}`
                    : 'Chat session';
            }
        }

        // Update session with summary and duration
        const now = getJakartaDBTimestamp();
        await pool.query(
            'UPDATE chat_sessions SET ended_at = ?, duration_seconds = ?, summary = ? WHERE id = ?',
            [now, duration, summary, sessionId]
        );

        res.json({ success: true, summary, duration });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

export default router;
