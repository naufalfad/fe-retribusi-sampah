import React, { useState } from 'react';
import { Search, Printer, SendHorizontal, Eye, FileText, Filter, Loader2, CheckCircle, ClipboardCheck } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import SkrdPreviewModal from './components/SkrdPreviewModal';
import RegistrationDetailModal from './components/RegistrationDetailModal';

const DlhSkrdMonitoring = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [showToast, setShowToast] = useState(false);

    // Data Dummy untuk simulasi dua kondisi
    const [wrList] = useState([
        {
            id: 1,
            tipe_wp: 'BADAN',
            no_formulir: '000001',
            npwrd: '4.1.2.01.02.000001', // Terbitan UPT
            // Data Objek Retribusi
            nama_badan: 'PT. MAJU JAYA SEJAHTERA',
            alamat_badan: {
                jalan: 'Jl. Raya Cibinong No. 12',
                rt_rw: '003/005',
                kelurahan: 'Cibinong',
                kecamatan: 'Cibinong',
                kota: 'Kabupaten Bogor',
                telp: '021-8790123',
                kode_pos: '16914'
            },
            // Data Pemilik/Pengelola
            pengelola: {
                nama: 'Bpk. Ahmad Subarjo',
                jabatan: 'Direktur Operasional',
                alamat: 'Jl. Pajajaran No. 45, Bogor Tengah',
                rt_rw: '001/001',
                kelurahan: 'Baranangsiang',
                kecamatan: 'Bogor Timur',
                kota: 'Kota Bogor',
                telp: '08123456789',
                kode_pos: '16143'
            },
            luas_bangunan: '400',
            jumlah_rt: '-', // Untuk kolektif
            status_skrd: 'Belum Terbit',
            masa: 'Januari 2026'
        },
        {
            id: 2,
            tipe_wp: 'PRIBADI',
            no_formulir: '000002',
            npwrd: '4.1.2.01.02.000045',
            nama_lengkap: 'H. Ridwan Kamil',
            kewarganegaraan: 'WNI',
            nik: '320101234567890',
            jenis_identitas: 'KTP',
            tipe_lokasi: 'Perumahan', // Perumahan / Non Perumahan
            alamat: {
                jalan: 'Komp. Pemda Blok C.12',
                rt_rw: '005/010',
                kelurahan: 'Tegar Beriman',
                kecamatan: 'Cibinong',
                kota: 'Kabupaten Bogor',
                telp: '08571234432',
                kode_pos: '16914'
            },
            luas_bangunan: '150',
            status_skrd: 'Belum Terbit',
            masa: 'Januari 2026'
        },
        {
            id: 3,
            nama: 'RESTORAN SUNDA JAYA',
            npwrd: '4.1.2.01.02.000045',
            alamat: 'Jl. Tegar Beriman No. 45, RT001/RW002, Pakansari',
            status_skrd: 'Aktif',
            skrd_no: '0012/SKRD/2026',
            masa: 'Januari 2026'
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

    const handleForwardToBendahara = (id) => {
        // 1. Set ID yang sedang diproses (untuk loading spinner di tombol)
        setProcessingId(id);

        // 2. Simulasi loading API selama 1.5 detik
        setTimeout(() => {
            setProcessingId(null);
            // 3. Munculkan Toast Notifikasi
            setShowToast(true);
            setShowDetailModal(false);
            // 4. Sembunyikan toast setelah 3 detik
            setTimeout(() => setShowToast(false), 3000);

            // Di sini nantinya fungsi integrasi API Anda (Update status di database)
            console.log(`Data ID ${id} berhasil diteruskan ke Bendahara`);
        }, 1500);
    };

    return (
        <div className="space-y-6 relative">
            {showToast && (
                <div className="fixed top-10 right-10 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700">
                        <div className="bg-green-500 p-1.5 rounded-full">
                            <CheckCircle size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Berhasil Diteruskan!</p>
                            <p className="text-[10px] text-gray-400">Data telah dikirim ke antrian Bendahara Penerimaan.</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">SKRD Wajib Retribusi</h1>
                    <p className="text-sm text-gray-500 font-medium">Monitoring status ketetapan dan pencetakan dokumen SKRD.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 p-3 rounded-2xl text-gray-600 hover:bg-gray-50">
                        <Printer size={20} />
                    </button>
                    <button className="bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20">
                        <Filter size={18} /> Filter Data
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Cari berdasarkan NPWRD atau Nama Wajib Retribusi..."
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-700 font-medium"
                />
            </div>

            {/* Tabel Monitoring */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Wajib Retribusi / NPWRD</th>
                                <th className="p-6">Masa Retribusi</th>
                                <th className="p-6">Nomor SKRD</th>
                                <th className="p-6">Status SKRD</th>
                                <th className="p-6 text-center">Aksi Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {wrList.map((wr) => (
                                <tr key={wr.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-gray-800 text-sm">{wr.nama}{wr.nama_badan}{wr.nama_lengkap}</p>
                                        <p className="text-[10px] text-green-700 font-mono font-bold tracking-tighter">{wr.npwrd}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-medium text-gray-600 uppercase">{wr.masa}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-xs font-bold ${wr.skrd_no === '-' ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {wr.skrd_no}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <StatusBadge status={wr.status_skrd === 'Aktif' ? 'Sudah Terbit' : 'Belum Terbit'} />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            {wr.status_skrd === 'Belum Terbit' ? (
                                                /* MODIFIKASI DISINI: Tambahkan tombol Lihat Detail sebelum Teruskan */
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenRegistrationDetail(wr)}
                                                        className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all"
                                                    >
                                                        <ClipboardCheck size={14} /> Detail UPT
                                                    </button>
                                                    <button
                                                        onClick={() => handleForwardToBendahara(wr.id)}
                                                        disabled={processingId === wr.id}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md 
                                                        ${processingId === wr.id ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black active:scale-95'}`}
                                                    >
                                                        {processingId === wr.id ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
                                                        Teruskan
                                                    </button>
                                                </div>
                                            ) : (
                                                /* JIKA SKRD SUDAH ADA: Lihat & Cetak */
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenPreview(wr)}
                                                        className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-100"
                                                    >
                                                        <Eye size={14} /> Lihat
                                                    </button>
                                                    <button className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-green-100">
                                                        <Printer size={14} /> Cetak
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

            {/* MODAL PREVIEW SKRD */}
            {showModal && <SkrdPreviewModal data={selectedData}
                onClose={() => setShowModal(false)} />}
            {showDetailModal && (
                <RegistrationDetailModal
                    data={selectedData}
                    onClose={() => setShowDetailModal(false)}
                    onForward={handleForwardToBendahara}
                    isProcessing={processingId === selectedData?.id}
                />
            )}
        </div>
    );
};

export default DlhSkrdMonitoring;