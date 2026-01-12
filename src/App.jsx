import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import RegistrationForm from './pages/wajibRetribusi/RegistrationForm';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/wajibRetribusi/UserDashboard';
import SkrdList from './pages/wajibRetribusi/SkrdList';
import PaymentPage from './pages/wajibRetribusi/PaymentPage';
import LayananPage from './pages/wajibRetribusi/LayananPage';
import StaffLoginPage from './pages/StaffLoginPage';
import UptDashboard from './pages/upt/UptDashboard';
import UptVerifikasi from './pages/upt/UptVerifikasi';
import UptLayanan from './pages/upt/UptLayanan';
import UptDatabase from './pages/upt/UptDatabase';
import DlhDashboard from './pages/dlh/DlhDashboard';
import DlhSkrdMonitoring from './pages/dlh/DlhSkrdMonitoring';
import DlhValidasiBayar from './pages/dlh/DlhValidasiBayar';
import DlhPaymentMonitoring from './pages/dlh/DlhPaymentMonitoring';
import DlhLayananValidation from './pages/dlh/DlhLayananValidation';
import BendaharaDashboard from './pages/bendahara/BendaharaDashboard';
import BendaharaSkrd from './pages/bendahara/BendaharaSkrd';
import BendaharaSsrd from './pages/bendahara/BendaharaSsrd';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Halaman Login Wajib Retribusi */}
          <Route path="/login" element={<LoginPage />} />

          {/* Halaman Wajib Retribusi */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/daftar" element={<RegistrationForm isStaff={false} />} />
          <Route path="/skrd" element={<SkrdList />} />
          <Route path="/pembayaran" element={<PaymentPage />} />
          <Route path="/layanan" element={<LayananPage />} />

          {/* Halaman Login Staff */}
          <Route path="/staff/login" element={<StaffLoginPage />} />

          {/* Halaman UPT */}
          <Route path="/upt/dashboard" element={<UptDashboard />} />
          <Route path="/upt/verifikasi" element={<UptVerifikasi />} />
          <Route path="/upt/daftar-baru" element={
            <MainLayout>
              <RegistrationForm isStaff={true} />
            </MainLayout>
          } />
          <Route path="/upt/layanan" element={<UptLayanan />} />
          <Route path="/upt/database" element={<UptDatabase />} />

          {/* Halaman DLH */}
          <Route path="/dlh/dashboard" element={<DlhDashboard />} />
          <Route path="/dlh/skrd" element={<DlhSkrdMonitoring />} />
          <Route path="/dlh/validasi-bayar" element={<DlhValidasiBayar />} />
          <Route path="/dlh/pembayaran" element={<DlhPaymentMonitoring />} />
          <Route path="/dlh/layanan" element={<DlhLayananValidation />} />

          {/* Halaman Bendahara */}
          <Route path="/bendahara/dashboard" element={<BendaharaDashboard />} />
          <Route path="/bendahara/skrd" element={<BendaharaSkrd />} />
          <Route path="/bendahara/ssrd" element={<BendaharaSsrd />} />

          {/* Redirect otomatis ke login jika rute tidak dikenal */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;