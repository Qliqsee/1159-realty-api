import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { PrismaService } from '../prisma.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  providers: [SupportService, PrismaService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
