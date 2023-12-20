import { AppResponse } from '@app/shared/appresponse.shared';
import { SkillsDto, UpdateSkillsDto } from './dto/skills.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractSkillSvc {
	abstract getAllSkillsSvc(page: number, limit: number, claims: JwtToken): Promise<AppResponse>;
	abstract getAllSkillTagSvc(claims: JwtToken): Promise<AppResponse>;
	abstract addSkillSvc(skillBody: SkillsDto, claims: JwtToken): Promise<AppResponse>;
	abstract updateSkillSvc(id: string, skillBody: UpdateSkillsDto, claims: JwtToken): Promise<AppResponse>;
	abstract disableSkillSvc(id: string, claims: JwtToken): Promise<AppResponse>;
}
