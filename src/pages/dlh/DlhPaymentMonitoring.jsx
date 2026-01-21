import React, { useState } from 'react';
import {
    Search, Eye, SendHorizontal, Printer,
    CheckCircle2, Clock, FileCheck2, Filter, Image as ImageIcon, X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import SsrdPreviewModal from './components/SsrdPreviewModal';

const DlhPaymentMonitoring = () => {
    const [showSsrdModal, setShowSsrdModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const handleViewProof = (data) => {
        setSelectedData(data);
        setShowProofModal(true);
    };

    // Data Dummy untuk simulasi alur
    const [payments] = useState([
        {
            id: 1,
            nama: 'TOKO KUE LEZAT',
            npwrd: '4.1.2.01.02.000088',
            skrd_no: '00045/SKRD/2026',
            tgl_bayar: '2026-01-09',
            jumlah: 75000,
            //status: 'Perlu Validasi DLH', // Tahap 1
            status: 'Menunggu Rekonsiliasi',
            metode_bayar: 'Transfer Bank',
            atas_nama_pengirim: 'Ahmad Subarjo',
            nama_bank: 'BCA',
            no_rekening: '0123456789',
            bukti_bayar_url: 'https://i.pinimg.com/736x/8a/0d/1b/8a0d1b6440263f64c668600021c1729c.jpg'
        },
        {
            id: 2,
            nama: 'PT. MAJU JAYA',
            npwrd: '4.1.2.01.02.000001',
            skrd_no: '00010/SKRD/2026',
            tgl_bayar: '2026-01-08',
            jumlah: 150000,
            status: 'Menunggu Rekonsiliasi', // Tahap 2 (Sudah di Bendahara)
            ssrd_no: '-'
        },
        {
            id: 3,
            nama: 'RESTORAN PADANG',
            npwrd: '4.1.2.01.02.000045',
            skrd_no: '00005/SKRD/2026',
            tgl_bayar: '2026-01-05',
            jumlah: 50000,
            status: 'Selesai (SSRD Terbit)', // Tahap 3
            ssrd_no: '00005/SSRD/2026'
        }
    ]);

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Monitoring Pembayaran & SSRD</h1>
                    <p className="text-sm text-gray-500">Validasi bukti bayar dan monitoring penerbitan SSRD oleh Bendahara.</p>
                </div>
            </div>

            {/* Kontrol Pencarian */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Cari NPWRD / Nama / No. SKRD..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm" />
                </div>
                <select className="bg-gray-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 outline-none">
                    <option>Semua Status</option>
                    <option>Perlu Validasi</option>
                    <option>Menunggu Rekon</option>
                    <option>Selesai</option>
                </select>
            </div>

            {/* Tabel Monitoring */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Wajib Retribusi</th>
                                <th className="p-6">No. SKRD / Nominal</th>
                                <th className="p-6">Tgl Bayar</th>
                                <th className="p-6">Status Proses</th>
                                <th className="p-6 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-sm">{p.nama}</p>
                                        <p className="text-[10px] text-green-700 font-mono font-bold">{p.npwrd}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-bold text-gray-500">{p.skrd_no}</p>
                                        <p className="font-black text-gray-800">Rp {p.jumlah.toLocaleString()}</p>
                                    </td>
                                    <td className="p-6 text-sm font-medium text-gray-600">{p.tgl_bayar}</td>
                                    <td className="p-6">
                                        <StatusBadge status={p.status === 'Selesai (SSRD Terbit)' ? 'Lunas' : (p.status === 'Perlu Validasi DLH' ? 'Belum Bayar' : 'Proses Verifikasi')} />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            {p.status === 'Perlu Validasi DLH' && (
                                                <>
                                                    <button
                                                        onClick={() => handleViewProof(p)} // Tambahkan onClick
                                                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                        title="Lihat Bukti Bayar"
                                                    >
                                                        <ImageIcon size={18} />
                                                    </button>
                                                    <button className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-green-800 shadow-md transition-all">
                                                        <SendHorizontal size={14} /> Teruskan ke Bendahara
                                                    </button>
                                                </>
                                            )}

                                            {p.status === 'Menunggu Rekonsiliasi' && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 italic">
                                                    <Clock size={12} /> Menunggu Rekon Bendahara
                                                </div>
                                            )}

                                            {p.status === 'Selesai (SSRD Terbit)' && (
                                                <>
                                                    <button
                                                        onClick={() => { setSelectedData(p); setShowSsrdModal(true); }}
                                                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all"
                                                    >
                                                        <FileCheck2 size={14} /> Lihat SSRD
                                                    </button>
                                                    <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
                                                        <Printer size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PREVIEW SSRD */}
            {showSsrdModal &&
                <SsrdPreviewModal
                    data={selectedData} onClose={() => setShowSsrdModal(false)} />}
            {showProofModal && (
                <PaymentProofModal
                    data={selectedData}
                    onClose={() => setShowProofModal(false)}
                />
            )}
        </div>
    );
};
const PaymentProofModal = ({ data, onClose }) => {
    if (!data) return null;

    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col gap-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-bold text-gray-700">{value || '-'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">

                {/* SISI KIRI: Gambar Struk (40%) */}
                <div className="md:w-1/2 bg-gray-100 p-6 flex flex-col justify-center items-center border-r border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter italic">Lampiran Foto Struk User</p>
                    <div className="relative group">
                        <img
                            src={data.bukti_bayar_url}
                            alt="Bukti Transfer"
                            className="max-h-[400px] w-full rounded-2xl shadow-md border-2 border-white object-contain"
                        />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-4">Pastikan nominal di gambar sesuai input</p>
                </div>

                {/* SISI KANAN: Detail Data Input (60%) */}
                <div className="md:w-1/2 flex flex-col bg-white">
                    {/* Header Modal */}
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-black text-gray-800 tracking-tight leading-none">Verifikasi Input</h3>
                            <p className="text-[10px] text-green-700 font-bold mt-1 uppercase font-mono">{data.npwrd}</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Data Detail Section */}
                    <div className="p-6 flex-grow space-y-6 overflow-y-auto">
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                            <p className="text-[10px] font-black text-green-600 uppercase mb-1">Nominal Yang Diinput</p>
                            <p className="text-2xl font-black text-green-800 tracking-tighter">Rp {data.jumlah.toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <InfoRow label="Metode Bayar" value={data.metode_bayar} />
                            <InfoRow label="Tanggal Bayar" value={data.tgl_bayar} />

                            <div className="col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <InfoRow label="Atas Nama Pengirim" value={data.atas_nama_pengirim} />
                                {data.metode_bayar === 'Transfer Bank' && (
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/50">
                                        <InfoRow label="Bank Asal" value={data.nama_bank} />
                                        <InfoRow label="No. Rekening" value={data.no_rekening} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 border-t border-gray-100 flex gap-3">
                        <button
                            className="flex-1 py-3 px-8 bg-green-700 text-white rounded-2xl font-black text-xs hover:bg-black shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all"
                        >
                            <CheckCircle2 size={16} /> Teruskan ke Bendahara
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DlhPaymentMonitoring;