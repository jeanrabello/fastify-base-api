import nodemailer from "nodemailer";
import { EmailOptions } from "@src/types/emailOptions";
import config from "@config/api";

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: config.nodemailer.service,
    auth: {
      user: config.nodemailer.user,
      pass: config.nodemailer.pass,
    },
  });

  const mailOptions = {
    from: `"${config.app.name}" <${config.nodemailer.user}>`,
    to: options.to,
    subject: options.subject,
    text: options.content,
  };

  await transporter.sendMail(mailOptions);
}
