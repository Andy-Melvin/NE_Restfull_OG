import { z } from 'zod';

// Validation messages
const VALIDATION_MESSAGES = {
  PLATE_NUMBER: 'Plate number must be in the format RA[A-Z]123[A-Z] (e.g., RAA123B)',
} as const;

// Regex patterns
const RWANDA_PLATE_REGEX = /^RA[A-Z]\d{3}[A-Z]$/;

export const carEntrySchema = z.object({
  plateNumber: z.string()
    .regex(RWANDA_PLATE_REGEX, VALIDATION_MESSAGES.PLATE_NUMBER),
  parkingCode: z.string().min(1),
});

export const carExitSchema = z.object({
  recordId: z.string().uuid(),
});

export type CarEntryInput = z.infer<typeof carEntrySchema>;
export type CarExitInput = z.infer<typeof carExitSchema>; 