import React, { useState } from 'react';
import {
    UserPlus, Search, Key, Trash2, ShieldCheck,
    X, Mail, User, MapPin, ChevronDown,
    Filter, MoreHorizontal, CheckCircle2, AlertTriangle, Info,
    Loader2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const AdminStaff = () => {
    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dummy Data Staff
    const [staffList, setStaffList] = useState([
        { id: 1, nama: 'Ahmad Subarjo', role: 'UPT CIBINONG', email: 'ahmad@siresik.id', username: 'upt_cibinong_1', status: 'Aktif' },
        { id: 2, nama: 'Siti Aminah', role: 'BENDAHARA', email: 'siti@siresik.id', username: 'treasurer_01', status: 'Aktif' },
        { id: 3, nama: 'Budi Santoso', role: 'BIDANG DLH', email: 'budi@siresik.id', username: 'dlh_pusat_budi', status: 'Aktif' },
    ]);

    // --- HANDLERS ---
    const handleAction = (type, staff) => {
        setSelectedStaff(staff);
        if (type === 'reset') setShowResetModal(true);
        if (type === 'delete') setShowDeleteModal(true);
    };

    const confirmReset = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowResetModal(false);
            alert(`Password ${selectedStaff.nama} berhasil direset ke default: RESIK123!`);
        }, 1500);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Otoritas Staff</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">Manajemen akun petugas operasional REKAS.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group bg-green-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-900/20 hover:bg-black transition-all active:scale-95"
                >
                    <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                    Tambah Staff Baru
                </button>
            </div>

            {/* --- TOOLBAR: SEARCH & FILTER --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau username staff..."
                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select className="appearance-none bg-gray-50 border-2 border-gray-50 rounded-2xl pl-6 pr-12 py-4 text-xs font-black uppercase tracking-widest text-gray-600 outline-none focus:border-green-700 cursor-pointer">
                            <option>Semua Role</option>
                            <option>UPT Wilayah</option>
                            <option>Bidang DLH</option>
                            <option>Bendahara</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* --- STAFF TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                            <tr>
                                <th className="p-8">Nama Lengkap / Username</th>
                                <th className="p-8">Hak Akses (Role)</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-center">Tindakan Keamanan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffList.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-green-100 group-hover:text-green-700 transition-all">
                                                {s.nama.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{s.nama}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-gray-400">
                                                    <Mail size={10} /> {s.email}
                                                    <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                    <User size={10} /> @{s.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 w-fit px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100">
                                            <ShieldCheck size={12} /> {s.role}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <StatusBadge status={s.status} />
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleAction('reset', s)}
                                                className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Reset Password"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction('delete', s)}
                                                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Hapus Akun"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <MoreHorizontal className="mx-auto text-gray-300 group-hover:hidden" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: TAMBAH STAFF BARU --- */}
            {showAddModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-900/20"><UserPlus size={24} /></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none">Registrasi Staff Baru</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Otorisasi REKAS</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input type="text" placeholder="Contoh: Andi Wijaya" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Akun</label>
                                    <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-xs uppercase tracking-widest">
                                        <option>UPT WILAYAH</option>
                                        <option>BIDANG DLH</option>
                                        <option>BENDAHARA</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                    <input type="text" placeholder="username_si_resik" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Resmi</label>
                                    <input type="email" placeholder="staff@siresik.id" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-sm" />
                                </div>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                                <Info className="text-blue-600 shrink-0" size={20} />
                                <p className="text-[10px] text-blue-800 font-medium leading-relaxed italic uppercase tracking-tighter">
                                    Password default akan dikirim secara otomatis ke email staff yang didaftarkan setelah akun berhasil diverifikasi.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-8 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600">Batalkan</button>
                            <button className="px-12 py-4 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95">Buat Akun Sekarang</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: RESET PASSWORD (INTERAKTIF) --- */}
            {showResetModal && selectedStaff && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                        {/* Aksen visual dibelakang */}
                        <Key size={150} className="absolute -right-10 -top-10 text-slate-50 rotate-12" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-amber-100">
                                <Key size={36} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-tight">Reset Akses Akun</h3>
                            <p className="text-sm text-gray-400 mt-2 font-medium px-4 leading-relaxed">
                                Berikan akses darurat untuk staff <br />
                                <span className="text-slate-800 font-black uppercase tracking-widest">{selectedStaff.nama}</span>
                            </p>

                            <div className="mt-10 w-full space-y-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Password Sementara</p>
                                    <p className="text-2xl font-mono font-black text-green-700 tracking-[0.3em]">RESIK123!</p>
                                </div>
                                <button
                                    onClick={confirmReset}
                                    disabled={isProcessing}
                                    className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Konfirmasi Reset
                                </button>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="w-full py-4 text-gray-400 font-bold uppercase text-[9px] tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Batalkan Aksi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaff;