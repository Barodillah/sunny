import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
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
    MessageCircle
} from 'lucide-react';

const MITSUBISHI_RED = "#E60012";

const NAV_TYPES = [
    { id: 'all', label: 'Semua', icon: Sparkles },
    { id: 'promo', label: 'Promo', icon: Tag },
    { id: 'service', label: 'Service', icon: Wrench },
    { id: 'harga', label: 'Harga', icon: DollarSign },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'lokasi', label: 'Lokasi', icon: MapPin },
    { id: 'testdrive', label: 'Test Drive', icon: Car },
];

const QUICK_RESPONSES = {
    promo: "Saat ini ada Promo Merdeka! DP ringan untuk Xpander mulai 10jt dan Pajero Sport dengan bunga 0%. Mau saya kirimkan brosur lengkapnya?",
    service: "Booking service di SUN Bekasi sangat mudah. Kami ada slot kosong besok jam 09.00 atau 13.00. Anda ingin saya pesankan sekarang?",
    harga: "Daftar harga terbaru OTR Bekasi: Xpander mulai Rp 260jt-an, Pajero Sport mulai Rp 560jt-an. Ada unit spesifik yang Anda minati?",
    lokasi: "Kami berlokasi di Jl. Raya Bekasi KM 21, Medan Satria. Dekat dengan Harapan Indah. Mau saya kirimkan link Google Maps?",
    booking: "Silakan pilih jenis booking: 1) Test Drive 2) Service Berkala 3) Konsultasi Sales. Ketik angka pilihannya ya!",
    testdrive: "Test drive tersedia untuk: Xpander, Pajero Sport, Triton, dan L300. Unit mana yang ingin Anda coba? Kami bisa atur jadwal sesuai keinginan Anda.",
    default: "Tentu! Saya bisa membantu terkait hal tersebut. Apakah Anda ingin berbicara dengan konsultan marketing kami untuk detail lebih lanjut?"
};

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Halo! Saya Sunny, asisten AI Mitsubishi SUN Bekasi. Ada yang bisa saya bantu hari ini?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [activeType, setActiveType] = useState('all');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const navScrollRef = useRef(null);

    const processedInit = useRef(false);

    // Handle initial message from route state
    useEffect(() => {
        if (location.state?.initialMessage && !processedInit.current) {
            handleSendMessage(location.state.initialMessage);
            processedInit.current = true;
            // Clear location state to prevent reload issues
            window.history.replaceState({}, '');
        }
        // Focus on input
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInputValue("");
        setIsTyping(true);

        // Simulated AI response with delay
        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let response = QUICK_RESPONSES.default;

            // Match response based on keywords
            if (lowerText.includes("promo")) {
                response = QUICK_RESPONSES.promo;
                setActiveType('promo');
            } else if (lowerText.includes("service") || lowerText.includes("servis")) {
                response = QUICK_RESPONSES.service;
                setActiveType('service');
            } else if (lowerText.includes("harga") || lowerText.includes("price")) {
                response = QUICK_RESPONSES.harga;
                setActiveType('harga');
            } else if (lowerText.includes("lokasi") || lowerText.includes("alamat") || lowerText.includes("maps")) {
                response = QUICK_RESPONSES.lokasi;
                setActiveType('lokasi');
            } else if (lowerText.includes("booking") || lowerText.includes("pesan")) {
                response = QUICK_RESPONSES.booking;
                setActiveType('booking');
            } else if (lowerText.includes("test drive") || lowerText.includes("coba")) {
                response = QUICK_RESPONSES.testdrive;
                setActiveType('testdrive');
            }

            setIsTyping(false);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 1200);
    };

    const handleNavTypeClick = (typeId) => {
        setActiveType(typeId);
        if (typeId !== 'all') {
            const type = NAV_TYPES.find(t => t.id === typeId);
            handleSendMessage(`Info tentang ${type.label}`);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            {/* Header */}
            <header className="shrink-0 bg-gray-950 text-white px-4 pb-4 safe-area-top">
                <div className="flex items-center gap-4 mt-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/')}
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
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4" />
                        </div>
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
                                {m.content}
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
                        disabled={!inputValue.trim()}
                        className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${inputValue.trim()
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
                            className="px-4 py-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-bold text-gray-600 hover:text-red-600 whitespace-nowrap transition-all"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
