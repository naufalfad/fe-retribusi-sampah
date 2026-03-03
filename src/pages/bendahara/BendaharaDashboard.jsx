import React, { useState, useEffect } from 'react';
import {
    Landmark, Wallet, FileCheck, TrendingUp,
    ArrowUpRight, Clock, Banknote, Loader2,
    RefreshCw, ShieldCheck, CreditCard, ChevronRight,
    BadgeAlert, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const BendaharaDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBendaharaData = async () => {
            try {
                const res = await api.get('/report/bendahara-stats');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Gagal load dashboard Bendahara:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBendaharaData();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <Landmark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={24} />
            </div>
            Otorisasi Data Keuangan...
        </div>
    );

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans text-left">

            {/* --- 1. HEADER & REVENUE HERO --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1 italic">
                        Otoritas Bendahara Penerima
                    </h4>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Cash <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-500">Flow</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-2">Monitoring harian realisasi pendapatan daerah melalui retribusi persampahan.</p>
                </div>

                <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Realisasi Bulan Ini ({new Date().toLocaleString('id-ID', { month: 'long' })})</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic text-white drop-shadow-md">
                                {formatCurrency(data.summary.realisasi_bulan_ini)}
                            </h2>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                <TrendingUp size={14} /> Sinkronisasi Bank Terakhir: Hari Ini
                            </div>
                        </div>
                        <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/10 text-center min-w-[200px]">
                            <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Penerimaan Hari Ini</p>
                            <p className="text-xl font-black">{formatCurrency(data.summary.realisasi_hari_ini)}</p>
                        </div>
                    </div>
                    <Landmark size={200} className="absolute -right-10 -bottom-10 opacity-10 text-white group-hover:scale-110 transition-transform duration-1000" />
                </div>
            </div>

            {/* --- 2. KPI GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Antrean Rekonsiliasi (Urgent Card) */}
                <div
                    onClick={() => navigate('/bendahara/ssrd')}
                    className="cursor-pointer bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="p-4 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <span className="flex items-center gap-1.5 bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                            <BadgeAlert size={12} /> Perlu Audit
                        </span>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Antrean Rekonsiliasi</p>
                        <h3 className="text-3xl font-black text-slate-900">{data.summary.antrean_rekon} <span className="text-sm font-bold text-slate-300">Setoran</span></h3>
                    </div>
                </div>

                {/* Piutang Card */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
                    <div className="p-4 w-fit rounded-2xl bg-slate-100 text-slate-400 mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Wallet size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Piutang (Unpaid)</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(data.summary.total_piutang)}</h3>
                </div>

                {/* Performance Method */}
                <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CreditCard size={16} /> Tren Metode Bayar
                        </h3>
                        <div className="space-y-3">
                            {data.paymentMethods.map((m, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold opacity-70 uppercase tracking-tight">{m.payment_method}</span>
                                    <span className="text-xs font-black">{m.jumlah} Transaksi</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Activity size={100} className="absolute -right-4 -bottom-4 opacity-10" />
                </div>
            </div>

            {/* --- 3. RECENT SETTLEMENTS (LOG) --- */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600" size={20} />
                        <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.2em]">Realisasi Pembayaran Terverifikasi</h3>
                    </div>
                    <button
                        onClick={() => navigate('/bendahara/ssrd')}
                        className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        Buka Laporan Penuh <ChevronRight size={12} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-4">No. SSRD</th>
                                <th className="px-8 py-4">Objek / Wajib Retribusi</th>
                                <th className="px-8 py-4">Metode</th>
                                <th className="px-8 py-4">Nominal</th>
                                <th className="px-8 py-4 text-center">Waktu Validasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.recentTransactions.map((tx) => (
                                <tr key={tx.id_ssrd} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-black text-indigo-600 font-mono tracking-tighter italic">{tx.no_ssrd}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none">
                                            {tx.Skrd?.Objek?.nama_objek || 'General User'}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Ref: {tx.Skrd?.no_skrd}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-200">
                                            {tx.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-black text-emerald-600 italic tracking-tighter">
                                            {formatCurrency(tx.amount_paid)}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(tx.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BendaharaDashboard;