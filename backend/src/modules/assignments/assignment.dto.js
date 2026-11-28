import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const meetingIdParamSchema = {
  params: z.object({ meetingId: uuid('ID pertemuan') }),
};

export const classIdParamSchema = {
  params: z.object({ classId: uuid('ID kelas') }),
};

export const assignmentIdParamSchema = {
  params: z.object({ id: uuid('ID tugas') }),
};

const weightSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas harus berupa angka' });
      return z.NEVER;
    }
    if (number < 0 || number > 100) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas harus antara 0 hingga 100' });
      return z.NEVER;
    }
    if (!Number.isInteger(number * 100)) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas maksimal memiliki 2 angka desimal' });
      return z.NEVER;
    }
    return number;
  });

const booleanSchema = z.union([z.boolean(), z.enum(['true', 'false'])]).transform((value) => value === true || value === 'true');

export const createAssignmentSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Judul tugas wajib diisi').max(150, 'Judul tugas maksimal 150 karakter'),
    instructions: z.string().trim().max(5000, 'Instruksi maksimal 5000 karakter').optional().nullable(),
    weight_percentage: weightSchema,
    due_date: z.string().datetime({ message: 'due_date harus format ISO 8601' }),
    allow_late: booleanSchema.optional().default(false),
    is_published: booleanSchema.optional().default(true),
  }).strict(),
};

export const updateAssignmentSchema = {
  params: assignmentIdParamSchema.params,
  body: z.object({
    title: z.string().trim().min(1, 'Judul tugas tidak boleh kosong').max(150).optional(),
    instructions: z.string().trim().max(5000).nullable().optional(),
    weight_percentage: weightSchema.optional(),
    due_date: z.string().datetime({ message: 'due_date harus format ISO 8601' }).optional(),
    allow_late: booleanSchema.optional(),
    is_published: booleanSchema.optional(),
  }).strict(),
};
