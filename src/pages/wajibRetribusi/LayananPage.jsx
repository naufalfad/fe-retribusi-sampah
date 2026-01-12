import React, { useState } from 'react';
import {
    UserCog,
    UserMinus,
    Send,
    Upload,
    History,
    AlertCircle,
    FileText,
    CheckCircle2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const LayananPage = () => {
    const [activeTab, setActiveTab] = useState('perubahan'); // 'perubahan' atau 'penonaktifan'

    // Data Dummy Riwayat Pengajuan
    const historyRequests = [
        { id: 'REQ-001', jenis: 'Perubahan Data', tanggal: '2026-01-05', status: 'Proses Verifikasi' },
        { id: 'REQ-002', jenis: 'Penonaktifan', tanggal: '2025-12-20', status: 'Ditolak' },
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Layanan Mandiri</h1>
                <p className="text-gray-500 text-sm">Ajukan perubahan data atau penonaktifan wajib retribusi sesuai SOP.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-gray-200/50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('perubahan')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perubahan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserCog size={18} /> Perubahan Data
                </button>
                <button
                    onClick={() => setActiveTab('penonaktifan')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'penonaktifan' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserMinus size={18} /> Penonaktifan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FORM SECTION (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`p-4 text-white flex items-center justify-between ${activeTab === 'perubahan' ? 'bg-green-700' : 'bg-red-600'}`}>
                            <div className="flex items-center gap-3">
                                {activeTab === 'perubahan' ? <UserCog size={20} /> : <UserMinus size={20} />}
                                <span className="font-bold">Form Pengajuan {activeTab === 'perubahan' ? 'Perubahan Data' : 'Penonaktifan'}</span>
                            </div>
                        </div>

                        <form className="p-6 space-y-6">
                            {activeTab === 'perubahan' ? (
                                /* FORM PERUBAHAN DATA (Sesuai SOP PDF 2) */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-2">
                                        <p className="text-xs text-yellow-800 leading-relaxed">
                                            <strong>Info:</strong> Berdasarkan SOP, data yang dapat diubah meliputi: Nama, Alamat, Desa, Kecamatan, Kategori, Telepon, dan Email.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Data Baru</label>
                                        <input type="text" placeholder="Nama Baru" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-sm" />
                                        <input type="text" placeholder="Telepon Baru" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-sm" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Alamat Baru</label>
                                        <textarea placeholder="Alamat Lengkap Baru" rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none text-sm"></textarea>
                                    </div>
                                </div>
                            ) : (
                                /* FORM PENONAKTIFAN (Sesuai SOP PDF 1) */
                                <div className="space-y-4">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-xs text-red-800 leading-relaxed italic">
                                            "Pengajuan permohonan berhenti menjadi wajib retribusi persampahan."
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penonaktifan</label>
                                        <textarea
                                            placeholder="Sebutkan alasan (Contoh: Pindah domisili, usaha tutup, dll)"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none text-sm"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD DOKUMEN (Wajib di kedua SOP) */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Dokumen Pendukung (Surat Pernyataan)
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer group">
                                    <Upload size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                                    <p className="text-xs font-medium text-gray-500">Pilih scan Surat Pernyataan yang sudah ditandatangani</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Format: PDF/JPG (Maks 2MB)</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'perubahan' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                <Send size={18} /> Kirim Pengajuan Sekarang
                            </button>
                        </form>
                    </div>
                </div>

                {/* HISTORY & INFO SECTION (Right) */}
                <div className="space-y-6">
                    {/* Riwayat Pengajuan */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-800">
                            <History size={18} className="text-blue-600" />
                            <span>Riwayat Pengajuan</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {historyRequests.map((req) => (
                                <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-gray-400">{req.id}</span>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{req.jenis}</p>
                                    <p className="text-[11px] text-gray-500">{req.tanggal}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alert SOP */}
                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <AlertCircle size={20} /> Prosedur Resmi
                        </h3>
                        <ul className="space-y-3 text-xs opacity-90 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="font-bold">1.</span>
                                <span>Wajib Retribusi mengunggah surat permohonan melalui aplikasi.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">2.</span>
                                <span>Petugas UPT akan memproses pengajuan Anda ke sistem internal.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">3.</span>
                                <span>Dinas/Bidang melakukan validasi akhir sebelum data diubah/dinonaktifkan.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayananPage;