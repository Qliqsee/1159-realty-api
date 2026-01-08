import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileTypeValidator } from './validators/file-type.validator';
import { randomUUID } from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private configService: ConfigService) {}

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

    // Upload to DO Spaces (mocked)
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

    // Upload to DO Spaces (mocked)
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

    // Upload to DO Spaces (mocked)
    const url = await this.uploadToSpaces(file, folder, randomUUID());

    this.logger.log(`Document uploaded to ${folder}: ${url}`);

    return { url };
  }

  private async uploadToSpaces(
    file: Express.Multer.File,
    folder: string,
    userId: string,
  ): Promise<string> {
    // Mocked DigitalOcean Spaces upload
    const endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT');
    const bucket = this.configService.get<string>('DO_SPACES_BUCKET');
    const key = this.configService.get<string>('DO_SPACES_KEY');
    const secret = this.configService.get<string>('DO_SPACES_SECRET');
    const region = this.configService.get<string>('DO_SPACES_REGION');

    this.logger.debug(
      `[MOCKED] Uploading file to DO Spaces: ${folder}/${userId}/${file.originalname}`,
    );
    this.logger.debug(`[MOCKED] Endpoint: ${endpoint}`);
    this.logger.debug(`[MOCKED] Bucket: ${bucket}`);
    this.logger.debug(`[MOCKED] Region: ${region}`);
    this.logger.debug(`[MOCKED] Credentials configured: ${!!key && !!secret}`);

    // Generate fake URL
    const fileName = `${randomUUID()}-${file.originalname}`;
    const fakeUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${folder}/${userId}/${fileName}`;

    // TODO: Replace with actual DO Spaces upload using AWS S3 SDK
    // Example:
    // const s3Client = new S3Client({
    //   endpoint: endpoint,
    //   region: region,
    //   credentials: {
    //     accessKeyId: key,
    //     secretAccessKey: secret,
    //   },
    // });
    //
    // const uploadParams = {
    //   Bucket: bucket,
    //   Key: `${folder}/${userId}/${fileName}`,
    //   Body: file.buffer,
    //   ACL: 'public-read',
    //   ContentType: file.mimetype,
    // };
    //
    // const command = new PutObjectCommand(uploadParams);
    // await s3Client.send(command);

    return fakeUrl;
  }
}
