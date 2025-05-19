import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string,
  appUrl: string
): Promise<boolean> {
  const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5; margin-bottom: 20px;">Micro8gents Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>Thanks,<br>The Micro8gents Team</p>
    </div>
  `;

  const textContent = `
    Micro8gents Password Reset
    
    Hello,
    
    We received a request to reset your password. Please visit the following link to set a new password:
    
    ${resetUrl}
    
    If you didn't request this password reset, you can safely ignore this email.
    
    This link will expire in 1 hour for security reasons.
    
    Thanks,
    The Micro8gents Team
  `;

  return sendEmail({
    to: email,
    from: 'support@micro8gents.com', // Update with your verified sender
    subject: 'Reset Your Micro8gents Password',
    html: htmlContent,
    text: textContent,
  });
}