import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, CheckCircle2, FileText, Landmark } from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';

const AdminFormPreview = () => {
    const [activeTab, setActiveTab] = useState('SKRD'); // 'SKRD' atau 'SSRD'
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const [logoPreview, setLogoPreview] = useState(null);
    const [ttdPreview, setTtdPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [ttdFile, setTtdFile] = useState(null);
    const [templateId, setTemplateId] = useState(null);

    const [formData, setFormData] = useState({
        pemda: "",
        dinas: "",
        alamat: "",
        website: "",
        pejabat_nama: "",
        pejabat_nip: "",
        pejabat_jabatan: "",
        prefix_skrd: "",
        prefix_ssrd: ""
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/form/get-template');
                if (response.data.success && response.data.data.length > 0) {
                    const db = response.data.data[0];
                    setTemplateId(db.id_form);
                    setFormData({
                        pemda: db.nama_pemda || "",
                        dinas: db.dinas_pelaksana || "",
                        alamat: db.alamat_pemda || "",
                        website: db.website || "",
                        pejabat_nama: db.nama_pejabat || "",
                        pejabat_nip: db.nip_pejabat || "",
                        pejabat_jabatan: db.jabatan_pejabat || "",
                        prefix_skrd: db.format_skrd || "",
                        prefix_ssrd: db.format_ssrd || ""
                    });
                    if (db.logo) setLogoPreview(`${BASE_URL}/${db.logo.replace(/\\/g, '/')}`);
                    if (db.ttd_pejabat) setTtdPreview(`${BASE_URL}/${db.ttd_pejabat.replace(/\\/g, '/')}`);
                }
            } catch (error) { console.error(error); } finally { setIsLoadingData(false); }
        };
        fetchConfig();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (type === 'logo') {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setTtdFile(file);
            setTtdPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const dataSubmit = new FormData();
        dataSubmit.append('nama_pemda', formData.pemda);
        dataSubmit.append('dinas_pelaksana', formData.dinas);
        dataSubmit.append('alamat_pemda', formData.alamat);
        dataSubmit.append('website', formData.website);
        dataSubmit.append('nama_pejabat', formData.pejabat_nama);
        dataSubmit.append('nip_pejabat', formData.pejabat_nip);
        dataSubmit.append('jabatan_pejabat', formData.pejabat_jabatan);
        dataSubmit.append('format_skrd', formData.prefix_skrd);
        dataSubmit.append('format_ssrd', formData.prefix_ssrd);
        if (logoFile) dataSubmit.append('logo', logoFile);
        if (ttdFile) dataSubmit.append('ttd_pejabat', ttdFile);

        try {
            await api.put(`/form/update-template/${templateId}`, dataSubmit);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) { alert("Gagal update"); } finally { setIsSaving(false); }
    };

    if (isLoadingData) return <div className="h-96 flex items-center justify-center font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Menyiapkan Lembar Kerja...</div>;

    // Komponen Input Transparan agar terlihat seperti teks biasa
    const LiveInput = ({ name, value, onChange, placeholder, className = "" }) => (
        <input
            name={name} value={value} onChange={onChange} placeholder={placeholder}
            className={`bg-transparent hover:bg-yellow-50 focus:bg-yellow-100 focus:outline-none transition-colors border-b border-transparent focus:border-blue-400 ${className}`}
        />
    );

    return (
        <div className="max-w-5xl mx-auto pb-24 font-serif text-black">
            {/* TAB & ACTION HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200 sticky top-4 z-50">
                <div className="flex bg-white rounded-xl shadow-sm p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('SKRD')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SKRD' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                    >
                        <FileText size={14} /> Template SKRD
                    </button>
                    <button
                        onClick={() => setActiveTab('SSRD')}
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SSRD' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                    >
                        <Landmark size={14} /> Template SSRD
                    </button>
                </div>

                <button
                    onClick={handleSave} disabled={isSaving}
                    className="bg-green-700 hover:bg-black text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg disabled:bg-gray-400"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Simpan Perubahan
                </button>
            </div>

            {/* AREA KERTAS A4 */}
            <div className="bg-white shadow-2xl border border-gray-300 mx-auto p-[15mm] min-h-[297mm] relative overflow-hidden text-[12px] leading-tight">

                {/* -------------------- RENDER SKRD -------------------- */}
                {activeTab === 'SKRD' && (
                    <>
                        {/* KOP */}
                        <div className="flex items-center border-b-[3px] border-black pb-2 mb-4">
                            <div className="w-24 relative group cursor-pointer">
                                <img src={logoPreview || '/placeholder-logo.png'} className="w-20 h-20 object-contain" alt="Logo" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                    <Upload className="text-white" size={20} />
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'logo')} />
                                </div>
                            </div>
                            <div className="flex-1 text-center">
                                <div className="text-[18px] font-bold uppercase leading-none">
                                    <LiveInput name="pemda" value={formData.pemda} onChange={handleInputChange} className="w-full text-center font-bold" placeholder="PEMERINTAHAN BOGORIANI" />
                                </div>
                                <div className="text-[16px] font-bold uppercase mt-1">
                                    <LiveInput name="dinas" value={formData.dinas} onChange={handleInputChange} className="w-full text-center font-bold" placeholder="DINAS LINGKUNGAN HUTAN" />
                                </div>
                                <div className="text-[10px] mt-1 italic">
                                    <LiveInput name="alamat" value={formData.alamat} onChange={handleInputChange} className="w-full text-center" placeholder="Komplek Kantor ke-PU-an, Jl. Tegar Beriman Cibinong 16914" />
                                </div>
                                <div className="text-[10px] text-blue-600 underline">
                                    <LiveInput name="website" value={formData.website} onChange={handleInputChange} className="w-full text-center text-blue-600 underline" placeholder="www.dlh-bogor.go.id" />
                                </div>
                            </div>
                            <div className="w-40 border border-black p-2 ml-4">
                                <div className="text-right font-black italic mb-2">SKRD</div>
                                <div className="flex justify-between"><span>MASA :</span> <span className="font-bold">1</span></div>
                                <div className="flex justify-between"><span>TAHUN :</span> <span className="font-bold">2026</span></div>
                            </div>
                        </div>

                        {/* NOMOR */}
                        <div className="text-right mb-6 font-bold flex justify-end gap-2">
                            <span>No. SKRD :</span>
                            <div className="border-b border-black min-w-[150px] text-left">
                                <LiveInput name="prefix_skrd" value={formData.prefix_skrd} onChange={handleInputChange} className="font-mono text-[11px] w-full" placeholder="SKRD/2026/01/2NKLW" />
                            </div>
                        </div>

                        {/* IDENTITAS (DUMMY PREVIEW) */}
                        <table className="w-full mb-6 border-none">
                            <tbody>
                                {[
                                    ["Nama Wajib Retribusi", ":", "Rumah Rakidu"],
                                    ["Alamat", ":", "Jl. Pandawa No.13"],
                                    ["NPWRD", ":", "NPWRD-2026-000001"],
                                    ["NPOR", ":", "NPOR-2026-000007"],
                                    ["Jatuh Tempo", ":", "2 Maret 2026"],
                                ].map((row, idx) => (
                                    <tr key={idx}><td className="w-40 py-1 font-bold">{row[0]}</td><td className="w-4">{row[1]}</td><td className="font-bold">{row[2]}</td></tr>
                                ))}
                            </tbody>
                        </table>

                        {/* TABEL RINCIAN */}
                        <table className="w-full border-collapse border border-black mb-10">
                            <thead>
                                <tr className="border-y border-black">
                                    <th className="border-x border-black p-2 w-32">Kode Rekening</th>
                                    <th className="border-x border-black p-2">Uraian Retribusi</th>
                                    <th className="border-x border-black p-2 w-40">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-black">
                                    <td className="border-x border-black p-2 text-center">4.1.2.01.02</td>
                                    <td className="border-x border-black p-2">Retribusi Pelayanan Persampahan/Kebersihan</td>
                                    <td className="border-x border-black p-2 text-right">69.750,00</td>
                                </tr>
                                <tr className="border-b border-black italic">
                                    <td className="border-x border-black p-2"></td>
                                    <td className="border-x border-black p-2 px-8">Tarif Retribusi Rumah Tinggal Dari TPS/TPST</td>
                                    <td className="border-x border-black p-2 text-right">56.950,00</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="border-x border-black p-2 text-right font-bold uppercase">Jumlah Ketetapan Pokok</td>
                                    <td className="border-x border-black p-2 text-right font-bold">69.750,00</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* FOOTER */}
                        <div className="flex justify-between items-start">
                            <div className="text-[10px] space-y-1">
                                <div className="font-bold underline mb-1 uppercase">Perhatian:</div>
                                <div>1. Pembayaran dilakukan melalui kanal resmi Bank/QRIS.</div>
                                <div>2. Keterlambatan dikenakan sanksi sesuai Perda.</div>
                                <div>3. Simpan SKRD ini sebagai bukti sah.</div>
                            </div>
                            <div className="text-center w-64 space-y-1">
                                <div className="mb-4">Dicetak pada {new Date().toLocaleDateString('id-ID')}</div>
                                <div className="relative group w-20 h-24 mx-auto border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                    {ttdPreview ? <img src={ttdPreview} className="w-full h-full object-contain" alt="TTD" /> : <Upload className="text-gray-300" />}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'ttd')} />
                                </div>
                                <div className="font-bold uppercase mt-4">
                                    <LiveInput name="pejabat_jabatan" value={formData.pejabat_jabatan} onChange={handleInputChange} className="w-full text-center font-bold" placeholder="MAYOR KUTIP 3" />
                                </div>
                                <div className="font-bold underline mt-4">
                                    <LiveInput name="pejabat_nama" value={formData.pejabat_nama} onChange={handleInputChange} className="w-full text-center font-bold underline" placeholder="RENDY" />
                                </div>
                                <div className="text-[11px]">
                                    NIP. <LiveInput name="pejabat_nip" value={formData.pejabat_nip} onChange={handleInputChange} className="w-32" placeholder="12900666" />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* -------------------- RENDER SSRD -------------------- */}
                {activeTab === 'SSRD' && (
                    <>
                        {/* HEADER BOX SSRD */}
                        <table className="w-full border-collapse border border-black mb-0">
                            <tbody>
                                <tr>
                                    <td className="w-20 p-2 border border-black text-center relative group">
                                        <img src={logoPreview || '/placeholder-logo.png'} className="w-14 h-14 mx-auto object-contain" alt="Logo" />
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'logo')} />
                                    </td>
                                    <td className="border border-black p-2 text-center align-middle">
                                        <div className="text-[14px] font-bold uppercase">SURAT SETORAN RETRIBUSI DAERAH</div>
                                        <div className="text-[14px] font-bold uppercase">(SSRD)</div>
                                    </td>
                                    <td className="w-40 border border-black p-2 align-top">
                                        <div className="font-bold text-[12px]">SSRD.</div>
                                        <div className="italic text-[10px]">
                                            <LiveInput name="prefix_ssrd" value={formData.prefix_ssrd} onChange={handleInputChange} className="w-full italic" placeholder="SSRD/20260130/316095" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* DATA SSRD SECTION */}
                        <table className="w-full border-collapse border-x border-b border-black">
                            <tbody>
                                <tr>
                                    <td className="w-6 p-2 border-r border-black">a.</td>
                                    <td className="w-48 p-2">Telah menerima uang sebesar</td>
                                    <td className="w-4 p-2">:</td>
                                    <td className="p-2 font-bold italic"># 199.650 #</td>
                                </tr>
                                <tr className="border-t border-black">
                                    <td className="p-2 border-r border-black">b.</td>
                                    <td className="p-2">Terbilang (Rupiah)</td>
                                    <td className="p-2">:</td>
                                    <td className="p-2 font-bold">Rp. 199.650,00</td>
                                </tr>
                                <tr className="border-t border-black">
                                    <td className="p-2 border-r border-black">c.</td>
                                    <td className="p-2">Dari Nama (Objek / Subjek)</td>
                                    <td className="p-2">:</td>
                                    <td className="p-2 font-bold uppercase">KEKAYAAN / KARDI</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r border-black"></td>
                                    <td className="p-2 italic px-4">Alamat</td>
                                    <td className="p-2">:</td>
                                    <td className="p-2 border-b border-dotted border-black">Pemda raya</td>
                                </tr>
                                <tr className="border-t border-black">
                                    <td className="p-2 border-r border-black">d.</td>
                                    <td className="p-2">Sebagai Pembayaran</td>
                                    <td className="p-2">:</td>
                                    <td className="p-2 italic">Retribusi Pelayanan Persampahan/Kebersihan Masa 3 2024</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* TABLE KODE REKENING SSRD */}
                        <table className="w-full border-collapse border-x border-b border-black text-center font-bold">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border-r border-black p-2 w-1/2">Kode Rekening</th>
                                    <th className="p-2">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-r border-black p-4 text-[16px]">4.1.2.01.02</td>
                                    <td className="p-4 text-[16px]">199.650</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* TANGGAL INFO */}
                        <table className="w-full border-collapse border-x border-b border-black">
                            <tbody>
                                <tr>
                                    <td className="w-40 p-2 border-r border-black">Tanggal Diterima Uang</td>
                                    <td className="w-4 p-2">:</td>
                                    <td className="p-2 font-bold">30 Januari 2026</td>
                                </tr>
                                <tr className="border-t border-black">
                                    <td className="p-2 border-r border-black">Nomor SKRD</td>
                                    <td className="p-2">:</td>
                                    <td className="p-2">
                                        <div className="flex justify-between font-bold italic uppercase">
                                            <span>SKRD/2024/09/X9N0Z</span>
                                            <span>Tanggal Setor : 30 Januari 2026</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* SIGNATURE GRID SSRD */}
                        <table className="w-full border-collapse border-x border-b border-black text-center">
                            <tbody>
                                <tr className="font-bold border-b border-black bg-gray-50">
                                    <td className="border-r border-black p-2 w-1/3">Pembantu Bendahara<br />Penerimaan Pembantu</td>
                                    <td className="border-r border-black p-2 w-1/3">Juru Pungut</td>
                                    <td className="p-2 w-1/3">Pembayar/Penyetor</td>
                                </tr>
                                <tr className="h-20">
                                    <td className="border-r border-black"></td>
                                    <td className="border-r border-black italic text-[8px] text-gray-400">Digital Signature Verified</td>
                                    <td></td>
                                </tr>
                                <tr className="font-bold border-t border-black">
                                    <td className="border-r border-black p-1 text-left">NIP. .................................</td>
                                    <td className="border-r border-black p-1 text-left">NIP. 1.2203.2201</td>
                                    <td className="p-1 uppercase">KARDI</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* OFFICIAL TTD BOTTOM RIGHT */}
                        <div className="mt-8 flex justify-end">
                            <div className="text-center w-64">
                                <div className="text-[11px] font-bold">
                                    <LiveInput name="pejabat_jabatan" value={formData.pejabat_jabatan} onChange={handleInputChange} className="w-full text-center font-bold" placeholder="MAYOR KUTIP 3" />
                                </div>
                                <div className="italic text-[10px] my-1">ttd.</div>
                                <div className="relative group w-20 h-24 mx-auto border border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
                                    {ttdPreview ? <img src={ttdPreview} className="w-full h-full object-contain" alt="TTD" /> : <Upload className="text-gray-300" />}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'ttd')} />
                                </div>
                                <div className="font-bold underline uppercase mt-2">
                                    <LiveInput name="pejabat_nama" value={formData.pejabat_nama} onChange={handleInputChange} className="w-full text-center font-bold underline" placeholder="RENDY" />
                                </div>
                                <div className="text-[11px] font-bold">
                                    NIP. <LiveInput name="pejabat_nip" value={formData.pejabat_nip} onChange={handleInputChange} className="w-32" placeholder="12900666" />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* WATERMARK LUNAS (Hanya visual indikator) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-[0.03] text-[150px] font-black select-none pointer-events-none">
                    LUNAS
                </div>
            </div>

            {/* NOTIFIKASI SUKSES */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
                        <CheckCircle2 size={20} className="text-green-500" />
                        <p className="text-sm font-black uppercase tracking-widest">Data Berhasil Disinkronkan!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFormPreview;