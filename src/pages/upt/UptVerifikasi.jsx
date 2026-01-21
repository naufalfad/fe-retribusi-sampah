import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, FileText, Download, UserPlus, Building2, User, MapPin, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';

const UptVerifikasi = () => {
    const navigate = useNavigate();
    const [selectedData, setSelectedData] = useState(null);
    const [npwrdInput, setNpwrdInput] = useState('');

    // Dummy Data yang diperluas agar sesuai dengan format formulir pendaftaran
    const registrations = [
        {
            id: 1,
            tgl: '2026-01-08',
            jenis: 'BADAN',
            nama_badan: 'PT. Maju Jaya Terus',
            nama_pengelola: 'Bpk. Heru Subarkah',
            jabatan_pengelola: 'Direktur Utama',
            alamat_pengelola: 'Jl. Melati No. 5, RT 01/02, Kel. Pakansari, Kec. Cibinong',
            // Data Lokasi Retribusi
            tipe_lokasi: 'Non Perumahan',
            jalan: 'Jl. Raya Cibinong No. 12',
            rt_rw: '05/10',
            kelurahan: 'Cibinong',
            kecamatan: 'Cibinong',
            kabupaten: 'Kabupaten Bogor',
            kodepos: '16911',
            telepon: '081233445566',
            luas_bangunan: '500',
            status: 'Proses Verifikasi'
        },
        {
            id: 2,
            tgl: '2026-01-09',
            jenis: 'PRIBADI',
            nama_lengkap: 'Sutisna',
            nik: '3201010101010005',
            // Data Lokasi Retribusi
            tipe_lokasi: 'Perumahan',
            jalan: 'Perumahan Kebun Hijau Blok A1',
            rt_rw: '02/05',
            kelurahan: 'Sukahati',
            kecamatan: 'Cibinong',
            kabupaten: 'Kabupaten Bogor',
            kodepos: '16913',
            telepon: '085777888999',
            luas_bangunan: '120',
            status: 'Proses Verifikasi'
        },
    ];

    // Helper untuk menampilkan label & nilai agar rapi
    const DataField = ({ label, value }) => (
        <div className="py-2 border-b border-gray-50 last:border-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value || '-'}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header section tetap sama */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Verifikasi NPWRD</h1>
                    <p className="text-sm text-gray-500 font-medium">Periksa berkas pendaftaran mandiri dan tetapkan NPWRD.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Cari pemohon..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-700 w-64 text-sm" />
                    </div>
                    <button onClick={() => navigate('/upt/daftar-user')} className="flex items-center gap-2 bg-green-700 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all text-sm">
                        <UserPlus size={18} /> Daftar Baru
                    </button>
                </div>
            </div>

            {/* Tabel List Pendaftaran */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Tgl Masuk</th>
                            <th className="p-6">Nama Pemohon / Badan</th>
                            <th className="p-6">Kategori</th>
                            <th className="p-6">Lokasi Retribusi</th>
                            <th className="p-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {registrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 text-sm font-bold text-gray-500">{reg.tgl}</td>
                                <td className="p-6">
                                    <p className="font-black text-gray-800 text-sm uppercase">{reg.jenis === 'BADAN' ? reg.nama_badan : reg.nama_lengkap}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{reg.telepon}</p>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${reg.jenis === 'BADAN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {reg.jenis}
                                    </span>
                                </td>
                                <td className="p-6 text-xs font-bold text-gray-500 truncate max-w-xs">{reg.jalan}, {reg.kelurahan}</td>
                                <td className="p-6">
                                    <button onClick={() => setSelectedData(reg)} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all mx-auto">
                                        <Eye size={14} /> Periksa Berkas
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL VERIFIKASI (FORMAT DISESUAIKAN DENGAN FORM PENDAFTARAN) */}
            {selectedData && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-300">

                        {/* Header Modal - Mirip Form Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-700 p-3 rounded-2xl text-white">
                                    {selectedData.jenis === 'BADAN' ? <Building2 size={24} /> : <User size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Detail Pendaftaran {selectedData.jenis}</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">ID Registrasi: #REG-{selectedData.id}00{selectedData.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedData(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-10 bg-white">
                            {/* SECTION 1: IDENTITAS (SESUAI FORM PENDAFTARAN) */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black italic">1</span>
                                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Identitas {selectedData.jenis === 'PRIBADI' ? 'Pemohon' : 'Badan & Pengelola'}</h3>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {selectedData.jenis === 'PRIBADI' ? (
                                        <>
                                            <DataField label="Nama Lengkap" value={selectedData.nama_lengkap} />
                                            <DataField label="NIK / Nomor Identitas" value={selectedData.nik} />
                                        </>
                                    ) : (
                                        <>
                                            <div className="md:col-span-2 mb-2">
                                                <DataField label="Nama Badan / Merek Usaha" value={selectedData.nama_badan} />
                                            </div>
                                            <DataField label="Nama Pengelola" value={selectedData.nama_pengelola} />
                                            <DataField label="Jabatan" value={selectedData.jabatan_pengelola} />
                                            <div className="md:col-span-2">
                                                <DataField label="Alamat Domisili Pengelola" value={selectedData.alamat_pengelola} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* SECTION 2: ALAMAT LOKASI RETRIBUSI */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black italic">2</span>
                                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Alamat Lokasi Retribusi</h3>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border border-gray-100">
                                    <div className="md:col-span-2">
                                        <DataField label="Tipe Lokasi" value={selectedData.tipe_lokasi} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <DataField label="Jalan / Perumahan / No. Rumah" value={selectedData.jalan} />
                                    </div>
                                    <DataField label="RT / RW" value={selectedData.rt_rw} />
                                    <DataField label="Kelurahan / Desa" value={selectedData.kelurahan} />
                                    <DataField label="Kecamatan" value={selectedData.kecamatan} />
                                    <DataField label="Kabupaten" value={selectedData.kabupaten} />
                                    <DataField label="Kode Pos" value={selectedData.kodepos} />
                                    <DataField label="Nomor Telepon / WA" value={selectedData.telepon} />
                                </div>
                            </section>

                            {/* SECTION 3: INFORMASI TEKNIS */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black italic">3</span>
                                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Informasi Teknis Bangunan</h3>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6">
                                    <div className="bg-amber-100 p-4 rounded-2xl text-amber-700">
                                        <Ruler size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Luas Bangunan Efektif</p>
                                        <p className="text-3xl font-black text-gray-800">{selectedData.luas_bangunan} <span className="text-sm font-bold text-gray-400">m²</span></p>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 4: BERKAS & NPWRD */}
                            <section className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-blue-900 uppercase">Lampiran_Dokumen_Pendaftaran.pdf</p>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Scan KTP & Domisili Terlampir</p>
                                        </div>
                                    </div>
                                    <button className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-xs font-black border border-blue-200 shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                                        <Download size={14} /> Lihat Berkas
                                    </button>
                                </div>

                                {/* INPUT NPWRD - TUGAS UTAMA UPT */}
                                <div className="bg-green-900 p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/30">
                                    <div className="flex items-center gap-2 mb-4 text-green-400">
                                        <CheckCircle size={18} />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Otoritas Penetapan NPWRD</h4>
                                    </div>
                                    <label className="block text-xl font-black text-white mb-4">
                                        Masukkan NPWRD Baru
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="X.XX.XX.XXXXXX"
                                        value={npwrdInput}
                                        onChange={(e) => setNpwrdInput(e.target.value)}
                                        className="w-full p-5 bg-white/10 border-2 border-green-500/30 rounded-2xl outline-none focus:border-green-400 text-2xl font-mono tracking-[0.3em] text-white placeholder:text-white/20"
                                    />
                                    <p className="text-[10px] text-green-400/70 mt-4 italic font-medium">
                                        * Pastikan format NPWRD sudah sesuai dengan pengkodean wilayah UPT setempat.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Tombol Aksi Modal */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setSelectedData(null)}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 font-black py-4 rounded-2xl hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                            >
                                <XCircle size={18} /> Tolak Berkas
                            </button>
                            <button
                                className="flex-[2] flex items-center justify-center gap-2 bg-green-700 text-white font-black py-4 rounded-2xl hover:bg-black shadow-xl shadow-green-900/20 transition-all text-sm uppercase tracking-widest"
                            >
                                <CheckCircle size={18} /> Validasi & Terbitkan NPWRD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UptVerifikasi;