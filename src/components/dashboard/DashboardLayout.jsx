import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileInput,
    Tag,
    BookOpen,
    History,
    Menu,
    X,
    Search,
    Bell,
    LogOut,
    User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_ITEMS = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <FileInput size={20} />, label: "Request", path: "/dashboard/request" },
    { icon: <Tag size={20} />, label: "Promo", path: "/dashboard/promo" },
    { icon: <BookOpen size={20} />, label: "Knowledge", path: "/dashboard/knowledge" },
    { icon: <History size={20} />, label: "History", path: "/dashboard/history" },
];

const SidebarItem = ({ item, isActive, onClick }) => (
    <motion.div
        onClick={onClick}
        whileHover={{ x: 4 }}
        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white mb-1'
            }`}
    >
        {isActive && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-red-600 border-r-4 border-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />
        )}
        <span className="relative z-10">{item.icon}</span>
        <span className="relative z-10 font-bold tracking-wide text-sm">{item.label}</span>
    </motion.div>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans overflow-hidden">
            {/* Sidebar Desktop */}
            <motion.aside
                className={`hidden md:flex flex-col bg-gray-950 w-72 h-screen z-40 fixed left-0 top-0 shadow-2xl`}
                initial={{ x: 0 }}
            >
                {/* Logo Area */}
                <div className="p-8 border-b border-gray-800">
                    <div className="flex flex-col leading-none">
                        <span className="text-2xl font-black tracking-tighter text-red-600">MITSUBISHI</span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.4em]">SUN BEKASI</span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-8 overflow-y-auto scrollbar-hide">
                    {SIDEBAR_ITEMS.map((item) => (
                        <SidebarItem
                            key={item.path}
                            item={item}
                            isActive={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </nav>

                {/* User Profile */}
                <div className="p-6 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-950 font-black">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-bold truncate">{user?.name || 'User'}</h4>
                            <p className="text-gray-500 text-xs capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-72`}>
                {/* Top Header Mobile/Desktop */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
                            <Menu size={24} />
                        </button>
                        <span className="text-red-600 font-black tracking-tight">MITSUBISHI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm font-medium">
                        Dashboard Overview
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-100 outline-none w-64 transition-all"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/50 z-50"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 w-64 bg-gray-950 z-50 md:hidden flex flex-col"
                    >
                        <div className="p-6 flex justify-between items-center border-b border-gray-800">
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black text-red-600">MITSUBISHI</span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 py-6">
                            {SIDEBAR_ITEMS.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    item={item}
                                    isActive={location.pathname === item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                />
                            ))}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;
