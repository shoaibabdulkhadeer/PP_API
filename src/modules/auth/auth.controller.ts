import { Body, Controller, Get, Patch, Post, Req, Res, Param, Query } from '@nestjs/common';
import { AbstractAuthSvc } from './auth.abstract';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/auth.dto';
import { AppResponse } from '@app/shared/appresponse.shared';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { getClientIp } from 'request-ip';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Auth')
export class AuthController {
	constructor(private readonly authService: AbstractAuthSvc) {}

	//#region To login
	@Post('login')
	async employeeLogin(@Req() req: any, @Body() empInfo: any) {
		const getSvc = await this.authService.employeeLoginSvc(empInfo);
		return getSvc;
	}
	//#endregion

	//#region To Logout
	@Authorize()
	@Patch('logout')
	logout(@Req() req: any): Promise<AppResponse> {
		return this.authService.employeeLogoutSvc(req.claims);
	}
	//#endregion

	//#region Switch Roles
	@Authorize()
	@Post('switch-roles')
	@ApiOperation({ summary: 'Switch Roles' })
	@ApiQuery({ name: 'roleid', type: 'string', required: true })
	@ApiQuery({ name: 'roleName', type: 'string', required: true })
	switchRoles(@Req() req: any, @Query('roleid') roleid: Number, @Query('roleName') roleName: string): Promise<AppResponse> {
		return this.authService.switchRolesSvc(req.claims, roleid, roleName);
	}
	//#endregion

	//#region isDefaultupdate
	@Authorize()
	@Patch('isDefault-update/:roleid')
	isDefaultUpdate(@Param('roleid') roleid: string, @Req() req: any): Promise<AppResponse> {
		return this.authService.isDefaultUpdateSvc(req.claims, roleid);
	}
	//#endregion

	//#region Get Employee Roles
	@Authorize()
	@Get('get-Emp-Roles')
	async getEmployeeRoles(@Req() req: any): Promise<AppResponse> {
		return this.authService.getEmployeeRolesSvc(req.claims);
	}

	//#endregion
}
