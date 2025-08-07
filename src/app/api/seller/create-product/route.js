import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

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
      name, 
      description, 
      price, 
      sellerId, 
      quantity, 
      shippingPrice,
      hasDiscount,
      discountPercentage,
      discountType,
      discountEndDate
    } = fields;
    const imageFiles = files.filter(f => f.name === 'images');
    
    if (!name || !description || !price || !sellerId || !quantity || !shippingPrice || imageFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate discount fields
    const hasDiscountBool = hasDiscount === 'true';
    if (hasDiscountBool) {
      if (!discountPercentage || parseFloat(discountPercentage) <= 0) {
        return new Response(JSON.stringify({ error: 'Please enter a valid discount amount' }), { status: 400 });
      }
      
      const discountPercent = parseFloat(discountPercentage);
      const originalPrice = parseFloat(price);
      
      if (discountType === 'percentage' && discountPercent > 100) {
        return new Response(JSON.stringify({ error: 'Discount percentage cannot exceed 100%' }), { status: 400 });
      }
      
      if (discountType === 'fixed' && discountPercent >= originalPrice) {
        return new Response(JSON.stringify({ error: 'Fixed discount cannot be greater than or equal to the original price' }), { status: 400 });
      }
    }
    
    // Create product
    const productData = {
      name: name.toString(),
      description: description.toString(),
      price: parseFloat(price.toString()),
      quantity: parseInt(quantity.toString()),
      shippingPrice: parseFloat(shippingPrice.toString()),
      image: '', // legacy, not used
      sellerId: parseInt(sellerId.toString()),
      hasDiscount: hasDiscountBool,
      discountPercentage: hasDiscountBool ? parseFloat(discountPercentage.toString()) : null,
      discountType: hasDiscountBool ? discountType.toString() : null,
      discountEndDate: hasDiscountBool && discountEndDate ? new Date(discountEndDate.toString()) : null,
    };

    const product = await prisma.product.create({
      data: productData,
    });
    
    // Save images and create ProductImage records
    const imageRecords = [];
    for (const fileObj of imageFiles.slice(0, 3)) {
      const file = fileObj.file;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = path.extname(file.name || '.jpg');
      const filename = `product_${product.id}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      const url = `/uploads/${filename}`;
      
      const rec = await prisma.productImage.create({
        data: { url, productId: product.id },
      });
      imageRecords.push(rec);
    }
    
    return new Response(JSON.stringify({ product, images: imageRecords }), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 