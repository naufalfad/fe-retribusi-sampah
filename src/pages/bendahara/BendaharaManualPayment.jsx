import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    Search, FileText, Banknote,
    X, CheckCircle2, Calculator, Calendar,
    AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import SkrdPreviewModal from '../dlh/components/SkrdPreviewModal';

const BendaharaManualPayment = () => {
    // --- STATES ---
    const [skrdList, setSkrdList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSkrdPreview, setShowSkrdPreview] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        method: 'Tunai',
        amount: '',
        paidAt: new Date().toISOString().split('T')[0]
    });

    const formatRupiah = (value) => {
        if (!value) return '';
        const numberString = value.replace(/[^,\d]/g, '');
        const split = numberString.split(',');
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        return rupiah;
    };

    // --- FETCH DATA DARI API ---
    const fetchSKRD = async () => {
        setLoading(true);
        try {
            // Ganti URL dengan base URL API Anda
            const response = await api.get('/skrd/list-skrd');
            if (response.data.status === "success") {
                setSkrdList(response.data.data);
            }
        } catch (err) {
            setError("Gagal mengambil data SKRD");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSKRD();
    }, []);

    // --- LOAD MIDTRANS SNAP SCRIPT ---
    useEffect(() => {
        if (!showPaymentModal) return;
        const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY || "";

        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
        scriptTag.setAttribute('data-client-key', clientKey);
        scriptTag.async = true;
        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, [showPaymentModal]);

    // --- FILTER SEARCH ---
    const filteredData = skrdList.filter(item =>
        item.no_skrd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Objek.Subjek.nama_subjek.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Objek.Subjek.npwrd_subjek.includes(searchTerm)
    );

    // --- HANDLERS ---
    const handleOpenPayment = (item) => {
        setSelectedData(item);
        setPaymentForm({ ...paymentForm, amount: formatRupiah(item.total_bayar.toString()) });
        setShowPaymentModal(true);
    };

    const processPayment = async (e) => {
        e.preventDefault();

        if (!selectedData) return;

        setIsProcessing(true);

        try {
            if (paymentForm.method === 'Online') {
                const response = await api.post('/ssrd/pembayaran', {
                    id_skrd: selectedData.id_skrd,
                    use_points: false
                });

                if (response.data.success) {
                    window.snap.pay(response.data.snap_token, {
                        onSuccess: (result) => {
                            alert("Pembayaran Online Berhasil!");
                            setShowPaymentModal(false);
                            setSelectedData(null);
                            fetchSKRD();
                        },
                        onPending: (result) => {
                            alert("Menunggu pembayaran online diselesaikan.");
                            setShowPaymentModal(false);
                            setSelectedData(null);
                            fetchSKRD();
                        },
                        onClose: () => setIsProcessing(false)
                    });
                }
            } else {
                const payload = {
                    id_skrd: selectedData.id_skrd,
                    payment_method: 'Tunai',
                    amount_paid: Number(paymentForm.amount.replace(/\./g, '')),
                    paid_at: paymentForm.paidAt
                };

                if (Number(paymentForm.amount.replace(/\./g, '')) !== Number(selectedData.total_bayar)) {
                    alert('Nominal pembayaran harus sama dengan total tagihan');
                    setIsProcessing(false);
                    return;
                }

                const response = await api.post(
                    '/ssrd/penetapan-ssrd',
                    payload
                );

                alert(`SSRD berhasil diterbitkan\nNo SSRD: ${response.data.data_ssrd.no_ssrd}`);

                setShowPaymentModal(false);
                setSelectedData(null);
                fetchSKRD();
            }

        } catch (error) {
            console.error('Gagal memproses pembayaran:', error);

            alert(
                error.response?.data?.message ||
                'Terjadi kesalahan saat memproses pembayaran'
            );
        } finally {
            if (paymentForm.method !== 'Online') {
                setIsProcessing(false);
            }
        }
    };


    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Pembayaran Loket</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 ">Input pelunasan tagihan secara langsung di Kantor Dinas.</p>
                </div>
                <button
                    onClick={fetchSKRD}
                    className="p-3 bg-white border rounded-xl hover:bg-gray-50 text-slate-600 transition-all"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                    type="text"
                    placeholder="Cari No. SKRD, Nama Subjek, atau NPWRD..."
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Loading & Error State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4" />
                    <p className="font-bold">Memuat Data SKRD...</p>
                </div>
            ) : error ? (
                <div className="p-10 text-center bg-red-50 text-red-600 rounded-[2rem] border border-red-100">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-6">Wajib Retribusi / Subjek</th>
                                    <th className="p-6">Nomor SKRD</th>
                                    <th className="p-6">Jatuh Tempo</th>
                                    <th className="p-6">Total Bayar</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.map((item) => (
                                    <tr key={item.id_skrd} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6">
                                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight">
                                                {item.Objek.Subjek.nama_subjek}
                                            </p>
                                            <p className="text-[10px] font-bold text-green-700 font-mono ">
                                                NPWRD: {item.Objek.Subjek.npwrd_subjek}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase">Objek: {item.Objek.nama_objek}</p>
                                        </td>
                                        <td className="p-6 font-bold text-xs text-slate-500">{item.no_skrd}</td>
                                        <td className="p-6 font-bold text-[10px] text-slate-400 uppercase">
                                            {new Date(item.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="p-6 font-black text-slate-800 text-sm">
                                            Rp {parseInt(item.total_bayar).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-6">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedData(item); setShowSkrdPreview(true); }}
                                                    className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                {item.status === 'unpaid' && (
                                                    <button
                                                        onClick={() => handleOpenPayment(item)}
                                                        className="bg-green-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                                                    >
                                                        Bayar Loket
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Input Pembayaran Loket */}
            {showPaymentModal && selectedData && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">

                        {/* 1. Header Modal: Identitas Utama */}
                        <div className="p-8 bg-green-700 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                                    <Calculator size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Konfirmasi Pelunasan</h3>
                                    <p className="text-[10px] text-green-200 font-bold mt-1 uppercase tracking-widest ">
                                        Input Data SSRD - {selectedData.Objek.Subjek.nama_subjek}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all text-white"><X size={28} /></button>
                            <Banknote className="absolute -right-6 -bottom-6 opacity-10" size={150} />
                        </div>

                        {/* 2. Informasi Tagihan (Visual Box) - TAMBAHAN TERBARU */}
                        <div className="px-10 pt-8">
                            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-slate-200">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor SKRD Terpilih</p>
                                    <p className="text-lg font-mono font-black text-green-400 tracking-tighter">{selectedData.no_skrd}</p>
                                </div>
                                <div className="h-10 w-[1px] bg-slate-700 hidden md:block"></div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Wajib Bayar</p>
                                    <p className="text-2xl font-black text-white">Rp {parseInt(selectedData.total_bayar).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Form Input Pembayaran */}
                        <form onSubmit={processPayment} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-slate-500">Metode Bayar</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-600 font-bold text-sm"
                                        value={paymentForm.method}
                                        onChange={(e) => {
                                            const selectedMethod = e.target.value;
                                            setPaymentForm({
                                                ...paymentForm,
                                                method: selectedMethod,
                                                amount: selectedMethod === 'Online'
                                                    ? formatRupiah(selectedData.total_bayar.toString())
                                                    : paymentForm.amount
                                            });
                                        }}
                                    >
                                        <option value="Tunai">Tunai / Cash</option>
                                        <option value="Online">Online / Midtrans</option>
                                    </select>
                                </div>
                                {paymentForm.method === 'Tunai' ? (
                                    <div className="space-y-1.5 animate-in fade-in">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-slate-500">Tanggal Bayar</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="date"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-sm"
                                                value={paymentForm.paidAt}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 animate-in fade-in">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-slate-500">Status Pembayaran</label>
                                        <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-xs uppercase ">
                                            Midtrans Gateway Active
                                        </div>
                                    </div>
                                )}
                                <div className="col-span-2 space-y-1.5 pt-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-slate-500">
                                        {paymentForm.method === 'Online' ? 'Nominal Pembayaran Online (Rp)' : 'Nominal Tunai Yang Diterima (Rp)'}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-700 font-black text-xl">Rp</div>
                                        <input
                                            type="text"
                                            readOnly={paymentForm.method === 'Online'}
                                            className={`w-full pl-16 pr-6 py-6 border-2 rounded-3xl outline-none text-3xl font-black tracking-tighter shadow-inner ${
                                                paymentForm.method === 'Online'
                                                    ? 'bg-gray-100 border-gray-200 text-slate-400 cursor-not-allowed'
                                                    : 'bg-green-50 border-green-100 text-green-700 focus:border-green-600'
                                            }`}
                                            value={paymentForm.amount}
                                            onChange={(e) => {
                                                if (paymentForm.method !== 'Online') {
                                                    const formatted = formatRupiah(e.target.value);
                                                    setPaymentForm({ ...paymentForm, amount: formatted });
                                                }
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold  ml-2 mt-1">
                                        {paymentForm.method === 'Online'
                                            ? '* Nominal otomatis terkunci sesuai tagihan untuk gerbang pembayaran online.'
                                            : '* Pastikan nominal tepat sesuai nilai tagihan di atas.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-5 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="flex-[2] py-5 bg-green-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-green-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    {paymentForm.method === 'Online' ? 'Bayar via Midtrans' : 'Simpan & Terbitkan SSRD'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal SKRD Preview */}
            {showSkrdPreview && selectedData && (
                <SkrdPreviewModal
                    data={{
                        ...selectedData,
                        nama: selectedData.Objek.Subjek.nama_subjek,
                        npwrd: selectedData.Objek.Subjek.npwrd_subjek,
                        total: parseInt(selectedData.total_bayar),
                        alamat: selectedData.Objek.alamat_objek
                    }}
                    onClose={() => setShowSkrdPreview(false)}
                />
            )}
        </div>
    );
};

export default BendaharaManualPayment;