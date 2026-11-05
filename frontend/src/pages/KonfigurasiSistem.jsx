/**
 * pages/KonfigurasiSistem.jsx
 *
 * Halaman-level wrapper untuk Konfigurasi Sistem & Kebijakan SPADA (Admin).
 */
import KonfigurasiSistem from '../features/admin/KonfigurasiSistem';

export default function KonfigurasiSistemPage({ onNavigate, onRoleChange }) {
  return <KonfigurasiSistem onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
