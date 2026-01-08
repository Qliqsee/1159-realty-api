import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { EmailModule } from './email/email.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { KycModule } from './kyc/kyc.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { LeadsModule } from './leads/leads.module';
import { PartnershipModule } from './partnership/partnership.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CommissionsModule } from './commissions/commissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    EmailModule,
    PasswordResetModule,
    FileUploadModule,
    KycModule,
    PropertiesModule,
    UnitsModule,
    LeadsModule,
    PartnershipModule,
    EnrollmentsModule,
    InvoicesModule,
    CommissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
