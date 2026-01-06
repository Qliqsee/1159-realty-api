export const verificationOtpTemplate = (otp: string, userName?: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #2c3e50; margin-bottom: 20px;">Email Verification</h1>

    ${userName ? `<p>Hi ${userName},</p>` : '<p>Hi there,</p>'}

    <p>Thank you for signing up with 1159 Realty! To complete your registration, please use the following One-Time Password (OTP):</p>

    <div style="background-color: #fff; padding: 20px; text-align: center; border-radius: 5px; margin: 30px 0;">
      <h2 style="color: #3498db; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h2>
    </div>

    <p><strong>This OTP will expire in 10 minutes.</strong></p>

    <p>If you didn't request this verification, please ignore this email.</p>

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
