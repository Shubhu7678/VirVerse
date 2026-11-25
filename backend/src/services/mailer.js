import nodemailer from 'nodemailer';
import EmailLog from '../models/EmailLog.js';

const configured = () => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);

let transport;
const getTransport = () => {
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
};

async function record(entry) {
  try {
    await EmailLog.create(entry);
  } catch (err) {
    console.error('Could not record email log:', err.message);
  }
}

// Never throws: a mail problem must not break the request. Returns { sent }.
// Without SMTP settings the message is printed to the server console instead (development only).
// `type` labels the email in the admin Emails page.
export async function sendMail({ to, subject, text, type = 'other' }) {
  if (!configured()) {
    await record({ type, to, subject, status: 'skipped', error: 'Email is not set up' });
    if (process.env.NODE_ENV === 'production') {
      console.warn('Email is not configured (SMTP_HOST / MAIL_FROM). A message to a user was not sent.');
    } else {
      console.log(`\n[mail not configured] To: ${to}\nSubject: ${subject}\n${text}\n`);
    }
    return { sent: false };
  }
  try {
    await getTransport().sendMail({ from: process.env.MAIL_FROM, to, subject, text });
    await record({ type, to, subject, status: 'sent' });
    return { sent: true };
  } catch (err) {
    console.error('Could not send email:', err.message);
    await record({ type, to, subject, status: 'failed', error: String(err.message).slice(0, 300) });
    return { sent: false };
  }
}

export const verifyEmail = (name, code) => ({
  subject: `${code} is your VirVerse verification code`,
  text: `Hi ${name},\n\nYour VirVerse verification code is:\n\n    ${code}\n\nIt expires in 10 minutes. If you did not try to create an account, ignore this email and nothing will be created.\n`,
});

export const resetEmail = (name, link) => ({
  subject: 'Reset your VirVerse password',
  text: `Hi ${name},\n\nUse this link to choose a new password. It works once and expires in 1 hour:\n\n${link}\n\nIf you did not ask for this, you can ignore this email. Your password stays the same.\n`,
});
