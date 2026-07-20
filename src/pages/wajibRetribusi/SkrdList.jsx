import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, Search, Filter, Eye,
    Calendar, AlertCircle, ArrowRight,
    Building2, Home, Wallet, Loader2,
    CheckCircle2, MapPin, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import SkrdPreviewModal from '../dlh/components/SkrdPreviewModal';

const SkrdList = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkrd, setSelectedSkrd] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // --- 1. FETCH DATA (Hanya yang Unpaid agar fokus pada kewajiban) ---
    const fetchMyBills = async () => {
        setLoading(true);
        try {
            // Asumsi rute ini mengambil semua SKRD unpaid milik Subjek yang login
            const res = await api.get('/skrd/list-unpaid-saya');
            if (res.data.success) {
                setBills(res.data.data);
            }
        } catch (err) {
            console.error("Gagal memuat tagihan:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyBills(); }, []);

    // --- 2. FILTER SEARCH ---
    const filteredBills = useMemo(() => {
        return bills.filter(b =>
            b.no_skrd.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.Objek?.nama_objek.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bills, searchTerm]);

    // --- 3. SUMMARY CALCULATION ---
    const totalUnpaid = useMemo(() => {
        return bills.reduce((acc, curr) => acc + parseFloat(curr.total_bayar), 0);
    }, [bills]);

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(val);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="animate-spin text-green-700" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest">Menyusun Daftar Kewajiban...</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-700 font-sans text-left">

            {/* --- HEADER: TOTAL KEWAJIBAN --- */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 text-green-400 mb-2 justify-center md:justify-start">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Tunggakan Aktif</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter ">
                            {formatCurrency(totalUnpaid)}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            Mencakup <span className="text-white font-bold">{bills.length} Tagihan</span> dari seluruh objek Anda.
                        </p>
                    </div>
                    {/* <button
                        onClick={() => navigate('/pembayaran')}
                        className="bg-green-600 hover:bg-white hover:text-green-700 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                    >
                        Bayar Semua Sekarang
                    </button> */}
                </div>
                <Wallet className="absolute -right-10 -bottom-10 opacity-5 text-white" size={250} />
            </div>

            {/* --- SEARCH & FILTER --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 px-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama toko, rumah, atau nomor SKRD..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-600 transition-all font-bold text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 px-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    <Filter size={14} /> Filter Objek
                </div>
            </div>

            {/* --- BILLING LIST --- */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                    <FileText size={14} /> Daftar Tagihan Terbit
                </h3>

                {filteredBills.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center opacity-30">
                        <CheckCircle2 size={64} className="text-green-600 mb-4" />
                        <p className="font-black uppercase text-xs tracking-widest text-slate-900">Semua Tagihan Lunas</p>
                        <p className="text-[10px] font-bold mt-1">Terima kasih atas kontribusi Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredBills.map((bill) => (
                            <div
                                key={bill.id_skrd}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all group relative overflow-hidden"
                            >
                                {/* Penanda Samping (Merah untuk Unpaid) */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500"></div>

                                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                                    {/* INFO OBJEK (Paling Menonjol) */}
                                    <div className="flex gap-5 items-start">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${bill.Objek?.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                            {bill.Objek?.kategori_objek === 'Non Rumah Tinggal' ? <Building2 size={28} /> : <Home size={28} />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Objek Retribusi:</p>
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none group-hover:text-green-700 transition-colors">
                                                {bill.Objek?.nama_objek}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                    <MapPin size={10} className="text-red-500" /> {bill.Objek?.kelurahan_objek}
                                                </span>
                                                <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase">
                                                    NPOR: {bill.Objek?.npor_objek}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* INFO TAGIHAN (Tengah) */}
                                    <div className="flex flex-col md:items-center text-left md:text-center space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masa Pajak</p>
                                        <p className="text-sm font-black text-slate-700 uppercase ">
                                            {getNamaBulan(bill.periode_bulan)} {bill.periode_tahun}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">
                                            {bill.no_skrd}
                                        </p>
                                    </div>

                                    {/* NOMINAL & AKSI (Kanan) */}
                                    <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Total Tagihan</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter ">
                                                {formatCurrency(bill.total_bayar)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelectedSkrd(bill); setShowPreview(true); }}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Preview Dokumen"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate('/pembayaran', { state: { skrdId: bill.id_skrd } })}
                                                className="bg-green-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                                            >
                                                Bayar <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Jatuh Tempo Footer Card */}
                                <div className="bg-gray-50/50 px-8 py-2 flex items-center gap-2 border-t border-slate-50">
                                    <Calendar size={12} className="text-slate-400" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ">
                                        Batas Akhir Pembayaran: <span className="text-red-500 font-black">{new Date(bill.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- FOOTER INFO --- */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                    <Info size={24} />
                </div>
                <div>
                    <h5 className="text-[11px] font-black text-blue-800 uppercase tracking-widest mb-1 leading-none ">Informasi Penagihan</h5>
                    <p className="text-[10px] text-blue-700 leading-relaxed font-medium ">
                        Daftar ini mencakup seluruh aset/objek retribusi yang terdaftar atas nama Anda. Jika terdapat ketidaksesuaian data objek, silakan ajukan perubahan melalui menu <span className="font-black underline">Layanan Mandiri</span>.
                    </p>
                </div>
            </div>

            {/* MODAL PREVIEW */}
            {showPreview && selectedSkrd && (
                <SkrdPreviewModal
                    data={selectedSkrd}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
};

// Helper internal untuk konversi bulan
const getNamaBulan = (angka) => {
    const bulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return bulan[parseInt(angka) - 1] || "-";
};

export default SkrdList;