import React from 'react';
import { X } from 'lucide-react';
import { useGisUIStore } from '../../../../store/useGisUIStore';

// Import Panels
import LayerPanel from './panels/LayerPanel';
import ObjekPanel from './panels/ObjekPanel';
import DetailPanel from './panels/DetailPanel';
import TempatSampahDetailPanel from './panels/TempatSampahDetailPanel';
import BasemapPanel from './panels/BasemapPanel';
import StatistikPanel from './panels/StatistikPanel';
import TentangPanel from './panels/TentangPanel';

export default function PanelOrchestrator({ objekList = [] }) {
    const { activePanels, closePanel, closePanelsToTheRight } = useGisUIStore();

    if (!activePanels || activePanels.length === 0) return null;

    const getPanelWidth = (type) => {
        if (type === 'detil-objek' || type === 'detil-tempat-sampah') return 390;
        return 360;
    };

    const getPanelCategoryLabel = (type) => {
        switch (type) {
            case 'layers':
                return 'LAYER DATA';
            case 'katalog-objek':
                return 'KATALOG OBJEK';
            case 'detil-objek':
                return 'DETAIL OBJEK RETRIBUSI';
            case 'detil-tempat-sampah':
                return 'DETAIL FASILITAS SAMPAH';
            case 'basemap-gallery':
                return 'PETA DASAR';
            case 'statistik':
                return 'ANALITIK RETRIBUSI';
            case 'tentang':
                return 'INFORMASI';
            default:
                return 'PANEL';
        }
    };

    const renderPanelContent = (type, data) => {
        switch (type) {
            case 'layers':
                return <LayerPanel />;
            case 'katalog-objek':
                return <ObjekPanel objekList={objekList} />;
            case 'detil-objek':
                return <DetailPanel data={data} />;
            case 'detil-tempat-sampah':
                return <TempatSampahDetailPanel data={data} />;
            case 'basemap-gallery':
                return <BasemapPanel />;
            case 'statistik':
                return <StatistikPanel objekList={objekList} />;
            case 'tentang':
                return <TentangPanel />;
            default:
                return <div className="p-4 text-xs text-slate-400">Modul belum tersedia.</div>;
        }
    };

    return (
        <div className="absolute top-16 bottom-0 left-16 z-30 pointer-events-auto flex items-start">
            {activePanels.map((panel, index) => {
                const isFloating = panel.type === 'detil-objek' || panel.type === 'detil-tempat-sampah';
                const currentWidth = getPanelWidth(panel.type);

                // Hitung offset docked
                let dockedOffset = 0;
                for (let i = 0; i < index; i++) {
                    const p = activePanels[i];
                    if (p.type !== 'detil-objek' && p.type !== 'detil-tempat-sampah') {
                        dockedOffset += getPanelWidth(p.type);
                    }
                }

                // Hitung posisi floating jika ada panel docked
                let totalDockedWidth = 0;
                activePanels.forEach((p) => {
                    if (p.type !== 'detil-objek' && p.type !== 'detil-tempat-sampah') {
                        totalDockedWidth += getPanelWidth(p.type);
                    }
                });

                const floatingLeft = totalDockedWidth + 16;

                return (
                    <div
                        key={panel.id}
                        className={`absolute pointer-events-auto transition-all duration-300 ease-in-out bg-white overflow-hidden flex flex-col ${
                            isFloating
                                ? 'shadow-2xl border border-slate-200 rounded-none'
                                : 'border-r border-slate-200 shadow-none rounded-none'
                        }`}
                        style={
                            isFloating
                                ? {
                                      left: `${floatingLeft}px`,
                                      top: '16px',
                                      bottom: '16px',
                                      width: `${currentWidth}px`,
                                      maxWidth: 'calc(100vw - 100px)',
                                      zIndex: 50,
                                  }
                                : {
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: `${currentWidth}px`,
                                      transform: `translateX(${dockedOffset}px)`,
                                      zIndex: 40 - index,
                                  }
                        }
                    >
                        {/* Header Panel */}
                        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0 select-none text-left">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-700 leading-none uppercase tracking-wider">
                                    {getPanelCategoryLabel(panel.type)}
                                </span>
                                {panel.data?.nama_tempat ? (
                                    <h3 className="text-xs font-bold text-slate-800 truncate max-w-[240px] tracking-tight mt-1 leading-none">
                                        {panel.data.nama_tempat}
                                    </h3>
                                ) : panel.data?.nama_objek ? (
                                    <h3 className="text-xs font-bold text-slate-800 truncate max-w-[240px] tracking-tight mt-1 leading-none">
                                        {panel.data.nama_objek}
                                    </h3>
                                ) : (
                                    <h3 className="text-xs font-bold text-slate-700 truncate max-w-[240px] tracking-tight mt-1 leading-none">
                                        {panel.title}
                                    </h3>
                                )}
                            </div>

                            <button
                                onClick={() => closePanel(panel.id)}
                                className="p-1.5 rounded-none bg-transparent hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer outline-none"
                                title="Tutup Panel"
                            >
                                <X size={15} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Body Panel */}
                        <div
                            className="flex-1 overflow-y-auto custom-scrollbar"
                            onClick={() => !isFloating && closePanelsToTheRight(index)}
                        >
                            {renderPanelContent(panel.type, panel.data)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
