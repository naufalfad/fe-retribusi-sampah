import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, PlusSquare, Building2,
    User, MoreVertical, Eye, MapPin, Layers, X
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const UptVerifiedList = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedWR, setSelectedWR] = useState(null);

    const handleViewDetails = (wr) => {
        setSelectedWR(wr);
        setShowModal(true);
    };

    // Data Dummy Wajib Retribusi yang sudah punya NPWRD (Parent)
    const [verifiedWR] = useState([
        {
            id: 1,
            npwrd: '4.1.2.01.02.000001',
            nama: 'KINAN KARI',
            kategori: 'PRIBADI',
            wilayah: 'CIBINONG',
            status: 'Aktif',
            objek_list: [
                { id: 'A1', nama: 'Rumah Tinggal Utama', alamat: 'Perumahan Kebun Hijau Blok A1', luas: 150 },
                { id: 'A2', nama: 'Ruko Sembako', alamat: 'Jl. Raya Pemda No. 10', luas: 80 }
            ]
        },
        {
            id: 2,
            npwrd: '4.1.2.01.02.000088',
            nama: 'PT. MAJU JAYA SEJAHTERA',
            kategori: 'BADAN',
            wilayah: 'CIBINONG',
            status: 'Aktif',
            objek_list: [
                { id: 'A1', nama: 'PT. Maju Jaya Sejahtera', alamat: 'Perumahan Kebun Hijau Blok A1', luas: 150 },
            ]
        }
    ]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Database Wajib Retribusi</h1>
                    <p className="text-sm text-gray-500 font-medium font-sans">Kelola subjek retribusi terverifikasi dan tambahkan objek/aset baru.</p>
                </div>
            </div>

            {/* Toolbar: Search & Filter */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cari NPWRD atau Nama Pemilik..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 text-sm font-bold"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 outline-none">
                        <option>Semua Kategori</option>
                        <option>Pribadi</option>
                        <option>Badan Usaha</option>
                    </select>
                    <button className="bg-green-700 text-white p-3 rounded-2xl hover:bg-black transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Tabel List WR Terverifikasi */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Data Subjek (NPWRD)</th>
                                <th className="p-6">Kategori</th>
                                <th className="p-6 text-center">Jumlah Objek</th>
                                <th className="p-6">Wilayah</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {verifiedWR.map((wr) => (
                                <tr key={wr.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-100 rounded-2xl text-gray-400 group-hover:bg-green-100 group-hover:text-green-700 transition-all">
                                                {wr.kategori === 'PRIBADI' ? <User size={20} /> : <Building2 size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm uppercase tracking-tighter leading-none mb-1">{wr.nama}</p>
                                                <p className="font-mono text-xs text-green-700 font-bold">{wr.npwrd}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-gray-500 uppercase italic">
                                        {wr.kategori}
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-black text-xs">
                                            <Layers size={14} /> {wr.jml_objek} Aset
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {wr.wilayah}
                                    </td>
                                    <td className="p-6">
                                        <StatusBadge status={wr.status} />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            {/* TOMBOL UTAMA: Tambah Objek Baru ke NPWRD ini */}
                                            <button
                                                onClick={() => navigate('/upt/daftar-objek', { state: { linkedNpwrd: wr.npwrd, ownerName: wr.nama } })}
                                                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                                            >
                                                <PlusSquare size={14} /> Tambah Objek
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(wr)}
                                                className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0"><Layers size={24} /></div>
                <div>
                    <h4 className="font-black text-amber-800 text-sm uppercase tracking-widest mb-1">Struktur Multi-Objek</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-sans font-medium italic">
                        Setiap pendaftaran objek baru (Gedung, Ruko, atau Rumah) yang dilakukan melalui tombol di atas akan otomatis menautkan aset tersebut ke identitas NPWRD Induk yang dipilih. Hal ini memudahkan Wajib Retribusi untuk mengelola seluruh tagihan dalam satu akun portal SIRESIK.
                    </p>
                </div>
            </div>
            {/* MODAL DETAIL OBJEK */}
            {showModal && selectedWR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Header Modal */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-900/20">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter leading-none">Daftar Objek Terdaftar</h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest italic">{selectedWR.nama} | {selectedWR.npwrd}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Isi Modal */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 bg-gray-100/50">
                            {selectedWR.objek_list?.map((obj, index) => (
                                <div key={obj.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-green-500 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-green-50 group-hover:text-green-700">
                                            0{index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-800 uppercase text-sm leading-none mb-1">{obj.nama}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                                <MapPin size={12} /> {obj.alamat}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Luas Bangunan</p>
                                        <p className="text-sm font-black text-green-700">{obj.luas} m²</p>
                                    </div>
                                </div>
                            ))}

                            {(!selectedWR.objek_list || selectedWR.objek_list.length === 0) && (
                                <div className="py-12 text-center text-gray-400 italic">Belum ada objek terdaftar untuk NPWRD ini.</div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-8 border-t bg-white flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UptVerifiedList;