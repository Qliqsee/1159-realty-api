export const kycSubmittedTemplate = (
  clientName: string,
  clientEmail: string,
  kycId: string,
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New KYC Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #2c3e50; margin-bottom: 20px;">New KYC Submission</h1>

    <p>A client has submitted their KYC for review:</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Client Name:</strong> ${clientName}</p>
      <p style="margin: 5px 0;"><strong>Client Email:</strong> ${clientEmail}</p>
      <p style="margin: 5px 0;"><strong>KYC ID:</strong> ${kycId}</p>
    </div>

    <p>Please log in to the admin portal to review and approve or reject this KYC submission.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #777;">
      Best regards,<br>
      The 1159 Realty System
    </p>
  </div>
</body>
</html>
  `.trim();
};
