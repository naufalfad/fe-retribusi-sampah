import React, { useState, useEffect, useCallback } from 'react';
import { Search, Printer, Eye, Filter, ClipboardCheck, Home, Building2, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import SkrdPreviewModal from './components/SkrdPreviewModal';
import ObjekDetailModal from './components/ObjekDetailModal';

const DlhListObjek = () => {
    const [objekList, setObjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        items_per_page: 10
    });

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const fetchObjek = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/objek/list-objek', {
                params: {
                    page: page,
                    limit: 10,
                    search: search
                }
            });
            if (response.data.status === 'success') {
                setObjekList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Gagal mengambil data objek:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect untuk inisialisasi dan pencarian
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchObjek(1, searchTerm);
        }, 500); // Debounce 500ms agar tidak spam API saat mengetik

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, fetchObjek]);

    // --- HANDLERS ---
    const handleOpenPreview = (data) => {
        setSelectedData(data);
        setShowModal(true);
    };

    const handleOpenObjekDetail = (data) => {
        setSelectedData(data);
        setShowDetailModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            fetchObjek(newPage, searchTerm);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">List Objek Retribusi & Penetapan Tarif</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Role: Otoritas DLH Pusat</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border-2 border-gray-100 p-3 rounded-2xl text-gray-600 hover:border-green-600 transition-all">
                        <Printer size={20} />
                    </button>
                    <button className="bg-green-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-green-900/20 hover:bg-black transition-all">
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex items-center px-6 focus-within:ring-2 focus-within:ring-green-600 transition-all">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari Nama Objek..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-none outline-none font-bold text-gray-700 placeholder:text-gray-300"
                />
                {loading && <Loader2 className="animate-spin text-green-700" size={20} />}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Wajib Retribusi / Objek</th>
                                <th className="p-8 text-center">Tipe / Kelurahan</th>
                                <th className="p-8">Status SKRD</th>
                                <th className="p-8 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {objekList.length > 0 ? (
                                objekList.map((obj) => (
                                    <tr key={obj.id_objek} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${obj.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                    {obj.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={20} /> : <Home size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-800 text-sm leading-tight uppercase tracking-tight">
                                                        {obj.nama_objek}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                            {obj.npor_objek || 'NPOR BELUM ADA'}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase italic">
                                                            Owner: {obj.Subjek?.nama_subjek || 'Tidak Diketahui'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <p className="text-[11px] font-black text-gray-700 uppercase leading-none">{obj.kategori_objek}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase italic tracking-tighter">
                                                <MapPin size={10} className="inline mr-1" /> {obj.kelurahan_objek}
                                            </p>
                                        </td>
                                        <td className="p-8">
                                            {/* Status berdasarkan apakah ada data SKRD di include-nya */}
                                            <StatusBadge status={obj.Skrds && obj.Skrds.length > 0 ? 'Sudah Terbit' : 'Belum Terbit'} />
                                            {obj.Skrds && obj.Skrds.length > 0 && (
                                                <p className="text-[9px] font-mono text-gray-400 mt-1">{obj.Skrds[0].nomor_skrd}</p>
                                            )}
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center gap-3">
                                                {(!obj.Skrds || obj.Skrds.length === 0) ? (
                                                    <button
                                                        onClick={() => handleOpenObjekDetail(obj)}
                                                        className="flex items-center gap-2 bg-amber-500 hover:bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                                                    >
                                                        <ClipboardCheck size={14} /> Tetapkan Tarif
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenPreview(obj)}
                                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                                            <Printer size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">
                                        {loading ? "Sedang memuat data..." : "Data objek tidak ditemukan."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION UI --- */}
                <div className="bg-gray-50/50 p-6 flex items-center justify-between border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Menampilkan {objekList.length} dari {pagination.total_items} Objek
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-green-700 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center px-4 bg-white border border-gray-200 rounded-lg font-black text-xs text-gray-700">
                            {pagination.current_page} / {pagination.total_pages}
                        </div>
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.total_pages}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-green-700 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showModal && <SkrdPreviewModal data={selectedData} onClose={() => setShowModal(false)} />}
            {showDetailModal && (
                <ObjekDetailModal
                    data={selectedData}
                    onClose={() => setShowDetailModal(false)}
                    onSuccess={() => fetchObjek(pagination.current_page, searchTerm)} // Refresh data setelah penetapan
                />
            )}
        </div>
    );
};

export default DlhListObjek;