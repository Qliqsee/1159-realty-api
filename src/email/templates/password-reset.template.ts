export const passwordResetTemplate = (resetLink: string, userName?: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h1>

    ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi there,</p>'}

    <p>We received a request to reset your password for your 1159 Realty account. Click the button below to reset it:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}"
         style="background-color: #3498db; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Reset Password
      </a>
    </div>

    <p>Or copy and paste this link into your browser:</p>
    <p style="background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
      ${resetLink}
    </p>

    <p><strong>This link will expire in 1 hour.</strong></p>

    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #777;">
      Best regards,<br>
      The 1159 Realty Team
    </p>
  </div>
</body>
</html>
  `.trim();
};
