import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, MessageSquare, MoreVertical, Download, FileText, ArrowUpRight, RefreshCw, Copy, Trash, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeOnly, formatJakartaTime } from '../../utils/timezone';

const API_BASE = import.meta.env.VITE_API_URL;

const HistoryDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [sessionData, setSessionData] = useState(location.state?.data || null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Helper to format message text (bold and newlines)
    const formatMessage = (text) => {
        if (!text) return '';
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
                {i < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    useEffect(() => {
        const fetchSessionDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/chat/session/${id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Format session data
                    const session = data.session;
                    const startDate = new Date(session.started_at);
                    const duration = session.duration_seconds || 0;
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;

                    setSessionData({
                        id: session.id,
                        user: session.guest_name || `Guest_${session.id.replace('SESS-', '')}`,
                        summary: session.summary || 'Chat session',
                        duration: duration > 0 ? `${minutes}m ${seconds}s` : 'Active',
                        time: formatTimeOnly(session.started_at),
                        date: formatJakartaTime(session.started_at, { showTime: false }),
                        requestId: session.request_id
                    });

                    // Format messages
                    const formattedMessages = data.messages.map((msg, index) => ({
                        id: index + 1,
                        sender: msg.role === 'assistant' ? 'bot' : 'user',
                        text: msg.content,
                        time: msg.formattedTime || formatTimeOnly(msg.timestamp)
                    }));

                    setMessages(formattedMessages);
                } else {
                    throw new Error('Failed to fetch session');
                }
            } catch (err) {
                console.error('Fetch session error:', err);
                setError('Gagal memuat data session.');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetail();
    }, [id]);

    const handleExport = () => {
        if (!messages.length) return;

        const transcript = messages.map(msg => {
            const senderName = msg.sender === 'user' ? (sessionData?.user || 'User') : 'SUNNY AI';
            return `[${msg.time}] ${senderName}: ${msg.text}`;
        }).join('\n\n');

        const blob = new Blob([transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-transcript-${id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!messages.length) return;

        const transcript = messages.map(msg => {
            const senderName = msg.sender === 'user' ? (sessionData?.user || 'User') : 'SUNNY AI';
            return `[${msg.time}] ${senderName}: ${msg.text}`;
        }).join('\n\n');

        navigator.clipboard.writeText(transcript).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            setShowDropdown(false);
        });
    };

    const handleDelete = async () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus history chat ini? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                const response = await fetch(`${API_BASE}/chat/session/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    navigate('/dashboard/history', { replace: true });
                } else {
                    alert('Gagal menghapus session.');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Terjadi kesalahan saat menghapus session.');
            }
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-2rem)] flex flex-col -m-8 md:-m-12">
                <div className="bg-white border-b border-gray-100 p-4 md:p-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/history')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="animate-pulse flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                    <RefreshCw size={32} className="text-gray-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div className="h-[calc(100vh-2rem)] flex flex-col -m-8 md:-m-12">
                <div className="bg-white border-b border-gray-100 p-4 md:p-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/history')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Session Not Found</h1>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                    <div className="text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">{error || 'Session tidak ditemukan.'}</p>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="flex gap-2 relative">
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
                    <button
                        onClick={handleExport}
                        className="hidden sm:flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Download size={16} /> Export Transcript
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-xl"
                        >
                            <MoreVertical size={24} />
                        </button>

                        <AnimatePresence>
                            {showDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowDropdown(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleCopy}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                                        >
                                            {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            {copySuccess ? 'Copied!' : 'Copy Transcript'}
                                        </button>
                                        <div className="h-px bg-gray-100 my-0" />
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <Trash size={16} />
                                            Delete History
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
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

                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-400 text-sm">Tidak ada pesan dalam session ini.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
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
                                        {formatMessage(msg.text)}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                        {msg.time}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}

                    {/* Session End Marker */}
                    {messages.length > 0 && (
                        <div className="flex justify-center pt-8">
                            <div className="flex flex-col items-center gap-2">
                                <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                                    Session Ended • {messages[messages.length - 1]?.time}
                                </span>
                                {sessionData.requestId && (
                                    <span className="text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <FileText size={12} /> Request Collected: {sessionData.requestId}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailPage;
