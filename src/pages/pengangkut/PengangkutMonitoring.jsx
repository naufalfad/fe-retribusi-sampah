import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, MapPin, CheckCircle2, Circle,
    ArrowLeft, Filter, Truck, Navigation,
    ChevronRight, AlertCircle, Loader2, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PengangkutMonitoring = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [listObjek, setListObjek] = useState([]);
    const [loading, setLoading] = useState(true);

    const normalizedList = useMemo(() => {
        return listObjek.map(obj => ({
            ...obj,
            is_collected: obj.status === 'SUDAH'
        }));
    }, [listObjek]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/poin/pengangkutan/monitoring');
                if (res.data.success) {
                    setListObjek(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Logic Filter & Search
    const filteredList = useMemo(() => {
        return normalizedList.filter(obj => {
            const nama = obj.nama_objek?.toLowerCase() || '';
            const npor = obj.npor_objek?.toLowerCase() || '';
            const keyword = searchTerm.toLowerCase().trim();

            const matchSearch =
                nama.includes(keyword) ||
                npor.includes(keyword) ||
                obj.alamat_objek?.toLowerCase().includes(keyword);

            if (filterStatus === 'DONE') return matchSearch && obj.is_collected;
            if (filterStatus === 'PENDING') return matchSearch && !obj.is_collected;
            return matchSearch;
        });
    }, [searchTerm, filterStatus, normalizedList]);

    const stats = {
        total: normalizedList.length,
        done: normalizedList.filter(o => o.is_collected).length,
        pending: normalizedList.filter(o => !o.is_collected).length,
    };

    const progressPercent = stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 font-sans animate-in fade-in duration-700 text-left px-4">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 pt-6">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase  leading-none">
                        Monitoring <span className="text-emerald-700">Rute</span>
                    </h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cakupan Wilayah: Pakansari</p>
                </div>
            </div>

            {/* --- PROGRESS CARD --- */}
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Progress Hari Ini</p>
                            <h2 className="text-4xl font-black  tracking-tighter">{progressPercent}% <span className="text-sm not- opacity-50 uppercase">Selesai</span></h2>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Sisa Tugas</p>
                            <p className="text-xl font-black text-orange-400">{stats.pending} Rumah</p>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
                <Navigation className="absolute -right-8 -bottom-8 text-white/5 rotate-12" size={180} />
            </div>

            {/* --- SEARCH & FILTER PILLS --- */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-emerald-600' : 'text-slate-300'}`} size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari Alamat / NPOR..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-emerald-500 rounded-2xl shadow-sm outline-none font-bold text-sm transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'ALL', label: 'Semua', count: stats.total },
                        { id: 'PENDING', label: 'Belum Diangkut', count: stats.pending },
                        { id: 'DONE', label: 'Selesai', count: stats.done },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilterStatus(btn.id)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-2 transition-all
                                ${filterStatus === btn.id
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                    : 'bg-white border-white text-slate-400 shadow-sm'}`}
                        >
                            {btn.label} ({btn.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* --- OBJECT LIST --- */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                ) :
                    filteredList.length > 0 ? filteredList.map((obj) => (
                        <div
                            key={obj.id_objek}
                            onClick={() => !obj.is_collected && navigate('/pengangkut/input-poin', { state: { selected: obj } })}
                            className={`bg-white p-5 rounded-[2rem] border transition-all active:scale-[0.98] flex items-center justify-between group
                            ${obj.is_collected ? 'border-slate-50 opacity-60' : 'border-white shadow-sm hover:border-emerald-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors
                                ${obj.is_collected ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                    {obj.is_collected ? <CheckCircle2 size={24} /> : <Circle size={24} strokeWidth={3} />}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight leading-none mb-1 ">{obj.nama_objek}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{obj.alamat}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{obj.kategori}</span>
                                    </div>
                                </div>
                            </div>

                            {!obj.is_collected ? (
                                <button className="p-3 bg-slate-900 text-white rounded-xl shadow-lg active:bg-emerald-600 transition-all">
                                    <Plus size={18} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-1 text-[8px] font-black text-green-600 uppercase tracking-[0.2em] ">
                                    <CheckCircle2 size={12} /> Selesai
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="py-20 text-center flex flex-col items-center opacity-20">
                            <AlertCircle size={48} className="mb-4" />
                            <p className="font-black uppercase text-xs tracking-widest">Data Tidak Ditemukan</p>
                        </div>
                    )}
            </div>

            {/* --- INFO BOX --- */}
            <div className="px-2 pt-4">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                        <Navigation size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase ">
                        Klik pada objek yang <b>Belum Diangkut</b> untuk langsung menuju halaman input data volume pengangkutan.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PengangkutMonitoring;