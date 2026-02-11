import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
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
import DlhPaymentMonitoring from './pages/dlh/DlhPaymentMonitoring';
import DlhLayananValidation from './pages/dlh/DlhLayananValidation';
import BendaharaDashboard from './pages/bendahara/BendaharaDashboard';
import BendaharaSkrd from './pages/bendahara/BendaharaSkrd';
import BendaharaSsrd from './pages/bendahara/BendaharaSsrd';
import DlhListSkrd from './pages/dlh/DlhListSkrd';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSettings from './pages/admin/AdminSetting';
import AdminLogs from './pages/admin/AdminLogs';
import FormTambahObjek from './pages/FormTambahObjek';
import FormTambahSubjek from './pages/FormTambahSubjek';
import UptListSubjek from './pages/upt/UptListSubjek';
import DlhListObjek from './pages/dlh/DlhListObjek';
import BendaharaManualPayment from './pages/bendahara/BendaharaManualPayment';
import AdminFormPreview from './pages/admin/AdminFormPreview';
import DlhListSubjek from './pages/dlh/DlhListSubjek';
import PenagihLoginPage from './pages/PenagihLoginPage';
import PenagihDashboard from './pages/penagih/PenagihDashboard';
import PenagihListSkrd from './pages/penagih/PenagihListSkrd';
import PenagihWilayah from './pages/penagih/PenagihWilayah';
import PenagihRiwayat from './pages/penagih/PenagihRiwayat';
import DocumentsPage from './pages/DocumentsPage';
import ObjectManagement from './pages/ObjectManagement';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/peraturan" element={<DocumentsPage isAdmin={false} />} />
          {/* Halaman Login Wajib Retribusi */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signUp" element={<FormTambahSubjek isStaff={false} />} />

          {/* Halaman Wajib Retribusi */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/daftar" element={<FormTambahObjek isStaff={false} />} />
          <Route path="/skrd" element={<SkrdList />} />
          <Route path="/pembayaran" element={<PaymentPage />} />
          <Route path="/layanan" element={<LayananPage />} />

          {/* Halaman Login Staff */}
          <Route path="/staff/login" element={<StaffLoginPage />} />

          {/* Halaman UPT */}
          <Route path="/upt/dashboard" element={<UptDashboard />} />
          <Route path="/upt/verifikasi" element={<UptVerifikasi />} />
          <Route path="/upt/list" element={<UptListSubjek />} />
          <Route path="/upt/daftar-user" element={<FormTambahSubjek isStaff={true} />} />
          <Route path="/upt/layanan" element={<UptLayanan />} />
          <Route path="/upt/database" element={<UptDatabase />} />
          <Route path="/upt/daftar-objek/:id_subjek" element={<FormTambahObjek isStaff={true} />} />
          <Route path="/upt/manajemen-objek" element={<ObjectManagement />} />
          <Route path="/upt/peraturan" element={<DocumentsPage isAdmin={false} />} />

          {/* Halaman DLH */}
          <Route path="/dlh/dashboard" element={<DlhDashboard />} />
          <Route path="/dlh/list-subjek" element={<DlhListSubjek />} />
          <Route path="/dlh/list-objek" element={<DlhListObjek />} />
          <Route path="/dlh/daftar-user" element={<FormTambahSubjek isStaff={true} />} />
          <Route path="/dlh/daftar-objek/:id_subjek" element={<FormTambahObjek isStaff={true} />} />
          {/* <Route path="/dlh/validasi-bayar" element={<DlhValidasiBayar />} /> */}
          <Route path="/dlh/pembayaran" element={<DlhPaymentMonitoring />} />
          <Route path="/dlh/layanan" element={<DlhLayananValidation />} />
          <Route path="/dlh/list-skrd" element={<DlhListSkrd />} />
          <Route path="/dlh/manajemen-objek" element={<ObjectManagement />} />
          <Route path="/dlh/peraturan" element={<DocumentsPage isAdmin={false} />} />

          {/* Halaman Bendahara */}
          <Route path="/bendahara/dashboard" element={<BendaharaDashboard />} />
          <Route path="/bendahara/skrd" element={<BendaharaSkrd />} />
          <Route path="/bendahara/ssrd" element={<BendaharaSsrd />} />
          <Route path="/bendahara/pembayaran-manual" element={<BendaharaManualPayment />} />
          <Route path="/bendahara/peraturan" element={<DocumentsPage isAdmin={false} />} />

          {/* Halaman Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/form-preview" element={<AdminFormPreview />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/manajemen-objek" element={<ObjectManagement />} />
          <Route path="/admin/peraturan" element={<DocumentsPage isAdmin={true} />} />

          {/* Halaman Penagih */}
          <Route path="/penagih/login" element={<PenagihLoginPage />} />
          <Route path="/penagih/dashboard" element={<PenagihDashboard />} />
          <Route path="/penagih/list-skrd" element={<PenagihListSkrd />} />
          <Route path="/penagih/wilayah" element={<PenagihWilayah />} />
          <Route path="/penagih/riwayat" element={<PenagihRiwayat />} />
          <Route path="/penagih/peraturan" element={<DocumentsPage isAdmin={false} />} />

          {/* Redirect otomatis ke login jika rute tidak dikenal */}
          <Route path="*" element={<Navigate to="/staff/login" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;