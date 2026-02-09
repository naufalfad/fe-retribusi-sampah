import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        'Lunas': 'bg-green-100 text-green-700 border-green-200',
        'Sudah Terbit': 'bg-green-100 text-green-700 border-green-200',
        'Belum Bayar': 'bg-red-100 text-red-700 border-red-200',
        'Belum Terbit': 'bg-red-100 text-red-700 border-red-200',
        'Ditolak': 'bg-red-100 text-red-700 border-red-200',
        'Proses Verifikasi': 'bg-blue-100 text-blue-700 border-blue-200',
        'paid': 'bg-green-100 text-green-700 border-green-200',
        'unpaid': 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default StatusBadge;