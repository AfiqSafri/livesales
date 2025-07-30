import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const bio = formData.get('bio');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const profileImage = formData.get('profileImage');

    if (!id || !name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let profileImageUrl = null;

    if (profileImage && profileImage.size > 0) {
      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
      }
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileExtension = path.extname(profileImage.name);
      const filename = `profile_${id}_${timestamp}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      const bytes = await profileImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      profileImageUrl = `/uploads/profiles/${filename}`;
    }

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
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 