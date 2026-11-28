import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const assignmentIdParamSchema = {
  params: z.object({ assignmentId: uuid('ID tugas') }),
};

export const submissionIdParamSchema = {
  params: z.object({ id: uuid('ID submission') }),
};
