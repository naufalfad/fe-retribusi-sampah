import React, { useState } from 'react';
import {
    FileText, Download, Eye, AlertCircle,
    Calendar, CreditCard, X, Printer, CheckCircle,
    ChevronDown, Building2, MapPin
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { useLocation, useNavigate } from 'react-router-dom';

const SkrdList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [myAssets] = useState([
        {
            npwrd: '4.1.2.01.02.000001',
            npor: '2.3.4.01.02.000013',
            nama: 'PT. MAJU JAYA SEJAHTERA',
            alamat: 'Jl. Raya Cibinong No. 12, Pakansari',
            kategori: 'BADAN'
        },
        {
            npwrd: '4.1.2.01.02.000088',
            npor: '2.3.4.01.02.000012',
            nama: 'RUKO TOKO KUE LEZAT',
            alamat: 'Jl. Raya Pemda No. 45, Cibinong',
            kategori: 'BADAN'
        }
    ]);

    // 1. State untuk Modal Preview
    const [activeAsset, setActiveAsset] = useState(myAssets[0]);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedSkrd, setSelectedSkrd] = useState(null);

    // Data Dummy (Disimulasikan data profil user juga ada di sini)
    const [userProfile] = useState({
        nama: 'PT. MAJU JAYA SEJAHTERA',
        npwrd: '4.1.2.01.02.000001',
        alamat: 'Jl. Raya Cibinong No. 12, Pakansari, Cibinong'
    });

    const [allBills] = useState([
        {
            id: 1,
            npwrd_ref: '4.1.2.01.02.000001',
            no_skrd: '00045/SKRD/DLH/2026',
            masa: 'JANUARI', tahun: '2026',
            jatuh_tempo: '20 JANUARI 2026',
            jumlah: 500000, denda: 0, total: 500000,
            terbilang: 'Lima Ratus Ribu Rupiah',
            status: 'Belum Bayar'
        },
        {
            id: 2,
            npwrd_ref: '4.1.2.01.02.000088',
            no_skrd: '00088/SKRD/DLH/2026',
            masa: 'JANUARI', tahun: '2026',
            jatuh_tempo: '20 JANUARI 2026',
            jumlah: 150000, denda: 0, total: 150000,
            terbilang: 'Seratus Lima Puluh Ribu Rupiah',
            status: 'Belum Bayar'
        }
    ]);

    const filteredBills = allBills.filter(bill => bill.npwrd_ref === activeAsset.npwrd);

    const handlePreview = (bill) => {
        setSelectedSkrd(bill);
        setShowPreview(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ASSET SWITCHER: Navigasi antar NPWRD */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-8 border-l-green-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Sedang Melihat Tagihan:</p>
                        <h2 className="text-xl font-black text-gray-800 tracking-tighter uppercase">{activeAsset.nama}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span className="font-mono text-green-700 font-bold">{activeAsset.npwrd}</span>
                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {activeAsset.alamat}</span>
                        </div>
                    </div>
                </div>

                {/* Dropdown Ganti Aset */}
                <div className="relative group w-full md:w-auto">
                    <select
                        value={activeAsset.npwrd}
                        onChange={(e) => setActiveAsset(myAssets.find(a => a.npwrd === e.target.value))}
                        className="appearance-none bg-gray-900 text-white pl-6 pr-12 py-3 rounded-2xl font-bold text-xs cursor-pointer hover:bg-black transition-all w-full"
                    >
                        {myAssets.map(asset => (
                            <option key={asset.npwrd} value={asset.npwrd}>Ganti Aset: {asset.nama}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={16} />
                </div>
            </div>

            {/* Statistik Ringkas (Dinamis sesuai filteredBills) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tagihan Aktif Aset Ini</p>
                    <p className="text-2xl font-black text-red-600 mt-1">{filteredBills.filter(b => b.status === 'Belum Bayar').length} Dokumen</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Belum Terbayar</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">
                        Rp {filteredBills.filter(b => b.status === 'Belum Bayar').reduce((acc, curr) => acc + curr.total, 0).toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-900/20 text-white">
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Masa Pajak Aktif</p>
                    <p className="text-xl font-black mt-1 italic uppercase">JANUARI 2026</p>
                </div>
            </div>

            {/* Tabel Tagihan */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 italic">
                        <FileText size={18} className="text-green-700" /> Daftar Dokumen SKRD Resmi
                    </h3>
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl">
                        <AlertCircle className="text-orange-500" size={16} />
                        <span className="text-[10px] font-black text-orange-700 uppercase tracking-tighter">Jatuh tempo setiap tanggal 20</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Nomor SKRD / Masa</th>
                                <th className="p-6">Jatuh Tempo</th>
                                <th className="p-6">Total Tagihan</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-center">Operasional</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBills.length > 0 ? filteredBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm group-hover:text-green-700 transition-colors">{bill.no_skrd}</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Masa {bill.masa} {bill.tahun}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs font-bold text-gray-500 uppercase">{bill.jatuh_tempo}</td>
                                    <td className="p-6 font-black text-gray-800 text-sm">Rp {bill.total.toLocaleString('id-ID')}</td>
                                    <td className="p-6"><StatusBadge status={bill.status} /></td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handlePreview(bill)} className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={18} /></button>
                                            {bill.status === 'Belum Bayar' && (
                                                <button onClick={() => navigate('/ssrd')} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md">Bayar Sekarang</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-gray-400 italic text-sm">Belum ada tagihan untuk aset ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PREVIEW SKRD (FORMAT RESMI) */}
            {showPreview && selectedSkrd && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">

                        {/* Header Modal UI */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center z-10 px-8">
                            <div className="flex items-center gap-2 text-green-700">
                                <FileText size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Detail Ketetapan SKRD</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowPreview(false)} className="text-gray-400 font-bold text-[11px] px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">Tutup</button>
                                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-black text-[11px] flex items-center gap-2 shadow-lg"><Printer size={14} /> Cetak SKRD</button>
                            </div>
                        </div>

                        {/* AREA DOKUMEN SKRD (FORMAT LAMPIRAN III PDF) */}
                        <div className="overflow-y-auto p-6 bg-gray-100 flex justify-center">
                            <div className="bg-white w-full border-[1px] border-black text-black font-serif text-[10px] leading-tight p-8 shadow-sm">

                                {/* Header / Kop */}
                                <div className="flex border-2 border-black">
                                    <div className="w-1/2 flex gap-3 items-center border-r-2 border-black p-3 text-center">
                                        <div className="w-10 h-14 border-2 border-black flex items-center justify-center text-[6px] font-bold uppercase shrink-0 italic">LOGO DLH</div>
                                        <div className="text-left font-serif">
                                            <h4 className="font-bold text-[9px] uppercase leading-tight">Dinas Lingkungan Hidup</h4>
                                            <h4 className="font-bold text-[9px] uppercase leading-tight">Kabupaten Bogor</h4>
                                            <p className="text-[6px] mt-1 italic">Jl. Tegar Beriman (021) 29615851 Cibinong 16914</p>
                                        </div>
                                    </div>
                                    <div className="w-1/2 flex flex-col font-serif">
                                        <div className="flex-1 flex items-center justify-center border-b-2 border-black font-black text-[9px] uppercase p-1 text-center italic">
                                            Surat Ketetapan Retribusi Daerah (SKRD)
                                        </div>
                                        <div className="flex text-[8px]">
                                            <div className="flex-1 p-2 border-r-2 border-black uppercase">
                                                MASA : <strong>{selectedSkrd.masa}</strong><br />
                                                TAHUN : <strong>{selectedSkrd.tahun}</strong>
                                            </div>
                                            <div className="flex-1 p-2 text-center uppercase font-bold">
                                                NO. SKRD<br />
                                                <span className="text-[10px] font-mono tracking-tighter">{selectedSkrd.no_skrd}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Data Wajib Retribusi */}
                                <div className="py-4 space-y-1 border-x-2 border-black px-4 font-serif">
                                    <div className="flex"><span className="w-24 font-bold uppercase">NAMA</span> <span>: {activeAsset.nama}</span></div>
                                    <div className="flex"><span className="w-24 font-bold uppercase">ALAMAT</span> <span className="flex-1">: {activeAsset.alamat}</span></div>
                                    <div className="flex mt-1"><span className="w-24 font-bold uppercase">NPWRD</span> <span className="font-mono font-bold tracking-widest">: {activeAsset.npwrd}</span></div>
                                    <div className="flex mt-1"><span className="w-24 font-bold uppercase">NPOR</span> <span className="font-mono font-bold tracking-widest">: {activeAsset.npor}</span></div>
                                    <div className="flex"><span className="w-24 font-bold uppercase">JATUH TEMPO</span> <span className="font-bold">: {selectedSkrd.jatuh_tempo}</span></div>
                                </div>

                                {/* Tabel Rincian */}
                                <table className="w-full border-collapse border-2 border-black font-serif">
                                    <thead className="bg-gray-50 uppercase text-[8px] font-bold">
                                        <tr className="border-b-2 border-black">
                                            <th className="border-r-2 border-black p-1 w-24 text-center">Kode Rekening</th>
                                            <th className="border-r-2 border-black p-1 text-center">Uraian Retribusi Pelayanan Persampahan/Kebersihan</th>
                                            <th className="p-1 text-center">Jumlah (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-r-2 border-black p-4 text-center font-bold">4.1.2.01.02</td>
                                            <td className="border-r-2 border-black p-4 italic h-20 align-top">
                                                Pelayanan Pengangkutan/Pembuangan Sampah Retribusi Daerah
                                            </td>
                                            <td className="p-4 text-right font-bold align-top">{selectedSkrd.jumlah.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-t-2 border-black font-bold text-[9px]">
                                            <td colSpan="2" className="border-r-2 border-black p-2 text-right uppercase italic">Jumlah Ketetapan Pokok Retribusi:</td>
                                            <td className="p-2 text-right">{selectedSkrd.jumlah.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-t border-black text-[8px]">
                                            <td colSpan="2" className="border-r-2 border-black p-1 text-right italic">Sanksi Administrasi (Denda):</td>
                                            <td className="p-1 text-right">{selectedSkrd.denda.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-t-2 border-black bg-gray-50 font-black text-[11px] italic">
                                            <td colSpan="2" className="border-r-2 border-black p-2 text-right uppercase">Jumlah Keseluruhan Retribusi:</td>
                                            <td className="p-2 text-right">Rp. {selectedSkrd.total.toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Terbilang */}
                                <div className="mt-3 italic font-bold border-2 border-black p-2 text-[9px] uppercase bg-gray-50 font-serif">
                                    Terbilang : # {selectedSkrd.terbilang} #
                                </div>

                                {/* Footer / TTD */}
                                <div className="flex mt-6 border-x-2 border-b-2 border-black p-4 font-serif">
                                    <div className="w-1/2 text-[7px] space-y-1">
                                        <p className="font-black italic underline uppercase mb-1">Perhatian:</p>
                                        <p>1. Pembayaran dilakukan secara non-tunai melalui kanal resmi.</p>
                                        <p>2. SKRD yang sah adalah yang tertanda tangan digital oleh Dinas.</p>
                                    </div>
                                    <div className="w-1/2 text-center flex flex-col items-center">
                                        <p className="text-[8px]">Cibinong, {new Date().toLocaleDateString('id-ID')}</p>
                                        <p className="font-bold uppercase text-[8px] mt-1">Kepala Dinas Lingkungan Hidup</p>
                                        <div className="h-12 w-28 border-b border-black flex items-center justify-center text-[6px] italic text-gray-400">Digital Signature Official</div>
                                        <p className="font-bold mt-2 uppercase text-[9px]">IWAN SETIAWAN</p>
                                        <p className="text-[8px]">NIP. 197801021990021001</p>
                                    </div>
                                </div>

                                {/* Tanda Terima (Guntingan) */}
                                <div className="mt-6 border-2 border-dashed border-gray-400 p-4 text-[8px] rounded-lg">
                                    <p className="text-center italic mb-2 font-bold opacity-50">--- Potong Di Sini (Tanda Terima Untuk Wajib Retribusi) ---</p>
                                    <div className="grid grid-cols-2">
                                        <div className="space-y-0.5">
                                            <div className="flex"><span className="w-16 font-bold uppercase">NPWRD</span> <span>: {userProfile.npwrd}</span></div>
                                            <div className="flex"><span className="w-16 font-bold uppercase">NAMA</span> <span>: {userProfile.nama}</span></div>
                                            <div className="flex"><span className="w-16 font-bold uppercase">NO SKRD</span> <span>: {selectedSkrd.no_skrd}</span></div>
                                        </div>
                                        <div className="text-center border-l-2 border-black pl-4">
                                            <p className="font-bold italic">Tanda Terima Berhasil</p>
                                            <div className="h-8 w-24 mx-auto border-b border-black mt-2"></div>
                                            <p className="text-[6px] mt-1 font-bold italic uppercase">Nama Penerima</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkrdList;