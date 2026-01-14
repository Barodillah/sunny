import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Brain, Edit2, Trash2, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const KnowledgePage = () => {
    const navigate = useNavigate();
    const [knowledge, setKnowledge] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const fetchKnowledge = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/knowledge`);
            const data = await response.json();
            setKnowledge(data);
        } catch (error) {
            console.error('Error fetching knowledge:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        navigate(`/dashboard/knowledge/edit/${item.id}`, {
            state: {
                data: {
                    id: item.id,
                    title: item.title,
                    knowledge: item.content,
                    keyword: item.keywords,
                    category: item.category
                }
            }
        });
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this knowledge?')) {
            try {
                await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
                setKnowledge(prev => prev.filter(k => k.id !== id));
            } catch (error) {
                console.error('Error deleting knowledge:', error);
            }
        }
    };

    const filteredKnowledge = knowledge.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.keywords && item.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                    <h1 className="text-2xl font-black text-gray-900">Knowledge Base</h1>
                    <p className="text-gray-500 text-sm font-medium">Teach Sunny AI new information.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/knowledge/add')}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                >
                    <Plus size={18} /> Add Entry
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all shadow-sm"
                            placeholder="Search knowledge..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-8 space-y-4">
                    {filteredKnowledge.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Brain size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No knowledge entries found</p>
                        </div>
                    ) : (
                        filteredKnowledge.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleEdit(item)}
                                className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-50 hover:border-red-100 transition-all cursor-pointer group bg-white relative overflow-hidden"
                            >
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                        <Brain size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{item.title}</h4>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">{item.content}</p>
                                        {item.keywords && (
                                            <div className="mt-3 flex gap-2 flex-wrap">
                                                {item.keywords.split(',').map((tag, idx) => (
                                                    <span key={idx} className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-wider">
                                                        #{tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                            className="p-2 rounded-lg group-hover:bg-gray-50 transition-colors"
                                        >
                                            <Edit2 className="text-gray-300 group-hover:text-gray-900 transition-colors" size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="text-gray-300 hover:text-red-600 transition-colors" size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgePage;
