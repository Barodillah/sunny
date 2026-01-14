import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, MessageSquare, MoreVertical, Download, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CHAT_LOG = [
    { id: 1, sender: 'user', text: 'Halo, saya mau tanya harga Xpander terbaru.', time: '10:30 AM' },
    { id: 2, sender: 'bot', text: 'Halo Kak! Tentu, untuk Mitsubishi Xpander harga OTR Jakarta saat ini mulai dari Rp 267.700.000 untuk tipe GLS MT hingga Rp 322.900.000 untuk tipe Ultimate CVT. Ada tipe tertentu yang Kakak minati?', time: '10:30 AM' },
    { id: 3, sender: 'user', text: 'Kalau yang Ultimate CVT cicilannya berapa ya?', time: '10:31 AM' },
    { id: 4, sender: 'bot', text: 'Untuk Xpander Ultimate CVT, kami ada program DP Ringan mulai 10% atau Bunga 0%. Kakak rencana ambil tenor berapa tahun? Kami sediakan simulasi 1-5 tahun.', time: '10:31 AM' },
    { id: 5, sender: 'user', text: 'Rencana 3 tahun, DP sekitar 100jt.', time: '10:32 AM' },
    { id: 6, sender: 'bot', text: 'Baik Kak. Dengan DP 100jt dan tenor 3 tahun, estimasi angsuran sekitar Rp 7.5jt/bulan. Apakah ini masuk dalam budget Kakak? Kami juga bisa bantu jadwalkan Test Drive jika berminat.', time: '10:32 AM' },
    { id: 7, sender: 'user', text: 'Boleh tuh test drive dulu.', time: '10:33 AM' },
    { id: 8, sender: 'bot', text: 'Siap Kak! Boleh dibantu nama lengkap dan no WA untuk konfirmasi jadwalnya?', time: '10:33 AM' },
];

const HistoryDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    // Fallback data
    const sessionData = location.state?.data || {
        id: id,
        user: "Guest_22",
        date: "Jan 14, 2024",
        time: "10:30 AM",
        duration: "5m 20s",
        summary: "Asking about Pajero specs",
        requestId: "REQ-001" // Mock collected request ID
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col -m-8 md:-m-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 md:p-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/history')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            Chat Session <span className="text-gray-400 font-mono text-sm">#{sessionData.id}</span>
                        </h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Clock size={12} /> {sessionData.duration} • <Calendar size={12} /> {sessionData.date}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {sessionData.requestId && (
                        <button
                            onClick={() => navigate(`/dashboard/request/${sessionData.requestId}`)}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors border border-red-100 mr-2"
                        >
                            <FileText size={16} />
                            View Collected Request
                            <ArrowUpRight size={16} />
                        </button>
                    )}
                    <button className="hidden sm:flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
                        <Download size={16} /> Export Transcript
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical size={24} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Session Start Marker */}
                    <div className="flex justify-center mt-6">
                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            Session Started • {sessionData.time}
                        </span>
                    </div>

                    {MOCK_CHAT_LOG.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${msg.sender === 'user' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-red-600 text-red-600'
                                }`}>
                                {msg.sender === 'user' ? <User size={18} /> : <MessageSquare size={18} />}
                            </div>

                            <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-sm ${msg.sender === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                    {msg.time}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {/* Session End Marker */}
                    <div className="flex justify-center pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                Session Ended • {MOCK_CHAT_LOG[MOCK_CHAT_LOG.length - 1].time}
                            </span>
                            {sessionData.requestId && (
                                <span className="text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <FileText size={12} /> Request Collected: {sessionData.requestId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailPage;
