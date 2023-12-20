import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { ProjectsDto, UpdateProjectsDto } from '@app/modules/projects/dto/projects.dto';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractProjectsSqlDao {
	abstract getAllProjects(page: number, limit: number, claims: JwtToken): Promise<AppResponse>;
	abstract getAllEmployees(claims: JwtToken): Promise<AppResponse>;
	abstract addProject(projectBody: ProjectsDto, claims: JwtToken): Promise<AppResponse>;
	abstract updateProject(id: string, projectBody: UpdateProjectsDto, claims: JwtToken): Promise<AppResponse>;
}
