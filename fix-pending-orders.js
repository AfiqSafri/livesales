// Check and fix pending payment orders
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPendingOrders() {
  try {
    console.log('🔍 Checking pending payment orders...');
    
    const pendingOrders = await prisma.order.findMany({
      where: { 
        paymentStatus: 'pending' 
      },
      include: { 
        product: { 
          include: { 
            seller: true 
          } 
        }, 
        buyer: true, 
        payment: true 
      }
    });

    console.log(`📊 Found ${pendingOrders.length} pending orders:`);
    
    pendingOrders.forEach(order => {
      console.log(`Order #${order.id}:`);
      console.log(`  - Amount: RM ${order.totalAmount}`);
      console.log(`  - Buyer: ${order.buyerName}`);
      console.log(`  - Seller: ${order.product.seller.name}`);
      console.log(`  - Payment Method: ${order.paymentMethod}`);
      console.log(`  - Created: ${order.createdAt}`);
      console.log('---');
    });

    return pendingOrders;
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
    return [];
  }
}

async function sendPaymentEmails(order) {
  try {
    const { sendEmail, emailTemplates } = await import('./src/utils/email.js');
    
    console.log(`📧 Sending payment emails for order #${order.id}...`);
    
    // Send confirmation email to buyer
    if (order.buyer?.email) {
      console.log('📧 Sending buyer payment confirmation...');
      
      const buyerEmail = emailTemplates.buyerPaymentConfirmation({
        buyerName: order.buyerName || order.buyer.name,
        productName: order.product.name,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        reference: order.payment?.reference || `ORDER_${order.id}`,
        sellerName: order.product.seller.name
      });

      const buyerResult = await sendEmail({
        to: order.buyer.email,
        subject: buyerEmail.subject,
        html: buyerEmail.html,
        text: buyerEmail.text
      });

      if (buyerResult.success) {
        console.log('✅ Buyer payment confirmation email sent');
      } else {
        console.log('❌ Failed to send buyer email:', buyerResult.error);
      }
    }

    // Send payment notification to seller
    console.log('📧 Sending seller payment notification...');
    
    const sellerEmail = emailTemplates.sellerPaymentNotification({
      sellerName: order.product.seller.name,
      productName: order.product.name,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      reference: order.payment?.reference || `ORDER_${order.id}`,
      buyerName: order.buyerName || order.buyer?.name || 'Customer',
      buyerEmail: order.buyerEmail || order.buyer?.email || 'buyer@example.com'
    });

    const sellerResult = await sendEmail({
      to: order.product.seller.email,
      subject: sellerEmail.subject,
      html: sellerEmail.html,
      text: sellerEmail.text
    });

    if (sellerResult.success) {
      console.log('✅ Seller payment notification email sent');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    // Send admin notification
    console.log('📧 Sending admin payment notification...');
    
    const adminEmail = emailTemplates.adminBuyerPayment({
      buyerName: order.buyerName || order.buyer?.name || 'Customer',
      buyerEmail: order.buyerEmail || order.buyer?.email || 'buyer@example.com',
      sellerName: order.product.seller.name,
      productName: order.product.name,
      totalAmount: order.totalAmount,
      reference: order.payment?.reference || `ORDER_${order.id}`
    });

    const adminResult = await sendEmail({
      to: 'livesalez1@gmail.com', // Admin email
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text
    });

    if (adminResult.success) {
      console.log('✅ Admin payment notification email sent');
    } else {
      console.log('❌ Failed to send admin email:', adminResult.error);
    }

    return true;
    
  } catch (error) {
    console.error('❌ Error sending emails:', error);
    return false;
  }
}

async function main() {
  try {
    const pendingOrders = await checkPendingOrders();
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders found!');
      return;
    }

    console.log('\n🔧 Would you like to send payment confirmation emails for these orders?');
    console.log('This will send emails to buyers, sellers, and admin for each pending order.');
    
    // For now, let's automatically send emails for the first order as a test
    const testOrder = pendingOrders[0];
    console.log(`\n📧 Sending test emails for order #${testOrder.id}...`);
    
    const emailSent = await sendPaymentEmails(testOrder);
    
    if (emailSent) {
      console.log('✅ Test emails sent successfully!');
      
      // Update the order status to paid
      await prisma.order.update({
        where: { id: testOrder.id },
        data: {
          status: 'paid',
          paymentStatus: 'completed',
          paymentDate: new Date()
        }
      });
      
      console.log('✅ Order status updated to paid');
    }
    
  } catch (error) {
    console.error('❌ Main error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
