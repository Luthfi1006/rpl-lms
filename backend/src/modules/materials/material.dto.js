import { z } from 'zod';

export const meetingIdParamSchema = {
  params: z.object({
    meetingId: z.string().uuid({ message: 'ID pertemuan harus UUID valid' }),
  }),
};

export const materialIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'ID materi harus UUID valid' }),
  }),
};

export const createMaterialSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Judul materi wajib diisi').max(150),
    description: z
      .string()
      .trim()
      .max(5000, 'Deskripsi materi maksimal 5000 karakter')
      .optional()
      .transform((value) => value || null),
  }),
};
