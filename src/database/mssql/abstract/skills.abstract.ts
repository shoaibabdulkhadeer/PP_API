import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { UpdateSkillsDto } from '@app/modules/skills/dto/skills.dto';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractSkillSqlDao {
	abstract getAllSkills(page: number, limit: number, claims: JwtToken): Promise<AppResponse>;
	abstract getAllSkillsTag(claims: JwtToken): Promise<AppResponse>;
	abstract addSkill(skillBody: any, claims: JwtToken): Promise<AppResponse>;
	abstract updateSkill(id: string, skillBody: UpdateSkillsDto, claims: JwtToken): Promise<AppResponse>;
	abstract disableSkill(id: string, claims: JwtToken): Promise<AppResponse>;
}
