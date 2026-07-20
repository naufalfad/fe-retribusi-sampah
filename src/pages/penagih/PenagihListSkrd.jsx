import React, { useState, useEffect } from 'react';
import { Search, Wallet, ArrowLeft, MapPin, FileText, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PaymentModal from './components/PaymentModal';

const PenagihListSkrd = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [skrdList, setSkrdList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal & Toast States
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedSkrd, setSelectedSkrd] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 4000);
    };

    const fetchSkrd = async (query = '') => {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const response = await api.get('/skrd/list-unpaid-skrd', {
                params: { search: query, kelurahan: userData?.kelurahan }
            });
            if (response.data.status === 'success') setSkrdList(response.data.data);
        } catch (error) {
            console.error(error);
            showNotification("Gagal memuat data tagihan wilayah.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchSkrd(searchTerm), 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    const handleOpenPayment = (skrd) => {
        setSelectedSkrd(skrd);
        setShowPayModal(true);
    };

    const handlePaymentSuccess = (message, idPaid) => {
        showNotification(message, "success");

        setSkrdList((prevList) => {
            const newList = prevList.filter(item => item.id_skrd !== idPaid);

            if (newList.length === 0) {
                fetchSkrd(searchTerm);
            }

            return newList;
        });
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans text-left">
            {/* Header */}
            <div className="flex items-center gap-4 px-4 pt-6">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none ">
                        Cari <span className="text-green-700">Penagihan</span>
                    </h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sektor: {JSON.parse(localStorage.getItem('user'))?.kelurahan}</p>
                </div>
            </div>

            {/* Search Box */}
            <div className="px-4 sticky top-2 z-30">
                <div className="relative bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-green-900/5">
                    <Search className={`absolute left-8 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-green-600' : 'text-gray-400'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Ketik Nama atau No. SKRD..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Cards */}
            <div className="space-y-4 px-4">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-green-700" size={32} />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Menyaring Data Wilayah...</p>
                    </div>
                ) : skrdList.length > 0 ? (
                    skrdList.map((item) => (
                        <div key={item.id_skrd} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group active:scale-[0.98] transition-all">
                            <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-1.5 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ">Belum Lunas</div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{item.no_skrd}</p>
                                <h4 className="text-lg font-black text-gray-800 uppercase tracking-tight  leading-none">{item.Objek?.Subjek?.nama_subjek}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <MapPin size={12} className="text-slate-300" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.Objek?.alamat_objek}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900 p-5 rounded-[2rem] text-white">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Total Tagihan</p>
                                    <p className="text-xl font-black text-green-400  tracking-tighter">Rp {parseInt(item.total_bayar).toLocaleString('id-ID')}</p>
                                </div>
                                <button
                                    onClick={() => handleOpenPayment(item)}
                                    className="bg-green-600 hover:bg-white hover:text-green-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Wallet size={16} /> Bayar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <FileText size={64} className="mb-4" />
                        <p className="font-black uppercase text-xs">Data Tidak Ditemukan</p>
                    </div>
                )}
            </div>

            {/* --- MODAL PEMBAYARAN (ISOLATED) --- */}
            <PaymentModal
                isOpen={showPayModal}
                onClose={() => setShowPayModal(false)}
                selectedSkrd={selectedSkrd}
                onSuccess={(msg) => handlePaymentSuccess(msg, selectedSkrd.id_skrd)}
            />

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md animate-in slide-in-from-bottom-10">
                    <div className={`${toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'} text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10`}>
                        <div className={`p-2 rounded-2xl ${toast.type === 'success' ? 'bg-green-500' : 'bg-white/20'}`}>
                            {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest mb-0.5">Sistem REKAS</p>
                            <p className="text-xs font-bold opacity-90 leading-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast({ ...toast, show: false })} className="p-2"><X size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenagihListSkrd;