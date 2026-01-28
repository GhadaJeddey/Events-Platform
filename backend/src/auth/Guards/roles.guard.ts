import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        console.log('User in RolesGuard:', user);
        console.log('Required Roles:', requiredRoles);

        if (!user || !user.role) {
            console.log('No user or role found in request');
            return false;
        }

        // Case-insensitive role comparison
        const userRoleLower = user.role.toLowerCase();
        const hasRole = requiredRoles.some((role) => role.toLowerCase() === userRoleLower);
        console.log('Has Required Role:', hasRole);
        return hasRole;
    }
}
