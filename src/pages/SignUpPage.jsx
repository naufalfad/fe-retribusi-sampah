import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Mail, ChevronDown, User, CreditCard, Phone,
    ArrowRight, ChevronLeft, Home, Navigation, Lock, ShieldCheck,
    Building2, Send, Upload, FileText, IdCard, CheckCircle2
} from 'lucide-react';

const SignupPage = ({ isStaff = false }) => {
    const navigate = useNavigate();
    const [type, setType] = useState('pribadi');

    // --- 1. TAMBAHKAN STATE STEP ---
    const [currentStep, setCurrentStep] = useState(1);

    const backConfig = isStaff
        ? { label: "Kembali ke Verifikasi", path: "/upt/verifikasi" }
        : { label: "Kembali ke Login", path: "/login" };

    const listKabupaten = ["Kabupaten Bogor", "Kota Bogor"];
    const listKecamatan = ["Cibinong", "Babakan Madang", "Bojonggede", "Ciampea", "Ciawi"];
    const listKelurahan = ["Pakansari", "Cibinong", "Sukahati", "Harapan Jaya"];
    const listKodePos = ["16911", "16912", "16913", "16914", "16915"];

    // --- 2. LOGIKA NAVIGASI STEP ---
    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => prev - 1);

    const InputGroup = ({ label, icon: Icon, type = "text", placeholder }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                    <Icon size={18} />
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 focus:bg-white outline-none transition-all text-sm font-bold text-gray-700"
                />
            </div>
        </div>
    );

    const SelectGroup = ({ label, icon: Icon, options, placeholder }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                    <Icon size={18} />
                </div>
                <select className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 focus:bg-white outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer">
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>
    );

    const FileUploadGroup = ({ label, icon: Icon, description }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-50 border-2 border-gray-100 border-dashed rounded-[2rem] hover:bg-white hover:border-green-700 cursor-pointer group/upload">
                    <div className="flex flex-col items-center justify-center pt-2">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover/upload:bg-green-50 transition-colors mb-2">
                            <Icon size={20} className="text-gray-400 group-hover/upload:text-green-700" />
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 group-hover/upload:text-green-700">{description || "Klik untuk unggah dokumen"}</p>
                        <p className="text-[9px] text-gray-400 mt-1 italic uppercase tracking-tighter">JPG, PNG, atau PDF (Maks. 2MB)</p>
                    </div>
                    <input type="file" className="hidden" />
                </label>
            </div>
        </div>
    );

    const steps = [
        { id: 1, label: "Identitas", icon: User },
        { id: 2, label: "Domisili", icon: MapPin },
        { id: 3, label: "Dokumen", icon: FileText },
        { id: 4, label: "Keamanan", icon: Send },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative font-sans" style={{ backgroundImage: "url('/kebun-raya.png')" }}>
            <div className="absolute inset-0 bg-green-950/70 backdrop-blur-[2px]"></div>
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-white/20">

                {/* SISI KIRI (Sidebar) */}
                <div className="hidden lg:flex lg:col-span-4 flex-col justify-between p-12 bg-green-800 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <button onClick={() => navigate(backConfig.path)} className="flex items-center gap-2 text-green-200 hover:text-white transition-colors mb-16 font-bold text-sm group">
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            {backConfig.label}
                        </button>
                        <div className="space-y-6">
                            <div className="bg-white/10 w-fit p-3 rounded-2xl border border-white/10">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-4xl font-black leading-tight tracking-tighter italic">Bergabung <br /> Bersama SIRESIK.</h2>
                            <p className="text-green-100/70 text-sm leading-relaxed">
                                {type === 'pribadi' ? 'Kelola retribusi kebersihan rumah tinggal Anda dengan lebih mudah.' : 'Solusi manajemen retribusi sampah untuk badan usaha dan komersial.'}
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 pt-10 border-t border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50 mb-1">Kabupaten Bogor</p>
                        <p className="text-xs font-bold tracking-tighter uppercase">Dinas Lingkungan Hidup</p>
                    </div>
                </div>

                {/* SISI KANAN (Form) */}
                <div className="lg:col-span-8 p-8 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">{isStaff ? 'Pendaftaran Akun (UPT)' : 'Pendaftaran Akun'}</h2>
                        <p className="text-gray-500 font-medium mt-1">Proses langkah ke {currentStep} dari 4</p>
                    </div>

                    {/* --- PROGRESS STEPPER */}
                    <div className="relative mb-12 px-4">
                        {/* Garis Latar (Gray) */}
                        <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-100 z-0 mx-10"></div>

                        {/* Garis Progress (Green) - Dinamis berdasarkan step */}
                        <div
                            className="absolute top-5 left-0 h-[2px] bg-green-700 z-0 mx-10 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 88}%` }}
                        ></div>

                        <div className="flex justify-between relative z-10">
                            {steps.map((step) => (
                                <div key={step.id} className="flex flex-col items-center group">
                                    {/* Lingkaran Ikon */}
                                    <div className={`
                    w-11 h-11 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm
                    ${currentStep >= step.id
                                            ? 'bg-green-700 text-white shadow-green-200'
                                            : 'bg-gray-50 text-gray-300'}
                `}>
                                        {/* Jika step sudah lewat, munculkan Check, jika belum munculkan Ikon asli */}
                                        {currentStep > step.id ? (
                                            <CheckCircle2 size={20} />
                                        ) : (
                                            <step.icon size={18} />
                                        )}
                                    </div>

                                    {/* Label Text */}
                                    <span className={`
                    mt-3 text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500
                    ${currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'}
                `}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form className="space-y-8">
                        {/* STEP 1: IDENTITAS */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                                    <button type="button" onClick={() => setType('pribadi')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'pribadi' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}><User size={18} /> Pribadi</button>
                                    <button type="button" onClick={() => setType('badan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'badan' ? 'bg-white shadow-md text-green-700 font-bold' : 'text-gray-500'}`}><Building2 size={18} /> Badan / Usaha</button>
                                </div>

                                {type === 'pribadi' ? (
                                    <InputGroup label="Nama Sesuai KTP" icon={User} placeholder="Masukkan nama lengkap" />
                                ) : (
                                    <>
                                        <InputGroup label="Nama Badan Usaha / Merek" icon={Building2} placeholder="Contoh: PT. Maju Jaya" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Penanggung Jawab" icon={User} placeholder="Nama pengelola" />
                                            <InputGroup label="NPWP / NIB" icon={CreditCard} placeholder="Nomor resmi" />
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="NIK (KTP)" icon={IdCard} placeholder="16 Digit NIK" />
                                    <InputGroup label="Nomor WhatsApp" icon={Phone} placeholder="0812xxxx" />
                                </div>
                                <InputGroup label="Alamat Email" icon={Mail} type="email" placeholder="nama@email.com" />
                            </div>
                        )}

                        {/* STEP 2: ALAMAT */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <InputGroup label="Alamat Jalan / No. Rumah" icon={Home} placeholder="Contoh: Jl. Raya Pemda No. 123" />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="RT / RW" icon={Navigation} placeholder="001/002" />
                                    <SelectGroup label="Kabupaten" icon={MapPin} options={listKabupaten} placeholder="Pilih Kabupaten" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectGroup label="Kecamatan" icon={MapPin} options={listKecamatan} placeholder="Pilih Kecamatan" />
                                    <SelectGroup label="Kelurahan" icon={MapPin} options={listKelurahan} placeholder="Pilih Desa" />
                                </div>
                                <SelectGroup label="Kode Pos" icon={Navigation} options={listKodePos} placeholder="Pilih Kode Pos" />
                            </div>
                        )}

                        {/* STEP 3: DOKUMEN */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {type === 'pribadi' ? (
                                    <FileUploadGroup label="Scan KTP Asli" icon={Upload} description="Unggah foto KTP pemohon" />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FileUploadGroup label="KTP Pengelola" icon={Upload} />
                                        <FileUploadGroup label="NPWP Badan" icon={Upload} />
                                        <div className="md:col-span-2"><FileUploadGroup label="Dokumen Pendirian" icon={FileText} description="NIB atau SIUP" /></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: KEAMANAN */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                    <InputGroup label="Password" icon={Lock} type="password" placeholder="••••••••" />
                                    <InputGroup label="Konfirmasi Password" icon={Lock} type="password" placeholder="••••••••" />
                                </div>
                                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 mt-10">
                                    <p className="text-xs font-bold text-blue-700 leading-relaxed">
                                        Pastikan semua data yang diisi sudah benar sebelum menyelesaikan pendaftaran. Data akan diverifikasi oleh petugas UPT terkait.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- 4. TOMBOL NAVIGASI BAWAH --- */}
                        <div className="flex gap-4 pt-6">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                                    <ChevronLeft size={18} /> Kembali
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="flex-[2] bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                                    Lanjut <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button type="button" onClick={() => navigate(backConfig.path)} className="flex-[2] bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                                    {isStaff ? 'Selesaikan Akun' : 'Daftar Sekarang'} <ArrowRight size={18} />
                                </button>
                            )}
                        </div>

                        {!isStaff && currentStep === 1 && (
                            <p className="mt-8 text-center text-sm font-bold text-gray-400">
                                Sudah punya akun? <Link to="/login" className="text-green-700 hover:underline ml-1">Masuk</Link>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;