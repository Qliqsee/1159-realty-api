import { Module } from '@nestjs/common';
import { RequirementsService } from './requirements.service';
import { RequirementsController } from './requirements.controller';
import { PrismaService } from '../prisma.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  providers: [RequirementsService, PrismaService],
  controllers: [RequirementsController],
  exports: [RequirementsService],
})
export class RequirementsModule {}
