import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ 
        error: 'No file provided',
        details: 'Please select a file to upload'
      }), { status: 400 });
    }

    // Check if we're in production (Vercel)
    const isProduction = process.env.VERCEL === '1';
    
    if (isProduction) {
      try {
        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'livesales/uploads',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        return new Response(JSON.stringify({
          url: uploadResult.secure_url,
          filename: uploadResult.public_id,
          message: 'File uploaded successfully to Cloudinary'
        }), { status: 200 });
        
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // If Cloudinary upload fails, return a placeholder URL
        const filename = `placeholder_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        
        return new Response(JSON.stringify({
          url: `/api/placeholder-image?text=${encodeURIComponent(file.name || 'Product Image')}&size=400x400`,
          filename: filename,
          message: 'Cloudinary upload failed. Using placeholder image.'
        }), { status: 200 });
      }
      
    } else {
      // Development mode - return Cloudinary URL for consistency
      try {
        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'livesales/uploads',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        return new Response(JSON.stringify({
          url: uploadResult.secure_url,
          filename: uploadResult.public_id,
          message: 'File uploaded successfully to Cloudinary'
        }), { status: 200 });
        
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return new Response(JSON.stringify({ 
          error: 'Upload failed',
          details: 'Failed to upload to Cloudinary. Please check your configuration.'
        }), { status: 500 });
      }
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error.message 
    }), { status: 500 });
  }
}
