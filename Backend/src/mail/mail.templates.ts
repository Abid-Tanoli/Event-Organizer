// Additional email templates for various use cases

export const getWelcomeEmailTemplate = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .features { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .feature-item { padding: 15px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Event Booking Platform!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Welcome aboard! We're thrilled to have you join our community.</p>
          
          <div class="features">
            <h3 style="color: #667eea; margin-top: 0;">What You Can Do:</h3>
            <div class="feature-item">
              <strong>🎫 Discover Events</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Browse thousands of events across music, tech, sports, and more.</p>
            </div>
            <div class="feature-item">
              <strong>📱 Easy Booking</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Book tickets in seconds with our streamlined checkout process.</p>
            </div>
            <div class="feature-item">
              <strong>🎯 Personalized Recommendations</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Get event suggestions tailored to your interests.</p>
            </div>
            <div class="feature-item" style="border-bottom: none;">
              <strong>📧 Stay Updated</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Receive notifications about upcoming events and exclusive offers.</p>
            </div>
          </div>

          <center>
            <a href="#" class="button">Explore Events</a>
          </center>

          <p>If you have any questions, our support team is always here to help.</p>
          
          <p>Happy event hunting! 🎊</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetTemplate = (userName: string, resetLink: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>

          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: white; padding: 15px; word-break: break-all; border-radius: 4px; font-size: 12px;">${resetLink}</p>

          <div class="warning">
            <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
            <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>

          <p>If you're having trouble, contact our support team for assistance.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getCancellationConfirmationTemplate = (
  userName: string,
  eventTitle: string,
  bookingReference: string,
  refundAmount: number
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .refund-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>Your booking has been successfully cancelled.</p>
          
          <div class="refund-box">
            <h3 style="color: #667eea; margin-top: 0;">Cancellation Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Booking Reference:</strong> ${bookingReference}</p>
            <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
          </div>

          <p>Your refund will be processed within 5-7 business days and credited back to your original payment method.</p>
          
          <p>We're sorry to see you go, but we hope to see you at another event soon!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getNewsletterTemplate = (
  featuredEvents: Array<{
    title: string;
    date: string;
    image: string;
    link: string;
  }>
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-card { background: white; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .event-image { width: 100%; height: 200px; object-fit: cover; }
        .event-content { padding: 20px; }
        .event-button { display: inline-block; padding: 10px 25px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 This Week's Featured Events</h1>
        </div>
        <div class="content">
          <p>Check out these amazing events happening near you!</p>
          
          ${featuredEvents
            .map(
              (event) => `
            <div class="event-card">
              <img src="${event.image}" alt="${event.title}" class="event-image">
              <div class="event-content">
                <h3 style="margin: 0 0 10px 0; color: #667eea;">${event.title}</h3>
                <p style="margin: 0; color: #666;">📅 ${event.date}</p>
                <a href="${event.link}" class="event-button">View Details</a>
              </div>
            </div>
          `
            )
            .join("")}

          <p style="margin-top: 30px;">Don't miss out on these incredible experiences!</p>
        </div>
        <div class="footer">
          <p>You're receiving this because you subscribed to our newsletter.</p>
          <p><a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Update Preferences</a></p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};