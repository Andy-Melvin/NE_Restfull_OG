import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import HttpException from '../exceptions/HttpException';

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpException(403, 'Forbidden: Insufficient role'));
    }
    next();
  };
}
