/**
 * pages/JejakAudit.jsx
 *
 * Halaman-level wrapper untuk Jejak Audit E-Learning Kampus.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import JejakAudit from '../features/admin/JejakAudit';
import AppShell from '../components/AppShell';

export default function JejakAuditPage({ onRoleChange, activeNavPath, onNavChange, onNavigate }) {
  const handleNav = onNavChange || onNavigate;
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "jejak-audit"}
      onNavChange={handleNav}
    >
      <JejakAudit onRoleChange={onRoleChange} onNavigate={handleNav} />
    </AppShell>
  );
}
