import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const bio = formData.get('bio');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const profileImage = formData.get('profileImage');

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    let profileImageUrl = null;

    // Handle profile image upload
    if (profileImage && profileImage.size > 0) {
      // Validate file type
      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(profileImage.name);
      const filename = `profile_${id}_${timestamp}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Set the URL for database
      profileImageUrl = `/uploads/profiles/${filename}`;
    }

    // Check if email is already taken by another user (if email is being updated)
    if (email) {
      console.log('🔍 Checking email uniqueness for:', email);
      console.log('🔍 Current user ID:', id);
      
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: Number(id) } // Exclude current user
        }
      });

      if (existingUser) {
        console.log('❌ Email already taken by user ID:', existingUser.id);
        return NextResponse.json({ 
          error: 'Email address is already taken by another user' 
        }, { status: 400 });
      }
      
      console.log('✅ Email is available');
    }

    // Update user in database
    console.log('✅ Updating user profile for ID:', id);
    console.log('📝 Update data:', { name, email, phone, bio: bio || null });
    
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        bio: bio || null,
        email: email || null,
        phone: phone || null,
        profileImage: profileImageUrl,
      },
    });
    
    console.log('✅ Profile updated successfully');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
      },
      profileImage: profileImageUrl,
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email address is already taken by another user' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 