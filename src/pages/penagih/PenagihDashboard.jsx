import React, { useState } from 'react';
import {
    Search, MapPin, Users, Wallet,
    CreditCard, Navigation, CheckCircle2, Printer, RefreshCw,
    AlertCircle, Filter, X, ArrowRight, Banknote, QrCode, Landmark
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const PenagihDashboard = () => {
    const [selectedKelurahan, setSelectedKelurahan] = useState('Pakansari');
    // Tambahkan state ini di dalam komponen PenagihDashboard
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedWR, setSelectedWR] = useState(null);
    const [payMethod, setPayMethod] = useState('tunai'); // 'tunai' | 'qris' | 'va'
    const [inputAmount, setInputAmount] = useState('');

    const handleOpenPayment = (wr) => {
        setSelectedWR(wr);
        setInputAmount(wr.tagihan); // Default nominal sesuai tagihan
        setShowPayModal(true);
    };

    const handleProcessPayment = () => {
        // Logika simpan ke tabel SSRD (Status: Menunggu Validasi Bendahara)
        alert(`Pembayaran ${payMethod.toUpperCase()} untuk ${selectedWR.nama} berhasil diproses. Menunggu verifikasi Bendahara.`);
        setShowPayModal(false);
    };

    // Data Dummy Wilayah Kerja
    const stats = [
        { label: 'Total WR', val: '150', icon: <Users />, color: 'bg-blue-600' },
        { label: 'Belum Bayar', val: '42', icon: <AlertCircle />, color: 'bg-red-500' },
        { label: 'Sudah Bayar', val: '108', icon: <CheckCircle2 />, color: 'bg-green-600' },
    ];

    // Data Dummy List Penagihan di Kelurahan Terpilih
    const [wrList] = useState([
        { id: 1, nama: 'Kinan Kari', npwrd: '4.1.2.01.02.000001', alamat: 'RT 01/02', tagihan: 50000, status: 'unpaid' },
        { id: 2, nama: 'Toko Berkah', npwrd: '4.1.2.01.02.000088', alamat: 'RT 03/05', tagihan: 150000, status: 'unpaid' },
        { id: 3, nama: 'Sutisna', npwrd: '4.1.2.01.02.000042', alamat: 'RT 01/01', tagihan: 50000, status: 'paid' },
    ]);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">

            {/* --- TOP SECTION: INFO PENAGIH & WILAYAH --- */}
            <div className="bg-green-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-green-900/30 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 font-black">
                            JP
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight uppercase">Juru Pungut 01</h2>
                            <p className="text-[10px] font-bold text-green-300 uppercase tracking-[0.2em]">Petugas: Budi Santoso</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 w-fit px-4 py-2 rounded-xl border border-white/10 mt-6">
                        <MapPin size={14} className="text-green-400" />
                        <span className="text-xs font-bold uppercase tracking-widest">Wilayah: {selectedKelurahan}</span>
                    </div>
                </div>
                <Navigation className="absolute -right-6 -bottom-6 text-white/10" size={180} />
            </div>

            {/* --- STATS GRID (MOBILE RESPONSIVE) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-2xl font-black text-gray-800 italic">{s.val}</p>
                        </div>
                        <div className={`p-3 rounded-2xl text-white ${s.color} shadow-lg shadow-gray-100`}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DAFTAR PENAGIHAN PER KELURAHAN --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2 text-lg">
                        <Wallet className="text-green-700" size={20} /> Antrean Tagihan
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400"><Filter size={18} /></button>
                        <button className="p-2.5 bg-green-700 text-white rounded-xl shadow-lg shadow-green-900/20"><Search size={18} /></button>
                    </div>
                </div>

                <div className="space-y-3">
                    {wrList.map((wr) => (
                        <div
                            key={wr.id}
                            className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-95"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs ${wr.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {wr.status === 'paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-800 text-sm uppercase tracking-tight leading-none mb-1">{wr.nama}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-green-700 font-mono italic">{wr.npwrd}</span>
                                        <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{wr.alamat}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <div className="hidden sm:block">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Tagihan</p>
                                    <p className="text-sm font-black text-gray-800 tracking-tighter">Rp {wr.tagihan.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => wr.status === 'unpaid' && handleOpenPayment(wr)}
                                    className={`p-3 rounded-2xl transition-all shadow-sm ${wr.status === 'paid' ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : "p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-green-700 group-hover:text-white transition-all shadow-sm"}`}
                                >
                                    {wr.status === 'paid' ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- ACTION BUTTON: LAPORAN HARIAN --- */}
            <div className="pt-4">
                <button className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-gray-900/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
                    Tutup Setoran Hari Ini
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                    Data tersinkronisasi otomatis ke Bendahara Pusat
                </p>
            </div>
            {/* --- MODAL PEMBAYARAN DI TEMPAT --- */}
            {showPayModal && selectedWR && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">

                        {/* Header Modal */}
                        <div className="p-6 bg-green-800 text-white relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <CreditCard size={24} />
                                </div>
                                <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 leading-none mb-1">Konfirmasi Setoran</p>
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">{selectedWR.nama}</h3>
                            <p className="text-xs font-mono mt-1 opacity-80">{selectedWR.npwrd}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* 1. Pilih Metode Pembayaran */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Metode Pembayaran</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setPayMethod('tunai')}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'tunai' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                    >
                                        <Banknote size={20} className={payMethod === 'tunai' ? 'text-green-700' : 'text-gray-400'} />
                                        <span className="text-[10px] font-black uppercase">Tunai</span>
                                    </button>
                                    <button
                                        onClick={() => setPayMethod('qris')}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'qris' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                    >
                                        <QrCode size={20} className={payMethod === 'qris' ? 'text-blue-700' : 'text-gray-400'} />
                                        <span className="text-[10px] font-black uppercase">QRIS</span>
                                    </button>
                                    <button
                                        onClick={() => setPayMethod('va')}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${payMethod === 'va' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                    >
                                        <Landmark size={20} className={payMethod === 'va' ? 'text-purple-700' : 'text-gray-400'} />
                                        <span className="text-[10px] font-black uppercase">V. Account</span>
                                    </button>
                                </div>
                            </div>

                            {/* 2. Detail Pembayaran Dinamis */}
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {payMethod === 'tunai' && (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Input Uang Diterima (Rp)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-gray-400">Rp</span>
                                                <input
                                                    type="number"
                                                    value={inputAmount}
                                                    onChange={(e) => setInputAmount(e.target.value)}
                                                    className="w-full bg-transparent text-3xl font-black text-green-700 outline-none p-0 tracking-tighter"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 italic">
                                            <AlertCircle size={16} />
                                            <p className="text-[10px] font-bold uppercase tracking-tight">Status SSRD otomatis terisi "PAID" untuk divalidasi Bendahara.</p>
                                        </div>
                                    </div>
                                )}

                                {payMethod === 'qris' && (
                                    <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                                        <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-inner flex items-center justify-center font-bold text-gray-300">
                                            <QrCode size={100} className="text-slate-800" />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest text-center leading-relaxed">
                                            Tunjukkan QRIS kepada Wajib Retribusi <br /> Nominal Otomatis: <span className="text-sm">Rp {selectedWR.tagihan.toLocaleString()}</span>
                                        </p>
                                    </div>
                                )}

                                {payMethod === 'va' && (
                                    <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-4">
                                        <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Nomor Virtual Account (BJB)</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-2xl font-mono font-black text-purple-900 tracking-[0.2em]">7788{selectedWR.npwrd.slice(-8)}</p>
                                            <button className="p-2 bg-white text-purple-600 rounded-xl shadow-sm"><RefreshCw size={16} /></button>
                                        </div>
                                        <p className="text-[10px] text-purple-400 font-bold italic leading-tight">* Berlaku 24 jam. Salin dan kirim ke WhatsApp pembayar.</p>
                                    </div>
                                )}
                            </div>

                            {/* 3. Button Aksi */}
                            <button
                                onClick={handleProcessPayment}
                                className="w-full bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 uppercase text-sm tracking-[0.2em] transition-all active:scale-95"
                            >
                                {payMethod === 'tunai' ? <CheckCircle2 size={20} /> : <Printer size={20} />}
                                {payMethod === 'tunai' ? 'Selesaikan Setoran' : 'Generate Kode Bayar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenagihDashboard;