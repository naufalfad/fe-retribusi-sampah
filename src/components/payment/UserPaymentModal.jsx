import React, { useState, useEffect, useMemo } from 'react';
import {
    X, CreditCard, ShieldCheck, CheckCircle2,
    AlertCircle, Loader2, ArrowRight, Building2,
    Home, Calendar, FileText, QrCode, Lock
} from 'lucide-react';
import api from '../../api/axios';

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
}).format(val || 0);

const getNamaBulan = (bulan) => {
    const list = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return list[parseInt(bulan, 10) - 1] || `Bulan ${bulan}`;
};

const UserPaymentModal = ({ isOpen, onClose, objectData, onSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [selectedSkrdId, setSelectedSkrdId] = useState(null);
    const [paymentSuccessData, setPaymentSuccessData] = useState(null);

    // --- 1. LOAD MIDTRANS SNAP SCRIPT ---
    useEffect(() => {
        if (!isOpen) return;
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
    }, [isOpen]);

    // Filter unpaid bills for this object
    const unpaidBills = useMemo(() => {
        if (!objectData || !objectData.Skrds) return [];
        return objectData.Skrds.filter(s => s.status === 'unpaid');
    }, [objectData]);

    // Select the first unpaid bill by default
    useEffect(() => {
        if (unpaidBills.length > 0) {
            setSelectedSkrdId(unpaidBills[0].id_skrd);
        } else {
            setSelectedSkrdId(null);
        }
        setPaymentSuccessData(null);
    }, [unpaidBills, isOpen]);

    const activeBill = useMemo(() => {
        return unpaidBills.find(b => b.id_skrd === selectedSkrdId) || unpaidBills[0] || null;
    }, [unpaidBills, selectedSkrdId]);

    if (!isOpen || !objectData) return null;

    // --- 2. PROSES PEMBAYARAN ONLINE DENGAN MIDTRANS ---
    const handlePayOnline = async () => {
        if (!activeBill) {
            alert("Tidak ada tagihan aktif untuk objek ini.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.post('/ssrd/pembayaran', {
                id_skrd: activeBill.id_skrd,
                use_points: false
            });

            if (res.data.success && res.data.snap_token) {
                const orderId = res.data.order_id;

                window.snap.pay(res.data.snap_token, {
                    onSuccess: async (result) => {
                        try {
                            // Konfirmasi status ke backend secara langsung
                            const confirmRes = await api.post(`/ssrd/check-status/${orderId}`);
                            setPaymentSuccessData({
                                no_skrd: activeBill.no_skrd,
                                total: activeBill.total_bayar,
                                no_ssrd: confirmRes.data?.no_ssrd || result.transaction_id,
                                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            });
                            if (onSuccess) {
                                onSuccess(`Pembayaran untuk ${objectData.nama_objek} Berhasil!`, activeBill.id_skrd);
                            }
                        } catch (err) {
                            console.error("Gagal verifikasi pembayaran:", err);
                            setPaymentSuccessData({
                                no_skrd: activeBill.no_skrd,
                                total: activeBill.total_bayar,
                                no_ssrd: result.transaction_id || orderId,
                                date: new Date().toLocaleDateString('id-ID')
                            });
                            if (onSuccess) {
                                onSuccess(`Pembayaran berhasil diproses oleh Midtrans.`, activeBill.id_skrd);
                            }
                        }
                    },
                    onPending: (result) => {
                        alert("Pembayaran Anda sedang menunggu penyelesaian via kanal yang dipilih.");
                        setIsSaving(false);
                    },
                    onError: (result) => {
                        alert("Pembayaran online dibatalkan atau gagal.");
                        setIsSaving(false);
                    },
                    onClose: () => {
                        setIsSaving(false);
                    }
                });
            } else {
                alert(res.data.message || "Gagal menginisiasi pembayaran Midtrans.");
                setIsSaving(false);
            }
        } catch (error) {
            console.error("Midtrans Error:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan koneksi ke payment gateway.");
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* MODAL HEADER */}
                <div className="bg-gradient-to-r from-green-800 to-emerald-900 text-white p-6 md:p-8 flex items-center justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                                <CreditCard size={18} className="text-white" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">
                                Pembayaran Online Mandiri
                            </span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Modul Pembayaran</h3>
                        <p className="text-xs text-white/80 font-medium">Gateway Resmi Terintegrasi Midtrans</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform active:scale-95"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
                        <CreditCard size={160} />
                    </div>
                </div>

                {/* SUCCESS VIEW */}
                {paymentSuccessData ? (
                    <div className="p-8 md:p-10 text-center space-y-6 flex-grow overflow-y-auto">
                        <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in">
                            <CheckCircle2 size={44} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Pembayaran Sukses!</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Retribusi untuk objek <span className="font-bold text-slate-800">{objectData.nama_objek}</span> telah berhasil dibayar secara online.
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-400 font-bold uppercase">No. SKRD</span>
                                <span className="font-mono font-black text-slate-800">{paymentSuccessData.no_skrd}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-400 font-bold uppercase">Bukti Transaksi</span>
                                <span className="font-mono font-black text-green-700">{paymentSuccessData.no_ssrd}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-400 font-bold uppercase">Tanggal</span>
                                <span className="font-bold text-slate-700">{paymentSuccessData.date}</span>
                            </div>
                            <div className="flex justify-between py-1 pt-2">
                                <span className="text-slate-600 font-black uppercase text-sm">Total Dibayar</span>
                                <span className="font-black text-slate-900 text-base">{formatCurrency(paymentSuccessData.total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-900/20 active:scale-95"
                        >
                            Selesai & Tutup
                        </button>
                    </div>
                ) : (
                    /* MAIN PAYMENT FORM */
                    <div className="p-6 md:p-8 space-y-6 flex-grow overflow-y-auto">

                        {/* INFO OBJEK */}
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-start gap-4">
                            <div className={`p-3.5 rounded-2xl shrink-0 ${objectData.kategori_objek === 'Rumah Tinggal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {objectData.kategori_objek === 'Rumah Tinggal' ? <Home size={24} /> : <Building2 size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                        NPOR: {objectData.npor_objek}
                                    </span>
                                </div>
                                <h4 className="text-base font-black text-slate-800 uppercase tracking-tight truncate mt-1">
                                    {objectData.nama_objek}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                    {objectData.alamat_objek}
                                </p>
                            </div>
                        </div>

                        {/* STATUS TAGIHAN */}
                        {unpaidBills.length === 0 ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center space-y-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={28} />
                                </div>
                                <h5 className="font-black text-emerald-900 text-sm uppercase tracking-wide">Objek Bebas Tunggakan</h5>
                                <p className="text-xs text-emerald-700 font-medium">
                                    Seluruh kewajiban retribusi untuk objek ini sudah lunas. Terima kasih atas partisipasi aktif Anda!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* JIKA ADA LEBIH DARI 1 TAGIHAN */}
                                {unpaidBills.length > 1 && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                            Pilih Masa Pajak Tagihan ({unpaidBills.length} Tagihan Aktif)
                                        </label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                            {unpaidBills.map((b) => (
                                                <div
                                                    key={b.id_skrd}
                                                    onClick={() => setSelectedSkrdId(b.id_skrd)}
                                                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedSkrdId === b.id_skrd
                                                        ? 'border-green-600 bg-green-50/50 shadow-sm'
                                                        : 'border-slate-100 hover:border-slate-300 bg-white'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase">
                                                            {getNamaBulan(b.periode_bulan)} {b.periode_tahun}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-slate-400">{b.no_skrd}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-black text-slate-900">
                                                            {formatCurrency(b.total_bayar)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DETAIL TAGIHAN YANG SEDANG DIPILIH */}
                                {activeBill && (
                                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-4">
                                        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tagihan Terpilih</span>
                                                <h5 className="text-sm font-black text-slate-800 uppercase">
                                                    Masa {getNamaBulan(activeBill.periode_bulan)} {activeBill.periode_tahun}
                                                </h5>
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{activeBill.no_skrd}</p>
                                            </div>
                                            {activeBill.jatuh_tempo && (
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                                                        <Calendar size={10} /> Jatuh Tempo
                                                    </span>
                                                    <span className="text-[10px] font-bold text-red-500">
                                                        {new Date(activeBill.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* RINCIAN BIAYA */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-slate-600">
                                                <span>Retribusi Pelayanan Kebersihan</span>
                                                <span className="font-bold text-slate-800">{formatCurrency(activeBill.total_bayar)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    Biaya Layanan Gateway <ShieldCheck size={12} className="text-green-600" />
                                                </span>
                                                <span className="font-bold text-green-700">GRATIS</span>
                                            </div>
                                            <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                                                <span className="font-black text-slate-900 uppercase text-xs">Total Pembayaran</span>
                                                <span className="font-black text-green-700 text-xl tracking-tight">
                                                    {formatCurrency(activeBill.total_bayar)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CHANNELS INFO */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Lock size={14} className="text-green-600 shrink-0" />
                                        <span>BCA • Mandiri • BNI • BRI • QRIS • GoPay</span>
                                    </div>
                                    <span className="text-green-700 font-black">Instan</span>
                                </div>

                                {/* ACTION BUTTON */}
                                <button
                                    onClick={handlePayOnline}
                                    disabled={isSaving || !activeBill}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-900/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-98"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Menghubungkan Gateway...
                                        </>
                                    ) : (
                                        <>
                                            Bayar Sekarang (Midtrans) <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPaymentModal;
