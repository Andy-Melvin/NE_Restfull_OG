import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenPayload {
  id: string;
  role: Role;
}

export function generateToken(payload: TokenPayload, expiresIn: SignOptions['expiresIn'] = '1d'): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken<T>(token: string): T {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
