import { AppResponse } from '@app/shared/appresponse.shared';
import { CreateEmployeeDto } from './dto/employee.dto';
import { AddSkillDto, PatchSkillRatingDto } from './dto/skill.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractEmployeeSvc {
	abstract getAllUsers(
		fullName: string,
		departmentName: string,
		designationName: string,
		page: any,
		limit: any,
		claims: JwtToken
	): Promise<AppResponse>;
	abstract addBasicInfo(infoDetails: CreateEmployeeDto, claims: JwtToken): Promise<AppResponse>;
	abstract updateBasicInfo(id: string, infoDetails: any, claims: JwtToken): Promise<AppResponse>;
	abstract statusBasicInfo(id: string, claims: JwtToken): Promise<AppResponse>;
	abstract getEmpProjects(id: string): Promise<AppResponse>;
	abstract getEmpAllRolesSvc(id: string): Promise<AppResponse>;
	abstract findEmployeeByIdSvcc(employeeId: string, claims: JwtToken): Promise<AppResponse>;
	abstract deleteSkillMappingSvc(SkillMappingGuId: string, claims: JwtToken): Promise<AppResponse>;
	abstract addSkillToEmployeeSvc(employeeGuID: string, addSkillDto: AddSkillDto, claims: JwtToken): Promise<AppResponse>;
	abstract patchSkillRating(SkillMappingGuId: string, patchDto: PatchSkillRatingDto, claims: JwtToken): Promise<AppResponse>;
}
