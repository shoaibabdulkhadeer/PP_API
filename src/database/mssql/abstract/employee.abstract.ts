import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { AddSkillDto, PatchSkillRatingDto } from '@app/modules/employee/dto/skill.dto';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractEmployee {
	abstract getAllUsers(fullName, departmentName, designationName, page, limit, claims: JwtToken): Promise<AppResponse>;
	abstract postBasicInfo(infoDetails: any, EmpRoleData: any): Promise<AppResponse>;
	abstract getEmployeeAllRolesDao(id: any): Promise<AppResponse>;
	abstract updateInfo(id: string, data: any): Promise<AppResponse>;
	abstract updateRole(empRoledata: any, isRmRole, id): Promise<AppResponse>;
	abstract getUserRolesDao(id): Promise<any>;
	abstract findbyEmpguidbasic(id: string): Promise<AppResponse>;
	abstract statusUpdate(id: string, claims: JwtToken): Promise<AppResponse>;
	abstract findbyEmailAddress(communicationEmailAddress: any, id?: string): Promise<AppResponse>;
	abstract findbyUsername(username: string, id?: string): Promise<AppResponse>;
	abstract getEmpProjectsDao(id: string): Promise<AppResponse>;
	abstract finduserByEmployeeG7Id(employeeID: string, id?: string): Promise<AppResponse>;
	abstract findEmployeeByIdc(employeeId: string, claims: JwtToken): Promise<AppResponse>;
	abstract deleteSkillMapping(SkillMappingGuId: string, claims: JwtToken): Promise<AppResponse>;
	abstract addSkillToEmployee(employeeGuID: string, addSkillDto: AddSkillDto, claims: JwtToken): Promise<AppResponse>;
	abstract patchSkillRating(SkillMappingGuId: string, patchDto: PatchSkillRatingDto, claims: JwtToken): Promise<AppResponse>;
	abstract addEmailLog(mailObj: any): Promise<AppResponse>;
}
