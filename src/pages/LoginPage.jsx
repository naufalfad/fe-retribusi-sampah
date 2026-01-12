import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        // Wrapper utama: Menjamin konten di tengah secara vertikal & horizontal
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">

            <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-24">

                {/* SISI KIRI: Branding & Informasi */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck size={14} /> Official Portal DLH
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        E-Retribusi Sampah <br />
                        <span className="text-green-700">Kabupaten Bogor</span>
                    </h1>

                    <p className="text-lg text-gray-600 max-w-md">
                        Sistem informasi pembayaran retribusi pelayanan persampahan dan kebersihan yang mudah, transparan, dan akuntabel.
                    </p>

                    <div className="pt-4">
                        <button
                            onClick={() => navigate('/daftar')}
                            className="group relative flex items-center gap-4 bg-white border-2 border-gray-200 p-4 rounded-2xl hover:border-green-600 hover:shadow-xl transition-all duration-300 w-full md:w-auto"
                        >
                            <div className="bg-gray-100 group-hover:bg-green-100 p-3 rounded-xl text-gray-500 group-hover:text-green-700 transition-colors">
                                <UserPlus size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500 font-medium">Belum terdaftar?</p>
                                <p className="font-bold text-gray-800">Daftar Wajib Retribusi Baru</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* SISI KANAN: Card Login */}
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-green-900/10 p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                        {/* Dekorasi Aksen */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 z-0 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-700/30">
                                    <LogIn size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Masuk</h2>
                                    <p className="text-sm text-gray-500 font-medium">Gunakan NPWRD Anda</p>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                        NPWRD
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: 1.02.01.XXXXXXXX"
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all text-lg font-medium placeholder:text-gray-300"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-700/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                                >
                                    Masuk ke Dashboard
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-400">
                                    Butuh bantuan teknis? <br className="md:hidden" />
                                    <a href="#" className="text-green-700 font-bold hover:underline">Hubungi Layanan DLH</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;