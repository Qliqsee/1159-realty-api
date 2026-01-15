interface EmailLayoutProps {
  title: string;
  preview: string;
  firstName?: string;
  content: string;
}

export const emailLayout = ({ title, preview, firstName, content }: EmailLayoutProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preview}</div>

  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Email Content Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 32px 40px 20px; text-align: center; background-color: #ffffff;">
              <img src="https://www.1159realty.com/black-logo.jpeg" alt="1159 Realty Logo" width="64" height="64" style="display: block; margin: 0 auto; border-radius: 8px;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 0 40px 10px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a; text-align: left;">${title}</h1>
            </td>
          </tr>

          <!-- Greeting -->
          ${firstName ? `
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="margin: 0; font-size: 16px; color: #404040; line-height: 24px;">Hello ${firstName},</p>
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer Contact Info -->
          <tr>
            <td style="padding: 30px 40px 20px; background-color: #f8f8f8; border-top: 1px solid #e8e8e8;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; font-size: 14px; color: #666666; line-height: 22px;">
                    <p style="margin: 0 0 8px;">23 Offa Road Opposite Kwara state registry, Ilorin.</p>
                    <p style="margin: 0 0 8px;">1st floor, Gods Heritage building, Adekunle Fajuyi Rd, mokola, Ibadan.</p>
                    <p style="margin: 0 0 8px;">
                      <a href="mailto:admin@1159realty.com" style="color: #0066cc; text-decoration: none;">admin@1159realty.com</a> •
                      <a href="tel:+2348061747003" style="color: #0066cc; text-decoration: none;">+234 806 174 7003</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Links -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f8f8; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 200px; margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://www.instagram.com/1159_realty/?hl=en" style="display: inline-block;">
                      <img src="https://1159-storage.lon1.cdn.digitaloceanspaces.com/socials/instagram-logo.png" alt="Instagram 1" width="28" height="28" style="display: block; border: none;">
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.instagram.com/1159realty_gold/?hl=en" style="display: inline-block;">
                      <img src="https://1159-storage.lon1.cdn.digitaloceanspaces.com/socials/instagram-logo.png" alt="Instagram 2" width="28" height="28" style="display: block; border: none;">
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/company/1159realty/" style="display: inline-block;">
                      <img src="https://1159-storage.lon1.cdn.digitaloceanspaces.com/socials/linkedin-logo.png" alt="LinkedIn" width="28" height="28" style="display: block; border: none;">
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://wa.me/2348061747003" style="display: inline-block;">
                      <img src="https://1159-storage.lon1.cdn.digitaloceanspaces.com/socials/whatsapp-logo.png" alt="WhatsApp" width="28" height="28" style="display: block; border: none;">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td style="padding: 15px 40px 30px; background-color: #f8f8f8; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #404040;">© ${new Date().getFullYear()} 1159 Realty. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// Helper function to create button
export const createButton = (url: string, text: string): string => {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="text-align: center; padding: 20px 0;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #0066cc; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
};

// Helper function to create highlighted box
export const createHighlightBox = (content: string): string => {
  return `
    <div style="background-color: #f8f9fa; border-left: 4px solid #0066cc; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
      ${content}
    </div>
  `;
};

// Helper function to create OTP code display
export const createOtpDisplay = (otp: string): string => {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="text-align: center; padding: 30px 0;">
          <div style="display: inline-block; background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px 40px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0066cc; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
        </td>
      </tr>
    </table>
  `;
};

// Standard text paragraph
export const createParagraph = (text: string, bold: boolean = false): string => {
  return `<p style="margin: 0 0 16px; font-size: 16px; color: #404040; line-height: 26px; ${bold ? 'font-weight: 600;' : ''}">${text}</p>`;
};
