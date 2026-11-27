import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default-access-secret-minimum-32-chars-long',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-minimum-32-chars-long',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(','),
};

/**
 * Batas konfigurasi ukuran berkas jawaban tugas (FR-019, BR-008).
 *
 * SRS menetapkan rentang yang sah 5MB–10MB. Nilai di luar rentang tidak boleh
 * diterima diam-diam, karena konfigurasi yang menyimpang akan melanggar
 * kebijakan keamanan berkas yang sudah disepakati.
 */
export const SUBMISSION_SIZE_LIMITS = Object.freeze({
  MIN_MB: 5,
  MAX_MB: 10,
  DEFAULT_MB: 10,
});

const MEGABYTE = 1024 * 1024;

/**
 * Mengubah nilai env `MAX_SUBMISSION_SIZE_MB` menjadi ukuran byte.
 *
 * Nilai kosong menghasilkan default 10MB. Nilai non-angka atau di luar rentang
 * 5–10MB melempar `Error` saat modul dimuat (startup), sehingga kesalahan
 * konfigurasi terlihat segera alih-alih menghasilkan batas yang tidak sah.
 *
 * @param {string|number|undefined|null} rawValue nilai mentah env
 * @returns {number} ukuran maksimum dalam byte
 */
export function parseSubmissionMaxSize(rawValue = process.env.MAX_SUBMISSION_SIZE_MB) {
  const raw = rawValue === undefined || rawValue === null ? '' : String(rawValue).trim();
  if (raw === '') {
    return SUBMISSION_SIZE_LIMITS.DEFAULT_MB * MEGABYTE;
  }

  const megabytes = Number(raw);
  if (
    !Number.isFinite(megabytes) ||
    megabytes < SUBMISSION_SIZE_LIMITS.MIN_MB ||
    megabytes > SUBMISSION_SIZE_LIMITS.MAX_MB
  ) {
    throw new Error(
      `[config] MAX_SUBMISSION_SIZE_MB tidak valid: "${raw}". ` +
        `Nilai harus berupa angka pada rentang ${SUBMISSION_SIZE_LIMITS.MIN_MB}–` +
        `${SUBMISSION_SIZE_LIMITS.MAX_MB} MB (FR-019, BR-008).`
    );
  }

  return Math.round(megabytes * MEGABYTE);
}

/**
 * Konfigurasi penyimpanan berkas terproteksi (BR-009, NFR-005)
 */
export const STORAGE = {
  // Root direktori privat — DI LUAR public web root
  UPLOAD_DIR: path.resolve(__dirname, '../../storage/private'),
  AVATAR_DIR: path.resolve(__dirname, '../../storage/private/avatars'),
  BASE_URL: path.resolve(__dirname, '../../storage'),

  // Kebijakan avatar (FR-007)
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  AVATAR_ALLOWED_MIMES: ['image/jpeg', 'image/png'],
  AVATAR_ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],

  // Kebijakan dokumen umum (BR-007)
  DOC_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOC_ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.xlsx', '.zip'],

  // Kebijakan berkas jawaban tugas (FR-019, BR-008) — 5MB–10MB
  SUBMISSION_MAX_SIZE: parseSubmissionMaxSize(),
};
