import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'https://1159-realty-uploads.nyc3.digitaloceanspaces.com/uploads/123/id-image.jpg' })
  url: string;

  @ApiProperty({ example: 'File uploaded successfully' })
  message: string;
}
