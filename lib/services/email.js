/**
 * ============================================
 * EMAIL SERVICE
 * ============================================
 * Handles email sending via Gmail SMTP or other providers
 * 
 * HOW TO SETUP GMAIL:
 * 1. Enable 2-Step Verification on your Google Account
 * 2. Go to https://myaccount.google.com/apppasswords
 * 3. Select 'Mail' and 'Other (Custom name)'
 * 4. Generate 16-character app password
 * 5. Add to .env:
 *    - SMTP_USER=your-email@gmail.com
 *    - SMTP_PASSWORD=your-16-char-password
 */

import nodemailer from 'nodemailer';
import { EmailLogModel } from '../models';

/**
 * Create email transporter
 */
function createTransporter() {
  // Check if email is configured
  const isConfigured = 
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    !process.env.SMTP_USER.includes('your-email');

  if (!isConfigured) {
    console.warn('⚠️  Email not configured. Emails will be logged but not sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send email
 * @param {object} options - Email options
 * @returns {Promise<object>} Send result
 */
export async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'The Servants'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    // If not configured, just log
    if (!transporter) {
      console.log('📧 Email (NOT SENT - Configure SMTP):', { to, subject });
      
      await EmailLogModel.create({
        type: 'custom',
        to,
        subject,
        status: 'failed',
        error: 'SMTP not configured',
      });

      return { success: false, message: 'Email service not configured', isMocked: true };
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log success
    await EmailLogModel.create({
      type: 'custom',
      to,
      subject,
      status: 'sent',
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);

    // Log failure
    await EmailLogModel.create({
      type: 'custom',
      to,
      subject,
      status: 'failed',
      error: error.message,
    });

    throw error;
  }
}

/**
 * Send newsletter to all members
 * @param {string} subject - Email subject
 * @param {string} content - Email content (HTML)
 * @returns {Promise<object>} Send result
 */
export async function sendNewsletter(subject, content) {
  const { MemberModel } = await import('../models');
  const members = await MemberModel.findAll();
  
  const approvedMembers = members.filter(m => m.status === 'approved');
  const emails = approvedMembers.map(m => m.email);

  if (emails.length === 0) {
    return { success: false, message: 'No approved members found' };
  }

  try {
    await sendEmail({
      to: emails.join(','),
      subject,
      html: content,
    });

    return { success: true, sent: emails.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send donation receipt
 * @param {string} email - Recipient email
 * @param {object} donation - Donation details
 * @returns {Promise<object>} Send result
 */
export async function sendDonationReceipt(email, donation) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #001F3F; color: #D4AF37; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; font-weight: bold; color: #D4AF37; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The Servants</h1>
          <p>Thank You for Your Donation</p>
        </div>
        <div class="content">
          <p>Dear Supporter,</p>
          <p>Thank you for your generous donation of <span class="amount">₹${donation.amount}</span></p>
          <p>Your support helps us continue our mission to serve the community.</p>
          <p><strong>Transaction ID:</strong> ${donation.id}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>May Allah bless you for your generosity.</p>
        </div>
        <div class="footer">
          <p>The Servants - Community NGO</p>
          <p>This is an automatically generated receipt.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Thank You for Your Donation - The Servants',
    html,
  });
}

/**
 * Send welcome email to new member
 * @param {object} member - Member details
 * @returns {Promise<object>} Send result
 */
export async function sendWelcomeEmail(member) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #001F3F; color: #D4AF37; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to The Servants</h1>
        </div>
        <div class="content">
          <p>Dear ${member.name},</p>
          <p>Welcome to The Servants family! Your membership application has been received.</p>
          <p><strong>Membership Tier:</strong> ${member.membershipTier}</p>
          <p>We will review your application and get back to you soon.</p>
          <p>Thank you for choosing to support our cause.</p>
        </div>
        <div class="footer">
          <p>The Servants - Community NGO</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: member.email,
    subject: 'Welcome to The Servants',
    html,
  });
}
