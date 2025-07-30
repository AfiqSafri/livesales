import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir, unlink } from 'fs/promises';
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
      productId, 
      name, 
      description, 
      price, 
      quantity, 
      shippingPrice, 
      sellerId,
      imagesToDelete 
    } = fields;

    if (!productId || !name || !description || !price || !quantity || !shippingPrice || !sellerId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Ensure the product belongs to the seller
    const product = await prisma.product.findUnique({ 
      where: { id: Number(productId) },
      include: { images: true }
    });
    
    if (!product || product.sellerId !== Number(sellerId)) {
      return new Response(JSON.stringify({ error: 'Product not found or unauthorized' }), { status: 404 });
    }

    // Update product basic info
    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: { 
        name: name.toString(),
        description: description.toString(),
        price: parseFloat(price.toString()),
        quantity: parseInt(quantity.toString()),
        shippingPrice: parseFloat(shippingPrice.toString()),
      },
    });

    // Handle image deletions
    if (imagesToDelete) {
      const imagesToDeleteArray = JSON.parse(imagesToDelete.toString());
      if (imagesToDeleteArray.length > 0) {
        // Get the images to delete
        const imagesToRemove = await prisma.productImage.findMany({
          where: { id: { in: imagesToDeleteArray } }
        });

        // Delete the files from disk
        for (const img of imagesToRemove) {
          const filePath = path.join(process.cwd(), 'public', img.url);
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        }

        // Delete from database
        await prisma.productImage.deleteMany({
          where: { id: { in: imagesToDeleteArray } }
        });
      }
    }

    // Handle new image uploads
    let newImages = [];
    const imageFiles = files.filter(f => f.name === 'images');
    
    for (const fileObj of imageFiles.slice(0, 3)) {
      const file = fileObj.file;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const ext = path.extname(file.name || '.jpg');
      const filename = `product_${productId}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await writeFile(filepath, buffer);
      const url = `/uploads/${filename}`;
      
      const imageRecord = await prisma.productImage.create({
        data: { url, productId: Number(productId) },
      });
      newImages.push(imageRecord);
    }

    // Get updated product with images
    const finalProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { images: true }
    });

    return new Response(JSON.stringify({ 
      product: finalProduct,
      newImages 
    }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 