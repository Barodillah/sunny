import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    Users,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Calendar,
    Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

        <div className="relative z-10 flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-100 text-${color}-600`}>
                <Icon size={24} />
            </div>
            <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${trend > 0 ? 'text-green-500' : 'text-red-500'} bg-white px-2 py-1 rounded-lg shadow-sm`}>
                <ArrowUpRight size={14} /> {trend}%
            </span>
        </div>

        <div className="relative z-10">
            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
            <span className="text-3xl font-black text-gray-900">{value}</span>
        </div>
    </motion.div>
);

// Bar Chart Component
const BarChart = ({ data, dataKey, color, label }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]), 1);
    const chartHeight = 140; // Fixed pixel height

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-2" style={{ height: chartHeight }}>
                {data.map((item, i) => {
                    const value = item[dataKey] || 0;
                    const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 8;
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: Math.max(barHeight, 8) }}
                                transition={{ duration: 0.8, delay: i * 0.08 }}
                                className={`w-full ${color} rounded-t-lg relative group cursor-pointer`}
                            >
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                    {value} {label}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between gap-2 mt-3">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 text-center">
                        <span className="text-[11px] font-bold text-gray-500">{item.dayName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const [recentSessions, setRecentSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalRequests: 0,
        conversionRate: 0,
        avgResponseTime: 0
    });
    const [dailyData, setDailyData] = useState([]);

    // Calculate date range for display
    const getDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sessions
                const sessionsRes = await fetch(`${API_URL}/chat/sessions`);
                if (sessionsRes.ok) {
                    const data = await sessionsRes.json();
                    setRecentSessions(data.slice(0, 5));
                }

                // Fetch stats
                const statsRes = await fetch(`${API_URL}/chat/stats`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch daily stats
                const dailyRes = await fetch(`${API_URL}/chat/daily-stats`);
                if (dailyRes.ok) {
                    const dailyData = await dailyRes.json();
                    setDailyData(dailyData);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        <Calendar size={16} /> {new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </button>
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-gray-200">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sessions" value={stats.totalSessions.toLocaleString()} trend={12} icon={MessageCircle} color="blue" />
                <StatCard title="Total Request" value={stats.totalRequests.toLocaleString()} trend={8} icon={Users} color="yellow" />
                <StatCard title="Conversion" value={`${stats.conversionRate}%`} trend={stats.conversionRate > 20 ? 5 : -2} icon={TrendingUp} color="red" />
                <StatCard title="Avg. Response" value={`${stats.avgResponseTime}s`} trend={stats.avgResponseTime < 5 ? 15 : -5} icon={Zap} color="purple" />
            </div>

            {/* Main Content: Charts + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Charts (2 columns) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sessions Chart */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Daily Sessions</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{getDateRange()}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg">
                                <MessageCircle size={16} />
                                <span className="text-sm font-bold">{dailyData.reduce((sum, d) => sum + d.sessions, 0)}</span>
                            </div>
                        </div>
                        {dailyData.length > 0 ? (
                            <BarChart data={dailyData} dataKey="sessions" color="bg-blue-500 hover:bg-blue-600" label="Sessions" />
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Requests Chart */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Daily Requests</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{getDateRange()}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">
                                <TrendingUp size={16} />
                                <span className="text-sm font-bold">{dailyData.reduce((sum, d) => sum + d.requests, 0)}</span>
                            </div>
                        </div>
                        {dailyData.length > 0 ? (
                            <BarChart data={dailyData} dataKey="requests" color="bg-red-500 hover:bg-red-600" label="Requests" />
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-gray-950 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200">
                    <h3 className="text-xl font-black mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                            </div>
                        ) : recentSessions.length > 0 ? (
                            recentSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex gap-4 items-start group cursor-pointer"
                                    onClick={() => navigate(`/dashboard/history/${session.id}`)}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                                        <MessageCircle size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold mb-1 group-hover:text-red-400 transition-colors truncate">
                                            {session.summary || 'Chat Session'}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            <span className="text-gray-300">{session.user}</span>
                                            {session.requestId && (
                                                <span className="ml-2 text-yellow-400">• {session.requestId}</span>
                                            )}
                                        </p>
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2 block">
                                            {formatRelativeTime(session.date + ' ' + session.time)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm font-medium">Belum ada aktivitas</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/history')}
                        className="w-full mt-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;

