import React from 'react';
import { Users, FileCheck, UserPlus, AlertCircle } from 'lucide-react';

const UptDashboard = () => {
    const stats = [
        { label: 'Pendaftaran Baru', count: '12', color: 'bg-blue-600', icon: <UserPlus /> },
        { label: 'Perlu Verifikasi', count: '5', color: 'bg-orange-500', icon: <AlertCircle /> },
        { label: 'Wajib Retribusi Aktif', count: '1,240', color: 'bg-green-600', icon: <Users /> },
        { label: 'Layanan Selesai', count: '89', color: 'bg-purple-600', icon: <FileCheck /> },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard UPT</h1>
                <p className="text-gray-500 text-sm">Selamat datang kembali, Petugas UPT Wilayah Cibinong.</p>
            </div>

            {/* Grid Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl text-white ${s.color}`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                            <p className="text-2xl font-black text-gray-800">{s.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daftar Antrian Pendek */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Antrian Verifikasi Terbaru</h3>
                    <button className="text-green-700 text-sm font-bold hover:underline">Lihat Semua</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Nama Pemohon / Badan</th>
                                <th className="p-4">Jenis</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <tr className="text-sm">
                                <td className="p-4 text-gray-500">2026-01-09</td>
                                <td className="p-4 font-bold text-gray-800">Restoran Sunda Rasa</td>
                                <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">BADAN</span></td>
                                <td className="p-4"><span className="text-orange-500 font-bold text-xs italic">Menunggu Cek Berkas</span></td>
                                <td className="p-4">
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Periksa Berkas</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UptDashboard;