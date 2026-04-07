import React, { useState, useEffect, useMemo } from 'react';
import {
    X, CreditCard, Banknote, Landmark,
    AlertCircle, CheckCircle2, Star, Calculator,
    Loader2, ArrowRight, Info, Globe
} from 'lucide-react';
import api from '../../../api/axios';

// --- HELPER FORMATTING ---
const toTitik = (val) => {
    if (!val && val !== 0) return "";
    let stringValue = val.toString().replace(/\D/g, "");
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const toAngka = (val) => {
    if (!val) return 0;
    return parseInt(val.toString().replace(/\./g, ""), 10) || 0;
};

const PaymentModal = ({ isOpen, onClose, selectedSkrd, onSuccess }) => {
    // State sekarang hanya mendukung 'tunai' atau 'online'
    const [payMethod, setPayMethod] = useState('tunai');
    const [usePoints, setUsePoints] = useState(false);
    const [inputAmount, setInputAmount] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- 1. LOAD MIDTRANS SNAP SCRIPT ---
    useEffect(() => {
        if (!isOpen) return;
        const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
        scriptTag.setAttribute('data-client-key', clientKey);
        scriptTag.async = true;
        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, [isOpen]);

    const POINT_CONVERSION = 10;
    const userPoints = selectedSkrd?.Objek?.PoinObjek?.saldo_poin || 0;
    const pointValueIdr = userPoints * POINT_CONVERSION;

    const calculation = useMemo(() => {
        const totalBill = parseInt(selectedSkrd?.total_bayar || 0);
        const discount = usePoints ? Math.min(pointValueIdr, totalBill) : 0;
        const netToPay = totalBill - discount;
        return { totalBill, discount, netToPay, pointsUsed: discount / POINT_CONVERSION };
    }, [selectedSkrd, usePoints, pointValueIdr]);

    useEffect(() => {
        if (isOpen) {
            setInputAmount(toTitik(calculation.netToPay));
        }
    }, [isOpen, calculation.netToPay]);

    if (!isOpen || !selectedSkrd) return null;

    // --- 2. LOGIKA SUBMIT ---
    const handleProcessPayment = async () => {
        if (payMethod === 'tunai') {
            setIsConfirming(true);
        } else {
            // Jika Online, panggil trigger Midtrans
            await handleMidtransInitiate();
        }
    };

    const handleMidtransInitiate = async () => {
        setIsSaving(true);
        try {
            const res = await api.post('/ssrd/pembayaran', {
                id_skrd: selectedSkrd.id_skrd,
                use_points: usePoints
            });

            if (res.data.success) {
                window.snap.pay(res.data.snap_token, {
                    onSuccess: (result) => {
                        onSuccess(`Pembayaran ${selectedSkrd.Objek.Subjek.nama_subjek} Berhasil!`, selectedSkrd.id_skrd);
                        onClose();
                    },
                    onPending: (result) => {
                        onSuccess("Menunggu pembayaran dari warga.", selectedSkrd.id_skrd);
                        onClose();
                    },
                    onClose: () => setIsSaving(false)
                });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Gagal inisiasi pembayaran online.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCashSubmit = async () => {
        setIsSaving(true);
        try {
            const payload = {
                id_skrd: selectedSkrd.id_skrd,
                payment_method: 'Tunai',
                amount_paid: toAngka(inputAmount),
                points_used: usePoints ? calculation.pointsUsed : 0,
                paid_at: new Date().toISOString().split('T')[0],
                payment_status: 'pending'
            };

            await api.post('/ssrd/pembayaran-penagih', payload);
            onSuccess(`Setoran ${selectedSkrd.Objek.Subjek.nama_subjek} Berhasil!`, selectedSkrd.id_skrd);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan setoran.");
        } finally {
            setIsSaving(false);
            setIsConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">

                {/* --- HEADER --- */}
                <div className="px-6 py-4 bg-slate-900 text-white relative shrink-0 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-600 p-2 rounded-xl shadow-lg">
                                <Banknote size={20} />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-sm font-black uppercase tracking-tight truncate max-w-[180px] sm:max-w-xs">
                                        {selectedSkrd.Objek?.Subjek?.nama_subjek}
                                    </h3>
                                    <span className="text-[8px] font-black bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                        Entry
                                    </span>
                                </div>
                                <p className="text-[10px] font-mono opacity-40 leading-none">{selectedSkrd.no_skrd}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X size={20} /></button>
                    </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 bg-gray-50/50 text-left">

                    {/* Ringkasan Tagihan */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tagihan Pokok</p>
                            <p className="text-xl font-black text-slate-800 italic">Rp {toTitik(calculation.totalBill)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Potongan Poin</p>
                            <p className="text-sm font-black text-amber-600">-{toTitik(calculation.discount)}</p>
                        </div>
                    </div>

                    {/* Redeem Poin */}
                    <div className={`p-6 rounded-[2rem] border-2 transition-all ${usePoints ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${usePoints ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                                    <Star size={20} fill={usePoints ? 'currentColor' : 'none'} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Poin Reward</h4>
                                    <p className="text-sm font-black text-slate-800">{userPoints.toLocaleString()} <small className="text-[9px] opacity-40 uppercase">Pts</small></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUsePoints(!usePoints)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${usePoints ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {usePoints ? 'Batalkan' : 'Pakai Poin'}
                            </button>
                        </div>
                    </div>

                    {/* Metode Pembayaran - Grid diubah jadi 2 kolom */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Metode Setoran</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPayMethod('tunai')}
                                className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${payMethod === 'tunai' ? 'border-green-600 bg-green-50 text-green-700 shadow-md' : 'border-white bg-white text-slate-300 opacity-60'}`}
                            >
                                <Banknote size={24} />
                                <span className="text-[10px] font-black uppercase">Tunai (Cash)</span>
                            </button>
                            <button
                                onClick={() => setPayMethod('online')}
                                className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${payMethod === 'online' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' : 'border-white bg-white text-slate-300 opacity-60'}`}
                            >
                                <Globe size={24} />
                                <span className="text-[10px] font-black uppercase">Online (Snap)</span>
                            </button>
                        </div>
                    </div>

                    {/* Input Area Dinamis */}
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {payMethod === 'tunai' ? (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner text-center space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uang Tunai Diterima</label>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-black text-slate-300 italic">Rp</span>
                                    <input
                                        type="text"
                                        value={inputAmount}
                                        onChange={(e) => setInputAmount(toTitik(e.target.value))}
                                        className="w-full bg-transparent text-4xl font-black text-slate-900 outline-none p-0 tracking-tighter"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-blue-500 uppercase italic bg-blue-50 py-2 rounded-xl">
                                    <Info size={12} /> Sisa wajib bayar: {toTitik(calculation.netToPay)}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 flex flex-col items-center bg-blue-50 rounded-[3rem] border border-blue-100 text-center">
                                <div className="p-4 bg-white rounded-3xl shadow-xl mb-6">
                                    <CreditCard size={120} className="text-slate-900 opacity-20" />
                                </div>
                                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-relaxed">
                                    Klik tombol dibawah untuk <br />
                                    Memicu Gerbang Pembayaran Online <br />
                                    <span className="text-xl text-slate-900 font-black italic">Rp {toTitik(calculation.netToPay)}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- FOOTER BUTTON --- */}
                <div className="p-8 border-t bg-white shrink-0">
                    <button
                        onClick={handleProcessPayment}
                        disabled={isSaving}
                        className="w-full bg-slate-900 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : payMethod === 'tunai' ? <CheckCircle2 /> : <CreditCard />}
                        {payMethod === 'tunai' ? 'SIMPAN SETORAN TUNAI' : 'LUNASI VIA ONLINE'}
                    </button>
                </div>

                {/* --- CONFIRMATION OVERLAY (TUNAI ONLY) --- */}
                {isConfirming && (
                    <div className="absolute inset-0 z-[110] bg-slate-950/95 backdrop-blur-md animate-in slide-in-from-right duration-300 flex flex-col text-white">
                        <div className="p-10 flex-grow flex flex-col justify-center space-y-10">
                            <div className="text-center text-white">
                                <div className="w-20 h-20 bg-amber-500 text-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-widest leading-none">Verifikasi Fisik</h3>
                                <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest italic font-bold">Pastikan uang tunai sudah diterima</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Setoran Tunai</p>
                                    <p className="text-5xl font-black text-green-400 tracking-tighter italic leading-none">Rp {inputAmount}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6">
                                <button onClick={handleCashSubmit} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-500 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                                    {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />} KONFIRMASI SELESAI
                                </button>
                                <button onClick={() => setIsConfirming(false)} className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">PERBAIKI DATA</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;