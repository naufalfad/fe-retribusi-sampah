import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Landmark, MapPin, History,
    FileText, Star, CreditCard, LogOut, Menu,
    X, ChevronLeft, ChevronRight, UserCircle,
    ClipboardList, Database, CheckCircle2, Home,
    ListChecks, ListIcon, ListCollapse, Users,
    Settings, ShieldAlert, ListOrdered, BookOpen,
    Edit3, Map, User
} from 'lucide-react';

// --- Sub-component: Sidebar Item ---
const SidebarItem = ({ icon: Icon, label, path, active, collapsed, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group mb-1
      ${active
                ? 'bg-green-600 text-white shadow-md shadow-green-900/20'
                : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
    >
        <div className="shrink-0">
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        </div>

        {!collapsed && (
            <span className={`font-medium transition-opacity duration-300 ${active ? 'font-bold' : ''}`}>
                {label}
            </span>
        )}

        {/* Tooltip for Collapsed Mode */}
        {collapsed && (
            <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-gray-900 text-white px-3 py-2 rounded-md text-xs whitespace-nowrap z-50 transition-all translate-x-2 group-hover:translate-x-0">
                {label}
                {/* Arrow Tooltip */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
        )}

        {/* Active Indicator Bar */}
        {active && !collapsed && (
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50" />
        )}
    </Link>
);

const MainLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        return { username: savedUser?.username || "Administrator" };
    });

    // 2. Pantau perubahan URL (location.pathname)
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) {
            setUserData({
                username: savedUser.username || "Administrator"
            });
        }
    }, [location.pathname]);

    // Tutup sidebar mobile otomatis saat pindah halaman
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const hideSidebarPaths = ['/signUp', '/login', '/daftar', '/staff', '/penagih', '/landing-page'];
    const isAuthPage = hideSidebarPaths.includes(location.pathname);

    const menuConfig = {
        user: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: FileText, label: 'Tagihan SKRD', path: '/skrd' },
            { icon: CreditCard, label: 'Pembayaran SSRD', path: '/pembayaran' },
            { icon: UserCircle, label: 'Layanan', path: '/layanan' },
            { icon: Home, label: 'Daftar Objek Baru', path: '/daftar' },
        ],
        upt: [
            { icon: LayoutDashboard, label: 'Dashboard UPT', path: '/upt/dashboard' },
            { icon: ListChecks, label: 'List NPWRD', path: '/upt/list' },
            { icon: ClipboardList, label: 'Layanan Perubahan', path: '/upt/layanan' },
            { icon: Database, label: 'Data Wajib Retribusi', path: '/upt/database' },
            { icon: Edit3, label: 'Manajemen Objek', path: '/upt/manajemen-objek' },
        ],
        dlh: [
            { icon: LayoutDashboard, label: 'Dashboard DLH', path: '/dlh/dashboard' },
            { icon: ListOrdered, label: 'List Subjek', path: '/dlh/list-subjek' },
            { icon: ListIcon, label: 'List Objek', path: '/dlh/list-objek' },
            { icon: ListCollapse, label: 'List SKRD', path: '/dlh/list-skrd' },
            { icon: ClipboardList, label: 'SSRD Monitoring', path: '/dlh/pembayaran' },
            { icon: Edit3, label: 'Manajemen Objek', path: '/dlh/manajemen-objek' },
            { icon: UserCircle, label: 'Pemeriksaan', path: '/dlh/pemeriksaan' },
            { icon: CreditCard, label: 'Validasi Bayar', path: '/dlh/validasi-bayar' },
        ],
        bendahara: [
            { icon: LayoutDashboard, label: 'Dashboard Bendahara', path: '/bendahara/dashboard' },
            { icon: ListCollapse, label: 'List Bayar', path: '/bendahara/list-bayar' },
            { icon: CheckCircle2, label: 'Validasi Pembayaran', path: '/bendahara/ssrd' },
            { icon: Landmark, label: 'Manual Payment', path: '/bendahara/pembayaran-manual' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin/dashboard' },
            { icon: Users, label: 'Manajemen Staff', path: '/admin/staff' },
            { icon: Star, label: 'Pengaturan Poin', path: '/admin/poin' },
            { icon: Settings, label: 'Pengaturan Sistem', path: '/admin/settings' },
            { icon: Edit3, label: 'Manajemen Objek', path: '/admin/manajemen-objek' },
            { icon: ShieldAlert, label: 'Log Aktivitas', path: '/admin/logs' },
        ],
        penagih: [
            { icon: LayoutDashboard, label: 'Tugas Lapangan', path: '/penagih/dashboard' },
            { icon: MapPin, label: 'Wilayah Kerja', path: '/penagih/wilayah' },
            { icon: ListIcon, label: 'List SKRD', path: '/penagih/list-skrd' },
            { icon: History, label: 'Riwayat Setoran', path: '/penagih/riwayat' },
        ],
        pengangkut: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/pengangkut/dashboard' },
            { icon: Map, label: 'Monitoring Rute', path: '/pengangkut/monitoring' },
            { icon: History, label: 'Riwayat Pengangkut', path: '/pengangkut/riwayat' },
        ]
    };

    const getActiveRole = () => {
        const path = location.pathname;
        if (path.startsWith('/upt')) return 'upt';
        if (path.startsWith('/dlh')) return 'dlh';
        if (path.startsWith('/bendahara')) return 'bendahara';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/penagih')) return 'penagih';
        if (path.startsWith('/pengangkut')) return 'pengangkut';
        return 'user';
    };

    const activeRole = getActiveRole();
    const menuItems = menuConfig[activeRole] || [];

    const handleLogout = () => {
        localStorage.clear();
        if (['penagih', 'pengangkut'].includes(activeRole)) {
            navigate('/penagih');
        } else if (activeRole === 'user') {
            navigate('/login');
        } else {
            navigate('/staff');
        }
    };

    if (isAuthPage) return <div className="min-h-screen bg-gray-50">{children}</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* OVERLAY MOBILE */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'w-20' : 'w-72'}
            `}>
                <div className="flex flex-col h-full">
                    {/* LOGO AREA */}
                    <div className="p-6 flex items-center justify-between">
                        {(!isCollapsed || isMobileOpen) ? (
                            <div className="flex flex-col">
                                <span className="font-black text-green-700 text-2xl tracking-tighter">REKAS</span>
                                <span className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">GenX 3.1</span>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center">
                                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-black italic">R</div>
                            </div>
                        )}

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-all"
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>

                    {/* SCROLLABLE MENU */}
                    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 scrollbar-thin scrollbar-thumb-gray-200">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    {...item}
                                    active={location.pathname === item.path}
                                    collapsed={isCollapsed && !isMobileOpen}
                                />
                            ))}
                        </div>
                    </nav>

                    {/* BOTTOM SECTION (USER & ACTION) */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        {/* Profile Card */}
                        <div className={`mb-4 px-2 py-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold border border-green-200 shadow-sm">
                                    {userData.username.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Nama & Role hanya muncul jika TIDAK collapsed */}
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden transition-opacity duration-300">
                                    <span className="text-sm font-bold text-gray-700 truncate leading-tight">
                                        {userData.username}
                                    </span>
                                    <span className="text-[10px] text-green-600 uppercase font-bold tracking-wider">
                                        {activeRole}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-1">
                            <button
                                onClick={() => navigate(`/${activeRole}/peraturan`)}
                                className={`w-full flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all group relative`}
                            >
                                <div className="shrink-0"><BookOpen size={22} /></div>
                                {!isCollapsed && <span className="font-semibold">Dasar Hukum</span>}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        Dasar Hukum
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group relative`}
                            >
                                <div className="shrink-0"><LogOut size={22} /></div>
                                {!isCollapsed && <span className="font-semibold">Keluar</span>}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-red-600 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        Keluar
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* HEADER UNTUK MOBILE */}
                <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div className="flex flex-col">
                        <span className="font-black text-green-700 leading-none">REKAS</span>
                        <span className="text-[8px] text-gray-400 tracking-widest uppercase">GenX 3.1</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 bg-green-50 text-green-700 rounded-lg active:scale-95 transition-transform"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;