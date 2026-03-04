import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../api/axios';
import {
    MapPin, Mail, ChevronDown, User, CreditCard, Phone,
    ChevronLeft, Home, Navigation, Lock, Search,
    Building2, Send, Upload, FileText, IdCard, CheckCircle2, Info, Loader2
} from 'lucide-react';

// --- UI HELPER ---
const InputGroup = ({ label, icon: Icon, name, type = "text", placeholder, register, errors, touchedFields, currentStep }) => {
    // Error muncul jika: sudah disentuh (blur) ATAU jika di step terakhir (saat paksa submit)
    const hasError = errors[name] && (touchedFields[name] || currentStep === 4);

    return (
        <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${hasError ? 'text-red-500' : 'text-gray-400 group-focus-within:text-green-600'}`}>
                    <Icon size={18} />
                </div>
                <input
                    {...register(name)}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={type === "password" ? "new-password" : "off"}
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700
                        ${hasError ? 'border-red-500 bg-red-50/30' : 'border-gray-100 focus:border-green-700 focus:bg-white'}`}
                />
            </div>
            {hasError && <span className="text-[10px] text-red-500 font-bold ml-1 animate-in fade-in slide-in-from-top-1">{errors[name].message}</span>}
        </div>
    );
};

const SelectGroup = ({ label, icon: Icon, name, options, placeholder, register, errors, touchedFields, currentStep }) => {
    const hasError = errors[name] && (touchedFields[name] || currentStep === 2);
    return (
        <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600">
                    <Icon size={18} />
                </div>
                <select
                    {...register(name)}
                    className={`w-full pl-12 pr-10 py-3.5 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer
                    ${hasError ? 'border-red-500' : 'border-gray-100 focus:border-green-700'}`}
                >
                    <option value="">{placeholder}</option>
                    {options && options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {hasError && <span className="text-[10px] text-red-500 font-bold ml-1">{errors[name].message}</span>}
        </div>
    );
};

const FileUploadGroup = ({ label, icon: Icon, description, onChange, selectedFile }) => (
    <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <label className={`flex flex-col items-center justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-[2rem] cursor-pointer 
                ${selectedFile ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-100 hover:border-green-700'}`}>
            <div className="flex flex-col items-center justify-center">
                {selectedFile ? (
                    <>
                        <CheckCircle2 size={24} className="text-green-600 mb-2" />
                        <p className="text-[11px] font-bold text-green-700 truncate max-w-[200px]">{selectedFile.name}</p>
                    </>
                ) : (
                    <>
                        <div className="p-2 bg-white rounded-xl shadow-sm mb-2"><Icon size={20} className="text-gray-400" /></div>
                        <p className="text-[11px] font-bold text-gray-500">{description || "Klik untuk unggah"}</p>
                    </>
                )}
            </div>
            <input type="file" className="hidden" onChange={onChange} accept=".jpg,.png,.pdf" />
        </label>
    </div>
);

// --- VALIDATION SCHEMA (ZOD) ---
const signupSchema = z.object({
    nama_subjek: z.string().min(3, "Nama harus diisi"),
    nik: z.string().length(16, "NIK harus 16 digit"),
    whatsapp: z.string().min(10, "Nomor minimal 10 digit"),
    email: z.string().email("Email tidak valid").or(z.literal("")),
    penanggung_jawab: z.string().optional(),
    npwp_nib: z.string().optional(),
    alamat_jalan: z.string().min(5, "Alamat diperlukan"),
    rt_rw: z.string().min(1, "RT/RW diperlukan"),
    id_provinsi: z.string().min(1, "Pilih Provinsi"),
    id_kabupaten: z.string().min(1, "Pilih Kabupaten"),
    id_kecamatan: z.string().min(1, "Pilih Kecamatan"),
    id_kelurahan: z.string().min(1, "Pilih Kelurahan"),
    kodepos: z.string().min(1, "Kode Pos otomatis"),
    password: z.string().min(6, "Minimal 6 karakter"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

const steps = [
    { id: 1, label: "Identitas", icon: User },
    { id: 2, label: "Domisili", icon: MapPin },
    { id: 3, label: "Dokumen", icon: FileText },
    { id: 4, label: "Keamanan", icon: Send },
];

const FormTambahSubjek = ({ isStaff = false }) => {
    const navigate = useNavigate();
    const [type, setType] = useState('Pribadi');
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [provinsiOptions, setProvinsiOptions] = useState([]);
    const [kabupatenOptions, setKabupatenOptions] = useState([]);
    const [kecamatanOptions, setKecamatanOptions] = useState([]);
    const [kelurahanOptions, setKelurahanOptions] = useState([]);
    const [files, setFiles] = useState({
        ktp: null,
        npwp: null,
        nib: null,
        akte: null
    });

    const { register, handleSubmit, trigger, watch, setValue, formState: { errors, touchedFields } } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onBlur", // Validasi hanya saat pindah field
        reValidateMode: "onChange" // Tapi jika sudah error, langsung validasi saat mengetik agar error cepat hilang
    });

    const [allKelurahan, setAllKelurahan] = useState([]);
    const [filteredKelurahan, setFilteredKelurahan] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchLabel, setSearchLabel] = useState("");

    // Ambil ID kelurahan yang sedang dipilih untuk label UI
    const selectedKelId = watch('id_kelurahan');
    const activeKelData = allKelurahan.find(k => k.id === selectedKelId);

    // 1. Load Data Kelurahan (Hanya 1x saat mount)
    useEffect(() => {
        api.get('/wilayah/search-kelurahan?q=').then(res => {
            if (res.data.success) {
                setAllKelurahan(res.data.data);
                setFilteredKelurahan(res.data.data);
            }
        });
    }, []);

    // 2. Handler Pilih Kelurahan
    const handleSelectKelurahan = (kel) => {
        setValue('id_kelurahan', kel.id, { shouldValidate: true });
        setValue('id_kecamatan', kel.RefKecamatan?.id);
        setValue('id_kabupaten', kel.RefKecamatan?.RefKabupaten?.id);
        setValue('id_provinsi', kel.RefKecamatan?.RefKabupaten?.RefProvinsi?.id);
        setValue('kodepos', kel.kode_pos, { shouldValidate: true });

        setSearchLabel(kel.name);
        setIsDropdownOpen(false);
    };

    // Fungsi helper untuk update state file
    const handleFileSelection = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files[0] }));
        }
    };

    const backPath = () => isStaff ? navigate(-1) : "/login";

    // --- LOGIKA SUBMIT API ---
    const onSubmit = async (data) => {
        const token = localStorage.getItem('token');

        // Proteksi di sisi client
        if (!token) {
            alert("Sesi Anda telah berakhir. Silakan login kembali sebagai staff.");
            navigate("/login/staff");
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            const selectedKel = allKelurahan.find(k => k.id === data.id_kelurahan);

            // Mapping Data ke Field Backend
            formData.append('kategori_subjek', type);
            formData.append('nama_subjek', data.nama_subjek);
            formData.append('penanggung_jawab_subjek', data.penanggung_jawab || "");
            formData.append('npwp_subjek', data.npwp_nib || "");
            formData.append('nik_subjek', data.nik);
            formData.append('telepon_subjek', data.whatsapp);
            formData.append('email_subjek', data.email);
            formData.append('alamat_subjek', data.alamat_jalan);
            formData.append('rt_rw_subjek', data.rt_rw);
            formData.append('provinsi_subjek', selectedKel?.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || '');
            formData.append('kabupaten_subjek', selectedKel?.RefKecamatan?.RefKabupaten?.name || '');
            formData.append('kecamatan_subjek', selectedKel?.RefKecamatan?.name || '');
            formData.append('kelurahan_subjek', selectedKel?.name || '');
            formData.append('kode_pos_subjek', data.kodepos);
            formData.append('password_subjek', data.password);

            // Append Files (Multiple)
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    // Gunakan field name 'dokumen' agar sesuai dengan req.files di backend
                    formData.append('dokumen_subjek', files[key]);
                }
            });

            const response = await api.post(`/subjek/tambah-subjek`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert(response.data.message);
            backPath();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP NAVIGATION ---
    const nextStep = async () => {
        let fieldsToValidate = [];
        if (currentStep === 1) {
            fieldsToValidate = ['nik', 'whatsapp', 'email'];
            if (type === 'Badan') fieldsToValidate.push('nama_subjek', 'penanggung_jawab', 'npwp_nib');
        } else if (currentStep === 2) {
            fieldsToValidate = ['alamat_jalan', 'rt_rw', 'id_provinsi', 'id_kabupaten', 'id_kecamatan', 'id_kelurahan', 'kodepos'];
        } else if (currentStep === 3) {
            if (type === 'Pribadi' && !files.ktp) return alert("Scan KTP wajib diunggah");
            if (type === 'Badan' && (!files.ktp || !files.npwp || !files.nib)) return alert("Dokumen wajib dilengkapi");
        }

        if (fieldsToValidate.length > 0) {
            const isValid = await trigger(fieldsToValidate);
            if (isValid) setCurrentStep((prev) => prev + 1);
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => setCurrentStep((prev) => prev - 1);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans">

            <div className="w-full max-w-4xl mb-6">
                <button onClick={backPath} className="flex items-center gap-2 text-gray-500 hover:text-green-700 font-bold transition-colors text-sm group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </button>
            </div>

            <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">

                {/* HEADER */}
                <div className={`${isStaff ? 'bg-gray-900' : 'bg-green-700'} p-8 text-white text-center`}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {isStaff ? 'Pendaftaran Akun Subjek (NPWRD)' : 'Pendaftaran Akun Baru'}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">Lengkapi data diri untuk layanan REKAS</p>
                </div>

                <div className="p-8 md:p-14">

                    {/* STEPPER */}
                    <div className="relative mb-14 px-4 max-w-2xl mx-auto flex justify-between">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm
                                    ${currentStep >= step.id ? 'bg-green-700 text-white' : 'bg-gray-50 text-gray-300'}`}>
                                    {currentStep > step.id ? <CheckCircle2 size={20} /> : <step.icon size={18} />}
                                </div>
                                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                        {/* Line Background */}
                        <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 -z-10 mx-10"></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* STEP 1: IDENTITAS */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 max-w-md mx-auto">
                                    <button type="button" onClick={() => setType('Pribadi')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'Pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}><User size={18} /> Pribadi</button>
                                    <button type="button" onClick={() => setType('Badan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'Badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}><Building2 size={18} /> Badan / Usaha</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {type === 'Pribadi' ? (
                                        <div className="md:col-span-2">
                                            <InputGroup label="Nama Sesuai KTP" icon={User} name="nama_subjek" placeholder="Masukkan nama lengkap" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                        </div>
                                    ) : (
                                        <>
                                            <InputGroup label="Nama Badan Usaha / Merek" icon={Building2} name="nama_subjek" placeholder="Contoh: PT. Maju Jaya" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                            <InputGroup label="NPWP" icon={CreditCard} name="npwp_nib" placeholder="NPWP Perusahaan" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                            <div className="md:col-span-2">
                                                <InputGroup label="Penanggung Jawab" icon={User} name="penanggung_jawab" placeholder="Nama Penanggung Jawab" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                            </div>
                                        </>
                                    )}
                                    <InputGroup label="NIK (KTP)" icon={IdCard} name="nik" placeholder="16 Digit NIK" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                    <InputGroup label="Nomor WhatsApp" icon={Phone} name="whatsapp" placeholder="0812xxxx" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                    <div className="md:col-span-2">
                                        <InputGroup label="Alamat Email (Opsional)" icon={Mail} name="email" type="email" placeholder="nama@email.com" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DOMISILI */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <InputGroup label="Alamat Jalan / No. Rumah" icon={Home} name="alamat_jalan" placeholder="Contoh: Jl. Raya Pemda No. 123" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="RT / RW" icon={Navigation} name="rt_rw" placeholder="001/002" register={register} errors={errors} touchedFields={touchedFields} currentStep={currentStep} />
                                    <div className="md:col-span-2 relative text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cari Kelurahan / Desa</label>
                                        <div className="relative group mt-1.5">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Search size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Klik untuk pilih atau ketik nama desa..."
                                                value={searchLabel}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                onChange={(e) => {
                                                    setSearchLabel(e.target.value);
                                                    setFilteredKelurahan(allKelurahan.filter(k => k.name.toLowerCase().includes(e.target.value.toLowerCase())));
                                                }}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-sm font-bold text-gray-700 ${errors.id_kelurahan ? 'border-red-500' : 'border-gray-100 focus:border-green-700'}`}
                                            />

                                            {isDropdownOpen && (
                                                <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                                    {filteredKelurahan.map((kel) => (
                                                        <div key={kel.id} onClick={() => handleSelectKelurahan(kel)} className="p-4 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                                            <p className="text-sm font-black text-gray-800 uppercase">{kel.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Kec. {kel.RefKecamatan?.name} • Kab. {kel.RefKecamatan?.RefKabupaten?.name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* INFO PANEL (AUTO-FILL) */}
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kecamatan</label>
                                            <p className="text-xs font-black text-gray-700 uppercase">{activeKelData?.RefKecamatan?.name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kabupaten</label>
                                            <p className="text-xs font-black text-gray-700 uppercase">{activeKelData?.RefKecamatan?.RefKabupaten?.name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Provinsi</label>
                                            <p className="text-xs font-black text-gray-700 uppercase">{activeKelData?.RefKecamatan?.RefKabupaten?.RefProvinsi?.name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Kode Pos</label>
                                            <p className="text-xs font-black text-green-700 uppercase">{activeKelData?.kode_pos || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DOKUMEN */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {type === 'Pribadi' ? (
                                    <FileUploadGroup
                                        label="Scan KTP Asli"
                                        icon={Upload}
                                        description="Unggah foto KTP pemohon"
                                        selectedFile={files.ktp}
                                        onChange={(e) => handleFileSelection(e, 'ktp')}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                        <FileUploadGroup
                                            label="KTP Penanggung jawab"
                                            icon={Upload}
                                            selectedFile={files.ktp}
                                            onChange={(e) => handleFileSelection(e, 'ktp')}
                                        />
                                        <FileUploadGroup
                                            label="NPWP Badan"
                                            icon={CreditCard}
                                            selectedFile={files.npwp}
                                            onChange={(e) => handleFileSelection(e, 'npwp')}
                                        />
                                        <FileUploadGroup
                                            label="Dokumen Pendirian"
                                            icon={FileText}
                                            description="Unggah NIB"
                                            selectedFile={files.nib}
                                            onChange={(e) => handleFileSelection(e, 'nib')}
                                        />
                                        <FileUploadGroup
                                            label="Akte Pendirian"
                                            icon={FileText}
                                            description="Unggah Akte Pendirian"
                                            selectedFile={files.akte}
                                            onChange={(e) => handleFileSelection(e, 'akte')}
                                        />
                                        {/* <div className="md:col-span-2">
                                            <FileUploadGroup
                                                label="Dokumen Pendirian"
                                                icon={FileText}
                                                description="Unggah NIB"
                                                selectedFile={files.pendirian}
                                                onChange={(e) => handleFileSelection(e, 'nib')}
                                            />
                                        </div> */}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: KEAMANAN */}
                        {currentStep === 4 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                <InputGroup
                                    label="Password Baru"
                                    icon={Lock}
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    register={register}
                                    errors={errors}
                                    touchedFields={touchedFields}
                                    currentStep={currentStep}
                                />
                                <InputGroup
                                    label="Konfirmasi Password"
                                    icon={Lock}
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    register={register}
                                    errors={errors}
                                    touchedFields={touchedFields}
                                    currentStep={currentStep}
                                />
                            </div>
                        )}

                        {/* TOMBOL NAVIGASI */}
                        <div className="flex gap-4 pt-8">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-black py-5 rounded-[1.5rem] uppercase text-xs">Kembali</button>
                            )}

                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="flex-[2] bg-green-700 text-white font-black py-5 rounded-[1.5rem] uppercase text-xs">Lanjut</button>
                            ) : (
                                <button type="submit" disabled={isLoading} className="flex-[2] bg-green-700 text-white font-black py-5 rounded-[1.5rem] uppercase text-xs flex items-center justify-center gap-2 shadow-xl shadow-green-900/20">
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    {isStaff ? 'Selesaikan Akun' : 'Daftar Sekarang'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormTambahSubjek;