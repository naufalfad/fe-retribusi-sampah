import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const StaffLoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Jauh lebih rapi daripada fetch!
            const response = await api.post('/auth/login-staff', {
                username,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            const role = user.role.toLowerCase();
            if (role === 'upt') navigate('/upt/dashboard');
            else if (role === 'dlh') navigate('/dlh/dashboard');
            else if (role === 'bendahara') navigate('/bendahara/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'penagih') navigate('/penagih/dashboard');

        } catch (err) {
            const message = err.response?.data?.message || 'Terjadi kesalahan koneksi';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/kebun-raya.png')" }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <div className="bg-green-700 w-16 h-16 rounded-2xl shadow-xl shadow-green-900/40 flex items-center justify-center mx-auto mb-4 border-2 border-white/20">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">
                        Portal Internal REKAS
                    </h1>
                    <p className="text-sm text-gray-200 font-medium drop-shadow-sm">
                        Sistem Elektronik Retribusi Persampahan
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 border border-white/20">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-widest">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan Password"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-700/5 focus:border-green-700 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-green-700 transition-colors animate-in fade-in"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:bg-gray-400"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Masuk ke Sistem"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-xs text-gray-300 font-medium  drop-shadow-sm">
                    &copy; 2026 Dinas Lingkungan Hidup Kabupaten Bogor <br />
                    Keamanan data adalah prioritas kami.
                </p>
            </div>
        </div>
    );
};

export default StaffLoginPage;