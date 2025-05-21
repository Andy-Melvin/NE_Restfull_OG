import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 400,
      success: false,
      message: err.message
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 401,
      success: false,
      message: 'Invalid token'
    });
    return;
  }

  // Handle other errors
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    status,
    success: false,
    message
  });
}; 