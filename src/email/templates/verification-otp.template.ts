import { emailLayout, createOtpDisplay, createParagraph } from './email-layout.template';

export const verificationOtpTemplate = (otp: string, userName?: string): string => {
  const content = `
    ${createParagraph('Thank you for signing up with 1159 Realty! To complete your registration, please use the following One-Time Password (OTP):')}

    ${createOtpDisplay(otp)}

    ${createParagraph('This OTP will expire in 10 minutes.', true)}
    ${createParagraph('If you didn\'t request this verification, please ignore this email.')}
  `;

  return emailLayout({
    title: 'Email Verification',
    preview: 'Verify your email address to complete registration',
    firstName: userName,
    content,
  });
};
