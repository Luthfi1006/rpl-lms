import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { ATTENDANCE_CLOSED_MESSAGE } from '../src/modules/attendance/attendance.service.js';
import { cleanupTestArtifacts } from './setup.js';

const MATERIAL_CONTENT = Buffer.from('%PDF-1.4\nFase 6 end-to-end handoff test\n');

describe('Fase 6 MVP 2: Integrasi lintas-modul & handoff frontend', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let enrolledStudentToken;
  let secondStudentToken;
  let outsideStudentToken;
  let testClass;
  let meeting;
  let material;
  let student1;
  let student2;

  const suffix = Date.now().toString().slice(-8);
  const request = (url, { method = 'GET', token = adminToken, body } = {}) =>
    fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  async function login(identifier) {
    const response = await request('/api/auth/login', {
      method: 'POST',
      token: null,
      body: { identifier, password: 'password123' },
    });
    const payload = await response.json();
    assert.equal(response.status, 200, `Login ${identifier} gagal: ${payload.message}`);
    return payload.data.accessToken;
  }

  before(async () => {
    await cleanupTestArtifacts(prisma);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    [
      adminToken,
      lecturerToken,
      otherLecturerToken,
      enrolledStudentToken,
      secondStudentToken,
      outsideStudentToken,
    ] =
      await Promise.all([
        login('admin'),
        login('198501152010121002'),
        login('199003202015042001'),
        login('2024001001'),
        login('2024001002'),
        login('2024001003'),
      ]);

    const [course, lecturer, students, admin] = await Promise.all([
      prisma.course.findFirst({ where: { is_active: true } }),
      prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } }),
      prisma.mahasiswa.findMany({
        where: { nim: { in: ['2024001001', '2024001002', '2024001003'] } },
      }),
      prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } }),
    ]);

    student1 = students.find(({ nim }) => nim === '2024001001');
    student2 = students.find(({ nim }) => nim === '2024001002');
    assert.ok(course && lecturer && admin && student1 && student2);
    assert.equal(students.length, 3, 'Data mahasiswa untuk test enrolled dan non-enrolled wajib tersedia');

    const createdClass = await request('/api/admin/classes', {
      method: 'POST',
      body: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP2-E2E-${suffix}`,
        capacity: 10,
      },
    });
    const classPayload = await createdClass.json();
    assert.equal(createdClass.status, 201, classPayload.message);
    testClass = classPayload.data;

    await prisma.enrollment.createMany({
      data: [student1, student2].map(({ id }) => ({
        class_id: testClass.id,
        student_id: id,
        enrolled_by: admin.id,
      })),
    });
    meeting = await prisma.meeting.findFirst({
      where: { class_id: testClass.id, meeting_number: 1 },
    });
  });

  after(async () => {
    if (testClass) {
      const meetings = await prisma.meeting.findMany({
        where: { class_id: testClass.id },
        select: { id: true },
      });
      const meetingIds = meetings.map(({ id }) => id);
      const materials = await prisma.material.findMany({
        where: { meeting_id: { in: meetingIds } },
        include: { file: { select: { id: true, file_path: true } } },
      });
      const sessions = await prisma.attendanceSession.findMany({
        where: { meeting_id: { in: meetingIds } },
        select: { id: true, records: { select: { id: true } } },
      });

      for (const { file } of materials) {
        await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, file.file_path), { force: true });
      }

      const materialIds = materials.map(({ id }) => id);
      const fileIds = materials.map(({ file }) => file.id);
      const sessionIds = sessions.map(({ id }) => id);
      const recordIds = sessions.flatMap(({ records }) => records.map(({ id }) => id));
      const auditIds = [
        testClass.id,
        ...materialIds,
        ...sessionIds,
        ...recordIds,
      ];

      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { entity_id: { in: auditIds } },
            { entity: 'classes', entity_id: testClass.id },
          ],
        },
      });
      await prisma.material.deleteMany({ where: { id: { in: materialIds } } });
      await prisma.file.deleteMany({ where: { id: { in: fileIds } } });
      await prisma.class.delete({ where: { id: testClass.id } });
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('Fase 1–5 bekerja bersama: 16 pertemuan, materi aman, presensi, dan persentase rekap', async () => {
    assert.ok(meeting, 'Kelas yang dibuat harus mempunyai pertemuan pertama');

    const meetings = await prisma.meeting.findMany({
      where: { class_id: testClass.id },
      orderBy: { meeting_number: 'asc' },
    });
    assert.equal(meetings.length, 16);
    assert.equal(meetings[7].exam_type, 'UTS');
    assert.equal(meetings[15].exam_type, 'UAS');

    const materialForm = new FormData();
    materialForm.append('title', 'Materi integrasi Fase 6');
    materialForm.append(
      'file',
      new Blob([MATERIAL_CONTENT], { type: 'application/pdf' }),
      'fase6-integrasi.pdf'
    );
    const uploadResponse = await fetch(
      `${baseUrl}/api/meetings/${meeting.id}/materials`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${lecturerToken}` },
        body: materialForm,
      }
    );
    assert.equal(uploadResponse.status, 201);
    material = (await uploadResponse.json()).data;

    const studentDownload = await request(`/api/materials/${material.id}/download`, {
      token: enrolledStudentToken,
    });
    assert.equal(studentDownload.status, 200);
    assert.match(studentDownload.headers.get('content-disposition'), /attachment/);
    assert.deepEqual(Buffer.from(await studentDownload.arrayBuffer()), MATERIAL_CONTENT);

    const outsideDownload = await request(`/api/materials/${material.id}/download`, {
      token: outsideStudentToken,
    });
    assert.equal(outsideDownload.status, 403);

    const unauthenticatedDownload = await request(`/api/materials/${material.id}/download`, {
      token: null,
    });
    assert.equal(unauthenticatedDownload.status, 401);

    const unauthenticatedOpen = await request(
      `/api/meetings/${meeting.id}/attendance/open`,
      { method: 'POST', token: null, body: {} }
    );
    assert.equal(unauthenticatedOpen.status, 401);

    const otherLecturerOpen = await request(
      `/api/meetings/${meeting.id}/attendance/open`,
      { method: 'POST', token: otherLecturerToken, body: {} }
    );
    assert.equal(otherLecturerOpen.status, 403);

    const openResponse = await request(`/api/meetings/${meeting.id}/attendance/open`, {
      method: 'POST',
      token: lecturerToken,
      body: { tolerance_minutes: 60 },
    });
    assert.equal(openResponse.status, 200);
    const session = (await openResponse.json()).data;
    assert.equal(session.status, 'OPEN');

    const checkInResponse = await request(`/api/attendance/${session.id}/check-in`, {
      method: 'POST',
      token: enrolledStudentToken,
    });
    assert.equal(checkInResponse.status, 201);
    assert.equal((await checkInResponse.json()).data.status, 'HADIR');

    const closeResponse = await request(`/api/meetings/${meeting.id}/attendance/close`, {
      method: 'POST',
      token: lecturerToken,
    });
    assert.equal(closeResponse.status, 200);
    assert.equal((await closeResponse.json()).data.status, 'CLOSED');

    const rejectedCheckIn = await request(`/api/attendance/${session.id}/check-in`, {
      method: 'POST',
      token: secondStudentToken,
    });
    assert.equal(rejectedCheckIn.status, 400);
    assert.equal((await rejectedCheckIn.json()).message, ATTENDANCE_CLOSED_MESSAGE);

    const secondMeeting = meetings[1];
    const secondOpenResponse = await request(
      `/api/meetings/${secondMeeting.id}/attendance/open`,
      {
        method: 'POST',
        token: lecturerToken,
        body: { tolerance_minutes: 60 },
      }
    );
    assert.equal(secondOpenResponse.status, 200);
    const secondSession = (await secondOpenResponse.json()).data;
    assert.equal(secondSession.status, 'OPEN');

    const secondCloseResponse = await request(
      `/api/meetings/${secondMeeting.id}/attendance/close`,
      { method: 'POST', token: lecturerToken }
    );
    assert.equal(secondCloseResponse.status, 200);
    assert.equal((await secondCloseResponse.json()).data.status, 'CLOSED');

    const recapResponse = await request(
      `/api/classes/${testClass.id}/attendance-recap`,
      { token: lecturerToken }
    );
    assert.equal(recapResponse.status, 200);
    const recap = (await recapResponse.json()).data;
    assert.equal(recap.total_sessions, 2);
    assert.equal(recap.total_meetings, 16);
    assert.equal(recap.recap.length, 2);

    const firstStudentRecap = recap.recap.find(({ student_id }) => student_id === student1.id);
    const secondStudentRecap = recap.recap.find(({ student_id }) => student_id === student2.id);
    assert.equal(firstStudentRecap.total_hadir, 1);
    assert.equal(firstStudentRecap.percentage, 50);
    assert.equal(firstStudentRecap.matrix[0].status, 'HADIR');
    assert.equal(firstStudentRecap.matrix[1].status, 'ALPA');
    assert.equal(secondStudentRecap.total_hadir, 0);
    assert.equal(secondStudentRecap.percentage, 0);
    assert.equal(secondStudentRecap.matrix[0].status, 'ALPA');
    assert.equal(secondStudentRecap.matrix[1].status, 'ALPA');

    const studentRecapResponse = await request(
      `/api/classes/${testClass.id}/attendance-recap`,
      { token: enrolledStudentToken }
    );
    assert.equal(studentRecapResponse.status, 200);
    assert.equal((await studentRecapResponse.json()).data.recap.length, 1);
  });
});
