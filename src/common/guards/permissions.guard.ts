import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!permission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: No roles found');
    }

    const roleNames = user.roles.map((r: any) => r.name);
    const hasPermission = await this.permissionsService.checkPermission(
      roleNames,
      permission.resource,
      permission.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: Missing permission ${permission.resource}:${permission.action}`,
      );
    }

    return true;
  }
}
