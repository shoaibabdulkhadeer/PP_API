import { AppResponse } from '@app/shared/appresponse.shared';
import { LoginDto } from './dto/auth.dto';
import { JwtToken } from './models/jwt_token.model';

export abstract class AbstractAuthSvc {
	abstract employeeLoginSvc(empInfo: any): Promise<AppResponse>;
	abstract employeeLogoutSvc(claims: JwtToken): Promise<AppResponse>;
	abstract validateToken(token: any): Promise<AppResponse>;
	abstract switchRolesSvc(claims: any, roleid: any, roleName: any): Promise<AppResponse>;
	abstract isDefaultUpdateSvc(claims: any, roleid: any): Promise<AppResponse>;
	abstract getEmployeeRolesSvc(claims: JwtToken): Promise<AppResponse>;
}
