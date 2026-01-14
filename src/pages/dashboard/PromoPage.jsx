import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Tag, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PromoPage = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        image_url: '',
        is_active: true
    });

    // Fetch promos on mount
    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/promos`);
            const data = await response.json();
            setPromos(data);
        } catch (error) {
            console.error('Error fetching promos:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ code: '', title: '', description: '', image_url: '', is_active: true });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (promo) => {
        setFormData({
            code: promo.code,
            title: promo.title,
            description: promo.description,
            image_url: promo.image_url || '',
            is_active: promo.is_active
        });
        setIsEditing(true);
        setCurrentId(promo.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo?')) {
            try {
                await fetch(`${API_URL}/promos/${id}`, { method: 'DELETE' });
                setPromos(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting promo:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEditing) {
                const response = await fetch(`${API_URL}/promos/${currentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const updated = await response.json();
                setPromos(prev => prev.map(p => p.id === currentId ? { ...p, ...updated } : p));
            } else {
                const response = await fetch(`${API_URL}/promos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const newPromo = await response.json();
                setPromos(prev => [newPromo, ...prev]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving promo:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

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
                            {promo.image_url ? (
                                <img src={promo.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={promo.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${promo.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                    {promo.is_active ? 'Active' : 'Inactive'}
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
                            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">{promo.description}</p>

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
                                                    value={formData.image_url}
                                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Promo details..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
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
                                            disabled={saving}
                                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                            {saving ? 'Saving...' : 'Save Promo'}
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
