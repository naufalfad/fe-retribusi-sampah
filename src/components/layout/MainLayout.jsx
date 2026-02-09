import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Landmark, MapPin, History,
    FileText,
    CreditCard,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    ClipboardList,
    Database,
    CheckCircle2,
    Home,
    ListChecks,
    ListIcon,
    ListCollapse,
    Users,
    Settings,
    ShieldAlert,
    ListOrdered,
    BookOpen
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
    <Link
        to={path}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
      ${active
                ? 'bg-green-700 text-white shadow-lg shadow-green-900/20'
                : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
    >
        <div className="shrink-0"><Icon size={22} /></div>
        {!collapsed && <span className="font-semibold whitespace-nowrap">{label}</span>}
        {collapsed && (
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {label}
            </div>
        )}
    </Link>
);

const MainLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const hideSidebarPaths = ['/signUp', '/login', '/daftar', '/staff/login', '/penagih/login'];
    const isAuthPage = hideSidebarPaths.includes(location.pathname);

    const menuCofig = {
        user: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: FileText, label: 'Tagihan SKRD', path: '/skrd' },
            { icon: CreditCard, label: 'Pembayaran SSRD', path: '/pembayaran' },
            { icon: UserCircle, label: 'Layanan', path: '/layanan' },
            { icon: Home, label: 'Daftar Objek Baru', path: '/daftar' },
        ],
        upt: [
            { icon: LayoutDashboard, label: 'Dashboard UPT', path: '/upt/dashboard' },
            //{ icon: UserCheck, label: 'Verifikasi NPWRD', path: '/upt/verifikasi' },
            { icon: ListChecks, label: 'List NPWRD', path: '/upt/list' },
            { icon: ClipboardList, label: 'Layanan Perubahan', path: '/upt/layanan' },
            { icon: Database, label: 'Data Wajib Retribusi', path: '/upt/database' },
        ],
        dlh: [
            { icon: LayoutDashboard, label: 'Dashboard DLH', path: '/dlh/dashboard' },
            { icon: ListOrdered, label: 'List Subjek', path: '/dlh/list-subjek' },
            { icon: ListIcon, label: 'List Objek', path: '/dlh/list-objek' },
            { icon: ListCollapse, label: 'List SKRD', path: '/dlh/list-skrd' },
            { icon: ClipboardList, label: 'SSRD Monitoring', path: '/dlh/pembayaran' },
            { icon: UserCircle, label: 'Layanan', path: '/dlh/layanan' },
        ],
        bendahara: [
            { icon: LayoutDashboard, label: 'Dashboard Bendahara', path: '/bendahara/dashboard' },
            //{ icon: Landmark, label: 'Penerbitan SKRD', path: '/bendahara/skrd' },
            { icon: CheckCircle2, label: 'Validasi Pembayaran', path: '/bendahara/ssrd' },
            { icon: Landmark, label: 'Manual Payment', path: '/bendahara/pembayaran-manual' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin/dashboard' },
            { icon: Users, label: 'Manajemen Staff', path: '/admin/staff' },
            { icon: Settings, label: 'Pengaturan Sistem', path: '/admin/settings' },
            { icon: ShieldAlert, label: 'Log Aktivitas', path: '/admin/logs' },
        ],
        penagih: [
            { icon: LayoutDashboard, label: 'Tugas Lapangan', path: '/penagih/dashboard' },
            { icon: MapPin, label: 'Wilayah Kerja', path: '/penagih/wilayah' },
            { icon: ListIcon, label: 'List SKRD', path: '/penagih/list-skrd' },
            { icon: History, label: 'Riwayat Setoran', path: '/penagih/riwayat' },
        ]
    };

    const getActiveRole = () => {
        if (location.pathname.startsWith('/upt')) return 'upt';
        if (location.pathname.startsWith('/dlh')) return 'dlh';
        if (location.pathname.startsWith('/bendahara')) return 'bendahara';
        if (location.pathname.startsWith('/admin')) return 'admin';
        if (location.pathname.startsWith('/penagih')) return 'penagih';
        return 'user';
    };

    const activeRole = getActiveRole();
    const menuItems = menuCofig[activeRole];

    const handleLogout = () => {
        if (activeRole !== 'user') {
            navigate('/staff/login');
        } else {
            navigate('/login');
        }
    };

    const handleDocument = () => {
        navigate(`/${activeRole}/peraturan`);
    }

    if (isAuthPage) {
        return <div className="min-h-screen bg-gray-50">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* OVERLAY MOBILE */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-100 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
                <div className="flex flex-col h-full p-4">
                    {/* LOGO AREA */}
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-10 px-2`}>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-black text-green-800 text-xl tracking-tight leading-none">REKAS</span>
                                <span className="text-[9px] font-medium text-gray-400 tracking-[0.2em] ">GenX 3.1</span>
                            </div>
                        )}
                        <button
                            onClick={() => isCollapsed ? setIsCollapsed(false) : setIsCollapsed(true)}
                            className="hidden md:flex p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-green-700 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    {/* MENU ITEMS */}
                    <nav className="flex-grow space-y-2">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                active={location.pathname === item.path}
                                collapsed={isCollapsed}
                            />
                        ))}
                    </nav>

                    {/* USER & LOGOUT */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                        {/* {!isCollapsed && (
                            <div className="px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-bold">
                                    JS
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-800 truncate">Jajang Sutisna</p>
                                    <p className="text-[10px] text-gray-500 truncate">Wajib Retribusi</p>
                                </div>
                            </div>
                        )} */}
                        <button
                            onClick={handleDocument}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-green-50 rounded-xl transition-all group`}
                        >
                            <BookOpen size={22} />
                            {!isCollapsed && <span className="font-semibold">Dasar Hukum</span>}
                        </button>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group`}
                        >
                            <LogOut size={22} />
                            {!isCollapsed && <span className="font-semibold">Keluar</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER UNTUK MOBILE */}
                <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="font-bold text-green-800 tracking-tight">REKAS</div>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 bg-gray-50 rounded-lg text-green-700"
                    >
                        <Menu size={20} />
                    </button>
                </header>

                {/* PAGE CONTENT */}
                <main className={`p-4 md:p-8 transition-all duration-300`}>
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;