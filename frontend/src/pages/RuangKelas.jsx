/**
 * pages/RuangKelas.jsx
 *
 * Halaman-level wrapper untuk Ruang Kelas Perkuliahan SPADA LMS UPGRIS.
 * Menggunakan fitur komponen dari features/kelas/RuangKelas.
 */
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RuangKelas from '../features/kelas/RuangKelas';

export default function RuangKelasPage({ onRoleChange, onNavigate, role = 'mahasiswa' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeRole={role}
        onRoleChange={onRoleChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeRole={role}
        onRoleChange={onRoleChange}
      />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            <RuangKelas onNavigate={onNavigate} role={role} />
          </div>
        </main>
      </div>
    </div>
  );
}

