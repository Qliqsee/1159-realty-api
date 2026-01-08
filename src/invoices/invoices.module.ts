import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService, PrismaService],
})
export class InvoicesModule {}
