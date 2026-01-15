import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft,
    Send,
    Car,
    Wrench,
    MapPin,
    Calendar,
    Tag,
    DollarSign,
    Sparkles,
    MessageCircle,
    CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const NAV_TYPES = [
    { id: 'all', label: 'Semua', icon: Sparkles },
    { id: 'promo', label: 'Promo', icon: Tag },
    { id: 'service', label: 'Service', icon: Wrench },
    { id: 'harga', label: 'Harga', icon: DollarSign },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'lokasi', label: 'Lokasi', icon: MapPin },
    { id: 'testdrive', label: 'Test Drive', icon: Car },
];

// Format message with bold (**text**) and line breaks
function formatMessage(text) {
    if (!text) return null;

    // Split by line breaks first
    const lines = text.split(/\n/);

    return lines.map((line, lineIndex) => {
        // Split by bold markers
        const parts = line.split(/(\*\*[^*]+\*\*)/);

        const formattedParts = parts.map((part, partIndex) => {
            // Check if this part is bold (wrapped in **)
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                return <strong key={`${lineIndex}-${partIndex}`}>{boldText}</strong>;
            }
            return part;
        });

        // Return line with break if not the last line
        return (
            <React.Fragment key={lineIndex}>
                {formattedParts}
                {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
        );
    });
}

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [activeType, setActiveType] = useState('all');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [collectedData, setCollectedData] = useState({});
    const [isInitializing, setIsInitializing] = useState(true);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const navScrollRef = useRef(null);
    const processedInit = useRef(false);

    // Initialize session on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                // Check for existing session in localStorage
                const existingSessionId = localStorage.getItem('chatSessionId');

                if (existingSessionId) {
                    // Try to restore existing session
                    const response = await fetch(`${API_BASE}/chat/session/${existingSessionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSessionId(existingSessionId);
                        setMessages(data.messages);
                        setIsInitializing(false);
                        return;
                    }
                }

                // Create new session
                const response = await fetch(`${API_BASE}/chat/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSessionId(data.sessionId);
                    setMessages([data.message]);
                    localStorage.setItem('chatSessionId', data.sessionId);
                }
            } catch (error) {
                console.error('Failed to initialize session:', error);
                // Fallback to offline mode
                setMessages([{
                    role: 'assistant',
                    content: "Halo! Saya SUNNY, asisten AI Mitsubishi SUN Bekasi. Ada yang bisa saya bantu hari ini? 😊"
                }]);
            } finally {
                setIsInitializing(false);
            }
        };

        initSession();
    }, []);

    // Handle initial message from route state
    useEffect(() => {
        if (!isInitializing && location.state?.initialMessage && !processedInit.current && sessionId) {
            handleSendMessage(location.state.initialMessage);
            processedInit.current = true;
            window.history.replaceState({}, '');
        }

        if (!isInitializing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInitializing, sessionId, location.state]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (text) => {
        if (!text.trim() || !sessionId) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    message: text,
                    collectedData
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, data.message]);

                // Update collected data
                if (data.collected_data) {
                    // Show toast when name is first captured
                    if (data.collected_data.name && !collectedData.name) {
                        toast.success(
                            <div className="flex items-center gap-2">
                                <span>👋 Halo <strong>{data.collected_data.name}</strong>!</span>
                            </div>,
                            { duration: 3000, style: { background: '#1f2937', color: '#fff' } }
                        );
                    }
                    setCollectedData(prev => ({ ...prev, ...data.collected_data }));
                }

                // Show toast if request was created
                if (data.requestId) {
                    toast.success(
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 font-bold">
                                <CheckCircle size={18} />
                                <span>Request Berhasil Dikirim!</span>
                            </div>
                            <div className="text-xs opacity-80">
                                ID: <strong>{data.requestId}</strong> • Tim kami akan segera menghubungi Anda
                            </div>
                        </div>,
                        {
                            duration: 6000,
                            style: {
                                background: '#16a34a',
                                color: '#fff',
                                padding: '16px'
                            }
                        }
                    );
                }

                // Auto-detect type from message
                const lowerText = text.toLowerCase();
                if (lowerText.includes("promo")) {
                    setActiveType('promo');
                } else if (lowerText.includes("service") || lowerText.includes("servis")) {
                    setActiveType('service');
                } else if (lowerText.includes("harga") || lowerText.includes("price")) {
                    setActiveType('harga');
                } else if (lowerText.includes("lokasi") || lowerText.includes("alamat")) {
                    setActiveType('lokasi');
                } else if (lowerText.includes("booking") || lowerText.includes("pesan")) {
                    setActiveType('booking');
                } else if (lowerText.includes("test drive") || lowerText.includes("coba")) {
                    setActiveType('testdrive');
                }
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Message error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Maaf, terjadi gangguan koneksi. Silakan coba lagi atau hubungi dealer kami langsung di (021) 8834 7777."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleBack = async () => {
        // End current session before navigating back
        if (sessionId) {
            const loadingToast = toast.loading('Menyimpan percakapan...', {
                style: { background: '#1f2937', color: '#fff' }
            });
            try {
                await fetch(`${API_BASE}/chat/end`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });
                localStorage.removeItem('chatSessionId');
                toast.success('Percakapan tersimpan!', { id: loadingToast, duration: 1500 });
            } catch (e) {
                console.error('Failed to end session:', e);
                toast.error('Gagal menyimpan percakapan', { id: loadingToast });
            }
        }
        navigate('/');
    };

    const handleNavTypeClick = (typeId) => {
        setActiveType(typeId);
        if (typeId !== 'all') {
            const type = NAV_TYPES.find(t => t.id === typeId);
            handleSendMessage(`Info tentang ${type.label}`);
        }
    };

    const handleNewChat = async () => {
        // End current session
        if (sessionId) {
            const loadingToast = toast.loading('Menyimpan percakapan...', {
                style: { background: '#1f2937', color: '#fff' }
            });
            try {
                await fetch(`${API_BASE}/chat/end`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                });
                toast.success('Percakapan tersimpan!', { id: loadingToast, duration: 1500 });
            } catch (e) {
                console.error('Failed to end session:', e);
                toast.error('Gagal menyimpan percakapan', { id: loadingToast });
            }
        }

        // Clear local storage and state
        localStorage.removeItem('chatSessionId');
        setSessionId(null);
        setMessages([]);
        setCollectedData({});
        setActiveType('all');
        processedInit.current = false;

        // Create new session
        const creatingToast = toast.loading('Membuat chat baru...', {
            style: { background: '#1f2937', color: '#fff' }
        });
        try {
            const response = await fetch(`${API_BASE}/chat/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                setSessionId(data.sessionId);
                setMessages([data.message]);
                localStorage.setItem('chatSessionId', data.sessionId);
                toast.success('Chat baru dimulai!', { id: creatingToast, duration: 1500 });
            } else {
                throw new Error('Failed to create session');
            }
        } catch (error) {
            console.error('Failed to create new session:', error);
            toast.error('Gagal membuat chat baru', { id: creatingToast });
        }
    };

    if (isInitializing) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-black font-black text-2xl mx-auto mb-4 animate-pulse">
                        S
                    </div>
                    <p className="text-gray-600 font-medium">Memuat SUNNY AI...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            <Toaster position="top-center" />
            {/* Header */}
            <header className="shrink-0 bg-gray-950 text-white px-4 pb-4 safe-area-top">
                <div className="flex items-center gap-4 mt-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </motion.button>

                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black text-lg">
                                S
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full">
                                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
                            </div>
                        </div>
                        <div>
                            <h1 className="font-black text-sm uppercase tracking-widest leading-none">SUNNY AI</h1>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online sekarang</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNewChat}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Chat Baru
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Nav Type Chips */}
            <div className="shrink-0 bg-white border-b border-gray-100 shadow-sm">
                <div
                    ref={navScrollRef}
                    className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {NAV_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeType === type.id;
                        return (
                            <motion.button
                                key={type.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleNavTypeClick(type.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${isActive
                                    ? 'bg-gray-950 text-white shadow-lg shadow-gray-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {type.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            key={i}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-sm mr-2 shrink-0 mt-1">
                                    S
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl font-medium text-sm shadow-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-red-600 text-white rounded-br-md'
                                : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                                }`}>
                                {formatMessage(m.content)}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-start"
                        >
                            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-black text-sm mr-2 shrink-0">
                                S
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="shrink-0 bg-white border-t border-gray-100 p-4 safe-area-bottom">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                    className="relative"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ketik pesan Anda..."
                        className="w-full bg-gray-100 border-none rounded-2xl py-4 pl-6 pr-16 focus:ring-2 focus:ring-red-500 transition-all font-medium text-sm outline-none"
                    />
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.9 }}
                        disabled={!inputValue.trim() || isTyping}
                        className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${inputValue.trim() && !isTyping
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </form>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {['Promo terbaru', 'Booking service', 'Lokasi dealer'].map((action) => (
                        <button
                            key={action}
                            onClick={() => handleSendMessage(action)}
                            disabled={isTyping}
                            className="px-4 py-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-bold text-gray-600 hover:text-red-600 whitespace-nowrap transition-all disabled:opacity-50"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
