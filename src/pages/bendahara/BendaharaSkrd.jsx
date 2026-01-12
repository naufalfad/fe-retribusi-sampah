import React, { useState } from 'react';
import { FileText, CheckCircle, Search, X, Eye, ShieldCheck, Printer, ClipboardCheck, AlertCircle } from 'lucide-react';

const BendaharaSkrd = () => {
    const [selectedReq, setSelectedReq] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFinalSkrd, setShowFinalSkrd] = useState(false);

    // Data dari DLH (Sudah lengkap dengan Tarif & Nominal)
    const [queue] = useState([
        {
            id: 1,
            no_reg: 'REG-2026-001',
            nama: 'PT. MAJU JAYA SEJAHTERA',
            npwrd: '4.1.2.01.02.000001',
            alamat: 'Jl. Raya Cibinong No. 12, Kel. Pakansari, Kec. Cibinong',
            masa: 'JANUARI',
            tahun: '2026',
            luas: '500',
            kategori_tarif: 'Niaga Besar',
            tarif_per_meter: 1000,
            total_retribusi: 500000,
            tgl_ketetapan_dlh: '2026-01-12'
        },
        {
            id: 2,
            no_reg: 'REG-2026-045',
            nama: 'RESTORAN PADANG JAYA',
            npwrd: '4.1.2.01.02.000045',
            alamat: 'Jl. Tegar Beriman No. 45, Kel. Tengah, Kec. Cibinong',
            masa: 'JANUARI',
            tahun: '2026',
            luas: '150',
            kategori_tarif: 'Niaga Kecil',
            tarif_per_meter: 500,
            total_retribusi: 75000,
            tgl_ketetapan_dlh: '2026-01-11'
        },
    ]);

    const handleApproveAndGenerate = () => {
        setIsGenerating(true);
        // Simulasi proses generate nomor SKRD otomatis oleh sistem
        setTimeout(() => {
            setIsGenerating(false);
            setShowFinalSkrd(true);
        }, 1500);
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Penerbitan SKRD</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">Review ketetapan DLH dan terbitkan dokumen SKRD resmi.</p>
                </div>
            </div>

            {/* List Antrian dari DLH */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Data Wajib Retribusi</th>
                            <th className="p-6">Ketetapan DLH</th>
                            <th className="p-6">Masa Retribusi</th>
                            <th className="p-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {queue.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6">
                                    <p className="font-bold text-gray-800 text-sm">{q.nama}</p>
                                    <p className="text-[10px] text-green-700 font-mono font-bold tracking-tighter">{q.npwrd}</p>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-blue-700 text-sm">{formatRupiah(q.total_retribusi)}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{q.kategori_tarif} ({q.luas} m²)</p>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-bold text-gray-600 uppercase">{q.masa} {q.tahun}</p>
                                </td>
                                <td className="p-6 text-center">
                                    <button
                                        onClick={() => setSelectedReq(q)}
                                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black flex items-center gap-2 mx-auto transition-all shadow-md"
                                    >
                                        <ClipboardCheck size={14} /> Review & Terbitkan
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL REVIEW DATA SEBELUM TERBIT (GATEKEEPER) */}
            {selectedReq && !showFinalSkrd && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest">Review Ketetapan Retribusi</h3>
                            <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Summary Review */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wajib Retribusi / NPWRD</p>
                                        <p className="font-bold text-gray-800">{selectedReq.nama}</p>
                                        <p className="text-xs font-mono font-bold text-green-700 leading-none">{selectedReq.npwrd}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat Objek</p>
                                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{selectedReq.alamat}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Ketetapan (DLH)</p>
                                        <p className="text-2xl font-black text-blue-900">{formatRupiah(selectedReq.total_retribusi)}</p>
                                        <p className="text-[9px] font-bold text-blue-400 italic">Ditetapkan pada: {selectedReq.tgl_ketetapan_dlh}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                                        <ShieldCheck size={14} />
                                        <p className="text-[10px] font-bold uppercase tracking-tighter">Data Terverifikasi DLH</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 italic text-[11px] text-gray-400 text-center">
                                Dengan menekan tombol setuju, sistem akan otomatis menghasilkan Nomor SKRD dan menerbitkan dokumen sesuai format peraturan daerah.
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setSelectedReq(null)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase text-xs tracking-widest">Batalkan</button>
                                <button
                                    onClick={handleApproveAndGenerate}
                                    disabled={isGenerating}
                                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                                >
                                    {isGenerating ? 'Memproses Dokumen...' : 'Setuju & Terbitkan SKRD'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW SKRD FINAL */}
            {showFinalSkrd && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
                    {/* Container Modal Utama: Ditambah max-h agar tidak melebihi layar */}
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-300">

                        {/* Control Bar (Sticky di atas) */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center z-10 px-8">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Preview SKRD Resmi</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowFinalSkrd(false); setSelectedReq(null); }}
                                    className="text-gray-500 font-bold text-[11px] px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-black text-[11px] flex items-center gap-2 shadow-lg hover:bg-black transition-all">
                                    <Printer size={14} /> Cetak Dokumen
                                </button>
                            </div>
                        </div>

                        {/* AREA DOKUMEN (Scrollable secara vertikal) */}
                        <div className="overflow-y-auto p-6 bg-gray-200/50 flex justify-center">
                            {/* Kertas SKRD: Font dikecilkan ke text-[10px] dan padding dikurangi */}
                            <div className="bg-white w-full max-w-[210mm] shadow-lg border-[1px] border-black text-black font-serif text-[10px] leading-tight p-8 min-h-[297mm]">

                                {/* Kop Surat SKRD */}
                                <div className="flex border-2 border-black">
                                    <div className="w-1/2 flex gap-3 items-center border-r-2 border-black p-3 text-center">
                                        <div className="w-10 h-14 border-2 border-black flex items-center justify-center text-[6px] font-bold uppercase shrink-0">Logo</div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-[9px] uppercase leading-tight">Dinas Lingkungan Hidup</h4>
                                            <h4 className="font-bold text-[9px] uppercase leading-tight">Kabupaten Bogor</h4>
                                            <p className="text-[6px] mt-1 italic">Jl. Tegar Beriman (021) 29615851 Cibinong 16914</p>
                                        </div>
                                    </div>
                                    <div className="w-1/2 flex flex-col font-serif">
                                        <div className="flex-1 flex items-center justify-center border-b-2 border-black font-black text-[10px] uppercase p-1 text-center italic">
                                            Surat Ketetapan Retribusi Daerah (SKRD)
                                        </div>
                                        <div className="flex text-[8px]">
                                            <div className="flex-1 p-2 border-r-2 border-black uppercase">
                                                MASA : <strong>{selectedReq.masa}</strong><br />
                                                TAHUN : <strong>{selectedReq.tahun}</strong>
                                            </div>
                                            <div className="flex-1 p-2 text-center uppercase font-bold">
                                                NO. SKRD<br />
                                                <span className="text-[10px] font-mono tracking-tighter">00{selectedReq.id}/SKRD/DLH/{selectedReq.tahun}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Identitas Pembayar */}
                                <div className="py-4 space-y-1 border-x-2 border-black px-4">
                                    <div className="flex"><span className="w-24 font-bold">NAMA</span> <span>: {selectedReq.nama}</span></div>
                                    <div className="flex"><span className="w-24 font-bold">ALAMAT</span> <span className="flex-1">: {selectedReq.alamat}</span></div>
                                    <div className="flex mt-1"><span className="w-24 font-bold">NPWRD</span> <span className="font-mono font-bold tracking-widest">: {selectedReq.npwrd}</span></div>
                                    <div className="flex"><span className="w-24 font-bold">JATUH TEMPO</span> <span>: 10 FEBRUARI {selectedReq.tahun}</span></div>
                                </div>

                                {/* Tabel Rincian Biaya */}
                                <table className="w-full border-collapse border-2 border-black">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b-2 border-black uppercase text-[8px] font-bold">
                                            <th className="border-r-2 border-black p-1 w-24">Kode Rekening</th>
                                            <th className="border-r-2 border-black p-1">Uraian Retribusi Pelayanan Persampahan</th>
                                            <th className="p-1">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-r-2 border-black p-3 text-center font-bold">4.1.2.01.02</td>
                                            <td className="border-r-2 border-black p-3 italic h-20 align-top">
                                                Pelayanan Pengangkutan/Pembuangan Sampah Retribusi Daerah<br />
                                                Kategori: {selectedReq.kategori_tarif} (Luas: {selectedReq.luas} m²)
                                            </td>
                                            <td className="p-3 text-right font-bold align-top">{selectedReq.total_retribusi.toLocaleString()}</td>
                                        </tr>
                                        <tr className="border-t-2 border-black font-bold text-[9px]">
                                            <td colSpan="2" className="border-r-2 border-black p-1.5 text-right uppercase italic">Jumlah Pokok Retribusi:</td>
                                            <td className="p-1.5 text-right">{selectedReq.total_retribusi.toLocaleString()}</td>
                                        </tr>
                                        <tr className="border-t border-black text-[8px]">
                                            <td colSpan="2" className="border-r-2 border-black p-1 text-right italic">Sanksi Denda:</td>
                                            <td className="p-1 text-right">0</td>
                                        </tr>
                                        <tr className="border-t-2 border-black bg-gray-50 font-black text-[11px] italic">
                                            <td colSpan="2" className="border-r-2 border-black p-2 text-right uppercase">Total Retribusi:</td>
                                            <td className="p-2 text-right">Rp. {selectedReq.total_retribusi.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Terbilang */}
                                <div className="mt-3 italic font-bold border-2 border-black p-2 text-[9px] uppercase bg-gray-50">
                                    Terbilang : # Lima Ratus Ribu Rupiah #
                                </div>

                                {/* Tanda Tangan */}
                                <div className="flex mt-6 border-x-2 border-b-2 border-black p-4">
                                    <div className="w-1/2 text-[7px] space-y-1">
                                        <p className="font-black italic underline mb-1 uppercase">Catatan:</p>
                                        <p>1. Pembayaran dilakukan secara non-tunai.</p>
                                        <p>2. SKRD ini dasar penagihan retribusi daerah.</p>
                                    </div>
                                    <div className="w-1/2 text-center flex flex-col items-center">
                                        <p className="text-[8px]">Cibinong, 12 Januari 2026</p>
                                        <p className="font-bold uppercase text-[9px]">Kepala Dinas Lingkungan Hidup</p>
                                        <div className="h-12 w-28 border-b border-black flex items-center justify-center text-[6px] italic text-gray-400">Digital Signature</div>
                                        <p className="font-bold mt-1 uppercase text-[9px]">IWAN SETIAWAN</p>
                                        <p className="text-[8px]">NIP. 197801021990021001</p>
                                    </div>
                                </div>

                                {/* Tanda Terima (Guntingan) */}
                                <div className="mt-6 border-2 border-dashed border-gray-400 p-4 text-[8px]">
                                    <p className="text-center italic mb-2 font-bold opacity-50">--- Potong Di Sini (Tanda Terima) ---</p>
                                    <div className="grid grid-cols-2">
                                        <div className="space-y-0.5">
                                            <div className="flex"><span className="w-16 font-bold uppercase">NPWRD</span> <span>: {selectedReq.npwrd}</span></div>
                                            <div className="flex"><span className="w-16 font-bold uppercase">NAMA</span> <span>: {selectedReq.nama}</span></div>
                                            <div className="flex"><span className="w-16 font-bold uppercase">NO SKRD</span> <span>: 00{selectedReq.id}/SKRD/DLH/2026</span></div>
                                        </div>
                                        <div className="text-center border-l-2 border-black pl-4">
                                            <p className="font-bold">Diterima Tanggal: .....................</p>
                                            <div className="h-8 w-24 mx-auto border-b border-black mt-2"></div>
                                            <p className="text-[6px] mt-1 font-bold italic uppercase">Penerima SKRD</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BendaharaSkrd;