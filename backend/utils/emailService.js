import nodemailer from 'nodemailer';

/**
 * Creates and returns the nodemailer transporter configured via environment variables.
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE;

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: {
        user,
        pass
      }
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
  }

  // Fallback for development if SMTP credentials are not yet defined
  console.warn('[EMAIL SERVICE] SMTP credentials not fully configured in .env. Falling back to test transporter.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'dev@sonutechhub.local',
      pass: 'devpassword'
    }
  });
};

/**
 * Builds the HTML content for the verification OTP email.
 */
export const buildOtpEmailHtml = ({ otp, name = 'Learner', expiryMinutes = 10 }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SonuTechHub Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f8fc;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .wrapper {
      max-width: 540px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #dbeafe;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-card {
      background: #f8fafc;
      border: 2px dashed #93c5fd;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #2563eb;
      margin: 4px 0;
    }
    .otp-expiry {
      font-size: 12px;
      color: #ea580c;
      font-weight: 600;
      margin-top: 8px;
    }
    .notice-box {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin-top: 24px;
    }
    .footer {
      background: #fafaf9;
      padding: 20px 32px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SonuTechHub</h1>
      <p>Free Java DSA Practice Platform & Online Compiler</p>
      <div class="badge">Email Verification</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name ? name : 'there'},</div>
      <div class="message">
        Thank you for joining <strong>SonuTechHub</strong>! Please use the 6-digit verification code below to verify your email address and activate your account.
      </div>

      <div class="otp-card">
        <div class="otp-label">Your One-Time Password (OTP)</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏳ Valid for ${expiryMinutes} minutes only</div>
      </div>

      <div class="notice-box">
        <strong>🔒 Security Notice:</strong> Never share this OTP with anyone. SonuTechHub administrators will never ask for your verification code. If you did not create an account, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} SonuTechHub • Code • Practice • Excel<br>
      Automated system email, please do not reply.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Sends a real OTP verification email via SMTP transporter.
 */
export const sendOtpEmail = async ({ to, otp, name = 'Learner', purpose = 'signup' }) => {
  const fromAddress = process.env.SMTP_FROM || (process.env.SMTP_USER ? `SonuTechHub <${process.env.SMTP_USER}>` : 'SonuTechHub <no-reply@sonutechhub.com>');

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `🔐 ${otp} is your SonuTechHub Verification Code`,
    text: `Your SonuTechHub verification code is: ${otp}. It is valid for 10 minutes. Please do not share this code with anyone.`,
    html: buildOtpEmailHtml({ otp, name, expiryMinutes: 10 })
  };

  const hasCredentials = !!(process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD));

  if (!hasCredentials) {
    console.log('====================================================');
    console.log(`[SMTP DEV MODE] Email verification for: ${to}`);
    console.log(`[SMTP DEV MODE] OTP Code: ${otp}`);
    console.log('====================================================');
    return { success: true, mode: 'dev-logged' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Successfully dispatched OTP email to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    // Always print OTP in server logs so users/testers aren't completely blocked if SMTP credentials are in invalid format
    console.log(`[FALLBACK OTP LOG] OTP for ${to} is: ${otp}`);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
