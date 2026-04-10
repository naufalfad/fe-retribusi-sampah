import React, { useState, useEffect, useMemo } from 'react';
import {
    History, Banknote, QrCode, RefreshCw,
    Calendar, Loader2, Wallet, ChevronRight,
    Clock, Zap, ArrowLeft, Filter,
    CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PenagihRiwayat = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/logs/riwayat-penagih');
            if (res.data.success) setHistory(res.data.data);
        } catch (err) {
            console.error("Gagal load riwayat:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    // --- KALKULASI RINGKASAN HARI INI ---
    const summary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const logsToday = history.filter(log => log.createdAt.startsWith(today));

        return {
            totalTunai: logsToday.reduce((acc, curr) =>
                curr.data_baru?.metode === 'tunai' ? acc + Number(curr.data_baru.nominal) : acc, 0),
            totalTransaksi: logsToday.length
        };
    }, [history]);

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(val);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-400">
            <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-green-700 rounded-full animate-spin"></div>
                <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-700" size={16} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Menyusun Jurnal Transaksi...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 font-sans animate-in fade-in duration-700 text-left px-4">

            {/* --- 1. HEADER & NAV --- */}
            <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            Log <span className="text-green-700">Setoran</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jurnal Aktivitas Lapangan</p>
                    </div>
                </div>
                <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
                    <Filter size={20} />
                </button>
            </div>

            {/* --- 2. SUMMARY DASHBOARD --- */}
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.2em] mb-1">Uang di Tangan (Hari Ini)</p>
                        <h2 className="text-3xl font-black tracking-tighter italic">{formatCurrency(summary.totalTunai)}</h2>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                {summary.totalTransaksi} Transaksi Berhasil
                            </span>
                        </div>
                    </div>
                    <div className="p-4 bg-green-600 rounded-[1.8rem] shadow-lg shadow-green-900/50">
                        <Wallet size={28} />
                    </div>
                </div>
                <TrendingUp size={150} className="absolute -right-10 -bottom-10 opacity-5 text-white" />
            </div>

            {/* --- 3. TRANSACTION LIST --- */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Riwayat Terbaru</h3>
                    <button onClick={fetchHistory} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center opacity-30">
                        <History size={48} className="mb-4 text-slate-300" />
                        <p className="font-black uppercase text-xs tracking-widest">Belum Ada Transaksi</p>
                    </div>
                ) : history.map((log) => {
                    const data = log.data_baru;
                    const isTunai = data.metode?.toLowerCase() === 'tunai';

                    return (
                        <div key={log.id_log} className="group bg-white p-5 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all active:scale-[0.98] hover:border-green-200">
                            <div className="flex items-center gap-4 text-left">
                                {/* Icon Container */}
                                <div className={`h-14 w-14 rounded-[1.4rem] flex flex-col items-center justify-center shrink-0 border-2 ${isTunai ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                    {isTunai ? <Banknote size={24} /> : <QrCode size={24} />}
                                    <span className="text-[7px] font-black mt-1 uppercase tracking-tighter">{data.metode}</span>
                                </div>

                                {/* Info Text */}
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                                        ID Log: #{log.id_log}
                                    </p>
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight truncate w-40 sm:w-64">
                                        {'SSRD-GENERATED'}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={10} className="text-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            {new Date(log.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount & Status */}
                            <div className="text-right flex flex-col items-end">
                                <p className="text-lg font-black text-slate-900 tracking-tighter italic leading-none mb-2">
                                    {formatCurrency(data.nominal)}
                                </p>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isTunai ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                        {isTunai ? 'Pending' : 'Success'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- 4. INFO FOOTER (FLOATING-ISH) --- */}
            <div className="px-2 pt-4">
                <div className="bg-white border-2 border-dashed border-slate-200 p-6 rounded-[2.5rem] flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase italic">
                            Riwayat ini mencatat setiap kali Anda menekan tombol <span className="text-slate-900 font-black">"Simpan Setoran"</span>. Gunakan data ini untuk rekonsiliasi sore hari dengan Bendahara.
                        </p>
                    </div>
                </div>
            </div>

            {/* PULL TO REFRESH INDICATION (Visual only) */}
            <div className="text-center pb-10">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Records</p>
            </div>

        </div>
    );
};

export default PenagihRiwayat;