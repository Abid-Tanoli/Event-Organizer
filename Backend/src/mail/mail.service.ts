import nodemailer from "nodemailer";
import { mailConfig } from "../config/mail";

// Create reusable transporter
const transporter = nodemailer.createTransport(mailConfig);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Event Booking Platform" <${process.env.MAIL_FROM || "noreply@eventbooking.com"}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendBookingConfirmation = async (
  email: string,
  bookingData: {
    name: string;
    bookingReference: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    tickets: Array<{ type: string; quantity: number; price: number }>;
    totalAmount: number;
  }
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-ref { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .booking-ref h2 { margin: 0; color: #667eea; font-size: 28px; }
        .event-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .ticket-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${bookingData.name},</p>
          <p>Thank you for booking with us! Your tickets have been confirmed.</p>
          
          <div class="booking-ref">
            <p style="margin: 0; color: #666;">Booking Reference</p>
            <h2>${bookingData.bookingReference}</h2>
          </div>

          <div class="event-details">
            <h3 style="color: #667eea; margin-top: 0;">📅 Event Details</h3>
            <p><strong>Event:</strong> ${bookingData.eventTitle}</p>
            <p><strong>Date:</strong> ${bookingData.eventDate}</p>
            <p><strong>Time:</strong> ${bookingData.eventTime}</p>
            <p><strong>Venue:</strong> ${bookingData.venue}</p>
          </div>

          <div class="event-details">
            <h3 style="color: #667eea; margin-top: 0;">🎫 Your Tickets</h3>
            ${bookingData.tickets
              .map(
                (ticket) => `
              <div class="ticket-item">
                <span>${ticket.type} x ${ticket.quantity}</span>
                <span>$${(ticket.price * ticket.quantity).toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
            <div class="total">
              <div style="display: flex; justify-content: space-between;">
                <span>Total Amount:</span>
                <span>$${bookingData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <center>
            <a href="#" class="button">View Ticket</a>
          </center>

          <p style="margin-top: 30px;">Please keep this booking reference safe. You'll need it for check-in at the event.</p>
          
          <p>If you have any questions, feel free to contact us.</p>
          
          <p>See you at the event! 🎊</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${bookingData.eventTitle}`,
    html,
  });
};

export const sendEventApprovalNotification = async (
  email: string,
  organizerName: string,
  eventTitle: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) => {
  const isApproved = status === "approved";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isApproved ? "#10b981" : "#ef4444"}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${isApproved ? "#10b981" : "#ef4444"}; color: white; border-radius: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isApproved ? "✅ Event Approved!" : "❌ Event Needs Revision"}</h1>
        </div>
        <div class="content">
          <p>Dear ${organizerName},</p>
          
          <p>Your event "<strong>${eventTitle}</strong>" has been reviewed.</p>
          
          <center>
            <span class="status-badge">${status.toUpperCase()}</span>
          </center>

          ${
            isApproved
              ? `
            <p>Congratulations! Your event has been approved and is now live on our platform.</p>
            <p>You can start accepting bookings right away.</p>
            <center>
              <a href="#" class="button">View Event Dashboard</a>
            </center>
          `
              : `
            <p>Unfortunately, your event needs some revisions before it can go live.</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; border-radius: 4px;">
              <p><strong>Reason:</strong></p>
              <p>${rejectionReason || "Please contact support for details."}</p>
            </div>
            <p>Please make the necessary changes and resubmit your event for review.</p>
            <center>
              <a href="#" class="button">Edit Event</a>
            </center>
          `
          }

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Event ${status === "approved" ? "Approved" : "Needs Revision"} - ${eventTitle}`,
    html,
  });
};

export const sendOrganizerApprovalNotification = async (
  email: string,
  organizationName: string,
  status: "approved" | "rejected",
  rejectionReason?: string
) => {
  const isApproved = status === "approved";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isApproved ? "#10b981" : "#ef4444"}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isApproved ? "🎉 Welcome to Our Platform!" : "⚠️ Application Status"}</h1>
        </div>
        <div class="content">
          <p>Dear ${organizationName},</p>
          
          ${
            isApproved
              ? `
            <p>Great news! Your organizer account has been approved.</p>
            <p>You can now start creating and managing events on our platform.</p>
            <center>
              <a href="#" class="button">Start Creating Events</a>
            </center>
            <p>We're excited to have you onboard and look forward to seeing your amazing events!</p>
          `
              : `
            <p>Thank you for your interest in becoming an organizer on our platform.</p>
            <p>After careful review, we need more information before approving your account.</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; border-radius: 4px;">
              <p><strong>Reason:</strong></p>
              <p>${rejectionReason || "Please contact support for more details."}</p>
            </div>
            <center>
              <a href="#" class="button">Update Application</a>
            </center>
          `
          }
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Organizer Account ${status === "approved" ? "Approved" : "Update Required"}`,
    html,
  });
};

export const sendEventReminder = async (
  email: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  bookingReference: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Event Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          
          <p>This is a friendly reminder about your upcoming event!</p>
          
          <div class="reminder-box">
            <h2 style="margin: 0; color: #856404;">${eventTitle}</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <strong>${eventDate} at ${eventTime}</strong>
            </p>
          </div>

          <p><strong>Your Booking Reference:</strong> ${bookingReference}</p>
          
          <p>Don't forget to bring your booking reference or QR code for check-in.</p>
          
          <center>
            <a href="#" class="button">View Ticket</a>
          </center>
          
          <p>We look forward to seeing you there! 🎉</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; 2026 Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Reminder: ${eventTitle} - Tomorrow!`,
    html,
  });
};