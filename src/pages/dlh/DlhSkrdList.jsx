import React, { useState } from 'react';
import {
    Search, Printer, Eye, Filter, FileText,
    CreditCard, AlertCircle, CheckCircle2,
    ArrowUpRight, Download, Calendar,
    Pen
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import RegistrationDetailModal from './components/RegistrationDetailModal';
import SkrdDocumentModal from './components/SkrdPreviewModal';

const DlhSkrdList = () => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showSkrdModal, setShowSkrdModal] = useState(false);

    // Data Dummy SKRD yang sudah terbit
    const [skrdList] = useState([
        {
            id: 1,
            npor: 'NPOR-3201-0001',
            npwrd: '4.1.2.01.02.000123',
            nama_wp: 'PT. MAJU JAYA SEJAHTERA',
            tipe_wp: 'BADAN',
            nomor_skrd: 'SKRD/2026/01/001',
            masa_retribusi: 'Januari 2026',
            jatuh_tempo: '2026-02-10',
            total_tagihan: 532650,
            status_pembayaran: 'PAID',
            tanggal_bayar: '2026-01-25',
            kelas_retribusi_label: 'Non Rumah Tinggal Kelas 1',
            alamat_objek: { jalan: 'Jl. Raya Cibinong No. 12', kecamatan: 'Cibinong' },
            volume: 3,
            inclusions: [
                { name: 'Pelayanan dari sumber sampah', price: 67000, unit: 'm³' },
                { name: 'Pelayanan pengangkutan dari TPS/TPST', price: 60300, unit: 'm³' },
                { name: 'Pelayanan Pemrosesan Akhir sampah', price: 50250, unit: 'm³' }
            ]
        },
        {
            id: 2,
            npor: 'NPOR-3201-0045',
            npwrd: '4.1.2.01.02.000045',
            nama_wp: 'H. Ridwan Kamil',
            tipe_wp: 'PRIBADI',
            nomor_skrd: 'SKRD/2026/01/045',
            masa_retribusi: 'Januari 2026',
            jatuh_tempo: '2026-02-10',
            total_tagihan: 66550,
            status_pembayaran: 'UNPAID',
            tanggal_bayar: null,
            kelas_retribusi_label: 'Rumah Tinggal Kelas 2',
            tarif_flat: 9600,
            volume: 1,
            alamat_objek: { jalan: 'Komp. Pemda Blok C.12', kecamatan: 'Cibinong' },
            inclusions: [
                { name: 'Pelayanan Sampah TPS/TPST', price: 56950, unit: 'm³' }
            ]
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
        }
    ]);

    const handleReviewSkrd = (data) => {
        setSelectedData(data);
        setShowDetailModal(true);
    };

    const handleViewSkrdDocument = (data) => {
        setSelectedData(data);
        setShowSkrdModal(true);
    };

    // Helper untuk warna status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAID': return { label: 'Sudah Bayar', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={12} /> };
            case 'UNPAID': return { label: 'Belum Bayar', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={12} /> };
            case 'OVERDUE': return { label: 'Menunggak', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> };
            default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: null };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Manajemen Tagihan SKRD</h1>
                    <p className="text-sm text-gray-500 font-medium">Pantau status pembayaran dan piutang retribusi objek.</p>
                </div>
                <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-gray-900/20 hover:bg-black transition-all">
                    <Download size={18} /> Export Laporan Realiasi
                </button>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Realisasi (Lunas)</p>
                    <h3 className="text-2xl font-black text-green-600">Rp 45.200.000</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Piutang Berjalan (Belum Bayar)</p>
                    <h3 className="text-2xl font-black text-amber-500">Rp 12.850.000</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tunggakan (Overdue)</p>
                    <h3 className="text-2xl font-black text-red-600">Rp 5.400.000</h3>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 px-6">
                <div className="flex items-center gap-2 flex-1 w-full">
                    <Search className="text-gray-400" size={20} />
                    <input type="text" placeholder="Cari NPOR / NPWRD / Nama WP..." className="w-full py-3 bg-transparent outline-none font-bold text-gray-700" />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
                    {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${filterStatus === status ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabel SKRD */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="p-8">NPOR & Wajib Retribusi</th>
                                <th className="p-8">Nomor SKRD / Masa</th>
                                <th className="p-8">Total Tagihan</th>
                                <th className="p-8">Jatuh Tempo</th>
                                <th className="p-8">Status</th>
                                <th className="p-8 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {skrdList.map((skrd) => {
                                const status = getStatusInfo(skrd.status_pembayaran);
                                return (
                                    <tr key={skrd.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400">
                                                    {skrd.tipe_wp === 'BADAN' ? <Building2 size={18} /> : <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-mono font-black text-green-700 mb-0.5">{skrd.npor}</p>
                                                    <p className="text-sm font-black text-gray-800 uppercase leading-none">{skrd.nama_wp}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-xs font-bold text-gray-700 leading-none">{skrd.nomor_skrd}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase italic">{skrd.masa_retribusi}</p>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-sm font-black text-gray-800">Rp {skrd.total_tagihan.toLocaleString()}</p>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={14} />
                                                <p className="text-xs font-bold">{skrd.jatuh_tempo}</p>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${status.color}`}>
                                                {status.icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleReviewSkrd(skrd)}
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all"
                                                    title="Review SKRD"
                                                >
                                                    <Pen size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleViewSkrdDocument(skrd)}
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Lihat Dokumen SKRD Resmi"
                                                >
                                                    <FileText size={18} />
                                                </button>

                                                <button
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Cetak Salinan"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Review (Menggunakan Modal Detail NPOR yang sama) */}
            {showDetailModal && (
                <RegistrationDetailModal
                    data={selectedData}
                    onClose={() => setShowDetailModal(false)}
                    // Di halaman ini, tombol penetapan mungkin dihilangkan atau diganti 'Cetak'
                    onForward={() => window.print()}
                />
            )}
            {showSkrdModal && (
                <SkrdDocumentModal
                    data={selectedData}
                    onClose={() => setShowSkrdModal(false)}
                />
            )}
        </div>
    );
};

// Mock components to avoid undefined errors
const Building2 = ({ size }) => <div style={{ width: size, height: size }}>🏢</div>;
const User = ({ size }) => <div style={{ width: size, height: size }}>👤</div>;

export default DlhSkrdList;