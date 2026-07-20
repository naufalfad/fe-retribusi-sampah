import React from 'react';
import { Layers, Building2, BarChart3, Info } from 'lucide-react';

const GisSidebar = ({ activePanel, setActivePanel }) => {
    const items = [
        { id: 'layers', icon: Layers, label: 'Layers', tooltip: 'Konfigurasi Layer & Basemap' },
        { id: 'objects', icon: Building2, label: 'Objek', tooltip: 'Daftar & Cari Objek Retribusi' },
        { id: 'stats', icon: BarChart3, label: 'Statistik', tooltip: 'Statistik Ringkas Retribusi' },
        { id: 'about', icon: Info, label: 'Info', tooltip: 'Tentang GIS REKAS' },
    ];

    const handleItemClick = (id) => {
        if (activePanel === id) {
            setActivePanel(null); // Tutup jika diklik ulang
        } else {
            setActivePanel(id);
        }
    };

    return (
        <aside className="absolute bottom-0 top-16 left-0 w-16 bg-white border-r border-gray-200 z-[1000] flex flex-col items-center py-4 select-none pointer-events-auto">
            <div className="flex-1 flex flex-col gap-2 w-full">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePanel === item.id;

                    return (
                        <div key={item.id} className="relative group w-full flex justify-center">
                            <button
                                onClick={() => handleItemClick(item.id)}
                                className={`w-full h-14 flex flex-col items-center justify-center gap-1 transition-colors relative active:bg-slate-100 cursor-pointer outline-none border-l-4
                                    ${isActive
                                        ? 'bg-green-50 text-green-700 border-green-700 font-bold'
                                        : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-800 border-transparent'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[8px] font-black uppercase tracking-wider">
                                    {item.label}
                                </span>
                            </button>

                            {/* Tooltip */}
                            <div className="hidden md:block absolute top-1/2 left-full -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                                {item.tooltip}
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default GisSidebar;
