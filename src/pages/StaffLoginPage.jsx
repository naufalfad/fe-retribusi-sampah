import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

const StaffLoginPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('UPT');

    const handleLogin = (e) => {
        e.preventDefault();
        if (role === 'UPT') navigate('/upt/dashboard');
        else if (role === 'DLH') navigate('/dlh/dashboard');
        else if (role === 'Bendahara') navigate('/bendahara/dashboard');
        else navigate('/admin/dashboard');
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/taman-bogor.png')" }}
        >
            {/* Overlay Gelap agar Form Login Terlihat Jelas & Estetik */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="bg-green-700 w-16 h-16 rounded-2xl shadow-xl shadow-green-900/40 flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    {/* Teks diubah ke putih/gray-100 agar kontras dengan background gambar */}
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">
                        Portal Internal SIRESIK
                    </h1>
                    <p className="text-sm text-gray-200 font-medium drop-shadow-sm">
                        Sistem Retribusi Integrasi Kota Bogor
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 border border-white/20">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Masukkan Username"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="Masukkan Password"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Switcher */}
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest">Role Akses</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-4 bg-gray-100 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-700"
                            >
                                <option value="UPT">Petugas UPT</option>
                                <option value="DLH">Bidang / Dinas (DLH)</option>
                                <option value="Bendahara">Bendahara Penerimaan</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            Masuk ke Sistem <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                {/* Footer Login diubah warnanya agar terlihat di atas background gelap */}
                <p className="text-center mt-8 text-xs text-gray-300 font-medium italic drop-shadow-sm">
                    &copy; 2026 Dinas Lingkungan Hidup Kota Bogor <br />
                    Keamanan data adalah prioritas kami.
                </p>
            </div>
        </div>
    );
};

export default StaffLoginPage;