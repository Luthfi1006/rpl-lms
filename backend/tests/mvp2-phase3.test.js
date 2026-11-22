import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';

const TEST_FILE = Buffer.from('%PDF-1.4\nMateri uji distribusi terproteksi\n');

describe('Fase 3 MVP 2: Unggah & Distribusi Materi Terproteksi', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let enrolledStudentToken;
  let outsideStudentToken;
  let testClass;
  let meeting;
  let enrolledStudent;
  let course;
  let lecturer;
  const createdMaterialIds = [];
  const createdFileIds = [];

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

  async function upload({ token, title = 'Materi Fase 3', filename = 'materi-uji.pdf' } = {}) {
    const form = new FormData();
    form.append('title', title);
    form.append('description', 'Berkas uji endpoint distribusi materi.');
    form.append('file', new Blob([TEST_FILE], { type: 'application/pdf' }), filename);
    return fetch(`${baseUrl}/api/meetings/${meeting.id}/materials`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  }

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    [adminToken, lecturerToken, otherLecturerToken, enrolledStudentToken, outsideStudentToken] =
      await Promise.all([
        login('admin'),
        login('198501152010121002'),
        login('199003202015042001'),
        login('2024001001'),
        login('2024001002'),
      ]);

    course = await prisma.course.findFirst({ where: { is_active: true } });
    lecturer = await prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } });
    enrolledStudent = await prisma.mahasiswa.findUnique({ where: { nim: '2024001001' } });
    assert.ok(course && lecturer && enrolledStudent, 'Data seed fase 3 wajib tersedia');

    const classResponse = await request('/api/admin/classes', {
      method: 'POST',
      body: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MATERIAL-${suffix}`,
        capacity: 10,
      },
    });
    const classPayload = await classResponse.json();
    assert.equal(classResponse.status, 201, classPayload.message);
    testClass = classPayload.data;

    meeting = await prisma.meeting.findFirst({
      where: { class_id: testClass.id, meeting_number: 1 },
    });
    assert.ok(meeting, 'Fase 1/2 harus membentuk 16 pertemuan kelas');

    await prisma.enrollment.create({
      data: {
        class_id: testClass.id,
        student_id: enrolledStudent.id,
        enrolled_by: (await prisma.user.findFirst({ where: { role: 'admin' } })).id,
      },
    });
  });

  after(async () => {
    if (testClass) {
      const meetings = await prisma.meeting.findMany({
        where: { class_id: testClass.id },
        select: { id: true },
      });
      const materials = await prisma.material.findMany({
        where: { meeting_id: { in: meetings.map(({ id }) => id) } },
        include: { file: { select: { id: true, file_path: true } } },
      });

      for (const material of materials) {
        await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, material.file.file_path), { force: true });
      }

      const materialIds = materials.map(({ id }) => id);
      const fileIds = materials.map(({ file }) => file.id);
      const allMaterialIds = [...new Set([...materialIds, ...createdMaterialIds])];
      const allFileIds = [...new Set([...fileIds, ...createdFileIds])];
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { entity: 'materials', entity_id: { in: allMaterialIds } },
            { entity: 'classes', entity_id: testClass.id },
          ],
        },
      });
      await prisma.material.deleteMany({ where: { id: { in: allMaterialIds } } });
      await prisma.file.deleteMany({ where: { id: { in: allFileIds } } });

      await prisma.class.delete({ where: { id: testClass.id } });
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('Hanya dosen pengampu atau Admin yang dapat mengunggah materi', async () => {
    const ownerUpload = await upload({ token: lecturerToken });
    assert.equal(ownerUpload.status, 201);
    const payload = await ownerUpload.json();
    assert.equal(payload.success, true);
    assert.equal(payload.data.title, 'Materi Fase 3');
    assert.equal(payload.data.file.original_name, 'materi-uji.pdf');
    assert.equal(payload.data.file.mime_type, 'application/pdf');
    assert.equal(payload.data.file.file_path, undefined);
    assert.equal(payload.data.file.storage_name, undefined);
    createdMaterialIds.push(payload.data.id);
    createdFileIds.push(payload.data.file.id);

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'CREATE_MATERIAL',
        entity: 'materials',
        entity_id: payload.data.id,
      },
    });
    assert.ok(audit, 'Upload materi harus tercatat pada audit log');

    const adminUpload = await upload({ token: adminToken, title: 'Materi oleh Admin' });
    assert.equal(adminUpload.status, 201);
    const adminPayload = await adminUpload.json();
    createdMaterialIds.push(adminPayload.data.id);
    createdFileIds.push(adminPayload.data.file.id);

    const otherLecturerUpload = await upload({ token: otherLecturerToken });
    assert.equal(otherLecturerUpload.status, 403);
    const studentUpload = await upload({ token: enrolledStudentToken });
    assert.equal(studentUpload.status, 403);
    const anonymousUpload = await upload({ token: null });
    assert.equal(anonymousUpload.status, 401);

    const missingFile = new FormData();
    missingFile.append('title', 'Tanpa berkas');
    const missingFileResponse = await fetch(
      `${baseUrl}/api/meetings/${meeting.id}/materials`,
      { method: 'POST', headers: { Authorization: `Bearer ${lecturerToken}` }, body: missingFile }
    );
    assert.equal(missingFileResponse.status, 400);

    const disallowed = new FormData();
    disallowed.append('title', 'Ekstensi tidak sah');
    disallowed.append(
      'file',
      new Blob([TEST_FILE], { type: 'application/octet-stream' }),
      'berkas-berbahaya.exe'
    );
    const disallowedResponse = await fetch(
      `${baseUrl}/api/meetings/${meeting.id}/materials`,
      { method: 'POST', headers: { Authorization: `Bearer ${lecturerToken}` }, body: disallowed }
    );
    assert.equal(disallowedResponse.status, 400);

    const oversize = new FormData();
    oversize.append('title', 'Ukuran melebihi batas');
    oversize.append(
      'file',
      new Blob([Buffer.alloc(10 * 1024 * 1024 + 1)], { type: 'application/pdf' }),
      'terlalu-besar.pdf'
    );
    const oversizeResponse = await fetch(
      `${baseUrl}/api/meetings/${meeting.id}/materials`,
      { method: 'POST', headers: { Authorization: `Bearer ${lecturerToken}` }, body: oversize }
    );
    assert.equal(oversizeResponse.status, 400);
  });

  test('Pembaruan informasi materi hanya oleh dosen pengampu atau Admin dan ter-audit', async () => {
    const uploadResponse = await upload({ token: lecturerToken, title: 'Judul Awal Materi' });
    assert.equal(uploadResponse.status, 201);
    const uploaded = (await uploadResponse.json()).data;
    createdMaterialIds.push(uploaded.id);
    createdFileIds.push(uploaded.file.id);

    const deniedStudent = await request(`/api/materials/${uploaded.id}`, {
      method: 'PUT',
      token: enrolledStudentToken,
      body: { title: 'Judul Ilegal' },
    });
    assert.equal(deniedStudent.status, 403);

    const deniedOtherLecturer = await request(`/api/materials/${uploaded.id}`, {
      method: 'PUT',
      token: otherLecturerToken,
      body: { title: 'Judul Ilegal' },
    });
    assert.equal(deniedOtherLecturer.status, 403);

    const emptyBody = await request(`/api/materials/${uploaded.id}`, {
      method: 'PUT',
      token: lecturerToken,
      body: {},
    });
    assert.equal(emptyBody.status, 400);

    const updated = await request(`/api/materials/${uploaded.id}`, {
      method: 'PUT',
      token: lecturerToken,
      body: { title: 'Judul Materi Revisi', description: 'Deskripsi hasil koreksi dosen.' },
    });
    assert.equal(updated.status, 200);
    const updatedPayload = await updated.json();
    assert.equal(updatedPayload.success, true);
    assert.equal(updatedPayload.data.title, 'Judul Materi Revisi');
    assert.equal(updatedPayload.data.description, 'Deskripsi hasil koreksi dosen.');
    assert.equal(updatedPayload.data.file.original_name, 'materi-uji.pdf');

    const clearedDescription = await request(`/api/materials/${uploaded.id}`, {
      method: 'PUT',
      token: adminToken,
      body: { description: null },
    });
    assert.equal(clearedDescription.status, 200);
    assert.equal((await clearedDescription.json()).data.description, null);

    const audit = await prisma.auditLog.findFirst({
      where: {
        action: 'UPDATE_MATERIAL',
        entity: 'materials',
        entity_id: uploaded.id,
      },
      orderBy: { created_at: 'desc' },
    });
    assert.ok(audit, 'Pembaruan materi harus tercatat pada audit log');
    assert.equal(audit.new_values.title, 'Judul Materi Revisi');
  });

  test('Unduh streaming hanya diizinkan untuk mahasiswa enrolled, dosen pengampu, dan Admin', async () => {
    const material = await prisma.material.findFirst({
      where: { meeting_id: meeting.id },
      orderBy: { created_at: 'asc' },
    });
    assert.ok(material, 'Materi harus tersedia dari pengujian upload sebelumnya');

    for (const token of [lecturerToken, adminToken, enrolledStudentToken]) {
      const response = await request(`/api/materials/${material.id}/download`, { token });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-disposition'), /attachment/);
      assert.equal(response.headers.get('content-type'), 'application/pdf');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), TEST_FILE);
    }

    const outsideStudentResponse = await request(`/api/materials/${material.id}/download`, {
      token: outsideStudentToken,
    });
    assert.equal(outsideStudentResponse.status, 403);

    const otherLecturerResponse = await request(`/api/materials/${material.id}/download`, {
      token: otherLecturerToken,
    });
    assert.equal(otherLecturerResponse.status, 403);

    const invalidIdResponse = await request('/api/materials/not-a-uuid/download');
    assert.equal(invalidIdResponse.status, 400);
    const missingMaterialResponse = await request(
      '/api/materials/00000000-0000-0000-0000-000000000000/download'
    );
    assert.equal(missingMaterialResponse.status, 404);

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { is_published: false },
    });
    try {
      const unpublished = await request(`/api/materials/${material.id}/download`, {
        token: enrolledStudentToken,
      });
      assert.equal(unpublished.status, 404);
    } finally {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: { is_published: true },
      });
    }
  });

  test('Penghapusan materi owner bersifat ter-audit dan membersihkan berkas privat', async () => {
    const material = await prisma.material.findFirst({
      where: { meeting_id: meeting.id },
      orderBy: { created_at: 'asc' },
      include: { file: true },
    });
    assert.ok(material);
    const filePath = path.resolve(STORAGE.UPLOAD_DIR, material.file.file_path);

    const denied = await request(`/api/materials/${material.id}`, {
      method: 'DELETE',
      token: otherLecturerToken,
    });
    assert.equal(denied.status, 403);

    const removed = await request(`/api/materials/${material.id}`, {
      method: 'DELETE',
      token: lecturerToken,
    });
    assert.equal(removed.status, 200);
    assert.equal(await prisma.material.findUnique({ where: { id: material.id } }), null);
    assert.equal(await prisma.file.findUnique({ where: { id: material.file.id } }), null);
    await assert.rejects(fs.access(filePath), { code: 'ENOENT' });
    assert.ok(
      await prisma.auditLog.findFirst({
        where: {
          action: 'DELETE_MATERIAL',
          entity: 'materials',
          entity_id: material.id,
        },
      })
    );
  });
});
