import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import HttpException from '../exceptions/HttpException';
import { Role } from '@prisma/client';
import prisma from '../lib/db';

export type UserRole = 'ADMIN' | 'PARKING_ATTENDANT';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpException(401, 'No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken<{ id: string; role: Role }>(token);
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (err) {
    next(new HttpException(401, 'Invalid token'));
  }
}

export function authorize(roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    const userRole = req.user.role.toUpperCase();
    const requiredRoles = roles.map(role => role.toUpperCase());

    if (!requiredRoles.includes(userRole)) {
      return next(new HttpException(403, 'Insufficient permissions'));
    }

    next();
  };
}
