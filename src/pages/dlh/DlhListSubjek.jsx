import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, UserPlus, PlusSquare, Building2,
    User, Eye, MapPin, Layers, X, Loader2, Printer
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
                                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-black text-xs">
                                                <Layers size={14} /> {wr.Objeks?.length || 0} Aset
                                            </div>
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
                                                <button
                                                    onClick={() => handleViewDetails(wr)}
                                                    className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Eye size={18} />
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-700 text-white rounded-2xl">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 uppercase leading-none">Daftar Objek Terdaftar</h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase italic">{selectedWR.nama_subjek}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-red-500">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 bg-gray-100/50">
                            {selectedWR.Objeks && selectedWR.Objeks.length > 0 ? (
                                selectedWR.Objeks.map((obj, index) => (
                                    <div key={obj.id_objek} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-green-500 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-green-50 group-hover:text-green-700">
                                                0{index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-800 uppercase text-sm mb-1">{obj.nama_objek}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                                    <MapPin size={12} /> {obj.alamat_objek}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Luas</p>
                                            <p className="text-sm font-black text-green-700">{obj.luas_objek || 0} m²</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400 italic font-bold uppercase text-xs">Belum ada objek terdaftar.</div>
                            )}
                        </div>

                        <div className="p-8 border-t bg-white flex justify-end">
                            <button onClick={() => setShowModal(false)} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase">Tutup</button>
                        </div>
                        {/* Footer Modal */}
                        <div className="p-8 border-t bg-white flex justify-between items-center px-10">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                <ShieldCheck size={16} />
                                <p className="text-[10px] font-bold uppercase italic tracking-tighter">Cetak kartu otomatis memperbarui password akses WR.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 text-gray-400 font-bold text-xs uppercase"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        handlePrintCard(selectedWR.id_subjek);
                                    }}
                                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-amber-600 transition-all active:scale-95"
                                >
                                    <Printer size={18} /> Cetak Kartu NPWRD
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