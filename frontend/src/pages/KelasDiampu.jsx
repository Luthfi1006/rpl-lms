import KelasDiampu from '../features/dosen/KelasDiampu';

/**
 * pages/KelasDiampu — thin passthrough.
 * Komponen fitur membungkus dirinya sendiri dengan AppShell sesuai konvensi main.
 */
export default function KelasDiampuPage({ onNavigate, onRoleChange }) {
  return <KelasDiampu onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
