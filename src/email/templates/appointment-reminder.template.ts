import { emailLayout, createParagraph } from './email-layout.template';

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

  const content = `
    ${createParagraph('This is a friendly reminder about your upcoming property viewing appointment scheduled for tomorrow.')}

    <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 12px; color: #0c5460; font-size: 16px; font-weight: 600;">Appointment Details:</p>
      <p style="margin: 0 0 6px; color: #0c5460; font-size: 15px;"><strong>Property:</strong> ${propertyName}</p>
      <p style="margin: 0 0 6px; color: #0c5460; font-size: 15px;"><strong>Date:</strong> ${formattedDate}</p>
      <p style="margin: 0 0 6px; color: #0c5460; font-size: 15px;"><strong>Time:</strong> ${formattedTime}</p>
      <p style="margin: 0; color: #0c5460; font-size: 15px;"><strong>Location:</strong> ${location}</p>
    </div>

    ${message ? `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; color: #856404; font-size: 15px; font-weight: 600;">Important Information:</p>
      <p style="margin: 0; color: #856404; font-size: 15px;">${message}</p>
    </div>
    ` : ''}

    ${createParagraph('Please arrive on time for your scheduled viewing. If you need to cancel or reschedule, please do so through your account dashboard.')}
    ${createParagraph('We look forward to seeing you!')}
  `;

  return emailLayout({
    title: 'Appointment Reminder',
    preview: `Reminder for your ${propertyName} viewing appointment`,
    firstName: recipientName,
    content,
  });
};
