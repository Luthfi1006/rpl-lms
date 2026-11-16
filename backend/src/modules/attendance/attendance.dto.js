import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const meetingIdParamSchema = {
  params: z.object({
    meetingId: uuid('ID pertemuan'),
  }),
};

export const sessionIdParamSchema = {
  params: z.object({
    sessionId: uuid('ID sesi presensi'),
  }),
};

export const attendanceRecordIdParamSchema = {
  params: z.object({
    id: uuid('ID catatan kehadiran'),
  }),
};

export const updateAttendanceRecordSchema = {
  params: attendanceRecordIdParamSchema.params,
  body: z
    .object({
      status: z.enum(['HADIR', 'SAKIT', 'IZIN', 'ALPA'], {
        errorMap: () => ({
          message: 'Status presensi harus salah satu dari HADIR, SAKIT, IZIN, atau ALPA',
        }),
      }),
      notes: z
        .string()
        .trim()
        .max(1000, 'Catatan maksimal 1000 karakter')
        .nullable()
        .optional(),
    })
    .strict(),
};
