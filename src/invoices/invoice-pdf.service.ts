import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface InvoicePdfData {
  invoiceId: string;
  invoiceNumber: number;
  invoiceDate: Date;
  dueDate: Date;
  status: string;

  // Client info
  clientName?: string;
  clientEmail?: string;

  // Property info
  propertyName: string;

  // Agent info
  agentName: string;

  // Partner info (if applicable)
  partnerName?: string;

  // Payment info
  installmentNumber: number;
  amount: number;
  overdueFee: number;
  totalAmount: number;
  amountPaid: number;

  // Payment details (if paid)
  paidAt?: Date;
  paymentReference?: string;
}

@Injectable()
export class InvoicePdfService {
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(20)
          .text('INVOICE', 50, 50, { align: 'right' })
          .fontSize(10)
          .text(`Invoice #: ${data.invoiceId}`, { align: 'right' })
          .text(`Date: ${this.formatDate(data.invoiceDate)}`, { align: 'right' })
          .moveDown();

        // Company Info (left side)
        doc
          .fontSize(12)
          .text('1159 Realty', 50, 50)
          .fontSize(10)
          .text('Real Estate Management', 50, 70)
          .moveDown();

        // Status Badge
        doc
          .fontSize(12)
          .fillColor(this.getStatusColor(data.status))
          .text(`Status: ${data.status}`, 50, 120)
          .fillColor('#000000')
          .moveDown();

        // Client Information
        doc
          .fontSize(14)
          .text('Bill To:', 50, 160)
          .fontSize(10)
          .text(data.clientName || 'Client Not Assigned', 50, 180)
          .text(data.clientEmail || '', 50, 195)
          .moveDown();

        // Property and Agent Information
        doc
          .fontSize(14)
          .text('Property Details:', 320, 160)
          .fontSize(10)
          .text(`Property: ${data.propertyName}`, 320, 180)
          .text(`Agent: ${data.agentName}`, 320, 195);

        if (data.partnerName) {
          doc.text(`Partner: ${data.partnerName}`, 320, 210);
        }

        doc.moveDown(2);

        // Invoice Details Table
        const tableTop = 280;
        doc
          .fontSize(12)
          .text('Invoice Details', 50, tableTop)
          .moveDown(0.5);

        // Table headers
        const itemY = tableTop + 30;
        doc
          .fontSize(10)
          .text('Description', 50, itemY, { width: 200 })
          .text('Amount', 320, itemY, { width: 100, align: 'right' });

        // Draw line
        doc
          .moveTo(50, itemY + 20)
          .lineTo(550, itemY + 20)
          .stroke();

        // Table rows
        let currentY = itemY + 30;

        // Installment
        doc
          .fontSize(10)
          .text(`Installment #${data.installmentNumber}`, 50, currentY, { width: 200 })
          .text(`₦${this.formatCurrency(data.amount)}`, 320, currentY, { width: 100, align: 'right' });

        currentY += 25;

        // Overdue fee (if applicable)
        if (data.overdueFee > 0) {
          doc
            .text('Overdue Fee', 50, currentY, { width: 200 })
            .text(`₦${this.formatCurrency(data.overdueFee)}`, 320, currentY, { width: 100, align: 'right' });
          currentY += 25;
        }

        // Draw line before total
        doc
          .moveTo(320, currentY)
          .lineTo(550, currentY)
          .stroke();

        currentY += 10;

        // Total
        doc
          .fontSize(12)
          .text('Total Amount', 50, currentY, { width: 200 })
          .text(`₦${this.formatCurrency(data.totalAmount)}`, 320, currentY, { width: 100, align: 'right' });

        currentY += 30;

        // Payment Information
        if (data.status === 'PAID' && data.paidAt) {
          doc
            .fontSize(12)
            .text('Payment Information', 50, currentY)
            .fontSize(10)
            .moveDown(0.5)
            .text(`Paid On: ${this.formatDate(data.paidAt)}`, 50)
            .text(`Payment Reference: ${data.paymentReference || 'N/A'}`, 50)
            .text(`Amount Paid: ₦${this.formatCurrency(data.amountPaid)}`, 50)
            .moveDown();
        } else {
          doc
            .fontSize(10)
            .text(`Due Date: ${this.formatDate(data.dueDate)}`, 50, currentY)
            .moveDown();
        }

        // Footer
        const footerY = 700;
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text('Thank you for your business!', 50, footerY, { align: 'center' })
          .text('For inquiries, please contact support@1159realty.com', 50, footerY + 15, { align: 'center' })
          .fillColor('#000000');

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'OVERDUE':
        return '#dc3545';
      case 'CANCELLED':
        return '#6c757d';
      default:
        return '#000000';
    }
  }
}
