import React, { useState } from 'react';
import { Landmark, CheckCircle2, XCircle, FileSearch, ArrowRight, Printer, X, Eye, ImageIcon, CheckCircle } from 'lucide-react';

const BendaharaSsrd = () => {
    const [showProofModal, setShowProofModal] = useState(false);
    const [showSsrdPreview, setShowSsrdPreview] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // Dummy Data yang diperluas sesuai alur SKRD ke SSRD
    const [reconQueue] = useState([
        {
            id: 1,
            nama: 'TOKO KUE LEZAT',
            npwrd: '4.1.2.01.02.000088',
            alamat: 'Jl. Raya Cibinong No. 12, Bogor',
            no_skrd: '001/SKRD/DLH/2026',
            tgl_skrd: '10 Januari 2026',
            jumlah: 75000,
            terbilang: 'Tujuh Puluh Lima Ribu Rupiah',
            tgl_bayar: '09/01/2026',
            bukti_img: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg', // Contoh Bukti Bayar
            status_rekon: 'Matching'
        },
        {
            id: 2,
            nama: 'PT. MAJU JAYA SEJAHTERA',
            npwrd: '4.1.2.01.02.000001',
            alamat: 'Jl. Tegar Beriman No. 45, Cibinong',
            no_skrd: '002/SKRD/DLH/2026',
            tgl_skrd: '11 Januari 2026',
            jumlah: 500000,
            terbilang: 'Lima Ratus Ribu Rupiah',
            tgl_bayar: '12/01/2026',
            bukti_img: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg',
            status_rekon: 'Matching'
        }
    ]);

    const handleOpenProof = (data) => {
        setSelectedData(data);
        setShowProofModal(true);
    };

    const handleApproveRecon = (data) => {
        setSelectedData(data);
        setShowSsrdPreview(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Rekonsiliasi Bank & SSRD</h1>
                    <p className="text-sm text-gray-500 font-medium">Verifikasi mutasi bank dan penerbitan Surat Setoran Retribusi Daerah.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                {/* Info Rekening Bank Jabar BJB */}
                <div className="flex items-center justify-between bg-blue-900 p-6 rounded-[2rem] text-white mb-8 shadow-xl shadow-blue-900/20">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl">
                            <Landmark size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Rekening Penerimaan Pemda (BJB)</p>
                            <p className="text-2xl font-mono font-black tracking-tighter text-white">00123-4455-6677</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-blue-300 uppercase">Status Integrasi</p>
                        <span className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Terhubung Real-time
                        </span>
                    </div>
                </div>

                {/* List Antrian Rekon */}
                <div className="space-y-6">
                    {reconQueue.map((item) => (
                        <div key={item.id} className="group border border-gray-100 rounded-[2rem] p-6 hover:border-green-600 transition-all bg-gray-50/50 hover:bg-white flex flex-col lg:flex-row gap-8 items-center">

                            {/* Data Bukti dari DLH */}
                            <div className="flex-1 w-full space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon size={12} /> Bukti Bayar (User via DLH)
                                </p>
                                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-sm font-black text-gray-800 uppercase">{item.nama}</p>
                                        <p className="text-lg font-black text-green-700">Rp {item.jumlah.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleOpenProof(item)}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        <FileSearch size={20} />
                                    </button>
                                </div>
                            </div>

                            <ArrowRight className="hidden lg:block text-gray-300" size={32} />

                            {/* Data Mutasi Bank */}
                            <div className="flex-1 w-full space-y-3">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <Landmark size={12} /> Mutasi Bank Jabar BJB
                                </p>
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                                    <div className="bg-green-500 p-1 rounded-full">
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-900 uppercase italic">Matching Otomatis</p>
                                        <p className="text-xs font-medium text-blue-700">Tgl: {item.tgl_bayar} | Nominal Sesuai</p>
                                    </div>
                                </div>
                            </div>

                            {/* Aksi Final Bendahara */}
                            <div className="flex gap-2 w-full lg:w-auto">
                                <button
                                    onClick={() => handleApproveRecon(item)}
                                    className="flex-1 lg:flex-none bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-black shadow-xl shadow-green-900/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    Sesuai & Terbitkan SSRD
                                </button>
                                <button className="bg-white text-red-600 border border-red-100 px-4 py-4 rounded-2xl font-bold hover:bg-red-50">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL 1: LIHAT BUKTI BAYAR */}
            {showProofModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-black text-gray-800 text-sm uppercase">Bukti Bayar: {selectedData.nama}</h3>
                            <button onClick={() => setShowProofModal(false)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="p-8 bg-gray-100 flex justify-center">
                            <img src={selectedData.bukti_img} className="max-h-[500px] rounded-xl shadow-lg border-4 border-white object-contain" alt="Bukti Transfer" />
                        </div>
                        <div className="p-6">
                            <button onClick={() => setShowProofModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: PREVIEW SSRD (VERSI OPTIMASI UKURAN) */}
            {showSsrdPreview && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    {/* Container Modal Utama: Ditambah flex-col dan max-h agar muat di layar */}
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">

                        {/* Header Modal (Sticky) */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center z-10 px-8">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Preview SSRD Resmi</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSsrdPreview(false)}
                                    className="text-gray-400 font-bold text-[11px] px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-black text-[11px] flex items-center gap-2 shadow-lg hover:bg-black transition-all">
                                    <Printer size={14} /> Cetak SSRD
                                </button>
                            </div>
                        </div>

                        {/* AREA DOKUMEN (Scrollable secara vertikal) */}
                        <div className="overflow-y-auto p-6 bg-gray-100 flex justify-center">
                            {/* Kertas SSRD: Ukuran font dikurangi ke 10px dan padding jadi p-8 */}
                            <div className="bg-white w-full border-[1px] border-black text-black font-serif text-[10px] leading-snug p-8 shadow-sm">

                                {/* Header SSRD */}
                                <div className="flex border-2 border-black">
                                    <div className="w-1/4 p-3 flex items-center justify-center border-r-2 border-black">
                                        <div className="w-10 h-14 border-2 border-black flex items-center justify-center text-[6px] text-center font-bold uppercase shrink-0">Logo</div>
                                    </div>
                                    <div className="w-1/2 p-2 flex flex-col items-center justify-center text-center border-r-2 border-black">
                                        <h4 className="font-black text-[10px] uppercase leading-tight">Surat Setoran Retribusi Daerah</h4>
                                        <h4 className="font-black text-[10px] uppercase">(SSRD)</h4>
                                    </div>
                                    <div className="w-1/4 p-2 flex flex-col justify-center items-center text-center">
                                        <p className="font-black text-[9px] uppercase">SSRD.</p>
                                        <p className="text-[9px] font-bold mt-1 border-b border-black w-full italic">00{selectedData.id}/SSRD/2026</p>
                                    </div>
                                </div>

                                {/* Baris data a, b, c, d (Gaya PDF) */}
                                <div className="border-x-2 border-b-2 border-black p-4 space-y-1.5">
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">a.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Telah menerima uang sebesar</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-bold"># {selectedData.terbilang} #</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">b.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40 uppercase">Terbilang (Rupiah)</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black font-black text-[11px] tracking-widest underline">Rp. {selectedData.jumlah.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5 font-bold">c.</span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Dari Nama</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black uppercase font-bold">{selectedData.nama}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="w-5"></span>
                                        <div className="flex-1 flex gap-2">
                                            <span className="w-40">Alamat</span>
                                            <span>:</span>
                                            <span className="flex-1 border-b border-dotted border-black italic font-medium">{selectedData.alamat}</span>
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
                                <table className="w-full border-collapse border-x-2 border-b-2 border-black">
                                    <thead>
                                        <tr className="border-b-2 border-black uppercase text-[9px] font-bold">
                                            <th className="border-r-2 border-black p-1 w-1/2">Kode Rekening</th>
                                            <th className="p-1 w-1/2">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="font-bold">
                                            <td className="border-r-2 border-black p-2 text-center">4.1.2.01.02</td>
                                            <td className="p-2 text-center italic underline">Rp. {selectedData.jumlah.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Info Tanggal & SKRD */}
                                <div className="border-x-2 border-b-2 border-black p-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                                    <div className="flex gap-2"><span className="w-28">Tgl Diterima Uang</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{selectedData.tgl_bayar}</span></div>
                                    <div className="flex gap-2"><span>Nomor SKRD</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase">{selectedData.no_skrd}</span></div>
                                    <div className="col-start-2 flex gap-2"><span>Tanggal Setor</span> <span>:</span> <span className="flex-1 border-b border-black font-bold uppercase italic">{selectedData.tgl_bayar}</span></div>
                                </div>

                                {/* Tanda Tangan Tiga Kolom */}
                                <div className="flex border-x-2 border-b-2 border-black text-[8px] text-center min-h-[100px]">
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between">
                                        <p>Pembantu Bendahara<br />Penerimaan Pembantu</p>
                                        <div className="mt-6 border-t border-black font-bold uppercase">NIP..........................</div>
                                    </div>
                                    <div className="flex-1 p-2 border-r border-black flex flex-col justify-between italic">
                                        <p>Juru Pungut</p>
                                        <div className="mt-6 border-t border-black font-bold uppercase underline">NIP. {selectedData.npwrd}</div>
                                    </div>
                                    <div className="flex-1 p-2 flex flex-col justify-between">
                                        <p>Pembayar/Penyetor</p>
                                        <div className="mt-6 border-t border-black font-bold uppercase italic">{selectedData.nama}</div>
                                    </div>
                                </div>

                                {/* Footer Salinan Bawah */}
                                <div className="mt-6 flex flex-col items-center justify-center text-center opacity-80">
                                    <p className="text-[8px] uppercase font-bold italic tracking-tighter">Plt. BUPATI BOGOR,</p>
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