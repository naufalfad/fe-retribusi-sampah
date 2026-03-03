import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, CheckCircle, XCircle, FileSearch, ArrowRight,
    X, ImageIcon, AlertCircle, RotateCcw,
    ThumbsDown, Info, FileText, Loader2, AlertTriangle,
    Banknote, BadgeAlert, RefreshCw, ChevronLeft, ChevronRight,
    Printer, ExternalLink
} from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import SsrdPreviewModal from '../dlh/components/SsrdPreviewModal';

const BendaharaSsrd = () => {
    // --- STATES ---
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' atau 'verified'
    const [ssrdList, setSsrdList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1, total_items: 0 });

    // Modal States
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showSsrdModal, setShowSsrdModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Audit Form States
    const [auditAction, setAuditAction] = useState(null); // 'approve' atau 'reject'
    const [rejectReason, setRejectReason] = useState('');
    const [nominalRealBank, setNominalRealBank] = useState('');
    const [notes, setNotes] = useState('');

    // --- 1. FETCH DATA (Integrated with /ssrd/list-pending) ---
    const fetchSsrd = useCallback(async (page = 1, search = '', status = 'pending') => {
        setLoading(true);
        try {
            // Jika status pending, gunakan list-pending, jika tidak gunakan list-ssrd
            const endpoint = status === 'pending' ? '/ssrd/list-pending' : '/ssrd/list-ssrd';
            const response = await api.get(endpoint, {
                params: { page, limit: 10, search }
            });

            if (response.data.status === 'success') {
                setSsrdList(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error("Gagal load data rekonsiliasi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchSsrd(1, searchTerm, activeTab);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, activeTab, fetchSsrd]);

    // --- 2. HANDLERS ---
    const handleOpenAudit = (data) => {
        setSelectedData(data);
        setNominalRealBank(data.amount_paid); // Default isi dengan nominal inputan awal
        setAuditAction(null);
        setShowAuditModal(true);
    };

    const handleVerifyAction = async () => {
        if (!auditAction) return alert("Pilih tindakan (Setujui/Tolak)");
        if (auditAction === 'reject' && !rejectReason) return alert("Pilih alasan penolakan");

        setIsProcessing(true);
        try {
            const payload = {
                id_ssrd: selectedData.id_ssrd,
                action: auditAction,
                nominal_real: auditAction === 'reject' && rejectReason === 'Kurang Bayar' ? parseFloat(nominalRealBank) : selectedData.amount_paid,
                alasan_tolak: auditAction === 'reject' ? rejectReason : null,
                catatan: notes
            };

            const response = await api.post('/ssrd/verifikasi-rekon', payload);

            if (response.data.success) {
                alert(response.data.message);
                setShowAuditModal(false);
                fetchSsrd(pagination.current_page, searchTerm, activeTab);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Gagal memproses verifikasi");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewSsrd = (data) => {
        setSelectedData(data);
        setShowSsrdModal(true);
    };

    return (
        <div className="space-y-6 pb-20 font-sans text-left">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">
                        Audit <span className="text-indigo-600">Rekonsiliasi</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest leading-none">
                        Validasi Realisasi Setoran Kas Daerah
                    </p>
                </div>
                <div className="flex p-1 bg-slate-200 rounded-2xl w-fit border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        ANTREAN AUDIT
                    </button>
                    <button
                        onClick={() => setActiveTab('verified')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'verified' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        TELAH DIVALIDASI
                    </button>
                </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                <Search className={`absolute left-8 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-indigo-600' : 'text-slate-300'}`} size={20} />
                <input
                    type="text"
                    placeholder="Cari No. SKRD, No. SSRD atau Nama Penyetor..."
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                            <tr>
                                <th className="p-8">Objek Retribusi</th>
                                <th className="p-8">Informasi Tagihan</th>
                                <th className="p-8">Nominal Setoran</th>
                                <th className="p-8">Status Audit</th>
                                <th className="p-8 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 size={32} className="animate-spin mx-auto text-indigo-600" /></td></tr>
                            ) : ssrdList.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest">Tidak ada data setoran</td></tr>
                            ) : ssrdList.map((item) => (
                                <tr key={item.id_ssrd} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-8">
                                        <h4 className="font-black text-slate-800 text-sm uppercase leading-tight">{item.Skrd?.Objek?.nama_objek || 'N/A'}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">NPOR: {item.Skrd?.Objek?.npor_objek}</p>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-[10px] font-bold text-indigo-600 font-mono tracking-tighter uppercase">{item.Skrd?.no_skrd}</p>
                                        <p className="text-xs font-black text-slate-500 mt-1 uppercase tracking-tighter italic">Tagihan: Rp {Number(item.Skrd?.total_bayar).toLocaleString()}</p>
                                    </td>
                                    <td className="p-8">
                                        <div className={`w-fit px-4 py-2 rounded-xl border-2 flex items-center gap-3 ${Number(item.amount_paid) < Number(item.Skrd?.total_bayar) ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                            <p className={`font-black text-sm ${Number(item.amount_paid) < Number(item.Skrd?.total_bayar) ? 'text-red-700' : 'text-green-700'}`}>
                                                Rp {Number(item.amount_paid).toLocaleString()}
                                            </p>
                                            {Number(item.amount_paid) < Number(item.Skrd?.total_bayar) && <BadgeAlert size={16} className="text-red-500 animate-pulse" />}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <StatusBadge status={item.payment_status?.toUpperCase()} />
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center gap-2">
                                            {activeTab === 'pending' ? (
                                                <button
                                                    onClick={() => handleOpenAudit(item)}
                                                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                                >
                                                    <FileSearch size={14} /> Buka Audit
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleViewSsrd(item)}
                                                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                        title="Lihat SSRD"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm border border-gray-100">
                                                        <Printer size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- FOOTER PAGINATION --- */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Halaman {pagination.current_page} dari {pagination.total_pages}</p>
                    <div className="flex gap-2">
                        <button disabled={pagination.current_page === 1} onClick={() => fetchSsrd(pagination.current_page - 1, searchTerm, activeTab)} className="p-2 bg-white border rounded-lg hover:bg-indigo-50 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                        <button disabled={pagination.current_page === pagination.total_pages} onClick={() => fetchSsrd(pagination.current_page + 1, searchTerm, activeTab)} className="p-2 bg-white border rounded-lg hover:bg-indigo-50 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* --- MODAL WORKSPACE AUDIT (Sesuai Logic Backend Verifikasi) --- */}
            {showAuditModal && selectedData && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-8 bg-slate-50 border-b flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                    <FileSearch size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">Workspace Audit Transaksi</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Validasi Data SKRD vs Laporan Setoran Lapangan</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAuditModal(false)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><X size={32} /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
                            {/* KIRI: DATA RESMI SKRD */}
                            <div className="flex-1 p-10 overflow-y-auto border-r border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ketetapan Sistem (SKRD)</span>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Nomor Tagihan</p>
                                            <p className="text-sm font-black text-slate-800 font-mono tracking-tight underline decoration-indigo-200">{selectedData.Skrd?.no_skrd}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Wajib Retribusi</p>
                                            <p className="text-sm font-black text-slate-800 uppercase leading-tight">{selectedData.Skrd?.Objek?.Subjek?.nama_subjek}</p>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Total Tagihan Pokok</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter italic">Rp {Number(selectedData.Skrd?.total_bayar).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KANAN: FORM REKONSILIASI */}
                            <div className="flex-1 p-10 overflow-y-auto bg-white">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Input Rekonsiliasi Bendahara</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Action Toggle */}
                                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                                        <button
                                            onClick={() => setAuditAction('approve')}
                                            className={`py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${auditAction === 'approve' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}
                                        >
                                            <CheckCircle size={14} /> TERIMA SETORAN
                                        </button>
                                        <button
                                            onClick={() => setAuditAction('reject')}
                                            className={`py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${auditAction === 'reject' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}
                                        >
                                            <ThumbsDown size={14} /> TOLAK / SELISIH
                                        </button>
                                    </div>

                                    {/* Audit Fields */}
                                    {auditAction === 'reject' && (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Penolakan</label>
                                                <select
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl outline-none font-bold text-sm"
                                                >
                                                    <option value="">-- Pilih Alasan --</option>
                                                    <option value="Kurang Bayar">Kurang Bayar (Nominal Sesuai Mutasi Bank)</option>
                                                    <option value="Bukti Tidak Valid">Bukti Transfer Palsu / Tidak Terbaca</option>
                                                    <option value="Dana Tidak Masuk">Dana Tidak Ditemukan di Rekening Koron</option>
                                                </select>
                                            </div>

                                            {rejectReason === 'Kurang Bayar' && (
                                                <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 space-y-2">
                                                    <label className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">Uang Real Diterima Di Bank (Rp)</label>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl font-black text-red-300 italic">Rp</span>
                                                        <input
                                                            type="number"
                                                            value={nominalRealBank}
                                                            onChange={(e) => setNominalRealBank(e.target.value)}
                                                            className="bg-transparent w-full text-3xl font-black text-red-700 outline-none p-0 tracking-tighter"
                                                        />
                                                    </div>
                                                    <p className="text-[9px] text-red-400 font-bold italic mt-2 uppercase">* Sistem akan otomatis menerbitkan SKRDKB (Kurang Bayar) senilai selisih.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Audit (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Masukkan catatan audit untuk log sistem..."
                                            className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold text-sm h-24"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t bg-gray-50 flex justify-end gap-3 px-10">
                            <button
                                onClick={() => setShowAuditModal(false)}
                                className="px-8 py-4 text-xs font-black uppercase text-gray-400 hover:text-gray-600"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleVerifyAction}
                                disabled={isProcessing || !auditAction}
                                className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-3 disabled:opacity-30 ${auditAction === 'reject' ? 'bg-red-600 text-white' : 'bg-green-700 text-white'}`}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                                Selesaikan Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Preview SSRD */}
            {showSsrdModal && selectedData && (
                <SsrdPreviewModal
                    data={selectedData}
                    onClose={() => setShowSsrdModal(false)}
                />
            )}
        </div>
    );
};

export default BendaharaSsrd;