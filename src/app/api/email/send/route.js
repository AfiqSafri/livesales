import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, html, text } = await req.json();
    
    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ error: 'Missing required email fields' }), { status: 400 });
    }

    // Create transporter (using Gmail for demo - in production use proper email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html,
      text
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), { status: 200 });

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
} 