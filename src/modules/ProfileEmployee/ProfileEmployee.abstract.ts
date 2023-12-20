import { AppResponse } from '@app/shared/appresponse.shared';
import { CreateCertificationDto } from './dto/createCertification.dto';
import { JwtToken } from '../auth/models/jwt_token.model';
import { projectFetchDto } from './dto/projectFetch.dto';

export abstract class AbstractProfileEmployeeSvc {
	abstract getEmployeeDetailsById(id: string): Promise<AppResponse>;

	abstract getProjectsById(claims: JwtToken, projectFetchBody: projectFetchDto, projectName: string, pageId: number): Promise<AppResponse>;

	abstract getSkillsById(id: string): Promise<AppResponse>;
	abstract patchSkillById(body: { SkillGuId: string; SelfRating: number }, claims: JwtToken): Promise<AppResponse>;
	abstract getAllCertificates(): Promise<AppResponse>;
	abstract getCertificatesById(id: string): Promise<AppResponse>;
	abstract postCertificationById(file: any, body: CreateCertificationDto, claims: JwtToken): Promise<AppResponse>;
	abstract downloadCertificationById(body: CreateCertificationDto): any;
	abstract getEmployeePerformanceReportById(id: string): Promise<AppResponse>;
}
