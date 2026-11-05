/**
 * pages/PemeriksaanTugas.jsx
 *
 * Halaman-level wrapper untuk Pemeriksaan Tugas & Rubrik Penilaian Dosen SPADA LMS UPGRIS.
 */
import PemeriksaanTugas from '../features/dosen/PemeriksaanTugas';

export default function PemeriksaanTugasPage({ onNavigate, onRoleChange }) {
  return <PemeriksaanTugas onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
