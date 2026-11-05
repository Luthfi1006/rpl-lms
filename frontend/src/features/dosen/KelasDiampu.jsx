import React, { useState, useEffect, useMemo } from 'react';
import { dosenApi } from '../../services/api';

/**
 * KelasDiampu — Feature Component
 *
 * Konversi kls_diampu.html ke framework React modular & interaktif.
 * Menampilkan daftar kelas perkuliahan yang diampu oleh Dosen:
 * - Dukungan multi-tampilan: Grid View & List View
 * - State preview interaktif: Active Classes, Empty State Demo, Skeleton Loading
 * - Filter semester & live search
 * - Aksi cepat presensi & agenda mengajar hari ini
 * - Modal detail & kelola ruang kelas
 */

const DEFAULT_CLASSES = [
  {
    id: 'cls-1',
    code: 'TI-A',
    courseName: 'Rekayasa Perangkat Lunak',
    credits: 3,
    category: 'Reguler Pagi',
    day: 'Senin',
    time: '08:00 - 10:30 WIB',
    room: 'Lab Komputasi 3 (Gedung B Lt. 3)',
    meetingsCount: 16,
    publishedMaterials: 5,
    enrolledStudents: 38,
    capacity: 40,
    attendanceStatus: 'active', // 'active' | 'closed'
    attendanceLabel: 'Presensi P-3: Sesi Aktif',
    attendanceNote: 'Tersisa 45 Menit',
    pendingGradingCount: 14,
    pendingGradingTask: 'Tugas UML',
  },
  {
    id: 'cls-2',
    code: 'TI-B',
    courseName: 'Rekayasa Perangkat Lunak',
    credits: 3,
    category: 'Reguler Siang',
    day: 'Rabu',
    time: '10:30 - 13:00 WIB',
    room: 'Ruang Teori 402',
    meetingsCount: 16,
    publishedMaterials: 5,
    enrolledStudents: 40,
    capacity: 40,
    attendanceStatus: 'closed',
    attendanceLabel: 'Presensi Ditutup',
    attendanceNote: 'P-3 Belum Mulai',
    pendingGradingCount: 0,
    pendingGradingTask: 'Semua Dinilai',
  },
  {
    id: 'cls-3',
    code: 'TI-A',
    courseName: 'Arsitektur Perangkat Lunak Enterprise',
    credits: 2,
    category: 'Peminatan',
    day: 'Kamis',
    time: '13:00 - 14:40 WIB',
    room: 'Lab Rekayasa 2',
    meetingsCount: 16,
    publishedMaterials: 4,
    enrolledStudents: 36,
    capacity: 40,
    attendanceStatus: 'closed',
    attendanceLabel: 'Presensi Ditutup',
    attendanceNote: 'Jadwal Kamis',
    pendingGradingCount: 8,
    pendingGradingTask: 'Tugas MVC',
  },
];

export default function KelasDiampu({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'empty' | 'loading'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSemester, setSelectedSemester] = useState('Semester Ganjil 2026/2027');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  // Modals state
  const [modalAgendaOpen, setModalAgendaOpen] = useState(false);
  const [modalManageClass, setModalManageClass] = useState(null);
  const [modalProdiOpen, setModalProdiOpen] = useState(false);

  // Micro-interactions state
  const [isOpeningAttendance, setIsOpeningAttendance] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dismiss context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown-container]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch classes from backend if available
  useEffect(() => {
    let isMounted = true;
    async function loadBackendClasses() {
      try {
        const res = await dosenApi.getMyClasses();
        if (isMounted && res?.data?.items && res.data.items.length > 0) {
          const transformed = res.data.items.map((cls, idx) => ({
            id: cls.id || `cls-api-${idx}`,
            code: cls.code || `TI-${idx + 1}`,
            courseName: cls.name || cls.course?.name || 'Mata Kuliah',
            credits: cls.course?.credits || 3,
            category: cls.category || 'Reguler Pagi',
            day: cls.schedule?.day || 'Senin',
            time: cls.schedule ? `${cls.schedule.start_time} - ${cls.schedule.end_time} WIB` : '08:00 - 10:30 WIB',
            room: cls.room || 'Lab Komputasi',
            meetingsCount: 16,
            publishedMaterials: 5,
            enrolledStudents: cls.enrolled_count || 38,
            capacity: cls.capacity || 40,
            attendanceStatus: cls.is_active ? 'active' : 'closed',
            attendanceLabel: cls.is_active ? 'Presensi P-3: Sesi Aktif' : 'Presensi Ditutup',
            attendanceNote: cls.is_active ? 'Tersisa 45 Menit' : 'Sesi Belum Mulai',
            pendingGradingCount: 0,
            pendingGradingTask: 'Semua Dinilai',
          }));
          setClasses(transformed);
        }
      } catch {
        // Fallback to DEFAULT_CLASSES
      }
    }
    loadBackendClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3200);
  };

  // Filtered classes according to search
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q) ||
        c.day.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  // Aggregate stats
  const totalSKS = useMemo(() => {
    return classes.reduce((sum, c) => sum + c.credits, 0);
  }, [classes]);

  const totalStudents = useMemo(() => {
    return classes.reduce((sum, c) => sum + c.enrolledStudents, 0);
  }, [classes]);

  // Actions
  const handleTogglePresensi = (classId) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === classId) {
          const willBeActive = cls.attendanceStatus !== 'active';
          return {
            ...cls,
            attendanceStatus: willBeActive ? 'active' : 'closed',
            attendanceLabel: willBeActive ? 'Presensi P-3: Sesi Aktif' : 'Presensi Ditutup',
            attendanceNote: willBeActive ? 'Tersisa 60 Menit' : 'Sesi Telah Diakhiri',
          };
        }
        return cls;
      })
    );
    showToast('Status presensi kelas berhasil diperbarui', 'success');
    setOpenMenuId(null);
  };

  const handleQuickAttendanceAction = () => {
    setIsOpeningAttendance(true);
    setTimeout(() => {
      setIsOpeningAttendance(false);
      setClasses((prev) =>
        prev.map((cls, idx) =>
          idx === 0
            ? {
                ...cls,
                attendanceStatus: 'active',
                attendanceLabel: 'Presensi P-3: Sesi Aktif',
                attendanceNote: 'Tersisa 60 Menit',
              }
            : cls
        )
      );
      showToast('Presensi P-3 Kelas Rekayasa Perangkat Lunak (TI-A) Berhasil Dibuka!', 'success');
    }, 800);
  };

  const handleExportCSV = () => {
    const headers = ['Kode', 'Mata Kuliah', 'SKS', 'Kategori', 'Jadwal', 'Ruang', 'Mahasiswa'];
    const rows = filteredClasses.map((c) => [
      c.code,
      `"${c.courseName}"`,
      c.credits,
      c.category,
      `"${c.day}, ${c.time}"`,
      `"${c.room}"`,
      `${c.enrolledStudents}/${c.capacity}`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Kelas_Diampu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data kelas berhasil diekspor ke CSV', 'success');
  };

  const handleSyncSimAkad = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Sinkronisasi SIM-AKAD UPGRIS berhasil! 3 kelas siap diampu.', 'success');
      setActiveTab('active');
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-space-lg">
      {/* Toast Notification Banner */}
      {toast.visible && (
        <div className="fixed top-5 right-5 z-[9999]">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
                : 'bg-surface-container-highest text-on-surface border-outline/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span className="font-label-md text-label-md">{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
              className="p-1 hover:opacity-75"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Page Header Section */}
      <section className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
          <button
            onClick={() => onNavigate && onNavigate('dasbor-dosen')}
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Dasbor</span>
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-label-md font-semibold">Kelas Diampu</span>
        </nav>

        {/* Main Header Bar Title & Subtitle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
              Kelas Perkuliahan Diampu
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-tertiary font-medium">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{selectedSemester}</span>
              </span>
              <span className="text-outline">•</span>
              <span>
                {classes.length} rombel kelas aktif diampu oleh{' '}
                <strong className="text-on-surface font-semibold">Dr. Awan Rosi, M.Kom.</strong>
              </span>
            </p>
          </div>

          {/* Quick Top Actions */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={handleQuickAttendanceAction}
              disabled={isOpeningAttendance}
              className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-tertiary-container hover:bg-tertiary-container/90 text-on-tertiary-container font-label-sm text-label-sm transition-all shadow-sm font-medium cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isOpeningAttendance ? 'animate-spin' : ''}`}>
                {isOpeningAttendance ? 'refresh' : 'how_to_reg'}
              </span>
              <span>{isOpeningAttendance ? 'Membuka Sesi...' : '+ Buka Presensi Cepat'}</span>
            </button>
            <button
              onClick={() => setModalAgendaOpen(true)}
              className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">today</span>
              <span>Agenda Mengajar Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Filter, Search, and View Controls Strip */}
        <div className="pt-space-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-sm flex-1">
            {/* Semester Select Dropdown */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  showToast(`Memuat data untuk ${e.target.value}...`);
                }}
                className="w-full bg-surface-container-high text-on-surface font-body-sm text-body-sm rounded-lg px-3 py-2 pr-9 appearance-none focus:outline-none focus:bg-surface-bright transition-colors cursor-pointer"
              >
                <option>Semester Ganjil 2026/2027</option>
                <option>Semester Genap 2025/2026</option>
                <option>Semester Ganjil 2025/2026</option>
                <option>Semester Pendek 2026</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                unfold_more
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:bg-surface-bright transition-colors"
                placeholder="Cari kode kelas, mata kuliah, jadwal..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* View Mode & Export Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-space-sm shrink-0">
            <div className="flex items-center bg-surface-container-high p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              title="Ekspor Data Kelas ke CSV"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Tabs to Switch State Previews */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-primary text-on-primary font-semibold shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Tampilan Aktif ({classes.length} Kelas Diampu)
        </button>
        <button
          onClick={() => setActiveTab('empty')}
          className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 cursor-pointer ${
            activeTab === 'empty'
              ? 'bg-primary text-on-primary font-semibold shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Empty State Demo (Dosen)
        </button>
        <button
          onClick={() => setActiveTab('loading')}
          className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 cursor-pointer ${
            activeTab === 'loading'
              ? 'bg-primary text-on-primary font-semibold shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Skeleton Loading State
        </button>
      </div>

      {/* ═════════ TAB 1: ACTIVE CLASSES ═════════ */}
      {activeTab === 'active' && (
        <div className="space-y-space-lg">
          {filteredClasses.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-10 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">search_off</span>
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                Tidak Ada Kelas yang Cocok
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Tidak ditemukan kelas dengan kata kunci &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm"
              >
                Hapus Pencarian
              </button>
            </div>
          ) : (
            <div
              className={`transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'grid grid-cols-1 gap-4'
              }`}
            >
              {filteredClasses.map((item) => (
                <article
                  key={item.id}
                  className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                    viewMode === 'list' ? 'border border-outline-variant/20' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[12px] bg-primary-container text-on-primary-container">
                          {item.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-secondary">
                          {item.credits} SKS
                        </span>
                        <span className="px-2 py-0.5 rounded font-caption text-caption bg-surface-container-high text-on-surface-variant">
                          {item.category}
                        </span>
                      </div>

                      {/* Dropdown Options Menu */}
                      <div className="relative" data-dropdown-container>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                          title="Opsi kelas"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-8 w-48 rounded-lg bg-surface-container-high shadow-xl py-1 z-30 font-label-sm text-label-sm text-on-surface border border-outline/20">
                            <button
                              onClick={() => {
                                setModalManageClass(item);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left"
                            >
                              <span className="material-symbols-outlined text-[16px]">tune</span>
                              <span>Pengaturan Kelas</span>
                            </button>
                            <button
                              onClick={() => {
                                showToast(`Membuka Silabus & RPS ${item.courseName}...`);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left"
                            >
                              <span className="material-symbols-outlined text-[16px]">menu_book</span>
                              <span>Silabus & RPS</span>
                            </button>
                            <button
                              onClick={() => {
                                showToast(`Mengunduh Berita Acara Presensi ${item.code}...`);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left"
                            >
                              <span className="material-symbols-outlined text-[16px]">group</span>
                              <span>Unduh Absensi</span>
                            </button>
                            <div className="my-1 border-t border-outline/20"></div>
                            <button
                              onClick={() => handleTogglePresensi(item.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left text-tertiary"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {item.attendanceStatus === 'active' ? 'lock' : 'how_to_reg'}
                              </span>
                              <span>
                                {item.attendanceStatus === 'active' ? 'Tutup Sesi Presensi' : 'Buka Sesi Presensi'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject Title & Schedule Details */}
                    <div>
                      <h2
                        onClick={() => setModalManageClass(item)}
                        className="font-title-lg text-title-lg text-on-surface font-semibold hover:text-primary cursor-pointer transition-colors leading-snug"
                      >
                        {item.courseName}
                      </h2>
                      <div className="flex items-start gap-2 mt-2 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                          schedule
                        </span>
                        <span>
                          {item.day}, {item.time} • {item.room}
                        </span>
                      </div>
                    </div>

                    {/* Operational Summary Row (3 Mini Stats) */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-container-high text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                          {item.meetingsCount}
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">Pertemuan</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-headline-md text-headline-md text-primary font-bold leading-none">
                          {item.publishedMaterials}
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">Materi Terbit</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-headline-md text-headline-md font-bold leading-none ${
                            item.enrolledStudents >= item.capacity ? 'text-secondary' : 'text-on-surface'
                          }`}
                        >
                          {item.enrolledStudents}
                          <span className="font-body-sm text-body-sm text-outline">/{item.capacity}</span>
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">
                          {item.enrolledStudents >= item.capacity ? (
                            <span className="text-secondary font-semibold">Penuh</span>
                          ) : (
                            'Mahasiswa'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Operational Status Badges */}
                    <div className="flex flex-col gap-2 pt-1">
                      {/* Live Attendance Badge */}
                      {item.attendanceStatus === 'active' ? (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                            </span>
                            <span>{item.attendanceLabel}</span>
                          </div>
                          <span className="font-caption text-caption font-semibold">{item.attendanceNote}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-outline">
                              lock_clock
                            </span>
                            <span>{item.attendanceLabel}</span>
                          </div>
                          <span className="font-caption text-caption text-outline">{item.attendanceNote}</span>
                        </div>
                      )}

                      {/* Grading Status Badge */}
                      {item.pendingGradingCount > 0 ? (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-error-container/30 text-error font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                            <span>{item.pendingGradingCount} Butuh Dinilai</span>
                          </div>
                          <span className="font-caption text-caption">{item.pendingGradingTask}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-high text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">
                              check_circle
                            </span>
                            <span className="text-on-surface-variant">0 Tugas Menunggu</span>
                          </div>
                          <span className="font-caption text-caption text-tertiary font-semibold">
                            Semua Dinilai
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-5 pt-3 flex items-center gap-2 border-t border-outline-variant/10">
                    <button
                      onClick={() => setModalManageClass(item)}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-label-md text-label-md text-center inline-flex items-center justify-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                    >
                      <span>Kelola Ruang Kelas</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="p-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors cursor-pointer"
                      title="Tindakan Lanjutan"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Quick Summary Footer Info */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <span>Perlu membuka kelas tambahan atau pertukaran jadwal? Hubungi BAAK Fakultas Teknik.</span>
            </div>
            <div className="flex items-center gap-4 text-on-surface">
              <span>
                Total Beban: <strong className="text-tertiary">{totalSKS} SKS</strong>
              </span>
              <span>
                Total Mahasiswa: <strong className="text-secondary">{totalStudents} Orang</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ TAB 2: EMPTY STATE DEMO ═════════ */}
      {activeTab === 'empty' && (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
          {/* University Academic Blackboard Graphic / SVG */}
          <div className="w-36 h-36 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary-container mb-6 shadow-inner relative overflow-hidden">
            <div className="absolute inset-2 border-2 border-dashed border-outline/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[64px] text-outline">co_present</span>
            </div>
            {/* Decorative chalk math symbols */}
            <span className="absolute top-3 left-4 font-mono text-[10px] text-outline/40">∑ x_i</span>
            <span className="absolute bottom-3 right-4 font-mono text-[10px] text-outline/40">∫ f(t)dt</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Belum Ada Kelas yang Diampu
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
            Admin Program Studi atau BAAK belum menetapkan Anda sebagai dosen pengampu kelas pada semester aktif ini.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSyncSimAkad}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Sinkronisasi SIAKAD...' : 'Sinkronkan SIM-AKAD'}</span>
            </button>
            <button
              onClick={() => setModalProdiOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors font-label-md text-label-md cursor-pointer font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">contact_support</span>
              <span>Hubungi Operator Prodi</span>
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-outline/10 text-on-surface-variant font-caption text-caption flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>NIDN: 0612088401 • Dosen Tetap Informatika UPGRIS</span>
          </div>
        </div>
      )}

      {/* ═════════ TAB 3: SKELETON LOADING STATE ═════════ */}
      {activeTab === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((skeletonId) => (
            <div
              key={skeletonId}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-12 h-5 bg-surface-container-highest rounded"></div>
                  <div className="w-14 h-5 bg-surface-container-highest rounded-full"></div>
                </div>
                <div className="w-6 h-6 bg-surface-container-highest rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-6 bg-surface-container-highest rounded"></div>
                <div className="w-full h-4 bg-surface-container-highest rounded"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-high rounded-lg">
                <div className="h-8 bg-surface-container-highest rounded"></div>
                <div className="h-8 bg-surface-container-highest rounded"></div>
                <div className="h-8 bg-surface-container-highest rounded"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-full h-8 bg-surface-container-highest rounded-lg"></div>
                <div className="w-full h-8 bg-surface-container-highest rounded-lg"></div>
              </div>
              <div className="pt-4 flex gap-2">
                <div className="flex-1 h-10 bg-surface-container-highest rounded-lg"></div>
                <div className="w-10 h-10 bg-surface-container-highest rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: Agenda Mengajar Hari Ini ── */}
      {modalAgendaOpen && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">today</span>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Agenda Mengajar Hari Ini
                </h3>
              </div>
              <button
                onClick={() => setModalAgendaOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="p-3 rounded-lg bg-surface-container border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-primary">TI-A • SENIN</span>
                  <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-caption font-semibold">
                    Sedang Berlangsung
                  </span>
                </div>
                <div className="font-title-md text-title-md text-on-surface font-semibold mt-1">
                  Rekayasa Perangkat Lunak
                </div>
                <div className="text-outline text-caption mt-0.5">
                  08:00 - 10:30 WIB • Lab Komputasi 3 (Gedung B Lt. 3)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-high opacity-75">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-outline">TI-B • RABU</span>
                  <span className="font-caption text-outline">Mendatang</span>
                </div>
                <div className="font-body-md text-on-surface font-medium mt-1">
                  Rekayasa Perangkat Lunak (10:30 - 13:00 WIB)
                </div>
                <div className="text-outline text-caption">Ruang Teori 402</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalAgendaOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Kelola Ruang Kelas ── */}
      {modalManageClass && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary-container text-on-primary-container">
                    {modalManageClass.code}
                  </span>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                    {modalManageClass.courseName}
                  </h3>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  {modalManageClass.day}, {modalManageClass.time} • {modalManageClass.room}
                </p>
              </div>
              <button
                onClick={() => setModalManageClass(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 font-body-sm text-body-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container rounded-lg">
                  <span className="font-caption text-outline">Total Mahasiswa Terdaftar</span>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                    {modalManageClass.enrolledStudents}/{modalManageClass.capacity}
                  </div>
                </div>
                <div className="p-3 bg-surface-container rounded-lg">
                  <span className="font-caption text-outline">Status Presensi Pertemuan 3</span>
                  <div className="font-title-md text-title-md text-tertiary font-bold mt-1">
                    {modalManageClass.attendanceStatus === 'active' ? 'Aktif' : 'Ditutup'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                  Tindakan Cepat Kelas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleTogglePresensi(modalManageClass.id);
                      setModalManageClass(null);
                    }}
                    className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-tertiary">how_to_reg</span>
                    <div>
                      <div className="font-label-sm text-on-surface font-medium">
                        {modalManageClass.attendanceStatus === 'active' ? 'Tutup Sesi Presensi' : 'Buka Presensi Kelas'}
                      </div>
                      <div className="font-caption text-outline">Kode QR & PIN Mandiri</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Membuka berkas materi ajar ${modalManageClass.code}...`);
                      setModalManageClass(null);
                    }}
                    className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    <div>
                      <div className="font-label-sm text-on-surface font-medium">Unggah Materi Ajar</div>
                      <div className="font-caption text-outline">Modul, PPT, & Silabus RPS</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/15">
              <button
                onClick={() => setModalManageClass(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  showToast(`Navigasi ke Ruang Kelas ${modalManageClass.code}...`);
                  setModalManageClass(null);
                  const url = new URL(window.location.href);
                  url.searchParams.set('page', 'ruang-kelas');
                  window.history.pushState({}, '', url);
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
              >
                Masuk Ruang Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Hubungi Operator Prodi ── */}
      {modalProdiOpen && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_support</span>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Kontak Operator Prodi
                </h3>
              </div>
              <button
                onClick={() => setModalProdiOpen(false)}
                className="p-1 rounded text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <p>
                Jika penugasan kelas Anda belum muncul di SPADA LMS, silakan verifikasi SK Mengajar pada operator:
              </p>
              <div className="p-3 rounded-lg bg-surface-container space-y-1">
                <div className="font-label-md text-on-surface font-semibold">
                  BAAK Fakultas Teknik Informatika UPGRIS
                </div>
                <div>Gedung B Lt. 2 • Telp: (024) 87654321 ext 204</div>
                <div className="text-secondary">Email: prodi-ti@upgris.ac.id</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalProdiOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

