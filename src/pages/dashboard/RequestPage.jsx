import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, Edit2, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

const REQUEST_DATA = [
    { id: "REQ-001", type: "Service Booking", user: "Budi Santoso", date: "Jan 12, 10:30 AM", status: "completed", sessionId: "SESS-892" },
    { id: "REQ-002", type: "Test Drive", user: "Sarah Wijaya", date: "Jan 12, 11:45 AM", status: "pending" },
    { id: "REQ-003", type: "Sparepart Info", user: "Ahmad Dani", date: "Jan 11, 04:20 PM", status: "cancelled" },
];

const StatusBadge = ({ status }) => {
    const colors = {
        completed: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-red-100 text-red-700"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[status]}`}>
            {status}
        </span>
    );
};

const RequestPage = () => {
    const navigate = useNavigate();

    const handleRowClick = (req) => {
        navigate(`/dashboard/request/${req.id}`, { state: { data: req } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Incoming Requests</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage all user requests from Sunny AI.</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                    <Filter size={16} /> Filter
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100" placeholder="Search requests..." />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {REQUEST_DATA.map((req, i) => (
                                <tr
                                    key={i}
                                    onClick={() => handleRowClick(req)}
                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500 group-hover:text-red-600 transition-colors">{req.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{req.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{req.user}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">{req.date}</td>
                                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-gray-50 hover:bg-yellow-400 hover:text-black rounded-lg text-gray-400 transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 bg-gray-50 hover:bg-red-600 hover:text-white rounded-lg text-gray-400 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RequestPage;
