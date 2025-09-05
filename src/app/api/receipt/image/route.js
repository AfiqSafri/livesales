import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }

    // Security check - only allow receipt files
    if (!fileName.startsWith('receipt_') || !fileName.match(/\.(jpg|jpeg|png|gif|webp|jfif)$/i)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', 'receipts', fileName);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Determine content type based on file extension
      const extension = fileName.split('.').pop().toLowerCase();
      let contentType = 'image/jpeg'; // default
      
      switch (extension) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'jfif':
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
      }
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Receipt image serve error:', error);
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
}
