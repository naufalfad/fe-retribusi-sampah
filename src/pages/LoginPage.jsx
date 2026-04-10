import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [npwrd, setNpwrd] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/login-subjek', {
                npwrd_subjek: npwrd,
                password_subjek: password
            });
            api.interceptors.request.use((config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            });

            // simpan token & user
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('subjek', JSON.stringify(res.data.user));

            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Wrapper utama dengan Background Image dari folder public
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/kebun-raya.png')" }}
        >
            {/* Overlay untuk memastikan konten tetap terbaca (Gunakan warna hijau gelap transparan agar senada) */}
            <div className="absolute inset-0 bg-green-950/60 backdrop-blur-[2px]"></div>

            <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-24 relative z-10">

                {/* SISI KIRI: Branding & Informasi */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                        <ShieldCheck size={14} /> Portal Resmi REKAS
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight drop-shadow-lg">
                        E-Retribusi Sampah <br />
                        <span className="text-green-400">REKAS</span>
                    </h1>

                    <p className="text-lg text-gray-100 max-w-md font-medium drop-shadow-md">
                        Sistem informasi pembayaran retribusi pelayanan persampahan dan kebersihan yang mudah, transparan, dan akuntabel.
                    </p>

                    <div className="pt-4">
                        {/* <button
                            onClick={() => navigate('/signUp')}
                            className="group relative flex items-center gap-4 bg-white/10 border-2 border-white/30 p-4 rounded-2xl hover:bg-white/20 hover:border-white transition-all duration-300 w-full md:w-auto backdrop-blur-md"
                        >
                            <div className="bg-white/20 group-hover:bg-green-500 p-3 rounded-xl text-white transition-colors">
                                <UserPlus size={24} />
                            </div>
                            <div className="text-left text-white">
                                <p className="text-xs font-medium opacity-80">Belum terdaftar?</p>
                                <p className="font-bold">Daftar Akun Baru</p>
                            </div>
                        </button> */}
                    </div>
                </div>

                {/* SISI KANAN: Card Login */}
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/20 relative overflow-hidden">
                        {/* Dekorasi Aksen */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 z-0"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-green-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-700/30">
                                    <LogIn size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Masuk</h2>
                                    <p className="text-sm text-gray-500 font-medium">Inputkan NPWRD dan Password Anda</p>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                        NPWRD
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Masukkan NPWRD"
                                        value={npwrd}
                                        onChange={(e) => setNpwrd(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all text-lg font-medium placeholder:text-gray-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Masukkan Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all text-lg font-medium placeholder:text-gray-300"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-700/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                                >
                                    {loading ? 'Loading...' : 'Masuk ke Dashboard'}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-400">
                                    Butuh bantuan teknis? <br className="md:hidden" />
                                    <a href="#" className="text-green-700 font-bold hover:underline">Hubungi Admin</a>
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