import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Brain, ChevronRight, Edit2 } from 'lucide-react';

const QA_DATA = [
    { id: 1, q: "Apa saja syarat kredit Xpander?", a: "Syarat kredit meliputi KTP, KK, NPWP, Slip Gaji 3 bulan terakhir, dan Rekening Koran.", keywords: "syarat, kredit, xpander" },
    { id: 2, q: "Dimana lokasi bengkel resmi?", a: "Kami berlokasi di Jl. Raya Bekasi KM 21, Medan Satria, Kota Bekasi.", keywords: "lokasi, bengkel" },
    { id: 3, q: "Apakah ada promo trade-in?", a: "Ya, kami memiliki program trade-in dengan penawaran harga spesial untuk mobil lama Anda.", keywords: "promo, trade-in" },
];

const KnowledgePage = () => {
    const navigate = useNavigate();

    const handleEdit = (item) => {
        navigate(`/dashboard/knowledge/edit/${item.id}`, { state: { data: { title: item.q, knowledge: item.a, keyword: item.keywords } } });
    };

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
                        />
                    </div>
                </div>
                <div className="p-8 space-y-4">
                    {QA_DATA.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleEdit(item)}
                            className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-50 hover:border-red-100 transition-all cursor-pointer group bg-white relative overflow-hidden"
                        >
                            <div className="flex gap-4 items-start relative z-10">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition-colors">
                                    <Brain size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{item.q}</h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">{item.a}</p>
                                    <div className="mt-3 flex gap-2">
                                        {item.keywords.split(',').map((tag, idx) => (
                                            <span key={idx} className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-wider">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="self-center p-2 rounded-full group-hover:bg-gray-50 transition-colors">
                                    <Edit2 className="text-gray-300 group-hover:text-gray-900 transition-colors" size={18} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KnowledgePage;
