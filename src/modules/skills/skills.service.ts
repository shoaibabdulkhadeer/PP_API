import { AbstractSkillSqlDao } from '@app/database/mssql/abstract/skills.abstract';
import { AbstractSkillSvc } from './skills.abstract';
import { DatabaseService } from '@app/database/database.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { SkillsDto, UpdateSkillsDto } from './dto/skills.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtToken } from '../auth/models/jwt_token.model';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';

@Injectable()
export class SkillService implements AbstractSkillSvc {
	private readonly _skillDao: AbstractSkillSqlDao;

	constructor(readonly _dbSvc: DatabaseService) {
		this._skillDao = _dbSvc.skillSqlTxn;
	}

	//#region get all skills
	async getAllSkillsSvc(page: number, limit: number, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._skillDao.getAllSkills(page, limit, claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region adding skills
	async addSkillSvc(skillBody: SkillsDto, claims: JwtToken): Promise<AppResponse> {
		try {
			const skillData = {
				SkillGuId: uuidv4(),
				SkillName: skillBody.SkillName,
				SkillDescription: skillBody.SkillDescription,
				SkillTagId: skillBody.SkillTagId,
				IsActive: 1,
				CreatedAt: unix_ts_now(),
				CreatedBy: claims.EmployeeGuID
			};
			return this._skillDao.addSkill(skillData, claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region update skill
	async updateSkillSvc(id: string, skillBody: UpdateSkillsDto, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._skillDao.updateSkill(id, skillBody, claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  disable Skill
	async disableSkillSvc(id: string, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._skillDao.disableSkill(id, claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get all skillTag
	async getAllSkillTagSvc(claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._skillDao.getAllSkillsTag(claims);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
