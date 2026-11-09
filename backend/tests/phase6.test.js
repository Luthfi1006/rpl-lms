import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { formatLecturerName } from '../src/utils/format.js';

describe('Fase 6: Kepatuhan MVP 1 & Handoff API', () => {
  let server;
  let baseUrl;
  let adminToken;
  let studentToken;

  const request = (path, { method = 'GET', token = adminToken, body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    const [adminLogin, studentLogin] = await Promise.all([
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: 'admin', password: 'password123' },
      }),
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001001', password: 'password123' },
      }),
    ]);

    adminToken = (await adminLogin.json()).data.accessToken;
    studentToken = (await studentLogin.json()).data.accessToken;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  test('OpenAPI 3.0 memuat endpoint MVP 1 yang menjadi handoff frontend dengan requestBody & response schemas', async () => {
    const specification = await readFile(new URL('../docs/openapi.yaml', import.meta.url), 'utf8');

    assert.match(specification, /^openapi: 3\.0\.3$/m);
    for (const endpoint of [
      '/auth/login:',
      '/auth/refresh:',
      '/auth/logout:',
      '/auth/forgot-password:',
      '/profile:',
      '/profile/avatar:',
      '/profile/password:',
      '/admin/users:',
      '/admin/courses:',
      '/admin/classes:',
      '/admin/enrollments:',
      '/admin/classes/{classId}/enrollments:',
      '/admin/classes/{classId}/available-students:',
      '/dashboard:',
      '/classes:',
      '/admin/audit-logs:',
    ]) {
      assert.ok(specification.includes(endpoint), `Dokumentasi belum memuat ${endpoint}`);
    }

    // Pastikan requestBody dan skema respon didefinisikan
    assert.ok(specification.includes('$ref: \'#/components/schemas/CreateEnrollmentRequest\''));
    assert.ok(specification.includes('$ref: \'#/components/schemas/CreateCourseRequest\''));
    assert.ok(specification.includes('$ref: \'#/components/schemas/CreateClassRequest\''));
    assert.ok(specification.includes('$ref: \'#/components/schemas/ApiResponse\''));
  });

  test('Multi-role login dan penolakan akun suspended tetap konsisten (dengan teardown terjamin)', async () => {
    const student = await prisma.user.findFirst({
      where: { mahasiswa: { nim: '2024001001' } },
    });

    try {
      await prisma.user.update({
        where: { id: student.id },
        data: { status: 'SUSPENDED' },
      });

      const denied = await request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001001', password: 'password123' },
      });
      assert.equal(denied.status, 403);
    } finally {
      await prisma.user.update({
        where: { id: student.id },
        data: { status: 'ACTIVE' },
      });
    }

    const allowed = await request('/api/auth/login', {
      token: null,
      method: 'POST',
      body: { identifier: '2024001001', password: 'password123' },
    });
    assert.equal(allowed.status, 200);
  });

  test('Endpoint dashboard, ruang kelas, audit log, dan RBAC dapat dipanggil', async () => {
    const dashboardStudent = await request('/api/dashboard', { token: studentToken });
    assert.equal(dashboardStudent.status, 200);

    const classesStudent = await request('/api/classes', { token: studentToken });
    assert.equal(classesStudent.status, 200);

    const auditStudent = await request('/api/admin/audit-logs', {
      token: studentToken,
    });
    assert.equal(auditStudent.status, 403);
  });

  test('Mutasi master dan enrollment menghasilkan jejak audit (dengan teardown data)', async () => {
    const course = await prisma.course.findFirst({ where: { code: 'TIF101' } });
    const originalDesc = course.description;
    const beforeCount = await prisma.auditLog.count({
      where: { entity: { in: ['courses', 'classes', 'enrollments'] } },
    });

    try {
      const response = await request(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        body: { description: `Validasi handoff fase 6 ${Date.now()}` },
      });

      assert.equal(response.status, 200);
      const afterCount = await prisma.auditLog.count({
        where: { entity: { in: ['courses', 'classes', 'enrollments'] } },
      });
      assert.ok(afterCount > beforeCount);
      assert.ok(await prisma.auditLog.findFirst({
        where: { entity: 'courses', entity_id: course.id },
        orderBy: { created_at: 'desc' },
      }));
    } finally {
      await prisma.course.update({
        where: { id: course.id },
        data: { description: originalDesc },
      });
    }
  });

  test('Enrollment konkuren tidak boleh melewati kapasitas kelas dan mengembalikan kode error terstruktur', async () => {
    const course = await prisma.course.findFirst();
    const lecturer = await prisma.dosen.findFirst();
    const students = await prisma.mahasiswa.findMany({
      where: { user: { status: 'ACTIVE' } },
      take: 3,
      select: { id: true },
    });
    assert.ok(students.length >= 3);

    const testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `KAP-${Date.now()}`,
        capacity: 1,
      },
    });

    try {
      const responses = await Promise.all(
        students.map((student) =>
          request('/api/admin/enrollments', {
            method: 'POST',
            body: { class_id: testClass.id, student_id: student.id },
          })
        )
      );

      const statuses = responses.map((response) => response.status);
      assert.equal(statuses.filter((status) => status === 201).length, 1);
      assert.ok(statuses.every((status) => status === 201 || status === 409));
      assert.equal(
        await prisma.enrollment.count({ where: { class_id: testClass.id } }),
        1
      );

      // Verifikasi bahwa status 409 memuat kode mesin CLASS_CAPACITY_FULL
      const rejectedResponses = responses.filter((res) => res.status === 409);
      for (const rej of rejectedResponses) {
        const body = await rej.json();
        assert.ok(
          body.code === 'CLASS_CAPACITY_FULL' || body.code === 'CONCURRENCY_CONFLICT',
          `Kode error harus terstruktur, didapat: ${body.code}`
        );
      }
    } finally {
      await prisma.class.delete({ where: { id: testClass.id } });
    }
  });

  test('Format nama dosen tidak menghasilkan duplikasi gelar', () => {
    // Kasus 1: data seed yang sudah bersih
    const dosenNormal = {
      gelar_depan: 'Dr.',
      gelar_belakang: 'M.Kom.',
      user: { profile: { full_name: 'Budi Santoso' } },
    };
    assert.strictEqual(formatLecturerName(dosenNormal), 'Dr. Budi Santoso, M.Kom.');

    // Kasus 2: data yang tidak sengaja memuat gelar ganda di full_name
    const dosenDuplicate = {
      gelar_depan: 'Dr.',
      gelar_belakang: 'M.Kom.',
      user: { profile: { full_name: 'Dr. Budi Santoso, M.Kom.' } },
    };
    assert.strictEqual(formatLecturerName(dosenDuplicate), 'Dr. Budi Santoso, M.Kom.');

    // Kasus 3: dosen tanpa gelar depan
    const dosenTanpaGelarDepan = {
      gelar_depan: '',
      gelar_belakang: 'S.Kom., M.T.',
      user: { profile: { full_name: 'Siti Aminah' } },
    };
    assert.strictEqual(formatLecturerName(dosenTanpaGelarDepan), 'Siti Aminah, S.Kom., M.T.');
  });
});
