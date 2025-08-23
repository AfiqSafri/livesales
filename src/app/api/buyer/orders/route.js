import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get('buyerId');
    
    if (!buyerId) {
      return new Response(JSON.stringify({ error: 'Buyer ID is required' }), { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: Number(buyerId) },
      include: {
        product: {
          include: {
            seller: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Get last 5 status updates
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify({ orders }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { productId, buyerId, buyerName, quantity, shippingAddress, phone, email } = await req.json();
    if (!productId || !buyerName || !quantity || !shippingAddress || !phone || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    
    // Get product with seller details
    const product = await prisma.product.findUnique({ 
      where: { id: Number(productId) },
      include: { seller: true }
    });
    
    if (!product || product.quantity < quantity) {
      return new Response(JSON.stringify({ error: 'Not enough quantity in stock' }), { status: 400 });
    }
    
    const data = {
      productId: Number(productId),
      quantity: Number(quantity),
      buyerName,
      shippingAddress,
      phone,
      buyerEmail: email, // Store buyer email in order
      status: 'pending',
      totalAmount: (product.price * Number(quantity)) + (product.shippingPrice || 0),
      paymentStatus: 'pending',
      shippingCost: product.shippingPrice || 0,
    };
    if (buyerId) data.buyerId = Number(buyerId);
    
    const order = await prisma.order.create({ data });
    
    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        description: 'Order has been placed and is awaiting confirmation',
        updatedBy: 'system'
      }
    });
    
    // Reduce product quantity
    await prisma.product.update({
      where: { id: Number(productId) },
      data: { quantity: { decrement: Number(quantity) } },
    });

               // Send email notification to buyer (optional - don't break order if email fails)
           if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
             try {
               const emailHtml = `
                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                   <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                     <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
                     <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your order on Livesalez</p>
                   </div>
                   
                   <div style="padding: 30px; background: #f8f9fa;">
                     <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
                     
                     <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                       <h3 style="color: #333; margin: 0 0 15px 0;">Order #${order.id}</h3>
                       <p><strong>Product:</strong> ${product.name}</p>
                       <p><strong>Quantity:</strong> ${quantity}</p>
                       <p><strong>Total Amount:</strong> RM${data.totalAmount.toFixed(2)}</p>
                       <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending</span></p>
                     </div>
                     
                     <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                       <h3 style="color: #333; margin: 0 0 15px 0;">Shipping Information</h3>
                       <p><strong>Name:</strong> ${buyerName}</p>
                       <p><strong>Phone:</strong> ${phone}</p>
                       <p><strong>Address:</strong> ${shippingAddress}</p>
                     </div>
                     
                     <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                       <h3 style="color: #065f46; margin: 0 0 15px 0;">What's Next?</h3>
                       <p style="color: #065f46; margin: 0;">We'll notify you when your order is processed and shipped. You can track your order status through our platform.</p>
                     </div>
                   </div>
                   
                   <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                     <p style="color: #6c757d; margin: 0; font-size: 14px;">
                       © 2025 Livesalez. All rights reserved.<br>
                       Powered by MyTech Padu Solutions
                     </p>
                   </div>
                 </div>
               `;

               const emailText = `
Order Confirmed!

Thank you for your order on Livesalez

Order Details:
- Order #${order.id}
- Product: ${product.name}
- Quantity: ${quantity}
- Total Amount: RM${data.totalAmount.toFixed(2)}
- Status: Pending

Shipping Information:
- Name: ${buyerName}
- Phone: ${phone}
- Address: ${shippingAddress}

What's Next?
We'll notify you when your order is processed and shipped. You can track your order status through our platform.

© 2025 Livesalez. All rights reserved.
Powered by MyTech Padu Solutions
               `;

               await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   to: email,
                   subject: `Order Confirmed - Order #${order.id}`,
                   html: emailHtml,
                   text: emailText
                 })
               });
             } catch (emailError) {
               console.error('Failed to send email:', emailError);
               // Don't fail the order if email fails
             }
           }

    // Send email notification to seller (optional - don't break order if email fails)
    if (product.seller.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const sellerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🛒 New Order Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">You have a new order on Livesalez</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Order #${order.id}</h3>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Total Amount:</strong> RM${data.totalAmount.toFixed(2)}</p>
                <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending</span></p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Customer Information</h3>
                <p><strong>Name:</strong> ${buyerName}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin: 0 0 15px 0;">Action Required</h3>
                <p style="color: #065f46; margin: 0;">Please process this order and update the status in your seller dashboard.</p>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; margin: 0; font-size: 14px;">
                © 2025 Livesalez. All rights reserved.<br>
                Powered by MyTech Padu Solutions
              </p>
            </div>
          </div>
        `;

        const sellerEmailText = `
New Order Received!

You have a new order on Livesalez

Order Details:
- Order #${order.id}
- Product: ${product.name}
- Quantity: ${quantity}
- Total Amount: RM${data.totalAmount.toFixed(2)}
- Status: Pending

Customer Information:
- Name: ${buyerName}
- Phone: ${phone}
- Email: ${email}
- Shipping Address: ${shippingAddress}

Action Required:
Please process this order and update the status in your seller dashboard.

© 2025 Livesalez. All rights reserved.
Powered by MyTech Padu Solutions
        `;

        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: product.seller.email,
            subject: `New Order #${order.id} - ${product.name}`,
            html: sellerEmailHtml,
            text: sellerEmailText
          })
        });
      } catch (emailError) {
        console.error('Failed to send seller email:', emailError);
        // Don't fail the order if email fails
      }
    }
    
    return new Response(JSON.stringify({ order, orderId: order.id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 