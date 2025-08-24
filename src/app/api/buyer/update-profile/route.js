import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const fields = {};
    const files = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push({ name: key, file: value });
      } else {
        fields[key] = value;
      }
    }
    
    const { 
      userId,
      name, 
      email, 
      phone, 
      address,
      profileImageToDelete
    } = fields;
    
    if (!userId || !name || !email) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Name and email are required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId.toString()) }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'The user you are trying to update does not exist'
      }, { status: 404 });
    }

    // Handle profile image deletion (if needed, we can clear the profileImage field)
    if (profileImageToDelete) {
      // Clear the profileImage field in the User model
      await prisma.user.update({
        where: { id: parseInt(userId.toString()) },
        data: { profileImage: null }
      });
    }
    
    // Handle new profile image upload to Cloudinary
    let profileImageUrl = null;
    const profileImageFile = files.find(f => f.name === 'profileImage');
    
    if (profileImageFile) {
      try {
        const file = profileImageFile.file;
        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'livesales/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        });
        
        profileImageUrl = uploadResult.secure_url;
        
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary upload fails, use a placeholder image
        profileImageUrl = `https://via.placeholder.com/400x400/cccccc/666666?text=Profile+Upload+Failed`;
      }
    }
    
    // Update user profile including profile image
    const userData = {
      name: name.toString(),
      email: email.toString(),
      phone: phone ? phone.toString() : null,
      address: address ? address.toString() : null,
      ...(profileImageUrl && { profileImage: profileImageUrl }), // Only update if we have a new image
    };

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId.toString()) },
      data: userData,
    });
    
    return NextResponse.json({ 
      user: updatedUser,
      profileImageUrl,
      message: profileImageUrl ? 'Profile updated successfully with Cloudinary image' : 'Profile updated successfully'
    });
    
  } catch (e) {
    console.error('Error updating profile:', e);
    
    // Provide more specific error messages
    if (e.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Email already exists',
        details: 'This email address is already registered by another user'
      }, { status: 400 });
    }
    
    if (e.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Invalid user reference',
        details: 'The user ID provided is not valid'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while updating the profile'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 