import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

const StaffLoginPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('UPT'); // Default role untuk simulasi

    const handleLogin = (e) => {
        e.preventDefault();
        // Logika login berdasarkan role
        if (role === 'UPT') navigate('/upt/dashboard');
        else if (role === 'DLH') navigate('/dlh/dashboard');
        else navigate('/bendahara/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="bg-green-700 w-16 h-16 rounded-2xl shadow-xl shadow-green-900/20 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Portal Internal</h1>
                    <p className="text-sm text-gray-500 font-medium">Sistem Retribusi Sampah Kab. Bogor</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100">
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

                        {/* Role Switcher (Hanya untuk keperluan development/demo) */}
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest">Role Akses</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-4 bg-gray-100 border-none rounded-2xl text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="UPT">Petugas UPT</option>
                                <option value="DLH">Bidang / Dinas (DLH)</option>
                                <option value="Bendahara">Bendahara Penerimaan</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            Masuk ke Sistem <ArrowRight size={18} />
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-xs text-gray-400 font-medium italic">
                    &copy; 2026 Dinas Lingkungan Hidup Kabupaten Bogor <br />
                    Keamanan data adalah prioritas kami.
                </p>
            </div>
        </div>
    );
};

export default StaffLoginPage;