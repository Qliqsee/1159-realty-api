import { emailLayout, createParagraph, createButton } from './email-layout.template';

export const welcomeTemplate = (userName: string, userType: 'client' | 'admin'): string => {
  const isClient = userType === 'client';
  const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  const content = `
    ${createParagraph('Welcome to 1159 Realty! Your email has been successfully verified and your account is now active.')}

    ${isClient ? `
      ${createParagraph('To get started and unlock all features, please complete your profile setup:', true)}

      <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; color: #404040; line-height: 26px;">
        <li><strong>Complete KYC Verification</strong> - Submit your identification documents to verify your account</li>
        <li><strong>Explore Properties</strong> - Browse our available properties and find your perfect investment</li>
        <li><strong>Set Up Payments</strong> - Configure your payment preferences for seamless transactions</li>
      </ul>

      <div style="background-color: #f8f9fa; border-left: 4px solid #0066cc; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 15px; color: #404040;">
          <strong>Important:</strong> You'll need to complete KYC verification to access property maps, apply for partnerships, and use all platform features.
        </p>
      </div>

      ${createButton(`${dashboardUrl}/kyc`, 'Complete Your Profile')}
    ` : `
      ${createParagraph('As an agent, you now have access to the admin dashboard where you can:', true)}

      <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; color: #404040; line-height: 26px;">
        <li>Manage client accounts and KYC submissions</li>
        <li>Track property enrollments and payments</li>
        <li>Generate reports and analytics</li>
        <li>Communicate with clients</li>
      </ul>

      ${createButton(`${dashboardUrl}/admin`, 'Go to Dashboard')}
    `}

    ${createParagraph('If you have any questions or need assistance, our support team is here to help.')}
  `;

  return emailLayout({
    title: 'Welcome to 1159 Realty!',
    preview: 'Your account is verified - complete your profile to get started',
    firstName: userName,
    content,
  });
};
