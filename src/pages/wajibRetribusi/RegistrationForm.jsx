import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../components/ui/FormInput';
import { Building2, User, Upload, Send, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Skema Validasi diperbarui untuk mendukung dropdown
const schema = z.object({
    nama: z.string().min(3, "Nama harus diisi"),
    tipe_lokasi: z.string().min(1, "Pilih tipe lokasi"),
    alamat_jalan: z.string().min(5, "Alamat jalan diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    kabupaten: z.string().min(1, "Pilih Kabupaten"),
    kecamatan: z.string().min(1, "Pilih Kecamatan"),
    kelurahan: z.string().min(1, "Pilih Kelurahan/Desa"),
    kodepos: z.string().min(1, "Pilih Kode Pos"),
    telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    luas: z.string().min(1, "Luas bangunan harus diisi"), // Berlaku untuk keduanya sekarang
});

// Helper component untuk Dropdown agar style konsisten dengan FormInput Anda
const FormSelect = ({ label, name, register, errors, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <select
            {...register(name)}
            className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 outline-none transition-all focus:bg-white
                ${errors[name] ? 'border-red-500 focus:ring-red-100' : 'border-gray-100 focus:border-green-600 focus:ring-4 focus:ring-green-50'}`}
        >
            <option value="">Pilih {label}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        {errors[name] && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
    </div>
);

const RegistrationForm = ({ isStaff = false }) => {
    const [type, setType] = useState('pribadi');
    const navigate = useNavigate();

    // Data Dummy untuk Dropdown (Nantinya bisa diisi dari API)
    const listKabupaten = ["Kabupaten Bogor"];
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede", "Ciampea", "Ciawi"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati", "Harapan Jaya"];
    const listKodePos = ["16911", "16912", "16913", "16914", "16915"];

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = (data) => {
        console.log("Data Pendaftaran:", { ...data, jenis_retribusi: type });
        alert("Data berhasil dikirim ke UPT!");
    };

    const backConfig = isStaff
        ? { label: "Kembali ke List Verifikasi", action: () => navigate('/upt/verifikasi') }
        : { label: "Kembali ke Halaman Login", action: () => navigate('/login') }

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
                        {isStaff ? 'Input Pendaftaran Wajib Retribusi Baru' : 'Pendaftaran Mandiri'}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">Dinas Lingkungan Hidup Kabupaten Bogor</p>
                </div>

                <div className="flex p-2 bg-gray-100 m-6 rounded-xl">
                    <button
                        onClick={() => setType('pribadi')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}
                    >
                        <User size={18} /> Pribadi
                    </button>
                    <button
                        onClick={() => setType('badan')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}
                    >
                        <Building2 size={18} /> Badan / Usaha
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isStaff && (
                            <div className="md:col-span-2 bg-green-50 p-6 rounded-3xl border-2 border-green-100 mb-2">
                                <div className="flex items-center gap-2 mb-4 text-green-800">
                                    <ShieldCheck size={20} />
                                    <h3 className="font-bold uppercase text-xs tracking-widest">Otoritas Petugas UPT</h3>
                                </div>
                                <FormInput
                                    label="Nomor Pokok Wajib Retribusi Daerah (NPWRD)"
                                    name="npwrd"
                                    placeholder="Contoh: 1.02.01.XXXXXX"
                                    register={register}
                                    errors={errors}
                                />
                                <p className="text-[10px] text-green-600 mt-2 font-medium italic">
                                    *NPWRD ditetapkan langsung oleh petugas UPT pada saat penginputan data.
                                </p>
                            </div>
                        )}

                        {/* Section 1: Identitas Utama */}
                        <div className="md:col-span-2 border-b pb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Identitas {type === 'pribadi' ? 'Pemohon' : 'Badan Usaha & Pengelola'}
                            </h3>
                        </div>

                        {/* Nama Utama selalu muncul */}
                        <FormInput
                            label={type === 'pribadi' ? "Nama Lengkap" : "Nama Badan / Merek Usaha"}
                            name="nama"
                            register={register}
                            errors={errors}
                        />

                        {type === 'pribadi' ? (
                            /* Tampilan Jika Pribadi */
                            <FormInput
                                label="NIK / Nomor Identitas"
                                name="no_identitas"
                                register={register}
                                errors={errors}
                            />
                        ) : (
                            /* Tampilan Jika Badan (Muncul Identitas & Alamat Pengelola) */
                            <>
                                <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">Keterangan Pemilik / Pengelola</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Nama Pengelola"
                                            name="pengelola"
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
                                                name="alamat_pengelola"
                                                register={register}
                                                errors={errors}
                                            />
                                        </div>

                                        <FormInput
                                            label="RT / RW"
                                            name="rt_rw_pengelola"
                                            register={register}
                                            errors={errors}
                                        />

                                        <FormSelect
                                            label="Kabupaten"
                                            name="kabupaten_pengelola"
                                            register={register}
                                            errors={errors}
                                            options={listKabupaten}
                                        />

                                        <FormSelect
                                            label="Kecamatan"
                                            name="kecamatan_pengelola"
                                            register={register}
                                            errors={errors}
                                            options={listKecamatan}
                                        />

                                        <FormSelect
                                            label="Desa / Kelurahan"
                                            name="kelurahan_pengelola"
                                            register={register}
                                            errors={errors}
                                            options={listKelurahan}
                                        />

                                        <FormSelect
                                            label="Kode Pos"
                                            name="kodepos_pengelola"
                                            register={register}
                                            errors={errors}
                                            options={listKodePos}
                                        />

                                        <FormInput
                                            label="Nomor Telepon / WA Pengelola"
                                            name="telepon_pengelola"
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
                            <></>
                        )}

                        <FormInput label="Jalan / Komplek / No. Rumah" name="alamat_jalan" register={register} errors={errors} />

                        <FormInput label="RT / RW" name="rt_rw" register={register} errors={errors} />

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

                        <FormInput label="Nomor Telepon / WA" name="telepon" register={register} errors={errors} />

                        {/* Section 3: Data Teknis - Diubah Luas Bangunan untuk Semua */}
                        <div className="md:col-span-2 border-b pb-2 pt-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Informasi Teknis Bangunan
                            </h3>
                        </div>

                        <div className="md:col-span-2">
                            <FormInput
                                label={`Luas Bangunan ${type === 'badan' ? 'Badan Usaha' : ''} (m²)`}
                                name="luas"
                                type="number"
                                placeholder="Contoh: 150"
                                register={register}
                                errors={errors}
                            />
                            <p className="text-[10px] text-gray-400 mt-2 italic">
                                *Besaran retribusi akan dihitung berdasarkan luas bangunan sesuai peraturan daerah yang berlaku.
                            </p>
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
                        <button
                            type="submit"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.98]"
                        >
                            <Send size={20} /> Kirim Pendaftaran
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