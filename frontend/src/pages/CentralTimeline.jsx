/**
 * pages/CentralTimeline.jsx
 *
 * Halaman-level wrapper untuk Central Timeline Perkuliahan & Batas Waktu Akademik SPADA LMS UPGRIS.
 */
import CentralTimeline from '../features/akademik/CentralTimeline';

export default function CentralTimelinePage({ onNavigate, onRoleChange, activeRole }) {
  return (
    <CentralTimeline
      onNavigate={onNavigate}
      onRoleChange={onRoleChange}
      activeRole={activeRole || 'mahasiswa'}
    />
  );
}
