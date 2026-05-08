import nodemailer from "nodemailer";

// ================== CONFIG ==================
const SMTP_HOST = "mail.onchaintrustedcrypto.com";
const SMTP_PORT = 587;
const SMTP_USER = "ehealth@onchaintrustedcrypto.com";
const SMTP_PASS = "Abcd1234567891011121314";
// ============================================

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // MUST be false for 587
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    authMethod: "LOGIN",
    requireTLS: true,
    tls: {
        rejectUnauthorized: false,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Health System" <${SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log("✅ EMAIL SENT:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ SEND FAILED:", err);
        return { success: false, error: err };
    }
};

export default sendEmail;
