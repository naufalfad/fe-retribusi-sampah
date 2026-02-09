import React from 'react';
import {
    BarChart3, Users, Wallet, FileCheck,
    ArrowUpRight, AlertCircle, Map,
    Clock, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DlhDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 pb-10">
            {/* 1. WELCOME & REVENUE OVERVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-green-800 to-green-950 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div className="relative z-10">
                        <div className="bg-white/10 w-fit px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md mb-6 border border-white/10 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                            Laporan Real-time: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <h1 className="text-4xl font-black leading-tight mb-2 italic tracking-tighter">
                            Halo, Dinas Lingkungan Hidup!
                        </h1>
                        <p className="text-green-100/70 max-w-sm text-sm">
                            Pantau seluruh aktivitas retribusi dari 40 Kecamatan di Kabupaten Bogor hari ini.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Target 2026</p>
                            <p className="text-3xl font-black tracking-tighter">Rp 120.5 M</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Realisasi Saat Ini</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-black tracking-tighter text-green-400 font-mono">38.2%</p>
                                <TrendingUp className="text-green-400" size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Aksen Dekoratif */}
                    <BarChart3 className="absolute -right-10 -bottom-10 text-white/5" size={300} />
                </div>

                {/* 2. QUICK ACTION / INBOX CARD */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter mb-6 flex items-center gap-2">
                            <AlertCircle className="text-orange-500" size={20} /> Antrian Prioritas
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <span className="text-xs font-bold text-orange-800">Validasi NPWRD Baru</span>
                                <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">12</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <span className="text-xs font-bold text-blue-800">Konfirmasi Pembayaran</span>
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">45</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <span className="text-xs font-bold text-purple-800">Layanan Non-Aktif</span>
                                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">3</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all">
                        Buka Semua Antrian
                    </button>
                </div>
            </div>

            {/* 3. CORE METRICS BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Wajib Retribusi', value: '45.231', sub: '+124 bulan ini', icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'SKRD Terbit', value: '12.042', sub: 'Masa Januari', icon: <FileCheck />, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Penerimaan', value: 'Rp 4.2M', sub: 'Bulan ini', icon: <Wallet />, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Tingkat Kepatuhan', value: '82%', sub: 'Target 90%', icon: <CheckCircle2 />, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-green-500 transition-all">
                        <div className={`p-4 w-fit rounded-2xl mb-4 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                            {item.icon}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-2xl font-black text-gray-800 mt-1">{item.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* 4. PERFORMANCE TRACKING SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* AKTIVITAS UPT TERSIBUK */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                            <Map className="text-green-700" size={20} /> Distribusi Beban UPT
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400">Total 40 UPT Wilayah</span>
                    </div>
                    <div className="p-8 space-y-6">
                        {[
                            { name: 'UPT Wilayah Cibinong', val: 85, color: 'bg-green-600' },
                            { name: 'UPT Wilayah Ciawi', val: 62, color: 'bg-blue-600' },
                            { name: 'UPT Wilayah Parung', val: 45, color: 'bg-orange-500' },
                            { name: 'UPT Wilayah Jasinga', val: 30, color: 'bg-red-500' },
                        ].map((upt, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                                    <span className="text-gray-600">{upt.name}</span>
                                    <span className="text-gray-800">{upt.val}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${upt.color}`} style={{ width: `${upt.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOG AKTIVITAS TERBARU */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="text-blue-600" size={20} /> Log Validasi Terbaru
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {[
                            { user: 'UPT Cibinong', act: 'Mendaftarkan NPWRD Baru', time: '2 Menit Lalu', name: 'PT. Jasa Abadi' },
                            { user: 'Bidang DLH', act: 'Validasi Pembayaran', time: '15 Menit Lalu', name: 'Restoran Sunda' },
                            { user: 'Bendahara', act: 'Penerbitan SKRD', time: '1 Jam Lalu', name: 'Sutisna (Pribadi)' },
                        ].map((log, i) => (
                            <div key={i} className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-wide">{log.user}</p>
                                        <p className="text-[10px] text-gray-500 italic mb-1">{log.act} untuk {log.name}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-gray-50 text-center">
                        <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Lihat Semua Log Sistem</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DlhDashboard;