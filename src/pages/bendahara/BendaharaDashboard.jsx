import React from 'react';
import {
    Landmark, Wallet, FilePlus2, CheckCircle,
    TrendingUp, ArrowUpRight, ArrowDownLeft,
    BarChart, Calendar, RefreshCcw, ShieldCheck
} from 'lucide-react';

const BendaharaDashboard = () => {
    return (
        <div className="space-y-8 pb-10">
            {/* HEADER & DATE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Otoritas Bendahara</h1>
                    <p className="text-slate-500 font-medium">Monitoring Arus Kas & Penerbitan Dokumen Keuangan</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm font-bold text-slate-600 text-sm">
                    <Calendar size={18} className="text-indigo-600" />
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* TOP ROW: BENTO BOX SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* HERO CARD: REVENUE (6 COLS) */}
                <div className="lg:col-span-7 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Total Penerimaan Bulan Ini</p>
                                <h2 className="text-5xl font-black tracking-tighter italic">Rp 4.250.880.000</h2>
                            </div>
                            <div className="bg-indigo-500/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                                <TrendingUp className="text-indigo-400" />
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Penerimaan Hari Ini</p>
                                <p className="text-xl font-bold flex items-center gap-2">
                                    Rp 125.4M <ArrowUpRight className="text-emerald-400" size={16} />
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Rata-rata Transaksi</p>
                                <p className="text-xl font-bold italic">Rp 450rb <span className="text-[10px] font-normal opacity-50">/user</span></p>
                            </div>
                        </div>
                    </div>
                    {/* Aksen Background */}
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Landmark size={200} />
                    </div>
                </div>

                {/* BANK SYNC CARD (5 COLS) */}
                <div className="lg:col-span-5 bg-indigo-700 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-900/20">
                    <div className="flex justify-between items-start">
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                            <RefreshCcw className="text-white" size={24} />
                        </div>
                        <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase">Bank Jabar Terhubung</span>
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 tracking-[0.2em]">Bank Jabar BJB - Kas Daerah</p>
                        <p className="text-2xl font-mono font-black tracking-widest">00123.4455.6677</p>
                    </div>

                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-sm transition-all">
                        Sinkronisasi Mutasi Terakhir
                    </button>
                </div>
            </div>

            {/* MIDDLE ROW: PIPELINE STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Antrian SKRD */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FilePlus2 /></div>
                        <ArrowRightIcon />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Antrian SKRD</p>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">15 Dokumen</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Diteruskan dari DLH</p>
                </div>

                {/* Rekon SSRD */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-orange-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><RefreshCcw /></div>
                        <ArrowRightIcon />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Antrian Rekonsiliasi</p>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">28 Pembayaran</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Perlu pengecekan mutasi bank</p>
                </div>

                {/* Target APBD */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BarChart /></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Capaian Target</p>
                    <h4 className="text-2xl font-black text-slate-800 mt-1">Rp 12.5 M <span className="text-xs font-medium text-slate-400">/ 45 M</span></h4>
                    <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[35%]"></div>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: RECENT LOGS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" size={20} /> Aktivitas Keuangan Terbaru
                    </h3>
                    <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Download Laporan (.pdf)</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {[
                        { ref: 'SKRD/2026/001', wr: 'PT. Maju Sejahtera', act: 'Penomoran SKRD', val: 'Rp 5.000.000', time: '5m lalu' },
                        { ref: 'SSRD/2026/088', wr: 'Toko Kue Lezat', act: 'Rekon Berhasil & SSRD Terbit', val: 'Rp 75.000', time: '12m lalu' },
                        { ref: 'SKRD/2026/005', wr: 'H. Dadang (Pribadi)', act: 'Penetapan Nominal', val: 'Rp 50.000', time: '1j lalu' },
                    ].map((log, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-2.5 rounded-xl text-slate-400 group-hover:bg-white transition-all">
                                    <ArrowDownLeft size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.ref}</p>
                                    <p className="text-sm font-black text-slate-800 tracking-tight">{log.wr}</p>
                                    <p className="text-[10px] text-slate-500 italic">{log.act}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-800">{log.val}</p>
                                <p className="text-[10px] font-bold text-slate-400">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper Icon Component
const ArrowRightIcon = () => (
    <div className="p-2 text-slate-300 group-hover:text-slate-600 transition-colors">
        <ArrowUpRight size={18} />
    </div>
);

export default BendaharaDashboard;