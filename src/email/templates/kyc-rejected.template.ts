export const kycRejectedTemplate = (
  clientName: string,
  reason: string,
  feedback?: string,
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Rejected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #e74c3c; margin-bottom: 20px;">KYC Verification Requires Attention</h1>

    <p>Hi ${clientName},</p>

    <p>Thank you for submitting your KYC verification. Unfortunately, we were unable to approve your submission at this time.</p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; color: #721c24;"><strong>Status:</strong> Rejected</p>
      <p style="margin: 0; color: #721c24;"><strong>Reason:</strong> ${reason}</p>
    </div>

    ${
      feedback
        ? `
    <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Additional feedback:</strong></p>
      <p style="margin: 0; color: #555;">${feedback}</p>
    </div>
    `
        : ''
    }

    <p><strong>What you need to do:</strong></p>
    <ul>
      <li>Review the reason for rejection above</li>
      <li>Update your KYC information accordingly</li>
      <li>Resubmit your KYC for review</li>
    </ul>

    <p>If you have any questions or need assistance, please contact our support team.</p>

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
