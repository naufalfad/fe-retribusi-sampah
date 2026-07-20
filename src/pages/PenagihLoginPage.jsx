import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, MapPin, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios'; // Pastikan path import benar

const PenagihLoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // KIRIM KE ROUTE BARU
            const response = await api.post('/auth/login-petugas-lapangan', {
                username: formData.username,
                password: formData.password
            });

            const { token, user } = response.data;

            // Simpan ke LocalStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Arahkan ke Dashboard Penagih
            navigate('/penagih/dashboard');

        } catch (err) {
            const message = err.response?.data?.message || 'Gagal terhubung ke server';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative font-sans"
            style={{ backgroundImage: "url('/kebun-raya.png')" }} // Sesuaikan dengan image folder public Anda
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-950/90 via-green-900/70 to-emerald-800/50 backdrop-blur-[3px]"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="bg-white w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-4 border-4 border-green-500/30">
                        <MapPin size={40} className="text-green-700 animate-bounce" />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-xl">
                        REKAS <span className="text-green-400 ">MOBILE</span>
                    </h1>
                    <p className="text-sm text-green-100 font-bold uppercase tracking-[0.2em] opacity-80">
                        Petugas Lapangan
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-white/20">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Otoritas Petugas Lapangan</h2>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Gunakan ID Petugas Anda</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in shake">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan ID Petugas"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kata Sandi</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-green-700 transition-colors animate-in fade-in"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-700 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Mulai Tugas <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PenagihLoginPage;