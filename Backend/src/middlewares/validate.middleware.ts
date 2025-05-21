import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import HttpException from '../exceptions/HttpException';

export function validate(schema: ZodSchema<any>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpException(400, result.error.errors[0].message));
    }
    next();
  };
}
