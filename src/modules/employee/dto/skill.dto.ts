// skill.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class AddSkillDto {
	@IsUUID()
	SkillGuId: string;
}

export class PatchSkillRatingDto {
	@IsNumber()
	@IsNotEmpty()
	ReportingManagerRating: number;
}
