import { BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  allowedTypes: string[];
  maxSizeMB: number;
}

export class FileTypeValidator {
  static validate(
    file: Express.Multer.File,
    options: FileValidationOptions,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
      );
    }

    // Validate file size
    const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${options.maxSizeMB}MB`,
      );
    }
  }
}
