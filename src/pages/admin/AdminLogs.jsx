import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
    Activity, Search, Download, Clock, ChevronDown,
    Eye, ShieldAlert, Database, Banknote,
    Settings, X, Loader2, Monitor, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';

const AdminLogs = () => {
    // --- STATES ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('SEMUA');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    const [availableModules, setAvailableModules] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total_pages: 1,
        total_items: 0
    });

    // --- FETCH DATA ---
    const fetchAvailableModules = async () => {
        try {
            const res = await api.get('/logs/modules'); // Ganti dengan rute backend baru Anda
            if (res.data.success) {
                setAvailableModules(res.data.data);
            }
        } catch (error) {
            console.error("Gagal memuat daftar modul:", error);
        }
    };

    const fetchLogs = useCallback(async (page = 1, search = '', filter = 'SEMUA') => {
        setLoading(true);
        try {
            const response = await api.get('/logs/list', {
                params: {
                    page: page,
                    limit: 10,
                    search: searchTerm,
                    modul: filter !== 'SEMUA' ? filter : undefined
                }
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Gagal mengambil log:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAvailableModules();
    }, [])

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchLogs(currentPage, searchTerm, moduleFilter);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, moduleFilter, currentPage, fetchLogs]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, moduleFilter]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenDetail = (log) => {
        setSelectedLog(log);
        setShowDetail(true);
    };

    const getModuleIcon = (module) => {
        switch (module?.toUpperCase()) {
            case 'MANAJEMEN_BENDAHARA': return <Banknote size={16} className="text-emerald-600" />;
            case 'MANAJEMEN_OBJEK': return <Database size={16} className="text-blue-600" />;
            case 'MANAJEMEN_SUBJEK': return <Settings size={16} className="text-purple-600" />;
            case 'MANAJEMEN_STAFF': return <Activity size={16} className="text-orange-600" />;
            case 'MANAJEMEN_SKRD': return <Activity size={16} className="text-orange-600" />;
            default: return <Activity size={16} className="text-gray-600" />;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans px-2">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                        Audit <span className="text-green-700">Trail</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Rekam jejak digital seluruh aktivitas operasional REKAS.</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                    <Download size={16} /> Export Audit Log
                </button>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-green-700' : 'text-slate-300'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Cari pelaku, ID, atau aksi..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- DROPDOWN MODUL DINAMIS --- */}
                <div className="relative min-w-[200px]">
                    <select
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border-none rounded-2xl pl-6 pr-12 py-4 text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-green-700"
                    >
                        <option value="SEMUA">Semua Modul</option>
                        {availableModules.map((m) => (
                            <option key={m} value={m}>
                                {m.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* --- LOG TABLE --- */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800">
                            <tr>
                                <th className="p-8">Waktu Kejadian</th>
                                <th className="p-8">Pelaku</th>
                                <th className="p-8">Aksi Sistem</th>
                                <th className="p-8">Modul</th>
                                <th className="p-8 text-center">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 size={32} className="animate-spin mx-auto text-green-700" /></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tidak ada aktivitas ditemukan</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id_log} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-white group-hover:text-green-700 transition-all">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">
                                                        {new Date(log.createdAt).toLocaleTimeString('id-ID')}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-green-700 text-white rounded-xl flex items-center justify-center text-xs font-black uppercase">
                                                    {log.role?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase leading-none">ID User: {log.id_user}</p>
                                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">{log.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-xs font-bold text-slate-700 leading-tight">{log.aksi.replace(/_/g, ' ')}</p>
                                            <p className="text-[9px] text-slate-400 font-mono mt-1 italic line-clamp-1">{log.deskripsi}</p>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 w-fit shadow-sm">
                                                {getModuleIcon(log.modul)}
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{log.modul}</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <button
                                                onClick={() => handleOpenDetail(log)}
                                                className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* --- FOOTER PAGINASI --- */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Menampilkan <span className="text-slate-900">{logs.length}</span> Dari <span className="text-slate-900">{pagination.total_items}</span> Log Aktivitas
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex gap-1">
                            {[...Array(pagination.total_pages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Logika sederhana agar tombol tidak terlalu banyak jika halaman ratusan
                                if (
                                    pagination.total_pages <= 5 ||
                                    pageNum === 1 ||
                                    pageNum === pagination.total_pages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${currentPage === pageNum
                                                ? 'bg-green-700 border-green-700 text-white shadow-lg shadow-green-900/20'
                                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            disabled={currentPage === pagination.total_pages || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL: DETAIL AUDIT DEEP DIVE --- */}
            {showDetail && selectedLog && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-2xl shadow-lg"><ShieldAlert size={24} /></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none italic">Deep Audit Metadata</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-[0.2em]">Transaction ID: {selectedLog.id_log}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-500"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Device & Network Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><MapPin size={10} /> IP Address</p>
                                    <p className="text-sm font-mono font-black text-slate-800">{selectedLog.ip_address || 'Internal'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Monitor size={10} /> User Agent</p>
                                    <p className="text-[10px] font-bold text-slate-500 truncate" title={selectedLog.user_agent}>{selectedLog.user_agent}</p>
                                </div>
                            </div>

                            {/* Narasi Aksi */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest ml-1">Deskripsi Aktivitas</p>
                                <div className="bg-green-50/50 p-6 rounded-[2rem] border border-green-100 italic">
                                    <p className="text-sm font-bold text-green-900 leading-relaxed">
                                        "{selectedLog.deskripsi}"
                                    </p>
                                </div>
                            </div>

                            {/* Data Comparison (JSON View) */}
                            {(selectedLog.data_lama || selectedLog.data_baru) && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perubahan State Data</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedLog.data_lama && (
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <p className="text-[9px] font-bold text-red-500 uppercase mb-2">Sebelum Perubahan:</p>
                                                <pre className="text-[10px] overflow-x-auto font-mono text-slate-500">
                                                    {JSON.stringify(selectedLog.data_lama, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedLog.data_baru && (
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-[9px] font-bold text-blue-600 uppercase mb-2">Sesudah Perubahan:</p>
                                                <pre className="text-[10px] overflow-x-auto font-mono text-blue-800">
                                                    {JSON.stringify(selectedLog.data_baru, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowDetail(false)}
                                className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95"
                            >
                                Tutup Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;