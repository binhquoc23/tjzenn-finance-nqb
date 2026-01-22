import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendVerificationEmail({
  to,
  subject,
  html,
}: SendEmailArgs) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // ví dụ smtp.gmail.com hoặc smtp.resend.com
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // nếu port 465 thì true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TJFinance" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
