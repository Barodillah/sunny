import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';

const HISTORY_DATA = [
    { id: "SESS-892", user: "Guest_22", summary: "Asking about Pajero specs", duration: "5m 20s", time: "10:30 AM", date: "Jan 14, 2024", requestId: "REQ-001" },
    { id: "SESS-891", user: "Guest_21", summary: "Service booking inquiry", duration: "2m 10s", time: "10:15 AM", date: "Jan 14, 2024" },
    { id: "SESS-890", user: "Guest_20", summary: "General greeting", duration: "45s", time: "09:55 AM", date: "Jan 14, 2024" },
    { id: "SESS-889", user: "Guest_19", summary: "Complaint about AC", duration: "8m 12s", time: "09:30 AM", date: "Jan 14, 2024" },
];

const HistoryPage = () => {
    const navigate = useNavigate();

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
            </div>

            <div className="grid gap-4">
                {HISTORY_DATA.map((sess, i) => (
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
        </div>
    );
};

export default HistoryPage;
