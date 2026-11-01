import { useState, useEffect, useCallback } from 'react';
import AppShell from './components/AppShell';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';
import ForgotPasswordPage from './pages/ForgotPassword';
import LoginPage from './pages/Login';
import DasborDosenPage from './pages/DasborDosen';
import DasborAdminPage from './pages/DasborAdmin';
import AppShellGlobalPage from './pages/AppShellGlobal';
import DirectEnrollmentPage from './pages/DirectEnrollment';
import ManajenenPenggunaPage from './pages/ManajemenPengguna';
import MasterMataKuliahPage from './pages/MasterMataKuliah';
import PembukaanKelasPage from './pages/PembukaanKelas';
import JejakAuditPage from './pages/JejakAudit';
import StatusPresensiPage from './pages/StatusPresensi';

// Peta rute yang tersedia (routing via query string ?page=... atau path-based)
// Keys harus match dengan Sidebar menu paths
const ROUTES = {
  'dasbor-mahasiswa': 'dasbor-mahasiswa',
  'kelas-saya': 'kelas-saya',
  'panduan-belajar': 'panduan-belajar',
  'central-timeline': 'central-timeline',
  'rekap-nilai-dan-presensi': 'rekap-nilai-dan-presensi',
  'dasbor-dosen': 'dasbor-dosen',
  'pemeriksaan-tugas': 'pemeriksaan-tugas',
  'direct-enrollment': 'direct-enrollment',
  'manajemen-pengguna': 'manajemen-pengguna',
  'master-mata-kuliah': 'master-mata-kuliah',
  'pembukaan-kelas': 'pembukaan-kelas',
  'jejak-audit': 'jejak-audit',
  'konfigurasi-sistem': 'konfigurasi-sistem',
  'status-presensi': 'status-presensi',
  // Auth routes (not in sidebar but valid for navigation)
  'login': 'login',
  'forgot-password': 'forgot-password',
  'app-shell': 'app-shell',
};

// Halaman khusus yang punya komponen sendiri (standalone, tidak menggunakan AppShell)
const SPECIAL_ROUTES = {
  'forgot-password': ForgotPasswordPage,
  'login': LoginPage,
};

function App() {
  // Helper: normalize route to key (no leading slash, no query params, no hash)
  const normalizeRoute = useCallback((route) => {
    if (!route) return 'dasbor-mahasiswa';
    // Handle full URLs with hash (e.g., '#/page=foo' or '#foo')
    if (route.includes('#')) {
      const hashPart = route.split('#')[1] || '';
      // Handle hash-based query string like #?page=foo
      if (hashPart.startsWith('?') || hashPart.startsWith('page=')) {
        const searchParams = new URLSearchParams(hashPart.replace('?', ''));
        const pageParam = searchParams.get('page');
        if (pageParam) return pageParam;
      }
      // Handle hash path like #foo
      return hashPart.startsWith('/') ? hashPart.slice(1) : hashPart;
    }
    // Handle full URLs with query strings
    if (route.includes('?')) {
      const searchParams = new URLSearchParams(route.split('?')[1]);
      const pageParam = searchParams.get('page');
      if (pageParam) return pageParam;
    }
    // Strip leading slash if present
    return route.startsWith('/') ? route.slice(1) : route;
  }, []);

  // Deteksi peran aktif via URL / query param (?role=dosen|mahasiswa|admin)
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = searchParams.get('role') ||
    (pathname.includes('/admin') ? 'admin' : pathname.includes('/dosen') ? 'dosen' : 'mahasiswa');
  const [activeRole, setActiveRole] = useState(initialRole);

  // Dukungan routing reaktif untuk pratinjau halaman Lupa Password
  // SSR-safe: gunakan lazy initializer dengan check typeof window
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return 'dasbor-mahasiswa';
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) return pageParam;
    // Path-based route: strip leading slash
    const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
    // Handle special path-based routes for backward compatibility
    if (path === 'forgot-password') return 'forgot-password';
    // Default to dashboard if empty (root path '/')
    return path || 'dasbor-mahasiswa';
  });

  // pushState tidak memicu popstate, jadi tidak perlu flag isProgrammaticNavigation
  // popstate hanya memicu saat user klik back/forward browser

  useEffect(() => {
    const handleLocationChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      if (pageParam) {
        // Validate route against known routes before setting
        const isKnownRoute = pageParam in ROUTES || pageParam in SPECIAL_ROUTES;
        if (isKnownRoute) {
          setCurrentRoute(pageParam);
        } else {
          console.warn(`[App] Invalid route in URL: "${pageParam}". Redirecting to dashboard.`);
          window.history.replaceState({}, '', '?page=dasbor-mahasiswa');
          setCurrentRoute('dasbor-mahasiswa');
        }
        return;
      }
      const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
      // Handle special path-based routes for backward compatibility
      if (path === 'forgot-password') {
        setCurrentRoute('forgot-password');
        return;
      }
      setCurrentRoute(path || 'dasbor-mahasiswa');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const resolveTargetUrl = useCallback((route) => {
    // Normalisasi route ke query string format
    if (route === '/') {
      // Root path -> dashboard
      return `?page=dasbor-mahasiswa`;
    }
    if (route.startsWith('/')) {
      // Path-based route: strip leading slash
      return `?page=${route.slice(1)}`;
    }
    // Handle full query string (e.g., '?page=foo' or '?page=foo&tab=bar')
    if (route.startsWith('?')) {
      return route;
    }
    return `?page=${route}`;
  }, []);

  const navigateTo = useCallback((route) => {
    let targetUrl = resolveTargetUrl(route);
    const routeKey = normalizeRoute(route);

    // Validasi route: hanya izinkan route yang ada di ROUTES atau SPECIAL_ROUTES
    const isKnownRoute = routeKey in ROUTES || routeKey in SPECIAL_ROUTES;
    if (!isKnownRoute) {
      console.warn(`[App] Navigasi ke route tidak dikenal: "${routeKey}". Redirect ke dashboard.`);
      // Fallback ke dashboard
      window.history.pushState({}, '', '?page=dasbor-mahasiswa');
      setCurrentRoute('dasbor-mahasiswa');
      return;
    }

    // Pertahankan param role agar peran aktif tidak hilang saat navigasi
    const currentRole = new URLSearchParams(window.location.search).get('role');
    if (currentRole && !targetUrl.includes('role=')) {
      targetUrl += `${targetUrl.includes('?') ? '&' : '?'}role=${currentRole}`;
    }

    // pushState tidak memicu popstate, langsung set state
    window.history.pushState({}, '', targetUrl);
    setCurrentRoute(routeKey);
  }, [resolveTargetUrl, normalizeRoute]);

  const handleBack = useCallback(() => {
    // Navigasi ke halaman yang sesuai berdasarkan route saat ini
    // Jika di halaman forgot-password, kembali ke login page
    // Jika di halaman lain (special routes), kembali ke dashboard
    const routeKey = normalizeRoute(currentRoute);
    if (routeKey === 'forgot-password') {
      navigateTo('login');
    } else {
      navigateTo('/');
    }
  }, [navigateTo, currentRoute]);

  // Ganti peran (mahasiswa <-> dosen <-> admin) dan sinkronkan dengan URL ?role=...
  const handleRoleChange = useCallback((newRole) => {
    setActiveRole(newRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    window.history.pushState({}, '', url);
  }, []);

  // Auth route: halaman Lupa Password selalu tampil standalone
  const routeKey = normalizeRoute(currentRoute);
  if (routeKey === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} onBack={handleBack} />;
  }

  // Status Presensi page (mahasiswa only) - uses AppShell pattern
  if (routeKey === 'status-presensi' && activeRole !== 'dosen' && activeRole !== 'admin') {
    return (
      <AppShell
        activeRole="mahasiswa"
        onRoleChange={handleRoleChange}
        activeNavPath="status-presensi"
        onNavChange={navigateTo}
      >
        <StatusPresensiPage onNavigate={navigateTo} onRoleChange={handleRoleChange} />
      </AppShell>
    );
  }

  // Peran Dosen aktif -> render Dasbor Dosen terdedikasi (shell sendiri)
  if (activeRole === 'dosen') {
    return <DasborDosenPage onRoleChange={handleRoleChange} />;
  }

  // Peran Admin aktif -> render Dasbor Admin terdedikasi
  if (activeRole === 'admin') {
    return <DasborAdminPage onRoleChange={handleRoleChange} />;
  }

  // Cek apakah route adalah halaman khusus yang punya komponen sendiri
  const SpecialPage = SPECIAL_ROUTES[routeKey];
  if (SpecialPage) {
    return <SpecialPage onNavigate={navigateTo} onBack={handleBack} />;
  }

  // Default: Dasbor Mahasiswa dengan AppShell reusable
  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={handleRoleChange}
      activeNavPath={routeKey}
      onNavChange={navigateTo}
    >
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb />
        <GreetingBanner />
        <SummaryCards />
        <CourseCards />
        <AnnouncementBanner />

        {/* Quick Metrics / Central Timeline Mini Widget */}
        <section
          aria-labelledby="timeline-widget-heading"
          className="grid grid-cols-1 lg:grid-cols-3 gap-space-md"
        >
          <AssignmentWidget />
          <AttendanceWidget />
        </section>
      </div>
    </AppShell>
  );
}

export default App;