import { z } from 'zod';

export const parkingSchema = z.object({
  code: z.string().min(3).max(10),
  name: z.string().min(3).max(100),
  location: z.string().min(5).max(200),
  availableSpaces: z.number().int().min(0),
  hourlyRate: z.number().min(0).max(1000),
});

export type ParkingInput = z.infer<typeof parkingSchema>; 