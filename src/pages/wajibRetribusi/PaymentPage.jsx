import React, { useState } from 'react';
import {
    CreditCard,
    Upload,
    CheckCircle2,
    Clock,
    FileCheck,
    Download,
    AlertTriangle,
    Info,
    Eye,
    X,
    Printer,
    CheckCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const PaymentPage = () => {
    const [selectedSkrd, setSelectedSkrd] = useState('');
    // 1. State Baru untuk Modal Preview SSRD
    const [showSsrdModal, setShowSsrdModal] = useState(false);
    const [currentSsrd, setCurrentSsrd] = useState(null);

    // Data profil user (untuk mengisi field SSRD)
    const [userProfile] = useState({
        nama: 'PT. MAJU JAYA SEJAHTERA',
        npwrd: '4.1.2.01.02.000001',
        alamat: 'Jl. Raya Cibinong No. 12, Pakansari, Cibinong'
    });

    const pendingSkrds = [
        { id: '1', no_skrd: '00045/SKRD/DLH/2026', total: 500000, masa: 'Januari 2026' },
    ];

    // Riwayat diperlengkap untuk kebutuhan SSRD
    const ssrdHistory = [
        {
            id: '001/SSRD/2025',
            no_skrd: '00012/SKRD/DLH/2025',
            tgl_bayar: '15 DESEMBER 2025',
            jumlah: 520000,
            terbilang: 'Lima Ratus Dua Puluh Ribu Rupiah',
            status: 'Lunas'
        },
        {
            id: 'PENDING',
            no_skrd: '00040/SKRD/DLH/2025',
            tgl_bayar: '28 DESEMBER 2025',
            jumlah: 500000,
            terbilang: 'Lima Ratus Ribu Rupiah',
            status: 'Proses Verifikasi'
        },
    ];

    const handleOpenSsrd = (item) => {
        setCurrentSsrd(item);
        setShowSsrdModal(true);
    };

    return (
        <div className="space-y-8 pb-12 relative">
            {/* Header tetap sama */}
            <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Pembayaran & SSRD</h1>
                <p className="text-gray-500 text-sm font-medium">Upload bukti bayar Anda untuk penerbitan SSRD sah.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KOLOM KIRI: Form Upload (Tetap sama) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden font-sans">
                        <div className="bg-green-700 p-4 text-white flex items-center gap-3">
                            <CreditCard size={20} />
                            <span className="font-bold uppercase text-xs tracking-widest">Konfirmasi Pembayaran</span>
                        </div>
                        <form className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pilih Tagihan SKRD</label>
                                <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-600 outline-none font-bold text-sm">
                                    <option value="">-- Pilih Nomor SKRD --</option>
                                    {pendingSkrds.map(skrd => (
                                        <option key={skrd.id} value={skrd.id}>{skrd.no_skrd} - (Rp {skrd.total.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex items-center gap-2 text-blue-800 font-black text-[10px] uppercase mb-1">
                                    <Info size={14} /> Informasi Rekening BJB
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase">Nomor Rekening</p>
                                    <p className="font-black text-blue-900 tracking-wider">00123-4455-6677</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase">Atas Nama</p>
                                    <p className="text-[11px] font-black text-blue-900 uppercase">Bendahara DLH Bogor</p>
                                </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-gray-50 group transition-all hover:border-green-600 cursor-pointer">
                                <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Upload className="text-green-700" size={32} /></div>
                                <p className="mt-4 font-black text-gray-700 uppercase text-xs tracking-widest">Upload Bukti Bayar</p>
                            </div>
                            <button type="button" className="w-full bg-green-700 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-green-900/20 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3">
                                <CheckCircle2 size={20} /> Kirim Konfirmasi
                            </button>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Panduan (Tetap sama) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-4">
                            <Clock size={16} className="text-orange-500" /> Proses Verifikasi
                        </h3>
                        <ul className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {[
                                "Upload bukti transfer bank.",
                                "Verifikasi mutasi oleh Bendahara.",
                                "SSRD Terbit otomatis di riwayat."
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4 relative z-10">
                                    <div className="h-5 w-5 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 text-[10px] font-black">{i + 1}</div>
                                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed">{step}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIWAYAT SSRD (DENGAN TOMBOL LIHAT PREVIEW) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <FileCheck className="text-green-700" size={18} /> Dokumen SSRD Digital
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">No. SSRD / SKRD</th>
                                        <th className="p-6">Tanggal Bayar</th>
                                        <th className="p-6">Jumlah</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {ssrdHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6">
                                                <p className="text-gray-800 font-black text-sm uppercase">{item.id}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{item.no_skrd}</p>
                                            </td>
                                            <td className="p-6 text-xs font-bold text-gray-500 uppercase">{item.tgl_bayar}</td>
                                            <td className="p-6 font-black text-gray-800 text-sm">Rp {item.jumlah.toLocaleString()}</td>
                                            <td className="p-6"><StatusBadge status={item.status} /></td>
                                            <td className="p-6 text-center">
                                                {item.status === 'Lunas' ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenSsrd(item)}
                                                            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all"
                                                        >
                                                            <Eye size={14} /> Lihat
                                                        </button>
                                                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all">
                                                            <Download size={14} /> PDF
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-amber-500 uppercase italic">Menunggu Verifikasi</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PREVIEW SSRD (FORMAT LAMPIRAN IV - OPTIMIZED) */}
            {showSsrdModal && currentSsrd && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">

                        {/* Control Bar */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center z-10 px-8">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Surat Setoran Retribusi (Digital)</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSsrdModal(false)} className="text-gray-400 font-bold text-[11px] px-4 py-2 hover:bg-gray-200 rounded-lg">Tutup</button>
                                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-black text-[11px] flex items-center gap-2"><Printer size={14} /> Cetak Dokumen</button>
                            </div>
                        </div>

                        {/* AREA DOKUMEN SSRD (SESUAI LAMPIRAN IV) */}
                        <div className="overflow-y-auto p-6 bg-gray-100 flex justify-center">
                            <div className="bg-white w-full border-[1px] border-black text-black font-serif text-[10px] leading-tight p-8 shadow-sm">

                                {/* Header SSRD */}
                                <div className="flex border-2 border-black font-serif">
                                    <div className="w-1/4 p-3 flex items-center justify-center border-r-2 border-black">
                                        <div className="w-10 h-14 border-2 border-black flex items-center justify-center text-[6px] font-bold uppercase shrink-0 italic">LOGO DLH</div>
                                    </div>
                                    <div className="w-1/2 p-2 flex flex-col items-center justify-center text-center border-r-2 border-black">
                                        <h4 className="font-black text-[10px] uppercase leading-tight">Surat Setoran Retribusi Daerah</h4>
                                        <h4 className="font-black text-[10px] uppercase">(SSRD)</h4>
                                    </div>
                                    <div className="w-1/4 p-2 flex flex-col justify-center items-center text-center">
                                        <p className="font-black text-[9px] uppercase">SSRD.</p>
                                        <p className="text-[9px] font-bold mt-1 border-b border-black w-full italic">{currentSsrd.id}</p>
                                    </div>
                                </div>

                                {/* Data a, b, c, d */}
                                <div className="border-x-2 border-b-2 border-black p-4 space-y-1.5 font-serif">
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">a.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Telah menerima uang sebesar</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-bold uppercase text-[9px]"># {currentSsrd.terbilang} #</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">b.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase">Terbilang (Rupiah)</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black font-black text-[11px] tracking-widest underline">Rp. {currentSsrd.jumlah.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">c.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Dari Nama</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black uppercase font-bold">{userProfile.nama}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5"></span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Alamat</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium">{userProfile.alamat}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">d.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Sebagai Pembayaran</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium tracking-tight">Retribusi Pelayanan Persampahan/Kebersihan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabel Kode Rekening */}
                                <table className="w-full border-collapse border-x-2 border-b-2 border-black font-serif">
                                    <thead>
                                        <tr className="border-b-2 border-black uppercase text-[9px] font-bold">
                                            <th className="border-r-2 border-black p-1 w-1/2">Kode Rekening</th>
                                            <th className="p-1 w-1/2">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="font-bold">
                                            <td className="border-r-2 border-black p-2 text-center text-[11px]">4.1.2.01.02</td>
                                            <td className="p-2 text-center text-[11px] italic underline">{currentSsrd.jumlah.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Info Tanggal & SKRD */}
                                <div className="border-x-2 border-b-2 border-black p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-serif">
                                    <div className="flex gap-2"><span className="w-28 uppercase">Tanggal Terima Uang</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{currentSsrd.tgl_bayar}</span></div>
                                    <div className="flex gap-2"><span className="uppercase">Nomor SKRD</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{currentSsrd.no_skrd}</span></div>
                                    <div className="col-start-2 flex gap-2"><span className="uppercase">Tanggal Setor</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase italic">{currentSsrd.tgl_bayar}</span></div>
                                </div>

                                {/* Tanda Tangan Tiga Kolom */}
                                <div className="flex border-x-2 border-b-2 border-black text-[8px] text-center min-h-[100px] font-serif uppercase font-bold">
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between">
                                        <p>Pembantu Bendahara<br />Penerimaan Pembantu</p>
                                        <div className="mt-6 border-t border-black pb-1">NIP..........................</div>
                                    </div>
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between italic text-green-700">
                                        <p>Digital Verified</p>
                                        <div className="mt-6 border-t border-black pb-1 italic">NIP. {userProfile.npwrd}</div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col justify-between">
                                        <p>Pembayar/Penyetor</p>
                                        <div className="mt-6 border-t border-black pb-1 italic">{userProfile.nama}</div>
                                    </div>
                                </div>

                                {/* Footer Pengesahan */}
                                <div className="mt-6 flex flex-col items-center justify-center text-center opacity-80 font-serif">
                                    <p className="text-[8px] uppercase font-bold italic tracking-tighter leading-none">Plt. BUPATI BOGOR,</p>
                                    <p className="text-[9px] font-black underline uppercase mt-5">IWAN SETIAWAN</p>
                                    <p className="text-[7px] uppercase font-bold italic mt-4 opacity-50 tracking-widest">--- Salinan sesuai dengan aslinya ---</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;