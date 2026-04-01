import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck, Star, Leaf, MapPin,
    ChevronRight, Plus, History, Activity,
    Zap, Award, Navigation, BarChart3,
    Clock, CheckCircle2
} from 'lucide-react';
import api from '../../api/axios';

const PengangkutDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [greeting, setGreeting] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 18) setGreeting('Selamat Siang');
        else setGreeting('Selamat Malam');

        const fetchDashboard = async () => {
            try {
                const res = await api.get('/logs/riwayat-pengangkut');
                if (res.data.success) {
                    setHistory(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const todayLogs = history.filter(log =>
        log.createdAt?.startsWith(today)
    );

    const totalPoinHariIni = todayLogs.reduce((sum, log) => {
        try {
            const meta = JSON.parse(log.metadata || '{}');
            return sum + (meta.total_poin || 0);
        } catch {
            return sum;
        }
    }, 0);

    const jumlahAktivitas = todayLogs.length;

    const recentActivities = history.slice(0, 3);

    const stats = [
        {
            label: 'Poin Hari Ini',
            val: totalPoinHariIni.toLocaleString('id-ID'),
            sub: `${jumlahAktivitas} aktivitas`,
            icon: <Star />,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        },
        {
            label: 'Total Aktivitas',
            val: history.length,
            sub: 'Sepanjang waktu',
            icon: <Activity />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 space-y-6 pb-32 font-sans animate-in fade-in duration-700 text-left px-4">

            {/* --- 1. HEADER: GREETING & ARMADA --- */}
            <div className="pt-6 flex justify-between items-start">
                <div>
                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-1 italic">
                        {greeting}, Heroes!
                    </h4>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        {user?.username ? (
                            <>
                                Bpk. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                                    {user.username}
                                </span>
                            </>
                        ) : 'User'}
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-1">
                        <Award className="text-amber-500" size={24} fill="currentColor" />
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        Role: {user?.role || '-'}
                    </span>
                </div>
            </div>

            {/* --- 2. HERO CARD: ARMADA STATUS --- */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                            <Truck className="text-emerald-400" size={28} />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1 italic">Status Armada</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                <p className="text-xs font-black uppercase">On-Duty</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">ID Petugas</p>
                        <h2 className="text-4xl font-black tracking-tighter italic text-white drop-shadow-md">
                            {user?.kelurahan}-<span className="text-emerald-500">{user?.id_petugas}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <MapPin size={14} className="text-red-500" />
                            Sektor: {user?.kelurahan || '-'}
                        </div>
                    </div>
                </div>
                <Truck size={220} className="absolute -right-16 -bottom-16 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            </div>

            {/* --- 3. CORE ACTION: BIG BUTTON --- */}
            <button
                onClick={() => navigate('/pengangkut/monitoring')}
                className="w-full group bg-emerald-600 hover:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-900/20 transition-all active:scale-95 relative overflow-hidden"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white rounded-[1.8rem] shadow-lg text-emerald-600 group-hover:rotate-12 transition-transform">
                            <Plus size={32} strokeWidth={3} />
                        </div>
                        <div className="text-left text-white">
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Mulai Angkut</h3>
                            <p className="text-[10px] font-bold opacity-70 uppercase mt-1 tracking-widest">Input Poin Pemilahan WR</p>
                        </div>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                        <ChevronRight size={24} />
                    </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
            </button>

            {/* --- 4. KPI STATS GRID --- */}
            <div className="grid grid-cols-1 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                        <div className={`h-16 w-16 ${s.bg} ${s.color} rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(s.icon, { size: 28 })}
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">{s.val}</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1">
                                <Zap size={10} className="text-amber-500" fill="currentColor" /> {s.sub}
                            </p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                            <BarChart3 size={16} />
                        </div>
                    </div>
                ))}
            </div>

            {/* --- 5. RECENT ACTIVITY LIST --- */}
            <div className="space-y-4 pt-4 text-left">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 text-sm italic">
                        <History className="text-emerald-600" size={18} /> Aktivitas Terakhir
                    </h3>
                    <button onClick={() => navigate('/pengangkut/riwayat')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Lihat Laporan</button>
                </div>

                <div className="space-y-3">
                    {recentActivities.map((log, i) => {
                        let meta = {};
                        try {
                            meta = JSON.parse(log.metadata || '{}');
                        } catch { }

                        return (
                            <div key={log.id || i}
                                className="bg-white p-5 rounded-[2rem] border shadow-sm flex justify-between">

                                <div>
                                    <h4 className="font-black text-sm uppercase">
                                        {log.aksi}
                                    </h4>

                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {log.deskripsi}
                                    </p>

                                    <div className="text-[9px] text-slate-400 mt-2">
                                        {new Date(log.createdAt).toLocaleTimeString('id-ID')} WIB
                                    </div>
                                </div>

                                {/* <div className="text-right">
                                    <p className="text-emerald-600 font-black">
                                        +{meta.total_poin || 0}
                                    </p>
                                </div> */}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- 6. ECO QUOTE / INFO --- */}
            <div className="pt-6">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex items-center gap-4 relative overflow-hidden">
                    <Zap size={40} className="text-emerald-600/10 absolute -left-2 -bottom-2 rotate-12" fill="currentColor" />
                    <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase italic text-center w-full">
                        "Setiap sampah yang Anda pilah adalah <span className="text-emerald-600 font-black underline">Investasi Masa Depan</span> bagi Kabupaten Bogor."
                    </p>
                </div>
            </div>

        </div>
    );
};

// Internal Helper Icons
const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);

export default PengangkutDashboard;