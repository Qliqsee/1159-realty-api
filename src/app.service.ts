import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: '1159 Realty API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
