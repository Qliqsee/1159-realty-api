import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('File Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('id-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload ID document image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadIdImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<UploadResponseDto> {
    const userId = req.user.userId;
    const { url } = await this.fileUploadService.uploadIdImage(file, userId);
    return {
      url,
      message: 'ID image uploaded successfully',
    };
  }

  @Post('profile-picture')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<UploadResponseDto> {
    const userId = req.user.userId;
    const { url } = await this.fileUploadService.uploadProfilePicture(
      file,
      userId,
    );
    return {
      url,
      message: 'Profile picture uploaded successfully',
    };
  }

  @Post('property-media')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload property media (images/videos) - Max 1MB' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Property media file (image or video, max 1MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Property media uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size (max 1MB)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadPropertyMedia(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const { url } = await this.fileUploadService.uploadPropertyMedia(file);
    return {
      url,
      message: 'Property media uploaded successfully',
    };
  }
}
