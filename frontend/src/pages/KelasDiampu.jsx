/**
 * pages/KelasDiampu.jsx
 *
 * Halaman-level wrapper untuk rute Kelas Perkuliahan Diampu Dosen.
 * Menggunakan fitur komponen dari features/dosen/KelasDiampu.
 */
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import KelasDiampu from '../features/dosen/KelasDiampu';

export default function KelasDiampuPage({ onRoleChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeRole="dosen"
        onRoleChange={onRoleChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeRole="dosen"
        onRoleChange={onRoleChange}
      />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl pt-4">
            <KelasDiampu />
          </div>
        </main>
      </div>
    </div>
  );
}

