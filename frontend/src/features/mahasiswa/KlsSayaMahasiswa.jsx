import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';

/**
 * KlsSayaMahasiswa — Komponen React Kelas Perkuliahan Saya (Mahasiswa)
 * Berdasarkan desain presisi dari kls_saya_mahasiswa.html dengan dukungan
 * Interactive State Simulation (Normal, Empty State, Skeleton Loading),
 * Filter Semester, Pencarian, Tampilan Kisi/Senarai (Grid/List), dan navigasi Ruang Kelas.
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

  // Data 3 Kelas Aktif sesuai HTML mockup
  const classesData = [
    {
      id: 'rpl-ti-a',
      code: 'TI-A',
      sks: '3 SKS',
      title: 'Rekayasa Perangkat Lunak',
      schedule: 'Senin, 08:00 - 10:30 WIB • Lab Komputasi 3',
      lecturer: {
        name: 'Dr. Awan Rosi, M.Kom.',
        nidn: 'NIDN: 0612345601',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAoAMQ1Ccc9u5_ZQUivtjpuxq_GHZc7aDQRHm5xokuPIBNoVQ5zrOHo5mevPw0SG07YRRtqn3j8dO9EuLX1HFKY1iiPrbybfsZKJZlKGuj3sUhaqkF-gwXIvW4pJ6kdILZYkrC3tEgZeyd1cZvGnZwBBSvF-iG3N2oSrERFklWqG8SX3m5xF6PDO-sKMBhNTf28yVYKuVC_WVZ5nv6NbXvNd7nOYA_yItRuOubDLyOg',
        alt: 'Portrait Dr Awan Rosi lecturer',
      },
      progress: {
        current: 3,
        total: 16,
        percentage: 25,
      },
      attendance: {
        status: 'active',
        label: 'Sesi Presensi Aktif',
        sublabel: 'Hingga 10:15 WIB',
      },
      materialsCount: 5,
      assignment: {
        type: 'warning',
        label: '1 Tugas Aktif',
        icon: 'schedule',
      },
    },
    {
      id: 'pwl-ti-b',
      code: 'TI-B',
      sks: '3 SKS',
      title: 'Pemrograman Web Lanjut',
      schedule: 'Selasa, 13:00 - 15:30 WIB • Lab Software 1',
      lecturer: {
        name: 'Ir. Siti Aminah, M.T.',
        nidn: 'NIDN: 0628098701',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAPPQaXs_nyNi0UehLAgKfxlg0cjrRdKvkwbbrdDYG6h5YdqfifPfVOOxGlStttQeXfPTYjUyw_LNV8-aZR66JH6KHR0Q8J7bETbkyegHj9WQBuDCLjrPvSJS1_g_P4pTHY19IVmVZI0S2-IXDTZyw19aai0EQMF8NjNjCRvoyjsEqC_QL1oYjVr1DQaXDy-K9Yd-0YLazLUCTMiOIFg3yahyfUy-7UXAHjWuXTKJUq',
        alt: 'Portrait Ir Siti Aminah lecturer',
      },
      progress: {
        current: 4,
        total: 16,
        percentage: 25,
      },
      attendance: {
        status: 'inactive',
        label: 'Belum Ada Sesi Aktif',
        sublabel: 'Sesi 5 besok',
      },
      materialsCount: 6,
      assignment: {
        type: 'neutral',
        label: '0 Tugas Tertunda',
        icon: 'check_circle',
      },
    },
    {
      id: 'bd-terdistribusi-ti-a',
      code: 'TI-A',
      sks: '2 SKS',
      title: 'Basis Data Terdistribusi',
      schedule: 'Jumat, 08:00 - 09:40 WIB • Lab Database',
      lecturer: {
        name: 'Budi Santoso, M.Cs.',
        nidn: 'NIDN: 0615048201',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB5L5PvW7pZnQf8PmAdlDelVsQyLZTCJyvCS6dsdrss3wBaa40CGfeafcyr4kglnH-WSLuABK7g7Kyj5rTSQakKWPKwCs39lGZazEpiMWnGLvOuQU6zPhaLBeDM41YDgAzjaQEfX26npOy-nlXihvRAZYpdbZIorBHKse0nA8UyXjCPVzycRVXQxdX2koAhs1RUHfucqZPxy_l9HNmB9muJMX6UJ09QJi3ul2W0gCic',
        alt: 'Portrait Budi Santoso lecturer',
      },
      progress: {
        current: 2,
        total: 16,
        percentage: 12.5,
      },
      attendance: {
        status: 'closed',
        label: 'Presensi Ditutup',
        sublabel: 'Selesai Jumat lalu',
      },
      materialsCount: 4,
      assignment: {
        type: 'quiz',
        label: '1 Kuis Minggu Depan',
        icon: 'quiz',
      },
    },
  ];

  // Filter kelas berdasarkan pencarian nama mata kuliah, kelas, atau dosen
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classesData;
    const q = searchQuery.toLowerCase();
    return classesData.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.lecturer.name.toLowerCase().includes(q)
    );
  }, [classesData, searchQuery]);

  const handleOpenRoom = () => {
    if (onNavigate) {
      onNavigate('ruang-kelas');
    } else {
      showToast('Membuka ruang kelas perkuliahan...');
    }
  };

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-saya"
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

        {/* PAGE HEADER & ACTION CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-1 max-w-xl">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                Kelas Perkuliahan Saya
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm">
                {viewState === 'empty' ? '0 Kelas' : `${classesData.length} Kelas`}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Semester Ganjil 2026/2027 • {classesData.length} kelas terdaftar berdasarkan direct enrollment admin
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
                className={`p-1.5 rounded transition-all ${
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
                className={`p-1.5 rounded transition-all ${
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
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-sm transition-colors"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full" id="state-normal">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Top Tags Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                          {item.code}
                        </span>
                        <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          {item.sks}
                        </span>
                      </div>

                      {/* Course Title */}
                      <div className="flex flex-col gap-1">
                        <h2
                          onClick={handleOpenRoom}
                          className="font-title-lg text-[18px] font-semibold text-slate-900 leading-snug line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {item.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-blue-500">
                            schedule
                          </span>
                          <span>{item.schedule}</span>
                        </div>
                      </div>

                      {/* Lecturer Info Profile */}
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                        <img
                          className="w-10 h-10 rounded-full object-cover shadow-sm"
                          data-alt={item.lecturer.alt}
                          src={item.lecturer.avatar}
                          alt={item.lecturer.name}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {item.lecturer.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono tracking-tight">
                            {item.lecturer.nidn}
                          </span>
                        </div>
                      </div>

                      {/* Progress Block */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">Progres Pertemuan</span>
                          <span className="font-semibold text-slate-900">
                            {item.progress.current} dari {item.progress.total} pertemuan ({item.progress.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Status & Activity Indicators */}
                      <div className="flex flex-col gap-2 pt-2">
                        {/* Attendance alert */}
                        {item.attendance.status === 'active' ? (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-xs font-semibold text-emerald-700">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-emerald-600">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                              <span className="text-xs font-semibold text-slate-600">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        )}

                        {/* Material & Assignment Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50">
                            <span className="material-symbols-outlined text-[16px] text-slate-500">
                              description
                            </span>
                            <span className="font-medium">{item.materialsCount} Materi</span>
                          </div>
                          {item.assignment.type === 'warning' && (
                            <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-50 text-amber-800">
                              <span className="material-symbols-outlined text-[16px] text-amber-600">
                                {item.assignment.icon}
                              </span>
                              <span className="font-semibold">{item.assignment.label}</span>
                            </div>
                          )}
                          {item.assignment.type === 'neutral' && (
                            <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-50">
                              <span className="material-symbols-outlined text-[16px] text-slate-400">
                                {item.assignment.icon}
                              </span>
                              <span className="font-medium text-slate-500">{item.assignment.label}</span>
                            </div>
                          )}
                          {item.assignment.type === 'quiz' && (
                            <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-sky-50 text-sky-800">
                              <span className="material-symbols-outlined text-[16px] text-sky-600">
                                {item.assignment.icon}
                              </span>
                              <span className="font-medium">{item.assignment.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-5 mt-2">
                      <button
                        onClick={handleOpenRoom}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
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
              <div className="flex flex-col gap-4 w-full">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start md:items-center gap-4 min-w-0">
                      <img
                        className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm"
                        src={item.lecturer.avatar}
                        alt={item.lecturer.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            {item.code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.sks}
                          </span>
                          <h2
                            onClick={handleOpenRoom}
                            className="font-title-md text-base font-semibold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                          >
                            {item.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span>{item.lecturer.name}</span>
                          <span>•</span>
                          <span>{item.schedule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-slate-800 block">
                          Pertemuan {item.progress.current}/{item.progress.total} ({item.progress.percentage}%)
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.materialsCount} Materi • {item.assignment.label}
                        </span>
                      </div>
                      <button
                        onClick={handleOpenRoom}
                        type="button"
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
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
            className="w-full flex flex-col items-center justify-center py-16 px-6 bg-surface-container-low rounded-3xl text-center"
            id="state-empty"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-inner">
              {/* Vector Illustration: Academic Open Book with Key Lock */}
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
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm cursor-pointer"
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
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between animate-pulse"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-6 rounded-full bg-white/20"></div>
                    <div className="w-14 h-6 rounded-full bg-white/10"></div>
                  </div>
                  <div className="h-6 w-3/4 rounded bg-white/20"></div>
                  <div className="h-4 w-1/2 rounded bg-white/10"></div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/20 shrink-0"></div>
                    <div className="w-full flex flex-col gap-2">
                      <div className="w-2/3 h-3 rounded bg-white/20"></div>
                      <div className="w-1/3 h-2.5 rounded bg-white/10"></div>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10"></div>
                  <div className="h-8 w-full rounded-lg bg-white/10"></div>
                </div>
                <div className="h-10 w-full rounded-xl bg-white/20 mt-6"></div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE STATE SWITCHER FOOTER (DESIGN SYSTEM INSPECTION TOOLBAR) */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/70 p-4 rounded-xl border border-outline-variant/20">
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
              Tampilan Normal (3 Kelas Aktif)
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

