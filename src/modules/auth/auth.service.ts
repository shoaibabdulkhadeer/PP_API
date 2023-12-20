import { AppConfigService } from '@app/config/appconfig.service';
import { DatabaseService } from '@app/database/database.service';
import { AbstractAuthSqlDao } from '@app/database/mssql/abstract/auth.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractAuthSvc } from './auth.abstract';
import { LoginDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { messages } from '@app/shared/messages.shared';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { AppSessionModel } from './models/log.app_session.model';
import { JwtToken } from './models/jwt_token.model';
import AppLogger from '@app/core/logger/app-logger';
import { stringify } from 'qs';
import ext_api_call from '@app/shared/restapi-request.shared';
import { decryptPassword } from '@app/shared/decryption.shared';
import axios from 'axios';

@Injectable()
export class AuthService implements AbstractAuthSvc {
	private readonly _authDao: AbstractAuthSqlDao;

	constructor(
		readonly _dbSvc: DatabaseService,
		private _jwtService: JwtService,
		readonly _loggerSvc: AppLogger,
		private readonly _appConfigSvc: AppConfigService
	) {
		this._authDao = _dbSvc.authSqlTxn;
	}

	//#region generate access token
	async generateAccessToken(tokenData: JwtToken): Promise<AppResponse> {
		try {
			const token = await this._jwtService.signAsync(tokenData, {
				secret: process.env.JWT_ACCESS_TOKEN_SECRET,
				expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_TIMEMIN
			});
			return createResponse(HttpStatus.OK, messages.S4, token);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async generateMicrosoftAccessToken(empCredentials: LoginDto): Promise<AppResponse> {
		try {
			const AadSsoCred = await this._appConfigSvc.get('authsso').aad,
				requestedtenantGuid = process.env.TENANT_ID,
				axiosData = stringify({	
					client_id: AadSsoCred.clientId,
					client_secret: AadSsoCred.clientSecret,
					code: empCredentials.authKey,
					grant_type: 'authorization_code',
					redirect_uri: empCredentials.state?.redirect_uri
				}),
				options = {
					method: 'POST',
					headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
					data: axiosData,
					url: `https://login.microsoftonline.com/${requestedtenantGuid}/oauth2/v2.0/token`
				},
				response = await ext_api_call(options);

			if (response?.status !== HttpStatus.OK) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
			}
			return createResponse(HttpStatus.OK, messages.S4, response.data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async microsoftProfile(accessToken: string): Promise<AppResponse> {
		try {
			const options = {
					method: 'GET',
					headers: { Authorization: `Bearer ${accessToken}` },
					url: 'https://graph.microsoft.com/v1.0/me'
				},
				response = await ext_api_call(options);

			if (response?.status !== HttpStatus.OK) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
			}
			return createResponse(HttpStatus.OK, messages.S4, response.data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async credLogin(empInfo: LoginDto): Promise<AppResponse> {
		try {
			const empInfoRes = await this._authDao.getEmpByUname(empInfo.Username, unix_ts_now());
			if (empInfoRes.code !== HttpStatus.OK) {
				return empInfoRes;
			}
			const pass: string = await decryptPassword(empInfo.Password);
			const hash = empInfoRes.data.Password;
			const passwordValid = await bcrypt.compare(pass, hash);

			if (!passwordValid) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W2);
			}
			const rolesDetails = empInfoRes.data.empRoleMappings.map((role: any) => {
				return role.toJSON();
			});
			const roles = rolesDetails.map((role: any) => {
				return {
					roleId: role.RoleID,
					IsDefault: role.IsDefault,
					roleName: role.MasterRoleId.RoleName
				};
			});
			const defaultRole = roles.find((role: any) => role.IsDefault);
			const sid = uuidv4();
			const tokenData: JwtToken = {
				appSessionId: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				DepartmentId: empInfoRes.data.DepartmentId,
				Username: empInfoRes.data.Username,
				FullName: empInfoRes.data.FullName,
				RoleName: defaultRole.roleName
			};
			const tokenRes = await this.generateAccessToken(tokenData);
			if (tokenRes.code !== HttpStatus.OK) {
				return tokenRes;
			}

			const time_now = unix_ts_now();
			const session: AppSessionModel = {
				AppSessionGuID: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				RoleID: defaultRole.roleId,
				StartedAt: time_now,
				EndsAt: time_now + parseInt('1440', 10) * 60,
				CreatedBy: empInfoRes.data.EmployeeGuID,
				CreatedAt: unix_ts_now()
			};
			const logRes = await this._authDao.createLogSession(session);
			if (logRes.code !== HttpStatus.OK) {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
			const data = {
				token: tokenRes.data,
				role: defaultRole.roleName
			};
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region  validating Google ID token
	async validateGoogleIdToken(idToken: string) {
		try {
			const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);

			if (response.status !== 200) {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E8);
			}
			return response.data;
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region google signin
	async googlelogin(empInfo: any): Promise<AppResponse> {
		try {
			const { id_token } = empInfo.res.xc;
			const googleTokenInfo = await this.validateGoogleIdToken(id_token);

			if (!googleTokenInfo || !googleTokenInfo.email_verified) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W48);
			}

			const finduserbyCom = await this._authDao.getUserByCom(googleTokenInfo.email);
			if (!finduserbyCom.data) {
				return createResponse(HttpStatus.NOT_FOUND, messages.W49);
			}

			const Username = finduserbyCom.data;
			const empInfoRes = await this._authDao.getEmpByUname(Username, unix_ts_now());
			if (empInfoRes.code !== HttpStatus.OK) {
				return empInfoRes;
			}

			const rolesDetails = empInfoRes.data.empRoleMappings.map((role: any) => {
				return role.toJSON();
			});
			const roles = rolesDetails.map((role: any) => {
				return {
					roleId: role.RoleID,
					IsDefault: role.IsDefault,
					roleName: role.MasterRoleId.RoleName
				};
			});
			const defaultRole = roles.find((role: any) => role.IsDefault);
			const sid = uuidv4();
			const tokenData: JwtToken = {
				appSessionId: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				DepartmentId: empInfoRes.data.DepartmentId,
				Username: empInfoRes.data.Username,
				FullName: empInfoRes.data.FullName,
				RoleName: defaultRole.roleName
			};
			const tokenRes = await this.generateAccessToken(tokenData);
			if (tokenRes.code !== HttpStatus.OK) {
				return tokenRes;
			}

			const time_now = unix_ts_now();
			const session: AppSessionModel = {
				AppSessionGuID: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				RoleID: defaultRole.roleId,
				StartedAt: time_now,
				EndsAt: time_now + parseInt('1440', 10) * 60,
				CreatedBy: empInfoRes.data.EmployeeGuID,
				CreatedAt: unix_ts_now()
			};
			const logRes = await this._authDao.createLogSession(session);
			if (logRes.code !== HttpStatus.OK) {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
			const data = {
				token: tokenRes.data,
				role: defaultRole.roleName
			};
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region To login
	async msLogin(empInfo: LoginDto): Promise<AppResponse> {
		try {
			const mstokenRes = await this.generateMicrosoftAccessToken(empInfo);
			if (mstokenRes.code !== HttpStatus.OK) {
				return mstokenRes;
			}
			const ProfileRes = await this.microsoftProfile(mstokenRes?.data?.access_token);
			if (ProfileRes.code !== HttpStatus.OK) {
				return ProfileRes;
			}
			const profile = (({ userPrincipalName }) => ({ userPrincipalName }))(ProfileRes.data);

			const empInfoRes = await this._authDao.getEmpByUname(profile.userPrincipalName, unix_ts_now());
			if (empInfoRes.code !== HttpStatus.OK) {
				return empInfoRes;
			}
			const rolesDetails = empInfoRes.data.empRoleMappings.map((role: any) => {
				return role.toJSON();
			});
			const roles = rolesDetails.map((role: any) => {
				return {
					roleId: role.RoleID,
					IsDefault: role.IsDefault,
					roleName: role.MasterRoleId.RoleName
				};
			});
			const defaultRole = roles.find((role: any) => role.IsDefault);
			const sid = uuidv4();
			const tokenData: JwtToken = {
				appSessionId: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				DepartmentId: empInfoRes.data.DepartmentId,
				Username: empInfoRes.data.Username,
				FullName: empInfoRes.data.FullName,
				RoleName: defaultRole.roleName
			};
			const tokenRes = await this.generateAccessToken(tokenData);
			if (tokenRes.code !== HttpStatus.OK) {
				return tokenRes;
			}

			const time_now = unix_ts_now();
			const session: AppSessionModel = {
				AppSessionGuID: sid,
				EmployeeGuID: empInfoRes.data.EmployeeGuID,
				RoleID: defaultRole.roleId,
				StartedAt: time_now,
				EndsAt: time_now + parseInt('1440', 10) * 60,
				CreatedBy: empInfoRes.data.EmployeeGuID,
				CreatedAt: unix_ts_now()
			};
			const logRes = await this._authDao.createLogSession(session);
			if (logRes.code !== HttpStatus.OK) {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
			const data = {
				token: tokenRes.data,
				role: defaultRole.roleName
			};
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async employeeLoginSvc(empInfo: any): Promise<AppResponse> {
		try {
			switch (empInfo.authType) {
				case 'Microsoft': {
					return this.msLogin(empInfo);
				}
				case 'Credentials': {
					return this.credLogin(empInfo);
				}
				case 'Google': {
					return this.googlelogin(empInfo);
				}
				default: {
					return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
				}
			}
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region to logout
	async employeeLogoutSvc(claims: JwtToken): Promise<AppResponse> {
		try {
			const logoutRes = await this._authDao.logoutSession(claims, unix_ts_now());
			return logoutRes;
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Post
	async switchRolesSvc(claims: any, roleid: Number, roleName: String): Promise<AppResponse> {
		try {
			const sid = uuidv4();
			const tokenData: JwtToken = {
				appSessionId: sid,
				EmployeeGuID: claims.EmployeeGuID,
				DepartmentId: claims.DepartmentId,
				Username: claims.Username,
				FullName: claims.FullName,
				RoleName: roleName.toString()
			};

			const tokenResponse = await this.generateAccessToken(tokenData);

			if (tokenResponse.code !== HttpStatus.OK) {
				return tokenResponse;
			}

			const appSession = {
				AppSessionGuID: sid,
				EmployeeGuID: claims.EmployeeGuID,
				RoleID: roleid,
				StartedAt: unix_ts_now(),
				EndsAt: unix_ts_now() + parseInt('1440', 10) * 60,
				CreatedBy: claims.EmployeeGuID,
				CreatedAt: unix_ts_now()
			};
			const updateResponse = await this._authDao.switchRolesDao(claims, appSession);

			if (updateResponse.code !== HttpStatus.OK) {
				return updateResponse;
			}
			return createResponse(HttpStatus.OK, messages.S4, tokenResponse.data);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Patch
	async isDefaultUpdateSvc(claims: any, roleid: any): Promise<AppResponse> {
		try {
			const roleResponse = await this._authDao.isDefaultUpdateDao(claims, roleid);
			return roleResponse;
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region validate token
	async validateToken(token: string): Promise<AppResponse> {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata');
			const jwtRes = await this._jwtService.verifyAsync(token, {
				secret: tokenMetadata.appAtSecret
			});
			return createResponse(HttpStatus.OK, messages.S3, jwtRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.UNAUTHORIZED);
			return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
		}
	}
	//#endregion

	async getEmployeeRolesSvc(claims: any): Promise<any> {
		try {
			const empRoles = await this._authDao.getEmpRolesDao(claims);
			return empRoles;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.UNAUTHORIZED);
			return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
		}
	}
}
