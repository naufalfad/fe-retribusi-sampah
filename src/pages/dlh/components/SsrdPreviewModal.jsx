import React from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';

const SsrdPreviewModal = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2 text-green-700 font-bold">
                        <CheckCircle size={20} />
                        <span>Dokumen SSRD Sah (Digital)</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-200 p-4 md:p-10 custom-scrollbar">
                    <div className="min-w-[21cm] flex justify-center">
                        <div className="bg-white p-12 shadow-2xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] text-black font-serif relative">

                            {/* WATERMARK SAH (Optional for UI) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg]">
                                <h1 className="text-[150px] font-black">LUNAS</h1>
                            </div>

                            {/* Header SSRD Sesuai Lampiran IV */}
                            <div className="text-center border-b-4 border-double border-black pb-4 mb-8">
                                <h2 className="text-xl font-bold uppercase">Surat Setoran Retribusi Daerah</h2>
                                <h3 className="text-2xl font-black uppercase">(SSRD)</h3>
                            </div>

                            {/* Detail Content */}
                            <div className="space-y-6 text-sm">
                                <div className="grid grid-cols-[30px_200px_10px_1fr] gap-y-4">
                                    <span>a.</span> <span className="font-bold uppercase tracking-tight">Telah menerima uang sebesar</span> <span>:</span>
                                    <span className="font-bold italic bg-gray-50 p-2 border border-gray-200 uppercase">Rp {data?.jumlah.toLocaleString()},00</span>

                                    <span>b.</span> <span className="font-bold uppercase tracking-tight">Terbilang</span> <span>:</span>
                                    <span className="italic font-medium"># Tujuh Puluh Lima Ribu Rupiah #</span>

                                    <span>c.</span> <span className="font-bold uppercase tracking-tight">Dari Nama</span> <span>:</span>
                                    <span className="font-bold uppercase">{data?.nama}</span>

                                    <span></span> <span className="font-bold uppercase tracking-tight">Alamat</span> <span>:</span>
                                    <span>Jl. Raya Pemda No. 12, Cibinong, Bogor</span>

                                    <span>d.</span> <span className="font-bold uppercase tracking-tight">Sebagai Pembayaran</span> <span>:</span>
                                    <span className="font-medium underline">Retribusi Pelayanan Persampahan/Kebersihan</span>
                                </div>

                                {/* Kode Rekening Table */}
                                <table className="w-full border-collapse border border-black text-center mt-10">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-black p-3 w-1/2">KODE REKENING</th>
                                            <th className="border border-black p-3">JUMLAH</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-4 font-bold text-lg">4.1.2.01.02</td>
                                            <td className="border border-black p-4 font-black text-lg">Rp {data?.jumlah.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="grid grid-cols-2 gap-8 mt-12">
                                    <div>
                                        <p className="text-[10px] font-bold">Tanggal Diterima Uang :</p>
                                        <p className="font-bold border-b border-black pb-1">{data?.tgl_bayar}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold">Nomor SKRD :</p>
                                        <p className="font-bold border-b border-black pb-1">{data?.skrd_no}</p>
                                    </div>
                                </div>

                                {/* Signature Section - Lampiran IV Style */}
                                <div className="grid grid-cols-3 gap-4 mt-16 text-[10px] text-center font-bold">
                                    <div className="space-y-12">
                                        <p>Pembantu Bendahara<br />Penerimaan Pembantu</p>
                                        <p>( ................................ )</p>
                                    </div>
                                    <div className="space-y-12">
                                        <p>Juru Pungut</p>
                                        <p>( ................................ )</p>
                                    </div>
                                    <div className="space-y-12">
                                        <p>Pembayar/Penyetor</p>
                                        <p>( {data?.nama} )</p>
                                    </div>
                                </div>

                                <div className="mt-20 text-right">
                                    <p className="text-xs">Plt. BUPATI BOGOR,</p>
                                    <p className="font-black text-sm mt-12 uppercase underline">IWAN SETIAWAN</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-white flex justify-end gap-3">
                    <button className="px-6 py-3 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Download size={18} /> Simpan PDF
                    </button>
                    <button className="px-6 py-3 bg-green-700 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-800 shadow-lg shadow-green-900/20 transition-all">
                        <Printer size={18} /> Cetak SSRD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SsrdPreviewModal;