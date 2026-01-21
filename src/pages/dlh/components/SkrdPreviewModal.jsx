// src/pages/dlh/components/SkrdPreviewModal.jsx
import React from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';

const SkrdPreviewModal = ({ data, onClose, config }) => {
    // Helper untuk menghitung rincian biaya berdasarkan tipe WP
    const isPribadi = data?.tipe_wp === 'PRIBADI';

    // Perhitungan rincian untuk ditampilkan di tabel
    const renderRincianRows = () => {
        const volume = parseFloat(data?.volume) || 0;

        if (isPribadi) {
            // --- RUMAH TINGGAL ---
            return (
                <>
                    {/* 1. Tarif Flat */}
                    <tr>
                        <td className="border border-black p-2 font-bold">4.1.2.01.02.001</td>
                        <td className="border border-black p-2 text-left">
                            <p className="font-bold">Retribusi Pelayanan Kebersihan (Flat)</p>
                            <p className="text-[10px] italic">Klasifikasi: {data?.kelas_retribusi_label}</p>
                        </td>
                        <td className="border border-black p-2 text-right">
                            {data?.tarif_flat?.toLocaleString('id-ID')},00
                        </td>
                    </tr>
                    {/* 2. Pelayanan dari TPS/TPST */}
                    <tr>
                        <td className="border border-black p-2 font-bold">4.1.2.01.02.002</td>
                        <td className="border border-black p-2 text-left">
                            <p className="font-bold">Pelayanan Sampah TPS/TPST (Volume)</p>
                            <p className="text-[10px] italic">Volume: {volume} m³ x Rp 56.950</p>
                        </td>
                        <td className="border border-black p-2 text-right">
                            {(volume * 56950).toLocaleString('id-ID')},00
                        </td>
                    </tr>
                </>
            );
        } else {
            // --- NON RUMAH TINGGAL (Wajib 3 Pelayanan) ---
            // Kita asumsikan data.inclusions berisi 3 objek pelayanan tersebut
            const labels = [
                "Pelayanan dari Sumber Sampah",
                "Pelayanan Pengangkutan dari TPS/TPST",
                "Pelayanan Pemrosesan Akhir sampah"
            ];

            return data?.inclusions?.map((service, index) => (
                <tr key={index}>
                    <td className="border border-black p-2 font-bold">4.1.2.01.02.00{index + 1}</td>
                    <td className="border border-black p-2 text-left">
                        {/* Menggunakan label spesifik sesuai urutan atau dari data */}
                        <p className="font-bold">{labels[index] || service.name}</p>
                        <p className="text-[10px] italic">Volume: {volume} m³ x Rp {service.price.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="border border-black p-2 text-right">
                        {(volume * service.price).toLocaleString('id-ID')},00
                    </td>
                </tr>
            ));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2 text-green-700">
                        <FileText size={20} />
                        <span className="font-black uppercase text-xs tracking-widest">Pratinjau Dokumen SKRD Resmi</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Modal Content */}
                <div className="p-10 overflow-y-auto bg-gray-200 custom-scrollbar">
                    <div className="bg-white p-12 shadow-lg border border-gray-300 mx-auto w-full max-w-[21cm] min-h-[29cm] text-black font-serif relative">

                        {/* Header SKRD */}
                        <div className="border-b-4 border-double border-black pb-4 mb-6 flex items-start">
                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mr-4 border border-black p-2">
                                <img src="/logo-bogor.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 text-center">
                                <h2 className="font-bold text-lg leading-tight">
                                    {config?.dinas || "DINAS LINGKUNGAN HIDUP"} <br />
                                    {config?.pemda || "KABUPATEN BOGOR"}
                                </h2>
                                <p className="text-[10px] italic">Jl. Tegar Beriman (021) 29615851, Fax (021) 87909162 Cibinong 16914</p>
                                <p className="text-[10px] underline text-blue-600">dlh.bogorkab.go.id</p>
                            </div>
                            <div className="w-52 border border-black p-2 text-[10px]">
                                <p className="font-bold text-center border-b border-black mb-1 italic">SURAT KETETAPAN RETRIBUSI DAERAH (SKRD)</p>
                                <div className="grid grid-cols-[50px_5px_1fr] gap-0.5">
                                    <span>MASA</span> <span>:</span> <span className="font-bold">{data?.masa_retribusi?.toUpperCase()}</span>
                                    <span>TAHUN</span> <span>:</span> <span className="font-bold">2026</span>
                                </div>
                            </div>
                        </div>

                        {/* No SKRD */}
                        <div className="text-right mb-6">
                            <div className="inline-block border border-black p-1 px-4">
                                <span className="text-[10px] font-bold mr-2">NO. SKRD :</span>
                                <span className="text-sm font-black tracking-widest">{data?.skrd_no || data?.nomor_skrd}</span>
                            </div>
                        </div>

                        {/* Identity Section - Menambahkan NPOR */}
                        <div className="space-y-0.5 mb-8 text-[12px]">
                            <div className="grid grid-cols-[140px_10px_1fr]">
                                <span className="font-bold">NAMA WAJIB RETRIBUSI</span> <span>:</span> <span className="uppercase font-bold">{data?.nama_wp || data?.nama_badan || data?.nama_lengkap}</span>
                                <span className="font-bold">ALAMAT</span> <span>:</span> <span>{data?.alamat_objek?.jalan}, {data?.alamat_objek?.kecamatan}</span>

                                <span className="font-bold pt-4">NPWRD</span> <span className="pt-4">:</span> <span className="pt-4 font-bold font-mono text-sm">{data?.npwrd}</span>
                                {/* Penambahan NPOR */}
                                <span className="font-bold">NPOR (ID OBJEK)</span> <span>:</span> <span className="font-black font-mono text-sm text-green-700">{data?.npor}</span>

                                <span className="font-bold pt-2">JATUH TEMPO</span> <span className="pt-2">:</span> <span className="pt-2 font-bold">{data?.jatuh_tempo || '20 FEBRUARI 2026'}</span>
                            </div>
                        </div>

                        {/* Tabel Rincian */}
                        <table className="w-full border-collapse border border-black mb-6 text-[11px] text-center">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 w-32">KODE REKENING</th>
                                    <th className="border border-black p-2 italic">URAIAN RETRIBUSI PELAYANAN PERSAMPAHAN</th>
                                    <th className="border border-black p-2 w-40 font-bold italic">JUMLAH (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderRincianRows()}

                                <tr className="font-bold">
                                    <td colSpan="2" className="border border-black p-2 text-right italic">Jumlah ketetapan pokok retribusi :</td>
                                    <td className="border border-black p-2 text-right">
                                        {data?.total_tagihan?.toLocaleString('id-ID')},00
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="border border-black p-2 text-right font-bold italic">Jumlah Sanksi (Denda) :</td>
                                    <td className="border border-black p-2 text-right">0,00</td>
                                </tr>
                                <tr className="bg-gray-100">
                                    <td colSpan="2" className="border border-black p-3 text-right font-black uppercase tracking-wider">Jumlah Keseluruhan Retribusi :</td>
                                    <td className="border border-black p-3 text-right font-black text-sm underline decoration-double">
                                        Rp {data?.total_tagihan?.toLocaleString('id-ID')},00
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Terbilang */}
                        <div className="text-[11px] italic mb-12 border border-black p-2 bg-gray-50 uppercase">
                            <span className="font-bold not-italic">Terbilang: </span>
                            "Empat Ratus Ribu Lima Ratus Dua Puluh Rupiah"
                        </div>

                        {/* Tanda Tangan Section */}
                        <div className="flex justify-between items-start text-[11px] px-4">
                            <div className="space-y-1 max-w-[300px] italic text-[9px]">
                                <p className="font-bold underline">PERHATIAN:</p>
                                <p>1. Harap pembayaran dilakukan secara NON-TUNAI (Transfer/QRIS/Bank).</p>
                                <p>2. Apabila SKRD ini tidak dibayar tepat waktu, maka akan dikenakan sanksi administrasi berupa denda sesuai peraturan yang berlaku.</p>
                                <p>3. Simpan bukti pembayaran ini sebagai tanda bukti yang sah.</p>
                            </div>
                            <div className="text-center w-64">
                                <p>Cibinong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="font-bold mb-20 uppercase underline">Kepala Dinas Lingkungan Hidup</p>
                                <p className="font-bold uppercase underline">H. ASNAN, S.E., M.Si.</p>
                                <p>NIP. 19720101 199203 1 001</p>
                            </div>
                        </div>

                        {/* Watermark/Footer Sistem */}
                        <div className="absolute bottom-4 left-10 text-[8px] text-gray-400 font-mono italic">
                            Dicetak otomatis melalui Sistem SIRESIK Kab. Bogor pada {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t bg-white flex justify-end gap-3">
                    <button className="px-8 py-3 border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">
                        <Download size={16} className="inline mr-2" /> Simpan PDF
                    </button>
                    <button className="px-10 py-3 bg-green-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-xl shadow-green-900/20 transition-all active:scale-95">
                        <Printer size={16} /> Cetak SKRD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkrdPreviewModal;