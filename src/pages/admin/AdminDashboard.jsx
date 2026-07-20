import React, { useState, useEffect } from 'react';
import {
    Users, Key, Settings2, Bell,
    Activity, ChevronRight, Server, Database,
    Zap, Clock, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Set Greeting dinamis
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 18) setGreeting('Selamat Siang');
        else setGreeting('Selamat Malam');

        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/report/admin-stats');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error("Gagal load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin"></div>
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 animate-pulse" size={24} />
            </div>
            Menyinkronkan Core Engine...
        </div>
    );

    const kpi = [
        { label: 'Staff UPT', val: data.counts.upt, color: 'from-blue-600 to-blue-400', icon: Users },
        { label: 'Staff DLH', val: data.counts.dlh, color: 'from-emerald-600 to-teal-400', icon: ShieldCheck },
        { label: 'Bendahara', val: data.counts.bendahara, color: 'from-indigo-600 to-violet-400', icon: BanknoteIcon },
        { label: 'Pendaftaran Pending', val: data.counts.pending_subjek, color: 'from-orange-600 to-amber-400', icon: Clock },
    ];

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans text-left">

            {/* --- 1. WELCOME & SYSTEM HEALTH --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h4 className="text-[10px] font-black text-green-700 uppercase tracking-[0.3em] mb-1 ">{greeting}, Administrator</h4>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                        Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500">Center</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative">
                        <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg">
                            <Server size={20} />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Server Status</p>
                        <p className="text-xs font-black text-slate-800 uppercase leading-none">Cloud-Bogor Online</p>
                    </div>
                </div>
            </div>

            {/* --- 2. KPI GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpi.map((s, i) => (
                    <div key={i} className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
                        <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12`}>
                            <s.icon size={120} />
                        </div>

                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-xl group-hover:rotate-12 transition-transform`}>
                                <s.icon size={20} />
                            </div>
                            {/* <div className="bg-slate-50 p-2 rounded-lg text-slate-300 group-hover:text-slate-900 transition-colors">
                                <ArrowUpRight size={14} />
                            </div> */}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-black text-slate-900  tracking-tighter">{s.val}</p>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Live Data</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- 3. MAIN WORKSPACE (LEFT) --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Hero Action Card */}
                    <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-4 border-slate-900">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 rounded-full blur-[100px] group-hover:bg-green-600/40 transition-all duration-1000"></div>

                        <div className="relative z-10 max-w-md space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest">
                                <Zap size={12} fill="currentColor" /> System Customizer
                            </div>
                            <h3 className="text-3xl font-black  tracking-tighter leading-none uppercase">
                                Personalisasi <br /> Atribut Dokumen
                            </h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Kelola identitas visual SKRD, SSRD, dan TTD Digital Pejabat pengesahan dalam satu pintu.
                            </p>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="group bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5 flex items-center gap-3"
                            >
                                Buka Pengaturan <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <Settings2 size={300} className="absolute -right-20 -bottom-20 text-white/[0.02] group-hover:rotate-45 transition-transform duration-[3000ms]" />
                    </div>

                    {/* Secondary Data Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-500 transition-all">
                            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <Database size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Aset (NPOR)</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{data.counts.total_objek.toLocaleString()} <span className="text-xs font-bold text-slate-300 font-sans tracking-normal">Terdaftar</span></h4>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-orange-500 transition-all">
                            <div className="h-16 w-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                                <Activity size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Check</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">100% <span className="text-xs font-bold text-slate-300 font-sans tracking-normal ">Optimized</span></h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. TIMELINE LOGS (RIGHT) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full border-b-4 border-b-green-600">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Activity className="text-slate-900" size={20} />
                                <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.2em]">Audit Trail</h3>
                            </div>
                            <span className="text-[9px] font-black bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-400">Terbaru</span>
                        </div>

                        <div className="p-4 flex-grow overflow-y-auto max-h-[500px] custom-scrollbar">
                            <div className="space-y-2">
                                {data.recentLogs.map((log, idx) => (
                                    <div key={log.id_log} className="p-5 hover:bg-slate-50 transition-all rounded-[1.8rem] flex items-start gap-4 group border border-transparent hover:border-slate-100">
                                        <div className="mt-1 flex flex-col items-center">
                                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                            <div className="w-[1px] h-10 bg-slate-100 mt-2"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{log.role}</span>
                                                <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-green-700 transition-colors">
                                                {log.aksi.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1  line-clamp-1">{log.deskripsi}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
                            <button onClick={() => navigate('/admin/logs')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-green-700 transition-colors flex items-center justify-center gap-2 mx-auto">
                                Lihat Seluruh Jejak Audit <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper internal untuk Icon yang belum diimport
const BanknoteIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
    </svg>
);

export default AdminDashboard;