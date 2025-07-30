import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const where = { userId: Number(userId) };
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        order: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(JSON.stringify({ notifications }), { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, orderId, type, title, message } = await req.json();
    
    if (!userId || !title || !message) {
      return new Response(JSON.stringify({ error: 'User ID, title, and message are required' }), { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        orderId: orderId ? Number(orderId) : null,
        type: type || 'system',
        title,
        message,
        isRead: false
      }
    });

    return new Response(JSON.stringify({ notification }), { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { notificationId, isRead } = await req.json();
    
    if (!notificationId) {
      return new Response(JSON.stringify({ error: 'Notification ID is required' }), { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id: Number(notificationId) },
      data: { isRead: isRead !== undefined ? isRead : true }
    });

    return new Response(JSON.stringify({ notification }), { status: 200 });

  } catch (error) {
    console.error('Error updating notification:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 