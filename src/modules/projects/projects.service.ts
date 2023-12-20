import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { AbstractProjectsSvc } from './projects.abstract';
import { AbstractProjectsSqlDao } from '@app/database/mssql/abstract/projects.abstract';
import { DatabaseService } from '@app/database/database.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { messages } from '@app/shared/messages.shared';
import { ProjectsDto, UpdateProjectsDto } from './dto/projects.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

@Injectable()
export class ProjectsService implements AbstractProjectsSvc {
	private readonly _projectDao: AbstractProjectsSqlDao;

	constructor(readonly _dbSvc: DatabaseService) {
		this._projectDao = _dbSvc.projectsTxn;
	}

	//#region  get all projects
	async getAllProjectsSvc(page: number, limit: number, claims: JwtToken): Promise<AppResponse> {
		try {
			return this._projectDao.getAllProjects(page, limit, claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region adding project
	async addProjectSvc(projectBody: ProjectsDto, claims: JwtToken): Promise<AppResponse> {
		try {
			if (projectBody.StartDate.toISOString() < projectBody.EndDate.toISOString()) {
				return this._projectDao.addProject(projectBody, claims);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W35);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region update project
	async updateProjectSvc(id: string, projectBody: UpdateProjectsDto, claims: JwtToken): Promise<AppResponse> {
		try {
			if (projectBody.StartDate.toISOString() < projectBody.EndDate.toISOString()) {
				return await this._projectDao.updateProject(id, projectBody, claims);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W35);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  get all Employees
	async getAllEmployeesSvc(claims: JwtToken): Promise<AppResponse> {
		try {
			return this._projectDao.getAllEmployees(claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
