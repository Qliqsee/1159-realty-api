export const kycApprovedTemplate = (
  clientName: string,
  feedback?: string,
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #27ae60; margin-bottom: 20px;">KYC Verification Approved</h1>

    <p>Hi ${clientName},</p>

    <p>Congratulations! Your KYC verification has been approved.</p>

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; color: #155724;"><strong>Status:</strong> Verified</p>
    </div>

    ${
      feedback
        ? `
    <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Feedback from our team:</strong></p>
      <p style="margin: 0; color: #555;">${feedback}</p>
    </div>
    `
        : ''
    }

    <p>You now have full access to all features on 1159 Realty, including:</p>
    <ul>
      <li>View property maps and plots</li>
      <li>Apply for partnership</li>
      <li>Access all property features</li>
    </ul>

    <p>Thank you for completing your verification!</p>

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
