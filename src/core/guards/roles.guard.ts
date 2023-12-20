import { DecoratorConstant } from '@app/core/constants/decorator.constant';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '../enums/app-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<RoleType[]>(DecoratorConstant.HAS_ROLES, context.getHandler());

		/*If API is not authorized return true always*/
		if (!roles || !roles.length) {
			return true;
		}

		const req = context.switchToHttp().getRequest();

		const userRoles = req.claims.RoleName;

		// const isAuthorized = userRoles.some((userRole: any) => roles.includes(userRole));
		const isAuthorized = roles.includes(userRoles);

		if (!isAuthorized) {
			throw new HttpException(messageFactory(messages.E3, [req.url]), HttpStatus.FORBIDDEN);
		}

		return true;
	}
}
