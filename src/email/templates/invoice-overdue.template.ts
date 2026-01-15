import { emailLayout, createParagraph } from './email-layout.template';

export const invoiceOverdueTemplate = (
  recipientName: string,
  propertyName: string,
  installmentNumber: number,
  amount: number,
  dueDate: Date,
  daysOverdue: number,
  gracePeriodRemaining: number,
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
    ${createParagraph(`Your payment for <strong>${propertyName}</strong> is now <strong>${daysOverdue} day(s) overdue</strong>.`)}

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px; color: #721c24; font-size: 16px; font-weight: 600;">Overdue Payment Details:</p>
      <p style="margin: 0 0 6px; color: #721c24; font-size: 15px;">Installment #${installmentNumber}</p>
      <p style="margin: 0 0 6px; color: #721c24; font-size: 15px;">Amount: ${formattedAmount}</p>
      <p style="margin: 0 0 6px; color: #721c24; font-size: 15px;">Original Due Date: ${formattedDate}</p>
      <p style="margin: 0; color: #721c24; font-size: 15px;">Days Overdue: ${daysOverdue}</p>
    </div>

    ${gracePeriodRemaining > 0 ? `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 15px;"><strong>Grace Period:</strong> ${gracePeriodRemaining} day(s) remaining before suspension</p>
    </div>
    ` : `
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #721c24; font-size: 15px;"><strong>Warning:</strong> Your grace period has expired. Your enrollment may be suspended.</p>
    </div>
    `}

    ${createParagraph('<strong>Action Required:</strong> Please make payment immediately to avoid suspension of your enrollment and additional penalties.')}
    ${createParagraph('If you\'re experiencing difficulties making payment, please contact us to discuss payment arrangements.')}
  `;

  return emailLayout({
    title: 'Payment Overdue',
    preview: `Overdue payment notice for ${propertyName}`,
    firstName: recipientName,
    content,
  });
};
