import { emailLayout, createParagraph } from './email-layout.template';

export const kycRejectedTemplate = (
  clientName: string,
  reason: string,
  feedback?: string,
): string => {
  const content = `
    ${createParagraph('Thank you for submitting your KYC verification. Unfortunately, we were unable to approve your submission at this time.')}

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; color: #721c24; font-size: 16px;"><strong>Status:</strong> Rejected</p>
      <p style="margin: 0; color: #721c24; font-size: 16px;"><strong>Reason:</strong> ${reason}</p>
    </div>

    ${feedback ? `
    <div style="background-color: #f8f9fa; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #404040;">Additional feedback:</p>
      <p style="margin: 0; font-size: 15px; color: #555;">${feedback}</p>
    </div>
    ` : ''}

    ${createParagraph('What you need to do:', true)}

    <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 16px; color: #404040; line-height: 26px;">
      <li>Review the reason for rejection above</li>
      <li>Update your KYC information accordingly</li>
      <li>Resubmit your KYC for review</li>
    </ul>

    ${createParagraph('If you have any questions or need assistance, please contact our support team.')}
  `;

  return emailLayout({
    title: 'KYC Verification Requires Attention',
    preview: 'Your KYC submission requires updates',
    firstName: clientName,
    content,
  });
};
