/**
 * pages/ManajemenMaterial.jsx
 *
 * Halaman-level wrapper untuk Manajemen Materi Pembelajaran (Dosen) SPADA LMS UPGRIS.
 * Mengikuti konvensi page-wrapper `main`: passthrough tipis — layout shell
 * (Header, Sidebar ber-RBAC, ChangePasswordModal, toast) disediakan oleh AppShell
 * di dalam feature component.
 */
import ManajemenMaterial from '../features/dosen/ManajemenMaterial';

export default function ManajemenMaterialPage({ onNavigate, onRoleChange }) {
  return <ManajemenMaterial onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}