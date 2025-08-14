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
      productId,
      name, 
      description, 
      price, 
      sellerId, 
      quantity, 
      shippingPrice,
      hasDiscount,
      discountPercentage,
      discountType,
      discountEndDate,
      imagesToDelete
    } = fields;
    const imageFiles = files.filter(f => f.name === 'images');
    
    if (!productId || !name || !description || !price || !sellerId || !quantity || !shippingPrice) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'Please fill in all required fields'
      }), { status: 400 });
    }

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: parseInt(productId.toString()),
        sellerId: parseInt(sellerId.toString())
      }
    });

    if (!existingProduct) {
      return new Response(JSON.stringify({ 
        error: 'Product not found or unauthorized',
        details: 'The product you are trying to update does not exist or you do not have permission to update it'
      }), { status: 404 });
    }

    // Validate discount fields
    const hasDiscountBool = hasDiscount === 'true';
    if (hasDiscountBool) {
      if (!discountPercentage || parseFloat(discountPercentage) <= 0) {
        return new Response(JSON.stringify({ 
          error: 'Invalid discount amount',
          details: 'Please enter a valid discount amount greater than 0'
        }), { status: 400 });
      }
      
      const discountPercent = parseFloat(discountPercentage);
      const originalPrice = parseFloat(price);
      
      if (discountType === 'percentage' && discountPercent > 100) {
        return new Response(JSON.stringify({ 
          error: 'Discount percentage too high',
          details: 'Discount percentage cannot exceed 100%'
        }), { status: 400 });
      }
      
      if (discountType === 'fixed' && discountPercent >= originalPrice) {
        return new Response(JSON.stringify({ 
          error: 'Fixed discount too high',
          details: 'Fixed discount cannot be greater than or equal to the original price'
        }), { status: 400 });
      }
    }
    
    // Update product
    const productData = {
      name: name.toString(),
      description: description.toString(),
      price: parseFloat(price.toString()),
      quantity: parseInt(quantity.toString()),
      shippingPrice: parseFloat(shippingPrice.toString()),
      hasDiscount: hasDiscountBool,
      discountPercentage: hasDiscountBool ? parseFloat(discountPercentage.toString()) : null,
      discountType: hasDiscountBool ? discountType.toString() : null,
      discountEndDate: hasDiscountBool && discountEndDate ? new Date(discountEndDate.toString()) : null,
    };

    const product = await prisma.product.update({
      where: { id: parseInt(productId.toString()) },
      data: productData,
    });

    // Handle image deletions
    if (imagesToDelete) {
      const imagesToDeleteArray = JSON.parse(imagesToDelete.toString());
      if (imagesToDeleteArray.length > 0) {
        await prisma.productImage.deleteMany({
          where: {
            id: { in: imagesToDeleteArray }
          }
        });
      }
    }
    
    // Handle new image uploads to Cloudinary
    const imageRecords = [];
    if (imageFiles.length > 0) {
      for (const fileObj of imageFiles.slice(0, 3)) {
        const file = fileObj.file;
        try {
          // Convert file to base64 for Cloudinary
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64String = buffer.toString('base64');
          const dataURI = `data:${file.type};base64,${base64String}`;
          
          // Upload to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'livesales/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });
          
          // Create ProductImage record with Cloudinary URL
          const rec = await prisma.productImage.create({
            data: { 
              url: uploadResult.secure_url, 
              productId: product.id 
            },
          });
          imageRecords.push(rec);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // If Cloudinary upload fails, create a placeholder image record
          const placeholderUrl = `https://via.placeholder.com/400x400/cccccc/666666?text=Image+Upload+Failed`;
          const rec = await prisma.productImage.create({
            data: { 
              url: placeholderUrl, 
              productId: product.id 
            },
          });
          imageRecords.push(rec);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      product, 
      images: imageRecords,
      message: imageRecords.length > 0 ? 'Product updated successfully with Cloudinary images' : 'Product updated successfully'
    }), { status: 200 });
    
  } catch (e) {
    console.error('Error updating product:', e);
    
    // Provide more specific error messages
    if (e.code === 'P2002') {
      return new Response(JSON.stringify({ 
        error: 'Duplicate product name',
        details: 'A product with this name already exists'
      }), { status: 400 });
    }
    
    if (e.code === 'P2003') {
      return new Response(JSON.stringify({ 
        error: 'Invalid seller reference',
        details: 'The seller ID provided is not valid'
      }), { status: 400 });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while updating the product'
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 