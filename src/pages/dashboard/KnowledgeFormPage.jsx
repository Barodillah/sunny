import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Type, Hash, FileText, HelpCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const KnowledgeFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        keyword: '',
        knowledge: '',
        category: ''
    });

    // Load data from state or fetch from API
    useEffect(() => {
        if (location.state?.data) {
            setFormData(location.state.data);
        } else if (isEditing) {
            fetchKnowledge();
        }
    }, [id]);

    const fetchKnowledge = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/knowledge/${id}`);
            const data = await response.json();
            setFormData({
                id: data.id,
                title: data.title,
                keyword: data.keywords || '',
                knowledge: data.content,
                category: data.category || ''
            });
        } catch (error) {
            console.error('Error fetching knowledge:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: formData.title,
                content: formData.knowledge,
                keywords: formData.keyword,
                category: formData.category,
                is_active: true
            };

            if (isEditing) {
                await fetch(`${API_URL}/knowledge/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_URL}/knowledge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            navigate('/dashboard/knowledge');
        } catch (error) {
            console.error('Error saving knowledge:', error);
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/knowledge')}
                    className="p-3 hover:bg-white rounded-xl transition-colors text-gray-500 hover:shadow-sm"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        {isEditing ? 'Edit Knowledge' : 'Add New Knowledge'}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                        {isEditing ? 'Update existing information.' : 'Teach Sunny AI something new.'}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Type size={14} /> Title / Question
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. What are the credit requirements?"
                            className="w-full text-lg font-bold text-gray-900 placeholder:text-gray-300 border-b-2 border-gray-100 py-3 focus:outline-none focus:border-red-600 transition-colors"
                        />
                        <p className="text-xs text-gray-400 font-medium">The main question or topic this knowledge addresses.</p>
                    </div>

                    {/* Category Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                        >
                            <option value="">Select category...</option>
                            <option value="Sales">Sales</option>
                            <option value="Service">Service</option>
                            <option value="Sparepart">Sparepart</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    {/* Keywords Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} /> Keywords
                        </label>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                            <input
                                type="text"
                                value={formData.keyword}
                                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                placeholder="e.g. credit, requirements, dp, cicilan (comma separated)"
                                className="w-full bg-transparent font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Keywords help the AI match this knowledge to user queries.</p>
                    </div>

                    {/* Knowledge Editor */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Knowledge Content
                        </label>
                        <div className="relative">
                            <textarea
                                required
                                rows="12"
                                value={formData.knowledge}
                                onChange={(e) => setFormData({ ...formData, knowledge: e.target.value })}
                                placeholder="Write the detailed answer or information here..."
                                className="w-full bg-gray-50 rounded-2xl p-6 font-medium text-gray-700 leading-relaxed border border-gray-100 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all resize-none"
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button type="button" className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors" title="Help">
                                    <HelpCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/knowledge')}
                            className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Knowledge'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default KnowledgeFormPage;
