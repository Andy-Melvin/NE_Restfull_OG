import { z } from 'zod';

export const reportQuerySchema = z.object({
  from: z.string().datetime('Invalid from date'),
  to: z.string().datetime('Invalid to date'),
}).refine(
  (data) => new Date(data.from) <= new Date(data.to),
  {
    message: "From date must be before or equal to to date",
    path: ["from"],
  }
);

export type ReportQueryInput = z.infer<typeof reportQuerySchema>; 