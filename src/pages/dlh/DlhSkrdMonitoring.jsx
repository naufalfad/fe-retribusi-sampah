import React, { useState } from 'react';
import { Search, Printer, Eye, Filter, ClipboardCheck, Home, Building2, MapPin } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import SkrdPreviewModal from './components/SkrdPreviewModal';
import RegistrationDetailModal from './components/RegistrationDetailModal';

const DlhSkrdMonitoring = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // Data Dummy yang diperbarui sesuai klasifikasi baru
    const [wrList] = useState([
        {
            id: 1,
            tipe_wp: 'BADAN',
            no_formulir: 'REG-2026-001',
            npwrd: '4.1.2.01.02.000001',
            npor: '01.02.000001',
            nama_badan: 'PT. MAJU JAYA SEJAHTERA',
            alamat_objek: {
                jalan: 'Jl. Raya Cibinong No. 12',
                rt_rw: '003/005',
                kelurahan: 'Cibinong',
                kecamatan: 'Cibinong',
                kabupaten: 'Kabupaten Bogor',
            },
            telepon: '021-8790123',
            kelas_retribusi_label: 'Non Rumah Tinggal Kelas 1',
            deskripsi_kelas: 'Pertokoan, Industri, Restoran, Hotel',
            // Inklusi otomatis untuk Badan Kelas 1
            inclusions: [
                { name: 'Pelayanan Sumber Sampah', price: 67000, unit: 'm³' },
                { name: 'Pengangkutan TPS/TPST', price: 60300, unit: 'm³' },
                { name: 'Pemrosesan Akhir (TPA)', price: 50250, unit: 'm³' },
            ],
            status_skrd: 'Belum Terbit',
            skrd_no: '-',
            masa: 'Januari 2026'
        },
        {
            id: 2,
            tipe_wp: 'PRIBADI',
            no_formulir: 'REG-2026-002',
            npwrd: '4.1.2.01.02.000045',
            nama_lengkap: 'H. Ridwan Kamil',
            nik: '320101234567890',
            alamat_objek: {
                jalan: 'Komp. Pemda Blok C.12',
                rt_rw: '005/010',
                kelurahan: 'Tegar Beriman',
                kecamatan: 'Cibinong',
                kabupaten: 'Kabupaten Bogor',
            },
            telepon: '08571234432',
            kelas_retribusi_label: 'Rumah Tinggal Kelas 2',
            deskripsi_kelas: 'Luas 60-350m² / Listrik 900-3.500 VA',
            tarif_flat: 9600,
            // Inklusi otomatis untuk Rumah Tinggal
            inclusions: [
                { name: 'Pelayanan Sampah TPS/TPST', price: 56950, unit: 'm³' }
            ],
            status_skrd: 'Belum Terbit',
            skrd_no: '-',
            masa: 'Januari 2026'
        },
        {
            id: 3,
            npor: 'NPOR-3201-0099',
            npwrd: '4.1.2.01.02.000099',
            nama_wp: 'RESTORAN SUNDA JAYA',
            tipe_wp: 'BADAN',
            nomor_skrd: 'SKRD/2025/12/099',
            masa_retribusi: 'Desember 2025',
            jatuh_tempo: '2026-01-10',
            total_tagihan: 837500,
            status_pembayaran: 'OVERDUE',
            tanggal_bayar: null,
            kelas_retribusi_label: 'Non Rumah Tinggal Kelas 2',
            alamat_objek: { jalan: 'Jl. Tegar Beriman No. 45', kecamatan: 'Cibinong' },
            volume: 5,
            inclusions: [
                { name: 'Pelayanan dari sumber sampah', price: 63650, unit: 'm³' },
                { name: 'Pelayanan pengangkutan dari TPS/TPST', price: 56950, unit: 'm³' },
                { name: 'Pelayanan Pemrosesan Akhir sampah', price: 46900, unit: 'm³' }
            ]
        },
    ]);

    const handleOpenPreview = (data) => {
        setSelectedData(data);
        setShowModal(true);
    };

    const handleOpenRegistrationDetail = (data) => {
        setSelectedData(data);
        setShowDetailModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Monitoring & Validasi SKRD</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Role: Otoritas DLH Pusat</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border-2 border-gray-100 p-3 rounded-2xl text-gray-600 hover:border-green-600 hover:text-green-600 transition-all shadow-sm">
                        <Printer size={20} />
                    </button>
                    <button className="bg-green-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-green-900/20 hover:bg-black transition-all">
                        <Filter size={18} /> Filter Klasifikasi
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex items-center px-6 focus-within:ring-2 focus-within:ring-green-600 transition-all">
                <Search className="text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari NPWRD, Nama Objek, atau Lokasi..."
                    className="w-full px-4 py-4 bg-transparent border-none outline-none font-bold text-gray-700 placeholder:text-gray-300"
                />
            </div>

            {/* Table Monitoring */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Wajib Retribusi / Objek</th>
                                <th className="p-8 text-center">Tipe / Kelas</th>
                                <th className="p-8">Status SKRD</th>
                                <th className="p-8 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {wrList.map((wr) => (
                                <tr key={wr.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${wr.tipe_wp === 'BADAN' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {wr.tipe_wp === 'BADAN' ? <Building2 size={20} /> : <Home size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-sm leading-tight uppercase tracking-tight">
                                                    {wr.nama_badan || wr.nama_lengkap}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                        {wr.npwrd}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase italic">
                                                        <MapPin size={10} /> {wr.alamat_objek?.kecamatan || 'Kecamatan -'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <p className="text-[11px] font-black text-gray-700 uppercase leading-none">{wr.kelas_retribusi_label}</p>
                                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase italic tracking-tighter">{wr.masa}</p>
                                    </td>
                                    <td className="p-8">
                                        <StatusBadge status={wr.status_skrd === 'Aktif' ? 'Sudah Terbit' : 'Belum Terbit'} />
                                        {wr.skrd_no !== '-' && (
                                            <p className="text-[9px] font-mono text-gray-400 mt-1">{wr.skrd_no}</p>
                                        )}
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-center gap-3">
                                            {wr.status_skrd === 'Belum Terbit' ? (
                                                <button
                                                    onClick={() => handleOpenRegistrationDetail(wr)}
                                                    className="flex items-center gap-2 bg-amber-500 hover:bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                                                >
                                                    <ClipboardCheck size={14} /> Tetapkan Tarif
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenPreview(wr)}
                                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Cetak SKRD"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Components */}
            {showModal && (
                <SkrdPreviewModal
                    data={selectedData}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showDetailModal && (
                <RegistrationDetailModal
                    data={selectedData}
                    onClose={() => setShowDetailModal(false)}
                    onForward={(id) => {
                        console.log("Menetapkan NPOR ID:", id);
                        setShowDetailModal(false);
                        // Tambahkan toast sukses disini jika perlu
                    }}
                />
            )}
        </div>
    );
};

export default DlhSkrdMonitoring;