import React, { useState } from 'react';
import {
    History, Calendar, Banknote, QrCode,
    Landmark, Search, Filter, ArrowUpRight,
    Download, CheckCircle2, Clock, Wallet,
    ChevronRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';

const PenagihRiwayat = () => {
    const navigate = useNavigate();

    // Data Dummy Riwayat Penagihan Lapangan
    const [historyData] = useState([
        {
            id: 'TX-8801',
            nama_wr: 'KINAN KARI',
            no_skrd: 'SKRD/2026/01/IZAIH',
            nominal: 50000,
            metode: 'tunai',
            tgl: '2026-02-05',
            jam: '10:15',
            status_setoran: 'Diterima Penagih' // Belum ke Bendahara
        },
        {
            id: 'TX-8802',
            nama_wr: 'TOKO BERKAH',
            no_skrd: 'SKRD/2026/01/T0I9J',
            nominal: 150000,
            metode: 'qris',
            tgl: '2026-02-05',
            jam: '09:45',
            status_setoran: 'Lunas (Sistem)' // QRIS langsung lunas
        },
        {
            id: 'TX-8795',
            nama_wr: 'SUTISNA',
            no_skrd: 'SKRD/2026/01/GVK9P',
            nominal: 50000,
            metode: 'tunai',
            tgl: '2026-02-04',
            jam: '16:20',
            status_setoran: 'Sudah Disetor' // Sudah diverifikasi Bendahara
        },
    ]);

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500 font-sans px-2">

            {/* --- HEADER --- */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                    Log Setoran
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Monitoring Transaksi Lapangan Anda
                </p>
            </div>

            {/* --- SUMMARY BOX: CASH IN HAND --- */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                            <Wallet className="text-green-400" size={24} />
                        </div>
                        <span className="text-[9px] font-black bg-green-500 text-green-950 px-3 py-1 rounded-full uppercase tracking-tighter">
                            Update: Hari Ini
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Total Tunai di Tangan (Cash)</p>
                        <h2 className="text-4xl font-black tracking-tighter italic text-green-400">Rp 100.000</h2>
                    </div>
                    <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all active:scale-95 shadow-xl">
                        Laporkan Setoran Tunai
                    </button>
                </div>
                <Banknote className="absolute -right-6 -bottom-6 text-white/5" size={180} />
            </div>

            {/* --- FILTER & SEARCH --- */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Cari transaksi..."
                        className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-700/5 font-bold text-xs"
                    />
                </div>
                <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400">
                    <Calendar size={20} />
                </button>
            </div>

            {/* --- TRANSACTION LIST --- */}
            <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-2 flex justify-between items-center">
                    Aktivitas Terbaru
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer">Export <Download size={12} /></span>
                </h3>

                {historyData.map((tx) => (
                    <div
                        key={tx.id}
                        className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${tx.metode === 'tunai' ? 'bg-amber-50 text-amber-600' :
                                    tx.metode === 'qris' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                }`}>
                                {tx.metode === 'tunai' ? <Banknote size={20} /> :
                                    tx.metode === 'qris' ? <QrCode size={20} /> : <Landmark size={20} />}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{tx.nama_wr}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">{tx.tgl} • {tx.jam} WIB</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-green-700 font-mono">Rp {tx.nominal.toLocaleString()}</span>
                                    <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${tx.status_setoran === 'Sudah Disetor' ? 'text-green-600' : 'text-amber-500'
                                        }`}>{tx.status_setoran}</span>
                                </div>
                            </div>
                        </div>

                        <button className="p-3 bg-gray-50 text-gray-300 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* --- INFO CARD --- */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                    <Clock size={24} />
                </div>
                <div>
                    <h5 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-1 leading-none">Sinkronisasi Keuangan</h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed font-medium italic">
                        Pembayaran digital (QRIS/VA) diverifikasi otomatis oleh sistem. Untuk pembayaran <span className="font-black underline">Tunai</span>, pastikan Anda menyetorkan uang fisik ke Bendahara setiap sore untuk mendapatkan validasi SSRD.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PenagihRiwayat;