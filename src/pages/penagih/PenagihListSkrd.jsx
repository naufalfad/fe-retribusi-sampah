import React, { useState } from 'react';
import {
    Search, Wallet, ArrowLeft, X, CreditCard,
    Banknote, QrCode, Landmark, AlertCircle,
    CheckCircle2, MapPin, FileText, RefreshCw, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PenagihListSkrd = () => {
    const navigate = useNavigate();

    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedSkrd, setSelectedSkrd] = useState(null);
    const [payMethod, setPayMethod] = useState('tunai');
    const [inputAmount, setInputAmount] = useState('');

    // Data Dummy SKRD Unpaid (Struktur API)
    const [skrdList] = useState([
        {
            id_skrd: 4,
            no_skrd: "SKRD/2026/01/IZAIH",
            total_bayar: 294350,
            status: "unpaid",
            Objek: {
                nama_objek: "Kekayaan",
                alamat_objek: "Jl. Pemda Raya No. 45",
                Subjek: { nama_subjek: "Kardi", npwrd_subjek: "1.2203.2201" }
            }
        },
        {
            id_skrd: 3,
            no_skrd: "SKRD/2026/01/T0I9J",
            total_bayar: 837000,
            status: "unpaid",
            Objek: {
                nama_objek: "Klima",
                alamat_objek: "Komp. Tegar Beriman",
                Subjek: { nama_subjek: "Kardi", npwrd_subjek: "1.2203.2201" }
            }
        }
    ]);

    // --- LOGIKA ---
    const filteredList = skrdList.filter(item =>
        item.no_skrd.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Objek.Subjek.nama_subjek.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenPayment = (skrd) => {
        setSelectedSkrd(skrd);
        setInputAmount(skrd.total_bayar); // Isi otomatis nominal sesuai tagihan
        setShowPayModal(true);
    };

    const handleProcessPayment = () => {
        alert(`Pembayaran ${payMethod.toUpperCase()} untuk ${selectedSkrd.Objek.Subjek.nama_subjek} berhasil dicatat!`);
        setShowPayModal(false);
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 px-2">
                <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 active:scale-90 transition-all">
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Cari Penagihan</h1>
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-1 italic">Database Lapangan REKAS</p>
                </div>
            </div>

            {/* --- SEARCH BOX (STICKY) --- */}
            <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-green-900/5 sticky top-2 z-30 mx-2">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari Nama / No. SKRD..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- CARDS LIST --- */}
            <div className="space-y-4 px-2">
                {filteredList.map((item) => (
                    <div key={item.id_skrd} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-red-500 text-white px-6 py-1.5 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest">Unpaid</div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{item.no_skrd}</p>
                            <h4 className="text-lg font-black text-gray-800 uppercase leading-tight">{item.Objek.Subjek.nama_subjek}</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin size={12} /> {item.Objek.alamat_objek}</p>
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
                ))}
            </div>

            {/* --- MODAL PEMBAYARAN IDENTIK DASHBOARD --- */}
            {showPayModal && selectedSkrd && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">

                        {/* Header Modal */}
                        <div className="p-8 bg-green-800 text-white relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                                    <CreditCard size={28} />
                                </div>
                                <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white">
                                    <X size={28} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Penerimaan Setoran</p>
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{selectedSkrd.Objek.Subjek.nama_subjek}</h3>
                            <p className="text-xs font-mono mt-2 opacity-80">{selectedSkrd.no_skrd}</p>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* 1. Pemilihan Metode */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Metode Pembayaran</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'tunai', icon: Banknote, label: 'Tunai' },
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

                            {/* 2. Detail Input Tunai / QR */}
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {payMethod === 'tunai' ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-100 p-8 rounded-[2rem] border border-gray-200">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Nominal Tunai Diterima</label>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-2xl font-black text-gray-400">Rp</span>
                                                <input
                                                    type="number"
                                                    value={inputAmount}
                                                    onChange={(e) => setInputAmount(e.target.value)}
                                                    className="w-full bg-transparent text-4xl font-black text-green-700 outline-none p-0 tracking-tighter"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 italic">
                                            <AlertCircle size={20} className="shrink-0" />
                                            <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                                                Pembayaran Tunai akan diteruskan ke Bendahara untuk validasi SSRD.
                                            </p>
                                        </div>
                                    </div>
                                ) : payMethod === 'qris' ? (
                                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                        <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200 border-2 border-slate-50">
                                            <QrCode size={150} className="text-slate-800" />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center leading-relaxed">
                                            Tunjukkan QRIS kepada Penyetor <br />
                                            <span className="text-lg text-slate-800">Rp {parseInt(selectedSkrd.total_bayar).toLocaleString()}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 space-y-4 text-center">
                                        <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Virtual Account BJB</p>
                                        <p className="text-3xl font-mono font-black text-purple-900 tracking-[0.1em]">7788{selectedSkrd.no_skrd.slice(-6)}</p>
                                        <p className="text-[9px] text-purple-400 font-bold uppercase italic">* Berikan nomor ini kepada wajib retribusi.</p>
                                    </div>
                                )}
                            </div>

                            {/* 3. Footer Action */}
                            <div className="pt-2">
                                <button
                                    onClick={handleProcessPayment}
                                    className="w-full bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 uppercase text-sm tracking-[0.2em] transition-all active:scale-95"
                                >
                                    {payMethod === 'tunai' ? <CheckCircle2 size={22} /> : <Printer size={22} />}
                                    {payMethod === 'tunai' ? 'Simpan Setoran' : 'Generate Kode Bayar'}
                                </button>
                                <p className="text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] mt-6">Audit Log: Juru Pungut 01</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenagihListSkrd;