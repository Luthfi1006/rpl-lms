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

export const updateMaterialSchema = {
  params: materialIdParamSchema.params,
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, { message: 'Judul materi tidak boleh kosong' })
        .max(150, { message: 'Judul materi maksimal 150 karakter' })
        .optional(),
      description: z
        .string()
        .trim()
        .max(5000, { message: 'Deskripsi materi maksimal 5000 karakter' })
        .nullable()
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Tidak ada data yang diperbarui',
    }),
};
