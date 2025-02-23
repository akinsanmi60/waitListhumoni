import { MailService } from '@sendgrid/mail';

const mailService = new MailService();

interface WaitlistEmailData {
  name: string;
  position: number;
  total: number;
  referralCode: string;
}

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

// Export these types before initializing the functions
type WaitlistEmailFunction = (to: string, data: WaitlistEmailData) => Promise<boolean>;
type ContactEmailFunction = (data: ContactEmailData) => Promise<boolean>;

// Initialize dummy email functions with correct types
const dummyWaitlistEmail: WaitlistEmailFunction = async () => {
  console.warn('Email service disabled: missing valid SENDGRID_API_KEY');
  return false;
};

const dummyContactEmail: ContactEmailFunction = async () => {
  console.warn('Email service disabled: missing valid SENDGRID_API_KEY');
  return false;
};

// Export functions with correct types
export let sendWaitlistWelcomeEmail: WaitlistEmailFunction = dummyWaitlistEmail;
export let sendContactEmail: ContactEmailFunction = dummyContactEmail;

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY?.startsWith('SG.')) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);

  sendWaitlistWelcomeEmail = async (
    to: string,
    data: WaitlistEmailData
  ): Promise<boolean> => {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://www.joinhumoni.com/assets/svg/logo.svg" alt="Humoni" style="width: 120px; margin-bottom: 24px;" />

        <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Welcome to Humoni, ${data.name}! 🎉</h1>

        <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
          Thank you for joining our waitlist! We're excited to have you as part of our growing community of migrants working towards a more accessible future.
        </p>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 12px;">Your Waitlist Position</h2>
          <p style="color: #666; margin-bottom: 8px;">You are currently <strong>#${data.position}</strong> out of ${data.total} people</p>
          <p style="color: #666; margin-bottom: 8px;">Your referral code: <strong>${data.referralCode}</strong></p>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="color: #333; font-size: 18px; margin-bottom: 12px;">Want to Move Up?</h2>
          <p style="color: #666; line-height: 1.6;">
            Share your referral code with friends! Each person who joins using your code will move you up 5 positions in the waitlist.
          </p>
        </div>

        <div style="color: #888; font-size: 14px;">
          <p>Best regards,<br>The Humoni Team</p>
        </div>
      </div>
    `;

    try {
      await mailService.send({
        to,
        from: {
          email: 'welcome@joinhumoni.com',
          name: 'Humoni Team'
        },
        subject: 'Welcome to Humoni! 🎉',
        html,
        text: `Welcome to Humoni, ${data.name}! Thank you for joining our waitlist. You are currently #${data.position} out of ${data.total} people. Your referral code is ${data.referralCode}. Share it with friends to move up the waitlist!`,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  };

  sendContactEmail = async (data: ContactEmailData): Promise<boolean> => {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${data.message}
        </div>
      </div>
    `;

    try {
      await mailService.send({
        to: 'support@joinhumoni.com',
        from: {
          email: 'notifications@joinhumoni.com',
          name: 'Humoni Contact Form'
        },
        subject: `New Contact Form Message from ${data.name}`,
        html,
        text: `New message from ${data.name} (${data.email}):\n\n${data.message}`,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  };
}