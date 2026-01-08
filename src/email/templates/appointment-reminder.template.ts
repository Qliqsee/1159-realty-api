export const appointmentReminderTemplate = (
  recipientName: string,
  propertyName: string,
  appointmentDate: Date,
  location: string,
  message?: string,
): string => {
  const formattedDate = new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(appointmentDate);

  const formattedTime = new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(appointmentDate);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #3498db; margin-bottom: 20px;">Appointment Reminder</h1>

    <p>Hi ${recipientName},</p>

    <p>This is a friendly reminder about your upcoming property viewing appointment scheduled for tomorrow.</p>

    <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; color: #0c5460;"><strong>Appointment Details:</strong></p>
      <p style="margin: 5px 0; color: #0c5460;"><strong>Property:</strong> ${propertyName}</p>
      <p style="margin: 5px 0; color: #0c5460;"><strong>Date:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0; color: #0c5460;"><strong>Time:</strong> ${formattedTime}</p>
      <p style="margin: 5px 0; color: #0c5460;"><strong>Location:</strong> ${location}</p>
    </div>

    ${message ? `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; color: #856404;"><strong>Important Information:</strong></p>
      <p style="margin: 5px 0; color: #856404;">${message}</p>
    </div>
    ` : ''}

    <p>Please arrive on time for your scheduled viewing. If you need to cancel or reschedule, please do so through your account dashboard.</p>

    <p>We look forward to seeing you!</p>

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
