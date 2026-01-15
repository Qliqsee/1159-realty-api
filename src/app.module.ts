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
import { PaymentsModule } from './payments/payments.module';
import { CronModule } from './cron/cron.module';
import { SalesTargetsModule } from './sales-targets/sales-targets.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CasesModule } from './cases/cases.module';
import { RequirementsModule } from './requirements/requirements.module';
import { SupportModule } from './support/support.module';
import { DisbursementsModule } from './disbursements/disbursements.module';
import { DisbursementConfigModule } from './disbursement-config/disbursement-config.module';
import { InterestsModule } from './interests/interests.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminsModule } from './admins/admins.module';
import { ClientsModule } from './clients/clients.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CommonModule } from './common/common.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
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
    DisbursementsModule,
    DisbursementConfigModule,
    PaymentsModule,
    CronModule,
    SalesTargetsModule,
    SchedulesModule,
    AppointmentsModule,
    CasesModule,
    RequirementsModule,
    SupportModule,
    InterestsModule,
    CampaignsModule,
    DashboardModule,
    AdminsModule,
    ClientsModule,
    PermissionsModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
