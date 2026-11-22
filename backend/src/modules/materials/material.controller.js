import { createReadStream } from 'node:fs';
import { MaterialService } from './material.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class MaterialController {
  static async createMaterial(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const material = await MaterialService.createMaterial({
        meetingId: req.params.meetingId,
        title: req.body.title,
        description: req.body.description,
        file: req.file,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Materi perkuliahan berhasil diunggah',
        data: material,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteMaterial(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const result = await MaterialService.deleteMaterial({
        materialId: req.params.id,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Materi perkuliahan berhasil dihapus',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateMaterial(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const material = await MaterialService.updateMaterial({
        materialId: req.params.id,
        updateData: req.body,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Materi perkuliahan berhasil diperbarui',
        data: material,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async downloadMaterial(req, res, next) {
    try {
      const download = await MaterialService.getMaterialForDownload({
        materialId: req.params.id,
        user: req.user,
      });

      res.attachment(download.fileName);
      res.setHeader('Content-Type', download.mimeType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-store');

      const stream = createReadStream(download.filePath);
      stream.once('error', (error) => {
        if (res.headersSent) {
          console.error('[MaterialController] Gagal mengirim stream materi:', error);
          res.destroy();
          return;
        }
        next(error);
      });
      return stream.pipe(res);
    } catch (error) {
      return next(error);
    }
  }
}
