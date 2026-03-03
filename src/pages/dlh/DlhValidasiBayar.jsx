import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    FileSearch, X, CheckCircle,
    ThumbsDown, Info, Search, Loader2, AlertTriangle, BadgeAlert
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DlhValidasiBayar = () => {
    // --- STATES ---
    const [activeTab, setActiveTab] = useState('pending');
    const [ssrdList, setSsrdList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showReconModal, setShowReconModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [rejectReason, setRejectReason] = useState('');
    const [actualAmount, setActualAmount] = useState('');
    const [notes, setNotes] = useState('');

    // --- 1. FETCH DATA DARI API ---
    const fetchSsrdPending = async () => {
        setLoading(true);
        try {
            // Mengambil list SSRD dengan status 'pending' (dikirim oleh penagih)
            const response = await api.get('/ssrd/list-pending', {
                params: { search: searchTerm, status: activeTab === 'pending' ? 'pending' : 'rejected' }
            });
            if (response.data.status === 'success') {
                setSsrdList(response.data.data);
            }
        } catch (err) {
            setError("Gagal memuat antrean audit");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchSsrdPending();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, activeTab]);

    // --- 2. HANDLERS ---
    const handleOpenRecon = (data) => {
        setSelectedData(data);
        setActualAmount(data.amount_paid); // Default nominal yang diinput penagih
        setShowReconModal(true);
    };

    const handleVerifyAction = async (action) => {
        if (action === 'reject' && !rejectReason) {
            alert("Silakan pilih alasan penolakan");
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                id_ssrd: selectedData.id_ssrd,
                action: action, // 'approve' atau 'reject'
                nominal_real: action === 'reject' ? actualAmount : selectedData.amount_paid,
                alasan_tolak: action === 'reject' ? rejectReason : null,
                catatan: notes
            };

            const response = await api.post('/ssrd/verifikasi-rekon', payload);

            if (response.data.success) {
                alert(response.data.message);
                setShowReconModal(false);
                setShowRejectModal(false);
                fetchSsrdPending(); // Refresh list
            }
        } catch (err) {
            alert(err.response?.data?.message || "Terjadi kesalahan sistem");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                        Audit <span className="text-indigo-600">Pembayaran</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Validasi setoran penagih.</p>
                </div>
                <div className="flex p-1 bg-slate-200 rounded-2xl w-fit border border-slate-200">
                    <button onClick={() => setActiveTab('pending')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500'}`}>ANTREAN AUDIT</button>
                    <button onClick={() => setActiveTab('rejected')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'rejected' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500'}`}>DITOLAK / SELISIH</button>
                </div>
            </div>

            {/* Toolbar Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                    type="text"
                    placeholder="Cari Nama Wajib Retribusi atau No. SKRD..."
                    className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-8">Informasi Objek</th>
                            <th className="p-8">Tagihan (SKRD)</th>
                            <th className="p-8">Setoran (User)</th>
                            <th className="p-8 text-center">Tindakan Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
                        ) : ssrdList.length > 0 ? ssrdList.map((item) => (
                            <tr key={item.id_ssrd} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-8">
                                    <h4 className="font-black text-slate-800 text-sm uppercase">{item.Skrd?.Objek?.nama_objek || 'N/A'}</h4>
                                    <p className="text-[10px] font-bold text-indigo-600 font-mono italic">{item.Skrd?.no_skrd}</p>
                                </td>
                                <td className="p-8 font-black text-slate-400 text-sm italic">Rp {parseInt(item.Skrd?.total_bayar).toLocaleString()}</td>
                                <td className="p-8">
                                    <div className={`p-3 rounded-2xl border-2 flex items-center justify-between ${parseInt(item.amount_paid) < parseInt(item.Skrd?.total_bayar) ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                        <p className={`font-black text-sm ${parseInt(item.amount_paid) < parseInt(item.Skrd?.total_bayar) ? 'text-red-700' : 'text-green-700'}`}>Rp {parseInt(item.amount_paid).toLocaleString()}</p>
                                        {parseInt(item.amount_paid) < parseInt(item.Skrd?.total_bayar) && <BadgeAlert size={16} className="text-red-500 animate-pulse" />}
                                    </div>
                                </td>
                                <td className="p-8">
                                    <button
                                        onClick={() => handleOpenRecon(item)}
                                        className="w-full bg-slate-900 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FileSearch size={16} /> Buka Audit
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-20 text-center text-gray-400 italic">Antrean audit kosong.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL WORKSPACE REKONSILIASI --- */}
            {showReconModal && selectedData && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                        {/* Modal Header */}
                        <div className="p-6 bg-slate-50 border-b flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                    <FileSearch size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">Workspace Audit Transaksi</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">Verifikasi Data SKRD vs Laporan Realisasi Pembayaran</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReconModal(false)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><X size={32} /></button>
                        </div>

                        {/* Modal Body: Split Data View */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">

                            {/* SISI KIRI: Ringkasan SKRD Resmi */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar border-r border-slate-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ketetapan Sistem (SKRD)</span>
                                </div>

                                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Nomor SKRD</p>
                                            <p className="text-sm font-black text-slate-800 font-mono tracking-tight">{selectedData.Skrd?.no_skrd}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Wajib Retribusi / NPWRD</p>
                                            <p className="text-sm font-black text-slate-800 uppercase">{selectedData.Skrd?.Objek?.Subjek?.nama_subjek}</p>
                                            <p className="text-xs font-bold text-indigo-600 font-mono italic">{selectedData.Skrd?.Objek?.Subjek?.npwrd_subjek}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Total Tagihan Pokok</p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                                Rp {parseInt(selectedData.Skrd?.total_bayar).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SISI KANAN: Rincian Data Pasca Pembayaran */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-white">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Laporan Realisasi (Inputan)</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Box Utama Nominal Diterima */}
                                    <div className={`p-6 rounded-[2rem] border-2 shadow-sm ${parseInt(selectedData.amount_paid) < parseInt(selectedData.Skrd?.total_bayar) ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${parseInt(selectedData.amount_paid) < parseInt(selectedData.Skrd?.total_bayar) ? 'text-red-600' : 'text-green-600'}`}>
                                                Total Uang Diterima
                                            </p>
                                            {parseInt(selectedData.amount_paid) < parseInt(selectedData.Skrd?.total_bayar) && (
                                                <BadgeAlert size={20} className="text-red-500 animate-bounce" />
                                            )}
                                        </div>
                                        <p className={`text-3xl font-black tracking-tighter ${parseInt(selectedData.amount_paid) < parseInt(selectedData.Skrd?.total_bayar) ? 'text-red-700' : 'text-green-700'}`}>
                                            Rp {parseInt(selectedData.amount_paid).toLocaleString('id-ID')}
                                        </p>

                                        {/* Alert Selisih jika Kurang Bayar */}
                                        {parseInt(selectedData.amount_paid) < parseInt(selectedData.Skrd?.total_bayar) && (
                                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-red-600 bg-white/50 w-fit px-3 py-1 rounded-full uppercase italic">
                                                <AlertTriangle size={12} /> Selisih Kurang: Rp {(parseInt(selectedData.Skrd?.total_bayar) - parseInt(selectedData.amount_paid)).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Detail Metadata Transaksi */}
                                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="col-span-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Atas Nama Penyetor</p>
                                            <p className="text-sm font-black text-slate-800 uppercase underline decoration-indigo-200 underline-offset-4">{selectedData.atas_nama_pembayar || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Metode Bayar</p>
                                            <p className="text-xs font-black text-indigo-700 uppercase italic">{selectedData.payment_method || 'Tunai'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Tanggal Bayar</p>
                                            <p className="text-xs font-black text-slate-800 uppercase">{selectedData.paid_at_formatted || selectedData.paid_at}</p>
                                        </div>
                                        <div className="col-span-2 pt-4 border-t border-slate-200">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none text-blue-600 italic">Informasi Bank (Jika Transfer)</p>
                                            <p className="text-xs font-bold text-slate-600 uppercase italic">
                                                {selectedData.nama_bank || '-'} | {selectedData.no_rekening || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Aksi */}
                        <div className="p-8 border-t bg-white px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <Info size={16} className="text-amber-500" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase italic">Validasi manual diperlukan untuk verifikasi ke mutasi rekening koran.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="flex-1 md:flex-none px-10 py-5 border-2 border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ThumbsDown size={18} /> Tolak Setoran
                                </button>
                                <button
                                    onClick={() => handleVerifyAction('approve')}
                                    disabled={isProcessing}
                                    className="flex-[2] md:flex-none px-12 py-5 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-green-900/20 hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                    Terbitkan SSRD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: INPUT ALASAN PENOLAKAN --- */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-8 bg-red-600 text-white flex justify-between items-center">
                            <h3 className="font-black uppercase tracking-widest text-sm">Penolakan & Perbaikan Data</h3>
                            <button onClick={() => setShowRejectModal(false)}><X size={28} /></button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alasan Penolakan</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-600 font-bold text-sm"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                >
                                    <option value="">-- Pilih Alasan --</option>
                                    <option value="Kurang Bayar">Kurang Bayar (Nominal Selisih)</option>
                                    <option value="Bukti Tidak Valid">Bukti Struk Palsu / Tidak Terbaca</option>
                                    <option value="Dana Tidak Masuk">Dana Tidak Ditemukan di Rekening</option>
                                </select>

                                {rejectReason === 'Kurang Bayar' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">Uang Real Diterima Di Bank (Rp)</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-2xl font-black text-xl text-red-700 outline-none"
                                            value={actualAmount}
                                            onChange={(e) => setActualAmount(e.target.value)}
                                        />
                                    </div>
                                )}

                                <textarea
                                    placeholder="Catatan tambahan untuk penagih/user..."
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-600 text-sm font-bold"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <button
                                onClick={() => handleVerifyAction('reject')}
                                disabled={isProcessing}
                                className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : "Konfirmasi Penolakan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DlhValidasiBayar;