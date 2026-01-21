import React, { useState } from 'react';
import {
    Landmark, FileSearch, Printer, Eye,
    X, ArrowRight, CheckCircle, AlertCircle, RotateCcw, ThumbsDown
} from 'lucide-react';

const BendaharaSsrd = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [showReconModal, setShowReconModal] = useState(false);
    const [showSsrdPreview, setShowSsrdPreview] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // Dummy Data yang diperluas sesuai alur SKRD ke SSRD
    const [reconQueue] = useState([
        {
            id: 1,
            nama_wr: 'TOKO KUE LEZAT',
            npwrd: '4.1.2.01.02.000088',
            alamat_wr: 'Jl. Raya Cibinong No. 12, Pakansari, Bogor',
            no_skrd: '001/SKRD/DLH/2026',
            tgl_skrd: '10 Januari 2026',
            nominal_skrd: 75000,
            nominal_input: 75000, // MATCH
            masa: 'JANUARI 2026',
            penyetor: 'Siti Aminah',
            metode: 'Transfer Bank',
            bank_asal: 'BCA',
            norek_asal: '0123456789',
            tgl_bayar: '09/01/2026',
            terbilang: 'Tujuh Puluh Lima Ribu Rupiah',
            bukti_img: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg',
        },
        {
            id: 2,
            nama: 'PT. MAJU JAYA SEJAHTERA',
            nama_wr: 'PT. MAJU JAYA SEJAHTERA',
            npwrd: '4.1.2.01.02.000001',
            alamat_wr: 'Jl. Tegar Beriman No. 45, Pakansari',
            no_skrd: '002/SKRD/DLH/2026',
            tgl_skrd: '11 Januari 2026',
            nominal_skrd: 500000,
            nominal_input: 500000, // MATCH
            masa: 'JANUARI 2026',
            penyetor: 'Andi Perdana (Admin)',
            metode: 'Transfer Bank',
            bank_asal: 'BJB',
            norek_asal: '4455667788',
            tgl_bayar: '12/01/2026',
            terbilang: 'Lima Ratus Ribu Rupiah',
            bukti_img: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg',
        },
        {
            id: 3,
            nama_wr: 'WARUNG NASI BAROKAH',
            npwrd: '4.1.2.01.02.000122',
            alamat_wr: 'Jl. Keadilan No. 5, Cibinong',
            no_skrd: '005/SKRD/DLH/2026',
            tgl_skrd: '12 Januari 2026',
            nominal_skrd: 50000,
            nominal_input: 45000, // KURANG BAYAR (Alert Merah)
            masa: 'JANUARI 2026',
            penyetor: 'Mulyono',
            metode: 'QRIS',
            bank_asal: 'GOPAY',
            norek_asal: '0812xxxx',
            tgl_bayar: '13/01/2026',
            terbilang: 'Empat Puluh Lima Ribu Rupiah',
            bukti_img: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg',
        }
    ]);

    // --- DATA DITOLAK (PERLU PERBAIKAN) ---
    const [rejectedQueue] = useState([
        {
            id: 101,
            nama_wr: 'RESTORAN PADANG JAYA',
            npwrd: '4.1.2.01.02.000999',
            no_skrd: '088/SKRD/2025',
            nominal_skrd: 150000,
            alasan_tolak: 'Bukti transfer buram, nomor referensi tidak terlihat jelas.',
            tgl_ditolak: '12/01/2026',
            status: 'Menunggu Update User'
        },
        {
            id: 102,
            nama_wr: 'H. SUDRAJAT (PRIBADI)',
            npwrd: '4.1.2.01.02.000777',
            no_skrd: '090/SKRD/2025',
            nominal_skrd: 50000,
            alasan_tolak: 'Dana tidak ditemukan pada mutasi bank tanggal tersebut.',
            tgl_ditolak: '13/01/2026',
            status: 'Ditolak Permasalahan Bank'
        }
    ]);

    const handleOpenRecon = (data) => {
        setSelectedData(data);
        setShowReconModal(true);
    };

    const handleApprove = (data) => {
        setSelectedData(data);
        setShowSsrdPreview(true);
    };

    return (
        <div className="space-y-6 pb-20 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Audit Rekonsiliasi & SSRD</h1>
                    <p className="text-slate-500 font-medium italic text-sm">Verifikasi final mutasi Kas Daerah untuk penerbitan dokumen pelunasan sah.</p>
                </div>
                {/* Tab Switcher Antrean */}
                <div className="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit border border-slate-200">
                    <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500'}`}>ANTREAN MASUK</button>
                    <button onClick={() => setActiveTab('rejected')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>DITOLAK / PERBAIKAN</button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                {/* Info Rekening Header */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 p-8 rounded-[2.5rem] text-white mb-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                            <Landmark size={40} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-1">Kas Daerah Kabupaten Bogor (BJB)</p>
                            <p className="text-3xl font-mono font-black tracking-widest">00123-4455-6677</p>
                        </div>
                    </div>
                    <div className="relative z-10 text-right mt-6 md:mt-0">
                        <span className="flex items-center gap-2 text-[10px] font-black text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live Bank Sync Active
                        </span>
                    </div>
                    <Landmark className="absolute -right-10 -bottom-10 opacity-5 text-white" size={250} />
                </div>

                {/* Content Area Based on Tab */}
                {activeTab === 'pending' ? (
                    <div className="space-y-6">
                        {reconQueue.map((item) => (
                            <div key={item.id} className="group border-2 border-slate-50 rounded-[2.5rem] p-8 hover:border-green-500 transition-all bg-slate-50/30 hover:bg-white flex flex-col lg:flex-row gap-10 items-center">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><FileSearch size={20} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Referensi SKRD</p>
                                            <h4 className="text-lg font-black text-slate-800">{item.nama_wr}</h4>
                                            <p className="text-[10px] font-bold text-green-700 font-mono italic">{item.no_skrd}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 border-t border-slate-100 pt-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Input Penyetor</p>
                                            <p className="text-sm font-bold text-slate-700">{item.penyetor} ({item.bank_asal})</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase">Nominal</p>
                                            <p className="text-sm font-black text-green-700">Rp {item.nominal_input.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleOpenRecon(item)}
                                        className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                    >
                                        <RotateCcw size={16} /> Review Data
                                    </button>
                                    <button className="flex items-center space-x-2 p-4 text-red-600 bg-red-50 rounded-[1.5rem] font-black hover:bg-red-100 border border-red-100 transition-all ease-in-out duration-200">
                                        <ThumbsDown size={20} />
                                        <span>Tolak</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rejectedQueue.map((item) => (
                            <div key={item.id} className="border-2 border-red-50 rounded-[2.5rem] p-8 bg-white shadow-sm flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
                                {/* Badge Status di Pojok */}
                                <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest">
                                    Ditolak
                                </div>

                                <div className="flex-1 w-full">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Objek Retribusi</p>
                                    <h4 className="text-lg font-black text-slate-800 leading-tight">{item.nama_wr}</h4>
                                    <p className="text-xs font-bold text-red-600 font-mono mt-1 italic">{item.no_skrd}</p>

                                    <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
                                        <AlertCircle className="text-red-500 shrink-0" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-red-700 uppercase">Alasan Penolakan:</p>
                                            <p className="text-xs font-bold text-red-800 italic">"{item.alasan_tolak}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Ditolak Pada: {item.tgl_ditolak}</p>
                                    <div className="flex gap-2">
                                        <button className="p-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all"><Eye size={20} /></button>
                                        <button className="px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all">Hubungi User</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- WORKSPACE AUDIT: SKRD VS BUKTI BAYAR --- */}
            {showReconModal && selectedData && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
                    <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">

                        {/* Modal Header */}
                        <div className="p-6 bg-slate-50 border-b flex justify-between items-center px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><Landmark size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Workspace Rekonsiliasi Keuangan</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Membandingkan SKRD Resmi vs Realisasi Transfer Bank</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReconModal(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><X size={32} /></button>
                        </div>

                        {/* Modal Body: FULL DUAL VIEW */}
                        <div className="flex-1 flex overflow-hidden bg-slate-200 p-4 gap-4">

                            {/* SISI KIRI: Dokumen SKRD (Asli Tagihan) */}
                            <div className="flex-1 bg-white rounded-2xl shadow-inner border border-slate-300 overflow-y-auto p-10 custom-scrollbar relative">
                                <div className="sticky top-0 right-0 bg-blue-600 text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-lg text-[10px] font-black uppercase tracking-widest z-10 -mr-10 -mt-10 mb-6 w-fit ml-auto">
                                    Dokumen Tagihan (SKRD)
                                </div>

                                {/* Format SKRD Lampiran III Digital */}
                                <div className="border-[1.5px] border-black p-6 font-serif text-[10px] leading-tight text-black mx-auto max-w-[21cm]">
                                    <div className="flex border-2 border-black mb-4">
                                        <div className="w-1/2 p-2 border-r-2 border-black font-bold uppercase">DLH KABUPATEN BOGOR</div>
                                        <div className="w-1/2 p-2 text-center font-black uppercase italic">Surat Ketetapan Retribusi Daerah</div>
                                    </div>
                                    <div className="space-y-1 mb-4 border-b-2 border-black pb-4">
                                        <p>NAMA : <strong>{selectedData.nama_wr}</strong></p>
                                        <p>ALAMAT : {selectedData.alamat_wr}</p>
                                        <p>NPWRD : <span className="font-mono">{selectedData.npwrd}</span></p>
                                        <p>NO SKRD : <strong>{selectedData.no_skrd}</strong></p>
                                    </div>
                                    <table className="w-full border-collapse border-2 border-black mb-4">
                                        <thead className="bg-slate-50">
                                            <tr><th className="border-2 border-black p-1">URAIAN RETRIBUSI</th><th className="border-2 border-black p-1 w-24">JUMLAH (Rp)</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr className="h-20"><td className="border-2 border-black p-2 italic">Pelayanan Kebersihan Masa {selectedData.masa}</td><td className="border-2 border-black p-2 text-right">{selectedData.nominal_skrd.toLocaleString()}</td></tr>
                                            <tr className="font-bold bg-slate-50"><td className="border-2 border-black p-2 text-right uppercase italic text-[8px]">Total Retribusi:</td><td className="border-2 border-black p-2 text-right">Rp. {selectedData.nominal_skrd.toLocaleString()}</td></tr>
                                        </tbody>
                                    </table>
                                    <p className="italic font-bold text-[8px]">Terbilang: # {selectedData.terbilang} #</p>
                                </div>
                            </div>

                            {/* SISI KANAN: Bukti Bayar (Asli Struk) */}
                            <div className="flex-1 bg-slate-800 rounded-2xl shadow-inner border border-slate-700 overflow-y-auto p-10 flex flex-col custom-scrollbar relative">
                                <div className="sticky top-0 right-0 bg-green-600 text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-lg text-[10px] font-black uppercase tracking-widest z-10 -mr-10 -mt-10 mb-6 w-fit ml-auto">
                                    Lampiran Struk (Realita)
                                </div>
                                <div className="flex-grow flex items-center justify-center">
                                    <div className="relative group">
                                        <img src={selectedData.bukti_img} className="max-h-[65vh] w-auto rounded-xl shadow-2xl border-4 border-white object-contain" alt="Struk Bank" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl backdrop-blur-sm">
                                            <button className="bg-white p-3 rounded-full text-slate-900 font-bold text-xs">Perbesar Gambar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Aksi: Menampilkan Metadata Sinkronisasi */}
                        <div className="p-8 border-t bg-white px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            {/* PANEL PERBANDINGAN DATA (KRUSIAL) */}
                            <div className="flex flex-wrap items-center gap-6 flex-grow">
                                {/* Box Nominal SKRD */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[180px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tagihan SKRD</p>
                                    <p className="text-xl font-black text-slate-800">Rp {selectedData.nominal_skrd.toLocaleString()}</p>
                                </div>

                                <div className="text-slate-300 hidden md:block"><ArrowRight size={24} /></div>

                                {/* Box Nominal Transfer User */}
                                <div className={`p-4 rounded-2xl border min-w-[180px] ${selectedData.nominal_input === selectedData.nominal_skrd ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedData.nominal_input === selectedData.nominal_skrd ? 'text-green-600' : 'text-red-600'}`}>
                                            Setoran User
                                        </p>
                                        {selectedData.nominal_input === selectedData.nominal_skrd ?
                                            <CheckCircle size={14} className="text-green-600" /> :
                                            <AlertCircle size={14} className="text-red-600" />
                                        }
                                    </div>
                                    <p className={`text-xl font-black ${selectedData.nominal_input === selectedData.nominal_skrd ? 'text-green-800' : 'text-red-800'}`}>
                                        Rp {selectedData.nominal_input.toLocaleString()}
                                    </p>
                                </div>

                                {/* Info Penyetor (Kunci Rekon Mutasi) */}
                                <div className="h-14 w-[2px] bg-slate-100 hidden lg:block"></div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">{selectedData.metode}</span>
                                        <p className="text-xs font-black text-slate-800">{selectedData.bank_asal} - {selectedData.norek_asal}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                                        A/N: <span className="text-slate-800">{selectedData.penyetor}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Keputusan */}
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-8 py-5 border-2 border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 flex items-center gap-3">
                                    <ThumbsDown size={18} /> Tolak Bukti
                                </button>
                                <button
                                    onClick={() => { setShowReconModal(false); setShowSsrdPreview(true); }}
                                    className="flex-[2] md:flex-none px-12 py-5 bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-green-900/20 hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <CheckCircle size={20} /> Sah & Terbitkan SSRD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: PREVIEW SSRD (VERSI OPTIMASI UKURAN) */}
            {showSsrdPreview && selectedData && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Header Modal */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center z-10 px-8">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest leading-none">Draft SSRD Berhasil Diterbitkan</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSsrdPreview(false)}
                                    className="text-gray-400 font-bold text-[11px] px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-black text-[11px] flex items-center gap-2 shadow-lg hover:bg-black transition-all">
                                    <Printer size={14} /> Cetak & Kirim ke DLH
                                </button>
                            </div>
                        </div>

                        {/* AREA DOKUMEN SSRD (SESUAI LAMPIRAN IV) */}
                        <div className="overflow-y-auto p-6 bg-gray-100 flex justify-center custom-scrollbar">
                            <div className="bg-white w-full border-[1px] border-black text-black font-serif text-[10px] leading-snug p-8 shadow-sm">

                                {/* Header SSRD */}
                                <div className="flex border-2 border-black">
                                    <div className="w-1/4 p-3 flex items-center justify-center border-r-2 border-black text-center font-bold text-[7px] italic">LOGO DLH</div>
                                    <div className="w-1/2 p-2 flex flex-col items-center justify-center text-center border-r-2 border-black">
                                        <h4 className="font-black text-[10px] uppercase leading-tight">Surat Setoran Retribusi Daerah</h4>
                                        <h4 className="font-black text-[10px] uppercase">(SSRD)</h4>
                                    </div>
                                    <div className="w-1/4 p-2 flex flex-col justify-center items-center text-center">
                                        <p className="font-black text-[9px] uppercase">SSRD.</p>
                                        <p className="text-[9px] font-bold mt-1 border-b border-black w-full italic">00{selectedData.id}/SSRD/2026</p>
                                    </div>
                                </div>

                                {/* Data Rincian Pembayar */}
                                <div className="border-x-2 border-b-2 border-black p-4 space-y-1.5">
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">a.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase font-bold text-[9px]">Telah menerima uang sebesar</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-bold"># {selectedData.terbilang} #</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">b.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase font-bold text-[9px]">Terbilang (Rupiah)</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black font-black text-[11px] tracking-widest underline">Rp. {selectedData.nominal_input.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">c.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase font-bold text-[9px]">Dari Nama</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black uppercase font-bold">{selectedData.nama_wr}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5"></span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase font-bold text-[9px]">Alamat</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium">{selectedData.alamat_wr}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">d.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase font-bold text-[9px]">Sebagai Pembayaran</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium tracking-tight">Retribusi Pelayanan Persampahan/Kebersihan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabel Kode Rekening */}
                                <table className="w-full border-collapse border-x-2 border-b-2 border-black">
                                    <thead>
                                        <tr className="border-b-2 border-black uppercase text-[9px] font-bold bg-slate-50">
                                            <th className="border-r-2 border-black p-1 w-1/2 text-center">Kode Rekening</th>
                                            <th className="p-1 w-1/2 text-center">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="font-bold">
                                            <td className="border-r-2 border-black p-2 text-center">4.1.2.01.02</td>
                                            <td className="p-2 text-center italic underline">Rp. {selectedData.nominal_input.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Info Tanggal */}
                                <div className="border-x-2 border-b-2 border-black p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                                    <div className="flex gap-2"><span className="w-28 uppercase font-bold">Tgl Diterima Uang</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{selectedData.tgl_bayar}</span></div>
                                    <div className="flex gap-2"><span className="uppercase font-bold">Nomor SKRD</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{selectedData.no_skrd}</span></div>
                                    <div className="col-start-2 flex gap-2"><span className="uppercase font-bold">Tanggal Setor</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase italic">{selectedData.tgl_bayar}</span></div>
                                </div>

                                {/* Tanda Tangan */}
                                <div className="flex border-x-2 border-b-2 border-black text-[8px] text-center min-h-[100px] font-bold uppercase">
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between">
                                        <p>Pembantu Bendahara<br />Penerimaan Pembantu</p>
                                        <div className="mt-6 border-t border-black pt-1">NIP..........................</div>
                                    </div>
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between italic text-green-700">
                                        <p>Digital Signature Verified</p>
                                        <div className="mt-6 border-t border-black pt-1 italic font-mono uppercase">NPWRD: {selectedData.npwrd}</div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col justify-between">
                                        <p>Pembayar/Penyetor</p>
                                        <div className="mt-6 border-t border-black pt-1 italic uppercase">{selectedData.nama_wr}</div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col items-center justify-center text-center opacity-80">
                                    <p className="text-[8px] uppercase font-bold italic tracking-tighter leading-none">Plt. BUPATI BOGOR,</p>
                                    <p className="text-[9px] font-black underline uppercase mt-4">IWAN SETIAWAN</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BendaharaSsrd;