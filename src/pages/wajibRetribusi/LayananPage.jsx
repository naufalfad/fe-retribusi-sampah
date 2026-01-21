import React, { useState } from 'react';
import {
    UserCog, UserMinus, Send, Upload, History, AlertCircle,
    FileText, CheckCircle2, Building2, ChevronDown, MapPin
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const LayananPage = () => {
    const [activeTab, setActiveTab] = useState('perubahan');

    // 1. Daftar Aset Milik Akun (Sama seperti di Dashboard/SKRD)
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

    // 2. State Aset yang dipilih untuk layanan
    const [selectedAsset, setSelectedAsset] = useState(myAssets[0]);

    // Data Dummy Riwayat Pengajuan (Ditambahkan kolom NPWRD)
    const historyRequests = [
        { id: 'REQ-001', npwrd: '4.1.2.01.02.000001', jenis: 'Perubahan Data', tanggal: '2026-01-05', status: 'Proses Verifikasi' },
        { id: 'REQ-002', npwrd: '4.1.2.01.02.000088', jenis: 'Penonaktifan', tanggal: '2025-12-20', status: 'Ditolak' },
    ];

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Layanan Mandiri</h1>
                    <p className="text-gray-500 text-sm font-medium">Ajukan perubahan atau penonaktifan obyek retribusi Anda.</p>
                </div>
            </div>

            {/* TAB SWITCHER */}
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

                    {/* ASSET SELECTOR: Bagian terpenting untuk Multi-Objek */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border-l-8 border-l-blue-600">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Building2 size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pilih Obyek/Aset:</p>
                                <h2 className="text-lg font-black text-gray-800 tracking-tighter uppercase">{selectedAsset.nama}</h2>
                                <p className="text-xs text-blue-600 font-mono font-bold">{selectedAsset.npwrd}</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <select
                                value={selectedAsset.npwrd}
                                onChange={(e) => setSelectedAsset(myAssets.find(a => a.npwrd === e.target.value))}
                                className="appearance-none bg-gray-900 text-white pl-6 pr-12 py-3 rounded-2xl font-bold text-xs cursor-pointer w-full"
                            >
                                {myAssets.map(asset => (
                                    <option key={asset.npwrd} value={asset.npwrd}>Aset: {asset.nama}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`p-5 text-white flex items-center justify-between ${activeTab === 'perubahan' ? 'bg-green-700' : 'bg-red-600'}`}>
                            <div className="flex items-center gap-3">
                                {activeTab === 'perubahan' ? <UserCog size={20} /> : <UserMinus size={20} />}
                                <span className="font-black uppercase text-xs tracking-widest">Form Pengajuan {activeTab}</span>
                            </div>
                        </div>

                        <form className="p-10 space-y-8">
                            {activeTab === 'perubahan' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 bg-yellow-50 p-6 rounded-[2rem] border border-yellow-100 mb-2">
                                        <div className="flex gap-3">
                                            <AlertCircle className="text-yellow-600 shrink-0" size={20} />
                                            <p className="text-xs text-yellow-800 font-medium leading-relaxed uppercase tracking-tight">
                                                <strong>PENTING:</strong> Perubahan data ini hanya berlaku untuk aset <strong>{selectedAsset.nama} ({selectedAsset.npwrd})</strong>. Data akun utama Anda tidak akan berubah.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Obyek Baru</label>
                                        <input type="text" placeholder="Contoh: Ruko Maju Jaya 2" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all text-sm font-bold" />

                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telepon Obyek Baru</label>
                                        <input type="text" placeholder="0812xxxx" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all text-sm font-bold" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap Obyek Baru</label>
                                        <textarea placeholder="Masukkan alamat lengkap baru..." rows="5" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-50 focus:border-green-600 outline-none transition-all text-sm font-bold"></textarea>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                                        <p className="text-xs text-red-800 font-bold leading-relaxed uppercase tracking-tighter italic">
                                            "Anda mengajukan penghentian retribusi untuk obyek: {selectedAsset.nama}."
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alasan Penonaktifan Aset</label>
                                        <textarea
                                            placeholder="Sebutkan alasan (Contoh: Usaha tutup, bangunan dibongkar, dll)"
                                            className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-red-50 focus:border-red-600 outline-none transition-all text-sm font-bold"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {/* UPLOAD DOKUMEN */}
                            <div className="pt-8 border-t border-gray-100">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
                                    Dokumen Pendukung (Surat Pernyataan)
                                </label>
                                <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Upload size={32} className="text-blue-600" />
                                    </div>
                                    <p className="text-xs font-black text-gray-700 mt-4 uppercase tracking-widest">Unggah Berkas Scan</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Format: PDF/JPG (Maks 2MB)</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-[0.2em] active:scale-95 ${activeTab === 'perubahan' ? 'bg-green-700 hover:bg-black shadow-green-900/20' : 'bg-red-600 hover:bg-black shadow-red-900/20'}`}
                            >
                                <Send size={18} /> Kirim Pengajuan {activeTab}
                            </button>
                        </form>
                    </div>
                </div>

                {/* SIDEBAR: HISTORY & SOP */}
                <div className="space-y-6">
                    {/* Riwayat Pengajuan - Dinamis (Menampilkan Aset Terkait) */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden font-sans">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><History size={18} /></div>
                            <span className="font-black text-xs text-gray-800 uppercase tracking-widest">Riwayat Layanan</span>
                        </div>
                        <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {historyRequests.map((req) => (
                                <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{req.id}</span>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <p className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{req.jenis}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Building2 size={12} className="text-gray-400" />
                                        <p className="text-[10px] font-bold text-gray-500 font-mono tracking-tighter">{req.npwrd}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 italic">{req.tanggal}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alert SOP */}
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black flex items-center gap-3 mb-6 uppercase text-xs tracking-widest">
                                <CheckCircle2 size={20} className="text-blue-200" /> Prosedur Resmi
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "Unggah surat permohonan tertandatangan.",
                                    "Petugas UPT memproses verifikasi lapangan.",
                                    "Validasi akhir oleh Bidang/Dinas."
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                                        <span className="text-[11px] font-bold opacity-90 leading-relaxed uppercase tracking-tight">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <FileText className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayananPage;