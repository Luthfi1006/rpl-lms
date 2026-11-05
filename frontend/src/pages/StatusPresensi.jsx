/**
 * pages/StatusPresensi.jsx
 *
 * Page wrapper untuk tampilan Status Presensi Mahasiswa (FR-023 / FR-024).
 * Menggunakan AppShell terpusat dengan penegakan RBAC yang mempertahankan peran aktif.
 */
import StatusPresensi from '../features/mahasiswa/StatusPresensi';
import AppShell from '../components/AppShell';

export default function StatusPresensiPage({ onRoleChange, onNavigate, activeRole, activeNavPath }) {
  return (
    <AppShell
      activeRole={activeRole || 'mahasiswa'}
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || 'status-presensi'}
      onNavChange={onNavigate}
    >
      <StatusPresensi onNavigate={onNavigate} onRoleChange={onRoleChange} />
    </AppShell>
  );
}
