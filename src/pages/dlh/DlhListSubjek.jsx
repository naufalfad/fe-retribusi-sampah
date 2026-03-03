import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, UserPlus, PlusSquare, Building2, Navigation, Home,
    User, Phone, MapPin, Layers, X, Loader2, Printer, ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';

const DlhListSubjek = () => {
    const navigate = useNavigate();

    // State Data
    const [subjekList, setSubjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State UI & Filter
    const [showModal, setShowModal] = useState(false);
    const [selectedWR, setSelectedWR] = useState(null);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1
    });

    // 1. Fungsi Fetch Data dari API
    const fetchSubjek = async (page = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const response = await api.get('/subjek/list-subjek', {
                params: {
                    page: page,
                    limit: 10,
                    search: searchQuery
                }
            });

            if (response.data.status === 'success') {
                setSubjekList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            setError('Gagal mengambil data subjek');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Lifecycle: Jalankan fetch saat pertama kali load atau saat search berubah
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchSubjek(1, search);
        }, 500); // Debounce 500ms agar tidak spam API saat mengetik

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleViewDetails = (wr) => {
        setSelectedWR(wr);
        setShowModal(true);
    };

    const handlePrintCard = async (id_subjek) => {
        // Beri peringatan karena cetak kartu akan merubah password user
        const confirmPrint = window.confirm(
            "Mencetak kartu akan me-reset password akun ini dan menggantinya dengan yang baru di dalam kartu. Lanjutkan?"
        );

        if (!confirmPrint) return;

        try {
            const response = await api.get(`/subjek/pdf/${id_subjek}`, {
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');

            fetchSubjek(pagination.current_page, search);
        } catch (err) {
            alert("Gagal memproses cetak kartu. Silakan cek koneksi API.");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">List Subjek Retribusi</h1>
                    <p className="text-sm text-gray-500 font-medium font-sans">Kelola subjek retribusi terverifikasi.</p>
                </div>
                <button onClick={() => navigate('/dlh/daftar-user')} className="flex items-center gap-2 bg-green-700 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all text-sm">
                    <UserPlus size={18} /> Daftar Baru
                </button>
            </div>

            {/* Toolbar: Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari Nama Subjek..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabel List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Data Subjek (NPWRD)</th>
                                <th className="p-6">Kategori</th>
                                <th className="p-6 text-center">Jumlah Objek</th>
                                <th className="p-6">NIK</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-green-700" size={40} />
                                        <p className="mt-4 text-gray-500 font-bold">Memuat Data...</p>
                                    </td>
                                </tr>
                            ) : subjekList.length > 0 ? (
                                subjekList.map((wr) => (
                                    <tr key={wr.id_subjek} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 group-hover:bg-green-100 group-hover:text-green-700 transition-all">
                                                    {wr.kategori_subjek === 'Pribadi' ? <User size={20} /> : <Building2 size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 text-sm uppercase mb-1">{wr.nama_subjek}</p>
                                                    <p className="font-mono text-xs text-green-700 font-bold">{wr.npwrd_subjek || 'BELUM ADA NPWRD'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs font-bold text-gray-500 uppercase italic">
                                            {wr.kategori_subjek}
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleViewDetails(wr)}
                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-95"
                                                title="Klik untuk lihat detail objek"
                                            >
                                                <Layers size={14} /> {wr.Objeks?.length || 0} Objek
                                            </button>
                                        </td>
                                        <td className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            {wr.nik_subjek}
                                        </td>
                                        <td className="p-6">
                                            <StatusBadge status={wr.status || 'Aktif'} />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => navigate('/dlh/daftar-objek/' + wr.id_subjek)}
                                                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-md"
                                                >
                                                    <PlusSquare size={14} /> Tambah Objek
                                                </button>
                                                <button
                                                    onClick={() => handlePrintCard(wr.id_subjek)}
                                                    className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100"
                                                    title="Cetak Kartu NPWRD (Reset Password)"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center text-gray-400 italic font-bold">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && subjekList.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={pagination.current_page === 1}
                        onClick={() => fetchSubjek(pagination.current_page - 1, search)}
                        className="px-4 py-2 bg-white border rounded-xl disabled:opacity-50 font-bold text-xs"
                    >
                        Prev
                    </button>
                    <span className="px-4 py-2 font-bold text-xs">Hal {pagination.current_page} dari {pagination.total_pages}</span>
                    <button
                        disabled={pagination.current_page === pagination.total_pages}
                        onClick={() => fetchSubjek(pagination.current_page + 1, search)}
                        className="px-4 py-2 bg-white border rounded-xl disabled:opacity-50 font-bold text-xs"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* MODAL DETAIL OBJEK */}
            {showModal && selectedWR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        {/* Header Modal */}
                        <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-900/20 text-white">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm leading-none">Aset & Objek Retribusi</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-[0.2em]">Pemilik: {selectedWR.nama_subjek}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body Modal: List Card Objek */}
                        <div className="p-8 overflow-y-auto space-y-4 bg-gray-50/50 custom-scrollbar">
                            {selectedWR.Objeks && selectedWR.Objeks.length > 0 ? (
                                selectedWR.Objeks.map((obj, index) => (
                                    <div key={obj.id_objek} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group relative overflow-hidden">
                                        {/* Dekorasi Background */}
                                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                                            {obj.kategori_objek === 'Pribadi' ? <User size={120} /> : <Building2 size={120} />}
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                            {/* Info Utama */}
                                            <div className="flex gap-5">
                                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${obj.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {obj.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={28} /> : <Home size={28} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">NPOR: {obj.npor_objek}</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${obj.status_objek === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {obj.status_objek}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-slate-800 uppercase text-base tracking-tight">{obj.nama_objek}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold uppercase">
                                                        <span className="flex items-center gap-1"><MapPin size={12} className="text-red-500" /> {obj.alamat_objek}, RT {obj.rt_rw_objek}</span>
                                                        <span className="flex items-center gap-1"><Navigation size={12} /> {obj.kelurahan_objek}, {obj.kecamatan_objek}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Keuangan & Kontak */}
                                            <div className="flex flex-row md:flex-col justify-between md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tarif Pokok / Bln</p>
                                                    <p className="text-lg font-black text-green-700 tracking-tighter">
                                                        Rp {Number(obj.tarif_pokok_objek).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center md:justify-end gap-2 text-[10px] font-bold text-slate-500 mt-2">
                                                    <Phone size={12} className="text-blue-500" /> {obj.telepon_objek || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                        <Layers size={40} />
                                    </div>
                                    <p className="text-gray-400 italic font-black uppercase text-xs tracking-[0.2em]">Belum ada objek terdaftar pada subjek ini.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-8 border-t bg-white flex flex-col md:flex-row justify-between items-center gap-4 px-10">
                            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
                                <ShieldCheck size={20} />
                                <div>
                                    <p className="text-[10px] font-black uppercase leading-none">Security Protocol</p>
                                    <p className="text-[9px] font-bold opacity-80 mt-0.5">Cetak kartu otomatis memperbarui password akses WR.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 md:flex-none px-8 py-4 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        handlePrintCard(selectedWR.id_subjek);
                                    }}
                                    className="flex-1 md:flex-none bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-green-700 transition-all active:scale-95 shadow-slate-900/20"
                                >
                                    <Printer size={18} /> Cetak Kartu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DlhListSubjek;