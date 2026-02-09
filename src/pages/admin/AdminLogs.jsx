import React, { useState } from 'react';
import {
    Activity, Search, Filter, Download,
    User, Calendar, Clock, ChevronDown,
    Eye, ShieldAlert, Database, Banknote,
    Settings, Key, X, Info
} from 'lucide-react';

const AdminLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // Dummy Data Log Aktivitas yang mendetail
    const [logs] = useState([
        {
            id: 'LOG-8821',
            user: 'Siti Aminah',
            role: 'BENDAHARA',
            action: 'Menerbitkan SSRD #001/SSRD/2026',
            module: 'Keuangan',
            time: '14:20:05',
            date: '13 Jan 2026',
            ip: '192.168.1.45',
            detail: 'Penerbitan dokumen pelunasan retribusi untuk PT. MAJU JAYA SEJAHTERA (Nominal: Rp 500.000)'
        },
        {
            id: 'LOG-8819',
            user: 'Ahmad Subarjo',
            role: 'UPT CIBINONG',
            action: 'Pendaftaran NPWRD Baru',
            module: 'Data WR',
            time: '11:15:22',
            date: '13 Jan 2026',
            ip: '192.168.1.12',
            detail: 'Input data pendaftaran offline atas nama SUTISNA (Kategori: PRIBADI, Luas: 150m2)'
        },
        {
            id: 'LOG-8815',
            user: 'Admin_Andi',
            role: 'SUPER ADMIN',
            action: 'Mengubah NIP Pejabat',
            module: 'Sistem',
            time: '09:00:10',
            date: '13 Jan 2026',
            ip: '10.0.2.1',
            detail: 'Melakukan pembaruan NIP Pejabat Penandatangan dari 1970... menjadi 1978...'
        },
        {
            id: 'LOG-8810',
            user: 'Bidang_DLH_1',
            role: 'BIDANG/DLH',
            action: 'Menolak Bukti Bayar',
            module: 'Keuangan',
            time: '08:45:00',
            date: '13 Jan 2026',
            ip: '192.168.1.99',
            detail: 'Penolakan bukti bayar REQ-002. Alasan: Gambar struk tidak terbaca/buram.'
        },
    ]);

    const handleOpenDetail = (log) => {
        setSelectedLog(log);
        setShowDetail(true);
    };

    // Fungsi helper untuk icon berdasarkan modul
    const getModuleIcon = (module) => {
        switch (module) {
            case 'Keuangan': return <Banknote size={16} className="text-emerald-600" />;
            case 'Data WR': return <Database size={16} className="text-blue-600" />;
            case 'Sistem': return <Settings size={16} className="text-purple-600" />;
            default: return <Activity size={16} className="text-gray-600" />;
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Audit Trail Sistem</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Rekam jejak seluruh aktivitas operasional Staff.</p>
                </div>
                <button className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all">
                    <Download size={16} /> Export Log (.xlsx)
                </button>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-600" size={20} />
                    <input
                        type="text"
                        placeholder="Cari ID Log, Nama Staff, atau tindakan..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select className="appearance-none bg-slate-50 border-none rounded-2xl pl-6 pr-12 py-4 text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer">
                            <option>Semua Modul</option>
                            <option>Keuangan</option>
                            <option>Data WR</option>
                            <option>Sistem</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* --- LOG TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-800">
                            <tr>
                                <th className="p-6">Waktu & Tanggal</th>
                                <th className="p-6">Pelaku (Staff)</th>
                                <th className="p-6">Aktivitas</th>
                                <th className="p-6">Modul</th>
                                <th className="p-6 text-center">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-all">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{log.time}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                                                {log.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.user}</p>
                                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{log.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-slate-700 leading-relaxed">{log.action}</p>
                                        <p className="text-[9px] text-slate-400 font-mono">IP: {log.ip}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                                            {getModuleIcon(log.module)}
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{log.module}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button
                                            onClick={() => handleOpenDetail(log)}
                                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: DETAIL LOG METADATA --- */}
            {showDetail && selectedLog && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Info size={24} /></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none">Detail Audit Log</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-[0.2em]">{selectedLog.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-500"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-8">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Kejadian</p>
                                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                        <Clock size={14} className="text-blue-500" />
                                        {selectedLog.time} / {selectedLog.date}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat IP Pelaku</p>
                                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm font-mono">
                                        <ShieldAlert size={14} className="text-red-500" />
                                        {selectedLog.ip}
                                    </div>
                                </div>
                            </div>

                            {/* Deskripsi Aksi */}
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3">Narasi Aktivitas Sistem:</p>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                        "{selectedLog.detail}"
                                    </p>
                                </div>
                                <Activity className="absolute -right-6 -bottom-6 text-slate-200/50" size={100} />
                            </div>

                            <button
                                onClick={() => setShowDetail(false)}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95"
                            >
                                Tutup Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;