"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  business: string;
  message: string;
}) {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "info@musnid.com",
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"مُسند" <info@musnid.com>',
    to: "info@musnid.com",
    subject: `رسالة جديدة من ${formData.name}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>رسالة جديدة من موقع مُسند</h2>
        <p><strong>الاسم:</strong> ${formData.name}</p>
        <p><strong>البريد الإلكتروني:</strong> ${formData.email}</p>
        <p><strong>النشاط التجاري:</strong> ${formData.business || "—"}</p>
        <p><strong>الرسالة:</strong></p>
        <p>${formData.message}</p>
      </div>
    `,
  });
}
