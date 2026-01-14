import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const HistoryPage = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/chat/sessions`);
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            } else {
                throw new Error('Failed to fetch sessions');
            }
        } catch (err) {
            console.error('Fetch sessions error:', err);
            setError('Gagal memuat data. Pastikan API server berjalan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRowClick = (sess) => {
        navigate(`/dashboard/history/${sess.id}`, { state: { data: sess } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Chat History</h1>
                    <p className="text-gray-500 text-sm font-medium">Review past conversations per session.</p>
                </div>
                <button
                    onClick={fetchSessions}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-600 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm font-medium">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada chat history</h3>
                    <p className="text-gray-500 text-sm">Chat sessions akan muncul di sini setelah customer mulai chat.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((sess, i) => (
                        <div
                            key={i}
                            onClick={() => handleRowClick(sess)}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{sess.user}</h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-mono">{sess.id}</span>
                                        {sess.requestId && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-600 font-bold">Request Collected</span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">{sess.summary}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block">
                                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        <Clock size={12} /> Duration
                                    </span>
                                    <span className="font-mono text-sm font-bold text-gray-700">{sess.duration}</span>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                        Time
                                    </span>
                                    <span className="font-mono text-sm font-bold text-gray-700">{sess.time}</span>
                                </div>
                                <button className="p-3 rounded-xl hover:bg-red-50 text-gray-300 group-hover:text-red-600 transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
