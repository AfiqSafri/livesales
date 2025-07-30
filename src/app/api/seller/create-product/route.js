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
    
    const { name, description, price, sellerId, quantity, shippingPrice } = fields;
    const imageFiles = files.filter(f => f.name === 'images');
    
    if (!name || !description || !price || !sellerId || !quantity || !shippingPrice || imageFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.toString(),
        description: description.toString(),
        price: parseFloat(price.toString()),
        quantity: parseInt(quantity.toString()),
        shippingPrice: parseFloat(shippingPrice.toString()),
        image: '', // legacy, not used
        sellerId: parseInt(sellerId.toString()),
      },
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