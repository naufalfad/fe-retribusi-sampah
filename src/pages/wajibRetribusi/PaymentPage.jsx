import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Wallet, Star, CreditCard,
    ChevronRight, CheckCircle2, ShieldCheck,
    Info, Loader2, Landmark, QrCode,
    Banknote, Receipt, AlertCircle, Building2,
    Home, MapPin, Calendar, ExternalLink,
    X, FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import UserPaymentModal from '../../components/payment/UserPaymentModal';

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(val || 0);

const getNamaBulan = (bulan) => {
    const list = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return list[parseInt(bulan, 10) - 1] || `Bulan ${bulan}`;
};

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Ambil ID SKRD jika ada navigasi spesifik dari tombol bayar
    const skrdId = location.state?.skrdId;

    // --- STATES MODE 1: SINGLE SKRD CHECKOUT ---
    const [skrd, setSkrd] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // --- STATES MODE 2: MODUL PEMBAYARAN PER OBJEK (ALL ASSETS) ---
    const [assets, setAssets] = useState([]);
    const [selectedObjectForModal, setSelectedObjectForModal] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [alertSuccess, setAlertSuccess] = useState('');

    // --- LOAD MIDTRANS SNAP SCRIPT ---
    useEffect(() => {
        const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || import.meta.env.MIDTRANS_CLIENT_KEY || "Mid-client-6tlrMY13kNoFhcCt";

        let scriptTag = document.getElementById('midtrans-script');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'midtrans-script';
            scriptTag.src = midtransScriptUrl;
            scriptTag.setAttribute('data-client-key', clientKey);
            scriptTag.async = true;
            document.body.appendChild(scriptTag);
        }
    }, []);

    // --- FETCH DATA ---
    const fetchAllData = async () => {
        setLoadingData(true);
        try {
            if (skrdId) {
                // Mode 1: Fetch detail SKRD tunggal
                const res = await api.get(`/skrd/detail/${skrdId}`);
                if (res.data?.success) {
                    setSkrd(res.data.data);
                }
            } else {
                // Mode 2: Fetch semua objek milik user
                const res = await api.get('/objek/objek-saya');
                setAssets(Array.isArray(res.data?.data) ? res.data.data : []);
            }
        } catch (err) {
            console.error("Gagal memuat data pembayaran:", err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [skrdId]);

    // --- PERHITUNGAN BIAYA MODE 1 (SINGLE SKRD) ---
    const POINT_VALUE = 10;
    const adminFee = 0;

    const billing = useMemo(() => {
        if (!skrd) return { subtotal: 0, pointDiscount: 0, pointsUsed: 0, adminFee: 0, grandTotal: 0 };
        const subtotal = parseFloat(skrd.total_bayar) || 0;
        const userPoints = skrd.Objek?.PoinObjek?.saldo_poin || 0;
        const pointDiscount = usePoints ? Math.min(userPoints * POINT_VALUE, subtotal) : 0;
        const grandTotal = Math.max(0, subtotal - pointDiscount + adminFee);

        return {
            subtotal,
            pointDiscount,
            pointsUsed: pointDiscount / POINT_VALUE,
            adminFee,
            grandTotal
        };
    }, [skrd, usePoints]);

    // --- TOTAL UNPAID MODE 2 (ACROSS ALL OBJECTS) ---
    const totalAllUnpaid = useMemo(() => {
        if (!Array.isArray(assets)) return 0;
        return assets.reduce((total, asset) => {
            const unpaid = Array.isArray(asset.Skrds) ? asset.Skrds.filter(s => s.status === 'unpaid') : [];
            return total + unpaid.reduce((acc, curr) => acc + parseFloat(curr.total_bayar || 0), 0);
        }, 0);
    }, [assets]);

    const totalUnpaidBillsCount = useMemo(() => {
        if (!Array.isArray(assets)) return 0;
        return assets.reduce((total, asset) => {
            return total + (Array.isArray(asset.Skrds) ? asset.Skrds.filter(s => s.status === 'unpaid').length : 0);
        }, 0);
    }, [assets]);

    // --- PROSES BAYAR MODE 1 ---
    const handleProcessPayment = async () => {
        if (!skrd) return;
        setIsProcessing(true);
        try {
            const res = await api.post('/ssrd/pembayaran', {
                id_skrd: skrd.id_skrd,
                use_points: usePoints
            });

            if (res.data.success && res.data.snap_token) {
                const orderId = res.data.order_id;
                window.snap.pay(res.data.snap_token, {
                    onSuccess: async function (result) {
                        try {
                            await api.post(`/ssrd/check-status/${orderId}`);
                        } catch (e) {
                            console.error(e);
                        }
                        alert("Pembayaran Berhasil! Tagihan telah lunas.");
                        navigate('/skrd');
                    },
                    onPending: function (result) {
                        alert("Menunggu penyelesaian pembayaran.");
                        navigate('/skrd');
                    },
                    onError: function (result) {
                        alert("Pembayaran Gagal atau Dibatalkan!");
                        setIsProcessing(false);
                    },
                    onClose: function () {
                        setIsProcessing(false);
                    }
                });
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Terjadi kesalahan sistem.");
            setIsProcessing(false);
        }
    };

    if (loadingData) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-green-700" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Menyiapkan Modul Pembayaran...</p>
        </div>
    );

    // ==========================================
    // RENDER MODE 1: SINGLE SKRD CHECKOUT VIEW
    // ==========================================
    if (skrdId && skrd) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700 font-sans text-left">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 pt-4 px-2">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                            Checkout <span className="text-green-700">Pembayaran Online</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Integrasi Midtrans Secure Gateway</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objek Retribusi</p>
                                <h3 className="text-xl font-black text-slate-800 uppercase leading-none">{skrd.Objek?.nama_objek}</h3>
                                <p className="text-xs font-bold text-green-700 mt-1 uppercase">NPOR: {skrd.Objek?.npor_objek}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase">Periode Masa</p>
                                    <p className="text-xs font-bold text-slate-600 uppercase">
                                        {getNamaBulan(skrd.periode_bulan)} {skrd.periode_tahun}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-300 uppercase">Nomor Tagihan SKRD</p>
                                    <p className="text-xs font-mono font-bold text-slate-600">{skrd.no_skrd}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                            <Info className="text-blue-600 shrink-0" size={20} />
                            <p className="text-[10px] text-blue-800 font-medium leading-relaxed uppercase tracking-tight">
                                Metode pembayaran akan muncul secara otomatis melalui jendela pop-up <b>Midtrans Secure Payment</b> (BCA, Mandiri, BNI, BRI, QRIS, GoPay) setelah Anda menekan tombol konfirmasi bayar.
                            </p>
                        </div>
                    </div>

                    {/* KOLOM KANAN: RINGKASAN */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl sticky top-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4">Invoice Summary</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase">
                                    <span>Tagihan Pokok</span>
                                    <span className="text-white">{formatCurrency(billing.subtotal)}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase">
                                    <span>Biaya Layanan</span>
                                    <span className="text-emerald-400 font-bold">GRATIS</span>
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest text-center mb-1">Grand Total</p>
                                    <h2 className="text-4xl font-black text-center tracking-tighter text-white">
                                        {formatCurrency(billing.grandTotal)}
                                    </h2>
                                </div>

                                <button
                                    onClick={handleProcessPayment}
                                    disabled={isProcessing}
                                    className="w-full mt-8 bg-green-600 hover:bg-white hover:text-green-700 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                                    {isProcessing ? 'MENYIAPKAN GATEWAY...' : 'BAYAR VIA MIDTRANS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // RENDER MODE 2: MODUL PEMBAYARAN ONLINE UNTUK SETIAP OBJEK
    // ========================================================
    return (
        <div className="space-y-8 pb-32 animate-in fade-in duration-700 font-sans text-left">
            {/* --- HEADER SUMMARY --- */}
            <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                            <CreditCard size={14} /> Modul Pembayaran Online Midtrans
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                            {formatCurrency(totalAllUnpaid)}
                        </h2>
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                            Total kewajiban dari <span className="text-white font-bold">{assets.length} Objek Terdaftar</span> ({totalUnpaidBillsCount} Tagihan Aktif).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/skrd')}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/20 active:scale-95"
                        >
                            Lihat Semua SKRD
                        </button>
                    </div>
                </div>
                <Wallet className="absolute -right-10 -bottom-10 opacity-5 text-white pointer-events-none" size={260} />
            </div>

            {/* ALERT NOTIFIKASI SUKSES */}
            {alertSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span>{alertSuccess}</span>
                    </div>
                    <button onClick={() => setAlertSuccess('')} className="text-emerald-500 hover:text-emerald-800 p-1">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* --- DAFTAR OBJEK DENGAN MODUL PEMBAYARAN MASING-MASING --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Building2 className="text-green-700" size={24} /> Objek & Saluran Pembayaran
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Pilih dan lakukan pembayaran online untuk setiap objek retribusi yang Anda kelola.
                        </p>
                    </div>
                </div>

                {assets.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-16 text-center space-y-4">
                        <Building2 size={48} className="text-slate-300 mx-auto" />
                        <h4 className="text-base font-black text-slate-700 uppercase">Belum Ada Objek Terdaftar</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Anda belum memiliki objek retribusi terdaftar. Silakan hubungi dinas atau tambahkan objek baru.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map((asset) => {
                            const unpaidList = asset.Skrds?.filter(s => s.status === 'unpaid') || [];
                            const unpaidCount = unpaidList.length;
                            const totalUnpaid = unpaidList.reduce((acc, curr) => acc + parseFloat(curr.total_bayar || 0), 0);

                            return (
                                <div
                                    key={asset.id_objek}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 overflow-hidden flex flex-col"
                                >
                                    <div className="p-8 flex-grow space-y-6">
                                        {/* TOP BADGE & ICON */}
                                        <div className="flex justify-between items-start">
                                            <div className={`p-4 rounded-2xl ${asset.kategori_objek === 'Rumah Tinggal' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {asset.kategori_objek === 'Rumah Tinggal' ? <Home size={26} /> : <Building2 size={26} />}
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${unpaidCount > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                {unpaidCount > 0 ? `${unpaidCount} Tagihan` : 'Lunas'}
                                            </span>
                                        </div>

                                        {/* OBJEK IDENTITAS */}
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">NPOR</span>
                                            <p className="text-lg font-mono font-bold text-green-800">{asset.npor_objek}</p>
                                            <h4 className="text-base font-black text-slate-800 uppercase leading-snug mt-1">{asset.nama_objek}</h4>
                                            <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5 mt-1">
                                                <MapPin size={12} className="shrink-0 text-slate-400" />
                                                {asset.alamat_objek}
                                            </p>
                                        </div>

                                        {/* KOTAK STATUS TAGIHAN & JUMLAH */}
                                        <div className="pt-4 border-t border-slate-50">
                                            {unpaidCount > 0 ? (
                                                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Tunggakan Aktif</span>
                                                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/50 px-2 py-0.5 rounded">
                                                            {unpaidCount} SKRD
                                                        </span>
                                                    </div>
                                                    <p className="text-xl font-black text-amber-950 tracking-tight">
                                                        {formatCurrency(totalUnpaid)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800">
                                                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-wider">Tidak Ada Tagihan</p>
                                                        <p className="text-[10px] text-emerald-600 font-medium">Seluruh tagihan sudah lunas</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FOOTER AKSI PEMBAYARAN MIDTRANS */}
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedObjectForModal(asset);
                                                setIsPaymentModalOpen(true);
                                            }}
                                            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                                                unpaidCount > 0
                                                    ? 'bg-green-700 hover:bg-green-800 text-white shadow-green-900/20'
                                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-none'
                                            }`}
                                        >
                                            <CreditCard size={16} />
                                            {unpaidCount > 0 ? 'Bayar Online' : 'Detail Pembayaran'}
                                        </button>
                                        <button
                                            onClick={() => navigate('/skrd')}
                                            className="p-3.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl transition-all shadow-sm"
                                            title="Lihat Tagihan SKRD"
                                        >
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL PEMBAYARAN ONLINE DENGAN MIDTRANS */}
            <UserPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedObjectForModal(null);
                }}
                objectData={selectedObjectForModal}
                onSuccess={(msg) => {
                    setAlertSuccess(msg);
                    fetchAllData();
                }}
            />
        </div>
    );
};

export default PaymentPage;