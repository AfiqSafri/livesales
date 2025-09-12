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
    console.log('📧 sendEmail called with:', { to, subject: subject.substring(0, 50) + '...' });
    
    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_PASS;
    
    console.log('📧 Email credentials check:', { 
      emailUser: emailUser ? 'exists' : 'missing', 
      emailPass: emailPass ? 'exists' : 'missing' 
    });
    
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

    console.log('📧 Attempting to send email to:', to);
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
  }),

  // Receipt uploaded notification to seller
  receiptUploadedToSeller: ({ sellerName, buyerName, productName, amount, orderId, receiptUrl }) => {
    // Generate security token for email actions
    const receiptId = orderId.replace('QR-', '');
    const token = `receipt_${receiptId}_${process.env.EMAIL_SECRET_TOKEN || 'default_secret'}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return {
      subject: '📄 New Payment Receipt Uploaded - Review Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin: 0;">📄 New Payment Receipt Uploaded</h2>
          </div>
          
          <p>Dear <strong>${sellerName}</strong>,</p>
          
          <p>A buyer has uploaded a payment receipt for your product. Please review and approve or reject the payment.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Receipt Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName}</li>
              <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
              <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
              <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
              <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></li>
            </ul>
          </div>
          
          <!-- Receipt Image Display -->
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #495057;">Receipt Image</h4>
            <div style="text-align: center;">
              <img src="${receiptUrl}" 
                   style="max-width: 100%; height: auto; border: 1px solid #dee2e6; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                   alt="Payment Receipt"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div style="display: none; padding: 20px; color: #6c757d;">
                <p>📄 Receipt image could not be loaded</p>
                <p><a href="${receiptUrl}" style="color: #0066cc;">Click here to view receipt</a></p>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0066cc;">Quick Actions</h4>
            <p>You can approve or reject this payment directly from this email:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <button onclick="approveReceipt(${receiptId}, '${token}')" 
                      style="background-color: #10B981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; font-weight: bold; font-size: 14px;">
                ✅ Approve Payment
              </button>
              <button onclick="rejectReceipt(${receiptId}, '${token}')" 
                      style="background-color: #EF4444; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; font-weight: bold; font-size: 14px;">
                ❌ Reject Payment
              </button>
            </div>
            
            <div id="status-${receiptId}" style="text-align: center; margin: 10px 0; display: none;">
              <p style="margin: 0; padding: 10px; border-radius: 4px;"></p>
            </div>
          </div>
          
          <!-- Alternative Dashboard Link -->
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #495057;">Alternative: Dashboard Review</h4>
            <p style="margin: 5px 0;">You can also review this receipt in your seller dashboard:</p>
            <p style="margin: 10px 0;">
              <a href="${baseUrl}/seller/dashboard" style="background-color: #6B7280; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Best regards,<br>
              <strong>Livesalez Team</strong>
            </p>
          </div>
        </div>
        
        <!-- JavaScript for AJAX actions -->
        <script>
          function approveReceipt(receiptId, token) {
            processReceipt(receiptId, 'approve', token);
          }
          
          function rejectReceipt(receiptId, token) {
            processReceipt(receiptId, 'reject', token);
          }
          
          function processReceipt(receiptId, action, token) {
            const statusDiv = document.getElementById('status-' + receiptId);
            const buttons = document.querySelectorAll('button[onclick*="' + receiptId + '"]');
            
            // Show loading state
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<p style="margin: 0; padding: 10px; background-color: #fef3c7; color: #92400e; border-radius: 4px;">Processing...</p>';
            
            // Disable buttons
            buttons.forEach(btn => {
              btn.disabled = true;
              btn.style.opacity = '0.6';
            });
            
            // Make AJAX request
            fetch('${baseUrl}/api/receipt/email-action?receiptId=' + receiptId + '&action=' + action + '&token=' + token, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => response.text())
            .then(data => {
              if (action === 'approve') {
                statusDiv.innerHTML = '<p style="margin: 0; padding: 10px; background-color: #d1fae5; color: #065f46; border-radius: 4px;">✅ Payment approved successfully! Order created and both parties notified.</p>';
              } else {
                statusDiv.innerHTML = '<p style="margin: 0; padding: 10px; background-color: #fee2e2; color: #991b1b; border-radius: 4px;">❌ Payment rejected. Buyer has been notified.</p>';
              }
            })
            .catch(error => {
              statusDiv.innerHTML = '<p style="margin: 0; padding: 10px; background-color: #fee2e2; color: #991b1b; border-radius: 4px;">❌ Error processing payment. Please try again or use the dashboard.</p>';
              // Re-enable buttons on error
              buttons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
              });
            });
          }
        </script>
      `,
      text: `
📄 New Payment Receipt Uploaded - Review Required

Dear ${sellerName},

A buyer has uploaded a payment receipt for your product. Please review and approve or reject the payment.

Receipt Details:
- Buyer: ${buyerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Pending Review

Receipt Image: ${receiptUrl}

Quick Actions (use dashboard for full functionality):
- Dashboard: ${baseUrl}/seller/dashboard

Best regards,
Livesalez Team
      `
    };
  },

  // Receipt uploaded notification to buyer
  receiptUploadedToBuyer: ({ buyerName, sellerName, productName, amount, orderId }) => ({
    subject: '📄 Payment Receipt Received - Under Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0;">📄 Receipt Received</h2>
        </div>
        
        <p>Dear <strong>${buyerName}</strong>,</p>
        
        <p>Thank you for uploading your payment receipt! The seller has been notified and will review it shortly.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Under Review</span></li>
          </ul>
        </div>
        
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">What's Next?</h4>
          <p>The seller will review your receipt and either approve or reject the payment. You will receive another email notification once the review is complete.</p>
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
📄 Payment Receipt Received - Under Review

Dear ${buyerName},

Thank you for uploading your payment receipt! The seller has been notified and will review it shortly.

Order Details:
- Seller: ${sellerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Under Review

What's Next?
The seller will review your receipt and either approve or reject the payment. You will receive another email notification once the review is complete.

Best regards,
Livesalez Team
    `
  }),

  // Payment approved notification to buyer
  paymentApproved: ({ buyerName, sellerName, productName, amount, orderId, sellerNotes }) => ({
    subject: '✅ Payment Approved - Order Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0;">✅ Payment Approved!</h2>
        </div>
        
        <p>Dear <strong>${buyerName}</strong>,</p>
        
        <p>Great news! Your payment has been approved by the seller. Your order is now confirmed!</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #059669;">Confirmed</span></li>
          </ul>
        </div>
        
        ${sellerNotes ? `
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">Seller Notes:</h4>
          <p>${sellerNotes}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #166534;">Next Steps</h4>
          <p>The seller will contact you shortly to arrange delivery or pickup. Please keep this email for your records.</p>
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
✅ Payment Approved - Order Confirmed!

Dear ${buyerName},

Great news! Your payment has been approved by the seller. Your order is now confirmed!

Order Details:
- Seller: ${sellerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Confirmed

${sellerNotes ? `Seller Notes: ${sellerNotes}` : ''}

Next Steps:
The seller will contact you shortly to arrange delivery or pickup. Please keep this email for your records.

Best regards,
Livesalez Team
    `
  }),

  // Payment approved notification to seller
  paymentApprovedToSeller: ({ sellerName, buyerName, productName, amount, orderId }) => ({
    subject: '✅ Payment Approved - Order Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0;">✅ Payment Approved</h2>
        </div>
        
        <p>Dear <strong>${sellerName}</strong>,</p>
        
        <p>You have successfully approved the payment receipt. The order is now confirmed!</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #059669;">Confirmed</span></li>
          </ul>
        </div>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #166534;">Next Steps</h4>
          <p>Please contact the buyer to arrange delivery or pickup. The buyer has been notified of the approval.</p>
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
✅ Payment Approved - Order Confirmed

Dear ${sellerName},

You have successfully approved the payment receipt. The order is now confirmed!

Order Details:
- Buyer: ${buyerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Confirmed

Next Steps:
Please contact the buyer to arrange delivery or pickup. The buyer has been notified of the approval.

Best regards,
Livesalez Team
    `
  }),

  // Payment rejected notification to buyer
  paymentRejected: ({ buyerName, sellerName, productName, amount, orderId, sellerNotes }) => ({
    subject: '❌ Payment Rejected - Please Try Again',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">❌ Payment Rejected</h2>
        </div>
        
        <p>Dear <strong>${buyerName}</strong>,</p>
        
        <p>Unfortunately, your payment receipt was rejected by the seller. Please review the reason and try again.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Seller:</strong> ${sellerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #dc2626;">Rejected</span></li>
          </ul>
        </div>
        
        ${sellerNotes ? `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #dc2626;">Rejection Reason:</h4>
          <p>${sellerNotes}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">What to do next?</h4>
          <p>Please check your payment receipt and ensure it shows the correct amount and is clearly visible. You can upload a new receipt or try a different payment method.</p>
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
❌ Payment Rejected - Please Try Again

Dear ${buyerName},

Unfortunately, your payment receipt was rejected by the seller. Please review the reason and try again.

Order Details:
- Seller: ${sellerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Rejected

${sellerNotes ? `Rejection Reason: ${sellerNotes}` : ''}

What to do next?
Please check your payment receipt and ensure it shows the correct amount and is clearly visible. You can upload a new receipt or try a different payment method.

Best regards,
Livesalez Team
    `
  }),

  // Payment rejected notification to seller
  paymentRejectedToSeller: ({ sellerName, buyerName, productName, amount, orderId, sellerNotes }) => ({
    subject: '❌ Payment Rejected - Review Completed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0;">❌ Payment Rejected</h2>
        </div>
        
        <p>Dear <strong>${sellerName}</strong>,</p>
        
        <p>You have rejected the payment receipt. The buyer has been notified and can try again with a new receipt.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Buyer:</strong> ${buyerName}</li>
            <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
            <li style="margin: 10px 0;"><strong>Amount:</strong> RM ${amount.toFixed(2)}</li>
            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
            <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #dc2626;">Rejected</span></li>
          </ul>
        </div>
        
        ${sellerNotes ? `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #dc2626;">Your Notes:</h4>
          <p>${sellerNotes}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">What's Next?</h4>
          <p>The buyer has been notified of the rejection and can upload a new receipt or try a different payment method. You will receive another notification if they submit a new receipt.</p>
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
❌ Payment Rejected - Review Completed

Dear ${sellerName},

You have rejected the payment receipt. The buyer has been notified and can try again with a new receipt.

Order Details:
- Buyer: ${buyerName}
- Product: ${productName}
- Amount: RM ${amount.toFixed(2)}
- Order ID: ${orderId}
- Status: Rejected

${sellerNotes ? `Your Notes: ${sellerNotes}` : ''}

What's Next?
The buyer has been notified of the rejection and can upload a new receipt or try a different payment method. You will receive another notification if they submit a new receipt.

Best regards,
Livesalez Team
    `
  }),

  // Pending Receipt Reminder Template
  pendingReceiptReminder: ({ sellerName, pendingReceipts, totalCount, reminderFrequency = '30s' }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Convert frequency to human readable format
    const getFrequencyText = (freq) => {
      switch (freq) {
        case '30s': return 'every 30 seconds';
        case '30m': return 'every 30 minutes';
        case '1h': return 'every 1 hour';
        case 'off': return 'disabled';
        default: return 'every 30 seconds';
      }
    };
    
    const frequencyText = getFrequencyText(reminderFrequency);
    
    return {
      subject: `🔔 Reminder: ${totalCount} Pending Receipt(s) Need Your Review`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <h2 style="color: #92400e; margin: 0;">🔔 Pending Receipt Reminder</h2>
            <p style="color: #92400e; margin: 5px 0 0 0;">You have ${totalCount} pending receipt(s) waiting for your review</p>
          </div>
          
          <p>Dear <strong>${sellerName}</strong>,</p>
          
          <p>This is a friendly reminder that you have <strong>${totalCount} pending receipt(s)</strong> that need your review and approval/rejection.</p>
          
          <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Pending Receipts Summary</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #f59e0b;">
                📄 ${totalCount} Receipt(s) Pending Review
              </p>
            </div>
            
            ${pendingReceipts.slice(0, 5).map((receipt, index) => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0; ${index === pendingReceipts.slice(0, 5).length - 1 ? 'border-bottom: none;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer'}</strong>
                    <br>
                    <span style="color: #6b7280; font-size: 14px;">
                      ${receipt.order?.product?.name || receipt.productName || 'QR Payment'} - RM ${receipt.amount.toFixed(2)}
                    </span>
                  </div>
                  <div style="text-align: right;">
                    <span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      PENDING
                    </span>
                    <br>
                    <span style="color: #6b7280; font-size: 12px;">
                      ${new Date(receipt.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            `).join('')}
            
            ${pendingReceipts.length > 5 ? `
              <div style="text-align: center; margin-top: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 6px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  + ${pendingReceipts.length - 5} more receipt(s) pending review
                </p>
              </div>
            ` : ''}
          </div>
          
          <!-- Urgent Action Required -->
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #dc2626;">⚠️ Action Required</h4>
            <p style="margin: 0; color: #dc2626;">
              These receipts have been pending for review. Please log into your seller dashboard to approve or reject them.
            </p>
          </div>
          
          <!-- Quick Actions -->
          <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0066cc;">Quick Actions</h4>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${baseUrl}/seller/dashboard" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 5px;">
                📋 Review Receipts Now
              </a>
            </div>
            <p style="text-align: center; margin: 10px 0; color: #6b7280; font-size: 14px;">
              Click the button above to go directly to your seller dashboard
            </p>
          </div>
          
          <!-- Reminder Frequency -->
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #495057;">Reminder Frequency</h4>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
              You will receive this reminder ${frequencyText} until all pending receipts are reviewed.
            </p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
              To change your reminder frequency or stop these reminders, please review and approve/reject all pending receipts.
            </p>
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
              <strong>Current setting:</strong> ${frequencyText}
            </p>
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
🔔 Reminder: ${totalCount} Pending Receipt(s) Need Your Review

Dear ${sellerName},

This is a friendly reminder that you have ${totalCount} pending receipt(s) that need your review and approval/rejection.

Pending Receipts Summary:
${pendingReceipts.slice(0, 5).map((receipt, index) => 
  `${index + 1}. ${receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer'} - ${receipt.order?.product?.name || receipt.productName || 'QR Payment'} - RM ${receipt.amount.toFixed(2)} (${new Date(receipt.uploadedAt).toLocaleDateString()})`
).join('\n')}

${pendingReceipts.length > 5 ? `+ ${pendingReceipts.length - 5} more receipt(s) pending review` : ''}

⚠️ Action Required:
These receipts have been pending for review. Please log into your seller dashboard to approve or reject them.

Quick Actions:
- Dashboard: ${baseUrl}/seller/dashboard

Reminder Frequency:
You will receive this reminder ${frequencyText} until all pending receipts are reviewed.
To change your reminder frequency or stop these reminders, please review and approve/reject all pending receipts.
Current setting: ${frequencyText}

Best regards,
Livesalez Team
      `
    };
  },

  // Shipping Status Update Templates
  shippingStatusUpdate: ({ buyerName, orderId, productName, status, trackingNumber, courierName, sellerNotes, estimatedDelivery }) => ({
    subject: `Order #${orderId} Status Update - ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">📦 Order Status Update</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Livesalez - Professional E-commerce</p>
          </div>
          
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #0369a1;">Hello ${buyerName}!</h2>
            <p>Your order status has been updated. Here are the latest details:</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Information</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Order ID:</strong> #${orderId}</li>
              <li style="margin: 10px 0;"><strong>Product:</strong> ${productName}</li>
              <li style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span></li>
              ${trackingNumber ? `<li style="margin: 10px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</li>` : ''}
              ${courierName ? `<li style="margin: 10px 0;"><strong>Courier:</strong> ${courierName}</li>` : ''}
              ${estimatedDelivery ? `<li style="margin: 10px 0;"><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</li>` : ''}
            </ul>
          </div>
          
          ${sellerNotes ? `
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">Seller Message:</h4>
            <p>${sellerNotes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0369a1;">What's Next?</h4>
            <p>${getStatusMessage(status)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order-tracking?id=${orderId}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track Your Order
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Thank you for choosing Livesalez!<br>
              <strong>Livesalez Team</strong>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
📦 Order Status Update

Hello ${buyerName}!

Your order status has been updated. Here are the latest details:

Order Information:
- Order ID: #${orderId}
- Product: ${productName}
- Status: ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
${trackingNumber ? `- Tracking Number: ${trackingNumber}` : ''}
${courierName ? `- Courier: ${courierName}` : ''}
${estimatedDelivery ? `- Estimated Delivery: ${new Date(estimatedDelivery).toLocaleDateString()}` : ''}

${sellerNotes ? `Seller Message: ${sellerNotes}` : ''}

What's Next?
${getStatusMessage(status)}

Track your order: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order-tracking?id=${orderId}

Thank you for choosing Livesalez!
Livesalez Team
    `
  })
};

// Helper function for status messages
function getStatusMessage(status) {
  const messages = {
    'pending': 'Your order is being reviewed and will be processed soon.',
    'processing': 'Your order is being prepared for shipping. We will notify you once it\'s ready to ship.',
    'ready_to_ship': 'Your order is packed and ready to be shipped. You will receive tracking information soon.',
    'shipped': 'Your order is on its way! Use the tracking number to monitor its progress.',
    'out_for_delivery': 'Your order is out for delivery and should arrive today.',
    'delivered': 'Your order has been delivered successfully. Thank you for your purchase!',
    'completed': 'Your order has been completed successfully. Thank you for your purchase!',
    'cancelled': 'Your order has been cancelled. If you have any questions, please contact our support team.'
  };
  return messages[status] || 'Your order status has been updated.';
} 