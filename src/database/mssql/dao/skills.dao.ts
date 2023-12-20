import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { AbstractSkillSqlDao } from '../abstract/skills.abstract';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constants.mssql';
import { Op, Sequelize } from 'sequelize';
import AppLogger from '@app/core/logger/app-logger';
import { messages } from '@app/shared/messages.shared';
import { TblSkills } from '../models/master.skill.models';
import { SkillsDto, UpdateSkillsDto } from '@app/modules/skills/dto/skills.dto';
import { TblSkillTags } from '../models/readonly.skill-tags.models';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { TblBasicInfo } from '../models/employees.basic-info.models';

@Injectable()
export class SkillSqlDao implements AbstractSkillSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		@Inject(MsSqlConstants.MASTER_SKILL_MODEL) private _skillsModel: typeof TblSkills,
		@Inject(MsSqlConstants.READONLY_SKILL_TAGS_MODEL) private _skillsTagModel: typeof TblSkillTags,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _basicInfoModel: typeof TblBasicInfo,
		readonly _loggerSvc: AppLogger
	) {}

	//#region get all skills
	async getAllSkills(page: number, limit: number, claims: JwtToken): Promise<AppResponse> {
		try {
			const parsedPageSize = parseInt(String(limit), 10);
			const offset = (page - 1) * parsedPageSize;

			const skillsRes = await this._skillsModel.findAll({
				attributes: ['SkillGuId', 'SkillName', 'SkillDescription', 'SkillTagId', 'IsActive', 'CreatedAt'],
				offset,
				limit: parsedPageSize,
				include: [
					{
						model: this._skillsTagModel,
						as: 'SkillTagIdInfo',
						attributes: ['SkillTagName']
					},
					{
						model: this._basicInfoModel,
						as: 'createdByInfo',
						attributes: ['FullName']
					}
				],
				order: [['CreatedAt', 'DESC']]
			});
			const totalCount = await this._skillsModel.count();
			return createResponse(HttpStatus.OK, messages.S21, {
				totalSkills: totalCount,
				skills: skillsRes
			});
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region get all skillsTag
	async getAllSkillsTag(claims: JwtToken): Promise<AppResponse> {
		try {
			const res = await this._skillsTagModel.findAll();
			return createResponse(HttpStatus.OK, messages.S26, res);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region adding skill
	async addSkill(skillBody: SkillsDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const skill = await this._skillsModel.findOne({ where: { SkillName: skillBody.SkillName }, transaction });
			if (!skill) {
				if (skillBody?.SkillTagId) {
					const skillTag = await this._skillsTagModel.findOne({ where: { SkillTagId: skillBody.SkillTagId }, transaction });
					if (!skillTag) {
						await transaction.rollback();
						return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
					}
				}
				await this._skillsModel.create(skillBody, { transaction });
				await transaction.commit();
				return createResponse(HttpStatus.OK, messages.S22);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W16);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region update skill
	async updateSkill(id: string, skillBody: UpdateSkillsDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const skill = await this._skillsModel.findOne({ where: { SkillGuId: id } });
			if (skill) {
				if (skillBody?.SkillName) {
					const skillWithNameExists = await this._skillsModel.findOne({ where: { SkillName: skillBody.SkillName } });
					if (skillWithNameExists && skillWithNameExists.SkillGuId !== id) {
						await transaction.rollback();
						return createResponse(HttpStatus.BAD_REQUEST, messages.W16);
					}
					skill.SkillName = skillBody.SkillName;
				}

				if (skillBody?.SkillTagId) {
					const skillTag = await this._skillsTagModel.findOne({ where: { SkillTagId: skillBody.SkillTagId }, transaction });
					if (!skillTag) {
						await transaction.rollback();
						return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
					}
					skill.SkillTagId = skillBody.SkillTagId;
				}
				if (skillBody?.SkillDescription) {
					skill.SkillDescription = skillBody.SkillDescription;
				}
				skill.UpdatedAt = unix_ts_now();
				skill.UpdatedBy = claims.EmployeeGuID;
				await skill.save({ transaction });
				await transaction.commit();
				return createResponse(HttpStatus.OK, messages.S23);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W12);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region disable skill
	async disableSkill(id: string, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const skill = await this._skillsModel.findOne({ where: { SkillGuId: id } });
			skill.IsActive = !skill.IsActive;
			skill.UpdatedBy = claims.EmployeeGuID;
			skill.UpdatedAt = unix_ts_now();

			await skill.save({ transaction });

			await transaction.commit();
			const successMessage = skill.IsActive ? messages.S25 : messages.S24;
			return createResponse(HttpStatus.OK, successMessage);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion
}
