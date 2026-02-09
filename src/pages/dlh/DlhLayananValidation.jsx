import React, { useState } from 'react';
import {
    UserCog, UserMinus, Eye, CheckCircle, XCircle,
    FileText, Search, Filter, ArrowRight, AlertCircle,
    ExternalLink, CheckCircle2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DlhLayananValidation = () => {
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Data Dummy Pengajuan dari UPT & Mandiri (Sesuai SOP)
    const [requests] = useState([
        {
            id: 'REQ-DLH-001',
            nama: 'PT. MAJU BERSAMA',
            npwrd: '4.1.2.01.02.000001',
            tipe: 'Perubahan Data',
            sumber: 'UPT CIBINONG',
            tgl: '2026-01-09',
            data_lama: { nama: 'PT. MAJU BERSAMA', telp: '021-8888' },
            data_baru: { nama: 'PT. MAJU BERSAMA JAYA', telp: '021-8889' }
        },
        {
            id: 'REQ-DLH-002',
            nama: 'TOKO KELONTONG ASRI',
            npwrd: '4.1.2.01.02.000552',
            tipe: 'Penonaktifan',
            sumber: 'MANDIRI (USER)',
            tgl: '2026-01-08',
            alasan: 'Usaha Tutup / Bangkrut'
        },
    ]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Validasi Layanan Wajib Retribusi</h1>
                    <p className="text-sm text-gray-500 font-medium">Otorisasi final untuk perubahan data dan penonaktifan Wajib Retribusi.</p>
                </div>
                <div className="flex gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl items-center">
                    <AlertCircle size={18} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase italic">Validasi berdasarkan SOP Perbup No. 7</span>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Cari NPWRD / Nama..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm" />
                </div>
                <div className="flex gap-2">
                    <select className="bg-gray-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 outline-none">
                        <option>Semua Tipe</option>
                        <option>Perubahan Data</option>
                        <option>Penonaktifan</option>
                    </select>
                    <button className="bg-green-700 text-white p-3 rounded-2xl hover:bg-green-800 transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Tabel Validasi */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">ID / TGL</th>
                            <th className="p-6">Wajib Retribusi</th>
                            <th className="p-6">Jenis Layanan</th>
                            <th className="p-6">Sumber Pengajuan</th>
                            <th className="p-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6">
                                    <p className="text-xs font-bold text-gray-800">{req.id}</p>
                                    <p className="text-[10px] text-gray-400">{req.tgl}</p>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-sm text-gray-800">{req.nama}</p>
                                    <p className="text-[10px] text-green-700 font-mono font-bold uppercase">{req.npwrd}</p>
                                </td>
                                <td className="p-6">
                                    <div className={`flex items-center gap-2 font-bold text-xs ${req.tipe === 'Penonaktifan' ? 'text-red-600' : 'text-blue-600'}`}>
                                        {req.tipe === 'Penonaktifan' ? <UserMinus size={14} /> : <UserCog size={14} />}
                                        {req.tipe}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-gray-200">
                                        {req.sumber}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 mx-auto"
                                    >
                                        <Eye size={14} /> Periksa Berkas
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL VALIDASI DETAIL */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {/* Header Modal */}
                        <div className={`p-6 text-white flex justify-between items-center ${selectedRequest.tipe === 'Penonaktifan' ? 'bg-red-600' : 'bg-blue-600'}`}>
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-tight">Validasi Final Bidang DLH</h2>
                                <p className="text-xs opacity-80">Memeriksa Pengajuan: {selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-all"><XCircle size={24} /></button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto">
                            {/* Info Profil */}
                            <div className="space-y-6">
                                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest border-b pb-2">Informasi Wajib Retribusi</h3>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <p className="text-lg font-black text-gray-800">{selectedRequest.nama}</p>
                                    <p className="font-mono text-xs text-green-700 font-bold mb-4">{selectedRequest.npwrd}</p>
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500">Diajukan melalui: <strong>{selectedRequest.sumber}</strong></p>
                                        <p className="text-xs text-gray-500">Tanggal Pengajuan: <strong>{selectedRequest.tgl}</strong></p>
                                    </div>
                                </div>

                                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest border-b pb-2">Berkas Pendukung (Scan Surat)</h3>
                                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-between group hover:border-blue-400 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-gray-400 group-hover:text-blue-500" />
                                        <span className="text-xs font-bold text-gray-600">Surat_Permohonan_Sah.pdf</span>
                                    </div>
                                    <ExternalLink size={16} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Perubahan Data / Alasan Penonaktifan */}
                            <div className="space-y-6">
                                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest border-b pb-2">Rincian Pengajuan</h3>

                                {selectedRequest.tipe === 'Perubahan Data' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Lama</p>
                                                <p className="text-sm font-medium text-gray-400 line-through">{selectedRequest.data_lama.nama}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Nama Baru</p>
                                                <p className="text-sm font-black text-blue-800">{selectedRequest.data_baru.nama}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Telepon Lama</p>
                                                <p className="text-sm font-medium text-gray-400 line-through">{selectedRequest.data_lama.telp}</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Telepon Baru</p>
                                                <p className="text-sm font-black text-blue-800">{selectedRequest.data_baru.telp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <label className="text-[10px] font-bold text-red-400 uppercase mb-2 block">Alasan Penonaktifan</label>
                                        <p className="font-bold text-red-800 leading-relaxed italic">"{selectedRequest.alasan}"</p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] text-red-600 font-bold uppercase">
                                            <AlertCircle size={14} /> Memerlukan Validasi Saldo Tunggakan
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Modal / Aksi */}
                        <div className="p-8 border-t bg-gray-50 flex gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-50 transition-all">
                                <XCircle size={18} /> Tolak Pengajuan
                            </button>
                            <button className={`flex-[2] flex items-center justify-center gap-2 text-white font-bold py-4 rounded-2xl shadow-xl transition-all ${selectedRequest.tipe === 'Penonaktifan' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-700 hover:bg-green-800'}`}>
                                <CheckCircle size={18} /> Konfirmasi & Update Database
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DlhLayananValidation;