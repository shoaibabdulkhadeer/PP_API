import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractAuthSqlDao {
	abstract getEmpByUname(Username: any, currentTimeStamp: any): Promise<AppResponse>;
	abstract getUserByCom(email: any): Promise<AppResponse>;
	abstract createLogSession(session: any): Promise<AppResponse>;
	abstract logoutSession(claims: JwtToken, EndsAt: any): Promise<AppResponse>;
	abstract updateEnd(claims: any, roleid: any): Promise<AppResponse>;
	abstract switchRolesDao(claims: any, roleid: any): Promise<AppResponse>;
	abstract isDefaultUpdateDao(claims: any, roleid: any): Promise<AppResponse>;
	abstract getEmpRolesDao(claims: any): Promise<AppResponse>;
}
