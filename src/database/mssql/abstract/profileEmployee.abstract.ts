import { CreateCertificationDto } from '@app/modules/ProfileEmployee/dto/createCertification.dto';
import { projectFetchDto } from '@app/modules/ProfileEmployee/dto/projectFetch.dto';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractProfileEmployeeDao {
	abstract checkEmployeeID(id: string): Promise<AppResponse>;
	abstract getEmployeeByID(id: string): Promise<AppResponse>;
	abstract getEmployeeProjectsById(id: string, projectFetchBody: projectFetchDto, projectName: string, pageId: number): Promise<AppResponse>;
	abstract getSkillsByEmployeeId(id: string): Promise<AppResponse>;
	abstract patchSkillsByEmployeeId(patchBody: { SelfRating: number; SkillGuId: string }, claims: JwtToken): Promise<AppResponse>;
	abstract getAllCertificatesFromMaster(): Promise<AppResponse>;
	abstract getCertificatesById(id: string): Promise<AppResponse>;
	abstract postCertificateById(body: CreateCertificationDto, claims: JwtToken): Promise<AppResponse>;
	abstract downloadCertificateById(body: CreateCertificationDto): Promise<AppResponse>;

	abstract getMonthlyPerformanceById(id: string): Promise<AppResponse>;
}
