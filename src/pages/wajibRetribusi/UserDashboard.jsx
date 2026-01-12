import React from 'react';
import { FileStack, CreditCard, Receipt, Clock } from 'lucide-react';

const UserDashboard = () => {
    // Data dummy untuk tampilan
    const stats = [
        { label: 'SKRD Terbit', value: '1', icon: <FileStack className="text-blue-600" />, bg: 'bg-blue-100' },
        { label: 'Belum Dibayar', value: 'Rp 50.000', icon: <Clock className="text-orange-600" />, bg: 'bg-orange-100' },
        { label: 'Total Bayar', value: 'Rp 250.000', icon: <Receipt className="text-green-600" />, bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Profile */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Selamat Datang,</p>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">PT. MAJU BERSAMA JAYA</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">NPWRD: 4.1.2.01.02.000001</span>
                    </div>
                </div>
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors">
                    Lihat Profil
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${item.bg}`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                            <p className="text-xl font-bold text-gray-800">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Menu Utama Modul */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                    <FileStack size={40} className="text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary">Ketetapan Retribusi (SKRD)</h3>
                    <p className="text-gray-500 text-sm">Lihat daftar tagihan bulanan Anda yang diterbitkan oleh DLH.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                    <CreditCard size={40} className="text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary">Pembayaran & SSRD</h3>
                    <p className="text-gray-500 text-sm">Upload bukti bayar dan unduh Surat Setoran Retribusi Daerah (SSRD).</p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;