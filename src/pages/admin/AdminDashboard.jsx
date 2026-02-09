import React, { useState } from 'react';
import {
    Users, ShieldCheck, Key, Settings2, Bell,
    Activity, ChevronRight, Server, Database,
    Send, X, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // State untuk interaksi
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [systemOnline, setSystemOnline] = useState(true);

    const stats = [
        { label: 'Total Staff UPT', val: '40', color: 'bg-blue-600', path: '/admin/staff' },
        { label: 'Staff Bidang DLH', val: '12', color: 'bg-green-600', path: '/admin/staff' },
        { label: 'Bendahara', val: '4', color: 'bg-indigo-600', path: '/admin/staff' },
        { label: 'Antrean Reset Password', val: '3', color: 'bg-red-500', path: '/admin/staff' },
    ];

    const logs = [
        { id: 1, user: 'Admin_Andi', action: 'Update NIP Pejabat', time: '2 menit lalu', type: 'settings' },
        { id: 2, user: 'UPT_Ciawi', action: 'Login ke Sistem', time: '5 menit lalu', type: 'auth' },
        { id: 3, user: 'Bendahara_1', action: 'Terbitkan 12 SSRD', time: '12 menit lalu', type: 'finance' },
    ];

    const handleSendBroadcast = (e) => {
        e.preventDefault();
        alert(`Pesan Broadcast Terkirim: ${broadcastMsg}`);
        setShowBroadcastModal(false);
        setBroadcastMsg('');
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">

            {/* --- TOP BAR: SYSTEM HEALTH --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${systemOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <Server size={24} className={systemOnline ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Status Sistem REKAS</h2>
                        <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${systemOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {systemOnline ? 'Server Bogor Cloud Online' : 'Server Maintenance'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                    >
                        <Bell size={14} /> Kirim Notifikasi Staff
                    </button>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(s.path)}
                        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl text-white ${s.color} shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                                <Users size={20} />
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{s.label}</p>
                        <p className="text-3xl font-black text-gray-800 mt-1 italic tracking-tighter">{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT: MAIN CONTROLS (8 COLS) --- */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customizing Format Card */}
                        <div className="bg-gradient-to-br from-green-700 to-green-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-green-900/20 flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic tracking-tighter leading-tight uppercase">Customizing <br />Format Surat</h3>
                                <p className="text-xs text-green-100/60 mt-3 font-medium">Update Logo, Alamat, dan NIP Pejabat untuk dokumen NPWRD, SKRD, & SSRD.</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="relative z-10 w-fit mt-8 bg-white text-green-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95"
                            >
                                Buka Konfigurasi
                            </button>
                            <Settings2 size={180} className="absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000" />
                        </div>

                        {/* Reset Password Summary */}
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-red-50 text-red-600 rounded-3xl">
                                    <Key size={28} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lupa Password</p>
                                    <p className="text-2xl font-black text-red-600 italic">3 Request</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-4 italic leading-relaxed">
                                Terdapat permintaan pemulihan akun dari Staff UPT. Segera verifikasi identitas staff sebelum memberikan akses.
                            </p>
                            <button
                                onClick={() => navigate('/admin/staff')}
                                className="mt-6 w-full py-4 bg-gray-50 text-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-gray-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                            >
                                Kelola Permintaan
                            </button>
                        </div>
                    </div>

                    {/* Database Health Card */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shrink-0">
                            <Database size={40} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Integritas Data Master</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">Sinkronisasi data Wajib Retribusi antara UPT dan DLH Pusat berjalan 100% akurat. Pencadangan terjadwal aktif.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Terakhir Backup</p>
                            <p className="text-xs font-bold text-gray-600 uppercase">Hari ini, 03:00 AM</p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: RECENT LOGS (4 COLS) --- */}
                <div className="lg:col-span-4 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="text-green-700 font-bold" size={20} />
                            <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">Aktivitas Staff</h3>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div className="p-2 flex-grow overflow-y-auto max-h-[500px] custom-scrollbar">
                        {logs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-gray-50 transition-all rounded-[2rem] flex items-start justify-between group">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 h-8 w-8 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-green-600 transition-colors shadow-sm">
                                        <ChevronRight size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{log.user}</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">{log.action}</p>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 group-hover:text-gray-500 uppercase">{log.time}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50 text-center">
                        <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Buka Detail Audit Log</button>
                    </div>
                </div>
            </div>

            {/* --- MODAL: BROADCAST MESSAGE --- */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-600 rounded-xl"><Bell size={20} /></div>
                                <h3 className="font-black uppercase tracking-widest text-sm">System Broadcast</h3>
                            </div>
                            <button onClick={() => setShowBroadcastModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSendBroadcast} className="p-10 space-y-6">
                            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                    Pesan ini akan muncul sebagai notifikasi di dashboard seluruh Staff (UPT, DLH, Bendahara) saat mereka login. Gunakan untuk info pemeliharaan sistem.
                                </p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Isi Pesan Notifikasi</label>
                                <textarea
                                    required
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Contoh: Server REKAS akan maintenance malam ini pukul 21:00 WIB..."
                                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-green-700/5 focus:border-green-700 font-bold text-sm min-h-[150px] transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-green-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-green-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Send size={18} /> Kirim Pengumuman
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;