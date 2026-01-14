import express from 'express';
import pool from '../db.js';

const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.VITE_OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';

// System prompt for SUNNY AI
const SYSTEM_PROMPT = `Kamu adalah SUNNY, asisten AI customer service dealer Mitsubishi SUN Bekasi yang ramah, humanis, dan profesional.

KARAKTER:
- Gunakan bahasa Indonesia yang santai tapi tetap sopan
- Panggil customer dengan "Kak" atau nama mereka jika sudah tahu
- Responsif, helpful, dan antusias membantu

TUGAS UTAMA:
1. Jawab pertanyaan customer seputar Mitsubishi SUN Bekasi
2. Kumpulkan data customer untuk kebutuhan mereka (Service, Test Drive, Beli Mobil, Sparepart)
3. Data WAJIB untuk SEMUA request: Nama dan Nomor HP

DATA SPESIFIK PER REQUEST (WAJIB ADA sebelum complete):
1. Service Booking:
   - Kendaraan (Model/Tipe)
   - Plat Nomor
   - Tanggal/Jam Service

2. Test Drive / Sales Inquiry (Beli Mobil):
   - Unit yang diminati (Model/Tipe)

3. Sparepart Info:
   - Kendaraan (Model)
   - Nama Barang/Part

PANDUAN PENTING:
- Jika customer menyatakan minat/kebutuhan, LANGSUNG tanyakan data yang kurang secara bertahap.
- JANGAN tanya Email (opsional).
- Jika customer sudah memberi data, simpan di "collected_data".
- JANGAN minta ulang data yang sudah diberikan di pesan sebelumnya.

Format response dalam JSON:
{
  "message": "pesan untuk customer",
  "collected_data": {
    "name": "nama customer",
    "phone": "nomor hp/wa",
    "request_type": "Service Booking|Test Drive|Sales Inquiry|Sparepart Info|null",
    "vehicle": "kendaraan/model",
    "plat": "plat nomor (wajib untuk service)",
    "details": {
       "service_date": "tgl service (wajib untuk booking)",
       "part_name": "nama part (wajib untuk sparepart)",
       "unit_interest": "unit minat (wajib untuk sales/test drive)"
    }
  },
  "is_data_complete": boolean
}

ATURAN KRUSIAL "is_data_complete = true":
Set TRUE JIKA:
1. (Wajib) "name" dan "phone" SUDAH didapatkan.
   DAN
2. Salah satu di bawah ini terjadi:
   - User sudah menyebutkan kebutuhan utamanya (misal: "mau service", "mau test drive", "mau beli") meskipun detail belum 100% lengkap.
   - User mengirim kata konfirmasi: "ok", "siap", "cukup", "lanjut", "sesuai", "iya".
   - User sudah memberikan detail kendaraan/unit.

   - User sudah memberikan detail kendaraan/unit.

JANGAN MENUNGGU SEMPURNA.
Jika Nama + HP + Intent (Niat) sudah ada -> SET TRUE.
Kita akan follow-up manual sisanya.

PERINGATAN STRICT:
- KAMU ADALAH MESIN JSON.
- OUTPUT WAJIB FORMAT JSON.
- "message" berisi chat untuk customer.
- "collected_data" berisi data yang ditangkap.
- JANGAN berhalusinasi data tersimpan jika kamu tidak menyertakan data tersebut di "collected_data".`;

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
        temperature: 0.7,
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

// Parse AI response (handle both JSON and plain text)
// Parse AI response (handle both JSON and plain text)
function parseAIResponse(content) {
    try {
        let cleanContent = content;

        // 1. Remove markdown code blocks if present
        if (content.includes('```')) {
            cleanContent = content.replace(/```json\n?|```/g, '').trim();
        }

        // 2. Try to find the first valid JSON object start and end
        const firstBrace = cleanContent.indexOf('{');
        const lastBrace = cleanContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = cleanContent.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonStr);
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback to plain text if parsing fails
    }

    return {
        message: content, // Return full content if not valid JSON
        collected_data: {},
        is_data_complete: false
    };
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

        const parsed = parseAIResponse(aiResponse);
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

        // If data is complete, create request
        if (parsed.is_data_complete && parsed.collected_data?.name && parsed.collected_data?.phone) {
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

                await pool.query(
                    `INSERT INTO requests (id, type, status, name, phone, email, vehicle, plat, details, session_id, notes, created_at)
                     VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        requestId,
                        requestType,
                        parsed.collected_data.name,
                        parsed.collected_data.phone,
                        parsed.collected_data.email || null, // Added email
                        parsed.collected_data.vehicle || null,
                        parsed.collected_data.plat || null,
                        JSON.stringify(parsed.collected_data.details || {}),
                        sessionId,
                        `Request dari chat session ${sessionId}`,
                        reqTime
                    ]
                );

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
                console.log(`[SUCCESS] Request created: ${requestId} for Session: ${sessionId}`);
            } catch (err) {
                console.error('Failed to create request. Error:', err.message);
                console.error('SQL State:', err.sqlState);
                console.error('SQL Message:', err.sqlMessage);
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
