import { messages } from '@app/shared/messages.shared';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import AppLogger from '../logger/app-logger';
import { AbstractAuthSvc } from '@app/modules/auth/auth.abstract';
import { DecoratorConstant } from '../constants/decorator.constant';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly _authSvc: AbstractAuthSvc,
		private readonly _logger: AppLogger
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const secured = this.reflector.get<string>(DecoratorConstant.SECURED, context.getHandler());

			// If the API is not marked as secured, return true
			if (!secured) {
				return true;
			}

			const request = context.switchToHttp().getRequest();
			const bearerToken = request.headers['authorization'];
			// Check if the token is present in the headers
			if (!bearerToken) {
				throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
			}

			// Extract the token from the header
			const token = bearerToken.replace('Bearer', '').trim();

			// Validate the token
			const svcRes = await this._authSvc.validateToken(token);

			// If token validation fails, return unauthorized
			if (svcRes.code !== HttpStatus.OK) {
				throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
			}

			// Attach the claims to the request for further processing
			request.claims = svcRes.data;

			return true;
		} catch (error) {
			this._logger.error(error.stack, HttpStatus.UNAUTHORIZED);
			throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
		}
	}
}
