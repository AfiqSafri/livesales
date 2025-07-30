import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

function parseForm(req, uploadDir) {
  return new Promise((resolve, reject) => {
    const form = formidable({ uploadDir, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  try {
    const { fields, files } = await parseForm(req, uploadDir);
    const { orderId } = fields;
    const file = Array.isArray(files.receipt) ? files.receipt[0] : files.receipt;
    if (!orderId || !file) {
      return res.status(400).json({ error: 'Missing orderId or receipt file.' });
    }
    const filePath = `/uploads/receipts/${path.basename(file.filepath)}`;
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { receiptUrl: filePath },
    });
    return res.status(200).json({ success: true, url: filePath });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to upload receipt.' });
  }
} 