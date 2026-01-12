import React, { useState, useMemo } from 'react';
import { X, SendHorizontal, Loader2, MapPin, User, Building2, FileText, Banknote, Home, Tags, AlertCircle } from 'lucide-react';

const RegistrationDetailModal = ({ data, onClose, onForward, isProcessing }) => {
    // 1. State untuk tarif yang dipilih
    const [selectedTariff, setSelectedTariff] = useState(null);

    // 2. Mock Data Master Tarif (Biasanya dari API berdasarkan Perda)
    const masterTarif = [
        { id: 1, kategori: 'Niaga Kecil', nilai: 500, unit: 'm²' },
        { id: 2, kategori: 'Niaga Besar', nilai: 1000, unit: 'm²' },
        { id: 3, kategori: 'Industri', nilai: 2000, unit: 'm²' },
        { id: 4, kategori: 'Sosial / Yayasan', nilai: 250, unit: 'm²' },
    ];

    // 3. Hitung Total Retribusi secara otomatis
    const totalRetribusi = useMemo(() => {
        if (!selectedTariff || !data.luas_bangunan) return 0;
        return selectedTariff.nilai * parseFloat(data.luas_bangunan);
    }, [selectedTariff, data.luas_bangunan]);

    if (!data) return null;

    const LabelValue = ({ label, value }) => (
        <div className="py-2 border-b border-gray-50 last:border-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-700">{value || '-'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">

                {/* Header tetap sama */}
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500 p-3 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black tracking-tight uppercase">Validasi & Penetapan Tarif</h3>
                                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">Form: {data.no_formulir}</span>
                            </div>
                            <p className="text-green-400 font-mono font-bold text-sm">NPWRD: {data.npwrd}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row max-h-[75vh]">
                    {/* PANEL KIRI: Data Identitas (Scrollable) */}
                    <div className="flex-1 p-8 overflow-y-auto border-r border-gray-100 bg-gray-50/30">
                        <div className="space-y-6">
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-green-700">
                                    <User size={18} strokeWidth={3} />
                                    <h4 className="text-xs font-black uppercase">Identitas Wajib Retribusi</h4>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl space-y-1">
                                    {data.tipe_wp === 'BADAN' ? (
                                        <>
                                            <LabelValue label="Nama Badan / Merek Usaha" value={data.nama_badan} />
                                            <LabelValue label="Jalan / No" value={data.alamat_badan.jalan} />
                                            <LabelValue label="RT / RW" value={data.alamat_badan.rt_rw} />
                                            <LabelValue label="Desa / Kelurahan" value={data.alamat_badan.kelurahan} />
                                            <LabelValue label="Kecamatan" value={data.alamat_badan.kecamatan} />
                                            <LabelValue label="Telepon" value={data.alamat_badan.telp} />
                                            <LabelValue label="Kode Pos" value={data.alamat_badan.kode_pos} />
                                        </>
                                    ) : (
                                        <>
                                            <LabelValue label="Nama Lengkap" value={data.nama_lengkap} />
                                            <LabelValue label="Kewarganegaraan" value={data.kewarganegaraan} />
                                            <LabelValue label="Jenis / Nomor Identitas" value={`${data.jenis_identitas} - ${data.nik}`} />
                                            <LabelValue label="Tipe Lokasi" value={data.tipe_lokasi} />
                                            <LabelValue label="Jalan / No" value={data.alamat.jalan} />
                                            <LabelValue label="RT / RW" value={data.alamat.rt_rw} />
                                            <LabelValue label="Desa / Kelurahan" value={data.alamat.kelurahan} />
                                            <LabelValue label="Kecamatan" value={data.alamat.kecamatan} />
                                            <LabelValue label="Telepon" value={data.alamat.telp} />
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* KOLOM KANAN: DATA PENGELOLA & VOLUME (SESUAI FORMULIR) */}
                        <div className="space-y-6">
                            {data.tipe_wp === 'BADAN' && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-blue-700">
                                        <Building2 size={18} strokeWidth={3} />
                                        <h4 className="text-xs font-black uppercase">Data Pemilik / Pengelola</h4>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-3xl space-y-1">
                                        <LabelValue label="Nama Pengelola" value={data.pengelola.nama} />
                                        <LabelValue label="Jabatan" value={data.pengelola.jabatan} />
                                        <LabelValue label="Alamat Pengelola" value={data.pengelola.alamat} />
                                        <LabelValue label="Telepon" value={data.pengelola.telp} />
                                    </div>
                                </section>
                            )}

                            <section>
                                <div className="flex items-center gap-2 mb-4 text-amber-700">
                                    <Home size={18} strokeWidth={3} />
                                    <h4 className="text-xs font-black uppercase">Kapasitas & Volume Retribusi</h4>
                                </div>
                                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-amber-600 uppercase">Luas Bangunan</p>
                                            <p className="text-2xl font-black text-gray-800">{data.luas_bangunan} <span className="text-xs font-bold text-gray-500">m²</span></p>
                                        </div>
                                        {/* {data.tipe_wp === 'BADAN' ? (
                                            <div>
                                                <p className="text-[10px] font-black text-amber-600 uppercase">Jumlah Rumah Tangga</p>
                                                <p className="text-xl font-black text-gray-800">{data.jumlah_rt}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-[10px] font-black text-amber-600 uppercase">Luas Bangunan</p>
                                                <p className="text-xl font-black text-gray-800">{data.luas_bangunan} <span className="text-xs font-bold text-gray-500">m²</span></p>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            </section>

                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                                <div className="bg-blue-500 p-2 h-fit rounded-lg text-white">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-800 uppercase italic">Lampiran Tersedia:</p>
                                    <p className="text-[10px] text-blue-600">- Foto Copy Surat Keterangan Domisili</p>
                                    <p className="text-[10px] text-blue-600">- Foto Copy Identitas (KTP/SIM)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL KANAN: PENETAPAN TARIF (Tugas Utama DLH) */}
                    <div className="flex-1 p-8 bg-white overflow-y-auto">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Tags size={20} strokeWidth={3} />
                                <h4 className="text-sm font-black uppercase tracking-widest">Penetapan Tarif Retribusi</h4>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border-2 border-dashed border-blue-200 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-blue-700 uppercase mb-2 block ml-1">Pilih Kategori Tarif (Berdasarkan Perda)</label>
                                    <select
                                        onChange={(e) => {
                                            const tarif = masterTarif.find(t => t.id === parseInt(e.target.value));
                                            setSelectedTariff(tarif);
                                        }}
                                        className="w-full p-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:border-blue-500 outline-none text-sm font-bold text-gray-700 transition-all"
                                    >
                                        <option value="">-- Pilih Kategori Tarif --</option>
                                        {masterTarif.map(t => (
                                            <option key={t.id} value={t.id}>{t.kategori} (Rp {t.nilai.toLocaleString()}/{t.unit})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedTariff && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Unit Price</span>
                                            <span className="font-black text-blue-700">Rp {selectedTariff.nilai.toLocaleString()} / {selectedTariff.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Total Ketetapan</span>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900">Rp {totalRetribusi.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Per Bulan</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!selectedTariff && (
                                <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl text-amber-700 border border-amber-100">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p className="text-xs font-medium italic">Anda harus menetapkan kategori tarif sebelum meneruskan data ke Bendahara Penerimaan.</p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                                <Banknote size={20} className="text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Status: Menunggu Ketetapan DLH</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-8 bg-gray-900 flex justify-between items-center">
                    <div className="hidden md:block">
                        <p className="text-xs font-bold text-gray-400">Petugas Validasi: Role DLH (Pusat)</p>
                        <p className="text-[10px] text-gray-500">Ketetapan ini akan menjadi dasar penerbitan SKRD oleh Bendahara.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-8 py-4 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all">
                            Tutup
                        </button>
                        <button
                            onClick={() => onForward({ id: data.id, tarif: selectedTariff, total: totalRetribusi })}
                            disabled={isProcessing || !selectedTariff}
                            className={`px-10 py-4 rounded-2xl text-sm font-black flex items-center gap-3 transition-all shadow-xl
                                ${!selectedTariff
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-400 text-white shadow-green-900/40'}`}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <SendHorizontal size={18} />}
                            Validasi & Teruskan Ke Bendahara
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailModal;