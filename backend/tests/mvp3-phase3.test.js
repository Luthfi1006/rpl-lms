import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 3 MVP 3: submission dan validasi berkas', () => {
  let server;
  let baseUrl;
  let lecturerToken;
  let studentToken;
  let outsideToken;
  let testClass;
  let assignment;
  let student;

  const suffix = Date.now().toString().slice(-8);
  const request = (url, { method = 'GET', token = studentToken, body } = {}) =>
    fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  async function login(identifier) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: 'password123' }),
    });
    return (await response.json()).data.accessToken;
  }

  before(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
    [lecturerToken, studentToken, outsideToken] = await Promise.all([
      login('198501152010121002'),
      login('2024001001'),
      login('2024001003'),
    ]);
    const [course, lecturer, students, admin] = await Promise.all([
      prisma.course.findFirst({ where: { is_active: true } }),
      prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } }),
      prisma.mahasiswa.findMany({ where: { nim: { in: ['2024001001', '2024001003'] } } }),
      prisma.user.findUnique({ where: { username: 'admin' } }),
    ]);
    student = students.find((item) => item.nim === '2024001001');
    testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP3-P3-${suffix}`,
        capacity: 10,
      },
    });
    await prisma.meeting.createMany({
      data: Array.from({ length: 16 }, (_, index) => ({
        class_id: testClass.id,
        meeting_number: index + 1,
        title: `Pertemuan ${index + 1}`,
        is_exam: index === 7 || index === 15,
        exam_type: index === 7 ? 'UTS' : index === 15 ? 'UAS' : 'NONE',
      })),
    });
    await prisma.enrollment.create({ data: { class_id: testClass.id, student_id: student.id, enrolled_by: admin.id } });
    const meeting = await prisma.meeting.findFirst({ where: { class_id: testClass.id, meeting_number: 3 } });
    assignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Submission integrasi',
        instructions: 'Unggah PDF',
        weight_percentage: 20,
        due_date: new Date(Date.now() + 86400000),
        allow_late: false,
        is_published: true,
      },
    });
  });

  after(async () => {
    if (assignment) {
      const submissions = await prisma.submission.findMany({
        where: { assignment_id: assignment.id },
        include: { file: true },
      });
      for (const submission of submissions) {
        await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, submission.file.file_path), { force: true });
      }
      await prisma.assignment.delete({ where: { id: assignment.id } });
      await prisma.file.deleteMany({ where: { id: { in: submissions.map((item) => item.file_id) } } });
    }
    if (testClass) await prisma.class.delete({ where: { id: testClass.id } });
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('upload, resubmission, roster, unduh, dan penolakan berkas terlindungi', async () => {
    async function upload(buffer, filename, token = studentToken) {
      const form = new FormData();
      form.append('file', new Blob([buffer], { type: 'application/pdf' }), filename);
      return fetch(`${baseUrl}/api/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
    }

    const first = await upload(Buffer.from('%PDF-1.4\njawaban pertama'), 'jawaban.pdf');
    assert.equal(first.status, 201);
    const firstPayload = await first.json();
    assert.equal(firstPayload.data.status, 'SUBMITTED');

    const second = await upload(Buffer.from('%PDF-1.4\njawaban revisi'), 'jawaban-revisi.pdf');
    assert.equal(second.status, 200);
    const secondPayload = await second.json();
    assert.equal(secondPayload.data.status, 'SUBMITTED');

    const fake = await upload(Buffer.from('MZ\x90\x00bukan-pdf'), 'palsu.pdf');
    assert.equal(fake.status, 400);

    const outside = await upload(Buffer.from('%PDF-1.4\nluar'), 'luar.pdf', outsideToken);
    assert.equal(outside.status, 403);

    const unauthenticated = await upload(Buffer.from('%PDF-1.4\nnoauth'), 'noauth.pdf', null);
    assert.equal(unauthenticated.status, 401);

    const roster = await request(`/api/assignments/${assignment.id}/submissions`, { token: lecturerToken });
    assert.equal(roster.status, 200);
    const rosterPayload = await roster.json();
    assert.equal(rosterPayload.data.total_students, 1);
    assert.equal(rosterPayload.data.submitted, 1);

    const submissionId = secondPayload.data.id;
    const download = await request(`/api/submissions/${submissionId}/download`, { token: studentToken });
    assert.equal(download.status, 200);

    await prisma.submission.update({
      where: { id: submissionId },
      data: { score: 90, feedback: 'Baik', graded_at: new Date() },
    });
    const graded = await upload(Buffer.from('%PDF-1.4\nsetelah dinilai'), 'graded.pdf');
    assert.equal(graded.status, 409);
  });
});
