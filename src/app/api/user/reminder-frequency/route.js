import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { userId, reminderFrequency } = await req.json();

    if (!userId || !reminderFrequency) {
      return NextResponse.json({ error: 'User ID and reminder frequency are required' }, { status: 400 });
    }

    // Validate reminder frequency
    const validFrequencies = ['30s', '30m', '1h', 'off'];
    if (!validFrequencies.includes(reminderFrequency)) {
      return NextResponse.json({ 
        error: 'Invalid reminder frequency. Must be one of: 30s, 30m, 1h, off' 
      }, { status: 400 });
    }

    // Update user's reminder frequency preference
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { reminderFrequency: reminderFrequency },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        reminderFrequency: true
      }
    });

    console.log(`✅ Updated reminder frequency for user ${updatedUser.name}: ${reminderFrequency}`);

    return NextResponse.json({
      success: true,
      message: 'Reminder frequency updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating reminder frequency:', error);
    return NextResponse.json({ 
      error: 'Failed to update reminder frequency',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's current reminder frequency preference
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        reminderFrequency: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Error fetching reminder frequency:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reminder frequency',
      details: error.message 
    }, { status: 500 });
  }
}
