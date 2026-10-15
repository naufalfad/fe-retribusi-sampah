import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Home, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatistikPanel({ objekList = [] }) {
    const stats = useMemo(() => {
        const total = objekList.length;
        const rumah = objekList.filter((o) => o.kategori_objek === 'Rumah Tinggal').length;
        const nonRumah = objekList.filter((o) => o.kategori_objek === 'Non Rumah Tinggal').length;
        const potentialRevenue = objekList.reduce(
            (acc, curr) => acc + (Number(curr.tarif_pokok_objek) || 0),
            0
        );

        let unpaidCount = 0;
        let paidCount = 0;
        objekList.forEach((o) => {
            const hasUnpaid = o.Skrds?.some((s) => s.status?.toLowerCase() === 'unpaid');
            if (hasUnpaid) unpaidCount++;
            else paidCount++;
        });

        // Agregasi per kecamatan
        const kecMap = {};
        objekList.forEach((o) => {
            const kec = o.kecamatan_objek || 'Lainnya';
            kecMap[kec] = (kecMap[kec] || 0) + 1;
        });

        const topKecamatan = Object.entries(kecMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            total,
            rumah,
            nonRumah,
            potentialRevenue,
            unpaidCount,
            paidCount,
            topKecamatan,
        };
    }, [objekList]);

    return (
        <div className="flex flex-col h-full bg-white font-sans text-left pb-10 select-none overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="px-5 py-3.5 bg-emerald-50/40 border-b border-slate-100 flex items-start gap-2.5">
                <BarChart3 size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    Ringkasan analitik sebaran objek dan potensi pendapatan retribusi pelayanan kebersihan.
                </p>
            </div>

            {/* Total Potential Hero Card */}
            <div className="p-5 bg-slate-900 text-white flex flex-col gap-1 border-b border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Estimasi Potensi Retribusi Bulanan
                </span>
                <span className="text-2xl font-mono font-bold text-white tracking-tight">
                    Rp {stats.potentialRevenue.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                    Akumulasi tarif pokok seluruh {stats.total} objek terdaftar
                </span>
            </div>

            {/* Breakdown Sektor */}
            <div className="p-5 flex flex-col gap-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Sebaran Berdasarkan Kategori
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase">
                            <Home size={12} /> Rumah Tinggal
                        </div>
                        <span className="text-xl font-mono font-bold text-emerald-900">
                            {stats.rumah}
                        </span>
                        <span className="text-[9px] text-emerald-700">
                            {stats.total ? Math.round((stats.rumah / stats.total) * 100) : 0}% dari total
                        </span>
                    </div>

                    <div className="p-3 bg-blue-50/50 border border-blue-200 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-bold uppercase">
                            <Building2 size={12} /> Non Rumah
                        </div>
                        <span className="text-xl font-mono font-bold text-blue-900">
                            {stats.nonRumah}
                        </span>
                        <span className="text-[9px] text-blue-700">
                            {stats.total ? Math.round((stats.nonRumah / stats.total) * 100) : 0}% dari total
                        </span>
                    </div>
                </div>
            </div>

            {/* Rekap Kepatuhan */}
            <div className="p-5 flex flex-col gap-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Status Kepatuhan SKRD
                </h4>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 size={13} /> Tertib & Lunas
                        </span>
                        <span className="font-mono font-bold">{stats.paidCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 overflow-hidden">
                        <div
                            className="bg-emerald-600 h-full"
                            style={{
                                width: `${stats.total ? (stats.paidCount / stats.total) * 100 : 0}%`,
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium mt-1">
                        <span className="flex items-center gap-1.5 text-rose-700">
                            <AlertCircle size={13} /> Belum Lunas (Nunggak)
                        </span>
                        <span className="font-mono font-bold">{stats.unpaidCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 overflow-hidden">
                        <div
                            className="bg-rose-600 h-full"
                            style={{
                                width: `${stats.total ? (stats.unpaidCount / stats.total) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Top 5 Kecamatan */}
            <div className="p-5 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Top 5 Wilayah dengan Objek Terbanyak
                </h4>

                <div className="flex flex-col divide-y divide-slate-100 border border-slate-200">
                    {stats.topKecamatan.map(([kec, count], idx) => (
                        <div key={kec} className="flex items-center justify-between px-3 py-2 text-xs">
                            <span className="font-medium text-slate-700">
                                {idx + 1}. Kec. {kec}
                            </span>
                            <span className="font-mono font-bold text-emerald-800">{count} Objek</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
