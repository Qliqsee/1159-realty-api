import { emailLayout, createParagraph } from './email-layout.template';

export const kycApprovedTemplate = (
  clientName: string,
  feedback?: string,
): string => {
  const content = `
    ${createParagraph('Congratulations! Your KYC verification has been approved.')}

    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 600;">Status: Verified</p>
    </div>

    ${feedback ? `
    <div style="background-color: #f8f9fa; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #404040;">Feedback from our team:</p>
      <p style="margin: 0; font-size: 15px; color: #555;">${feedback}</p>
    </div>
    ` : ''}

    ${createParagraph('You now have full access to all features on 1159 Realty, including:')}

    <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 16px; color: #404040; line-height: 26px;">
      <li>View property maps and plots</li>
      <li>Apply for partnership</li>
      <li>Access all property features</li>
    </ul>

    ${createParagraph('Thank you for completing your verification!')}
  `;

  return emailLayout({
    title: 'KYC Verification Approved',
    preview: 'Your KYC verification has been approved',
    firstName: clientName,
    content,
  });
};
