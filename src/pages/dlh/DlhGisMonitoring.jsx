import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';

// Import sub-komponen GIS baru
import GisNavbar from './components/gis/GisNavbar';
import GisSidebar from './components/gis/GisSidebar';
import PanelOrchestrator from './components/gis/PanelOrchestrator';
import MapHUD from './components/gis/MapHUD';

// --- 1. CUSTOM CLUSTER ICON (Hanya Angka) ---
const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'w-10 h-10';
    let color = 'bg-indigo-600';

    if (count > 50) {
        size = 'w-14 h-14';
        color = 'bg-red-600';
    } else if (count > 10) {
        size = 'w-12 h-12';
        color = 'bg-amber-600';
    }

    return L.divIcon({
        html: `
            <div class="${size} ${color} text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xl font-black text-xs">
                ${count}
            </div>
        `,
        className: 'custom-marker-cluster',
        iconSize: L.point(40, 40, true),
    });
};

// --- 2. SINGLE MARKER ICON ---
const singleIcon = (type) => {
    const iconHtml = type === 'Non Rumah Tinggal' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

    return L.divIcon({
        html: `
            <div class="w-8 h-8 ${type === 'Non Rumah Tinggal' ? 'bg-blue-600' : 'bg-green-600'} text-white flex items-center justify-center border-2 border-white shadow-lg">
                ${iconHtml}
            </div>
        `,
        className: 'custom-div-icon',
        iconSize: [32, 32],
    });
};

// --- 3. MAP CONTROLLER COMPONENT (Untuk FlyTo secara Dekopel) ---
const MapController = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target.center, target.zoom, { duration: 1.5 });
        }
    }, [target, map]);
    return null;
};

const DlhGisMonitoring = () => {
    const [objekList, setObjekList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [activePanel, setActivePanel] = useState(null);
    const [activeBasemap, setActiveBasemap] = useState('google-street');
    const [selectedObject, setSelectedObject] = useState(null);
    const [mapTarget, setMapTarget] = useState(null);
    const [username, setUsername] = useState("Admin DLH");

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            setUsername(savedUser.username || savedUser.npwrd_subjek || "Admin DLH");
        }

        const fetchGisData = async () => {
            try {
                const res = await api.get('/objek/list-objek', { params: { limit: 1000 } });
                if (res.data.status === 'success') {
                    setObjekList(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGisData();
    }, []);

    // Filter data berdasarkan kategori dan kolom pencarian
    const filteredData = objekList.filter(obj => {
        const matchSearch = (obj.nama_objek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obj.npor_objek?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCat = filterCategory === 'ALL' || obj.kategori_objek === filterCategory;
        return matchSearch && matchCat;
    });

    const handleFlyTo = (center, zoom = 17) => {
        setMapTarget({ center, zoom });
    };

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 selection:bg-green-200 selection:text-green-900 select-none">
            {/* LAYER 1: NAVBAR ATAS */}
            <GisNavbar username={username} />

            {/* LAYER 2: SIDEBAR KIRI */}
            <GisSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

            {/* LAYER 3: DRAWER PANEL ORCHESTRATOR */}
            <PanelOrchestrator
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                objekList={objekList}
                filteredData={filteredData}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                activeBasemap={activeBasemap}
                setActiveBasemap={setActiveBasemap}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                onFlyTo={handleFlyTo}
            />

            {/* LAYER 4: MAP HUD & LEGENDA (KANAN BAWAH) */}
            <MapHUD />

            {/* LAYER 0: INFINITE CANVAS (PETA LEAFLET) */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <MapContainer
                    center={[-6.4797, 106.8249]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    {/* Basemap Switcher */}
                    {activeBasemap === 'google-street' && (
                        <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                    )}
                    {activeBasemap === 'google-satellite' && (
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                    )}
                    {activeBasemap === 'osm' && (
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    )}

                    <ZoomControl position="bottomright" />
                    
                    {/* Controller untuk pemusatan peta */}
                    <MapController target={mapTarget} />

                    {/* Marker Group & Clustering */}
                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterCustomIcon}
                        showCoverageOnHover={false}
                        spiderfyOnMaxZoom={true}
                    >
                        {filteredData.map((obj) => (
                            obj.lat && obj.lng && (
                                <Marker
                                    key={obj.id_objek}
                                    position={[parseFloat(obj.lat), parseFloat(obj.lng)]}
                                    icon={singleIcon(obj.kategori_objek)}
                                    eventHandlers={{
                                        click: () => {
                                            setSelectedObject(obj);
                                            handleFlyTo([parseFloat(obj.lat), parseFloat(obj.lng)], 17);
                                        },
                                    }}
                                >
                                    <Popup maxWidth={300} className="custom-popup">
                                        <div className="p-1 font-sans text-left">
                                            <div className="flex justify-between items-start mb-2 border-b pb-1">
                                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${obj.kategori_objek === 'Non Rumah Tinggal' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {obj.kategori_objek}
                                                </span>
                                                <p className="text-[9px] font-mono font-bold text-slate-400">{obj.npor_objek}</p>
                                            </div>
                                            <h4 className="font-black text-slate-800 text-xs uppercase leading-tight mb-1">{obj.nama_objek}</h4>
                                            <p className="text-[9px] text-slate-500 mb-2 truncate">
                                                {obj.alamat_objek}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>

            {/* LAYER 5: LOADING COVER */}
            {loading && (
                <div className="absolute inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white text-left">
                    <Loader2 className="animate-spin mb-4 text-green-500" size={50} />
                    <p className="text-xs font-black uppercase tracking-[0.4em]">Memuat Data Spasial...</p>
                </div>
            )}
        </main>
    );
};

export default DlhGisMonitoring;