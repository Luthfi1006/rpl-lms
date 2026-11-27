import path from 'node:path';
import { AppError } from './errors.js';

/**
 * Verifikasi signature (magic-byte) berkas dokumen — NFR-003.
 *
 * Ekstensi dan `mimetype` yang dideklarasikan klien dapat dipalsukan dengan
 * mudah (mis. `virus.exe` diganti nama menjadi `tugas.pdf`). Pemeriksaan ini
 * membaca beberapa byte pertama dari buffer (multer memory storage) dan
 * memastikan isinya benar-benar sesuai format yang diklaim.
 *
 * Format yang didukung sama dengan whitelist BR-007:
 *   - PDF            → diawali `%PDF-`
 *   - ZIP/DOCX/XLSX  → diawali `PK\x03\x04`
 *
 * DOCX dan XLSX adalah arsip ZIP (Office Open XML), sehingga keduanya sah
 * memiliki header ZIP yang sama.
 */

const ZIP_HEADER = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const PDF_HEADER = Buffer.from('%PDF-', 'latin1');

const DOCUMENT_SIGNATURES = Object.freeze({
  '.pdf': [PDF_HEADER],
  '.docx': [ZIP_HEADER],
  '.xlsx': [ZIP_HEADER],
  '.zip': [ZIP_HEADER],
});

/** Format pesan baku agar konsisten dengan kontrak Bab 4.4. */
const SIGNATURE_MISMATCH_MESSAGE = 'Isi berkas tidak sesuai dengan format yang dideklarasikan';
const UNSUPPORTED_EXTENSION_MESSAGE =
  'Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip';

/** Ekstensi yang memiliki signature terdaftar. */
export const SIGNATURE_SUPPORTED_EXTENSIONS = Object.freeze(Object.keys(DOCUMENT_SIGNATURES));

/**
 * Normalisasi masukan ekstensi.
 *
 * Menerima `'.pdf'`, `'pdf'`, maupun nama berkas utuh (`'Tugas.PDF'`) agar
 * pemanggil tidak perlu ingat bentuk yang diharapkan.
 *
 * @param {string} value ekstensi atau nama berkas
 * @returns {string} ekstensi lowercase berawalan titik, atau string kosong
 */
function normalizeExtension(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) {
    return '';
  }

  if (raw.startsWith('.') && !raw.includes('/') && !raw.includes('\\')) {
    return raw;
  }

  if (raw.includes('.') || raw.includes('/') || raw.includes('\\')) {
    return path.extname(raw);
  }

  return `.${raw}`;
}

/**
 * Apakah buffer memiliki signature yang sah untuk ekstensi tersebut?
 *
 * Buffer kosong, `null`, atau lebih pendek dari signature selalu dianggap
 * tidak valid. Ekstensi di luar whitelist juga dianggap tidak valid.
 *
 * @param {Buffer|null|undefined} buffer isi berkas
 * @param {string} extension ekstensi (`'.pdf'`) atau nama berkas
 * @returns {boolean}
 */
export function hasValidDocumentSignature(buffer, extension) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return false;
  }

  const signatures = DOCUMENT_SIGNATURES[normalizeExtension(extension)];
  if (!signatures) {
    return false;
  }

  return signatures.some((signature) => {
    if (buffer.length < signature.length) {
      return false;
    }
    return buffer.subarray(0, signature.length).equals(signature);
  });
}

/**
 * Pastikan buffer memiliki signature yang sesuai; lempar `AppError 400` bila
 * tidak.
 *
 * Dipanggil oleh service setelah validasi ekstensi/ukuran dan sebelum berkas
 * ditulis ke disk, sehingga berkas palsu tidak pernah mendarat di private
 * storage.
 *
 * @param {Buffer|null|undefined} buffer isi berkas
 * @param {string} extension ekstensi (`'.pdf'`) atau nama berkas
 * @returns {void}
 * @throws {AppError} 400 bila signature tidak cocok atau ekstensi tidak dikenal
 */
export function assertDocumentSignature(buffer, extension) {
  const normalized = normalizeExtension(extension);
  if (!DOCUMENT_SIGNATURES[normalized]) {
    throw new AppError(UNSUPPORTED_EXTENSION_MESSAGE, 400);
  }

  if (!hasValidDocumentSignature(buffer, normalized)) {
    throw new AppError(SIGNATURE_MISMATCH_MESSAGE, 400);
  }
}
