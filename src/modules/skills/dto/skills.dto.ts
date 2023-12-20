import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SkillsDto {
	@IsString()
	@IsNotEmpty()
	SkillName: string;

	@IsString()
	@IsNotEmpty()
	SkillDescription: string;

	@IsNumber()
	@IsNotEmpty()
	SkillTagId: number;
}

export class UpdateSkillsDto {
	@IsString()
	@IsOptional()
	SkillGuId: string;

	@IsString()
	@IsOptional()
	SkillName: string;

	@IsString()
	@IsOptional()
	SkillDescription: string;

	@IsNumber()
	@IsOptional()
	SkillTagId: number;
}
