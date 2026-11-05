import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';
import { courseCatalog } from '../../data/courseCatalog';

/**
 * KlsSayaMahasiswa — Komponen React Kelas Perkuliahan Saya (Mahasiswa)
 * Menggunakan katalog terpusat courseCatalog (konsisten dengan Dashboard & Ruang Kelas),
 * mendukung filter pencarian, filter semester, tata letak grid/list,
 * navigasi ruang kelas per mata kuliah, dan simulasi state (Normal, Empty, Skeleton).
 */
export default function KlsSayaMahasiswa({ onNavigate, onRoleChange }) {
  // State interaktif
  const [viewState, setViewState] = useState('normal'); // 'normal' | 'empty' | 'skeleton'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSemester, setSelectedSemester] = useState('2026-ganjil');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sumber data kelas terpusat dari courseCatalog
  const classes = useMemo(
    () =>
      courseCatalog.map((course) => ({
        id: course.id,
        code: course.code,
        className: course.classGroup,
        title: course.name,
        sks: `${course.sks} SKS`,
        sksNumber: course.sks,
        schedule: course.schedule,
        lecturer: {
          name: course.lecturer,
          nidn: `NIDN: ${course.nidn}`,
          avatar: course.avatar,
        },
        progress: {
          current: course.currentMeeting,
          total: course.totalMeetings,
          percentage: course.meetingProgressPct,
        },
        attendance: {
          status: course.attendanceActive ? 'active' : 'inactive',
          label: course.attendanceActive ? 'Sesi Presensi Aktif' : 'Presensi Terjadwal',
          sublabel: course.attendanceDeadline,
        },
        materialsCount: course.materialsCount,
        activeTasks: course.activeTasks,
      })),
    []
  );

  const totalSks = useMemo(() => classes.reduce((sum, cls) => sum + cls.sksNumber, 0), [classes]);

  // Filter kelas berdasarkan pencarian nama mata kuliah, kode kelas, atau dosen
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.lecturer.name.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const handleOpenRoom = (courseId) => {
    if (onNavigate) {
      onNavigate(`ruang-kelas?course=${courseId}`);
    } else {
      showToast(`Membuka ruang kelas ${courseId}...`);
    }
  };

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-saya-mahasiswa"
      onNavChange={onNavigate}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/40">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full pb-16">
        {/* BREADCRUMBS & CONTEXT PATHWAY */}
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-sm pt-space-xs">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Dasbor</span>
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">Kelas Saya</span>
        </div>

        {/* PAGE HERO HEADER & CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-1 max-w-xl">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                Kelas Perkuliahan Saya
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">
                {viewState === 'empty' ? '0 Kelas' : `${classes.length} Kelas (${totalSks} SKS)`}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Semester Ganjil 2026/2027 • Seluruh kelas terdaftar berdasarkan direct enrollment akademik
            </p>
          </div>

          {/* Filter & Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Semester Dropdown Selector */}
            <div className="relative min-w-[210px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md pl-3 pr-9 py-2 rounded-lg cursor-pointer focus:outline-none focus:bg-surface-container transition-all border border-outline-variant/20"
              >
                <option value="2026-ganjil">Semester Ganjil 2026/2027</option>
                <option value="2025-genap">Semester Genap 2025/2026</option>
                <option value="2025-ganjil">Semester Ganjil 2025/2026</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                expand_more
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center min-w-[240px] max-w-xs flex-1">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata kuliah atau dosen..."
                className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder-outline focus:outline-none focus:bg-surface-container transition-all border border-outline-variant/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Layout View Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                aria-label="Tampilan Kisi"
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] block">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                aria-label="Tampilan Senarai"
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] block">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: NORMAL STATE */}
        {viewState === 'normal' && (
          <>
            {filteredClasses.length === 0 ? (
              <div className="w-full py-16 px-6 bg-surface-container-low rounded-3xl text-center">
                <span className="material-symbols-outlined text-outline text-[48px] mb-2 block">
                  search_off
                </span>
                <h3 className="font-title-lg text-on-surface font-semibold mb-1">
                  Tidak ada kelas yang cocok
                </h3>
                <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-4">
                  Tidak ditemukan hasil untuk kata kunci "{searchQuery}". Silakan coba kata kunci lain.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-sm transition-colors cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full" id="state-normal">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 border border-outline-variant/20 hover:border-primary/40 group"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Top Tags Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
                          {item.className} • {item.code}
                        </span>
                        <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                          {item.sks}
                        </span>
                      </div>

                      {/* Course Title */}
                      <div className="flex flex-col gap-1">
                        <h2
                          onClick={() => handleOpenRoom(item.id)}
                          className="font-title-lg text-[18px] font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-primary cursor-pointer transition-colors"
                        >
                          {item.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            schedule
                          </span>
                          <span className="truncate">{item.schedule}</span>
                        </div>
                      </div>

                      {/* Lecturer Info Profile */}
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                        <img
                          className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                          src={item.lecturer.avatar}
                          alt={item.lecturer.name}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-on-surface truncate">
                            {item.lecturer.name}
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono tracking-tight">
                            {item.lecturer.nidn}
                          </span>
                        </div>
                      </div>

                      {/* Progress Block */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-on-surface-variant">Progres Pertemuan</span>
                          <span className="font-semibold text-on-surface font-mono">
                            {item.progress.current} dari {item.progress.total} pertemuan ({item.progress.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${item.progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Status & Activity Indicators */}
                      <div className="flex flex-col gap-2 pt-1">
                        {item.attendance.status === 'active' ? (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-xs font-semibold text-emerald-400">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-emerald-400">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/10">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex rounded-full h-2 w-2 bg-outline"></span>
                              <span className="text-xs font-medium text-on-surface-variant">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-outline">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        )}

                        {/* Material & Assignment Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-low">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              description
                            </span>
                            <span className="font-medium">{item.materialsCount} Materi</span>
                          </div>
                          <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-low">
                            <span className="material-symbols-outlined text-[16px] text-secondary">
                              assignment
                            </span>
                            <span className="font-medium">{item.activeTasks} Tugas Aktif</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-5 mt-2">
                      <button
                        onClick={() => handleOpenRoom(item.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-medium text-sm transition-all duration-200 shadow-md cursor-pointer active:scale-[0.99]"
                        type="button"
                      >
                        <span>Buka Ruang Kelas</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View representation */
              <div className="flex flex-col gap-3 w-full">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/20 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start md:items-center gap-4 min-w-0">
                      <img
                        className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm"
                        src={item.lecturer.avatar}
                        alt={item.lecturer.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-container text-on-primary-container">
                            {item.className}
                          </span>
                          <span className="font-mono text-xs text-outline">{item.code}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                            {item.sks}
                          </span>
                          <h2
                            onClick={() => handleOpenRoom(item.id)}
                            className="font-title-md text-base font-semibold text-on-surface truncate group-hover:text-primary cursor-pointer transition-colors"
                          >
                            {item.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                          <span>{item.lecturer.name}</span>
                          <span>•</span>
                          <span>{item.schedule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-on-surface block font-mono">
                          Pertemuan {item.progress.current}/{item.progress.total} ({item.progress.percentage}%)
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {item.materialsCount} Materi • {item.activeTasks} Tugas
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenRoom(item.id)}
                        type="button"
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-medium text-sm transition-all shadow-sm cursor-pointer"
                      >
                        <span>Buka Kelas</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: EMPTY STATE DEMO */}
        {viewState === 'empty' && (
          <div
            className="w-full flex flex-col items-center justify-center py-16 px-6 bg-surface-container-low rounded-3xl text-center border border-outline-variant/20"
            id="state-empty"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-inner">
              <svg
                className="w-12 h-12 text-secondary"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
                <path d="M14 18l3-3 3 3" />
              </svg>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
              Belum Ada Kelas yang Diikuti
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-6 leading-relaxed">
              Administrator belum mendaftarkan Anda ke kelas semester ini. Sesuai kebijakan{' '}
              <span className="font-mono text-secondary font-semibold">BR-002</span>, seluruh enrollment
              dilakukan secara terpusat oleh Biro Akademik.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-sm">
              <button
                type="button"
                onClick={() => showToast('Membuka kontak layanan Biro Akademik (BAA)...')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-label-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">contact_support</span>
                <span>Hubungi Biro Akademik</span>
              </button>
              <button
                type="button"
                onClick={() => setViewState('normal')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Periksa Kembali</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: SKELETON LOADING STATE */}
        {viewState === 'skeleton' && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full"
            id="state-skeleton"
          >
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between animate-pulse border border-outline-variant/20"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-6 rounded-full bg-surface-container-highest"></div>
                    <div className="w-14 h-6 rounded-full bg-surface-container-highest"></div>
                  </div>
                  <div className="h-6 w-3/4 rounded bg-surface-container-highest"></div>
                  <div className="h-4 w-1/2 rounded bg-surface-container-highest"></div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest shrink-0"></div>
                    <div className="w-full flex flex-col gap-2">
                      <div className="w-2/3 h-3 rounded bg-surface-container-highest"></div>
                      <div className="w-1/3 h-2.5 rounded bg-surface-container-highest"></div>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-highest"></div>
                  <div className="h-8 w-full rounded-lg bg-surface-container-highest"></div>
                </div>
                <div className="h-10 w-full rounded-xl bg-surface-container-highest mt-6"></div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE STATE SWITCHER FOOTER (DESIGN SYSTEM INSPECTION TOOLBAR) */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
            <span>Simulasi Status Halaman:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewState('normal')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                viewState === 'normal'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tampilan Normal ({classes.length} Kelas Aktif)
            </button>
            <button
              type="button"
              onClick={() => setViewState('empty')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                viewState === 'empty'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Empty State Demo
            </button>
            <button
              type="button"
              onClick={() => setViewState('skeleton')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                viewState === 'skeleton'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Skeleton Loading
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
