import React, { useState, useEffect } from 'react';
import {
    Map as MapIcon, Navigation, Users,
    AlertCircle, ChevronRight, ArrowLeft,
    Loader2, Target, BarChart3, Home,
    CheckCircle2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PenagihWilayah = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWilayahData = async () => {
            try {
                const res = await api.get('/wilayah/penagih-wilayah');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Gagal load data wilayah:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWilayahData();
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
            <Loader2 className="animate-spin text-green-700 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                Memetakan Area Penagihan...
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 font-sans animate-in fade-in duration-700 text-left px-2">

            {/* --- 1. HEADER & BACK NAVIGATION --- */}
            <div className="flex items-center gap-4 pt-6 px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Wilayah <span className="text-green-700">Tugas</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cakupan Kelurahan: {data.kelurahan}</p>
                </div>
            </div>

            {/* --- 2. PROGRESS CAPAIAN KELURAHAN --- */}
            <div className="px-2">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="p-3 bg-green-500/20 rounded-2xl border border-green-500/30">
                                <Target className="text-green-400" size={24} />
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest leading-none mb-1">Capaian Realisasi</p>
                                <p className="text-3xl font-black  tracking-tighter">{data.statistik.persentase_capaian}%</p>
                            </div>
                        </div>

                        {/* Progress Bar Besar */}
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${data.statistik.persentase_capaian}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{data.statistik.total_lunas} Lunas</span>
                                <span>{data.statistik.total_objek} Total Aset</span>
                            </div>
                        </div>
                    </div>
                    <MapIcon size={200} className="absolute -right-12 -bottom-12 opacity-5 rotate-12" />
                </div>
            </div>

            {/* --- 3. DAFTAR BLOK RT/RW (PRIORITY LIST) --- */}
            <div className="px-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-sm ">
                        <BarChart3 className="text-blue-600" size={18} /> Sebaran Tunggakan RT/RW
                    </h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        Urutkan: Nominal Terbesar
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {data.daftar_rt_rw.map((area, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/penagih/list-skrd?rt_rw=${area.rt_rw}`)}
                            className={`bg-white p-6 rounded-[2.5rem] border transition-all active:scale-[0.97] group ${area.nominal_tunggakan > 0 ? 'border-red-50 hover:border-red-200' : 'border-slate-100 hover:border-green-200'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-4 rounded-2xl shadow-inner transition-colors ${area.nominal_tunggakan > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        <Home size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">RT/RW {area.rt_rw}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{area.total_wr} Objek</span>
                                            <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                            <span className={`text-[10px] font-black uppercase ${area.tunggakan_count > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {area.tunggakan_count} Belum Bayar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Tunggakan</p>
                                    <p className={`text-lg font-black tracking-tighter ${area.nominal_tunggakan > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                        {formatCurrency(area.nominal_tunggakan)}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Card */}
                            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase ">
                                    <TrendingUp size={12} className="text-blue-500" />
                                    Area Prioritas Ke-{idx + 1}
                                </div>
                                <div className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Lihat List <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 4. FLOATING LEGEND / INFO --- */}
            <div className="px-2 pb-10">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h5 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-1 leading-none ">Tips Efisiensi</h5>
                        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                            Urutan area di atas didasarkan pada jumlah tunggakan nominal tertinggi. Selesaikan RT/RW teratas untuk mencapai target PAD lebih cepat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PenagihWilayah;