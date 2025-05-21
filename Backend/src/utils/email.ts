import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'andymelvin56@gmail.com';

export async function sendOtpEmail(to: string, otp: string) {
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Your Parking System OTP Code',
    html: `<p>Your OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  });
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const link = `https://yourdomain.com/reset-password?token=${token}`;
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Reset Your Parking System Password',
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
  });
}
