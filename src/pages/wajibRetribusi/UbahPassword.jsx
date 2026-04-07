import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Lock, ShieldCheck, Eye, EyeOff,
    Loader2, Save, ArrowLeft, Info, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const schema = z.object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

const UbahPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.put('/subjek/ubah-password', {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });

            if (response.data.success) {
                alert("Sukses! Password Anda telah diperbarui.");
                reset();
                navigate('/dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Gagal mengubah password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 font-sans text-left">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                        Keamanan <span className="text-green-700">Akun</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Perbarui Kata Sandi Anda secara Berkala</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-900/40">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="font-black uppercase tracking-widest text-sm leading-none">Update Password</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Sistem Proteksi Wajib Retribusi</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 flex items-center gap-2"
                    >
                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                            {showPasswords ? 'Sembunyikan' : 'Lihat'}
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                    {/* Input Password Lama */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Saat Ini</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            {...register('oldPassword')}
                            className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm ${errors.oldPassword ? 'border-red-500' : 'border-gray-100 focus:border-slate-900'}`}
                            placeholder="Masukkan password sekarang"
                        />
                        {errors.oldPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.oldPassword.message}</p>}
                    </div>

                    <hr className="border-gray-50" />

                    {/* Input Password Baru */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                {...register('newPassword')}
                                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm ${errors.newPassword ? 'border-red-500' : 'border-gray-100 focus:border-green-600'}`}
                                placeholder="Min. 6 Karakter"
                            />
                            {errors.newPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.newPassword.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ulangi Kata Sandi</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                {...register('confirmPassword')}
                                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-100 focus:border-green-600'}`}
                                placeholder="Ketik ulang password baru"
                            />
                            {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                        <Info className="text-blue-600 shrink-0" size={20} />
                        <div className="text-left">
                            <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest leading-none mb-1">Tips Keamanan</h5>
                            <p className="text-[10px] text-blue-700 leading-relaxed font-medium italic">
                                Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk password yang lebih kuat. Jangan bagikan password Anda kepada siapapun termasuk petugas.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-green-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Simpan Password Baru
                    </button>
                </form>
            </div>

            {/* Warning Area */}
            <div className="px-4">
                <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle size={14} />
                    <p className="text-[9px] font-bold uppercase tracking-tighter">
                        Jika Anda lupa password lama, silakan hubungi Kantor UPT terdekat untuk reset identitas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UbahPassword;