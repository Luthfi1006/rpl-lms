import React, { useState } from 'react';

/**
 * ManajemenMaterial — Feature Component
 *
 * Konversi menejemen_material.html ke framework React modular & interaktif.
 * Mengelola berkas pembelajaran terproteksi sesuai aturan Enclave BR-009 & NFR-005:
 * - State Controller Tabs:
 *   1. Tampilan Lengkap
 *   2. State 1: Modal Hapus Berkas Pembelajaran
 *   3. State 2: 403 Forbidden (RBAC-LOCK / Direct Enrollment Required)
 *   4. State 3: Unduhan In-Flight (Progress 45% & SHA-256 validation)
 * - Jejak Audit Keamanan Dokumen (Audit Trail) real-time
 * - Ringkasan Kepatuhan Kebijakan Enrolment & Enkripsi
 */

const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', time: '08:29:12', message: 'Token handshake 0x9AF83B diverifikasi untuk Dr. Awan Rosi (Dosen).', status: 'SUCCESS (200)', statusColor: 'text-tertiary' },
  { id: 'log-2', time: '08:27:04', message: 'Mahasiswa NIM 23670014 ditolak mengunduh berkas materi privat.', status: 'FORBIDDEN (403)', statusColor: 'text-error' },
  { id: 'log-3', time: '08:14:50', message: "Berkas 'Modul 3 — Analisis Kebutuhan Sistem' ditandai untuk penghapusan.", status: 'PENDING CONFIRM', statusColor: 'text-secondary' },
];

export default function ManajemenMaterial({ onNavigate }) {
  // State Controller Tabs: 'all' | 'modal' | 'denied' | 'progress'
  const [activeTab, setActiveTab] = useState('all');

  // Modal delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download progress simulation state
  const [downloadProgress, setDownloadProgress] = useState(45);
  const [transferLabel, setTransferLabel] = useState('Mengunduh… 45% (540 KB / 1.2 MB)');
  const [isSimulatingDownload, setIsSimulatingDownload] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Toast feedback
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3200);
  };

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'modal') {
      setDeleteModalOpen(true);
    } else if (tabKey === 'progress') {
      setDeleteModalOpen(false);
      runProgressSimulation();
    } else {
      setDeleteModalOpen(false);
    }
  };

  const runProgressSimulation = () => {
    setIsSimulatingDownload(true);
    setDownloadProgress(10);
    setTransferLabel('Mengunduh… 10% (120 KB / 1.2 MB)');

    setTimeout(() => {
      setDownloadProgress(30);
      setTransferLabel('Mengunduh… 30% (360 KB / 1.2 MB)');
    }, 400);

    setTimeout(() => {
      setDownloadProgress(45);
      setTransferLabel('Mengunduh… 45% (540 KB / 1.2 MB)');
      setIsSimulatingDownload(false);
    }, 900);
  };

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID');
      const newLog = {
        id: `log-${Date.now()}`,
        time: timeStr,
        message: "Berkas 'Modul 3 — Analisis Kebutuhan Sistem' dihapus permanen oleh Dosen Pengampu.",
        status: 'DELETED (204)',
        statusColor: 'text-error',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      showToast("Materi 'Modul 3 — Analisis Kebutuhan Sistem' berhasil dihapus permanen. Jejak audit telah dicatat.", 'success');
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-lg">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-5 right-5 z-[9999]">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success'
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

      {/* Interactive State Controller & Breadcrumbs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-2">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">school</span>
              <span>Dasbor Dosen</span>
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate && onNavigate('kelas-diampu')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Kelas Diampu
            </button>
            <span>/</span>
            <span className="text-on-surface font-label-sm font-semibold">Rekayasa Perangkat Lunak (TI-A)</span>
            <span>/</span>
            <span className="text-tertiary font-semibold">Pertemuan 3</span>
          </div>
          <div className="flex items-center gap-space-md mt-1 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Manajemen Berkas &amp; Akses Terproteksi
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-caption text-caption">
              <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
              <span>LMS Enclave BR-009 / NFR-005</span>
            </span>
          </div>
        </div>

        {/* Evaluator View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-surface-container-high shadow-inner gap-1 overflow-x-auto">
          <button
            onClick={() => handleTabSwitch('all')}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard_customize</span>
            <span>Tampilan Lengkap</span>
          </button>
          <button
            onClick={() => handleTabSwitch('modal')}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${activeTab === 'modal'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined text-[16px] text-error">delete_forever</span>
            <span>State 1: Modal Hapus</span>
          </button>
          <button
            onClick={() => handleTabSwitch('denied')}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${activeTab === 'denied'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined text-[16px] text-error">gpp_bad</span>
            <span>State 2: 403 Forbidden</span>
          </button>
          <button
            onClick={() => handleTabSwitch('progress')}
            className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${activeTab === 'progress'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
            <span>State 3: Unduhan 45%</span>
          </button>
        </div>
      </div>

      {/* Course Context Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-caption font-bold tracking-wider uppercase bg-secondary-container text-on-secondary-container">
                KODE: TI-304
              </span>
              <span className="text-caption text-secondary font-caption">SKS: 3 (Reguler Pagi)</span>
              <span className="text-caption text-outline font-caption">•</span>
              <span className="text-caption text-on-surface-variant font-caption">
                Ruang Lab RPL 3.02 &amp; SPADA Hybrid
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Rekayasa Perangkat Lunak — Kelas TI-A
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Topik Pembahasan:{' '}
              <span className="text-on-surface font-label-md font-semibold">
                Pertemuan 3 — Analisis Kebutuhan Sistem &amp; Spesifikasi SRS IEEE 830
              </span>
              . Semua berkas pembelajaran dilindungi token sesi terenkripsi SHA-256 untuk mematuhi regulasi integritas konten digital universitas.
            </p>
          </div>
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-space-xs shrink-0 bg-surface-container-high/60 p-space-md rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                Enrolment Guard: Aktif
              </span>
            </div>
            <div className="font-caption text-caption text-on-surface-variant">
              Dosen: <strong className="text-on-surface">Dr. Awan Rosi, M.Kom.</strong>
            </div>
            <div className="font-caption text-caption text-outline">
              NIDN: 0612048401 • Kuota Mahasiswa: 42/45
            </div>
          </div>
        </div>
      </div>

      {/* Main Instructional Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Material Outline & Course Content (8 cols) */}
        <div className="xl:col-span-8 space-y-space-lg">
          {/* Section: Active Topic Description */}
          <div className="rounded-2xl bg-surface-container p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/60">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-headline-md text-title-md font-bold">
                  03
                </span>
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                    Daftar Modul &amp; Berkas Materi Ajar
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Kelola izin baca, unduh, dan kepemilikan materi pembelajaran.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                <span>Uji Dialog Hapus</span>
              </button>
            </div>

            {/* Material Item 1: Standard Active Material (Reference) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high/50 transition-colors gap-space-md">
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[26px]">slideshow</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                      Slide Presentasi — Software Requirements Spec.pptx
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-caption bg-surface-container-highest text-tertiary">
                      Publik
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm font-caption text-caption text-outline mt-0.5">
                    <span>Ukuran: 4.8 MB</span>
                    <span>•</span>
                    <span>Diperbarui: 12 Mar 2026, 09:15 WIB</span>
                    <span>•</span>
                    <span className="text-secondary">38 Mahasiswa Mengunduh</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => showToast('Membuka pratinjau berkas PowerPoint...')}
                  className="p-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Pratinjau Materi"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-2 rounded-lg bg-surface-container-highest hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  title="Hapus Berkas"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>

            {/* STATE 3: SECURE DOWNLOAD IN PROGRESS (Card Component) */}
            {(activeTab === 'all' || activeTab === 'progress' || activeTab === 'modal') && (
              <div className="rounded-xl p-space-md bg-[#EFF6FF] text-[#1E3A8A] shadow-md transition-all">
                <div className="flex flex-col gap-space-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-[26px]">picture_as_pdf</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-title-md text-title-md text-[#0F172A] font-semibold truncate">
                            Modul 3 — Analisis Kebutuhan IEEE 830.pdf
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-caption font-medium bg-[#BFDBFE] text-[#1D4ED8]">
                            1.2 MB
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#166534]">
                            <span className="material-symbols-outlined text-[13px] text-[#16a34a]">verified</span>
                            SHA-256 Token Session Verified
                          </span>
                          <span className="text-caption text-[#475569] hidden md:inline">• IP: 103.247.12.8</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-caption font-label-sm bg-[#DBEAFE] text-[#1E40AF]">
                        <span className={`material-symbols-outlined text-[15px] text-[#2563EB] ${isSimulatingDownload ? 'animate-spin' : ''}`}>
                          sync
                        </span>
                        <span>{transferLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Download Progress Metric Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-[#DBEAFE] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-[#475569]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#2563EB]">speed</span>
                        <span>Kecepatan: 280 KB/s • Sisa waktu: ~2 detik</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#1E40AF]">Terkunci ke NIDN: 0612048401</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2: PROTECTED DOWNLOAD DENIED (403 FORBIDDEN INLINE CARD) */}
            {(activeTab === 'all' || activeTab === 'denied' || activeTab === 'modal') && (
              <div className="rounded-xl p-space-md bg-[#FEF2F2] text-[#7F1D1D] shadow-sm transition-all border border-red-200/50">
                <div className="flex flex-col md:flex-row items-start gap-space-md">
                  <div className="w-11 h-11 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#DC2626] text-[24px]">gpp_bad</span>
                  </div>
                  <div className="flex-1 space-y-space-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-title-md text-title-md font-semibold text-[#991B1B] flex items-center gap-2">
                        <span>Akses Unduhan Ditolak (HTTP 403 Forbidden)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FEE2E2] text-[#B91C1C]">
                          RBAC-LOCK
                        </span>
                      </h4>
                      <span className="font-caption text-caption text-[#991B1B]/80 font-mono">
                        Kode Insiden: #SEC-403-DirectEnrol
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-[#7F1D1D] leading-relaxed">
                      Akun Anda tidak terdaftar pada kelas ini (
                      <strong className="underline decoration-[#DC2626]/40">
                        Direct Enrollment Admin required
                      </strong>
                      ), sehingga berkas materi privat ini tidak dapat diunduh (Sesuai protokol integritas{' '}
                      <code className="bg-[#FEE2E2] px-1 py-0.5 rounded text-xs font-mono font-bold">
                        BR-009 &amp; NFR-005
                      </code>
                      ).
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md pt-2">
                      <button
                        onClick={() => onNavigate && onNavigate('dasbor-dosen')}
                        className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#FEE2E2] text-[#991B1B] font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Kembali ke Dasbor</span>
                      </button>
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          showToast('Menghubungi Tim Dukungan BAAK UPGRIS...');
                        }}
                        className="font-label-md text-label-md text-[#991B1B] hover:text-[#7F1D1D] underline decoration-current flex items-center gap-1 transition-colors cursor-pointer"
                        href="#"
                      >
                        <span className="material-symbols-outlined text-[16px]">support_agent</span>
                        <span>Hubungi BAAK / Admin Pusat LMS</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Material Item 4: Additional Reference Component */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high/50 transition-colors gap-space-md opacity-90">
              <div className="flex items-center gap-space-md min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[26px]">terminal</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                      Template Dokumen SRS — IEEE Std 830-1998.docx
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-caption bg-surface-container-highest text-outline">
                      Format Standar
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm font-caption text-caption text-outline mt-0.5">
                    <span>Ukuran: 640 KB</span>
                    <span>•</span>
                    <span>Checksum MD5: Validated</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => showToast('Mengunduh Template Dokumen SRS IEEE 830...')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Unduh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Log Panel (Governance & Compliance) */}
          <div className="rounded-2xl bg-surface-container-low p-space-md space-y-space-sm shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  Jejak Audit Keamanan Dokumen (Audit Trail)
                </span>
              </div>
              <span className="text-caption text-tertiary font-caption flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Sinkronisasi Realtime
              </span>
            </div>
            <div className="divide-y divide-surface-container-high/40 text-caption text-on-surface-variant">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between">
                  <span className="font-mono text-outline">[{log.time}] {log.message}</span>
                  <span className={`font-semibold ${log.statusColor}`}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Policy & Enrollment Summary (4 cols) */}
        <div className="xl:col-span-4 space-y-space-lg">
          {/* Live Security Enclave Card */}
          <div className="rounded-2xl bg-surface-container p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
              </div>
              <div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold">
                  Validasi Akses Berkas
                </h4>
                <p className="font-caption text-caption text-outline">Protokol Keamanan SPADA UPGRIS</p>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-sm">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-body-sm">Kepatuhan RBAC:</span>
                <span className="text-tertiary font-label-sm font-semibold">Tingkat Enkripsi 2</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-body-sm">Aturan BR-009:</span>
                <span className="text-on-surface font-label-sm font-semibold">Enrolment Ketat</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-body-sm">Aturan NFR-005:</span>
                <span className="text-on-surface font-label-sm font-semibold">In-Flight Hash Check</span>
              </div>
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant font-body-sm">Masa Sesi Unduh:</span>
                <span className="text-secondary font-label-sm font-semibold">15 Menit Aktif</span>
              </div>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container-high/40 text-caption text-outline space-y-1">
              <div className="font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">info</span>
                Catatan Dosen Pengampu:
              </div>
              <p className="leading-relaxed">
                Menghapus materi pembelajaran yang telah memiliki riwayat unduhan mahasiswa akan memicu notifikasi peringatan ke dasbor BAAK.
              </p>
            </div>
          </div>

          {/* Quick Action Controls for Evaluators */}
          <div className="rounded-2xl bg-surface-container p-space-lg shadow-sm space-y-space-md">
            <h4 className="font-title-md text-title-md text-on-surface flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
              Kontrol Simulasi State
            </h4>
            <p className="font-caption text-caption text-on-surface-variant">
              Gunakan tombol di bawah untuk melihat respons visual masing-masing state secara dinamis:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-error/15 hover:bg-error/25 text-error font-label-sm text-label-sm flex items-center justify-between transition-colors cursor-pointer font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Buka Modal Hapus (State 1)</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
              <button
                onClick={runProgressSimulation}
                disabled={isSimulatingDownload}
                className="w-full py-2.5 px-3 rounded-xl bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary font-label-sm text-label-sm flex items-center justify-between transition-colors cursor-pointer font-semibold"
              >
                <span className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[18px] ${isSimulatingDownload ? 'animate-spin' : ''}`}>
                    autorenew
                  </span>
                  <span>Ulang Simulasi Download 45%</span>
                </span>
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATE 1: DELETE MATERIAL CONFIRMATION MODAL ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/55 backdrop-blur-[6px] transition-opacity duration-300">
          <div className="relative w-full max-w-[480px] bg-[#FFFFFF] rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] p-[24px] text-left transform transition-all duration-300">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              title="Tutup Dialog"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex flex-col gap-space-md">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#DC2626] text-[26px]">delete</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-[18px] font-semibold text-[#0F172A] leading-snug">
                  Hapus Materi Pembelajaran?
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed">
                  Materi <strong className="text-[#0F172A] font-medium">'Modul 3 — Analisis Kebutuhan Sistem'</strong> akan dihapus permanen dan tidak dapat diakses lagi oleh mahasiswa yang terdaftar.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] text-[#92400E]">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                <p className="text-[12px] leading-relaxed font-medium">
                  Tindakan ini tidak dapat dibatalkan. Riwayat audit akan mencatat penghapusan berkas ini sesuai regulasi SPADA UPGRIS.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-[8px] bg-transparent hover:bg-[#F1F5F9] text-[#334155] font-medium text-[14px] transition-colors text-center cursor-pointer"
                  type="button"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-medium text-[14px] flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center cursor-pointer"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isDeleting ? 'animate-spin' : ''}`}>
                    {isDeleting ? 'refresh' : 'delete'}
                  </span>
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Materi'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

