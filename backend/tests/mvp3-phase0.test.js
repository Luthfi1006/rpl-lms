import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import express from 'express';

import {
  AUDIT_ENTITIES,
  AUDIT_ENTITY_VALUES,
  isKnownAuditEntity,
} from '../src/constants/auditEntities.js';
import {
  STORAGE,
  SUBMISSION_SIZE_LIMITS,
  parseSubmissionMaxSize,
} from '../src/config/env.js';
import { DOCUMENT_MIME_TYPES, resolveStorageSubdir } from '../src/utils/storage.js';
import {
  SIGNATURE_SUPPORTED_EXTENSIONS,
  assertDocumentSignature,
  hasValidDocumentSignature,
} from '../src/utils/fileSignature.js';
import {
  uploadAssignmentFile,
  uploadSubmission,
} from '../src/middlewares/upload.middleware.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';

/**
 * Fase 0 MVP 3 — Prasyarat bersama sebelum Fase 2–4 diparallelkan.
 *
 * Suite ini mengunci:
 *   1. konstanta entitas audit `assignments`/`submissions`,
 *   2. konfigurasi `MAX_SUBMISSION_SIZE_MB` (5–10MB),
 *   3. helper verifikasi magic-byte PDF/ZIP (DOCX/XLSX),
 *   4. kategori storage `assignment`/`submission`,
 *   5. middleware `uploadAssignmentFile`/`uploadSubmission` tanpa menulis ke
 *      disk (memory storage) dan tanpa menyentuh database.
 */

const MB = 1024 * 1024;

const PDF_BUFFER = Buffer.from('%PDF-1.7\n% soal tugas uji Fase 0 MVP 3\n');
const ZIP_BUFFER = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from('docx')]);

const MIME_BY_EXTENSION = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

// ============================================================
// 1. Konstanta entitas audit
// ============================================================

describe('Fase 0 MVP 3: entitas audit baru', () => {
  test('AUDIT_ENTITIES mendefinisikan assignments & submissions', () => {
    assert.equal(AUDIT_ENTITIES.ASSIGNMENTS, 'assignments');
    assert.equal(AUDIT_ENTITIES.SUBMISSIONS, 'submissions');
  });

  test('nilai baru ikut terdaftar pada AUDIT_ENTITY_VALUES', () => {
    assert.ok(AUDIT_ENTITY_VALUES.includes('assignments'));
    assert.ok(AUDIT_ENTITY_VALUES.includes('submissions'));
  });

  test('isKnownAuditEntity mengenali entitas MVP 3', () => {
    assert.equal(isKnownAuditEntity('assignments'), true);
    assert.equal(isKnownAuditEntity('Submissions'), true);
    assert.equal(isKnownAuditEntity('assignment'), false);
    assert.equal(isKnownAuditEntity('submission'), false);
  });

  test('penamaan mengikuti konvensi huruf kecil & jamak', () => {
    for (const entity of [AUDIT_ENTITIES.ASSIGNMENTS, AUDIT_ENTITIES.SUBMISSIONS]) {
      assert.equal(entity, entity.toLowerCase());
      assert.match(entity, /s$/);
    }
  });

  test('tidak ada nilai duplikat setelah penambahan', () => {
    assert.equal(new Set(AUDIT_ENTITY_VALUES).size, AUDIT_ENTITY_VALUES.length);
  });
});

// ============================================================
// 2. Konfigurasi ukuran submission
// ============================================================

describe('Fase 0 MVP 3: konfigurasi MAX_SUBMISSION_SIZE_MB (FR-019, BR-008)', () => {
  test('rentang kebijakan adalah 5–10MB dengan default 10MB', () => {
    assert.equal(SUBMISSION_SIZE_LIMITS.MIN_MB, 5);
    assert.equal(SUBMISSION_SIZE_LIMITS.MAX_MB, 10);
    assert.equal(SUBMISSION_SIZE_LIMITS.DEFAULT_MB, 10);
  });

  test('nilai kosong memakai default 10MB', () => {
    assert.equal(parseSubmissionMaxSize(undefined), 10 * MB);
    assert.equal(parseSubmissionMaxSize(null), 10 * MB);
    assert.equal(parseSubmissionMaxSize(''), 10 * MB);
    assert.equal(parseSubmissionMaxSize('   '), 10 * MB);
  });

  test('nilai dalam rentang diterima dan dikonversi ke byte', () => {
    assert.equal(parseSubmissionMaxSize('5'), 5 * MB);
    assert.equal(parseSubmissionMaxSize(7), 7 * MB);
    assert.equal(parseSubmissionMaxSize('7.5'), 7.5 * MB);
    assert.equal(parseSubmissionMaxSize('10'), 10 * MB);
  });

  test('nilai di luar rentang/non-angka ditolak saat startup', () => {
    for (const invalid of ['4.99', '0', '-1', '10.01', '100', 'sepuluh', 'NaN', 'Infinity']) {
      assert.throws(
        () => parseSubmissionMaxSize(invalid),
        /MAX_SUBMISSION_SIZE_MB/,
        `"${invalid}" seharusnya ditolak`
      );
    }
  });

  test('STORAGE.SUBMISSION_MAX_SIZE berada dalam rentang sah', () => {
    assert.ok(STORAGE.SUBMISSION_MAX_SIZE >= SUBMISSION_SIZE_LIMITS.MIN_MB * MB);
    assert.ok(STORAGE.SUBMISSION_MAX_SIZE <= SUBMISSION_SIZE_LIMITS.MAX_MB * MB);
  });
});

// ============================================================
// 3. Helper signature berkas
// ============================================================

describe('Fase 0 MVP 3: helper signature berkas (NFR-003)', () => {
  test('PDF valid diawali %PDF- diterima', () => {
    assert.equal(hasValidDocumentSignature(PDF_BUFFER, '.pdf'), true);
    assert.equal(hasValidDocumentSignature(PDF_BUFFER, 'pdf'), true);
    assert.equal(hasValidDocumentSignature(PDF_BUFFER, 'tugas.PDF'), true);
    assert.doesNotThrow(() => assertDocumentSignature(PDF_BUFFER, '.pdf'));
  });

  test('ZIP/DOCX/XLSX valid diawali PK\\x03\\x04 diterima', () => {
    for (const ext of ['.zip', '.docx', '.xlsx']) {
      assert.equal(hasValidDocumentSignature(ZIP_BUFFER, ext), true, `${ext} seharusnya valid`);
      assert.doesNotThrow(() => assertDocumentSignature(ZIP_BUFFER, ext));
    }
  });

  test('seluruh ekstensi whitelist memiliki signature terdaftar', () => {
    assert.deepEqual(
      [...SIGNATURE_SUPPORTED_EXTENSIONS].sort(),
      ['.docx', '.pdf', '.xlsx', '.zip']
    );
    for (const ext of STORAGE.DOC_ALLOWED_EXTENSIONS) {
      assert.ok(SIGNATURE_SUPPORTED_EXTENSIONS.includes(ext), `${ext} belum terdaftar`);
    }
  });

  test('berkas .exe yang diganti nama menjadi .pdf ditolak', () => {
    const disguised = Buffer.from('MZ\x90\x00\x03\x00\x00\x00', 'latin1');
    assert.equal(hasValidDocumentSignature(disguised, '.pdf'), false);
    assert.throws(
      () => assertDocumentSignature(disguised, '.pdf'),
      (error) => error.statusCode === 400 && /Isi berkas tidak sesuai/.test(error.message)
    );
  });

  test('PDF yang diklaim ZIP (dan sebaliknya) ditolak', () => {
    assert.equal(hasValidDocumentSignature(PDF_BUFFER, '.zip'), false);
    assert.equal(hasValidDocumentSignature(ZIP_BUFFER, '.pdf'), false);
  });

  test('buffer kosong/terlalu pendek dianggap tidak valid', () => {
    for (const buffer of [null, undefined, Buffer.alloc(0), Buffer.from('%PD')]) {
      assert.equal(hasValidDocumentSignature(buffer, '.pdf'), false);
      assert.throws(
        () => assertDocumentSignature(buffer, '.pdf'),
        (error) => error.statusCode === 400
      );
    }
  });

  test('ekstensi di luar whitelist ditolak dengan pesan format', () => {
    assert.equal(hasValidDocumentSignature(PDF_BUFFER, '.txt'), false);
    assert.throws(
      () => assertDocumentSignature(PDF_BUFFER, '.txt'),
      (error) =>
        error.statusCode === 400 &&
        /Format berkas tidak didukung/.test(error.message)
    );
  });
});

// ============================================================
// 4. Kategori storage
// ============================================================

describe('Fase 0 MVP 3: kategori storage privat', () => {
  test('berkas soal disimpan di storage/private/assignments', () => {
    assert.equal(
      resolveStorageSubdir('assignment'),
      path.resolve(STORAGE.UPLOAD_DIR, 'assignments')
    );
  });

  test('berkas jawaban disimpan di storage/private/submissions', () => {
    assert.equal(
      resolveStorageSubdir('submission'),
      path.resolve(STORAGE.UPLOAD_DIR, 'submissions')
    );
  });

  test('peta MIME dokumen mencakup seluruh ekstensi whitelist', () => {
    for (const ext of STORAGE.DOC_ALLOWED_EXTENSIONS) {
      assert.ok(Array.isArray(DOCUMENT_MIME_TYPES[ext]), `${ext} belum punya MIME`);
      assert.ok(DOCUMENT_MIME_TYPES[ext].length > 0);
    }
    assert.ok(DOCUMENT_MIME_TYPES['.zip'].includes('application/zip'));
    assert.ok(DOCUMENT_MIME_TYPES['.zip'].includes('application/x-zip-compressed'));
  });
});

// ============================================================
// 5. Middleware upload tugas & submission
// ============================================================

let server;
let baseUrl;

function upload({ endpoint, filename, contentType, content = PDF_BUFFER, field = 'file' }) {
  const formData = new FormData();
  formData.append(field, new Blob([content], { type: contentType }), filename);
  return fetch(`${baseUrl}${endpoint}`, { method: 'POST', body: formData });
}

describe('Fase 0 MVP 3: middleware unggah tugas & submission', () => {
  before(async () => {
    const app = express();

    app.post('/assignment', uploadAssignmentFile, (req, res) => {
      res.json({
        success: true,
        data: req.file
          ? { originalname: req.file.originalname, size: req.file.size }
          : null,
      });
    });

    app.post('/submission', uploadSubmission, (req, res) => {
      res.json({
        success: true,
        data: { originalname: req.file.originalname, size: req.file.size },
      });
    });

    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('uploadAssignmentFile menerima tanpa berkas (soal opsional)', async () => {
    const formData = new FormData();
    formData.append('title', 'Tugas tanpa soal');

    const res = await fetch(`${baseUrl}/assignment`, { method: 'POST', body: formData });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data, null);
  });

  test('uploadAssignmentFile menerima seluruh ekstensi whitelist', async () => {
    const cases = [
      ['soal.pdf', PDF_BUFFER],
      ['soal.docx', ZIP_BUFFER],
      ['soal.xlsx', ZIP_BUFFER],
      ['soal.zip', ZIP_BUFFER],
    ];

    for (const [filename, content] of cases) {
      const ext = path.extname(filename);
      const res = await upload({
        endpoint: '/assignment',
        filename,
        contentType: MIME_BY_EXTENSION[ext],
        content,
      });
      const json = await res.json();

      assert.equal(res.status, 200, `${filename} seharusnya diterima`);
      assert.equal(json.data.originalname, filename);
      assert.equal(json.data.size, content.length);
    }
  });

  test('uploadAssignmentFile menolak ekstensi di luar whitelist', async () => {
    const res = await upload({
      endpoint: '/assignment',
      filename: 'virus.exe',
      contentType: 'application/octet-stream',
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.match(json.message, /Format berkas tidak didukung/);
  });

  test('uploadAssignmentFile menolak MIME yang tidak sesuai ekstensi', async () => {
    const res = await upload({
      endpoint: '/assignment',
      filename: 'soal.pdf',
      contentType: 'text/plain',
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.match(json.message, /MIME/i);
  });

  test('uploadAssignmentFile menolak berkas melebihi 10MB', async () => {
    const oversized = Buffer.alloc(10 * MB + 1, 0x61);
    const res = await upload({
      endpoint: '/assignment',
      filename: 'soal-besar.pdf',
      contentType: 'application/pdf',
      content: oversized,
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.match(json.message, /maks 10MB/i);
  });

  test('uploadSubmission mewajibkan berkas jawaban', async () => {
    const formData = new FormData();
    const res = await fetch(`${baseUrl}/submission`, { method: 'POST', body: formData });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.match(json.message, /wajib diunggah/i);
  });

  test('uploadSubmission menerima berkas valid dengan MIME spesifik', async () => {
    const res = await upload({
      endpoint: '/submission',
      filename: 'jawaban.pdf',
      contentType: 'application/pdf',
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.equal(json.data.originalname, 'jawaban.pdf');
  });

  test('uploadSubmission menoleransi application/octet-stream (signature diverifikasi service)', async () => {
    const res = await upload({
      endpoint: '/submission',
      filename: 'jawaban.zip',
      contentType: 'application/octet-stream',
      content: ZIP_BUFFER,
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.data.originalname, 'jawaban.zip');
  });

  test('uploadSubmission menolak ekstensi di luar whitelist', async () => {
    const res = await upload({
      endpoint: '/submission',
      filename: 'jawaban.txt',
      contentType: 'text/plain',
    });

    assert.equal(res.status, 400);
  });

  test('uploadSubmission menolak berkas melebihi konfigurasi', async () => {
    const oversized = Buffer.alloc(STORAGE.SUBMISSION_MAX_SIZE + 1024, 0x61);
    const res = await upload({
      endpoint: '/submission',
      filename: 'jawaban-besar.pdf',
      contentType: 'application/pdf',
      content: oversized,
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.match(json.message, /Ukuran berkas melebihi batas maksimal/);
  });
});
