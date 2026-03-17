import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Jika tidak ada token, tendang ke login staff (default)
    if (!token) {
        // Jika yang ditembak rute penagih, balikkan ke login penagih
        if (window.location.pathname.startsWith('/penagih')) {
            return <Navigate to="/penagih" replace />;
        }
        return <Navigate to="/staff" replace />;
    }

    // 2. Jika ada token tapi role tidak sesuai
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Arahkan ke dashboard masing-masing role jika nyasar
        const role = user?.role?.toLowerCase();
        return <Navigate to={`/${role}/dashboard`} replace />;
    }

    // 3. Jika oke, tampilkan halaman yang diminta
    return <Outlet />;
};

export default ProtectedRoute;