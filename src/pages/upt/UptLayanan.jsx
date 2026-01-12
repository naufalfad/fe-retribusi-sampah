import React, { useState } from 'react';
import {
    Search, UserCog, UserMinus, FileText, Send,
    Inbox, PlusCircle, CheckCircle2, XCircle, Eye,
    ArrowLeft, Clock, SearchIcon
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const UptLayanan = () => {
    const [view, setView] = useState('list'); // 'list' | 'input-offline' | 'detail-verifikasi'
    const [mode, setMode] = useState(null); // 'perubahan' | 'penonaktifan'
    const [searchNpwrd, setSearchNpwrd] = useState('');

    // Dummy Data Antrian Pengajuan (Gabungan Mandiri & Offline)
    const [requests] = useState([
        {
            id: 'REQ-2026-001',
            npwrd: '4.1.2.01.02.000001',
            nama: 'PT. MAJU JAYA',
            tipe: 'Perubahan Data',
            sumber: 'MANDIRI',
            tgl: '2026-01-09',
            status: 'Proses Verifikasi UPT'
        },
        {
            id: 'REQ-2026-002',
            npwrd: '4.1.2.01.02.000042',
            nama: 'Sutisna (Pribadi)',
            tipe: 'Penonaktifan',
            sumber: 'UPT (OFFLINE)',
            tgl: '2026-01-08',
            status: 'Menunggu Validasi Dinas'
        },
    ]);

    return (
        <div className="space-y-6 pb-20">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Layanan Administrasi UPT</h1>
                    <p className="text-gray-500 font-medium">Verifikasi Pengajuan Mandiri & Input Layanan Offline</p>
                </div>

                {view === 'list' && (
                    <button
                        onClick={() => setView('input-offline')}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-900/20 transition-all"
                    >
                        <PlusCircle size={20} />
                        <span>Input Pengajuan Offline</span>
                    </button>
                )}
            </div>

            {/* --- VIEW 1: DAFTAR SEMUA PENGAJUAN (INBOX) --- */}
            {view === 'list' && (
                <div className="space-y-6">
                    {/* Dashboard Ringkas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Antrian</p>
                            <p className="text-2xl font-black text-gray-800">12 Pengajuan</p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                            <p className="text-xs font-bold text-orange-400 uppercase mb-1">Perlu Verifikasi UPT</p>
                            <p className="text-2xl font-black text-orange-700">5 <span className="text-xs font-medium">Mandiri</span></p>
                        </div>
                    </div>

                    {/* Tabel Pengajuan */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                                <Inbox size={18} className="text-green-700" /> Antrian Layanan Masuk
                            </h3>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Cari NPWRD..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-700" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">No. Pengajuan</th>
                                        <th className="p-6">Wajib Retribusi</th>
                                        <th className="p-6">Tipe & Sumber</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-6">
                                                <p className="font-mono text-xs font-bold text-gray-500">{req.id}</p>
                                                <p className="text-[10px] text-gray-400">{req.tgl}</p>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-bold text-gray-800 text-sm">{req.nama}</p>
                                                <p className="text-[10px] text-green-700 font-mono">{req.npwrd}</p>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm font-bold text-gray-700">{req.tipe}</p>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${req.sumber === 'MANDIRI' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {req.sumber}
                                                </span>
                                            </td>
                                            <td className="p-6"><StatusBadge status={req.status} /></td>
                                            <td className="p-6 text-center">
                                                <button
                                                    onClick={() => setView('detail-verifikasi')}
                                                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 mx-auto"
                                                >
                                                    <Eye size={14} /> Periksa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VIEW 2: INPUT LAYANAN OFFLINE (CARI NPWRD DULU) --- */}
            {view === 'input-offline' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <button onClick={() => { setView('list'); setMode(null) }} className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700">
                        <ArrowLeft size={20} /> Kembali ke Antrian
                    </button>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Input Pengajuan Offline (WR Datang Langsung)</h2>
                        <div className="max-w-xl space-y-4">
                            <label className="text-sm font-bold text-gray-600">Langkah 1: Cari NPWRD Wajib Retribusi</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Masukkan NPWRD Aktif..."
                                    className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-700 font-mono tracking-widest"
                                    value={searchNpwrd}
                                    onChange={(e) => setSearchNpwrd(e.target.value)}
                                />
                                <button className="bg-green-700 text-white px-6 rounded-2xl font-bold">Cari</button>
                            </div>

                            {/* Simulasi jika data ditemukan, tampilkan opsi mode */}
                            {searchNpwrd.length > 5 && (
                                <div className="pt-8 grid grid-cols-2 gap-4 animate-in fade-in">
                                    <button
                                        onClick={() => setMode('perubahan')}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'perubahan' ? 'border-green-700 bg-green-50' : 'border-gray-50 bg-gray-50'}`}
                                    >
                                        <UserCog size={32} className="text-green-700" />
                                        <span className="font-bold text-sm">Perubahan Data</span>
                                    </button>
                                    <button
                                        onClick={() => setMode('penonaktifan')}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'penonaktifan' ? 'border-red-600 bg-red-50' : 'border-gray-50 bg-gray-50'}`}
                                    >
                                        <UserMinus size={32} className="text-red-600" />
                                        <span className="font-bold text-sm">Penonaktifan</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Input Detail (Muncul jika mode dipilih) */}
                    {mode && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-gray-800 uppercase">Detail Pengajuan Offline</h3>
                            <textarea placeholder="Masukkan rincian pengajuan berdasarkan berkas fisik..." className="w-full p-4 bg-gray-50 border rounded-2xl outline-none h-32"></textarea>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50">
                                <FileText className="text-gray-300 mb-2" />
                                <p className="text-sm font-bold text-gray-500">Upload Berkas Fisik (Scan Permohonan)</p>
                            </div>
                            <button className="w-full py-4 bg-green-700 text-white rounded-2xl font-bold">Simpan & Teruskan ke Dinas</button>
                        </div>
                    )}
                </div>
            )}

            {/* --- VIEW 3: DETAIL VERIFIKASI (PENGAJUAN MANDIRI) --- */}
            {view === 'detail-verifikasi' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700">
                        <ArrowLeft size={20} /> Kembali ke Daftar
                    </button>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Verifikasi Pengajuan Mandiri</p>
                                <h2 className="text-xl font-bold">REQ-2026-001 - PT. MAJU JAYA</h2>
                            </div>
                            <div className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold">
                                Masuk: 09 Jan 2026
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest border-b pb-2">Data Yang Diajukan User</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-50 py-2">
                                        <span className="text-sm text-gray-500">Nama Baru:</span>
                                        <span className="text-sm font-bold text-gray-800">PT. MAJU JAYA SEJAHTERA</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 py-2">
                                        <span className="text-sm text-gray-500">Telepon Baru:</span>
                                        <span className="text-sm font-bold text-gray-800">0812-9999-0000</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500">Alasan Perubahan:</span>
                                        <p className="text-sm bg-gray-50 p-3 rounded-xl text-gray-700 italic">"Perubahan nama sesuai Akta Notaris terbaru nomor 123/2025."</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest border-b pb-2">Lampiran Berkas User</h4>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-4">
                                    <FileText size={48} className="text-blue-500" />
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-800">SK_Kemenkumham.pdf</p>
                                        <p className="text-[10px] text-gray-400">Diunggah oleh Wajib Retribusi</p>
                                    </div>
                                    <button className="bg-white text-blue-600 border border-blue-200 px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-50">
                                        Buka Berkas
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-50">
                                <XCircle size={20} /> Tolak (Berkas Tidak Sesuai)
                            </button>
                            <button className="flex-[2] flex items-center justify-center gap-2 bg-green-700 text-white font-bold py-4 rounded-2xl hover:bg-green-800 shadow-lg shadow-green-900/20">
                                <CheckCircle2 size={20} /> Validasi & Teruskan ke Dinas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UptLayanan;