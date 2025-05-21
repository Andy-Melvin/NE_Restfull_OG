import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'johndue566@gmail.com',
    pass: process.env.EMAIL_PASS || 'faqhsurtgiwxtmxe'
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'johndue566@gmail.com',
      ...options
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
}; 