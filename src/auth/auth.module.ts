import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAdminStrategy } from './strategies/google-admin.strategy';
import { ClientsModule } from '../clients/clients.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ClientsModule,
    AdminsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy, GoogleAdminStrategy],
  exports: [AuthService],
})
export class AuthModule {}
