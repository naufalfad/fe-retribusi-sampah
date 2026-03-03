import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, ClipboardCheck, Building2, Home, MapPin,
    Loader2, ChevronLeft, ChevronRight, X, AlertCircle,
    CheckCircle2, Info, ArrowRight, ShieldCheck, Filter
} from 'lucide-react';
import api from '../../api/axios';
import AuditFormModal from './components/AuditFormModal';

const DinasPemeriksaan = () => {
    // --- STATES ---
    const [objekList, setObjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: 10
    });

    const [showAuditModal, setShowAuditModal] = useState(false);
    const [selectedObjek, setSelectedObjek] = useState(null);

    // --- FETCH DATA ---
    const fetchObjek = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/objek/list-objek', {
                params: {
                    page: page,
                    limit: 10,
                    search: search
                }
            });
            if (response.data.status === 'success') {
                setObjekList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Gagal mengambil data objek:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce Search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchObjek(1, searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, fetchObjek]);

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            fetchObjek(newPage, searchTerm);
        }
    };

    const handleOpenAudit = (obj) => {
        setSelectedObjek(obj);
        setShowAuditModal(true);
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left">

            {/* --- 1. HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                        Verifikasi <span className="text-red-600">Audit</span> Lapangan
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest italic leading-none">
                        Pengawasan & Penyesuaian Klasifikasi Objek Retribusi
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
                    <ShieldCheck className="text-red-600" size={20} />
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">
                        Otoritas Dinas Terverifikasi
                    </span>
                </div>
            </div>

            {/* --- 2. TOOLBAR (Search & Info) --- */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-red-600' : 'text-slate-300'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Cari NPOR atau Nama Objek untuk diaudit..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 bg-slate-900 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em]">
                    <Filter size={14} /> Total: {pagination.total_items} Objek
                </div>
            </div>

            {/* --- 3. DATA TABLE --- */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="p-8">Objek & NPOR</th>
                                <th className="p-8">Pemilik (Subjek)</th>
                                <th className="p-8 text-center">Klasifikasi Saat Ini</th>
                                <th className="p-8 text-center">Wilayah</th>
                                <th className="p-8 text-center">Aksi Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <Loader2 size={32} className="animate-spin mx-auto text-red-600" />
                                        <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">Menghubungkan ke Database...</p>
                                    </td>
                                </tr>
                            ) : objekList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Data objek tidak ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                objekList.map((obj) => (
                                    <tr key={obj.id_objek} className="hover:bg-red-50/30 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl transition-colors ${obj.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-50 text-blue-600 group-hover:bg-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-white'}`}>
                                                    {obj.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={20} /> : <Home size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase leading-tight tracking-tight">
                                                        {obj.nama_objek}
                                                    </p>
                                                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
                                                        NPOR: <span className="text-slate-600">{obj.npor_objek}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                                                {obj.Subjek?.nama_subjek || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="inline-block bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                                                <p className="text-[10px] font-black text-slate-800 uppercase leading-none">
                                                    {obj.kelas?.nama_kelas || 'UMUM'}
                                                </p>
                                                <p className="text-[9px] font-bold text-red-600 mt-1 uppercase">
                                                    Rp {Number(obj.tarif_pokok_objek).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase leading-tight">
                                                {obj.kelurahan_objek}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 mt-1 text-[9px] font-bold text-slate-400 uppercase italic">
                                                <MapPin size={10} /> {obj.kecamatan_objek}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <button
                                                onClick={() => handleOpenAudit(obj)}
                                                className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all mx-auto shadow-lg shadow-slate-900/10 active:scale-95"
                                            >
                                                <ClipboardCheck size={16} /> Audit Survey
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- 4. PAGINATION FOOTER --- */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Halaman <span className="text-slate-900">{pagination.current_page}</span> Dari <span className="text-slate-900">{pagination.total_pages}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 shadow-sm">
                            {pagination.current_page}
                        </div>

                        <button
                            disabled={pagination.current_page === pagination.total_pages}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 5. AUDIT MODAL --- */}
            {showAuditModal && selectedObjek && (
                <AuditFormModal
                    objek={selectedObjek}
                    onClose={() => setShowAuditModal(false)}
                    onSuccess={() => fetchObjek(pagination.current_page, searchTerm)}
                />
            )}
        </div>
    );
};

export default DinasPemeriksaan;