import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const sendMail = async ({ to, subject, html, text }) => {
  if (!env.SMTP_HOST) return;
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
};
