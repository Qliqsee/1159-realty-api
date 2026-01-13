import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T = any> {
  @ApiProperty({
    description: 'Response message',
    example: 'success'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  code: number;

  @ApiProperty({
    description: 'Response data',
    required: false
  })
  data?: T;

  constructor(message: string, code: number, data?: T) {
    this.message = message;
    this.code = code;
    this.data = data;
  }
}

export class ApiErrorResponse {
  @ApiProperty({
    description: 'Error message',
    example: 'fail'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  code: number;

  @ApiProperty({
    description: 'Error details',
    required: false
  })
  data?: any;

  constructor(message: string, code: number, data?: any) {
    this.message = message;
    this.code = code;
    this.data = data;
  }
}
