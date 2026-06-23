import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`\n📧 [EmailService] Initializing real SMTP transporter for host ${host}...`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    console.log('\n📧 [EmailService] SMTP credentials missing in .env. Creating Ethereal Test Account (free testing SMTP)...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`📧 [EmailService] Ethereal account created. User: ${testAccount.user}`);
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('❌ [EmailService] Failed to create Ethereal account. Falling back to dummy transporter.', err);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
};

export const sendPasswordResetEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const mailTransporter = await getTransporter();
    const fromName = process.env.SMTP_FROM_NAME || 'Fetch Me Up Support';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'support@fetchmeup.com';

    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: '🔑 Fetch Me Up - Password Reset Verification Code',
      text: `Hello,\n\nYou requested to reset your password. Use the following 6-digit verification code to complete the process:\n\n👉 ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nFetch Me Up Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0047AB; text-align: center; margin: 0;">Fetch Me Up</h2>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p>Hello,</p>
          <p>You requested to reset your password. Use the following 6-digit verification code to complete the process:</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #050A18;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code is valid for <strong>15 minutes</strong>.</p>
          <p style="margin-top: 30px;">If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message, please do not reply directly to this email.</p>
        </div>
      `,
    });

    console.log(`✉️ [EmailService] Password reset email sent to ${email}. MessageId: ${info.messageId}`);
    
    // Log preview link if Ethereal is used
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [EmailService] Ethereal Preview URL: ${previewUrl}`);
    }

    return true;
  } catch (err) {
    console.error('❌ [EmailService] Failed to send password reset email:', err);
    return false;
  }
};

export const sendOrderReceiptEmail = async (email: string, order: any): Promise<boolean> => {
  try {
    const mailTransporter = await getTransporter();
    const fromName = process.env.SMTP_FROM_NAME || 'Fetch Me Up Support';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'support@fetchmeup.com';

    const orderIdShort = order.id.slice(0, 8).toUpperCase();
    const orderTypeLabel = order.type.toUpperCase();
    const paymentMethod = order.details?.paymentMethod || 'WALLET';
    const itemsCost = parseFloat(order.price || '0');
    const deliveryFee = parseFloat(order.deliveryFee || '0');
    const totalCost = itemsCost + deliveryFee;
    const itemsList = order.details?.items || [];

    let itemsTableHtml = '';
    if (Array.isArray(itemsList) && itemsList.length > 0) {
      itemsTableHtml = `
        <h4 style="color: #050A18; margin-top: 20px; margin-bottom: 8px;">Order Details</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
              <th style="padding: 8px 0; font-size: 13px; color: #4B5563;">Item Description</th>
              <th style="padding: 8px 0; font-size: 13px; color: #4B5563; text-align: right; width: 60px;">Qty</th>
            </tr>
          </thead>
          <tbody>
      `;
      itemsList.forEach((item: any) => {
        const name = item.item || item.name || 'Custom Errand Item';
        const qty = item.qty || item.quantity || 1;
        itemsTableHtml += `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 0; font-size: 14px; color: #1F2937;">${name}</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1F2937; text-align: right;">${qty}</td>
          </tr>
        `;
      });
      itemsTableHtml += `
          </tbody>
        </table>
      `;
    }

    const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `🧾 Fetch Me Up - Order Confirmation #${orderIdShort}`,
      text: `Hello,\n\nThank you for placing your order with Fetch Me Up. Here is your receipt:\n\nOrder ID: #${orderIdShort}\nService: ${orderTypeLabel}\nPickup: ${order.pickupAddress}\nDrop-off: ${order.dropoffAddress}\nDistance: ${order.estimatedDistance} km\nPayment Method: ${paymentMethod}\nDelivery Fee: ₱${deliveryFee.toFixed(2)}\nItems Cost: ₱${itemsCost.toFixed(2)}\nTotal Charge: ₱${totalCost.toFixed(2)}\n\nWe are matching you with a pilot now!\n\nBest regards,\nFetch Me Up Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0047AB; margin: 0;">Fetch Me Up</h2>
            <p style="color: #6B7280; font-size: 12px; margin-top: 4px; letter-spacing: 2px;">BUTUAN CITY</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #f3f4f6;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-size: 13px; color: #6B7280; padding-bottom: 4px;">Order Number</td>
                <td style="font-size: 13px; color: #1F2937; text-align: right; font-weight: bold; padding-bottom: 4px;">#${orderIdShort}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #6B7280; padding-bottom: 4px;">Order Date</td>
                <td style="font-size: 13px; color: #1F2937; text-align: right; padding-bottom: 4px;">${orderDate}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #6B7280; padding-bottom: 4px;">Service Type</td>
                <td style="font-size: 13px; color: #0047AB; text-align: right; font-weight: bold; padding-bottom: 4px;">${orderTypeLabel}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #6B7280;">Payment Method</td>
                <td style="font-size: 13px; color: #1F2937; text-align: right; font-weight: bold;">${paymentMethod}</td>
              </tr>
            </table>
          </div>

          <h4 style="color: #050A18; margin-top: 0; margin-bottom: 8px;">Route & Logistics</h4>
          <div style="font-size: 14px; line-height: 20px; color: #4B5563; margin-bottom: 20px;">
            <p style="margin: 4px 0;">📍 <strong>Pickup:</strong> ${order.pickupAddress}</p>
            <p style="margin: 4px 0;">🏁 <strong>Drop-off:</strong> ${order.dropoffAddress}</p>
            <p style="margin: 4px 0;">🛣️ <strong>Distance:</strong> ${order.estimatedDistance} km</p>
          </div>

          ${itemsTableHtml}

          <h4 style="color: #050A18; margin-top: 20px; margin-bottom: 8px;">Payment Summary</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #4B5563;">Delivery Fee</td>
              <td style="padding: 6px 0; text-align: right; color: #1F2937;">₱${deliveryFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #4B5563;">Items Cost</td>
              <td style="padding: 6px 0; text-align: right; color: #1F2937;">₱${itemsCost.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb; font-weight: bold; font-size: 16px;">
              <td style="padding: 12px 0; color: #050A18;">Total Charge</td>
              <td style="padding: 12px 0; text-align: right; color: #0047AB; font-weight: 900;">₱${totalCost.toFixed(2)}</td>
            </tr>
          </table>

          <div style="background-color: #eff6ff; border-radius: 8px; padding: 12px; text-align: center; margin-top: 20px;">
            <p style="color: #1e40af; font-size: 13px; font-weight: bold; margin: 0;">🚀 We are matching you with an active pilot now!</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This is a system-generated receipt. If you have any questions, contact our support team in the app.</p>
        </div>
      `,
    });

    console.log(`✉️ [EmailService] Order receipt email sent to ${email} for order #${orderIdShort}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ [EmailService] Failed to send order receipt email:', err);
    return false;
  }
};

export const sendSignupVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const mailTransporter = await getTransporter();
    const fromName = process.env.SMTP_FROM_NAME || 'Fetch Me Up Support';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'support@fetchmeup.com';

    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: '🔑 Fetch Me Up - Sign Up Verification Code',
      text: `Hello,\n\nWelcome to Fetch Me Up! Use the following 6-digit verification code to complete your registration:\n\n👉 ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nFetch Me Up Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0047AB; text-align: center; margin: 0;">Fetch Me Up</h2>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p>Hello,</p>
          <p>Welcome to Fetch Me Up! Use the following 6-digit verification code to complete your registration:</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #050A18;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code is valid for <strong>5 minutes</strong>.</p>
          <p style="margin-top: 30px;">If you did not register for an account, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message, please do not reply directly to this email.</p>
        </div>
      `,
    });

    console.log(`✉️ [EmailService] Signup verification email sent to ${email}. MessageId: ${info.messageId}`);
    
    // Log preview link if Ethereal is used
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [EmailService] Ethereal Preview URL: ${previewUrl}`);
    }

    return true;
  } catch (err) {
    console.error('❌ [EmailService] Failed to send signup verification email:', err);
    return false;
  }
};
