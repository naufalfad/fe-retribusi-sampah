import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Search, Key, Trash2, ShieldCheck, MapPin,
    X, Mail, User, AlertTriangle, MoreHorizontal,
    CheckCircle2, Info, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { debounce } from 'lodash';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';

const AdminStaff = () => {
    // --- STATES ---
    const [activeTab, setActiveTab] = useState('staff');
    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customPassword, setCustomPassword] = useState('');
    const [showPasswordText, setShowPasswordText] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'UPT',
        kelurahan: 'Pakansari'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const endpoint = activeTab === 'staff' ? '/auth/register-staff' : '/auth/register-penagih';
            const payload = activeTab === 'staff'
                ? { username: formData.username, password: formData.password, role: formData.role }
                : { username: formData.username, password: formData.password, kelurahan: formData.kelurahan };

            const res = await api.post(endpoint, payload);

            if (res.status === 201) {
                alert("Staff berhasil didaftarkan!");
                setShowAddModal(false);
                setFormData({ username: '', password: '', role: 'UPT' });
                fetchStaff(1, searchTerm);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal mendaftarkan staff");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- API INTEGRATION ---
    const fetchStaff = async (page = 1, search = '') => {
        setLoading(true);
        try {
            // Ganti endpoint secara dinamis
            const endpoint = activeTab === 'staff' ? '/auth/list-staff' : '/auth/list-penagih';
            const res = await api.get(endpoint, {
                params: { page, limit: 10, search }
            });

            if (res.data.status === 'success') {
                setStaffList(res.data.data);
                setPagination(res.data.pagination || {
                    current_page: 1,
                    total_pages: 1,
                    total_items: res.data.data.length
                });
            }
        } catch (err) {
            console.error("Gagal mengambil data:", err);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = useCallback(
        debounce((val) => fetchStaff(1, val, activeTab), 500),
        [activeTab]
    );

    useEffect(() => {
        const page = pagination?.current_page || 1;
        fetchStaff(page, searchTerm);
    }, [pagination?.current_page, activeTab]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleAction = (type, staff) => {
        setSelectedStaff(staff);
        if (type === 'reset') setShowResetModal(true);
        if (type === 'delete') setShowDeleteModal(true);
    };

    const confirmReset = async () => {
        if (!selectedStaff || !customPassword) {
            alert("Silakan masukkan password baru.");
            return;
        }

        if (customPassword.length < 6) {
            alert("Password minimal 6 karakter.");
            return;
        }

        setIsProcessing(true);
        try {
            const endpoint = activeTab === 'staff'
                ? `/auth/reset-password-staff/${selectedStaff.id_staff}`
                : `/auth/reset-password-penagih/${selectedStaff.id_penagih}`;

            const response = await api.put(endpoint, {
                newPassword: customPassword
            });

            if (response.data.success) {
                alert(response.data.message);
                setShowResetModal(false);
                setCustomPassword('');
                setSelectedStaff(null);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal mereset password.");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedStaff) return;

        setIsProcessing(true);
        try {
            const endpoint = activeTab === 'staff'
                ? `/auth/delete-staff/${selectedStaff.id_staff}`
                : `/auth/delete-penagih/${selectedStaff.id_penagih}`;

            const response = await api.delete(endpoint);

            if (response.data.success) {
                alert(response.data.message);
                setShowDeleteModal(false);
                setSelectedStaff(null);
                fetchStaff(1, searchTerm);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal menghapus staff.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Otoritas Staff</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-widest italic">Pusat Kendali Akun REKAS</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="group bg-green-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-900/20 hover:bg-black transition-all active:scale-95"
                >
                    <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                    Tambah Staff Baru
                </button>
            </div>
            <div className="flex p-1 bg-gray-100 rounded-2xl w-fit border border-gray-200">
                <button
                    onClick={() =>
                        setActiveTab('staff')}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'staff' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}
                >
                    INTERNAL STAFF
                </button>
                <button
                    onClick={() => {
                        setActiveTab('penagih');
                        setSearchTerm('');
                        fetchStaff(1, '', 'penagih')
                    }}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'penagih' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}
                >
                    PETUGAS PENAGIH
                </button>
            </div>
            {/* --- TOOLBAR --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari username staff..."
                        className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 bg-slate-50 rounded-2xl border border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={14} /> Total: {pagination.total_items}
                </div>
            </div>

            {/* --- STAFF TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                            <tr>
                                <th className="p-8">Nama Lengkap / Username</th>
                                <th className="p-8">{activeTab === 'staff' ? 'Hak Akses (Role)' : 'Wilayah Tugas'}</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-center">Keamanan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-green-700" size={32} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Menghubungkan ke Server...</p>
                                    </td>
                                </tr>
                            ) : staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-gray-400 uppercase text-xs font-black tracking-widest">Staff Tidak Ditemukan</td>
                                </tr>
                            ) : staffList.map((s) => (
                                <tr key={s.id_staff || s.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-green-100 group-hover:text-green-700 transition-all">
                                                {s.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{s.username}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-gray-400">
                                                    <Mail size={10} /> {s.email || '-'}
                                                    <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                    <User size={10} /> {s.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        {activeTab === 'staff' ? (
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 w-fit px-3 py-1.5 rounded-xl font-black text-[10px] uppercase border border-blue-100">
                                                <ShieldCheck size={12} /> {s.role}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-green-50 text-green-700 w-fit px-3 py-1.5 rounded-xl font-black text-[10px] uppercase border border-green-100">
                                                <MapPin size={12} /> {s.kelurahan}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-8">
                                        <StatusBadge status={s.status || 'Aktif'} />
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className="relative h-10 flex items-center justify-center">

                                            {/* 1. IKON TITIK TIGA (Default) */}
                                            <div className="transition-all duration-200 group-hover:opacity-0 group-hover:scale-50">
                                                <MoreHorizontal className="mx-auto text-gray-300" />
                                            </div>

                                            {/* 2. TOMBOL AKSI (Muncul saat Hover) */}
                                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION FOOTER --- */}
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Halaman {pagination.current_page} Dari {pagination.total_pages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1}
                            onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                            className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-black hover:text-white transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={pagination.current_page === pagination.total_pages}
                            onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                            className="p-3 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-black hover:text-white transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODALS (Add & Reset Tetap Sama Namun Data Dinamis) --- */}
            {/* Modal Tambah Staff (Add form logic here) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <form
                        onSubmit={handleCreateStaff}
                        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
                    >
                        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-900/20"><UserPlus size={24} /></div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none">Registrasi Staff Baru</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Otorisasi REKAS</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* USERNAME */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                    <input
                                        required
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        type="text"
                                        placeholder="username"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-sm"
                                    />
                                </div>

                                {/* ROLE (Sesuai dengan enum backend: Admin, UPT, DLH, Bendahara) */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        {activeTab === 'staff' ? 'Role Akun' : 'Wilayah Tugas'}
                                    </label>
                                    {activeTab === 'staff' ? (
                                        <select
                                            name="role" value={formData.role}
                                            onChange={handleInputChange}
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-xs uppercase tracking-widest"
                                        >
                                            <option value="UPT">UPT</option>
                                            <option value="DLH">Bidang DLH</option>
                                            <option value="Bendahara">Bendahara</option>
                                            <option value="Admin">Administrator</option>
                                        </select>
                                    ) : (
                                        <select
                                            name="kelurahan" value={formData.kelurahan}
                                            onChange={handleInputChange}
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-xs uppercase tracking-widest"
                                        >
                                            <option value="Pakansari">Pakansari</option>
                                            <option value="Cibinong">Cibinong</option>
                                            <option value="Sukahati">Sukahati</option>
                                        </select>
                                    )}
                                </div>

                                {/* PASSWORD */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                    <input
                                        required
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        type="password"
                                        placeholder="Minimal 6 karakter..."
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-700 font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                                <Info className="text-blue-600 shrink-0" size={20} />
                                <p className="text-[10px] text-blue-800 font-medium leading-relaxed italic uppercase tracking-tighter">
                                    Pastikan data sudah benar. Password ini akan digunakan staff untuk login pertama kali sebelum mereka mengubahnya secara mandiri.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-8 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600"
                            >
                                Batalkan
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="px-12 py-4 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : null}
                                {isProcessing ? 'Memproses...' : 'Buat Akun Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showResetModal && selectedStaff && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 relative overflow-hidden text-center">

                        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto border border-amber-100">
                            <Key size={36} />
                        </div>

                        <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Set Password Baru</h3>
                        <p className="text-sm text-gray-400 mt-2 font-medium">
                            Mengubah akses untuk staff: <br />
                            <span className="text-slate-800 font-black uppercase tracking-widest">{selectedStaff?.username}</span>
                        </p>

                        <div className="mt-8 w-full space-y-4 text-left">
                            {/* INPUT PASSWORD KUSTOM */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Masukkan Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPasswordText ? "text" : "password"}
                                        value={customPassword}
                                        onChange={(e) => setCustomPassword(e.target.value)}
                                        placeholder="Min. 6 Karakter"
                                        className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-amber-500 font-bold text-lg tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordText(!showPasswordText)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors"
                                    >
                                        {showPasswordText ? "Sembunyikan" : "Lihat"}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 italic text-[10px] text-amber-800">
                                <Info size={16} className="shrink-0" />
                                <p>Hati-hati: Perubahan ini akan langsung memutuskan sesi login staff yang bersangkutan.</p>
                            </div>

                            <button
                                onClick={confirmReset}
                                disabled={isProcessing || customPassword.length < 6}
                                className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Simpan Password Baru
                            </button>

                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setCustomPassword('');
                                }}
                                disabled={isProcessing}
                                className="w-full py-2 text-gray-400 font-bold uppercase text-[9px] tracking-widest hover:text-red-500 transition-colors"
                            >
                                Batalkan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedStaff && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 relative overflow-hidden text-center">

                        {/* Dekorasi Background */}
                        <Trash2 size={120} className="absolute -right-10 -top-10 text-red-50 opacity-50" />

                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto border border-red-100 shadow-inner">
                            <AlertTriangle size={36} />
                        </div>

                        <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Hapus Akun Staff?</h3>

                        <div className="mt-4 p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Akun yang akan dihapus:</p>
                            <p className="text-lg font-black text-red-600 uppercase tracking-tight">{selectedStaff.username}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">{selectedStaff.email || 'No Email Registered'}</p>
                        </div>

                        <p className="text-xs text-gray-400 mt-6 font-medium leading-relaxed italic">
                            Tindakan ini bersifat <span className="text-red-600 font-bold uppercase">Permanen</span>. Seluruh data akses staff ini akan dicabut dan tidak dapat dipulihkan kembali.
                        </p>

                        <div className="mt-10 w-full space-y-3">
                            <button
                                onClick={confirmDelete}
                                disabled={isProcessing}
                                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-600/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
                                Ya, Hapus Permanen
                            </button>

                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedStaff(null);
                                }}
                                disabled={isProcessing}
                                className="w-full py-4 text-gray-400 font-bold uppercase text-[9px] tracking-widest hover:text-gray-800 transition-colors"
                            >
                                Batalkan, Simpan Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaff;