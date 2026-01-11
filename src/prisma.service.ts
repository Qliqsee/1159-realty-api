import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();

    // Log database connection info (sanitized)
    const dbUrl = process.env.DATABASE_URL || '';
    const urlMatch = dbUrl.match(/postgresql:\/\/[^:]+:[^@]+@([^\/]+)\/([^?]+)/);

    if (urlMatch) {
      const [, host, database] = urlMatch;
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      this.logger.log(`Connected to database: ${database} at ${host} ${isLocal ? '(LOCAL)' : '(REMOTE)'}`);
    } else {
      this.logger.log('Database connected');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
