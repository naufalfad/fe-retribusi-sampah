import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Printer, FileText,
    AlertCircle, CheckCircle2,
    Download, Calendar, Pen, Loader2, ChevronLeft, ChevronRight, Paperclip, User
} from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';
import ObjekDetailModal from './components/ObjekDetailModal';
import SkrdDocumentModal from './components/SkrdPreviewModal';

const DlhListSkrd = () => {
    // --- STATES ---
    const [skrdList, setSkrdList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: 10
    });

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSkrdModal, setShowSkrdModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // --- FETCH DATA FROM API ---
    const fetchSkrd = useCallback(async (page = 1, search = '', status = 'ALL') => {
        setLoading(true);
        try {
            const response = await api.get('/skrd/list-skrd', {
                params: {
                    page: page,
                    limit: 10,
                    search: search,
                    status: status === 'ALL' ? '' : status.toLowerCase()
                }
            });
            if (response.data.status === 'success') {
                setSkrdList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Gagal mengambil daftar SKRD:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect untuk Search & Filter
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchSkrd(1, searchTerm, filterStatus);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, filterStatus, fetchSkrd]);

    const handleViewSkrdDocument = (data) => {
        setSelectedData(data);
        setShowSkrdModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            fetchSkrd(newPage, searchTerm, filterStatus);
        }
    };

    const handleCetakSkrd = (skrd) => {
        if (!skrd?.id_skrd) {
            alert("ID SKRD tidak ditemukan");
            return;
        }

        const url = `${BASE_URL}/api/skrd/pdf/${skrd.id_skrd}`;
        window.open(url, "_blank");
    };

    // Mapping warna status dari Backend (unpaid, paid, overdue)
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { label: 'Sudah Bayar', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={12} /> };
            case 'partial':
                return { label: 'Kurang Bayar', color: 'bg-orange-100 text-amber-700', icon: <AlertCircle size={12} /> };
            case 'unpaid':
                return { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={12} /> };
            case 'overdue':
                return { label: 'Menunggak', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> };
            default:
                return { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: null };
        }
    };

    // Format Tanggal (Contoh: 28 Jan 2026)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase leading-none">Manajemen Tagihan SKRD</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Pantau status pembayaran dan piutang retribusi objek.</p>
                </div>
                {/* <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-black transition-all">
                    <Download size={18} /> Export Laporan
                </button> */}
            </div>

            {/* Statistik Ringkas (Opsional: Bisa dihubungkan ke API Dashboard) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total SKRD Terbit</p>
                    <h3 className="text-2xl font-black text-gray-800">{pagination.total_items} Dokumen</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Masa Aktif</p>
                    <h3 className="text-2xl font-black text-green-600">Januari 2026</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tagihan Berjalan</p>
                    <h3 className="text-2xl font-black text-amber-500">
                        Rp {skrdList.reduce((acc, curr) => acc + parseFloat(curr.total_bayar), 0).toLocaleString()}
                    </h3>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 px-6">
                <div className="flex items-center gap-2 flex-1 w-full text-left">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari Nomor SKRD atau Nama Objek..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 bg-transparent outline-none font-bold text-gray-700"
                    />
                    {loading && <Loader2 className="animate-spin text-green-700" size={18} />}
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex-shrink-0 ${filterStatus === status ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabel SKRD */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Objek Retribusi</th>
                                <th className="p-8">Nomor SKRD / Masa</th>
                                <th className="p-8">Total Tagihan</th>
                                <th className="p-8">Jatuh Tempo</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {skrdList.length > 0 ? (
                                skrdList.map((skrd) => {
                                    const status = getStatusInfo(skrd.status);
                                    return (
                                        <tr key={skrd.id_skrd} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400">
                                                        <Paperclip size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-mono font-black text-green-700 mb-0.5 uppercase tracking-tighter">Pemilik: {skrd.Objek.Subjek?.nama_subjek}</p>
                                                        <p className="text-sm font-black text-gray-800 uppercase leading-none">{skrd.Objek?.nama_objek}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <p className="text-xs font-bold text-gray-700 leading-none">{skrd.no_skrd}</p>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase italic tracking-tighter">
                                                    Masa: {skrd.masa} Bulan
                                                </p>
                                            </td>
                                            <td className="p-8 text-left">
                                                <p className="text-sm font-black text-gray-800 tracking-tighter">Rp {Number(skrd.total_bayar).toLocaleString()}</p>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar size={14} />
                                                    <p className="text-xs font-bold tracking-tighter">{formatDate(skrd.jatuh_tempo)}</p>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${status.color}`}>
                                                    {status.icon}
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{status.label}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex justify-center gap-2">
                                                    {/* <button onClick={() => handleReviewSkrd(skrd)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all" title="Review SKRD">
                                                        <Pen size={18} />
                                                    </button> */}
                                                    <button onClick={() => handleViewSkrdDocument(skrd)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Lihat Dokumen">
                                                        <FileText size={18} />
                                                    </button>
                                                    <button onClick={() => handleCetakSkrd(skrd)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Cetak SKRD">
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center text-gray-400 font-bold italic">
                                        {loading ? 'Memuat data...' : 'Tidak ada data SKRD.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                <div className="bg-gray-50/50 p-6 flex items-center justify-between border-t">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Total: {pagination.total_items} SKRD
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="p-2 bg-white border rounded-lg disabled:opacity-30"><ChevronLeft size={18} /></button>
                        <div className="flex items-center px-4 bg-white border rounded-lg font-black text-xs">{pagination.current_page} / {pagination.total_pages}</div>
                        <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.total_pages} className="p-2 bg-white border rounded-lg disabled:opacity-30"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showDetailModal && <ObjekDetailModal data={selectedData} onClose={() => setShowDetailModal(false)} />}
            {showSkrdModal && <SkrdDocumentModal data={selectedData} onClose={() => setShowSkrdModal(false)} />}
        </div>
    );
};

export default DlhListSkrd;