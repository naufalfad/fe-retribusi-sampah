import React, { useState } from 'react';
import {
    Save, Upload, Building2, BadgeCheck,
    FileText, Globe, MapPin, Loader2,
    CheckCircle2, RefreshCcw, Landmark, Eye
} from 'lucide-react';
import SkrdPreviewModal from '../dlh/components/SkrdPreviewModal';
import SsrdPreviewModal from '../dlh/components/SsrdPreviewModal';

const AdminSettings = () => {
    // --- STATES ---
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [logoPreview, setLogoPreview] = useState('/logo-kab-bogor.png');
    const [showSkrd, setShowSkrd] = useState(false);
    const [showSsrd, setShowSsrd] = useState(false);

    // State untuk form (Simulasi data dari Database)
    const [formData, setFormData] = useState({
        pemda: "PEMERINTAH KABUPATEN BOGOR",
        dinas: "DINAS LINGKUNGAN HIDUP",
        alamat: "Jl. Tegar Beriman (021) 29615851, Cibinong 16914",
        website: "dlh.bogorkab.go.id",
        pejabat_nama: "IWAN SETIAWAN",
        pejabat_nip: "197801021990021001",
        pejabat_jabatan: "Plt. BUPATI BOGOR",
        prefix_skrd: "/SKRD/DLH/",
        prefix_ssrd: "/SSRD/"
    });

    const dummyData = {
        nama: "CONTOH NAMA WAJIB RETRIBUSI",
        npwrd: "4.1.2.01.02.XXXXXX",
        alamat: "ALAMAT CONTOH OBJEK RETRIBUSI",
        skrd_no: "0001" + formData.prefix_skrd + "2026",
        id: "0001" + formData.prefix_ssrd + "2026", // Untuk SSRD
        masa: "JANUARI",
        tahun: "2026",
        jatuh_tempo: "20 JANUARI 2026",
        jumlah: 500000,
        denda: 0,
        total: 500000,
        terbilang: "Lima Ratus Ribu Rupiah",
        tgl_bayar: "12/01/2026"
    };

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulasi hit API
        setTimeout(() => {
            setIsSaving(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 2000);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in duration-500 font-sans">

            {/* --- NOTIFIKASI SUKSES --- */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-gray-950 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-gray-800">
                        <div className="bg-green-500 p-1.5 rounded-full">
                            <CheckCircle2 size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest">Konfigurasi Berhasil Diperbarui!</p>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">Konfigurasi SIRESIK</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1 text-slate-400 italic">Personalisasi identitas instansi dan format dokumen resmi daerah.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group bg-green-700 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-900/20 hover:bg-black transition-all active:scale-95 disabled:bg-gray-400"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- PANEL KIRI: FORM CONFIG (8 COLS) --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Identitas Instansi */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gray-950 text-white flex items-center justify-between px-8">
                            <div className="flex items-center gap-3">
                                <Building2 size={20} className="text-green-500" />
                                <span className="font-black uppercase text-[10px] tracking-[0.2em]">Profil Pemerintah Daerah</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 italic">Terakhir diubah: 12 Jan 2026</span>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Pemerintah Daerah</label>
                                <input name="pemda" value={formData.pemda} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white font-bold text-sm transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Dinas Pelaksana</label>
                                <input name="dinas" value={formData.dinas} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white font-bold text-sm transition-all" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Alamat Kantor Pelayanan Pusat</label>
                                <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} rows="2" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-green-700 focus:bg-white font-bold text-sm transition-all"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Penandatangan Dokumen */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-blue-600">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 px-8">
                            <BadgeCheck className="text-blue-600" size={20} />
                            <span className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-800">Otoritas Pengesahan (Signature)</span>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nama Pejabat (TTD)</label>
                                <input name="pejabat_nama" value={formData.pejabat_nama} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white font-black text-sm uppercase transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">NIP / NIK Pejabat</label>
                                <input name="pejabat_nip" value={formData.pejabat_nip} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white font-mono font-bold text-sm transition-all" />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Jabatan Struktural Dalam Dokumen</label>
                                <input name="pejabat_jabatan" value={formData.pejabat_jabatan} onChange={handleInputChange} type="text" className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white font-bold text-sm uppercase transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Penomoran Dokumen */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-amber-500">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 px-8">
                            <RefreshCcw className="text-amber-500" size={20} />
                            <span className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-800">Pola Penomoran Dokumen (Pattern)</span>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Format Nomor SKRD</label>
                                <div className="flex items-center gap-2">
                                    <span className="p-4 bg-gray-200 rounded-2xl text-xs font-mono font-black text-gray-500">0001</span>
                                    <input name="prefix_skrd" value={formData.prefix_skrd} onChange={handleInputChange} type="text" className="flex-1 p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-amber-500 font-mono font-bold text-sm transition-all" />
                                    <span className="p-4 bg-gray-200 rounded-2xl text-xs font-mono font-black text-gray-500">2026</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Format Nomor SSRD</label>
                                <div className="flex items-center gap-2">
                                    <span className="p-4 bg-gray-200 rounded-2xl text-xs font-mono font-black text-gray-500">0001</span>
                                    <input name="prefix_ssrd" value={formData.prefix_ssrd} onChange={handleInputChange} type="text" className="flex-1 p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-amber-500 font-mono font-bold text-sm transition-all" />
                                    <span className="p-4 bg-gray-200 rounded-2xl text-xs font-mono font-black text-gray-500">2026</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PANEL KANAN: LOGO & PREVIEW (4 COLS) --- */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Logo Management */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-8 leading-none">Visual Identitas Dokumen</label>
                        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 group-hover:border-green-100 transition-all overflow-hidden p-6">
                            <img src={logoPreview} alt="Logo Dinas" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            <label className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                <Upload className="text-white" size={32} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                        </div>
                        <p className="text-[9px] text-gray-400 italic px-6 mb-6">Logo ini akan muncul pada KOP surat resmi di sisi Wajib Retribusi.</p>
                        <button className="text-[10px] font-black text-green-700 uppercase tracking-widest border-b-2 border-green-700 pb-1 hover:text-black hover:border-black transition-all">Ganti Gambar Logo</button>
                    </div>

                    {/* Quick Link Review Format */}
                    <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black italic tracking-tighter leading-tight uppercase">Cek Preview <br />Format Surat</h4>
                            <p className="text-xs text-blue-100 mt-2 font-medium opacity-80 leading-relaxed">Pastikan tata letak nama dan alamat tidak melebihi margin dokumen.</p>
                            <div className="grid grid-cols-1 gap-2 mt-8">
                                <button
                                    onClick={() => setShowSkrd(true)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-between px-5 transition-all text-[10px] font-black uppercase tracking-widest border border-white/10"
                                >
                                    <span>Pratinjau SKRD</span> <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => setShowSsrd(true)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-between px-5 transition-all text-[10px] font-black uppercase tracking-widest border border-white/10"
                                >
                                    <span>Pratinjau SSRD</span> <Eye size={16} />
                                </button>
                            </div>
                        </div>
                        <FileText size={180} className="absolute -right-12 -bottom-12 opacity-10" />
                    </div>
                </div>
            </div>
            {showSkrd && (
                <SkrdPreviewModal
                    data={dummyData}
                    onClose={() => setShowSkrd(false)}
                    // Tips: Nantinya komponen Modal Anda perlu menerima prop 'config' 
                    // agar bisa menampilkan Nama Pemda & Pejabat secara dinamis dari formData
                    config={formData}
                />
            )}

            {showSsrd && (
                <SsrdPreviewModal
                    data={dummyData}
                    onClose={() => setShowSsrd(false)}
                    config={formData}
                />
            )}
        </div>
    );
};

export default AdminSettings;