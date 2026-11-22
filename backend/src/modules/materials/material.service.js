import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../config/prisma.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { ROLES } from '../../constants/roles.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AppError } from '../../utils/errors.js';
import {
  ensureCanManageClass,
  ensureCanReadClass,
} from '../../utils/ownership.js';
import {
  generateStorageName,
  resolveStorageSubdir,
  sanitizeFilename,
} from '../../utils/storage.js';

const MATERIAL_MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
};

const MATERIAL_FILE_SELECT = {
  id: true,
  original_name: true,
  storage_name: true,
  file_path: true,
  mime_type: true,
  size_bytes: true,
};

const meetingInclude = {
  class: {
    include: {
      lecturer: { select: { user_id: true } },
    },
  },
};

function getMaterialFilePath(file) {
  if (!file?.storage_name || path.basename(file.storage_name) !== file.storage_name) {
    throw new AppError('Metadata berkas materi tidak valid', 500);
  }

  const expectedRelativePath = path.join('materials', file.storage_name);
  if (path.normalize(file.file_path) !== expectedRelativePath) {
    throw new AppError('Lokasi berkas materi tidak valid', 500);
  }

  return path.resolve(resolveStorageSubdir('material'), file.storage_name);
}

function auditValues(material, file) {
  return {
    meeting_id: material.meeting_id,
    title: material.title,
    description: material.description,
    file_id: file.id,
    original_name: file.original_name,
    size_bytes: file.size_bytes,
  };
}

export class MaterialService {
  static async createMaterial({
    meetingId,
    title,
    description,
    file,
    user,
    ipAddress,
    userAgent,
  }) {
    if (!file) {
      throw new AppError('Berkas materi pembelajaran wajib diunggah', 400);
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: meetingInclude,
    });
    if (!meeting) {
      throw new AppError('Pertemuan tidak ditemukan', 404);
    }
    ensureCanManageClass(meeting.class, user);

    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = MATERIAL_MIME_TYPES[extension];
    if (!mimeType) {
      throw new AppError('Format berkas materi tidak didukung', 400);
    }

    const originalName = sanitizeFilename(file.originalname);
    if (!originalName || originalName.length > 255) {
      throw new AppError('Nama berkas materi harus berisi maksimal 255 karakter', 400);
    }

    const storageName = generateStorageName(file.originalname);
    const storageDirectory = resolveStorageSubdir('material');
    const destinationPath = path.resolve(storageDirectory, storageName);
    const relativeFilePath = path.join('materials', storageName);

    await fs.mkdir(storageDirectory, { recursive: true });
    await fs.writeFile(destinationPath, file.buffer, { flag: 'wx' });

    try {
      return await prisma.$transaction(async (tx) => {
        const fileRecord = await tx.file.create({
          data: {
            original_name: originalName,
            storage_name: storageName,
            file_path: relativeFilePath,
            mime_type: mimeType,
            size_bytes: file.size,
            uploaded_by: user.id,
          },
          select: MATERIAL_FILE_SELECT,
        });

        const material = await tx.material.create({
          data: {
            meeting_id: meetingId,
            title,
            description,
            file_id: fileRecord.id,
          },
          include: {
            file: {
              select: {
                id: true,
                original_name: true,
                mime_type: true,
                size_bytes: true,
                created_at: true,
              },
            },
          },
        });

        await AuditLogService.record({
          userId: user.id,
          action: 'CREATE_MATERIAL',
          entity: AUDIT_ENTITIES.MATERIALS,
          entityId: material.id,
          newValues: auditValues(material, fileRecord),
          ipAddress,
          userAgent,
          dbClient: tx,
        });

        return material;
      });
    } catch (error) {
      try {
        await fs.unlink(destinationPath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error('[MaterialService] Gagal membersihkan berkas upload:', {
            path: destinationPath,
            error: cleanupError.message,
          });
        }
      }
      throw error;
    }
  }

  static async deleteMaterial({ materialId, user, ipAddress, userAgent }) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        file: { select: MATERIAL_FILE_SELECT },
        meeting: { include: meetingInclude },
      },
    });
    if (!material) {
      throw new AppError('Materi perkuliahan tidak ditemukan', 404);
    }
    ensureCanManageClass(material.meeting.class, user);

    const sourcePath = getMaterialFilePath(material.file);
    const quarantinedPath = `${sourcePath}.deleting-${crypto.randomUUID()}`;
    let fileWasQuarantined = false;

    try {
      await fs.rename(sourcePath, quarantinedPath);
      fileWasQuarantined = true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.material.delete({ where: { id: materialId } });
        await tx.file.delete({ where: { id: material.file.id } });
        await AuditLogService.record({
          userId: user.id,
          action: 'DELETE_MATERIAL',
          entity: AUDIT_ENTITIES.MATERIALS,
          entityId: material.id,
          oldValues: auditValues(material, material.file),
          ipAddress,
          userAgent,
          dbClient: tx,
        });
      });
    } catch (error) {
      if (fileWasQuarantined) {
        try {
          await fs.rename(quarantinedPath, sourcePath);
        } catch (restoreError) {
          console.error('[MaterialService] Gagal memulihkan berkas setelah delete gagal:', {
            path: sourcePath,
            error: restoreError.message,
          });
        }
      }
      throw error;
    }

    if (fileWasQuarantined) {
      try {
        await fs.unlink(quarantinedPath);
      } catch (error) {
        console.error('[MaterialService] Metadata terhapus tetapi berkas fisik gagal dibersihkan:', {
          path: quarantinedPath,
          error: error.message,
        });
        throw new AppError('Materi terhapus, tetapi berkas fisik gagal dibersihkan', 500);
      }
    }

    return { id: materialId };
  }

  static async getMaterialForDownload({ materialId, user }) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        file: { select: MATERIAL_FILE_SELECT },
        meeting: { include: meetingInclude },
      },
    });
    if (!material) {
      throw new AppError('Materi perkuliahan tidak ditemukan', 404);
    }

    await ensureCanReadClass({
      user,
      classRecord: material.meeting.class,
      classId: material.meeting.class_id,
    });
    if (user.role === ROLES.MAHASISWA && !material.meeting.is_published) {
      throw new AppError('Materi perkuliahan tidak ditemukan', 404);
    }

    const filePath = getMaterialFilePath(material.file);
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new AppError('Berkas materi tidak ditemukan pada penyimpanan', 404);
      }
      throw error;
    }

    const mimeType = MATERIAL_MIME_TYPES[path.extname(material.file.storage_name).toLowerCase()];
    if (!mimeType) {
      throw new AppError('Tipe berkas materi tidak valid', 500);
    }

    return {
      filePath,
      fileName: sanitizeFilename(material.file.original_name),
      mimeType,
    };
  }
}
