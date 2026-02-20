import React, { useState, useEffect } from 'react';
import {
    Search, Wallet, ArrowLeft, X, CreditCard,
    Banknote, QrCode, Landmark, AlertCircle,
    CheckCircle2, MapPin, FileText, Loader2, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PenagihListSkrd = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [skrdList, setSkrdList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedSkrd, setSelectedSkrd] = useState(null);
    const [payMethod, setPayMethod] = useState('tunai');
    const [inputAmount, setInputAmount] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isConfirming, setIsConfirming] = useState(false);

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 4000);
    };

    const fetchSkrd = async (query = '') => {
        setLoading(true);
        try {
            const response = await api.get('/skrd/list-unpaid-skrd', {
                params: {
                    search: query
                }
            });
            if (response.data.status === 'success') {
                setSkrdList(response.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data SKRD:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchSkrd(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // --- 2. HANDLERS ---
    const handleOpenPayment = (skrd) => {
        setSelectedSkrd(skrd);
        setInputAmount(skrd.total_bayar);
        setShowPayModal(true);
    };

    // Tahap 1: Munculkan Dialog Review
    const handleOpenConfirmation = () => {
        if (!inputAmount || inputAmount <= 0) {
            alert("Silakan masukkan nominal yang benar.");
            return;
        }
        setIsConfirming(true);
    };

    // Tahap 2: Eksekusi Final ke API
    const handleFinalSubmit = async () => {
        setIsConfirming(false); // Tutup dialog konfirmasi
        setShowPayModal(false); // Tutup modal utama seketika
        setIsSaving(true);      // Aktifkan loading di background

        try {
            const payload = {
                id_skrd: selectedSkrd.id_skrd,
                payment_method: payMethod,
                amount_paid: parseInt(inputAmount),
                paid_at: new Date().toISOString().split('T')[0],
                payment_status: 'pending'
            };

            await api.post('/ssrd/pembayaran-penagih', payload);
            showNotification(`Setoran ${selectedSkrd.Objek.Subjek.nama_subjek} Berhasil!`, "success");
            fetchSkrd(searchTerm);

        } catch (error) {
            showNotification("Gagal menyimpan setoran.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4 px-2">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 active:scale-90 transition-all">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Cari Penagihan</h1>
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1 italic">Database Lapangan REKAS</p>
                </div>
            </div>

            {/* Search Box Sticky */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-green-900/5 sticky top-2 z-30 mx-2">
                <div className="relative group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-green-600' : 'text-gray-400'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Cari Nama / No. SKRD..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-green-600" size={18} />}
                </div>
            </div>

            {/* List Cards */}
            <div className="space-y-4 px-2">
                {!loading && skrdList.length > 0 ? (
                    skrdList.map((item) => (
                        <div key={item.id_skrd} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-1.5 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest">Unpaid</div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{item.no_skrd}</p>
                                <h4 className="text-lg font-black text-gray-800 uppercase leading-tight">{item.Objek?.Subjek?.nama_subjek || 'N/A'}</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                    <MapPin size={12} /> {item.Objek?.alamat_objek}
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5 leading-none">Total Tagihan</p>
                                    <p className="text-lg font-black text-slate-800 tracking-tighter">Rp {parseInt(item.total_bayar).toLocaleString('id-ID')}</p>
                                </div>
                                <button
                                    onClick={() => handleOpenPayment(item)}
                                    className="bg-green-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/20 hover:bg-black active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Wallet size={16} /> Bayar
                                </button>
                            </div>
                        </div>
                    ))
                ) : !loading && (
                    <div className="py-20 text-center flex flex-col items-center opacity-30">
                        <FileText size={64} className="text-gray-300 mb-4" />
                        <p className="font-black uppercase text-xs tracking-widest">Data Tidak Ditemukan</p>
                    </div>
                )}
            </div>

            {/* Modal Pembayaran */}
            {showPayModal && selectedSkrd && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative">

                        {isConfirming && (
                            <div className="absolute inset-0 z-[110] bg-white animate-in slide-in-from-right duration-300 flex flex-col">
                                <div className="p-8 bg-slate-900 text-white text-center">
                                    <AlertCircle size={48} className="mx-auto text-amber-500 mb-4 animate-bounce" />
                                    <h3 className="text-xl font-black uppercase tracking-widest">Cek Ulang Setoran</h3>
                                    <p className="text-xs text-slate-400 mt-1">Pastikan nominal uang tunai sudah sesuai</p>
                                </div>

                                <div className="p-10 flex-grow flex flex-col justify-center space-y-8">
                                    <div className="text-center space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Uang Diterima:</p>
                                        <p className="text-4xl font-black text-green-700 tracking-tighter italic">
                                            Rp {parseInt(inputAmount || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-3">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                            <span>Penyetor:</span>
                                            <span className="text-slate-800">{selectedSkrd.Objek.Subjek.nama_subjek}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                            <span>Metode:</span>
                                            <span className="text-slate-800 font-black italic">{payMethod}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <button
                                            onClick={handleFinalSubmit}
                                            className="w-full bg-green-700 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-green-900/20 active:scale-95 transition-all"
                                        >
                                            Ya, Sudah Sesuai
                                        </button>
                                        <button
                                            onClick={() => setIsConfirming(false)}
                                            className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors"
                                        >
                                            Perbaiki Nominal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-8 bg-green-800 text-white relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/20 p-3 rounded-2xl border border-white/20"><CreditCard size={28} /></div>
                                <button onClick={() => !isSaving && setShowPayModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={28} /></button>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Setoran Lapangan</p>
                            <h3 className="text-2xl font-black uppercase tracking-tight">{selectedSkrd.Objek?.Subjek?.nama_subjek}</h3>
                            <p className="text-xs font-mono mt-2 opacity-80">{selectedSkrd.no_skrd}</p>
                        </div>

                        <div className="p-10 space-y-8 overflow-y-auto">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Metode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'tunai', icon: Banknote, label: 'TUNAI' },
                                        { id: 'qris', icon: QrCode, label: 'QRIS' },
                                        { id: 'va', icon: Landmark, label: 'V.A' }
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setPayMethod(m.id)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-90 ${payMethod === m.id ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-400 opacity-60'}`}
                                        >
                                            <m.icon size={22} />
                                            <span className="text-[9px] font-black uppercase">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {payMethod === 'tunai' ? (
                                <div className="bg-gray-100 p-8 rounded-[2rem] border border-gray-200">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Nominal Tunai Diterima</label>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-black text-gray-300">Rp</span>
                                        <input
                                            type="text"
                                            value={inputAmount ? parseInt(inputAmount).toLocaleString('id-ID') : ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setInputAmount(value);
                                            }}
                                            className="w-full bg-transparent text-4xl font-black text-green-700 outline-none p-0 tracking-tighter"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 flex flex-col items-center bg-blue-50 rounded-[2.5rem] text-center">
                                    <div className="bg-white p-4 rounded-3xl shadow-xl mb-4 border-2 border-slate-50">
                                        <QrCode size={120} className="text-slate-800" />
                                    </div>
                                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                                        Scan QRIS / Bagikan Nomor VA <br />
                                        <span className="text-lg text-slate-800 tracking-tighter">Rp {parseInt(selectedSkrd.total_bayar).toLocaleString()}</span>
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleOpenConfirmation}
                                className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase text-sm tracking-widest active:scale-95 transition-all"
                            >
                                <CheckCircle2 size={22} /> Simpan Setoran
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- LOADING OVERLAY (Full Screen Transparan) --- */}
            {isSaving && (
                <div className="fixed inset-0 z-[300] bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3 border border-gray-100">
                        <Loader2 className="animate-spin text-green-700" size={32} />
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Memproses Data...</p>
                    </div>
                </div>
            )}

            {/* --- NOTIFIKASI TOAST (Halaman Utama) --- */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md animate-in slide-in-from-bottom-10 duration-300">
                    <div className={`${toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'} text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10`}>
                        <div className={`p-2 rounded-2xl ${toast.type === 'success' ? 'bg-green-500' : 'bg-white/20'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">
                                Sistem REKAS
                            </p>
                            <p className="text-xs font-bold opacity-90">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast({ ...toast, show: false })} className="p-2 hover:bg-white/10 rounded-full transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenagihListSkrd;