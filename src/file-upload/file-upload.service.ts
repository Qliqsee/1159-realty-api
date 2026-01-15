import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileTypeValidator } from './validators/file-type.validator';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    const region = this.configService.get<string>('DO_SPACES_REGION');
    const key = this.configService.get<string>('DO_SPACES_KEY');
    const secret = this.configService.get<string>('DO_SPACES_SECRET');

    this.s3Client = new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: key,
        secretAccessKey: secret,
      },
      forcePathStyle: false,
    });
  }

  async uploadIdImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string }> {
    const allowedTypes = this.configService
      .get<string>('ALLOWED_IMAGE_TYPES')
      ?.split(',') || ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeMB = this.configService.get<number>('MAX_FILE_SIZE_MB') || 5;

    // Validate file
    FileTypeValidator.validate(file, { allowedTypes, maxSizeMB });

    // Upload to DO Spaces
    const url = await this.uploadToSpaces(file, 'id-images', userId);

    this.logger.log(`ID image uploaded for user ${userId}: ${url}`);

    return { url };
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string }> {
    const allowedTypes = this.configService
      .get<string>('ALLOWED_IMAGE_TYPES')
      ?.split(',') || ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSizeMB = this.configService.get<number>('MAX_FILE_SIZE_MB') || 5;

    // Validate file
    FileTypeValidator.validate(file, { allowedTypes, maxSizeMB });

    // Upload to DO Spaces
    const url = await this.uploadToSpaces(file, 'profile-pictures', userId);

    this.logger.log(`Profile picture uploaded for user ${userId}: ${url}`);

    return { url };
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string }> {
    const allowedTypes = this.configService
      .get<string>('ALLOWED_DOCUMENT_TYPES')
      ?.split(',') || [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
    const maxSizeMB = this.configService.get<number>('MAX_DOCUMENT_SIZE_MB') || 10;

    // Validate file
    FileTypeValidator.validate(file, { allowedTypes, maxSizeMB });

    // Upload to DO Spaces
    const url = await this.uploadToSpaces(file, folder, randomUUID());

    this.logger.log(`Document uploaded to ${folder}: ${url}`);

    return { url };
  }

  async uploadPropertyMedia(
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const allowedTypes = [
      ...this.configService
        .get<string>('ALLOWED_IMAGE_TYPES')
        ?.split(',') || ['image/jpeg', 'image/png', 'image/jpg'],
      ...this.configService
        .get<string>('ALLOWED_VIDEO_TYPES')
        ?.split(',') || ['video/mp4', 'video/quicktime'],
    ];
    const maxSizeMB = this.configService.get<number>('MAX_PROPERTY_MEDIA_SIZE_MB') || 1;

    // Validate file
    FileTypeValidator.validate(file, { allowedTypes, maxSizeMB });

    // Upload to DO Spaces
    const url = await this.uploadToSpaces(file, 'property-media', randomUUID());

    this.logger.log(`Property media uploaded: ${url}`);

    return { url };
  }

  private async uploadToSpaces(
    file: Express.Multer.File,
    folder: string,
    userId: string,
  ): Promise<string> {
    const bucket = this.configService.get<string>('DO_SPACES_BUCKET');
    const cdnUrl = this.configService.get<string>('DO_CDN_URL');
    const region = this.configService.get<string>('DO_SPACES_REGION');

    const fileName = `${randomUUID()}-${file.originalname}`;
    const key = `${folder}/${userId}/${fileName}`;

    this.logger.debug(`Uploading file to DO Spaces: ${key}`);

    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read' as const,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      // Return CDN URL if available, otherwise construct direct URL
      const fileUrl = cdnUrl
        ? `${cdnUrl}/${key}`
        : `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;

      this.logger.log(`File uploaded successfully: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file to DO Spaces: ${error.message}`);
      throw error;
    }
  }
}
