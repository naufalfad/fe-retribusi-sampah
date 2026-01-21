import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../components/ui/FormInput';
import { Building2, User, Upload, Send, ShieldCheck, ChevronLeft, Calculator, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Skema Validasi diperbarui untuk mendukung dropdown
const schema = z.object({
    email_akun: z.string().email("Email akun harus valid"),
    nama: z.string().min(3, "Nama harus diisi"),
    tipe_lokasi: z.string().min(1, "Pilih tipe lokasi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    kabupaten: z.string().min(1, "Pilih Kabupaten"),
    kecamatan: z.string().min(1, "Pilih Kecamatan"),
    kelurahan: z.string().min(1, "Pilih Kelurahan/Desa"),
    kodepos: z.string().min(1, "Pilih Kode Pos"),
    telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    kelas_retribusi: z.string().min(1, "Pilih kelas retribusi"),
    sub_layanan: z.string().optional(),
    volume: z.string().optional(),
});

const TARIF_REFERENSI = {
    pribadi: [
        { id: 'p_1', label: 'Kelas 1 (Tanah > 350m² / Listrik > 3.500 VA)', tarif: 12800, unit: 'Bulan' },
        { id: 'p_2', label: 'Kelas 2 (Tanah 60-350m² / Listrik 900-3.500 VA)', tarif: 9600, unit: 'Bulan' },
        { id: 'p_3', label: 'Kelas 3 (Tanah < 60m² / Listrik 450 VA)', tarif: 6400, unit: 'Bulan' },
        { id: 'p_tps', label: 'Pelayanan Rumah Tinggal dari TPS/TPST', tarif: 56950, unit: 'm³' },
    ],
    badan: {
        kelas_1: {
            title: 'Kelas 1 (Industri, Restoran, Hotel, Wisata, Hiburan)',
            services: [
                { id: 'b_1_a', label: 'Pelayanan dari Sumber Sampah', tarif: 67000, unit: 'm³' },
                { id: 'b_1_b', label: 'Pelayanan Pengangkutan dari TPS/TPST', tarif: 60300, unit: 'm³' },
                { id: 'b_1_c', label: 'Pelayanan Pemrosesan Akhir', tarif: 50250, unit: 'm³' },
            ]
        },
        kelas_2: {
            title: 'Kelas 2 (Perkantoran, Pasar, RS/Faskes)',
            services: [
                { id: 'b_2_a', label: 'Pelayanan dari Sumber Sampah', tarif: 63650, unit: 'm³' },
                { id: 'b_2_b', label: 'Pelayanan Pengangkutan dari TPS/TPST', tarif: 56950, unit: 'm³' },
                { id: 'b_2_c', label: 'Pelayanan Pemrosesan Akhir', tarif: 46900, unit: 'm³' },
            ]
        }
    }
};

const FormSelect = ({ label, name, register, errors, options, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <select
            {...register(name)}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 outline-none transition-all focus:bg-white
                ${errors[name] ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-green-600 focus:ring-4 focus:ring-green-50'}`}
        >
            <option value="">{placeholder || `Pilih ${label}`}</option>
            {options.map((opt) => (
                <option key={opt.id || opt} value={opt.id || opt}>{opt.label || opt}</option>
            ))}
        </select>
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

const RegistrationForm = ({ isStaff = false }) => {
    const [type, setType] = useState('pribadi');
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    // Data Dummy untuk Dropdown (Nantinya bisa diisi dari API)
    const userAccount = {
        nama: "Dejan Sutisna",
        nik: "3201010101010001",
        telepon: "08123456789",
        email: "jajan@email.com",
        alamat: "Jl. Pekansari No.32",
        rt_rw: "RT002/RW13",
        kabupaten: "Kabupaten Bogor",
        kecamatan: "Ciampea",
        kelurahan: "Sukahati",
        kodepos: "16911"
    };
    const listKabupaten = ["Kabupaten Bogor"];
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede", "Ciampea", "Ciawi"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati", "Harapan Jaya"];
    const listKodePos = ["16911", "16912", "16913", "16914", "16915"];
    const listLuas = ["Kurang dari 10m²", "10-30m²", "31-50m²", "Lebih dari 50m²"];

    const selectedKelas = watch('kelas_retribusi');
    const selectedSubLayanan = watch('sub_layanan');

    const onSubmit = (data) => {
        console.log("Data Pendaftaran:", { ...data, jenis_kategori: type });
        alert("NPOR berhasil diajukan dengan klasifikasi tarif terpilih!");
        navigate(isStaff ? '/upt/verifikasi' : '/dashboard');
    };

    const getTariffInfo = () => {
        if (type === 'pribadi') {
            return TARIF_REFERENSI.pribadi.find(t => t.id === selectedKelas);
        } else {
            const kelas = TARIF_REFERENSI.badan[selectedKelas];
            return kelas?.services.find(s => s.id === selectedSubLayanan);
        }
    };

    const tariffDisplay = getTariffInfo();

    const backConfig = isStaff
        ? { label: "Kembali ke List Verifikasi", action: () => navigate('/upt/verifikasi') }
        : { label: "Kembali ke Halaman Dashboard", action: () => navigate('/dashboard') }

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-12 px-4">
            <button
                onClick={backConfig.action}
                className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-700 transition-all mb-6 group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                {backConfig.label}
            </button>

            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className={`${isStaff ? 'bg-gray-900' : 'bg-green-700'} p-8 text-white text-center`}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {isStaff ? 'Penetapan NPOR baru (UPT)' : 'Permohonan NPOR baru'}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                        {isStaff ? 'Otoritas pendaftaran aset untuk akun Wajib Retribusi' :
                            'Daftarkan obyek retribusi ke akun Anda'}
                    </p>
                </div>

                <div className="flex p-2 bg-gray-100 m-6 rounded-xl">
                    <button
                        onClick={() => setType('pribadi')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}
                    >
                        <User size={18} /> Rumah Tinggal
                    </button>
                    <button
                        onClick={() => setType('badan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}
                    >
                        <Building2 size={18} /> Komersial
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-100 space-y-4">
                            <div className="flex items-center gap-2 text-green-800">
                                <ShieldCheck size={20} />
                                <h3 className="font-bold uppercase text-xs tracking-widest">Otoritas & Linking Akun</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Email Akun SIRESIK"
                                    name="email_akun"
                                    placeholder="email@user.com"
                                    register={register} errors={errors}
                                />
                                <FormInput
                                    label="Nomor NPOR"
                                    name="npor"
                                    placeholder="4.1.2.01.02.XXXXXX"
                                    register={register} errors={errors}
                                />
                            </div>
                            <p className="text-[10px] text-green-600 font-medium italic">*Pastikan Email Akun terdaftar agar obyek muncul di dashboard Wajib Retribusi.</p>
                        </div>

                        {/* Section 1: Identitas Utama */}
                        <div className="md:col-span-2 border-b pb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Identitas {type === 'pribadi' ? 'Pemohon' : ' Pengelola'}
                            </h3>
                            {/* {!isStaff && <p className="text-[10px] text-blue-600 mt-1 font-bold italic">*Identitas otomatis disinkronkan dengan Akun SIRESIK Anda</p>} */}
                        </div>

                        {/* Nama Utama selalu muncul */}
                        {type === 'pribadi' ? (
                            <FormInput
                                label="Nama Lengkap"
                                name="nama"
                                register={register}
                                errors={errors}
                                readOnly={!isStaff}
                            />
                        ) : (<>
                        </>)}

                        {type === 'pribadi' ? (
                            /* Tampilan Jika Pribadi */
                            <FormInput
                                label="NIK / Nomor Identitas"
                                name="no_identitas"
                                register={register}
                                errors={errors}
                                readOnly={!isStaff}
                            />
                        ) : (
                            /* Tampilan Jika Badan (Muncul Identitas & Alamat Pengelola) */
                            <>
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">Keterangan Pemilik / Pengelola</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Nama Pengelola"
                                            name="nama"
                                            register={register}
                                            errors={errors}
                                        />
                                        <FormInput
                                            label="Jabatan"
                                            name="jabatan"
                                            register={register}
                                            errors={errors}
                                        />

                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Alamat Jalan Pengelola"
                                                name="alamat"
                                                register={register}
                                                errors={errors}
                                            />
                                        </div>

                                        <FormInput
                                            label="RT / RW"
                                            name="rt_rw"
                                            register={register}
                                            errors={errors}
                                        />

                                        <FormSelect
                                            label="Kabupaten"
                                            name="kabupaten"
                                            register={register}
                                            errors={errors}
                                            options={listKabupaten}
                                        />

                                        <FormSelect
                                            label="Kecamatan"
                                            name="kecamatan"
                                            register={register}
                                            errors={errors}
                                            options={listKecamatan}
                                        />

                                        <FormSelect
                                            label="Desa / Kelurahan"
                                            name="kelurahan"
                                            register={register}
                                            errors={errors}
                                            options={listKelurahan}
                                        />

                                        <FormSelect
                                            label="Kode Pos"
                                            name="kodepos"
                                            register={register}
                                            errors={errors}
                                            options={listKodePos}
                                        />

                                        <FormInput
                                            label="Nomor Telepon / WA Pengelola"
                                            name="telepon"
                                            register={register}
                                            errors={errors}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Section 2: Alamat Lengkap */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Alamat Obyek
                            </h3>
                        </div>

                        {type === 'pribadi' ? (
                            <FormSelect
                                label="Tipe Lokasi"
                                name="tipe_lokasi"
                                register={register}
                                errors={errors}
                                options={["Perumahan", "Non Perumahan"]}
                            />
                        ) : (
                            <FormInput
                                label="Nama Badan Usaha/Merek"
                                name="nama_badan"
                                register={register} errors={errors} />
                        )}

                        <FormInput
                            label="Jalan / No. Rumah"
                            name="alamatObyek"
                            register={register} errors={errors} />

                        <FormInput
                            label="Nomor Telepon / WA"
                            name="teleponObyek"
                            register={register} errors={errors} />

                        <FormInput
                            label="RT / RW"
                            name="rt_rwObyek"
                            register={register} errors={errors} />

                        <FormSelect
                            label="Kabupaten"
                            name="kabupatenObyek"
                            register={register}
                            errors={errors}
                            options={listKabupaten}
                        />

                        <FormSelect
                            label="Kecamatan"
                            name="kecamatanObyek"
                            register={register}
                            errors={errors}
                            options={listKecamatan}
                        />

                        <FormSelect
                            label="Desa / Kelurahan"
                            name="kelurahanObyek"
                            register={register}
                            errors={errors}
                            options={listKelurahan}
                        />

                        <FormSelect
                            label="Kode Pos"
                            name="kodeposObyek"
                            register={register}
                            errors={errors}
                            options={listKodePos}
                        />

                        {/* Section 3: Data Teknis - Diubah Luas Bangunan untuk Semua */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Section 3: Data Teknis & Klasifikasi Tarif */}
                            <div className="md:col-span-2 border-b pb-2 pt-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                    Klasifikasi Retribusi & Tarif
                                </h3>
                            </div>

                            {type === 'pribadi' ? (
                                <>
                                    <div className="md:col-span-2">
                                        <FormSelect
                                            label="Kelas Rumah Tinggal"
                                            name="kelas_retribusi"
                                            register={register}
                                            errors={errors}
                                            options={TARIF_REFERENSI.pribadi}
                                            placeholder="Pilih Klasifikasi Rumah"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FormSelect
                                        label="Klasifikasi Bisnis/Badan"
                                        name="kelas_retribusi"
                                        register={register}
                                        errors={errors}
                                        options={[
                                            { id: 'kelas_1', label: TARIF_REFERENSI.badan.kelas_1.title },
                                            { id: 'kelas_2', label: TARIF_REFERENSI.badan.kelas_2.title }
                                        ]}
                                        placeholder="Pilih Klasifikasi"
                                    />
                                    {selectedKelas && (
                                        <FormSelect
                                            label="Jenis Pelayanan"
                                            name="sub_layanan"
                                            register={register}
                                            errors={errors}
                                            options={TARIF_REFERENSI.badan[selectedKelas].services}
                                            placeholder="Pilih Tipe Layanan"
                                        />
                                    )}
                                </>
                            )}

                            {/* Ringkasan Tarif Dinamis */}
                            {tariffDisplay && (
                                <div className="md:col-span-2 bg-green-50 border-2 border-green-100 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <Calculator className="text-green-700" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Estimasi Tarif Retribusi</p>
                                        <h4 className="text-2xl font-black text-gray-800">
                                            Rp {tariffDisplay.tarif.toLocaleString('id-ID')}
                                            <span className="text-sm font-normal text-gray-500"> / {tariffDisplay.unit}</span>
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                            <Info size={12} /> Berdasarkan Peraturan Daerah yang berlaku.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Jika berbasis m3, munculkan field volume */}
                            {tariffDisplay?.unit === 'm³' && (
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="Estimasi Volume Sampah per Bulan (m³)"
                                        name="volume"
                                        type="number"
                                        placeholder="Masukkan angka saja"
                                        register={register}
                                        errors={errors}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 4: Upload Dokumen */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                                Dokumen Pendukung
                            </h3>
                        </div>

                        <div className="md:col-span-2">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-green-700 transition-colors cursor-pointer">
                                <Upload size={40} className="mb-2 text-gray-400" />
                                <p className="text-sm font-medium">Klik atau seret scan dokumen (KTP/Domisili) di sini</p>
                                <p className="text-xs mt-1">Format: JPG, PNG, atau PDF (Maks. 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button type="submit" className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 ${isStaff ? 'bg-gray-900 hover:bg-black' : 'bg-green-700 hover:bg-green-800'}`}>
                            <Send size={20} /> {isStaff ? 'Simpan & Tautkan Aset' : 'Ajukan Pendaftaran'}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 italic">
                            *Dengan menekan tombol kirim, Anda setuju bahwa data yang diisi adalah benar sesuai dengan ketentuan yang berlaku.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;