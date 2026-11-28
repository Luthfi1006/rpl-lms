import { createReadStream } from 'node:fs';
import { AssignmentService } from './assignment.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class AssignmentController {
  static async create(req, res, next) {
    try {
      const info = extractClientInfo(req);
      const data = await AssignmentService.createAssignment({
        meetingId: req.params.meetingId,
        payload: req.body,
        file: req.file,
        user: req.user,
        ...info,
      });
      return apiResponse.success(res, { statusCode: 201, message: 'Tugas berhasil diterbitkan', data });
    } catch (error) { return next(error); }
  }

  static async list(req, res, next) {
    try {
      const data = await AssignmentService.listAssignments({ classId: req.params.classId, user: req.user });
      return apiResponse.success(res, { message: 'Daftar tugas berhasil diambil', data });
    } catch (error) { return next(error); }
  }

  static async detail(req, res, next) {
    try {
      const data = await AssignmentService.getAssignmentDetail({ assignmentId: req.params.id, user: req.user });
      return apiResponse.success(res, { message: 'Detail tugas berhasil diambil', data });
    } catch (error) { return next(error); }
  }

  static async update(req, res, next) {
    try {
      const info = extractClientInfo(req);
      const data = await AssignmentService.updateAssignment({
        assignmentId: req.params.id,
        payload: req.body,
        file: req.file,
        user: req.user,
        ...info,
      });
      return apiResponse.success(res, { message: 'Tugas berhasil diperbarui', data });
    } catch (error) { return next(error); }
  }

  static async delete(req, res, next) {
    try {
      const info = extractClientInfo(req);
      const data = await AssignmentService.deleteAssignment({
        assignmentId: req.params.id,
        user: req.user,
        ...info,
      });
      return apiResponse.success(res, { message: 'Tugas berhasil dihapus', data });
    } catch (error) { return next(error); }
  }

  static async download(req, res, next) {
    try {
      const download = await AssignmentService.getAssignmentFileForDownload({
        assignmentId: req.params.id,
        user: req.user,
      });
      res.attachment(download.fileName);
      res.setHeader('Content-Type', download.mimeType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-store');
      const stream = createReadStream(download.filePath);
      stream.once('error', (error) => {
        if (res.headersSent) { res.destroy(); return; }
        next(error);
      });
      return stream.pipe(res);
    } catch (error) { return next(error); }
  }
}
