export const invoiceReminderTemplate = (
  recipientName: string,
  propertyName: string,
  installmentNumber: number,
  amount: number,
  dueDate: Date,
  daysUntilDue: number,
): string => {
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dueDate);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Payment Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
    <h1 style="color: #f39c12; margin-bottom: 20px;">Payment Reminder</h1>

    <p>Hi ${recipientName},</p>

    <p>This is a friendly reminder that your payment for <strong>${propertyName}</strong> is due in <strong>${daysUntilDue} day(s)</strong>.</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; color: #856404;"><strong>Payment Details:</strong></p>
      <p style="margin: 5px 0; color: #856404;">Installment #${installmentNumber}</p>
      <p style="margin: 5px 0; color: #856404;">Amount: ${formattedAmount}</p>
      <p style="margin: 5px 0; color: #856404;">Due Date: ${formattedDate}</p>
    </div>

    <p>Please ensure payment is made before the due date to avoid late fees and maintain your enrollment in good standing.</p>

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
