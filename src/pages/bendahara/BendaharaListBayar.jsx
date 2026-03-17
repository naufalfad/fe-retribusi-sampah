import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Printer, FileText, Download,
    Calendar, Loader2, ChevronLeft, ChevronRight, ChevronDown,
    Building2, Banknote, Eye, X, BarChart3,
    MapPin, CheckCircle2, Briefcase, Layers
} from 'lucide-react';
import { debounce } from 'lodash';
import api, { BASE_URL } from '../../api/axios';
import SsrdPreviewModal from '../dlh/components/SsrdPreviewModal';

const BendaharaListBayar = () => {
    // --- STATES ---
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
    });
    const [kelasOptions, setKelasOptions] = useState([]);
    const [kecamatanOptions, setKecamatanOptions] = useState([]);
    const [loadingMaster, setLoadingMaster] = useState(false);

    const [selectedSsrd, setSelectedSsrd] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const [reportType, setReportType] = useState('bulanan');
    const [reportParams, setReportParams] = useState({
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        kecamatan: '',
        kategori: 'Pribadi',
        jenis_layanan: ''
    });

    const fetchMasterData = async () => {
        setLoadingMaster(true);
        try {
            const [resKelas, resKec] = await Promise.all([
                api.get('/objek/all-kelas'),
                api.get('/wilayah/kecamatan/1.1')
            ]);

            if (resKelas.data.success) setKelasOptions(resKelas.data.data);
            if (resKec.data.success) setKecamatanOptions(resKec.data.data);
        } catch (err) {
            console.error("Gagal memuat data master filter:", err);
        } finally {
            setLoadingMaster(false);
        }
    };

    useEffect(() => {
        if (showReportModal) {
            fetchMasterData();
        }
    }, [showReportModal]);

    // --- FETCH DATA ---
    const fetchHistory = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await api.get('/ssrd/paid-list', {
                params: {
                    page,
                    limit: 10,
                    search: search
                }
            });
            if (res.data.status === 'success') {
                setHistory(res.data.data);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error("Gagal load riwayat SSRD:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(
        debounce((query) => fetchHistory(1, query), 500),
        [fetchHistory]
    );

    useEffect(() => {
        fetchHistory(pagination.current_page, searchTerm);
    }, [pagination.current_page]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleOpenPreview = (item) => {
        setSelectedSsrd(item);
        setShowPreviewModal(true);
    };

    const handleGenerateReport = () => {
        const queryParams = new URLSearchParams({
            type: reportType,
            ...reportParams
        }).toString();

        window.open(`${BASE_URL}/api/report/cetak-penerimaan?${queryParams}`, '_blank');
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans text-left px-1">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                        Riwayat <span className="text-indigo-600">Pelunasan</span> SSRD
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest leading-none">
                        Arsip Bukti Setoran Sah Kas Daerah
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-white border-2 border-slate-100 hover:bg-slate-900 hover:text-white p-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 transition-all flex items-center justify-center gap-2">
                        <Download size={16} /> Export CSV
                    </button>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex-1 md:flex-none bg-indigo-600 text-white p-4 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Printer size={18} /> Cetak Laporan Penerimaan
                    </button>
                </div>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-indigo-600' : 'text-slate-300'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Cari No. SSRD, Nama Objek, atau No. SKRD..."
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm transition-all"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="flex items-center gap-2 px-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest shadow-inner">
                    <CheckCircle2 size={16} /> {pagination.total_items} Transaksi Lunas
                </div>
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="p-8">Informasi SSRD</th>
                                <th className="p-8">Objek Retribusi</th>
                                <th className="p-8">Metode & Tanggal</th>
                                <th className="p-8">Nominal Lunas</th>
                                <th className="p-8 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-left">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <Loader2 size={32} className="animate-spin mx-auto text-indigo-600" />
                                        <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">Sinkronisasi Kas Daerah...</p>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic">Tidak ada riwayat pelunasan</td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id_ssrd} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="p-8">
                                            <p className="text-[10px] font-bold text-indigo-600 font-mono tracking-tighter uppercase leading-none mb-1">
                                                {item.no_ssrd}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                REF: {item.Skrd?.no_skrd}
                                            </p>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                                    <Building2 size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-sm uppercase leading-tight tracking-tight">
                                                        {item.Skrd?.Objek?.nama_objek || 'N/A'}
                                                    </h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 italic">
                                                        NPOR: {item.Skrd?.Objek?.npor_objek}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 p-1.5 rounded-lg">
                                                    <Banknote size={14} className="text-slate-500" />
                                                </div>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                                                    {item.payment_method}
                                                </p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                                {new Date(item.paid_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-sm font-black text-emerald-600 italic tracking-tighter">
                                                Rp {Number(item.amount_paid).toLocaleString('id-ID')}
                                            </p>
                                            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">Verified</span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenPreview(item)}
                                                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90"
                                                    title="Pratinjau SSRD"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(item.id_ssrd)}
                                                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-90"
                                                    title="Cetak PDF"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- FOOTER PAGINATION --- */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 px-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Halaman <span className="text-slate-900">{pagination.current_page}</span> Dari <span className="text-slate-900">{pagination.total_pages}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1 || loading}
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 shadow-sm">
                            {pagination.current_page}
                        </div>

                        <button
                            disabled={pagination.current_page === pagination.total_pages || loading}
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL: REPORT GENERATOR CENTER --- */}
            {showReportModal && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl"><Printer size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none italic">Report Generator</h3>
                                    <p className="text-[10px] font-bold opacity-60 uppercase mt-1 tracking-widest">Pusat Laporan Penerimaan Retribusi</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={28} /></button>
                        </div>

                        <div className="p-10 space-y-8 bg-gray-50/50">
                            {/* 1. PILIH JENIS LAPORAN (GRID CARDS) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kategori Laporan</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {[
                                        { id: 'bulanan', label: 'Bulanan', icon: Calendar },
                                        { id: 'tahunan', label: 'Tahunan', icon: BarChart3 },
                                        { id: 'wilayah', label: 'Wilayah', icon: MapPin },
                                        { id: 'kategori', label: 'Kategori', icon: Briefcase },
                                        { id: 'jenis', label: 'Layanan', icon: Layers },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setReportType(type.id)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${reportType === type.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-white bg-white text-slate-400 opacity-60'}`}
                                        >
                                            <type.icon size={20} />
                                            <span className="text-[9px] font-black uppercase">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. PARAMETER DINAMIS */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 border-b pb-3 flex justify-between">
                                    <span>Konfigurasi Filter Laporan</span>
                                    {loadingMaster && <Loader2 size={12} className="animate-spin" />}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                    {/* Tahun Anggaran - Selalu muncul */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun Anggaran</label>
                                        <select
                                            value={reportParams.year}
                                            onChange={(e) => setReportParams({ ...reportParams, year: e.target.value })}
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                                        >
                                            <option value="2026">2026</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>

                                    {/* Laporan Bulanan / Wilayah / Jenis / Kategori butuh filter Bulan */}
                                    {['bulanan', 'wilayah', 'jenis', 'kategori'].includes(reportType) && (
                                        <div className="space-y-1.5 animate-in fade-in">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Bulan</label>
                                            <select
                                                value={reportParams.month}
                                                onChange={(e) => setReportParams({ ...reportParams, month: e.target.value })}
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                                            >
                                                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                                                    <option key={i} value={i + 1}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Laporan Per Kecamatan */}
                                    {reportType === 'wilayah' && (
                                        <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Wilayah (Kecamatan)</label>
                                            <div className="relative">
                                                <select
                                                    value={reportParams.kecamatan}
                                                    onChange={(e) => setReportParams({ ...reportParams, kecamatan: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                                                >
                                                    <option value="">Semua Kecamatan</option>
                                                    {kecamatanOptions.map(k => (
                                                        <option key={k.id} value={k.name}>{k.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Laporan Per Kategori Objek */}
                                    {reportType === 'kategori' && (
                                        <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Objek</label>
                                            <select
                                                value={reportParams.kategori}
                                                onChange={(e) => setReportParams({ ...reportParams, kategori: e.target.value })}
                                                className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                                            >
                                                <option value="Rumah Tinggal">Rumah Tinggal (Pribadi)</option>
                                                <option value="Non Rumah Tinggal">Non Rumah Tinggal (Komersial)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Laporan Per Jenis (Nama Kelas) */}
                                    {reportType === 'jenis' && (
                                        <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Retribusi (Kelas)</label>
                                            <div className="relative">
                                                <select
                                                    value={reportParams.jenis_layanan}
                                                    onChange={(e) => setReportParams({ ...reportParams, jenis_layanan: e.target.value })}
                                                    className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm outline-none focus:border-indigo-600 appearance-none"
                                                >
                                                    <option value="">Semua Kelas</option>
                                                    {kelasOptions.map(k => (
                                                        <option key={k.id_kelas} value={k.nama_kelas}>{k.nama_kelas}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                            <p className="text-[9px] text-slate-400 italic ml-1">* Data diambil berdasarkan klasifikasi tarif pada tabel kelas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t bg-gray-50 flex gap-4 px-10">
                            <button onClick={() => setShowReportModal(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-xs tracking-widest">Batalkan</button>
                            <button
                                onClick={handleGenerateReport}
                                className="flex-[2] py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <FileText size={18} /> Generate PDF Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PREVIEW SSRD */}
            {showPreviewModal && selectedSsrd && (
                <SsrdPreviewModal
                    data={selectedSsrd}
                    onClose={() => setShowPreviewModal(false)}
                />
            )}
        </div>
    );
};

export default BendaharaListBayar;