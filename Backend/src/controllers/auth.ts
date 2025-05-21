import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/db';
import { generateToken } from '../utils/jwt';
import HttpException from '../exceptions/HttpException';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.service';
import { getPasswordResetTemplate } from '../templates/email/passwordReset';
import { getPasswordChangedTemplate } from '../templates/email/passwordChanged';
import { UserRole, AuthRequest } from '../middlewares/auth.middleware';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../schema/auth.schema';

export async function register(req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpException(400, 'User already exists');

    const hashed = await bcrypt.hash(password, 10);
    const userRole = (role?.toUpperCase() || 'PARKING_ATTENDANT') as UserRole;

    if (!['ADMIN', 'PARKING_ATTENDANT'].includes(userRole)) {
      throw new HttpException(400, 'Invalid role. Must be ADMIN or PARKING_ATTENDANT');
    }

    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        firstName, 
        lastName, 
        role: userRole
      },
    });

    const token = generateToken({ id: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        firstName, 
        lastName, 
        role: user.role 
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(401, 'Invalid credentials');
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role 
      } 
    });
  } catch (err) {
    next(err);
  }
}

/* ========== PASSWORD RESET FLOW ========== */

export async function forgotPassword(req: Request<{}, {}, ForgotPasswordInput>, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.json({ message: 'Password reset instructions sent to your email.' });
      return;
    }

    const existingToken = await prisma.user.findFirst({
      where: { email, resetTokenExpiry: { gt: new Date() } }
    });

    if (existingToken) {
      res.json({ message: 'Password reset instructions sent to your email.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const htmlContent = getPasswordResetTemplate(resetUrl);

    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      text: `Click the following link to reset your password: ${resetUrl}`,
      html: htmlContent
    });

    res.json({ message: 'Password reset instructions sent to your email.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request<{}, {}, ResetPasswordInput>, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) throw new HttpException(400, 'Invalid or expired password reset link.');

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    const htmlContent = getPasswordChangedTemplate();

    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      text: 'Your password has been changed successfully.',
      html: htmlContent
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
}

export const logout = (req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    next(error);
  }
};