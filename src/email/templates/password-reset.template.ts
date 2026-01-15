import { emailLayout, createButton, createParagraph, createHighlightBox } from './email-layout.template';

export const passwordResetTemplate = (resetLink: string, userName?: string): string => {
  const content = `
    ${createParagraph('We received a request to reset your password for your 1159 Realty account. Click the button below to reset it:')}

    ${createButton(resetLink, 'Reset Password')}

    ${createParagraph('Or copy and paste this link into your browser:')}
    ${createHighlightBox(`<p style="margin: 0; font-size: 14px; color: #404040; word-break: break-all;">${resetLink}</p>`)}

    ${createParagraph('This link will expire in 1 hour.', true)}
    ${createParagraph('If you didn\'t request a password reset, please ignore this email or contact support if you have concerns.')}
  `;

  return emailLayout({
    title: 'Password Reset Request',
    preview: 'Reset your password for your 1159 Realty account',
    firstName: userName,
    content,
  });
};
