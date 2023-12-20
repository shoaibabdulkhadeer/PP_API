import { AppResponse } from '@app/shared/appresponse.shared';
import { ProjectsDto, UpdateProjectsDto } from './dto/projects.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractProjectsSvc {
	abstract getAllProjectsSvc(page: number, limit: number, claims: JwtToken): Promise<AppResponse>;
	abstract getAllEmployeesSvc(claims: JwtToken): Promise<AppResponse>;
	abstract addProjectSvc(projectBody: ProjectsDto, claims: JwtToken): Promise<AppResponse>;
	abstract updateProjectSvc(id: string, projectBody: UpdateProjectsDto, claims: JwtToken): Promise<AppResponse>;
}
