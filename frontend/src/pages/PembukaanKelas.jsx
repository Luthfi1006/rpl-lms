/**
 * pages/PembukaanKelas.jsx
 *
 * Halaman-level wrapper untuk Pembukaan Kelas E-Learning Kampus.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import PembukaanKelas from '../features/admin/PembukaanKelas';
import AppShell from '../components/AppShell';

export default function PembukaanKelasPage({ onRoleChange, activeNavPath, onNavChange, onNavigate }) {
  const handleNav = onNavChange || onNavigate;
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "pembukaan-kelas"}
      onNavChange={handleNav}
    >
      <PembukaanKelas onRoleChange={onRoleChange} onNavigate={handleNav} />
    </AppShell>
  );
}
