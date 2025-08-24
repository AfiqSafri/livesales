import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS
    }
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      console.log('📧 Required environment variables: EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD');
      console.log('📧 Or alternatively: EMAIL_USER and EMAIL_PASS');
      return { success: false, messageId: 'skipped-no-credentials', error: 'Email credentials not configured' };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailUser,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, messageId: 'error', error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  // Buyer payment confirmation
  buyerPaymentConfirmation: ({ buyerName, productName, quantity, totalAmount, reference, sellerName }) => ({
    subject: 'Payment Confirmed - Order Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #28a745; margin: 0;">Payment Confirmed!</h2>
        </div>
        
        <p>Dear <strong>${buyerName}</strong>,</p>
        
        <p>Your payment has been successfully processed! Here are your purchase details:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Quantity:</strong> ${quantity}</li>
            <li style="margin: 10px 0;"><strong>Total Amount:</strong> RM ${totalAmount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Payment Reference:</strong> ${reference}</li>
            <li style="margin: 10px 0;"><strong>Order Status:</strong> <span style="color: #28a745;">Paid</span></li>
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
          </ul>
        </div>
        
        <p>The seller will contact you shortly to arrange delivery or pickup.</p>
        
        <p>Thank you for your purchase!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${buyerName},

Your payment has been successfully processed!

Order Details:
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: RM ${totalAmount.toFixed(2)}
- Payment Reference: ${reference}
- Order Status: Paid
- Seller: ${sellerName}

The seller will contact you shortly to arrange delivery or pickup.

Thank you for your purchase!

Best regards,
Livesalez Team
    `
  }),

  // Seller payment notification
  sellerPaymentNotification: ({ sellerName, productName, quantity, totalAmount, reference, buyerName, buyerEmail }) => ({
    subject: 'Payment Received - Order Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin: 0;">Payment Received!</h2>
        </div>
        
        <p>Dear <strong>${sellerName}</strong>,</p>
        
        <p>Great news! You have received a payment for your product.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Quantity:</strong> ${quantity}</li>
            <li style="margin: 10px 0;"><strong>Total Amount:</strong> RM ${totalAmount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Payment Reference:</strong> ${reference}</li>
            <li style="margin: 10px 0;"><strong>Order Status:</strong> <span style="color: #28a745;">Paid</span></li>
            <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName} (${buyerEmail})</li>
          </ul>
        </div>
        
        <p>Please contact the buyer to arrange delivery or pickup.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${sellerName},

Great news! You have received a payment for your product.

Order Details:
- Product: ${productName}
- Quantity: ${quantity}
- Total Amount: RM ${totalAmount.toFixed(2)}
- Payment Reference: ${reference}
- Order Status: Paid
- Buyer: ${buyerName} (${buyerEmail})

Please contact the buyer to arrange delivery or pickup.

Best regards,
Livesalez Team
    `
  }),

  // Buyer order confirmation
  buyerOrderConfirmation: ({ buyerName, productName, quantity, unitPrice, totalAmount, reference, sellerName }) => ({
    subject: 'Order Confirmation - Your Purchase Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin: 0;">Order Received!</h2>
        </div>
        
        <p>Dear <strong>${buyerName}</strong>,</p>
        
        <p>Thank you for your order! Here are your purchase details:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Quantity:</strong> ${quantity}</li>
            <li style="margin: 10px 0;"><strong>Unit Price:</strong> RM ${unitPrice.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Total Amount:</strong> RM ${totalAmount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order Reference:</strong> ${reference}</li>
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
          </ul>
        </div>
        
        <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0066cc;">Next Steps</h4>
          <p>To complete your payment, please visit:</p>
          <p style="margin: 10px 0;"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment/test/${reference}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Payment</a></p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${buyerName},

Thank you for your order! Here are your purchase details:

Product: ${productName}
Quantity: ${quantity}
Unit Price: RM ${unitPrice.toFixed(2)}
Total Amount: RM ${totalAmount.toFixed(2)}
Order Reference: ${reference}
Seller: ${sellerName}

To complete your payment, please visit:
${process.env.NEXT_PUBLIC_BASE_URL}/payment/test/${reference}

Best regards,
Livesalez Team
    `
  }),

  // Seller order notification
  sellerOrderNotification: ({ sellerName, productName, quantity, totalAmount, reference, buyerName, buyerEmail }) => ({
    subject: 'New Order Received - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin: 0;">New Order Received!</h2>
        </div>
        
        <p>Dear <strong>${sellerName}</strong>,</p>
        
        <p>You have received a new order! Here are the details:</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Quantity:</strong> ${quantity}</li>
            <li style="margin: 10px 0;"><strong>Total Amount:</strong> RM ${totalAmount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order Reference:</strong> ${reference}</li>
            <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName} (${buyerEmail})</li>
          </ul>
        </div>
        
        <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0066cc;">Important</h4>
          <p>The buyer will complete payment shortly. You will receive another notification once payment is confirmed.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${sellerName},

You have received a new order! Here are the details:

Product: ${productName}
Quantity: ${quantity}
Total Amount: RM ${totalAmount.toFixed(2)}
Order Reference: ${reference}
Buyer: ${buyerName} (${buyerEmail})

The buyer will complete payment shortly. You will receive another notification once payment is confirmed.

Best regards,
Livesalez Team
    `
  }),

  // Subscription activation confirmation
  subscriptionActivated: ({ sellerName, planName, planPrice, subscriptionEndDate, features }) => ({
    subject: `🎉 Subscription Activated - ${planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0;">🎉 Subscription Activated!</h2>
        </div>
        
        <p>Dear <strong>${sellerName}</strong>,</p>
        
        <p>Congratulations! Your subscription has been successfully activated.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Subscription Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${planName}</li>
            <li style="margin: 10px 0;"><strong>Price:</strong> RM ${planPrice}/month</li>
            <li style="margin: 10px 0;"><strong>Next Billing:</strong> ${subscriptionEndDate}</li>
          </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Your Plan Features:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${features.map(feature => `<li style="margin-bottom: 8px;">${feature}</li>`).join('')}
          </ul>
        </div>
        
        <p>You now have access to all the features included in your <strong>${planName}</strong>. Start exploring and growing your business!</p>
        
        <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
                            <strong>Livesalez Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `
🎉 Subscription Activated - ${planName}

Dear ${sellerName},

Congratulations! Your subscription has been successfully activated.

Subscription Details:
- Plan: ${planName}
- Price: RM ${planPrice}/month
- Next Billing: ${subscriptionEndDate}

Your Plan Features:
${features.map(feature => `- ${feature}`).join('\n')}

You now have access to all the features included in your ${planName}. Start exploring and growing your business!

If you have any questions about your subscription, please don't hesitate to contact our support team.

Best regards,
            Livesalez Team
    `
  }),

  // Admin notification for seller subscription
  adminSellerSubscription: ({ sellerName, sellerEmail, planName, planPrice, subscriptionEndDate }) => ({
    subject: `📊 Admin Alert: New Seller Subscription - ${planName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin: 0;">📊 New Seller Subscription</h2>
        </div>
        
        <p>Hello <strong>Admin</strong>,</p>
        
        <p>A seller has just subscribed to a plan. Here are the details:</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
          <h3 style="margin-top: 0; color: #1e40af;">Seller Information:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Name:</strong> ${sellerName}</li>
            <li style="margin: 10px 0;"><strong>Email:</strong> ${sellerEmail}</li>
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${planName}</li>
            <li style="margin: 10px 0;"><strong>Price:</strong> RM ${planPrice}/month</li>
            <li style="margin: 10px 0;"><strong>Next Billing:</strong> ${subscriptionEndDate}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #059669;">Active</span></li>
          </ul>
        </div>
        
        <p>This seller now has access to all features included in the <strong>${planName}</strong>.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez System</strong>
          </p>
        </div>
      </div>
    `,
    text: `
📊 Admin Alert: New Seller Subscription - ${planName}

Hello Admin,

A seller has just subscribed to a plan. Here are the details:

Seller Information:
- Name: ${sellerName}
- Email: ${sellerEmail}
- Plan: ${planName}
- Price: RM ${planPrice}/month
- Next Billing: ${subscriptionEndDate}
- Status: Active

This seller now has access to all features included in the ${planName}.

Best regards,
Livesalez System
    `
  }),

  // Admin notification for buyer payment
  adminBuyerPayment: ({ buyerName, buyerEmail, sellerName, productName, totalAmount, reference }) => ({
    subject: `💰 Admin Alert: New Payment Received - RM ${totalAmount.toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #166534; margin: 0;">💰 New Payment Received</h2>
        </div>
        
        <p>Hello <strong>Admin</strong>,</p>
        
        <p>A new payment has been received. Here are the transaction details:</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #166534;">
          <h3 style="margin-top: 0; color: #166534;">Transaction Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName} (${buyerEmail})</li>
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${totalAmount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Reference:</strong> ${reference}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #059669;">Paid</span></li>
          </ul>
        </div>
        
        <p>The payment has been processed successfully and both buyer and seller have been notified.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Livesalez System</strong>
          </p>
        </div>
      </div>
    `,
    text: `
💰 Admin Alert: New Payment Received - RM ${totalAmount.toFixed(2)}

Hello Admin,

A new payment has been received. Here are the transaction details:

Transaction Details:
- Buyer: ${buyerName} (${buyerEmail})
- Seller: ${sellerName}
- Product: ${productName}
- Amount: RM ${totalAmount.toFixed(2)}
- Reference: ${reference}
- Status: Paid

The payment has been processed successfully and both buyer and seller have been notified.

Best regards,
Livesalez System
    `
  })
}; 