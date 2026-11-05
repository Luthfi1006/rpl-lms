import React, { useState, useEffect } from 'react';

/**
 * RuangKelas — Feature Component
 *
 * Konversi Ruang_kls.html ke framework React modular & interaktif.
 * Menampilkan ruang kelas perkuliahan virtual:
 * - Header kelas komprehensif dengan circular progress attendance ring & bar progres kelas
 * - Tiga tab utama:
 *   1. Pertemuan (16 Sesi OBE) dengan accordion interaktif, download modul/PPT,
 *      sesi presensi aktif interaktif, dan penugasan terstruktur
 *   2. Rekapitulasi Kehadiran Mahasiswa terintegrasi IP Kampus
 *   3. Silabus & Rencana Pembelajaran Semester (RPS) berbasis CPL
 * - Panduan status siklus presensi (Terkunci vs Tervalidasi Server)
 * - Modal detail penugasan & pengumpulan berkas
 */

export default function RuangKelas({ onNavigate, role = 'mahasiswa' }) {
  // Active tab: 'pertemuan' | 'presensi' | 'silabus'
  const [activeTab, setActiveTab] = useState('pertemuan');

  // Accordion open states for meetings
  const [expandedMeetings, setExpandedMeetings] = useState({
    p1: false,
    p2: false,
    p3: true, // Default open current meeting
    p4: false,
    p5: false,
    p8: false,
  });

  // Attendance confirmation state for P3
  const [isAttendedP3, setIsAttendedP3] = useState(false);
  const [attendanceTimeP3, setAttendanceTimeP3] = useState('09:24 WIB');
  const [isSubmittingPresence, setIsSubmittingPresence] = useState(false);

  // Countdown timer simulation for active session
  const [remainingSeconds, setRemainingSeconds] = useState(1694); // ~28m 14s

  // Modals & Toast
  const [modalTugasOpen, setModalTugasOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  // Countdown timer for P3 attendance
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} menit ${s < 10 ? '0' : ''}${s} detik`;
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3200);
  };

  const toggleAccordion = (id) => {
    setExpandedMeetings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllMeetings = (open) => {
    setExpandedMeetings({
      p1: open,
      p2: open,
      p3: open,
      p4: open,
      p5: open,
      p8: open,
    });
  };

  const handleConfirmPresence = () => {
    setIsSubmittingPresence(true);
    setTimeout(() => {
      setIsSubmittingPresence(false);
      setIsAttendedP3(true);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setAttendanceTimeP3(timeStr);
      showToast('Kehadiran Kuliah Sesi P3 Berhasil Dicatat!', 'success');
    }, 600);
  };

  const handleDownloadFile = (fileName) => {
    showToast(`Mengunduh berkas: ${fileName}`, 'info');
  };

  const handlePrintAttendance = () => {
    showToast('Menyiapkan Berita Acara Presensi untuk dicetak...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Dynamic attendance metrics
  const attendedCount = isAttendedP3 ? 4 : 3;
  const attendancePct = isAttendedP3 ? 100 : 75;

  return (
    <div className="flex flex-col w-full pb-16 space-y-6 pt-2 max-w-7xl mx-auto">
      {/* Toast Notification */}
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

      {/* TOP BREADCRUMB & STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-on-surface-variant font-label-md text-label-md">
          <button
            onClick={() => onNavigate && onNavigate('dasbor')}
            className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Dasbor</span>
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <button
            onClick={() => onNavigate && onNavigate('kelas-saya')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Kelas Saya
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs md:max-w-none">
            Rekayasa Perangkat Lunak (TI-A)
          </span>
        </nav>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span>Semester Ganjil 2026/2027</span>
            <span className="text-outline">•</span>
            <span className="font-bold text-on-surface">Enrolled Aktif</span>
          </div>
        </div>
      </div>

      {/* CLASS HEADER CARD (Crystalline White Card Elevation-1) */}
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 text-slate-800 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Info Section */}
          <div className="flex-1 space-y-4">
            {/* Pills / Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold tracking-wide">
                TI-A
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                3 SKS
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                Reguler Pagi
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                Kode MK: IF3024
              </span>
            </div>
            {/* Course Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-headline-lg font-bold text-slate-900 tracking-tight">
                Rekayasa Perangkat Lunak
              </h1>
              <p className="text-slate-500 font-body-sm text-body-sm mt-1">
                Program Studi S1 Teknik Informatika • Fakultas Pendidikan Matematika, Ilmu Pengetahuan Alam dan Teknologi Informasi
              </p>
            </div>
            {/* Instructor & Schedule Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Dosen Pengampu</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">Dr. Awan Rosi, M.Kom.</p>
                  <p className="text-xs text-slate-500 font-mono">NIDN: 0612345601</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Waktu Perkuliahan</p>
                  <p className="text-sm font-semibold text-slate-800">Senin, 08:00 - 10:30 WIB</p>
                  <p className="text-xs text-slate-500 truncate">Lab Komputasi 3 (Gedung B Lt. 3)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">Struktur Kurikulum</p>
                  <p className="text-sm font-semibold text-slate-800">16 Pertemuan Terstruktur</p>
                  <p className="text-xs text-slate-500">Standar Nasional Dikti (OBE)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Attendance Ring & Metric */}
          <div className="flex flex-row sm:flex-col items-center justify-center lg:pl-8 lg:border-l lg:border-slate-100 gap-4 shrink-0 bg-slate-50/70 p-4 rounded-xl lg:bg-transparent lg:p-0">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" fill="none" r="40" stroke="#E2E8F0" strokeWidth="8"></circle>
                <circle
                  className="transition-all duration-700 ease-out"
                  cx="48"
                  cy="48"
                  fill="none"
                  r="40"
                  stroke="#2563EB"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * attendancePct) / 100}
                  strokeLinecap="round"
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-headline-md text-slate-900 leading-none">
                  {attendancePct}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {attendedCount}/4 Sesi
                </span>
              </div>
            </div>
            <div className="text-left sm:text-center">
              <h2 className="text-sm font-bold text-slate-800">Kehadiran Saya</h2>
              <p className="text-xs text-emerald-600 font-semibold flex items-center sm:justify-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Memenuhi Syarat UTS</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[170px]">
                Batas minimum kehadiran 70% untuk akses ujian.
              </p>
            </div>
          </div>
        </div>

        {/* Course Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">
              Progres Kelas: <strong className="text-blue-600 font-bold">3 / 16 Pertemuan</strong> Terlaksana
            </span>
            <span className="font-mono text-slate-500 font-semibold">18.75% Selesai</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '18.75%' }}></div>
          </div>
        </div>

        {/* Tabs Navigation Bar */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pertemuan')}
            className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pertemuan'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
            <span>Pertemuan (16 Sesi)</span>
          </button>
          <button
            onClick={() => setActiveTab('presensi')}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presensi'
                ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Rekap Kehadiran Saya</span>
          </button>
          <button
            onClick={() => setActiveTab('silabus')}
            className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'silabus'
                ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">article</span>
            <span>Silabus &amp; Rencana Kuliah</span>
          </button>
        </div>
      </div>

      {/* ═════════ TAB 1: PERTEMUAN (ACCORDION STACK) ═════════ */}
      {activeTab === 'pertemuan' && (
        <div className="space-y-3">
          {/* Filter & Utility Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-outline">
                Daftar Pertemuan Perkuliahan
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                16 Sesi
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => toggleAllMeetings(true)}
                className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium cursor-pointer"
              >
                Buka Semua
              </button>
              <button
                onClick={() => toggleAllMeetings(false)}
                className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* MEETING 1 */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleAccordion('p1')}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 text-sm shrink-0">
                  P1
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Pembelajaran Pra-UTS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• 22 Sep 2026</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                    P1 • Pengenalan Rekayasa Perangkat Lunak &amp; SDLC
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">2 Materi Pembelajaran Tersedia</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="hidden sm:inline">HADIR</span>
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedMeetings.p1 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {expandedMeetings.p1 && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-600 mb-3">
                  Definisi perangkat lunak, krisis software masa lampau, evolusi SDLC, dan profesionalisme rekayasawan perangkat lunak sesuai ACM/IEEE guidelines.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-white rounded-lg flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[20px]">picture_as_pdf</span>
                      <span className="text-xs font-medium text-slate-800">
                        Slide Kuliah P01 - Overview RPL &amp; Karakteristik Software.pdf
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadFile('Slide Kuliah P01.pdf')}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      Unduh
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MEETING 2 */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleAccordion('p2')}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 text-sm shrink-0">
                  P2
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Pembelajaran Pra-UTS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• 29 Sep 2026</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                    P2 • Model Proses Perangkat Lunak (Waterfall &amp; Agile)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">3 Materi • 1 Tugas Mandiri</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span className="hidden sm:inline">HADIR</span>
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedMeetings.p2 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {expandedMeetings.p2 && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-600 mb-3">
                  Karakteristik metode Waterfall konvensional, Spiral, Prototyping, dan transisi ke metodologi Agile Scrum dalam industri piranti lunak modern.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-white rounded-lg flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 text-[20px]">picture_as_pdf</span>
                      <span className="text-xs font-medium text-slate-800">
                        Modul 2 - Komparasi Waterfall vs Agile Manifesto.pdf
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadFile('Modul 2 Waterfall vs Agile.pdf')}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      Unduh
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MEETING 3 (CURRENT / PERTEMUAN BERJALAN) */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-xl overflow-hidden transition-all duration-200 border-l-4 border-l-blue-600 ring-2 ring-blue-200/80">
            <button
              onClick={() => toggleAccordion('p3')}
              className="w-full text-left p-4 md:p-6 flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50/40 via-white to-white hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-mono font-bold text-white text-base shrink-0 shadow-md">
                  P3
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      Pembelajaran Pra-UTS
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>Pertemuan Berjalan Hari Ini</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">• 06 Okt 2026</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                    P3 • Analisis Kebutuhan &amp; Spesifikasi SRS
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ruang Kuliah Aktif: Lab Komputasi 3 • Pukul 08:00 - 10:30 WIB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                  Sesi Dibuka
                </span>
                <span
                  className={`material-symbols-outlined text-blue-600 text-[26px] transition-transform duration-200 ${
                    expandedMeetings.p3 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>

            {expandedMeetings.p3 && (
              <div className="px-5 md:px-7 pb-6 pt-3 space-y-6 border-t border-blue-100 bg-white">
                {/* Summary Description */}
                <div className="p-4 rounded-lg bg-slate-50 text-slate-700 font-body-md text-body-md leading-relaxed border-l-2 border-slate-300">
                  Membahas teknik elisitasi kebutuhan perangkat lunak, klasifikasi <em>functional</em> &amp; <em>non-functional requirements</em>, user stories mapping, serta standardisasi penyusunan dokumen SRS berstandar <strong>IEEE 830 / ISO/IEC/IEEE 29148</strong>.
                </div>

                {/* Section: Interactive Attendance */}
                <div className="rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-5 md:p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                          SESI PRESENSI AKTIF
                        </span>
                        <span className="text-xs text-slate-400">• Presensi Mandiri Mahasiswa</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        Konfirmasi Kehadiran Kuliah Sesi P3
                      </h4>
                      <p className="text-xs text-slate-600">
                        Dibuka pukul 09:15 WIB oleh <strong>Dr. Awan Rosi</strong> • Batas toleransi kehadiran hingga <strong>10:15 WIB</strong>{' '}
                        <span className="text-blue-700 font-semibold">
                          (Tersisa {formatCountdown(remainingSeconds)})
                        </span>
                        .
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isAttendedP3 ? (
                        <div className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-label-md text-label-md font-bold shadow-md flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span>Kehadiran Berhasil Dicatat ({attendanceTimeP3})</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleConfirmPresence}
                          disabled={isSubmittingPresence}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-label-md text-label-md font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span className={`material-symbols-outlined text-[20px] ${isSubmittingPresence ? 'animate-spin' : ''}`}>
                            {isSubmittingPresence ? 'refresh' : 'check_circle'}
                          </span>
                          <span>{isSubmittingPresence ? 'Mencatat Kehadiran...' : 'Isi Kehadiran Sekarang'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Materi Pembelajaran */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">folder_open</span>
                      <span>Materi Pembelajaran (2 Berkas)</span>
                    </h4>
                    <span className="text-xs text-slate-500">Wajib dipelajari sebelum sesi tanya jawab</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* File 1: PDF */}
                    <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                            Modul 3 — Analisis Kebutuhan &amp; Elisitasi Sistem.pdf
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            1.2 MB • Diunggah 6 Okt 2026 oleh Dr. Awan Rosi
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-medium">
                              Bahan Tayang
                            </span>
                            <span className="text-[10px] text-slate-400">PDF Document</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile('Modul 3 Analisis Kebutuhan.pdf')}
                        aria-label="Unduh Modul 3"
                        className="p-2 rounded-lg bg-white shadow-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>

                    {/* File 2: DOCX */}
                    <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">description</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                            Template Dokumen SRS IEEE 830-UPGRIS.docx
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            480 KB • Format Standar Tugas Mandiri
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                              Template Praktikum
                            </span>
                            <span className="text-[10px] text-slate-400">Word Document</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile('Template Dokumen SRS.docx')}
                        aria-label="Unduh Template Dokumen SRS"
                        className="p-2 rounded-lg bg-white shadow-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Tugas Terkait */}
                <div className="p-4 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">assignment</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                          Tugas Kelompok Terstruktur
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">
                          Tugas 01: Penyusunan Dokumen SRS Fungsional
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold">
                        Bobot: 15%
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Belum Dikumpulkan</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>
                          Tenggat: <strong className="text-slate-800">Senin, 19 Okt 2026 • 23:59 WIB</strong>
                        </span>
                      </span>
                      <span className="text-slate-400 hidden md:inline">•</span>
                      <span className="text-slate-500 hidden md:inline">Format: PDF (Maks. 10 MB)</span>
                    </div>
                    <button
                      onClick={() => setModalTugasOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Lihat Detail Tugas &amp; Upload</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MEETING 4 */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm overflow-hidden transition-all duration-200 opacity-90">
            <button
              onClick={() => toggleAccordion('p4')}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-500 text-sm shrink-0">
                  P4
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Pembelajaran Pra-UTS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• 13 Okt 2026</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-800 truncate">
                    P4 • Pemodelan Sistem: Use Case Diagram &amp; Scenario
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Materi dibuka sesuai jadwal pertemuan</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  Belum Dimulai
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedMeetings.p4 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {expandedMeetings.p4 && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500 italic">
                  Materi perkuliahan P4 dan sesi presensi akan diaktifkan secara otomatis saat jadwal perkuliahan dimulai pada 13 Oktober 2026.
                </p>
              </div>
            )}
          </div>

          {/* MEETING 5 */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm overflow-hidden opacity-90">
            <button
              onClick={() => toggleAccordion('p5')}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-500 text-sm shrink-0">
                  P5
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Pembelajaran Pra-UTS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• 20 Okt 2026</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-800 truncate">
                    P5 • Pemodelan Dinamis: Activity &amp; Sequence Diagram
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Praktikum Desain UML Visual Paradigm</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  Belum Dimulai
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedMeetings.p5 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {expandedMeetings.p5 && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500 italic">Konten belum dibuka oleh Dosen Pengampu.</p>
              </div>
            )}
          </div>

          {/* MEETING 8 (UTS) */}
          <div className="meeting-card rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent bg-white text-slate-800 shadow-md overflow-hidden border-l-4 border-l-amber-500">
            <button
              onClick={() => toggleAccordion('p8')}
              className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-amber-50/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      Ujian Tengah Semester (UTS)
                    </span>
                    <span className="text-xs text-amber-700 font-semibold">• Pertemuan 8</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                    P8 • Ujian Tengah Semester (Evaluasi P1 s.d. P7)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Syarat Presensi Mahasiswa ≥ 70% Terpenuhi (Status: Layak Mengikuti Ujian)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                  <span className="hidden sm:inline">Jadwal UTS: 10 Nov 2026</span>
                </span>
                <span
                  className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedMeetings.p8 ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {expandedMeetings.p8 && (
              <div className="px-5 pb-5 pt-2 border-t border-amber-100 bg-amber-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                  <div>
                    <p className="font-bold text-slate-900">
                      Ketentuan Ujian Tengah Semester Rekayasa Perangkat Lunak:
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Ujian bersifat Proctored CBT melalui portal SPADA LMS UPGRIS. Lembar ujian dan bank soal akan dibuka tepat pada hari H sesuai jadwal BAAK UPGRIS.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-amber-200 text-amber-900 font-semibold text-center whitespace-nowrap">
                    Token Ujian Dibagikan Pengawas
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MEETING 9 to 15 (Pasca-UTS) */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm p-4 flex items-center justify-between gap-4 opacity-80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-400 text-sm shrink-0">
                P9-15
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Pembelajaran Pasca-UTS
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  Sesi P9 s.d. P15: Arsitektur Perangkat Lunak, Pengujian (Black/White Box), &amp; QA
                </h3>
                <p className="text-xs text-slate-400">
                  7 Sesi Pertemuan terjadwal setelah tahapan evaluasi tengah semester selesai.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-xs font-semibold">
                Terkunci
              </span>
            </div>
          </div>

          {/* MEETING 16 (UAS) */}
          <div className="meeting-card rounded-xl bg-white text-slate-800 shadow-sm overflow-hidden border-l-4 border-l-rose-700 opacity-80">
            <div className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800">
                      Ujian Akhir Semester (UAS)
                    </span>
                    <span className="text-xs text-slate-500">• Evaluasi Akhir (P16)</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                    P16 • Presentasi Proyek Akhir &amp; Ujian Komprehensif Perangkat Lunak
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lembar ujian &amp; rubrik penilaian akhir semester
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span className="hidden sm:inline">Jadwal UAS: Jan 2027</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ TAB 2: REKAP KEHADIRAN ═════════ */}
      {activeTab === 'presensi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Kehadiran Mahasiswa</h2>
                <p className="text-xs text-slate-500">
                  Rekor presensi terintegrasi sistem server SPADA LMS UPGRIS.
                </p>
              </div>
              <button
                onClick={handlePrintAttendance}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Bukti Presensi</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Sesi</th>
                    <th className="py-2.5 px-3">Tanggal Kuliah</th>
                    <th className="py-2.5 px-3">Topik Perkuliahan</th>
                    <th className="py-2.5 px-3">Waktu Presensi</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">P1</td>
                    <td className="py-3 px-3">22 Sep 2026</td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      Pengenalan Rekayasa Perangkat Lunak
                    </td>
                    <td className="py-3 px-3 font-mono">08:14 WIB</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        HADIR
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-medium">Valid IP Kampus</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">P2</td>
                    <td className="py-3 px-3">29 Sep 2026</td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      Model Proses SDLC &amp; Agile
                    </td>
                    <td className="py-3 px-3 font-mono">08:06 WIB</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        HADIR
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-medium">Valid IP Kampus</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">P3</td>
                    <td className="py-3 px-3 font-bold text-slate-800">06 Okt 2026 (Hari Ini)</td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      Analisis Kebutuhan &amp; Spesifikasi SRS
                    </td>
                    <td className="py-3 px-3 font-mono text-blue-700 font-semibold">
                      {isAttendedP3 ? attendanceTimeP3 : 'Sedang Berlangsung'}
                    </td>
                    <td className="py-3 px-3">
                      {isAttendedP3 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          HADIR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          SESI TERBUKA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-medium">
                      {isAttendedP3 ? 'Valid IP Kampus' : 'Menunggu Aksi'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ TAB 3: SILABUS & RPS ═════════ */}
      {activeTab === 'silabus' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Rencana Pembelajaran Semester (RPS)</h2>
                <p className="text-xs text-slate-500">
                  Capaian Pembelajaran Lulusan (CPL) dan Rencana Mingguan Berstandar OBE.
                </p>
              </div>
              <button
                onClick={() => handleDownloadFile('Silabus_RPS_RPL_IF3024.pdf')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Unduh Silabus Lengkap (PDF)</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CPL 01 • Pengetahuan
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Mampu menerapkan konsep dasar rekayasa perangkat lunak, proses SDLC, dan teknik analisa arsitektural berbasis kebutuhan pengguna.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CPL 02 • Keterampilan Khusus
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Mampu merancang dokumen SRS berstandar IEEE, mendesain diagram UML, dan mengimplementasikan pengujian sistem otomatis.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  CPL 03 • Sikap &amp; Kerja Tim
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Mampu berkolaborasi dalam tim pengembang perangkat lunak dengan etika profesi yang bertanggung jawab serta akuntabel.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 4: Panduan Status Presensi Perkuliahan ── */}
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <h2 className="text-sm font-bold text-on-surface">
            Panduan Status Presensi Perkuliahan (Siklus Sesi Mahasiswa)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alternate State 1: Locked */}
          <div className="rounded-xl bg-surface-container-high p-5 text-on-surface shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-variant text-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">
                    State 1: Terkunci (Locked)
                  </span>
                  <h3 className="text-sm font-bold text-on-surface">Sesi Presensi Belum Dibuka</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-lowest text-outline">
                Inaktif
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Dosen pengampu belum membuka portal presensi untuk sesi ini. Tombol presensi otomatis terkunci hingga kelas dimulai.
            </p>
            <div className="pt-2">
              <button
                className="w-full py-2.5 px-4 rounded-lg bg-surface-variant text-outline font-label-md text-label-md font-semibold cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
                disabled
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Isi Kehadiran (Terkunci)</span>
              </button>
            </div>
          </div>

          {/* Alternate State 2: Confirmed */}
          <div className="rounded-xl bg-surface-container-high p-5 text-on-surface shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
                    State 2: Selesai (Confirmed)
                  </span>
                  <h3 className="text-sm font-bold text-on-surface">Kehadiran Berhasil Divalidasi</h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-tertiary-container/30 text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>Tervalidasi Server</span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Kehadiran Anda telah tercatat <strong>HADIR</strong> pada pukul <strong>09:18 WIB</strong> (Tepat Waktu) melalui IP Kampus UPGRIS.
            </p>
            <div className="pt-2">
              <div className="w-full py-2 px-4 rounded-lg bg-tertiary/10 text-tertiary font-label-md text-label-md font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Status: Kehadiran Tersimpan Permanen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Detail Tugas 01 ── */}
      {modalTugasOpen && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[24px]">assignment</span>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Tugas 01: Penyusunan SRS Fungsional
                </h3>
              </div>
              <button
                onClick={() => setModalTugasOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="p-3 rounded-lg bg-surface-container space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-outline">Batas Pengumpulan:</span>
                  <span className="font-semibold text-on-surface">Senin, 19 Okt 2026, 23:59 WIB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Bobot Nilai:</span>
                  <span className="font-semibold text-tertiary">15% dari Total Nilai Akhir</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Ketentuan Format:</span>
                  <span className="font-semibold text-on-surface">PDF (Maks. 10 MB)</span>
                </div>
              </div>
              <p>
                Unggah dokumen SRS hasil elisitasi kelompok Anda mengacu pada template IEEE 830 yang telah disediakan pada berkas materi P3.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/15">
              <button
                onClick={() => setModalTugasOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  showToast('Membuka formulir pengumpulan tugas...', 'info');
                  setModalTugasOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold"
              >
                Upload Berkas Tugas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

