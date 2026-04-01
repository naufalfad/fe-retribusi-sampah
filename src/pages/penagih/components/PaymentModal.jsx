import React, { useState, useEffect, useMemo } from 'react';
import {
    X, CreditCard, Banknote, QrCode, Landmark,
    AlertCircle, CheckCircle2, Star, Calculator,
    Loader2, ArrowRight, Wallet, History, Info
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
    const [payMethod, setPayMethod] = useState('tunai');
    const [usePoints, setUsePoints] = useState(false);
    const [inputAmount, setInputAmount] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Konfigurasi Poin (1 Poin = Rp 10)
    const POINT_CONVERSION = 10;
    const userPoints = selectedSkrd?.Objek?.PoinObjek?.saldo_poin || 0;
    const pointValueIdr = userPoints * POINT_CONVERSION;

    const calculation = useMemo(() => {
        const totalBill = parseInt(selectedSkrd?.total_bayar || 0);
        const discount = usePoints ? Math.min(pointValueIdr, totalBill) : 0;
        const netToPay = totalBill - discount;
        return { totalBill, discount, netToPay, pointsUsed: discount / POINT_CONVERSION };
    }, [selectedSkrd, usePoints, pointValueIdr]);

    // Set default input saat modal buka atau poin diaktifkan
    useEffect(() => {
        if (isOpen) {
            setInputAmount(toTitik(calculation.netToPay));
        }
    }, [isOpen, calculation.netToPay]);

    if (!isOpen || !selectedSkrd) return null;

    const handleFinalSubmit = async () => {
        setIsConfirming(false);
        setIsSaving(true);

        try {
            const payload = {
                id_skrd: selectedSkrd.id_skrd,
                payment_method: payMethod,
                amount_paid: toAngka(inputAmount), // Angka murni ke BE
                points_used: usePoints ? calculation.pointsUsed : 0,
                paid_at: new Date().toISOString().split('T')[0],
                payment_status: 'pending'
            };
            if (usePoints && userPoints <= 0) {
                alert("Saldo poin tidak tersedia");
                return;
            }

            await api.post('/ssrd/pembayaran-penagih', payload);
            onSuccess(`Setoran ${selectedSkrd.Objek.Subjek.nama_subjek} Berhasil!`);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan setoran.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Modal Container: h-[92vh] memberikan ruang agar penagih merasa leluasa */}
            <div className="bg-white w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">

                {/* --- 1. HEADER (Official Style) --- */}
                <div className="px-6 py-4 bg-slate-900 text-white relative shrink-0 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Ikon dibuat lebih kecil */}
                            <div className="bg-green-600 p-2 rounded-xl shadow-lg shadow-green-900/40">
                                <Banknote size={20} />
                            </div>

                            {/* Teks disusun lebih rapat */}
                            <div className="text-left">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="text-sm font-black uppercase tracking-tight truncate max-w-[180px] sm:max-w-xs">
                                        {selectedSkrd.Objek?.Subjek?.nama_subjek}
                                    </h3>
                                    <span className="text-[8px] font-black bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                        Entry
                                    </span>
                                </div>
                                <p className="text-[10px] font-mono opacity-40 leading-none">
                                    {selectedSkrd.no_skrd}
                                </p>
                            </div>
                        </div>

                        {/* Tombol close tetap mudah dijangkau namun ringkas */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* --- 2. SCROLLABLE CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-gray-50/50">

                    {/* INFO TAGIHAN UTAMA */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tagihan Pokok</p>
                            <p className="text-xl font-black text-slate-800 italic">{toTitik(calculation.totalBill)}</p>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-100"></div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase italic border border-red-100">Unpaid</span>
                        </div>
                    </div>

                    {/* REDEEM POIN SECTION */}
                    <div className={`p-6 rounded-[2rem] border-2 transition-all group ${usePoints ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-2xl transition-colors ${usePoints ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-300'}`}>
                                    <Star size={20} fill={usePoints ? 'currentColor' : 'none'} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Reward Lingkungan</h4>
                                    <p className="text-sm font-black text-slate-800 leading-none">{userPoints.toLocaleString()} <small className="text-[10px] opacity-40 uppercase">Pts</small></p>
                                    <p className="text-[9px] font-bold text-amber-600 mt-1 uppercase italic">Nilai: Rp {pointValueIdr.toLocaleString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setUsePoints(!usePoints)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${usePoints ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {usePoints ? 'Batalkan' : 'Gunakan'}
                            </button>
                        </div>
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div className="space-y-4 text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Metode Setoran</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'tunai', icon: Banknote, label: 'TUNAI' },
                                { id: 'qris', icon: QrCode, label: 'QRIS' },
                                { id: 'va', icon: Landmark, label: 'V.A' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setPayMethod(m.id)}
                                    className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${payMethod === m.id ? 'border-green-600 bg-green-50 text-green-700 shadow-md' : 'border-white bg-white text-slate-300 opacity-60'}`}
                                >
                                    <m.icon size={24} />
                                    <span className="text-[9px] font-black uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* INPUT AREA DINAMIS */}
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {payMethod === 'tunai' ? (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner text-center space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nominal Tunai Diterima</label>
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
                            <div className="p-10 flex flex-col items-center bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center">
                                <div className="p-4 bg-white rounded-3xl shadow-xl mb-6">
                                    <QrCode size={120} className="text-slate-900" />
                                </div>
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-relaxed">
                                    Arahkan Wajib Retribusi Scan QRIS <br />
                                    <span className="text-xl text-slate-900 tracking-tighter italic">Rp {toTitik(calculation.netToPay)}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 3. BOTTOM BUTTON --- */}
                <div className="p-8 border-t bg-white shrink-0">
                    <button
                        onClick={() => setIsConfirming(true)}
                        className="w-full bg-slate-900 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        Simpan & Terbitkan SSRD <ArrowRight size={18} />
                    </button>
                </div>

                {/* --- 4. OVERLAY KONFIRMASI (FINAL CHECK) --- */}
                {isConfirming && (
                    <div className="absolute inset-0 z-[110] bg-slate-950/95 backdrop-blur-md animate-in slide-in-from-right duration-300 flex flex-col text-white">
                        <div className="p-10 flex-grow flex flex-col justify-center space-y-10">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-amber-500 text-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-widest leading-none">Validasi Akhir</h3>
                                <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest italic font-bold">Pastikan uang fisik sudah di tangan</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Setoran Diterima</p>
                                    <p className="text-5xl font-black text-green-400 tracking-tighter italic leading-none">
                                        Rp {inputAmount}
                                    </p>
                                </div>

                                {usePoints && (
                                    <div className="flex justify-between items-center px-8 text-amber-500 font-black text-[10px] uppercase">
                                        <span>Potongan Poin:</span>
                                        <span>-Rp {toTitik(calculation.discount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-6">
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={isSaving}
                                    className="w-full bg-green-600 hover:bg-green-500 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                                    KONFIRMASI SELESAI
                                </button>
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="w-full py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest"
                                >
                                    PERBAIKI DATA
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;