import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import RegistrationForm from './pages/wajibRetribusi/RegistrationForm';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
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
import UptVerifiedList from './pages/upt/UptVerifiedList';
import DlhSkrdList from './pages/dlh/DlhSkrdList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSettings from './pages/admin/AdminSetting';
import AdminLogs from './pages/admin/AdminLogs';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Halaman Login Wajib Retribusi */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signUp" element={<RegistrationForm isStaff={false} />} />

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
          <Route path="/upt/list" element={<UptVerifiedList />} />
          <Route path="/upt/daftar-user" element={
            <MainLayout>
              <SignupPage isStaff={true} />
            </MainLayout>
          } />
          <Route path="/upt/layanan" element={<UptLayanan />} />
          <Route path="/upt/database" element={<UptDatabase />} />
          <Route path="/upt/daftar-objek" element={<RegistrationForm isStaff={true} />} />

          {/* Halaman DLH */}
          <Route path="/dlh/dashboard" element={<DlhDashboard />} />
          <Route path="/dlh/skrd" element={<DlhSkrdMonitoring />} />
          <Route path="/dlh/validasi-bayar" element={<DlhValidasiBayar />} />
          <Route path="/dlh/pembayaran" element={<DlhPaymentMonitoring />} />
          <Route path="/dlh/layanan" element={<DlhLayananValidation />} />
          <Route path="/dlh/skrd-list" element={<DlhSkrdList />} />

          {/* Halaman Bendahara */}
          <Route path="/bendahara/dashboard" element={<BendaharaDashboard />} />
          <Route path="/bendahara/skrd" element={<BendaharaSkrd />} />
          <Route path="/bendahara/ssrd" element={<BendaharaSsrd />} />

          {/* Halaman Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/logs" element={<AdminLogs />} />

          {/* Redirect otomatis ke login jika rute tidak dikenal */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;