import { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * KelolaKls — Feature Component (Mode Kelola Dosen)
 * Antarmuka Dosen Pengampu untuk mengelola 16 Pertemuan Silabus OBE,
 * distribusi materi ajar, penugasan, dan kontrol presensi digital (State A, B, C).
 * Dikonversi 1:1 dari desain referensi kelola_kls.html SPADA LMS UPGRIS.
 */
export default function KelolaKls({ onNavigate, onRoleChange }) {
  // Navigation tabs state: 'pertemuan' | 'rekap' | 'mahasiswa' | 'bobot'
  const [activeTab, setActiveTab] = useState('pertemuan');

  // Presensi simulation state: 'A' (Draf Tutup) | 'B' (Buka Aktif) | 'C' (Ditutup)
  const [presensiState, setPresensiState] = useState('B');

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    p1: false,
    p2: false,
    p3: true,
    p4: false,
    p5: false,
    p8: false,
    p9_15: false,
    p16: false,
  });

  // Topic Form state for P3
  const [topicTitle, setTopicTitle] = useState('Analisis Kebutuhan & Spesifikasi SRS IEEE 830');
  const [topicDescription, setTopicDescription] = useState(
    'Membahas teknik elisitasi kebutuhan perangkat lunak, klasifikasi functional & non-functional requirements, user stories mapping, serta standardisasi penyusunan dokumen SRS berstandar IEEE 830 / ISO/IEC/IEEE 29148.'
  );
  const [isPublished, setIsPublished] = useState(true);
  const [allowPreDownload, setAllowPreDownload] = useState(true);

  // Materials list state
  const [materials, setMaterials] = useState([
    {
      id: 'm1',
      name: 'Modul 3 — Analisis Kebutuhan & Elisitasi Sistem.pdf',
      size: '1.2 MB',
      date: '6 Okt 2026, 08:30 WIB',
      type: 'pdf',
      status: 'Terbit',
    },
    {
      id: 'm2',
      name: 'Template Dokumen SRS IEEE 830-UPGRIS.docx',
      size: '480 KB',
      date: 'Format Standar Praktikum',
      type: 'doc',
      status: 'Terbit',
    },
  ]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    setOpenAccordions({
      p1: true,
      p2: true,
      p3: true,
      p4: true,
      p5: true,
      p8: true,
      p9_15: true,
      p16: true,
    });
    showToast('Semua sesi pertemuan diperluas');
  };

  const collapseAll = () => {
    setOpenAccordions({
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p8: false,
      p9_15: false,
      p16: false,
    });
    showToast('Semua sesi pertemuan ditutup');
  };

  const handleDeleteMaterial = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Berkas materi berhasil dihapus.');
  };

  const handleSaveTopic = () => {
    showToast('Perubahan informasi topik berhasil disimpan ke sistem SIAKAD/LMS.');
  };

  const handleResetTopic = () => {
    setTopicTitle('Analisis Kebutuhan & Spesifikasi SRS IEEE 830');
    setTopicDescription(
      'Membahas teknik elisitasi kebutuhan perangkat lunak, klasifikasi functional & non-functional requirements, user stories mapping, serta standardisasi penyusunan dokumen SRS berstandar IEEE 830 / ISO/IEC/IEEE 29148.'
    );
    showToast('Form topik telah direset.');
  };

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-diampu"
      onNavChange={onNavigate}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/40 animate-fade-in"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* BREADCRUMB & CONTEXT BANNER */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('kelas-diampu')}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Kelas Diampu
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm">Rekayasa Perangkat Lunak (TI-A)</span>
            <span>/</span>
            <span className="text-primary font-label-sm bg-surface-container-high px-2 py-0.5 rounded">
              Mode Kelola Dosen
            </span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-caption text-caption text-on-surface-variant">
              SINKRONISASI SIAKAD: AKTIF
            </span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">NIDN: 0612345601</span>
          </div>
        </div>

        {/* CLASS HEADER CARD (Institutional Dark/Crystalline Hero Banner) */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-space-lg">
            {/* Left side: badges, title, meta */}
            <div className="flex-1 space-y-space-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2.5 py-1 rounded font-bold tracking-wide">
                  TI-A
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-highest text-secondary px-2.5 py-1 rounded font-medium">
                  3 SKS • Teori &amp; Praktik
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-2.5 py-1 rounded">
                  Reguler Pagi
                </span>
                <span className="font-caption text-caption bg-surface-container-lowest text-outline px-2 py-1 rounded font-mono">
                  Kode MK: TIF-301
                </span>
              </div>
              <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight font-bold">
                Rekayasa Perangkat Lunak
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-2 gap-x-4 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                  <span>
                    38 Mahasiswa Terdaftar <span className="text-outline">(Maks: 40)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_month</span>
                  <span>Semester Ganjil 2026/2027</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
                  <span>16 Pertemuan (SN-Dikti OBE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                  <span>Senin, 08:00 - 10:30 WIB • Lab 3</span>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col xl:flex-row items-center gap-space-sm shrink-0 self-start">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('unggah-materi')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">cloud_upload</span>
                <span>Unggah Materi Cepat</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">table_chart</span>
                <span>Rekap Presensi &amp; Nilai</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Membuka formulir pembuatan tugas baru OBE')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md shadow-md transition-all font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Buat Tugas Baru</span>
              </button>
            </div>
          </div>

          {/* TABS BAR */}
          <div className="flex items-center gap-6 mt-6 pt-4 bg-surface-container-lowest/50 -mx-space-lg -mb-space-lg px-space-lg overflow-x-auto border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setActiveTab('pertemuan')}
              className={`flex items-center gap-2 pb-3 font-label-md text-label-md transition-colors relative whitespace-nowrap ${
                activeTab === 'pertemuan'
                  ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_timeline</span>
              <span>Pertemuan (16 Sesi)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('rekap');
                if (onNavigate) onNavigate('rekap-kehadiran');
              }}
              className={`flex items-center gap-2 pb-3 font-label-md text-label-md transition-colors relative whitespace-nowrap ${
                activeTab === 'rekap'
                  ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Rekap Kehadiran (38 Mhs)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('mahasiswa');
                showToast('Menampilkan daftar 38 mahasiswa terdaftar pada kelas TI-A');
              }}
              className={`flex items-center gap-2 pb-3 font-label-md text-label-md transition-colors relative whitespace-nowrap ${
                activeTab === 'mahasiswa'
                  ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Daftar Mahasiswa (Enrolled)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('bobot');
                showToast('Menampilkan konfigurasi bobot penilaian OBE: Tugas (30%), UTS (30%), UAS (40%)');
              }}
              className={`flex items-center gap-2 pb-3 font-label-md text-label-md transition-colors relative whitespace-nowrap ${
                activeTab === 'bobot'
                  ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">assessment</span>
              <span>Bobot &amp; Penilaian SPADA</span>
            </button>
          </div>
        </section>

        {/* 2-COLUMN MAIN CONTENT WORKSPACE */}
        <div className="flex flex-col lg:flex-row gap-space-lg items-start">
          {/* LEFT / MAIN COLUMN: 16-MEETING ACCORDION MANAGER (~68%) */}
          <div className="flex-1 w-full space-y-space-md min-w-0">
            {/* Section Header & Controls */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-sm shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-space-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    Silabus &amp; Sesi Perkuliahan
                  </span>
                </div>
                <span className="font-label-sm text-label-sm bg-tertiary-container/30 text-tertiary px-2.5 py-0.5 rounded-full font-medium">
                  3 / 16 Terlaksana
                </span>
                <span className="font-caption text-caption text-outline">OBE-Compliant 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-on-surface-variant hover:text-primary font-caption text-caption px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10"
                >
                  Perluas Semua
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-on-surface-variant hover:text-primary font-caption text-caption px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10"
                >
                  Tutup Semua
                </button>
                <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded font-caption text-caption text-secondary">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>Semua Pertemuan</span>
                </div>
              </div>
            </div>

            {/* ACCORDION LIST */}
            <div className="space-y-space-sm">
              {/* P1: Collapsed Row */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm hover:bg-surface-container transition-all flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P1
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        Pengenalan Rekayasa Perangkat Lunak &amp; SDLC
                      </span>
                      <span className="font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded">
                        Pra-UTS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">description</span> 2 Materi
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">fact_check</span> Presensi: Ditutup (36/38)
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded">
                        Terbit (Mahasiswa)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('menejemen-material')}
                    className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest font-caption text-caption text-on-surface transition-colors"
                  >
                    Kelola
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('p1')}
                    className="text-outline hover:text-on-surface"
                    aria-label="Toggle P1"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        openAccordions.p1 ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>
              {openAccordions.p1 && (
                <div className="p-4 bg-surface-container rounded-xl text-body-sm text-on-surface-variant border border-outline-variant/20 -mt-1 ml-4 space-y-2">
                  <p className="font-semibold text-on-surface">Topik: Pengenalan RPL &amp; Waterfall vs Agile</p>
                  <p className="text-caption text-outline">
                    2 berkas telah dibagikan kepada mahasiswa. Sesi presensi telah diarsipkan secara permanen.
                  </p>
                </div>
              )}

              {/* P2: Collapsed Row */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm hover:bg-surface-container transition-all flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P2
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        Model Proses Perangkat Lunak (Agile &amp; Waterfall)
                      </span>
                      <span className="font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded">
                        Pra-UTS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">description</span> 3 Materi
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">fact_check</span> Presensi: Ditutup (37/38)
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">assignment</span> 1 Tugas Terbit
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded">Terbit</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('menejemen-material')}
                    className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest font-caption text-caption text-on-surface transition-colors"
                  >
                    Kelola
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('p2')}
                    className="text-outline hover:text-on-surface"
                    aria-label="Toggle P2"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        openAccordions.p2 ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>
              {openAccordions.p2 && (
                <div className="p-4 bg-surface-container rounded-xl text-body-sm text-on-surface-variant border border-outline-variant/20 -mt-1 ml-4 space-y-2">
                  <p className="font-semibold text-on-surface">Topik: Model Proses Perangkat Lunak</p>
                  <p className="text-caption text-outline">
                    Studi kasus Scrum Sprint Backlog dan perbandingan Waterfall telah diselesaikan.
                  </p>
                </div>
              )}

              {/* P3: EXPANDED ACTIVE ROW (TODAY'S RUNNING SESSION) */}
              <div className="bg-surface-container rounded-xl shadow-xl overflow-hidden relative border border-primary/40">
                {/* Active Left Accent Indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>

                {/* Expanded Header */}
                <div className="p-space-md bg-surface-container-high/90 flex flex-wrap items-center justify-between gap-3 pl-space-md ml-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-title-md text-title-md font-bold shrink-0 shadow-md">
                      P3
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-title-md text-title-md text-on-surface font-bold truncate">
                          Analisis Kebutuhan &amp; Spesifikasi SRS IEEE 830
                        </span>
                        <span className="font-label-sm text-label-sm bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary animate-pulse"></span>
                          Sesi Berjalan Hari Ini (Aktif)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 font-caption text-caption text-on-surface-variant flex-wrap">
                        <span>Pembelajaran Pra-UTS</span>
                        <span>•</span>
                        <span className="text-secondary font-medium">Status: Terbit (Sinkron LMS)</span>
                        <span>•</span>
                        <span className="text-tertiary">08:00 - 10:30 WIB</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('p3')}
                    className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors"
                    aria-label="Toggle P3 Detail"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        openAccordions.p3 ? '' : 'rotate-180'
                      }`}
                    >
                      expand_less
                    </span>
                  </button>
                </div>

                {/* INNER EDITABLE FORM / SESSION WORKSPACE */}
                {openAccordions.p3 && (
                  <div className="p-space-lg space-y-space-lg ml-1.5">
                    {/* SECTION 1: Topik Perkuliahan Form */}
                    <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-md shadow-sm border border-outline-variant/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Informasi &amp; Topik Perkuliahan
                          </span>
                        </div>
                        <span className="font-caption text-caption text-outline">
                          Modifikasi langsung tersinkron ke mahasiswa
                        </span>
                      </div>
                      <div className="space-y-space-sm">
                        <div>
                          <label
                            htmlFor="topic-title-input"
                            className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                          >
                            Judul Topik Pertemuan
                          </label>
                          <input
                            id="topic-title-input"
                            type="text"
                            value={topicTitle}
                            onChange={(e) => setTopicTitle(e.target.value)}
                            className="w-full bg-surface-container-high text-on-surface rounded-lg px-3 py-2 font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-outline-variant/30"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="topic-desc-input"
                            className="block font-label-sm text-label-sm text-on-surface-variant mb-1"
                          >
                            Deskripsi / Capaian Pembelajaran Pertemuan (Sub-CPMK)
                          </label>
                          <textarea
                            id="topic-desc-input"
                            rows={3}
                            value={topicDescription}
                            onChange={(e) => setTopicDescription(e.target.value)}
                            className="w-full bg-surface-container-high text-on-surface rounded-lg px-3 py-2 font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed shadow-inner border border-outline-variant/30"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                          {/* Toggle: Publikasi */}
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                id="publish-toggle"
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => {
                                  setIsPublished(e.target.checked);
                                  showToast(
                                    e.target.checked
                                      ? 'Pertemuan 3 dipublikasikan ke mahasiswa'
                                      : 'Pertemuan 3 disembunyikan (Draf)'
                                  );
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                            </label>
                            <label
                              htmlFor="publish-toggle"
                              className="font-body-sm text-body-sm text-on-surface cursor-pointer"
                            >
                              <span
                                className={`font-medium ${
                                  isPublished ? 'text-tertiary' : 'text-outline'
                                }`}
                              >
                                {isPublished ? 'Aktif' : 'Nonaktif'}
                              </span>{' '}
                              — Dapat diakses oleh seluruh mahasiswa kelas TI-A
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              id="pre-download"
                              type="checkbox"
                              checked={allowPreDownload}
                              onChange={(e) => setAllowPreDownload(e.target.checked)}
                              className="rounded bg-surface-container-highest text-primary focus:ring-0 w-4 h-4"
                            />
                            <label
                              htmlFor="pre-download"
                              className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                            >
                              Izinkan unduh materi pra-presensi
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleResetTopic}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveTopic}
                            className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm shadow-sm transition-all flex items-center gap-1.5 font-semibold"
                          >
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            Simpan Perubahan Topik
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Materi Pembelajaran Pertemuan 3 */}
                    <div className="space-y-space-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[18px]">folder_open</span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Materi Pembelajaran Pertemuan 3
                          </span>
                          <span className="font-caption text-caption bg-surface-container-high text-secondary px-2 py-0.5 rounded-full font-mono">
                            {materials.length} Berkas Terunggah
                          </span>
                        </div>
                        <span className="font-caption text-caption text-outline">Batas maks: 10MB/berkas</span>
                      </div>

                      {/* Upload Dropzone Area */}
                      <div
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('unggah-materi');
                          } else {
                            showToast('Membuka file dialog unggah materi...');
                          }
                        }}
                        className="bg-surface-container-low/70 rounded-xl p-space-md text-center hover:bg-surface-container-low transition-colors cursor-pointer group shadow-inner border border-dashed border-outline-variant/40"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                          </div>
                          <p className="font-label-md text-label-md text-on-surface mt-1">
                            Tarik &amp; lepas file materi (
                            <span className="text-secondary font-mono">.pdf, .docx, .xlsx, .zip</span>) atau{' '}
                            <span className="text-primary underline">klik untuk memilih</span>
                          </p>
                          <p className="font-caption text-caption text-outline">
                            Maksimal 10MB per berkas sesuai regulasi SPADA LMS UPGRIS
                          </p>
                        </div>
                      </div>

                      {/* List of Uploaded Materials */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                        {materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:bg-surface-container-high/60 transition-colors border border-outline-variant/20"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                  mat.type === 'pdf'
                                    ? 'bg-error-container/30 text-error'
                                    : 'bg-primary-container/20 text-primary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[22px]">
                                  {mat.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-label-sm text-label-sm text-on-surface font-medium truncate">
                                  {mat.name}
                                </p>
                                <p className="font-caption text-caption text-outline">
                                  {mat.size} • {mat.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded mr-1">
                                {mat.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => showToast(`Mengunduh berkas: ${mat.name}`)}
                                className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                                title="Unduh"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => showToast(`Mengubah metadata ${mat.name}`)}
                                className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors"
                                title="Edit Metadata"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-error transition-colors"
                                title="Hapus Berkas"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 3: Penugasan Pertemuan 3 */}
                    <div className="space-y-space-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-[18px]">assignment</span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Penugasan &amp; Aktivitas Mandiri Pertemuan 3
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Membuka dialog tambah penugasan pertemuan ini')}
                          className="font-caption text-caption text-primary hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span> Tambah Tugas Sesi Ini
                        </button>
                      </div>

                      {/* Task Card */}
                      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-sm border border-outline-variant/20">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-label-md text-label-md text-on-surface font-semibold">
                                Tugas 01: Penyusunan Dokumen SRS Fungsional
                              </span>
                              <span className="font-caption text-caption bg-secondary-container/30 text-secondary px-2 py-0.5 rounded font-mono">
                                Bobot 15%
                              </span>
                            </div>
                            <div className="flex items-center gap-3 font-caption text-caption text-outline flex-wrap">
                              <span className="flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[14px] text-error">event</span> Batas: 19
                                Okt 2026, 23:59 WIB
                              </span>
                              <span>•</span>
                              <span className="text-tertiary font-medium">14 dari 38 Mahasiswa Mengumpulkan</span>
                              <span>•</span>
                              <span className="text-secondary">Penilaian OBE CPMK-2</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigate) {
                                onNavigate('pemeriksaan-tugas');
                              } else {
                                showToast('Membuka lembar penilaian tugas...');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary hover:text-on-primary-container font-label-sm text-label-sm transition-all flex items-center gap-1.5 font-medium border border-primary/30"
                          >
                            <span>Buka Lembar Penilaian (Skor 0-100)</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* P4: Collapsed Row */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm hover:bg-surface-container transition-all flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest text-outline flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P4
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        Pemodelan Sistem: Use Case Diagram &amp; Skenario
                      </span>
                      <span className="font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded">
                        Pra-UTS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption">
                      <span className="text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">description</span> 1 Materi (Draf)
                      </span>
                      <span className="text-outline">•</span>
                      <span className="text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock_clock</span> Presensi: Belum Dibuka
                      </span>
                      <span className="text-outline">•</span>
                      <span className="bg-surface-container-highest text-outline px-1.5 py-0.5 rounded">
                        Draf Belum Terbit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('menejemen-material')}
                    className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest font-caption text-caption text-on-surface transition-colors"
                  >
                    Kelola
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('p4')}
                    className="text-outline hover:text-on-surface"
                    aria-label="Toggle P4"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        openAccordions.p4 ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>

              {/* P5: Collapsed Row */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm hover:bg-surface-container transition-all flex flex-wrap items-center justify-between gap-3 border border-outline-variant/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest text-outline flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P5
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        Pemodelan Dinamis: Activity &amp; Sequence Diagram
                      </span>
                      <span className="font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded">
                        Pra-UTS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption text-outline">
                      <span>0 Materi</span>
                      <span>•</span>
                      <span>Presensi: Belum Dibuka</span>
                      <span>•</span>
                      <span className="bg-surface-container-highest px-1.5 py-0.5 rounded">Draf</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('menejemen-material')}
                    className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest font-caption text-caption text-on-surface transition-colors"
                  >
                    Kelola
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('p5')}
                    className="text-outline hover:text-on-surface"
                    aria-label="Toggle P5"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform ${
                        openAccordions.p5 ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                </div>
              </div>

              {/* P8: UTS MILESTONE */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-secondary/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P8
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-secondary font-bold">
                        Ujian Tengah Semester (UTS) — Teori &amp; Praktik
                      </span>
                      <span className="font-caption text-caption bg-surface-container-highest text-on-surface px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">calendar_today</span> 10 Nov 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption">
                      <span className="text-secondary font-semibold">Bobot 25%</span>
                      <span className="text-outline">•</span>
                      <span className="text-error">Gatekeeper Presensi: Min. 70%</span>
                      <span className="text-outline">•</span>
                      <span className="text-tertiary">Bank Soal Siap (Terkunci)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast('Membuka konfigurasi Ujian Tengah Semester (UTS)')}
                    className="px-3 py-1 rounded bg-surface-container-highest hover:bg-surface-bright font-caption text-caption text-secondary transition-colors font-medium border border-secondary/20"
                  >
                    Konfigurasi Ujian
                  </button>
                </div>
              </div>

              {/* P9-15 SESSIONS SUMMARY BANNER */}
              <div className="p-3 rounded-lg bg-surface-container-lowest/80 flex items-center justify-between font-caption text-caption text-outline border border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                  <span>
                    Pertemuan 9 s/d 15 (Arsitektur Desain, Clean Code, Pengujian Unit &amp; CI/CD) • Terjadwal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleAccordion('p9_15');
                    showToast(
                      openAccordions.p9_15
                        ? 'Sesi 9-15 disembunyikan'
                        : 'Menampilkan detail sesi pasca-UTS (P9 s/d P15)'
                    );
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {openAccordions.p9_15 ? 'Sembunyikan Sesi 9-15' : 'Tampilkan Sesi 9-15'}
                </button>
              </div>

              {/* P9-15 Expanded list if toggled */}
              {openAccordions.p9_15 && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/30 py-2">
                  {[
                    { num: 9, title: 'Arsitektur Desain Perangkat Lunak (MVC, Layered)' },
                    { num: 10, title: 'Prinsip SOLID & Clean Code' },
                    { num: 11, title: 'Design Patterns: Creational & Structural' },
                    { num: 12, title: 'Design Patterns: Behavioral & Refactoring' },
                    { num: 13, title: 'Software Testing: Unit Test & Test-Driven Development' },
                    { num: 14, title: 'Integration Testing & CI/CD Pipelines' },
                    { num: 15, title: 'Dokumentasi & Release Management' },
                  ].map((session) => (
                    <div
                      key={session.num}
                      className="p-3 rounded-lg bg-surface-container-low text-xs flex items-center justify-between border border-outline-variant/15"
                    >
                      <span className="font-semibold text-on-surface">
                        P{session.num}: {session.title}
                      </span>
                      <span className="text-outline text-[11px]">Pasca-UTS • Terjadwal</span>
                    </div>
                  ))}
                </div>
              )}

              {/* P16: UAS MILESTONE */}
              <div className="bg-surface-container-low rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low border border-error/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-error-container/40 text-error flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                    P16
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-label-md text-label-md text-error font-bold">
                        Ujian Akhir Semester (UAS) — Evaluasi Proyek Akhir
                      </span>
                      <span className="font-caption text-caption bg-surface-container-highest text-on-surface px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">flag</span> Jan 2027
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap font-caption text-caption">
                      <span className="text-error font-semibold">Bobot 35%</span>
                      <span className="text-outline">•</span>
                      <span className="text-on-surface-variant">Presentasi Tim + Laporan Repositori GitHub</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast('Membuka rubrik penilaian UAS')}
                    className="px-3 py-1 rounded bg-surface-container-highest hover:bg-surface-bright font-caption text-caption text-on-surface transition-colors font-medium border border-outline-variant/20"
                  >
                    Setup Rubrik
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY ATTENDANCE CONTROL PANEL (~32% / w-96) */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-20 space-y-space-md">
            {/* Main Controller Card */}
            <div className="bg-surface-container-low rounded-xl shadow-xl p-space-md space-y-space-md border border-outline-variant/20">
              {/* Panel Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        presensiState === 'B'
                          ? 'bg-tertiary animate-pulse'
                          : presensiState === 'A'
                          ? 'bg-outline'
                          : 'bg-error'
                      }`}
                    ></span>
                    <h2 className="font-title-md text-title-md text-on-surface font-bold">
                      Kontrol Presensi Sesi 3
                    </h2>
                  </div>
                  <p className="font-caption text-caption text-outline mt-0.5">Rekayasa Perangkat Lunak (TI-A)</p>
                </div>
                <span className="font-caption text-caption bg-surface-container-highest text-secondary px-2 py-0.5 rounded font-mono font-semibold">
                  {presensiState === 'B' ? 'P3 LIVE' : presensiState === 'A' ? 'P3 DRAF' : 'P3 CLOSED'}
                </span>
              </div>

              {/* State Switcher Simulation Pills */}
              <div className="space-y-1">
                <label className="font-caption text-caption uppercase tracking-wider text-outline block">
                  Simulasi Status Presensi:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setPresensiState('A');
                      showToast('Mode Simulasi: Sesi Presensi Draf / Belum Dibuka');
                    }}
                    className={`px-1.5 py-1 rounded font-caption text-caption transition-colors truncate text-center ${
                      presensiState === 'A'
                        ? 'bg-surface-container-highest text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    A: Draf Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPresensiState('B');
                      showToast('Mode Simulasi: Sesi Presensi Sedang Dibuka (Live)');
                    }}
                    className={`px-1.5 py-1 rounded font-caption text-caption transition-colors truncate text-center ${
                      presensiState === 'B'
                        ? 'bg-tertiary-container text-on-tertiary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    B: Buka (Aktif)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPresensiState('C');
                      showToast('Mode Simulasi: Sesi Presensi Selesai & Ditutup');
                    }}
                    className={`px-1.5 py-1 rounded font-caption text-caption transition-colors truncate text-center ${
                      presensiState === 'C'
                        ? 'bg-surface-container-highest text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    C: Ditutup
                  </button>
                </div>
              </div>

              {/* STATE B VIEW: AKTIF */}
              {presensiState === 'B' && (
                <div className="space-y-space-sm animate-fade-in">
                  {/* Active Status Banner */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-tertiary-container/20 border border-tertiary/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                      <span className="font-label-sm text-label-sm text-tertiary font-bold">
                        Sesi Presensi Aktif
                      </span>
                    </div>
                    <span className="font-caption text-caption font-mono text-on-surface bg-surface-container-high px-2 py-0.5 rounded">
                      Waktu: 00:12:40
                    </span>
                  </div>

                  {/* Counter & Progress Widget */}
                  <div className="bg-surface-container rounded-xl p-4 space-y-3 border border-outline-variant/15">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-display-hero text-headline-lg font-bold text-on-surface tracking-tight">
                          18
                        </span>
                        <span className="font-title-lg text-title-lg text-outline"> / 38</span>
                      </div>
                      <span className="font-label-md text-label-md text-tertiary font-bold">47.4% Hadir</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Mahasiswa Sudah Mengisi Kehadiran Hari Ini
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full transition-all duration-500"
                        style={{ width: '47.4%' }}
                      ></div>
                    </div>
                    {/* Toleransi Sisa Waktu */}
                    <div className="flex items-center justify-between font-caption text-caption pt-1 text-on-surface-variant">
                      <span className="flex items-center gap-1 text-secondary">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        Sisa Toleransi: 12m 20d
                      </span>
                      <span className="text-outline">Batas: 10:15 WIB</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiState('C');
                        showToast('Sesi presensi Pertemuan 3 telah resmi ditutup & dikunci.');
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-error-container/30 hover:bg-error-container text-error font-label-md text-label-md transition-colors flex items-center justify-center gap-2 shadow-sm font-semibold border border-error/20"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>Tutup Sesi Presensi Sekarang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Toleransi waktu diperpanjang +10 menit')}
                      className="w-full py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary font-caption text-caption transition-colors flex items-center justify-center gap-1.5 font-medium border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-[14px]">more_time</span>
                      <span>Perpanjang Toleransi (+10 Menit)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE A VIEW: DRAF TUTUP */}
              {presensiState === 'A' && (
                <div className="space-y-space-sm animate-fade-in">
                  <div className="p-4 rounded-lg bg-surface-container text-center space-y-2 border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[28px] text-outline">lock_clock</span>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Presensi Belum Dibuka
                    </p>
                    <p className="font-caption text-caption text-outline leading-relaxed">
                      Batas toleransi default 15 menit dengan verifikasi geolokasi / IP Kampus.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPresensiState('B');
                        showToast('Sesi presensi Pertemuan 3 telah dibuka (Toleransi 15 Menit)');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:bg-primary transition-all mt-2"
                    >
                      Buka Sesi Presensi Mahasiswa
                    </button>
                  </div>
                </div>
              )}

              {/* STATE C VIEW: DITUTUP / TERKUNCI */}
              {presensiState === 'C' && (
                <div className="space-y-space-sm animate-fade-in">
                  <div className="p-4 rounded-lg bg-surface-container text-center space-y-2 border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[28px] text-tertiary">check_circle</span>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">
                      Sesi Selesai &amp; Terkunci
                    </p>
                    <p className="font-caption text-caption text-outline">
                      32 Hadir • 2 Sakit • 1 Izin • 3 Alpa
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('daftar-hadir-koreksi');
                        } else {
                          showToast('Membuka tabel koreksi manual kehadiran...');
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary font-label-sm text-label-sm font-semibold transition-colors mt-2 border border-outline-variant/20"
                    >
                      Koreksi Manual Kehadiran
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE ATTENDANCE STREAM (ACTIVE IN STATE B) */}
              <div className="space-y-space-sm pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Kehadiran Terkini
                  </span>
                  <span className="font-caption text-caption text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] animate-spin">sync</span> 10d lalu
                  </span>
                </div>

                {/* Compact Stream List (5 recent students) */}
                <div className="space-y-1.5 font-body-sm text-body-sm">
                  {/* Student 1 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-caption text-caption font-bold shrink-0">
                        DP
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-on-surface truncate">Dimas Arya Pratama</p>
                        <p className="font-caption text-caption text-outline">NIM: 24670001</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded font-bold">
                        HADIR
                      </span>
                      <p className="font-caption text-caption text-outline mt-0.5">09:18 • IP Kampus</p>
                    </div>
                  </div>

                  {/* Student 2 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-caption text-caption font-bold shrink-0">
                        AF
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-on-surface truncate">Ahmad Fauzi</p>
                        <p className="font-caption text-caption text-outline">NIM: 24670002</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded font-bold">
                        HADIR
                      </span>
                      <p className="font-caption text-caption text-outline mt-0.5">09:19 • IP Kampus</p>
                    </div>
                  </div>

                  {/* Student 3 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center font-caption text-caption font-bold shrink-0">
                        SN
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-on-surface truncate">Siti Nurhaliza</p>
                        <p className="font-caption text-caption text-outline">NIM: 24670008</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded font-bold">
                        HADIR
                      </span>
                      <p className="font-caption text-caption text-outline mt-0.5">09:20 • IP Kampus</p>
                    </div>
                  </div>

                  {/* Student 4 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-caption text-caption font-bold shrink-0">
                        BS
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-on-surface truncate">Bagas Saputra</p>
                        <p className="font-caption text-caption text-outline">NIM: 24670014</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded font-bold">
                        HADIR
                      </span>
                      <p className="font-caption text-caption text-secondary mt-0.5">09:22 • Mobile</p>
                    </div>
                  </div>

                  {/* Student 5 */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-caption text-caption font-bold shrink-0">
                        KS
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-on-surface truncate">Kevin Sanjaya</p>
                        <p className="font-caption text-caption text-outline">NIM: 24670019</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-caption text-caption text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded font-bold">
                        HADIR
                      </span>
                      <p className="font-caption text-caption text-outline mt-0.5">09:24 • IP Kampus</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('daftar-hadir-koreksi');
                    } else {
                      showToast('Membuka lembar rekap presensi seluruh mahasiswa...');
                    }
                  }}
                  className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 pt-1 text-center w-full"
                >
                  <span>Lihat Semua 18 Mahasiswa Hadir &amp; Rekap Lengkap</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Quick Tips Card for Lecturers */}
            <div className="bg-surface-container-low/60 rounded-xl p-space-md space-y-2 border border-outline-variant/15">
              <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Catatan Dosen Pengampu</span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                Toleransi keterlambatan baku SPADA UPGRIS adalah 15 menit. Mahasiswa yang mengisi presensi di
                luar radius Lab atau jaringan WiFi Kampus akan ditandai dengan label{' '}
                <span className="text-secondary font-medium">Mobile</span> untuk ditinjau saat evaluasi
                kehadiran mingguan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
