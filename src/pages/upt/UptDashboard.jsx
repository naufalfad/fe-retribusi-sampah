import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Building2, Home,
    ArrowUpRight, Loader2, Zap,
    Layers, ClipboardCheck, History,
    Navigation, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const UptDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 18) setGreeting('Selamat Siang');
        else setGreeting('Selamat Malam');

        const fetchUptData = async () => {
            try {
                const res = await api.get('/report/upt-stats');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Gagal load dashboard UPT:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUptData();
    }, []);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={24} />
            </div>
            Sinkronisasi Data Unit...
        </div>
    );

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans text-left">

            {/* --- 1. WELCOME & QUICK ACTION --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1 italic">
                        {greeting}, Petugas Pelayanan
                    </h4>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Unit <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-500">Workspace</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-2">Monitor produktivitas pendaftaran Wajib Retribusi wilayah Anda.</p>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => navigate('/upt/daftar-user')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        <UserPlus size={18} /> Pendaftaran Baru
                    </button>
                </div>
            </div>

            {/* --- 2. MAIN KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    label="Wajib Retribusi"
                    val={data.summary.total_subjek}
                    sub="Subjek Terdata"
                    icon={Users}
                    color="bg-blue-600"
                />
                <KpiCard
                    label="Total Objek"
                    val={data.summary.total_objek}
                    sub="Aset Terdaftar"
                    icon={Layers}
                    color="bg-emerald-600"
                />
                <KpiCard
                    label="Pribadi"
                    val={data.kategori.find(k => k.kategori_subjek === 'Pribadi')?.jumlah || 0}
                    sub="Rumah Tinggal"
                    icon={Home}
                    color="bg-indigo-600"
                />
                <KpiCard
                    label="Badan Usaha"
                    val={data.kategori.find(k => k.kategori_subjek === 'Badan')?.jumlah || 0}
                    sub="Komersial/Industri"
                    icon={Building2}
                    color="bg-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- 3. RECENT REGISTRATIONS (LEFT) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                            <History className="text-blue-600" size={20} /> Inputan Terakhir Anda
                        </h3>
                        <button onClick={() => navigate('/upt/list')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {data.recentSubjek.map((subjek) => (
                            <div key={subjek.id_subjek} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${subjek.kategori_subjek === 'Pribadi' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                        {subjek.kategori_subjek === 'Pribadi' ? <Home size={20} /> : <Building2 size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 uppercase text-sm leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                            {subjek.nama_subjek}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">NPWRD: {subjek.npwrd_subjek}</span>
                                            <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{subjek.Objeks?.length || 0} Objek</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Terdaftar Pada</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">
                                        {new Date(subjek.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- 4. TOP CATEGORIES & INFO (RIGHT) --- */}
                <div className="lg:col-span-4 space-y-6 text-left">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="text-amber-500" size={20} fill="currentColor" />
                            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.2em]">Klasifikasi Terbanyak</h3>
                        </div>

                        <div className="space-y-6 flex-grow">
                            {data.topKelas.map((kelas, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight max-w-[150px] truncate">{kelas.nama_kelas}</p>
                                        <p className="text-xs font-black text-slate-800">{kelas.jumlah} Unit</p>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${(kelas.jumlah / data.summary.total_objek) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 relative overflow-hidden group">
                            <Navigation className="absolute -right-4 -bottom-4 text-blue-600/10 group-hover:scale-110 transition-transform" size={100} />
                            <p className="relative z-10 text-[10px] font-bold text-blue-700 leading-relaxed uppercase italic">
                                Seluruh data koordinat diproses menggunakan engine <b>PostGIS 4326</b> untuk akurasi pemetaan wilayah kerja.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for KPI
const KpiCard = ({ label, val, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
        <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700`}>
            <Icon size={100} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-12 transition-transform`}>
                <Icon size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{val}</h3>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">{sub}</p>
        </div>
    </div>
);

export default UptDashboard;