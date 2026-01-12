import React from 'react';
import { Database, Search, Filter, Download, MoreVertical } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const UptDatabase = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Database Wajib Retribusi</h1>
                    <p className="text-sm text-gray-500">Daftar seluruh wajib retribusi aktif dan non-aktif di wilayah Anda.</p>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
                    <Download size={18} /> Export Excel
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan NPWRD, Nama, atau Alamat..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none">
                        <option>Semua Status</option>
                        <option>Aktif</option>
                        <option>Non-Aktif</option>
                    </select>
                    <button className="bg-green-700 text-white p-3 rounded-2xl">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">NPWRD</th>
                                <th className="p-6">Nama Wajib Retribusi</th>
                                <th className="p-6">Kategori</th>
                                <th className="p-6">Kecamatan / Desa</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-mono text-xs font-bold text-green-700">4.1.2.01.02.00000{item}</td>
                                    <td className="p-6">
                                        <p className="font-bold text-gray-800 text-sm">PT. Contoh Perusahaan {item}</p>
                                        <p className="text-[10px] text-gray-400 italic">Terdaftar sejak: 12 Jan 2023</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black uppercase">Badan</span>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-medium text-gray-600">Cibinong</p>
                                        <p className="text-[10px] text-gray-400">Pakan Sari</p>
                                    </td>
                                    <td className="p-6"><StatusBadge status="Aktif" /></td>
                                    <td className="p-6 text-center">
                                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UptDatabase;