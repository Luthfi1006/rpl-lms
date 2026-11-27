/**
 * pages/MasterMataKuliah.jsx
 *
 * Halaman-level wrapper untuk Master Mata Kuliah E-Learning Kampus.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import MasterMataKuliah from '../features/admin/MasterMataKuliah';
import AppShell from '../components/AppShell';

export default function MasterMataKuliahPage({ onRoleChange, activeNavPath, onNavChange, onNavigate }) {
  const handleNav = onNavChange || onNavigate;
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "master-mata-kuliah"}
      onNavChange={handleNav}
    >
      <MasterMataKuliah onRoleChange={onRoleChange} onNavigate={handleNav} />
    </AppShell>
  );
}
