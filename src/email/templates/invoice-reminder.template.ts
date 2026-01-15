import { emailLayout, createParagraph } from './email-layout.template';

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

  const content = `
    ${createParagraph(`This is a friendly reminder that your payment for <strong>${propertyName}</strong> is due in <strong>${daysUntilDue} day(s)</strong>.`)}

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px; color: #856404; font-size: 16px; font-weight: 600;">Payment Details:</p>
      <p style="margin: 0 0 6px; color: #856404; font-size: 15px;">Installment #${installmentNumber}</p>
      <p style="margin: 0 0 6px; color: #856404; font-size: 15px;">Amount: ${formattedAmount}</p>
      <p style="margin: 0; color: #856404; font-size: 15px;">Due Date: ${formattedDate}</p>
    </div>

    ${createParagraph('Please ensure payment is made before the due date to avoid late fees and maintain your enrollment in good standing.')}
    ${createParagraph('If you have any questions or need assistance, please contact our support team.')}
  `;

  return emailLayout({
    title: 'Payment Reminder',
    preview: `Payment reminder for ${propertyName}`,
    firstName: recipientName,
    content,
  });
};
