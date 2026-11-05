/**
 * pages/AppShellGlobal.jsx
 *
 * Halaman-level wrapper untuk App Shell Global SPADA LMS UPGRIS.
 * Membungkus komponen fitur dari features/shell/AppShellGlobal.
 */
import AppShellGlobal from '../features/shell/AppShellGlobal';

export default function AppShellGlobalPage({ currentRole, activeRole, onRoleChange, onNavigate, onNavChange }) {
  return (
    <AppShellGlobal
      currentRole={currentRole || activeRole}
      onRoleChange={onRoleChange}
      onNavigate={onNavigate || onNavChange}
    />
  );
}
