import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Wallet, Star, CreditCard,
    ChevronRight, CheckCircle2, ShieldCheck,
    Info, Loader2, Landmark, QrCode,
    Banknote, Receipt, AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Ambil ID SKRD dari navigasi sebelumnya
    const skrdId = location.state?.skrdId;

    // --- STATES ---
    const [skrd, setSkrd] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [usePoints, setUsePoints] = useState(false);

    // --- 2. LOAD MIDTRANS SNAP SCRIPT OTOMATIS ---
    useEffect(() => {
        const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;

        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
        scriptTag.setAttribute('data-client-key', clientKey);
        scriptTag.async = true;

        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, []);

    // --- 3. FETCH DETAIL TAGIHAN DARI BACKEND ---
    useEffect(() => {
        if (!skrdId) {
            navigate('/skrd');
            return;
        }

        const fetchDetail = async () => {
            try {
                const res = await api.get(`/skrd/detail/${skrdId}`);
                if (res.data.success) {
                    setSkrd(res.data.data);
                }
            } catch (err) {
                console.error(err);
                alert("Gagal memuat detail tagihan.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchDetail();
    }, [skrdId, navigate]);

    // --- 4. PERHITUNGAN BIAYA ---
    const POINT_VALUE = 10; // 1 Poin = Rp 10
    const adminFee = 0;

    const billing = useMemo(() => {
        if (!skrd) return { subtotal: 0, pointDiscount: 0, pointsUsed: 0, adminFee: 0, grandTotal: 0 };

        const subtotal = parseFloat(skrd.total_bayar);
        const userPoints = skrd.Objek?.PoinObjek?.saldo_poin || 0;

        const pointDiscount = usePoints ? Math.min(userPoints * POINT_VALUE, subtotal) : 0;
        const grandTotal = subtotal - pointDiscount + adminFee;

        return {
            subtotal,
            pointDiscount,
            pointsUsed: pointDiscount / POINT_VALUE,
            adminFee,
            grandTotal
        };
    }, [skrd, usePoints]);

    // --- 5. HANDLE PROSES BAYAR (INTEGRASI BACKEND & MIDTRANS) ---
    const handleProcessPayment = async () => {
        setIsProcessing(true);
        try {
            // Panggil API backend yang sudah kita buat sebelumnya
            const res = await api.post('/ssrd/pembayaran', {
                id_skrd: skrd.id_skrd,
                use_points: usePoints
            });

            if (res.data.success) {
                // Eksekusi Snap Midtrans
                window.snap.pay(res.data.snap_token, {
                    onSuccess: function (result) {
                        alert("Pembayaran Berhasil!");
                        navigate('/skrd');
                    },
                    onPending: function (result) {
                        alert("Menunggu Pembayaran...");
                        navigate('/skrd');
                    },
                    onError: function (result) {
                        alert("Pembayaran Gagal!");
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
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Menyiapkan Lembar Pembayaran...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700 font-sans text-left">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 pt-4 px-2">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                        Checkout <span className="text-green-700">Pembayaran</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Sistem Integrasi Midtrans Secure</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">

                {/* KOLOM KIRI */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objek Retribusi</p>
                            <h3 className="text-xl font-black text-slate-800 uppercase leading-none italic">{skrd.Objek?.nama_objek}</h3>
                            <p className="text-xs font-bold text-green-700 mt-1 uppercase">NPOR: {skrd.Objek?.npor_objek}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase">Periode</p>
                                <p className="text-xs font-bold text-slate-600 uppercase italic">{skrd.periode_bulan}/{skrd.periode_tahun}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase">Nomor Tagihan</p>
                                <p className="text-xs font-mono font-bold text-slate-600">{skrd.no_skrd}</p>
                            </div>
                        </div>
                    </div>

                    {/* REDEEM POINT BOX */}
                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all group ${usePoints ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl transition-colors ${usePoints ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                                    <Star size={24} fill={usePoints ? 'currentColor' : 'none'} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Gunakan Poin Reward</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Saldo: <span className="text-emerald-600">{skrd.Objek?.PoinObjek?.saldo_poin || 0} PTS</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUsePoints(!usePoints)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${usePoints ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}
                            >
                                {usePoints ? 'Batalkan' : 'Pakai Poin'}
                            </button>
                        </div>
                        {usePoints && (
                            <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                <p className="text-[10px] font-bold text-emerald-800 uppercase italic">Potongan Otomatis:</p>
                                <p className="text-lg font-black text-emerald-600 tracking-tighter">- Rp {billing.pointDiscount.toLocaleString('id-ID')}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4 italic">
                        <Info className="text-blue-600 shrink-0" size={20} />
                        <p className="text-[10px] text-blue-800 font-medium leading-relaxed uppercase tracking-tight">
                            Metode pembayaran akan muncul secara otomatis melalui jendela pop-up <b>Midtrans Secure Payment</b> setelah Anda menekan tombol konfirmasi.
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
                                <span className="text-white">Rp {billing.subtotal.toLocaleString('id-ID')}</span>
                            </div>

                            {usePoints && (
                                <div className="flex justify-between items-center text-sm font-bold text-emerald-400 uppercase italic">
                                    <span>Poin Terpakai ({billing.pointsUsed})</span>
                                    <span>- Rp {billing.pointDiscount.toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase">
                                <span>Biaya Layanan</span>
                                <span className="text-white">Rp {billing.adminFee.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/10">
                                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest text-center mb-1">Grand Total</p>
                                <h2 className="text-5xl font-black text-center tracking-tighter italic text-white">
                                    Rp {billing.grandTotal.toLocaleString('id-ID')}
                                </h2>
                            </div>

                            <button
                                onClick={handleProcessPayment}
                                disabled={isProcessing}
                                className="w-full mt-10 bg-green-600 hover:bg-white hover:text-green-700 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                                {isProcessing ? 'MENYIAPKAN...' : 'KONFIRMASI BAYAR'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;