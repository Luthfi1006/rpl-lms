import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { ATTENDANCE_CLOSED_MESSAGE } from '../src/modules/attendance/attendance.service.js';

describe('Fase 5 MVP 2: Rekapitulasi & Auto-close Sesi (B1-B8 Verification)', () => {
  let server;
  let baseUrl;

  let dosenToken;
  let dosenLainToken;
  let mahasiswaToken;
  let mahasiswaLuarToken;

  let lecturer;
  let student1;
  let testClass;
  let meeting1;
  let suffix;

  // Jejak data uji untuk pembersihan di after() (REG-05: tanpa residu)
  let sessionId;
  let mhsUserId;
  let mhsLuarUserId;

  const request = (path, { method = 'GET', token, body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  async function login(identifier) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: 'password123' }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200, `Login ${identifier} gagal`);
    return payload.data.accessToken;
  }

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    // Login menggunakan data yang ada di seeder (NIDN dosen1: 198501152010121002, mahasiswa1: NIM biasanya dari seeder)
    dosenToken = await login('198501152010121002');
    dosenLainToken = await login('199003202015042001');
    
    // Perlu mengetahui NIM mahasiswa dari seeder.
    // Jika seeder tidak pasti, kita buat user baru untuk pengujian.
    suffix = Date.now().toString().slice(-6);
    const mhsUser = await prisma.user.create({
      data: {
        username: 'testuser_fase5_' + suffix,
        email: 'testuser_fase5_' + suffix + '@kampus.ac.id',
        password_hash: await import('bcryptjs').then(b => b.default.hash('password123', 10)),
        role: 'mahasiswa',
        profile: { create: { full_name: 'Mhs Test ' + suffix } },
        mahasiswa: { create: { nim: '20249' + suffix, prodi: 'TI', angkatan: 2024 } }
      }
    });
    mhsUserId = mhsUser.id;
    mahasiswaToken = await login('testuser_fase5_' + suffix);
    student1 = await prisma.mahasiswa.findUnique({ where: { user_id: mhsUser.id } });

    // Dosen pengampu
    lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });

    testClass = await prisma.class.create({
      data: {
        course: { create: { code: 'CS' + suffix, name: 'Computer Science', credits: 3 } },
        lecturer: { connect: { id: lecturer.id } },
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: 'Kelas Test 5',
      },
    });

    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: student1.id, enrolled_by: lecturer.user_id },
    });

    for (let i = 1; i <= 16; i++) {
      const m = await prisma.meeting.create({
        data: { class_id: testClass.id, meeting_number: i, title: 'Pertemuan ' + i },
      });
      if (i === 1) meeting1 = m;
    }
  });

  after(async () => {
    // Bersihkan seluruh data uji agar tidak meninggalkan residu (REG-05).
    // Urutan: audit log → kelas (cascade meeting/sesi/records/enrollment) →
    // course → user uji (cascade profile/mahasiswa).
    if (sessionId) {
      await prisma.auditLog.deleteMany({ where: { entity_id: sessionId } });
    }
    if (testClass) {
      await prisma.class.delete({ where: { id: testClass.id } });
      await prisma.course.delete({ where: { id: testClass.course_id } });
    }
    const userIds = [mhsUserId, mhsLuarUserId].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await new Promise((resolve) => server.close(resolve));
  });

  test('B2: 404 jika sesi tidak ada', async () => {
    // Gunakan UUID valid yang tidak ada di DB
    const res = await request('/api/attendance/00000000-0000-0000-0000-000000000000/records', { token: dosenToken });
    assert.strictEqual(res.status, 404);
  });

  test('B4: Dosen bukan pengampu ditolak 403 dan tidak memicu auto-close', async () => {
    // Buka sesi presensi dengan dosen pengampu
    const openRes = await request('/api/meetings/' + meeting1.id + '/attendance/open', {
      method: 'POST',
      token: dosenToken,
      body: { tolerance_minutes: 1 },
    });
    assert.strictEqual(openRes.status, 200);
    const session = (await openRes.json()).data;
    sessionId = session.id;

    // Mundurkan waktu opened_at secara langsung di DB untuk simulasi expired
    const pastDate = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.attendanceSession.update({
      where: { id: session.id },
      data: { opened_at: pastDate },
    });

    // Dosen non pengampu akses records -> harus 403
    const recRes = await request('/api/attendance/' + session.id + '/records', {
      token: dosenLainToken,
    });
    assert.strictEqual(recRes.status, 403);

    // Verifikasi sesi masih OPEN (tidak terjadi auto-close ilegal)
    const checkSession = await prisma.attendanceSession.findUnique({
      where: { id: session.id },
    });
    assert.strictEqual(checkSession.status, 'OPEN');
  });

  test('B1 & B3: Mahasiswa ditolak saat check-in pada sesi expired dan sesi otomatis CLOSED', async () => {
    const session = await prisma.attendanceSession.findFirst({
      where: { meeting_id: meeting1.id },
    });

    // Mahasiswa coba check-in pada sesi yang sudah expired
    const checkinRes = await request('/api/attendance/' + session.id + '/check-in', {
      method: 'POST',
      token: mahasiswaToken,
    });
    assert.strictEqual(checkinRes.status, 400);
    const json = await checkinRes.json();
    assert.strictEqual(json.message, ATTENDANCE_CLOSED_MESSAGE);

    // Verifikasi sesi sekarang sudah CLOSED
    const checkSession = await prisma.attendanceSession.findUnique({
      where: { id: session.id },
    });
    assert.strictEqual(checkSession.status, 'CLOSED');
    assert.ok(checkSession.closed_at !== null);

    // B3: Verifikasi dosen memanggil getSessionRecords sekarang 200 dan ALPA tercatat
    const recRes = await request('/api/attendance/' + session.id + '/records', {
      token: dosenToken,
    });
    assert.strictEqual(recRes.status, 200);
    const recData = await recRes.json();
    const recordMhs = recData.data.records.find((r) => r.student_id === student1.id);
    assert.ok(recordMhs);
    assert.strictEqual(recordMhs.status, 'ALPA');
  });

  test('B5 & B6 & B7: Endpoint rekapitulasi mengembalikan total_sessions=1, matrix=16, dan full_name lengkap', async () => {
    // 1. Cek Rekap Mahasiswa Personal
    const mhsRecapRes = await request('/api/classes/' + testClass.id + '/attendance-recap', {
      token: mahasiswaToken,
    });
    assert.strictEqual(mhsRecapRes.status, 200);
    const mhsRecapData = (await mhsRecapRes.json()).data;

    assert.strictEqual(mhsRecapData.total_sessions, 1);
    assert.strictEqual(mhsRecapData.recap.length, 1);
    assert.strictEqual(mhsRecapData.recap[0].nim, student1.nim);
    assert.ok(mhsRecapData.recap[0].full_name && mhsRecapData.recap[0].full_name.length > 0);
    assert.strictEqual(mhsRecapData.recap[0].matrix.length, 16);
    assert.strictEqual(mhsRecapData.recap[0].matrix[0].meeting_number, 1);
    assert.strictEqual(mhsRecapData.recap[0].matrix[0].status, 'ALPA');
    assert.strictEqual(mhsRecapData.recap[0].matrix[1].status, null);

    // 2. Cek Rekap Dosen (Seluruh Mahasiswa Kelas)
    const dosenRecapRes = await request('/api/classes/' + testClass.id + '/attendance-recap', {
      token: dosenToken,
    });
    assert.strictEqual(dosenRecapRes.status, 200);
    const dosenRecapData = (await dosenRecapRes.json()).data;

    assert.strictEqual(dosenRecapData.total_sessions, 1);
    assert.strictEqual(dosenRecapData.recap.length, 1);
    assert.ok(dosenRecapData.recap[0].full_name && dosenRecapData.recap[0].full_name.length > 0);
    assert.strictEqual(dosenRecapData.recap[0].matrix.length, 16);
  });

  test('Mahasiswa luar kelas ditolak 403 saat akses rekapitulasi', async () => {
    // Buat mahasiswa baru yang tidak ter-enroll ke kelas ini
    const mhsLuarUser = await prisma.user.create({
      data: {
        username: 'testuser_fase5_luar_' + suffix,
        email: 'testuser_fase5_luar_' + suffix + '@kampus.ac.id',
        password_hash: await import('bcryptjs').then(b => b.default.hash('password123', 10)),
        role: 'mahasiswa',
        profile: { create: { full_name: 'Mhs Luar ' + suffix } },
        mahasiswa: { create: { nim: '20250' + suffix, prodi: 'TI', angkatan: 2024 } }
      }
    });
    mhsLuarUserId = mhsLuarUser.id;
    const mhsLuarToken = await login('testuser_fase5_luar_' + suffix);

    const res = await request('/api/classes/' + testClass.id + '/attendance-recap', {
      token: mhsLuarToken,
    });
    assert.strictEqual(res.status, 403);
  });
});
