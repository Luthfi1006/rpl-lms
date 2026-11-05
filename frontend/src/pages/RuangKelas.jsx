import RuangKelas from '../features/kelas/RuangKelas';

/**
 * pages/RuangKelas — thin passthrough.
 * Komponen fitur membungkus dirinya sendiri dengan AppShell sesuai konvensi main.
 */
export default function RuangKelasPage({ onNavigate, onRoleChange, courseId }) {
  return (
    <RuangKelas
      onNavigate={onNavigate}
      onRoleChange={onRoleChange}
      courseId={courseId}
    />
  );
}
