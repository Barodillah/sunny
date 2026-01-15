import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    MessageCircle,
    MessageSquare,
    Phone,
    Mail,
    Calendar,
    Clock,
    MapPin,
    Car,
    AlertCircle,
    XCircle,
    Printer,
    ChevronDown,
    Wrench,
    Tag,
    UserCheck,
    FileCheck,
    CalendarCheck,
    PackageCheck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RequestDetailPage = () => {
    console.log("RequestDetailPage rendered");
    const navigate = useNavigate();
    const { id } = useParams();
    console.log("Request ID:", id);
    const location = useLocation();

    // Initial state from navigation or null
    const [request, setRequest] = useState(location.state?.data || null);
    const [loading, setLoading] = useState(!location.state?.data);
    const [statusHistory, setStatusHistory] = useState([]);

    useEffect(() => {
        fetchRequestDetails();
        // eslint-disable-next-line
    }, [id]);

    const fetchRequestDetails = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/requests/${id}`);
            setRequest(response.data);
            setStatusHistory(response.data.history || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching request:', error);
            toast.error('Failed to load request details');
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        const confirmChange = window.confirm(`Change status to ${newStatus}?`);
        if (!confirmChange) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/requests/${id}/status`, {
                status: newStatus,
                label: getStatusLabel(newStatus)
            });
            toast.success('Status updated successfully');
            fetchRequestDetails(); // Refresh data and history
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending Review';
            case 'processed': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "Service Booking": return <Wrench className="text-red-600" size={24} />;
            case "Test Drive": return <Car className="text-red-600" size={24} />;
            case "Sparepart Info": return <Tag className="text-red-600" size={24} />;
            default: return <AlertCircle className="text-red-600" size={24} />;
        }
    };

    const renderTypeSpecificActions = (type) => {
        switch (type) {
            case "Service Booking":
                return (
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-900 border border-gray-700 text-white py-4 rounded-xl font-bold transition-all hover:bg-black">
                            <CalendarCheck size={20} /> Approve Schedule
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-800 border border-gray-700 text-gray-300 py-4 rounded-xl font-bold transition-all hover:bg-gray-700">
                            <Clock size={20} /> Reschedule
                        </button>
                    </div>
                );
            case "Test Drive":
                return (
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-900 border border-gray-700 text-white py-4 rounded-xl font-bold transition-all hover:bg-black">
                            <UserCheck size={20} /> Assign Salesperson
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-800 border border-gray-700 text-gray-300 py-4 rounded-xl font-bold transition-all hover:bg-gray-700">
                            <Car size={20} /> Confirm Unit
                        </button>
                    </div>
                );
            case "Sparepart Info":
                return (
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-900 border border-gray-700 text-white py-4 rounded-xl font-bold transition-all hover:bg-black">
                            <FileCheck size={20} /> Send Quotation
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 bg-gray-800 border border-gray-700 text-gray-300 py-4 rounded-xl font-bold transition-all hover:bg-gray-700">
                            <PackageCheck size={20} /> Check Stock
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    }

    if (!request) {
        return <div className="p-8 text-center text-red-500">Request not found</div>;
    }

    // Parse details if JSON string, otherwise use as is or empty object
    let details = {};
    if (typeof request.details === 'string') {
        try { details = JSON.parse(request.details); } catch (e) { }
    } else if (typeof request.details === 'object') {
        details = request.details || {};
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/request')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            {getTypeIcon(request.type)}
                            <h1 className="text-2xl font-black text-gray-900">{request.type}</h1>
                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                                {request.id}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Request from {request.name}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
                        <Printer size={18} /> Print
                    </button>
                    {request.session_id && (
                        <button
                            onClick={() => navigate(`/dashboard/history/${request.session_id}`)}
                            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm"
                        >
                            <MessageSquare size={18} /> View Chat
                        </button>
                    )}
                    <div className="relative group">
                        <button className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all ${request.status === 'completed' ? 'bg-green-600 shadow-green-200' :
                            request.status === 'cancelled' ? 'bg-red-600 shadow-red-200' :
                                request.status === 'processed' ? 'bg-blue-600 shadow-blue-200' : 'bg-yellow-400 text-black shadow-yellow-200'
                            }`}>
                            {request.status} <ChevronDown size={16} />
                        </button>

                        {/* Status Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50">
                            {['pending', 'processed', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="w-full text-left px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 capitalize"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50"
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-gray-900 text-white flex items-center justify-center text-3xl font-black">
                                    {(request.name || 'U').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-1">{request.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium mb-4">Customer</p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            <MessageCircle size={12} /> WhatsApp Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`https://wa.me/${request.phone.replace(/\+/g, '')}`, '_blank')}
                                    className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle size={20} />
                                </button>
                                <button
                                    onClick={() => window.location.href = `tel:${request.phone}`}
                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <Phone size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-3xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Phone Number</span>
                                    <span className="font-bold text-gray-900 text-sm">{request.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address</span>
                                    <span className="font-bold text-gray-900 text-sm">{request.email || '-'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Location</span>
                                    <span className="font-bold text-gray-900 text-sm">Bekasi, West Java</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Request Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50"
                    >
                        <h3 className="text-lg font-black text-gray-900 mb-6">Request Information</h3>

                        <div className="space-y-6">
                            <div className="pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Car className="text-red-600" size={20} />
                                    <h4 className="font-bold text-gray-900">Vehicle Details</h4>
                                </div>
                                <p className="text-gray-600 pl-8">{request.vehicle || '-'}</p>
                            </div>

                            <div className="pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className="text-yellow-500" size={20} />
                                    <h4 className="font-bold text-gray-900">User Notes</h4>
                                </div>
                                <p className="text-gray-600 pl-8 italic">"{request.notes || '-'}"</p>
                            </div>

                            {/* Display Dynamic Details */}
                            {Object.keys(details).length > 0 && (
                                <div className="pb-6 border-b border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Tag className="text-blue-500" size={20} />
                                        <h4 className="font-bold text-gray-900">Additional Details</h4>
                                    </div>
                                    <div className="pl-8 grid grid-cols-2 gap-4">
                                        {Object.entries(details).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="text-xs text-gray-400 font-bold block mb-1 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-sm text-gray-700 font-medium">{(value === null || value === undefined) ? '-' : value.toString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 font-bold block mb-1">Created At</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                                        <Calendar size={16} /> {formatDate(request.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 font-bold block mb-1">Due Date</span>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                                        <Clock size={16} /> -
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Actions & Status */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-gray-950 text-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200">
                        <h3 className="text-lg font-black mb-6">Quick Actions</h3>

                        {renderTypeSpecificActions(request.type)}

                        <div className={`${renderTypeSpecificActions(request.type) ? 'mt-6 pt-6 border-t border-gray-800' : ''} space-y-3`}>
                            <button
                                onClick={() => window.open(`https://wa.me/${(request.phone || '').replace(/\+/g, '')}`, '_blank')}
                                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold transition-all"
                            >
                                <MessageCircle size={20} /> Chat WhatsApp
                            </button>
                            <button
                                onClick={() => window.location.href = `mailto:${request.email}`}
                                className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all"
                            >
                                <Mail size={20} /> Send Email
                            </button>
                            <div className="h-px bg-white/10 my-4" />
                            <button
                                onClick={() => handleStatusChange('cancelled')}
                                className="w-full flex items-center justify-center gap-3 border-2 border-red-600/50 hover:bg-red-600/10 text-red-500 py-4 rounded-xl font-bold transition-all"
                            >
                                <XCircle size={20} /> Cancel Request
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Status History</h3>
                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                            {statusHistory.length > 0 ? (
                                statusHistory.map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'
                                            }`} />
                                        <p className="text-sm font-bold text-gray-900 mb-1">{step.label}</p>
                                        <p className="text-xs text-gray-500 font-medium">{formatDate(step.created_at)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No history available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailPage;
