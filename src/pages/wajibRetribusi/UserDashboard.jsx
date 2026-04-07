import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Building2, Home, MapPin, Search, FileText,
    AlertCircle, Printer, X, Download, ShieldCheck
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';

const UserDashboard = () => {
    const navigate = useNavigate();

    // State untuk Modal Kartu
    const [user, setUser] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    assets.map((asset) => ({
        id: asset.id_objek,
        npor: asset.npor_objek,
        nama: asset.nama_objek,
        alamat: asset.alamat_objek,
        kategori: asset.kategori_objek,
        status: asset.status_objek
    }))

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/objek/objek-saya');

                setAssets(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('subjek'));

        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* HEADER: Welcome User */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sm text-green-700 font-bold mb-1 uppercase tracking-widest">Selamat Datang di REKAS,</p>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">{user?.nama_subjek || 'User'}</h2>
                    <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-sans">
                        <span className="font-medium uppercase">NPWRD: {user?.npwrd_subjek || 'User'}</span>
                        <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                        <span className="font-medium">Member sejak 2026</span>
                    </div>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest">
                    Profil Akun
                </button>
                <div className="absolute right-0 top-0 p-10 opacity-5 pointer-events-none text-green-900">
                    <ShieldCheck size={150} />
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="space-y-6 font-sans">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                        <Building2 className="text-green-700" size={24} /> Daftar Aset Objek
                    </h3>
                    {assets.length > 0 && (
                        <button onClick={() => navigate('/daftar')} className="flex items-center gap-2 text-green-700 font-bold hover:underline text-sm uppercase tracking-tighter">
                            <Plus size={18} /> Tambah Objek Baru
                        </button>
                    )}
                </div>

                {assets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map((asset) => (
                            <div key={asset.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 overflow-hidden flex flex-col">
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${asset.kategori === 'PRIBADI' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {asset.kategori === 'PRIBADI' ? <Home size={24} /> : <Building2 size={24} />}
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            {asset.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 leading-none">NPWRD ID</p>
                                    <h4 className="text-lg font-mono font-bold text-green-800 mb-4">{asset.npor_objek}</h4>
                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-sm font-black text-gray-800 leading-tight uppercase">{asset.nama_objek}</p>
                                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                                                <MapPin size={14} className="shrink-0" />
                                                <p className="text-xs truncate font-medium">{asset.alamat_objek}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Aksi Card diubah menjadi Cetak */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                    <button onClick={() => navigate('/skrd')} className="flex-1 bg-white hover:bg-green-700 hover:text-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm uppercase tracking-tighter">
                                        <FileText size={14} /> Tagihan
                                    </button>
                                    {/* GANTI ARROW MENJADI PRINTER */}
                                    {/* <button
                                        onClick={() => handleOpenCard(asset)}
                                        className="p-3 bg-gray-800 text-white rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center shadow-lg active:scale-95 group-hover:rotate-6"
                                        title="Cetak Kartu NPWRD"
                                    >
                                        <Printer size={18} />
                                    </button> */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-200 p-12 md:p-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-6"><Building2 size={48} /></div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Belum Ada Aset Terdaftar</h3>
                        <p className="text-gray-500 max-w-sm mt-2 text-sm leading-relaxed font-medium italic font-sans">Anda belum memiliki nomor NPOR/Objek. Silakan ajukan pendaftaran untuk rumah atau ruko Anda.</p>
                        <div className="mt-10 flex flex-col md:flex-row gap-4">
                            <button onClick={() => navigate('/daftar')} className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 transition-all transform hover:scale-105 uppercase text-xs tracking-widest"><Plus size={20} /> Daftarkan NPOR Baru</button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL KARTU NPWRD */}
            {showCard && selectedAsset && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 px-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-green-700" size={24} />
                                <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest">Preview Kartu NPWRD Resmi</h3>
                            </div>
                            <button onClick={() => setShowCard(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>

                        {/* AREA KARTU */}
                        <div className="p-10 bg-gray-100 flex justify-center overflow-x-auto">
                            {/* KREASI KARTU NPWRD MODERN (Berdasarkan Lampiran II) */}
                            <div id="npwrd-card" className="w-[105.6mm] h-[73.98mm] bg-white rounded-xl shadow-2xl border border-gray-200 relative overflow-hidden text-black font-sans shrink-0">
                                {/* Header Kartu */}
                                <div className="bg-green-800 p-2 text-white flex items-center gap-2 border-b-2 border-yellow-500">
                                    <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center text-[5px] font-bold uppercase text-black text-center leading-none px-0.5 italic">LOGO DLH</div>
                                    <div className="flex-1">
                                        <p className="text-[6px] font-bold uppercase leading-none">Pemerintah Kabupaten Bogor</p>
                                        <p className="text-[8px] font-black uppercase leading-tight tracking-tighter">Dinas Lingkungan Hidup</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[5px] font-bold opacity-80 uppercase leading-none italic">Kartu NPWRD</p>
                                    </div>
                                </div>

                                {/* Body Kartu */}
                                <div className="p-3">
                                    <p className="text-[6px] font-bold text-green-800 uppercase tracking-widest text-center mb-2 border-b border-gray-100 pb-1 italic">Retribusi Pelayanan Persampahan/Kebersihan</p>

                                    <div className="grid grid-cols-[50px_5px_1fr] gap-x-1 gap-y-1.5 text-[7px] items-start">
                                        <span className="font-bold opacity-60">NO. REGISTRASI</span> <span>:</span> <span className="font-black italic uppercase">{selectedAsset.no_registrasi}</span>
                                        <span className="font-bold opacity-60">NAMA</span> <span>:</span> <span className="font-black uppercase truncate">{selectedAsset.nama_objek}</span>
                                        <span className="font-bold opacity-60 uppercase leading-tight">ALAMAT</span> <span>:</span> <span className="font-bold text-[6.5px] leading-tight uppercase h-[18px] overflow-hidden">{selectedAsset.alamat}</span>
                                        <span className="font-bold opacity-60">KATEGORI</span> <span>:</span> <span className="font-black text-green-700 italic uppercase">{selectedAsset.kategori}</span>
                                    </div>

                                    {/* NPWRD UTAMA */}
                                    <div className="mt-2 bg-gray-50 border border-gray-200 p-1.5 rounded flex justify-between items-center px-3">
                                        <div className="flex flex-col">
                                            <span className="text-[5px] font-bold text-gray-400 tracking-[0.2em] uppercase leading-none mb-0.5">NPWRD</span>
                                            <span className="text-[10px] font-mono font-black text-slate-800 tracking-widest">{selectedAsset.npwrd}</span>
                                        </div>
                                        <div className="w-8 h-8 bg-white border border-gray-200 flex items-center justify-center font-bold text-[4px] opacity-40 uppercase italic text-center">QR<br />Code</div>
                                    </div>
                                </div>

                                {/* Footer Kartu (Signature) */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 pt-0 flex justify-between items-end bg-gradient-to-t from-gray-50 to-transparent">
                                    <div className="text-[5px] font-medium opacity-50 italic uppercase leading-none mb-1">REKAS DIGITAL CARD v.2</div>
                                    <div className="text-center font-sans">
                                        <p className="text-[4.5px] font-bold leading-none mb-0.5 uppercase italic opacity-40 italic underline decoration-dotted">Tertanda Digital Oleh:</p>
                                        <p className="text-[5px] font-black uppercase leading-none">IWAN SETIAWAN</p>
                                        <p className="text-[4px] font-bold opacity-60 leading-none">Plt. Bupati Bogor</p>
                                    </div>
                                </div>

                                {/* Watermark Background */}
                                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-950 opacity-[0.03]" size={80} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t bg-white flex flex-col md:flex-row gap-4 items-center justify-between px-10">
                            <div className="text-xs font-medium text-gray-400 italic font-sans uppercase tracking-tighter">
                                * Kartu ini dapat digunakan sebagai identitas resmi retribusi pelayanan kebersihan di Kabupaten Bogor.
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-3 border border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-xs uppercase tracking-widest text-gray-500">
                                    <Download size={16} /> Simpan PDF
                                </button>
                                <button className="flex-1 md:flex-none px-10 py-3 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-green-700 transition-all text-xs uppercase tracking-[0.2em]">
                                    <Printer size={16} /> Cetak Kartu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INFO FOOTER TETAP SAMA */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-bold uppercase italic tracking-tighter">Butuh Bantuan Pendaftaran?</h4>
                        <p className="text-sm opacity-80 max-w-md leading-relaxed font-sans">
                            Jika Anda kesulitan mendaftar mandiri, silakan kunjungi kantor UPT wilayah terdekat dengan membawa KTP dan berkas domisili.
                        </p>
                    </div>
                    <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-colors shadow-lg uppercase tracking-tighter italic">
                        Hubungi Customer Service
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                    <Building2 size={200} />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;