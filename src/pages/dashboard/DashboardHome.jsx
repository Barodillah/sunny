import React from 'react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Users,
    TrendingUp,
    Zap,
    ArrowUpRight,
    MoreHorizontal,
    Calendar
} from 'lucide-react';

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

const ChartPlaceholder = () => (
    <div className="w-full h-64 flex items-end justify-between gap-2 px-4 py-8">
        {[40, 70, 45, 90, 60, 80, 50, 75, 60, 95, 80, 65].map((h, i) => (
            <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="w-full bg-gray-100 rounded-t-xl relative group hover:bg-red-600 transition-colors"
            >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {h} Sales
                </div>
            </motion.div>
        ))}
    </div>
);

const DashboardHome = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        <Calendar size={16} /> Jan 2024
                    </button>
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-gray-200">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Request" value="1,245" trend={12} icon={MessageCircle} color="blue" />
                <StatCard title="Active Users" value="856" trend={8} icon={Users} color="yellow" />
                <StatCard title="Conversion" value="24%" trend={-2} icon={TrendingUp} color="red" />
                <StatCard title="Avg. Response" value="1.2s" trend={15} icon={Zap} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Weekly Traffic</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Jan 01 - Jan 07</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <ChartPlaceholder />
                </div>

                {/* Recent Activities */}
                <div className="bg-gray-950 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200">
                    <h3 className="text-xl font-black mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4 items-start group cursor-pointer">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold mb-1 group-hover:text-red-400 transition-colors">New Service Booking</p>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">User <span className="text-gray-300">@john_doe</span> requested a service schedule for Xpander.</p>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2 block">2 mins ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-widest transition-colors">
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
