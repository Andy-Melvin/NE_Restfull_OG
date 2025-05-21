import { z } from 'zod';

// Validation messages
const VALIDATION_MESSAGES = {
  PASSWORD: 'Password must contain at least one uppercase letter, one number, one special character, and be at least 6 characters long',
  EMAIL: 'Please enter a valid email address',
} as const;

// Regex patterns
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Schema for frontend validation
export const registerSchema = z.object({
  email: z.string()
    .email(VALIDATION_MESSAGES.EMAIL)
    .regex(EMAIL_REGEX, VALIDATION_MESSAGES.EMAIL),
  password: z.string()
    .min(6)
    .regex(PASSWORD_REGEX, VALIDATION_MESSAGES.PASSWORD),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z.enum(['admin', 'parking_attendant']).optional(),
});

export const createParkingSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  numberOfSpaces: z.number().int().positive(),
  chargingFeePerHour: z.number().positive(),
});

// Internal schema that includes role (used in backend)
export const registerSchemaInternal = registerSchema.extend({
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export const loginSchema = z.object({
  email: z.string()
    .email(VALIDATION_MESSAGES.EMAIL)
    .regex(EMAIL_REGEX, VALIDATION_MESSAGES.EMAIL),
  password: z.string()
    .min(6)
    .regex(PASSWORD_REGEX, VALIDATION_MESSAGES.PASSWORD),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email(VALIDATION_MESSAGES.EMAIL)
    .regex(EMAIL_REGEX, VALIDATION_MESSAGES.EMAIL),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(6)
    .regex(PASSWORD_REGEX, VALIDATION_MESSAGES.PASSWORD),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
