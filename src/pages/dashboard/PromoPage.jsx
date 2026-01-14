import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Tag } from 'lucide-react';

const INITIAL_PROMOS = [
    { id: 1, code: "MERDEKA2024", title: "Promo Merdeka Xpander", desc: "Bunga 0% hingga 2 tahun & Gratis Asuransi.", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", active: true },
    { id: 2, code: "PAJEROVIP", title: "Pajero Sport Special", desc: "DP Ringan mulai 15% & Voucher Aksesoris 10jt.", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", active: true },
    { id: 3, code: "SERVICE20", title: "Service Hemat Berkala", desc: "Diskon Jasa 20% khusus booking via Sunny AI.", img: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=800", active: false },
];

const PromoPage = () => {
    const [promos, setPromos] = useState(INITIAL_PROMOS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        title: '',
        desc: '',
        img: '',
        active: true
    });

    const resetForm = () => {
        setFormData({ code: '', title: '', desc: '', img: '', active: true });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (promo) => {
        setFormData(promo);
        setIsEditing(true);
        setCurrentId(promo.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this promo?')) {
            setPromos(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            setPromos(prev => prev.map(p => p.id === currentId ? { ...formData, id: currentId } : p));
        } else {
            setPromos(prev => [...prev, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Promo Management</h1>
                    <p className="text-gray-500 text-sm font-medium">Create and manage active campaigns.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg shadow-red-200"
                >
                    <Plus size={18} /> Add New Promo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.map((promo) => (
                    <motion.div
                        key={promo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden group flex flex-col h-full"
                    >
                        <div className="h-48 relative overflow-hidden bg-gray-100">
                            {promo.img ? (
                                <img src={promo.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={promo.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${promo.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                    {promo.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono font-bold border border-white/20">
                                    {promo.code}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-black text-gray-900 mb-2">{promo.title}</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">{promo.desc}</p>

                            <div className="mt-auto flex gap-2">
                                <button
                                    onClick={() => handleOpenEdit(promo)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-[51] pointer-events-none p-4"
                        >
                            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl pointer-events-auto overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h2 className="text-xl font-black text-gray-900">
                                        {isEditing ? 'Edit Promo' : 'Add New Promo'}
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Promo Code</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                    placeholder="e.g., MERDEKA2024"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Promo Title"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Thumbnail URL</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="url"
                                                    required
                                                    value={formData.img}
                                                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                                            <textarea
                                                required
                                                rows="3"
                                                value={formData.desc}
                                                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                                placeholder="Promo details..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setFormData({ ...formData, active: !formData.active })}>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">Active Status</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                        >
                                            <Save size={18} /> Save Promo
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromoPage;
