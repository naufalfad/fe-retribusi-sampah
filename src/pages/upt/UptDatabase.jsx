import React, { useState, useEffect, useCallback } from 'react';
import {
    Database, Search, Filter, Download,
    MoreVertical, Loader2, ChevronLeft,
    ChevronRight, Users, Building2
} from 'lucide-react';
import { debounce } from 'lodash';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';

const UptDatabase = () => {
    // --- STATES ---
    const [subjekList, setSubjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1
    });

    // --- FETCH DATA (Integrated with /subjek/list-subjek) ---
    const fetchSubjek = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/subjek/list-subjek', {
                params: {
                    page: page,
                    limit: 10,
                    search: search
                }
            });

            if (response.data.status === 'success') {
                setSubjekList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error("Gagal memuat database subjek:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search agar tidak membebani server
    const debouncedFetch = useCallback(
        debounce((query) => {
            fetchSubjek(1, query);
        }, 500),
        [fetchSubjek]
    );

    useEffect(() => {
        fetchSubjek(pagination.current_page, searchTerm);
    }, [pagination.current_page]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedFetch(value);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 font-sans text-left">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                        Database <span className="text-green-700">Wajib Retribusi</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Arsip Data Terverifikasi Wilayah UPT</p>
                </div>
                <button className="bg-white border-2 border-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
                    <Download size={16} /> Export Master Data
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-green-700' : 'text-slate-300'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Cari Nama Wajib Retribusi atau NPWRD..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 font-bold text-sm transition-all"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 bg-slate-900 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em]">
                    <Database size={14} /> Total: {pagination.total_items} Record
                </div>
            </div>

            {/* TABLE CONTENT */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="p-8">Data Subjek (NPWRD)</th>
                                <th className="p-8">Kategori</th>
                                <th className="p-8">Alamat & Wilayah</th>
                                <th className="p-8">Status Akun</th>
                                <th className="p-8 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-left">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <Loader2 size={32} className="animate-spin mx-auto text-green-700" />
                                        <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">Sinkronisasi Database...</p>
                                    </td>
                                </tr>
                            ) : subjekList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic">Data tidak ditemukan</td>
                                </tr>
                            ) : (
                                subjekList.map((wr) => (
                                    <tr key={wr.id_subjek} className="hover:bg-green-50/30 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-green-700 group-hover:text-white transition-all shadow-inner">
                                                    {wr.kategori_subjek === 'Pribadi' ? <Users size={20} /> : <Building2 size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase leading-tight tracking-tight">{wr.nama_subjek}</p>
                                                    <p className="text-[10px] font-bold text-green-700 font-mono tracking-tighter mt-1 italic">
                                                        {wr.npwrd_subjek || 'PENDING_GENERATION'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${wr.kategori_subjek === 'Pribadi' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                {wr.kategori_subjek}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{wr.kecamatan_subjek}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{wr.alamat_subjek}</p>
                                        </td>
                                        <td className="p-8">
                                            <StatusBadge status={wr.status_subjek} />
                                        </td>
                                        <td className="p-8 text-center">
                                            <button className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-slate-900 hover:shadow-md rounded-2xl transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Halaman <span className="text-slate-900">{pagination.current_page}</span> Dari <span className="text-slate-900">{pagination.total_pages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={pagination.current_page === pagination.total_pages}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UptDatabase;