import { BusinessInvitationEmailParams, EmailTemplate, ProblemCategory } from '../types/index';

/**
 * Helper function to format problem category for display
 */
const formatCategory = (category: ProblemCategory): string => {
  const categoryMap: Record<ProblemCategory, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    hvac: 'HVAC',
    carpentry: 'Carpentry',
    painting: 'Painting',
    landscaping: 'Landscaping',
    appliance_repair: 'Appliance Repair',
    general_handyman: 'General Handyman',
    other: 'General Service',
  };
  return categoryMap[category];
};

/**
 * Helper function to format urgency for display
 */
const formatUrgency = (urgency: 'low' | 'medium' | 'high'): { text: string; emoji: string } => {
  const urgencyMap = {
    low: { text: 'Standard', emoji: '📅' },
    medium: { text: 'Priority', emoji: '⚡' },
    high: { text: 'Urgent', emoji: '🚨' },
  };
  return urgencyMap[urgency];
};

/**
 * Generate a business invitation email template
 *
 * This template is sent to local businesses when a customer request matches
 * their service area, but they are not yet registered on the platform.
 *
 * @param params - Email template parameters
 * @returns Email template with subject, HTML body, and text body
 *
 * @example
 * ```typescript
 * const email = generateBusinessInvitationEmail({
 *   businessName: 'ABC Plumbing',
 *   businessEmail: 'contact@abcplumbing.com',
 *   problemCategory: 'plumbing',
 *   urgency: 'high',
 *   locationCity: 'London',
 *   locationArea: 'Shoreditch',
 *   aiSummary: 'Leaking pipe under kitchen sink',
 *   platformSignupUrl: 'https://serviceconnect.app/business/signup?ref=abc123',
 * });
 *
 * // Use with ACI.dev email MCP tool
 * await acidev.email.send({
 *   to: email.businessEmail,
 *   subject: email.subject,
 *   html: email.htmlBody,
 *   text: email.textBody,
 * });
 * ```
 */
export function generateBusinessInvitationEmail(
  params: BusinessInvitationEmailParams
): EmailTemplate {
  const {
    businessName,
    problemCategory,
    urgency,
    locationCity,
    locationArea,
    aiSummary,
    platformSignupUrl,
  } = params;

  const categoryDisplay = formatCategory(problemCategory);
  const urgencyInfo = formatUrgency(urgency);

  // Subject line
  const subject = `New ${categoryDisplay} customer in ${locationCity} needs your help`;

  // HTML email body
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Connect - Customer Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Service Connect
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">
                Connecting local businesses with customers
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                Hi <strong>${businessName}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                A customer in your area just requested <strong>${categoryDisplay}</strong> services, and we thought you'd be a great fit!
              </p>

              <!-- Request Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                      Request Details
                    </h2>

                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; width: 100px;">
                          <strong>Service:</strong>
                        </td>
                        <td style="color: #1f2937; font-size: 14px;">
                          ${categoryDisplay}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">
                          <strong>Urgency:</strong>
                        </td>
                        <td style="color: #1f2937; font-size: 14px;">
                          ${urgencyInfo.emoji} <strong>${urgencyInfo.text}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">
                          <strong>Location:</strong>
                        </td>
                        <td style="color: #1f2937; font-size: 14px;">
                          ${locationArea}, ${locationCity}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; vertical-align: top; padding-top: 8px;">
                          <strong>Problem:</strong>
                        </td>
                        <td style="color: #1f2937; font-size: 14px; padding-top: 8px;">
                          ${aiSummary}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Why Join Section -->
              <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                Why join Service Connect?
              </h3>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                <li><strong>Pre-qualified leads:</strong> Customers send photos – AI tells you exactly what's needed</li>
                <li><strong>Local matching:</strong> Only get requests in your service area</li>
                <li><strong>Simple workflow:</strong> Accept or decline with one tap, no complicated forms</li>
                <li><strong>Real-time updates:</strong> Get notified the moment customers need your services</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${platformSignupUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      Join Service Connect & View Request
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                <em>Sign up takes less than 2 minutes. Once registered, you'll see the full customer details and can accept this request immediately.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                Service Connect helps local businesses grow by connecting you with customers who need your services.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is a one-time invitation because we found a customer match in your area.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text email body (for email clients that don't support HTML)
  const textBody = `
Hi ${businessName},

A customer in your area just requested ${categoryDisplay} services, and we thought you'd be a great fit!

REQUEST DETAILS
---------------
Service: ${categoryDisplay}
Urgency: ${urgencyInfo.text}
Location: ${locationArea}, ${locationCity}
Problem: ${aiSummary}

WHY JOIN SquareDeal?

• Pre-qualified leads: Customers send photos – AI tells you exactly what's needed
• Local matching: Only get requests in your service area
• Simple workflow: Accept or decline with one tap, no complicated forms
• Real-time updates: Get notified the moment customers need your services

JOIN SERVICE CONNECT & VIEW REQUEST
${platformSignupUrl}

Sign up takes less than 2 minutes. Once registered, you'll see the full customer details and can accept this request immediately.

---
Service Connect helps local businesses grow by connecting you with customers who need your services.
This is a one-time invitation because we found a customer match in your area.
  `.trim();

  return {
    subject,
    htmlBody,
    textBody,
  };
}
