import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 2 MVP 3: penerbitan tugas', () => {
  let server;
  let baseUrl;
  let lecturerToken;
  let studentToken;
  let outsideToken;
  let testClass;
  let meeting;
  let student;
  let outsideStudent;

  const suffix = Date.now().toString().slice(-8);
  const request = (url, { method = 'GET', token = lecturerToken, body, form } = {}) => {
    if (form) {
      return fetch(`${baseUrl}${url}`, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
    }
    return fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  };

  async function login(identifier) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: 'password123' }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200, payload.message);
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
    outsideStudent = students.find((item) => item.nim === '2024001003');
    const created = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP3-P2-${suffix}`,
        capacity: 10,
      },
    });
    testClass = created;
    await prisma.enrollment.create({ data: { class_id: testClass.id, student_id: student.id, enrolled_by: admin.id } });
    await prisma.meeting.createMany({
      data: Array.from({ length: 16 }, (_, index) => ({
        class_id: testClass.id,
        meeting_number: index + 1,
        title: `Pertemuan ${index + 1}`,
        is_exam: index === 7 || index === 15,
        exam_type: index === 7 ? 'UTS' : index === 15 ? 'UAS' : 'NONE',
      })),
    });
    meeting = await prisma.meeting.findFirst({ where: { class_id: testClass.id, meeting_number: 3 } });
  });

  after(async () => {
    if (testClass) {
      const assignments = await prisma.assignment.findMany({
        where: { meeting: { class_id: testClass.id } },
        include: { soal: true, submissions: { include: { file: true } } },
      });
      for (const assignment of assignments) {
        const files = [assignment.soal, ...assignment.submissions.map((item) => item.file)].filter(Boolean);
        for (const file of files) await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, file.file_path), { force: true });
      }
      await prisma.assignment.deleteMany({ where: { meeting: { class_id: testClass.id } } });
      await prisma.file.deleteMany({ where: { id: { in: assignments.flatMap((item) => [item.file_soal_id, ...item.submissions.map((sub) => sub.file_id)]).filter(Boolean) } } });
      await prisma.class.delete({ where: { id: testClass.id } });
    }
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('CRUD tugas, draft, unduh soal, dan audit bekerja lintas role', async () => {
    const form = new FormData();
    form.append('title', 'Tugas P2');
    form.append('instructions', 'Kerjakan dan unggah jawaban');
    form.append('weight_percentage', '20');
    form.append('due_date', new Date(Date.now() + 86400000).toISOString());
    form.append('allow_late', 'false');
    form.append('is_published', 'true');
    form.append('file', new Blob(['%PDF-1.4\nsoal'], { type: 'application/pdf' }), 'soal.pdf');

    const create = await request(`/api/meetings/${meeting.id}/assignments`, { method: 'POST', form });
    const createdPayload = await create.json();
    assert.equal(create.status, 201, createdPayload.message);
    const assignment = createdPayload.data;
    assert.equal(assignment.weight_percentage, 20);

    const invalidForms = [
      { title: '', weight_percentage: '20' },
      { title: 'Bobot invalid', weight_percentage: '101' },
      { title: 'Deadline lewat', due_date: new Date(Date.now() - 86400000).toISOString(), weight_percentage: '20' },
    ];
    for (const fields of invalidForms) {
      const invalidForm = new FormData();
      Object.entries(fields).forEach(([key, value]) => invalidForm.append(key, value));
      const invalid = await request(`/api/meetings/${meeting.id}/assignments`, { method: 'POST', form: invalidForm });
      assert.equal(invalid.status, 400);
    }

    const listStudent = await request(`/api/classes/${testClass.id}/assignments`, { token: studentToken });
    assert.equal(listStudent.status, 200);

    const outsideList = await request(`/api/classes/${testClass.id}/assignments`, { token: outsideToken });
    assert.equal(outsideList.status, 403);

    const download = await request(`/api/assignments/${assignment.id}/download`, { token: studentToken });
    assert.equal(download.status, 200);
    assert.match(download.headers.get('content-disposition'), /attachment/);

    const update = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      body: { instructions: 'Instruksi diperbarui', is_published: false },
    });
    assert.equal(update.status, 200);

    const oldFileId = (await prisma.assignment.findUnique({ where: { id: assignment.id }, select: { file_soal_id: true } })).file_soal_id;
    const oldFile = await prisma.file.findUnique({ where: { id: oldFileId } });
    const fileOnlyForm = new FormData();
    fileOnlyForm.append('file', new Blob(['%PDF-1.4\nsoal revisi'], { type: 'application/pdf' }), 'soal-revisi.pdf');
    const fileOnlyUpdate = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      form: fileOnlyForm,
    });
    assert.equal(fileOnlyUpdate.status, 200);
    const revised = await prisma.assignment.findUnique({ where: { id: assignment.id }, select: { file_soal_id: true } });
    assert.notEqual(revised.file_soal_id, oldFileId);
    assert.equal(await prisma.file.findUnique({ where: { id: oldFileId } }), null);
    await assert.rejects(fs.access(path.resolve(STORAGE.UPLOAD_DIR, oldFile.file_path)));

    const draftDetail = await request(`/api/assignments/${assignment.id}`, { token: studentToken });
    assert.equal(draftDetail.status, 404);

    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'CREATE_ASSIGNMENT', entity_id: assignment.id },
    }), 1);
    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'UPDATE_ASSIGNMENT', entity_id: assignment.id },
    }), 2);

    const remove = await request(`/api/assignments/${assignment.id}`, { method: 'DELETE' });
    assert.equal(remove.status, 200);
    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'DELETE_ASSIGNMENT', entity_id: assignment.id },
    }), 1);
  });
});
