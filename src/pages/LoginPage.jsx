import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MITSUBISHI_RED = "#E60012";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-950 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    <div>
                        <div className="flex flex-col leading-none mb-4">
                            <span className="text-4xl font-black tracking-tighter text-red-600">MITSUBISHI</span>
                            <span className="text-sm font-bold text-gray-400 tracking-[0.4em]">SUN BEKASI</span>
                        </div>
                    </div>

                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl font-black text-white leading-tight mb-6">
                                Welcome to<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                                    SUN-Connect
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg font-medium max-w-md leading-relaxed">
                                Dashboard admin untuk mengelola customer engagement, request, dan knowledge base Mitsubishi SUN Bekasi.
                            </p>
                        </motion.div>
                    </div>

                    <div className="text-gray-500 text-sm font-medium">
                        © {new Date().getFullYear()} Mitsubishi SUN Bekasi. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="flex flex-col leading-none items-center mb-2">
                            <span className="text-3xl font-black tracking-tighter" style={{ color: MITSUBISHI_RED }}>MITSUBISHI</span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-[0.4em]">SUN BEKASI</span>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-red-200">
                                <LogIn size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Masuk ke Dashboard</h2>
                            <p className="text-gray-500 font-medium text-sm">Masukkan kredensial Anda untuk melanjutkan</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
                            >
                                <AlertCircle className="text-red-600 shrink-0" size={20} />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@sunbekasi.com"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk</span>
                                        <LogIn size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <a
                            href="/"
                            className="text-gray-500 hover:text-red-600 font-bold text-sm transition-colors"
                        >
                            ← Kembali ke Beranda
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
