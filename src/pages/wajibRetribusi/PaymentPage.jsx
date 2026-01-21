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
    CheckCircle,
    Building2,
    MapPin,
    ChevronDown
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const PaymentPage = () => {
    // 1. Daftar Aset Milik Akun
    const [myAssets] = useState([
        {
            npwrd: '4.1.2.01.02.000001',
            nama: 'PT. MAJU JAYA SEJAHTERA',
            alamat: 'Jl. Raya Cibinong No. 12, Pakansari',
        },
        {
            npwrd: '4.1.2.01.02.000088',
            nama: 'RUKO TOKO KUE LEZAT',
            alamat: 'Jl. Raya Pemda No. 45, Cibinong',
        }
    ]);

    // 2. State Aset Aktif & Modal
    const [activeAsset, setActiveAsset] = useState(myAssets[0]);
    const [selectedSkrdId, setSelectedSkrdId] = useState('');
    const [showSsrdModal, setShowSsrdModal] = useState(false);
    const [currentSsrd, setCurrentSsrd] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');

    // 3. Data Dummy Tagihan (Tergantung NPWRD)
    const allPendingSkrds = [
        { id: 'SK1', npwrd_ref: '4.1.2.01.02.000001', no_skrd: '00045/SKRD/DLH/2026', total: 500000 },
        { id: 'SK2', npwrd_ref: '4.1.2.01.02.000088', no_skrd: '00088/SKRD/DLH/2026', total: 150000 },
    ];

    // 4. Data Dummy Riwayat SSRD (Tergantung NPWRD)
    const allSsrdHistory = [
        {
            id: '001/SSRD/2025',
            npwrd_ref: '4.1.2.01.02.000001',
            no_skrd: '00012/SKRD/DLH/2025',
            tgl_bayar: '15 DESEMBER 2025',
            jumlah: 520000,
            terbilang: 'Lima Ratus Dua Puluh Ribu Rupiah',
            status: 'Lunas'
        },
        {
            id: 'PENDING-01',
            npwrd_ref: '4.1.2.01.02.000001',
            no_skrd: '00040/SKRD/DLH/2025',
            tgl_bayar: '28 DESEMBER 2025',
            jumlah: 500000,
            terbilang: 'Lima Ratus Ribu Rupiah',
            status: 'Proses Verifikasi'
        },
    ];

    // Filter data berdasarkan aset yang dipilih
    const filteredPending = allPendingSkrds.filter(skrd => skrd.npwrd_ref === activeAsset.npwrd);
    const filteredHistory = allSsrdHistory.filter(item => item.npwrd_ref === activeAsset.npwrd);

    const handleOpenSsrd = (item) => {
        setCurrentSsrd(item);
        setShowSsrdModal(true);
    };

    return (
        <div className="space-y-8 pb-12 relative animate-in fade-in duration-500">
            {/* ASSET SWITCHER (Sama seperti di halaman SKRD) */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-8 border-l-green-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-700 rounded-2xl"><Building2 size={24} /></div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Konfirmasi Pembayaran Untuk:</p>
                        <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">{activeAsset.nama}</h2>
                        <p className="text-xs text-green-700 font-mono font-bold">{activeAsset.npwrd}</p>
                    </div>
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={activeAsset.npwrd}
                        onChange={(e) => {
                            setActiveAsset(myAssets.find(a => a.npwrd === e.target.value));
                            setSelectedSkrdId(''); // Reset pilihan tagihan saat ganti aset
                        }}
                        className="appearance-none bg-gray-900 text-white pl-6 pr-12 py-3 rounded-2xl font-bold text-xs cursor-pointer w-full"
                    >
                        {myAssets.map(asset => (
                            <option key={asset.npwrd} value={asset.npwrd}>Aset: {asset.nama}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={16} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KOLOM KIRI: Form Upload */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-green-700 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard size={20} />
                                <span className="font-black uppercase text-xs tracking-widest">Form Konfirmasi</span>
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter">Bank Jabar BJB</span>
                        </div>

                        <form className="p-10 space-y-8 font-sans">
                            {/* 1. Pilih Tagihan */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Pilih Nomor SKRD</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none font-bold text-sm transition-all"
                                    value={selectedSkrdId}
                                    onChange={(e) => setSelectedSkrdId(e.target.value)}
                                >
                                    <option value="">-- Pilih Tagihan Aktif --</option>
                                    {filteredPending.map(skrd => (
                                        <option key={skrd.id} value={skrd.id}>{skrd.no_skrd} - (Rp {skrd.total.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Info Rekening */}
                            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem] relative overflow-hidden group">
                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-full flex items-center gap-2 text-blue-800 font-black text-[10px] uppercase mb-2">
                                        <Info size={16} /> Instruksi Transfer Kas Daerah
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Nomor Rekening</p>
                                        <p className="text-2xl font-black text-blue-900 tracking-tighter">00123-4455-6677</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Atas Nama Rekening</p>
                                        <p className="text-sm font-black text-blue-900 uppercase">Bendahara Penerimaan DLH Bogor</p>
                                    </div>
                                </div>
                                <Building2 className="absolute -right-4 -bottom-4 text-blue-600/5 group-hover:scale-110 transition-transform duration-700" size={120} />
                            </div>

                            {/* 2. Detail Pembayar (Krusial untuk Rekonsiliasi) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                                <div className="md:col-span-2">
                                    <h4 className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] mb-4 border-b border-green-100 pb-2">Detail Transaksi Pembayaran</h4>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Metode Bayar</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold text-sm"
                                    >
                                        <option value="Transfer Bank">Transfer Bank (Atm/M-Banking)</option>
                                        <option value="QRIS">QRIS / E-Wallet</option>
                                        <option value="Teller">Teller Bank Jabar BJB</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Atas Nama Pengirim / Penyetor</label>
                                    <input type="text" placeholder="Nama sesuai di struk/rekening" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold text-sm" />
                                </div>

                                {paymentMethod === 'Transfer Bank' && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Bank Anda</label>
                                            <input type="text" placeholder="Contoh: BCA, Mandiri, BJB" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">No. Rekening Anda</label>
                                            <input type="text" placeholder="Masukkan nomor rekening pengirim" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold text-sm" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tanggal Bayar</label>
                                    <input type="date" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-bold text-sm" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nominal yang Ditransfer (Rp)</label>
                                    <input type="number" placeholder="Contoh: 500000" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-600 font-black text-sm text-green-700" />
                                </div>
                            </div>

                            {/* Dropzone Upload */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Lampiran Bukti Transaksi (Wajib)</label>
                                <div className="border-4 border-dashed border-gray-100 rounded-[3rem] p-12 flex flex-col items-center justify-center bg-gray-50/50 group transition-all hover:bg-white hover:border-green-100 cursor-pointer relative overflow-hidden">
                                    <div className="bg-white p-5 rounded-[1.5rem] shadow-xl shadow-green-900/5 group-hover:scale-110 transition-transform"><Upload className="text-green-700" size={40} /></div>
                                    <p className="mt-6 font-black text-gray-800 uppercase text-xs tracking-[0.2em]">Klik untuk Unggah Gambar/PDF</p>
                                    <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Pastikan No. Referensi dan Nominal terlihat jelas</p>
                                </div>
                            </div>
                            <button type="button" className="w-full bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-green-900/20 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 active:scale-95">
                                <CheckCircle2 size={20} /> Kirim Konfirmasi Pembayaran
                            </button>
                        </form>
                    </div>
                </div>

                {/* KOLOM KANAN: Panduan (Tetap sama) */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 border-b pb-5">
                            <Clock size={18} className="text-orange-500" /> Alur Verifikasi
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {[
                                { t: "Unggah Bukti", d: "Pastikan foto/scan struk transfer terbaca jelas." },
                                { t: "Pengecekan Mutasi", d: "Bendahara mencocokkan dana masuk di rekening BJB." },
                                { t: "Penerbitan SSRD", d: "Dokumen sah terbit otomatis maksimal 2x24 jam." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 relative z-10">
                                    <div className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 text-[10px] font-black shadow-lg shadow-green-900/20">{i + 1}</div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{step.t}</p>
                                        <p className="text-[11px] font-medium text-gray-400 mt-1 leading-relaxed">{step.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIWAYAT SSRD (DENGAN TOMBOL LIHAT PREVIEW) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                <FileCheck className="text-green-700" size={20} /> Riwayat SSRD: {activeAsset.nama}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">No. SSRD / SKRD</th>
                                        <th className="p-6">Tanggal Bayar</th>
                                        <th className="p-6">Nominal Lunas</th>
                                        <th className="p-6">Status Akuntansi</th>
                                        <th className="p-6 text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-6 font-serif">
                                                <p className="text-gray-800 font-black text-sm uppercase group-hover:text-green-700 transition-colors">{item.id}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{item.no_skrd}</p>
                                            </td>
                                            <td className="p-6 text-xs font-bold text-gray-500 uppercase">{item.tgl_bayar}</td>
                                            <td className="p-6 font-black text-gray-800 text-sm italic">Rp {item.jumlah.toLocaleString()}</td>
                                            <td className="p-6"><StatusBadge status={item.status} /></td>
                                            <td className="p-6">
                                                {item.status === 'Lunas' ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleOpenSsrd(item)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                                                        <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"><Download size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center"><span className="text-[10px] font-black text-amber-500 uppercase italic">Verifikasi Admin...</span></div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-20 text-center text-gray-300 italic text-sm">Belum ada riwayat pembayaran untuk aset ini.</td></tr>
                                    )}
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
                        {/* Modal UI Header */}
                        <div className="bg-gray-50 p-6 border-b flex justify-between items-center px-10">
                            <div className="flex items-center gap-3 text-green-700">
                                <div className="p-2 bg-green-100 rounded-xl"><CheckCircle size={20} /></div>
                                <span className="text-[12px] font-black uppercase tracking-widest leading-none">Dokumen Pelunasan Resmi</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSsrdModal(false)} className="bg-white border border-gray-200 text-gray-400 p-3 rounded-2xl hover:bg-gray-50 transition-all"><X size={20} /></button>
                                <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all"><Printer size={16} /> Cetak Dokumen</button>
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

                                {/* Isi Data a, b, c, d (Dinamis dari activeAsset) */}
                                <div className="border-x-2 border-b-2 border-black p-6 space-y-3 font-serif">
                                    <div className="flex items-start">
                                        <span className="w-6 font-black text-sm">a.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-44 uppercase font-bold text-[10px]">Telah menerima uang sebesar</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-black uppercase text-[10px] bg-gray-50 px-2"># {currentSsrd.terbilang} #</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-6 font-black text-sm">b.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-44 uppercase font-bold text-[10px]">Terbilang (Rupiah)</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black font-black text-[14px] tracking-widest underline">Rp. {currentSsrd.jumlah.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-6 font-black text-sm">c.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-44 uppercase font-bold text-[10px]">Dari Nama</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black uppercase font-black tracking-tight">{activeAsset.nama}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-6"></span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-44 uppercase font-bold text-[10px]">Alamat</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium">{activeAsset.alamat}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-6 font-black text-sm">d.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-44 uppercase font-bold text-[10px]">Sebagai Pembayaran</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-bold text-[10px]">Retribusi Pelayanan Persampahan / Kebersihan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabel Kode Rekening & Tanda Tangan */}
                                <table className="w-full border-collapse border-x-2 border-b-2 border-black font-serif mt-0">
                                    <thead>
                                        <tr className="border-b-2 border-black uppercase text-[10px] font-black bg-gray-50">
                                            <th className="border-r-2 border-black p-2 w-1/2">Kode Rekening</th>
                                            <th className="p-2 w-1/2">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="font-black">
                                            <td className="border-r-2 border-black p-4 text-center text-[14px] font-mono">4.1.2.01.02</td>
                                            <td className="p-4 text-center text-[14px] italic underline">{currentSsrd.jumlah.toLocaleString()}</td>
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
                                        <div className="mt-6 border-t border-black pb-1 italic">NIP. {activeAsset.npwrd}</div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col justify-between">
                                        <p>Pembayar/Penyetor</p>
                                        <div className="mt-6 border-t border-black pb-1 italic">{activeAsset.nama}</div>
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