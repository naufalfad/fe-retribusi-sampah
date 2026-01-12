// src/pages/dlh/components/SkrdPreviewModal.jsx
import React from 'react';
import { X, Printer, Download } from 'lucide-react';

const SkrdPreviewModal = ({ data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-700 text-white rounded-lg"><Printer size={18} /></div>
                        <span className="font-bold text-gray-700">Preview Cetak SKRD</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Modal Content - Area Simulasi Kertas SKRD */}
                <div className="p-10 overflow-y-auto bg-gray-100">
                    <div className="bg-white p-8 shadow-lg border border-gray-300 mx-auto w-full max-w-[21cm] min-h-[29cm] text-black font-serif">

                        {/* Header SKRD Sesuai PDF */}
                        <div className="border-b-2 border-black pb-4 mb-6 flex items-start">
                            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center mr-4 border border-black">Logo</div>
                            <div className="flex-1 text-center">
                                <h2 className="font-bold text-lg leading-tight">DINAS LINGKUNGAN HIDUP<br />KABUPATEN BOGOR</h2>
                                <p className="text-xs italic">Jl. Tegar Beriman (021) 29615851, Fax (021) 87909162 Cibinong 16914</p>
                                <p className="text-xs underline text-blue-600">dlh.bogorkab.go.id</p>
                            </div>
                            <div className="w-48 border border-black p-2 text-xs">
                                <p className="font-bold text-center border-b border-black mb-1">SURAT KETETAPAN RETRIBUSI DAERAH (SKRD)</p>
                                <div className="grid grid-cols-2 gap-1">
                                    <span>MASA</span> <span>: JANUARI</span>
                                    <span>TAHUN</span> <span>: 2026</span>
                                </div>
                            </div>
                            <div className="ml-4 border border-black p-2 text-center flex flex-col justify-center">
                                <p className="text-[10px] font-bold">NO. SKRD</p>
                                <p className="text-sm font-bold tracking-widest">{data?.skrd_no}</p>
                            </div>
                        </div>

                        {/* Identity Section */}
                        <div className="space-y-1 mb-6 text-sm">
                            <div className="grid grid-cols-[100px_10px_1fr]">
                                <span className="font-bold">NAMA</span> <span>:</span> <span className="uppercase font-bold">{data?.nama}</span>
                                <span className="font-bold">ALAMAT</span> <span>:</span> <span>{data?.alamat}</span>
                                <span className="font-bold pt-4">NPWRD</span> <span className="pt-4">:</span> <span className="pt-4 font-bold">{data?.npwrd}</span>
                                <span className="font-bold">JATUH TEMPO</span> <span>:</span> <span>20 JANUARI 2026</span>
                            </div>
                        </div>

                        {/* Tabel Rincian */}
                        <table className="w-full border-collapse border border-black mb-6 text-sm text-center">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 w-32">KODE REKENING</th>
                                    <th className="border border-black p-2">URAIAN RETRIBUSI PELAYANAN PERSAMPAHAN</th>
                                    <th className="border border-black p-2 w-40">JUMLAH (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-4 font-bold">4.1.2.01.02</td>
                                    <td className="border border-black p-4 text-left">Sewa Bak / Pelayanan Kebersihan Masa Januari 2026</td>
                                    <td className="border border-black p-4 text-right">50.000,00</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="border border-black p-2 text-right font-bold italic">Jumlah ketetapan pokok retribusi :</td>
                                    <td className="border border-black p-2 text-right font-bold">50.000,00</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="border border-black p-2 text-right">Jumlah Sanksi : a. Denda</td>
                                    <td className="border border-black p-2 text-right">0,00</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan="2" className="border border-black p-2 text-right font-black uppercase">Jumlah Keseluruhan Retribusi :</td>
                                    <td className="border border-black p-2 text-right font-black underline">50.000,00</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Terbilang & Tanda Tangan */}
                        <div className="text-sm italic mb-10">
                            Terbilang: Lima Puluh Ribu Rupiah
                        </div>

                        <div className="flex justify-between items-start text-sm px-4">
                            <div className="text-[10px] space-y-1 max-w-[250px]">
                                <p>a. Harap pembayaran dilakukan secara non tunai</p>
                                <p>b. Apabila SKRD ini tidak dibayar/dibayarkan lewat jatuh tempo maka dikenakan denda</p>
                            </div>
                            <div className="text-center">
                                <p>Cibinong, 10 Januari 2026</p>
                                <p className="font-bold mb-16 uppercase underline">Kepala Dinas Lingkungan Hidup</p>
                                <p>( ............................................................ )</p>
                                <p>NIP. ............................................................</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t bg-white flex justify-end gap-3">
                    <button className="px-6 py-3 border border-gray-200 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Download size={18} /> Simpan PDF
                    </button>
                    <button className="px-6 py-3 bg-green-700 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-800 shadow-lg shadow-green-900/20 transition-all">
                        <Printer size={18} /> Cetak Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkrdPreviewModal;