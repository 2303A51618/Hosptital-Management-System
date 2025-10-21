import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePdf = async (bill) => {
  const doc = new PDFDocument({ margin: 50 });
  const tmpPath = path.join(__dirname, `../../tmp/invoice-${bill._id}.pdf`);
  await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true });
  const stream = fs.createWriteStream(tmpPath);
  doc.pipe(stream);

  doc.fontSize(20).text('Hospital Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Bill ID: ${bill._id}`);
  doc.text(`Patient: ${bill.patient?.name || ''}`);
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`);
  doc.moveDown();

  bill.items.forEach((it) => {
    doc.text(`${it.label} x${it.quantity} - ${it.amount}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ${bill.subtotal}`);
  doc.text(`Tax (${bill.taxPercent}%): ${bill.taxAmount}`);
  doc.text(`Total: ${bill.total}`);

  doc.end();

  await new Promise((res) => stream.on('finish', res));
  const uploaded = await uploadToCloudinary(tmpPath, 'hms/invoices');
  await fs.promises.unlink(tmpPath);
  return uploaded;
};
