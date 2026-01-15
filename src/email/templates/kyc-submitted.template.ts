import { emailLayout, createParagraph, createHighlightBox } from './email-layout.template';

export const kycSubmittedTemplate = (
  clientName: string,
  clientEmail: string,
  kycId: string,
): string => {
  const content = `
    ${createParagraph('A client has submitted their KYC for review:')}

    ${createHighlightBox(`
      <p style="margin: 0 0 8px; font-size: 15px; color: #404040;"><strong>Client Name:</strong> ${clientName}</p>
      <p style="margin: 0 0 8px; font-size: 15px; color: #404040;"><strong>Client Email:</strong> ${clientEmail}</p>
      <p style="margin: 0; font-size: 15px; color: #404040;"><strong>KYC ID:</strong> ${kycId}</p>
    `)}

    ${createParagraph('Please log in to the admin portal to review and approve or reject this KYC submission.')}
  `;

  return emailLayout({
    title: 'New KYC Submission',
    preview: `KYC submission from ${clientName}`,
    content,
  });
};
