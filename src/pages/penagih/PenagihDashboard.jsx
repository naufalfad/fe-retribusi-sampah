import React, { useState, useEffect } from 'react';
import {
    Wallet, Users, AlertCircle, ArrowUpRight,
    MapPin, History, Search, Loader2,
    CheckCircle2, Banknote, Navigation, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PenagihDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPenagihData = async () => {
            try {
                const res = await api.get('/report/penagih-stats');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Gagal load dashboard penagih:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPenagihData();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menyiapkan Rute Tugas...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-28 font-sans animate-in fade-in duration-700">

            {/* --- 1. HEADER: GREETING & LOCATION --- */}
            <div className="px-4 pt-6 flex justify-between items-center">
                <div className="text-left">
                    <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1 italic">Tugas Lapangan</h4>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Halo, {JSON.parse(localStorage.getItem('user'))?.username}
                    </h1>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
                    <Navigation size={20} className="text-green-700" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                </div>
            </div>

            {/* --- 2. CASH IN HAND (HERO CARD) --- */}
            <div className="px-4">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group active:scale-[0.98] transition-all">
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <Wallet className="text-green-400" size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">Wilayah Tugas</p>
                                <p className="text-xs font-bold uppercase italic">{data.wilayah}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 leading-none">Tunai Terkumpul (Hari Ini)</p>
                            <h2 className="text-4xl font-black tracking-tighter italic text-white drop-shadow-lg">
                                {formatCurrency(data.summary.cash_today)}
                            </h2>
                        </div>

                        <button
                            onClick={() => navigate('/penagih/riwayat')}
                            className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all active:bg-black"
                        >
                            Detail Setoran <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <Banknote size={200} className="absolute -right-12 -bottom-12 opacity-5 rotate-12" />
                </div>
            </div>

            {/* --- 3. STATS QUICK GRID --- */}
            <div className="px-4 grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                    <Users className="text-blue-600" size={20} />
                    <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total WR</p>
                        <p className="text-xl font-black text-slate-800 italic">{data.summary.total_wr} <span className="text-[10px] font-bold text-slate-300">OBJEK</span></p>
                    </div>
                </div>
                <div
                    onClick={() => navigate('/penagih/list-skrd')}
                    className="bg-white p-5 rounded-[2rem] border border-red-100 shadow-sm flex flex-col justify-between h-32 active:bg-red-50 transition-colors"
                >
                    <AlertCircle className="text-red-500" size={20} />
                    <div className="text-left">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">Tunggakan</p>
                        <p className="text-xl font-black text-slate-800 italic leading-none">{data.summary.jumlah_tunggakan} <span className="text-[10px] font-bold text-slate-300 uppercase">Tagihan</span></p>
                        <p className="text-[10px] font-black text-red-600 mt-1">{formatCurrency(data.summary.total_tunggakan_idr)}</p>
                    </div>
                </div>
            </div>

            {/* --- 4. RECENT ACTIVITY --- */}
            <div className="px-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-sm italic">
                        <History className="text-green-700" size={18} /> Aktivitas Terakhir
                    </h3>
                    <button onClick={() => navigate('/penagih/riwayat')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
                </div>

                <div className="space-y-3">
                    {data.recentCollections.length === 0 ? (
                        <div className="text-center py-10 opacity-30 italic uppercase font-black text-[10px] tracking-widest">Belum ada penagihan hari ini</div>
                    ) : data.recentCollections.map((col) => (
                        <div key={col.id_ssrd} className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4 text-left">
                                <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-slate-800 text-sm uppercase truncate w-40">
                                        {col.Skrd?.Objek?.Subjek?.nama_subjek || 'WR Umum'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{col.Skrd?.Objek?.nama_objek}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[9px] font-black text-indigo-600 uppercase">{col.payment_method}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800 tracking-tighter italic">{formatCurrency(col.amount_paid)}</p>
                                <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(col.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 5. FLOATING BOTTOM BUTTONS --- */}
            {/* <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/penagih/list-skrd')}
                        className="bg-white text-slate-900 border-2 border-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:bg-slate-900 active:text-white transition-all"
                    >
                        <Search size={16} /> Cari Tagihan
                    </button>
                    <button
                        onClick={() => navigate('/penagih/wilayah')}
                        className="bg-green-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-green-900/30 flex items-center justify-center gap-2 active:bg-black transition-all"
                    >
                        <MapPin size={16} /> Rute Tugas
                    </button>
                </div>
            </div> */}

            {/* --- 6. SYSTEM FOOTER --- */}
            <div className="px-4 pt-4 pb-10">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex items-center gap-4">
                    <Zap size={24} className="text-blue-600 animate-pulse shrink-0" fill="currentColor" />
                    <p className="text-[9px] font-bold text-blue-800 leading-relaxed uppercase italic">
                        Data disinkronkan otomatis ke server pusat. Pastikan GPS aktif untuk pelaporan titik lokasi penagihan.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default PenagihDashboard;