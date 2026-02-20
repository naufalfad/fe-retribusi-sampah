import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Printer, Eye, Filter, ClipboardCheck, Home,
    Building2, MapPin, Loader2, ChevronLeft, ChevronRight,
    X, FileText, CalendarDays, Wallet
} from 'lucide-react';
import api from '../../api/axios';
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
    const [showSkrdListModal, setShowSkrdListModal] = useState(false);
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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchObjek(1, searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, fetchObjek]);

    // --- HANDLERS ---
    const handleOpenSkrdList = (obj) => {
        setSelectedData(obj);
        setShowSkrdListModal(true);
    };

    const handleOpenPreview = (skrd) => {
        // Karena modal preview butuh data objek juga, kita bungkus
        setSelectedData({ ...selectedData, ...skrd });
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

    const getNamaBulan = (angka) => {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return bulan[parseInt(angka) - 1] || angka;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">List Objek & Riwayat SKRD</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Manajemen penetapan tarif objek retribusi.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex items-center px-6">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari Nama Objek / NPOR..."
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
                                <th className="p-8">Objek Retribusi</th>
                                <th className="p-8 text-center">Info Wilayah</th>
                                <th className="p-8 text-center">Riwayat SKRD</th>
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
                                                    <p className="font-black text-gray-800 text-sm uppercase leading-tight tracking-tight">
                                                        {obj.nama_objek}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                                        Owner: {obj.Subjek?.nama_subjek || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <p className="text-[11px] font-black text-gray-700 uppercase">{obj.kelurahan_objek}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase italic">
                                                <MapPin size={10} className="inline mr-1" /> {obj.kecamatan_objek}
                                            </p>
                                        </td>
                                        <td className="p-8 text-center">
                                            {/* Badge Riwayat SKRD (Mirip Jumlah Aset di List Subjek) */}
                                            <button
                                                onClick={() => handleOpenSkrdList(obj)}
                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                            >
                                                <ClipboardCheck size={14} />
                                                {(obj.Skrds?.length || 0)} SKRD
                                            </button>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenObjekDetail(obj)}
                                                    className="flex items-center gap-2 bg-amber-500 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                                                >
                                                    <CalendarDays size={14} /> Penetapan
                                                </button>
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

                {/* Pagination (TETAP SAMA) */}
                <div className="bg-gray-50/50 p-6 flex items-center justify-between border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Total {pagination.total_items} Objek
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30"><ChevronLeft size={20} /></button>
                        <div className="flex items-center px-4 bg-white border border-gray-200 rounded-lg font-black text-xs">{pagination.current_page} / {pagination.total_pages}</div>
                        <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.total_pages} className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* --- MODAL DAFTAR SKRD (FITUR BARU) --- */}
            {showSkrdListModal && selectedData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header Modal */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/20">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 uppercase leading-none">Riwayat Penetapan SKRD</h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase italic tracking-tighter">Objek: {selectedData.nama_objek}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSkrdListModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Body Modal: List SKRD */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 bg-gray-100/30">
                            {/* VARIABEL BANTUAN UNTUK MENGATASI PERBEDAAN NAMA DARI BACKEND */}
                            {(() => {
                                const riwayatSkrd = selectedData.Skrds || [];

                                if (riwayatSkrd.length > 0) {
                                    return riwayatSkrd.map((skrd, index) => (
                                        <div key={skrd.id_skrd} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-500 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-800 uppercase text-xs mb-1 tracking-tight">{skrd.no_skrd}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase">
                                                        <span>{getNamaBulan(skrd.periode_bulan)} {skrd.periode_tahun}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Wallet size={12} /> Rp {parseInt(skrd.total_bayar || 0).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenPreview(skrd)}
                                                    className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-3 bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100">
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ));
                                } else {
                                    return (
                                        <div className="py-20 text-center">
                                            <FileText className="mx-auto text-gray-200 mb-4" size={60} />
                                            <p className="text-gray-400 italic font-black uppercase text-xs tracking-widest">Belum ada riwayat SKRD terbit.</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-8 border-t bg-white flex justify-end">
                            <button
                                onClick={() => setShowSkrdListModal(false)}
                                className="px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Tutup Riwayat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals Existing */}
            {showModal && <SkrdPreviewModal data={selectedData} onClose={() => setShowModal(false)} />}
            {showDetailModal && (
                <ObjekDetailModal
                    data={selectedData}
                    onClose={() => setShowDetailModal(false)}
                    onSuccess={() => fetchObjek(pagination.current_page, searchTerm)}
                />
            )}
        </div>
    );
};

export default DlhListObjek;