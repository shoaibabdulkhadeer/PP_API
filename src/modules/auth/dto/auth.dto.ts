import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOctal, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';

export class stateDto {
	@IsOptional()
	@IsString()
	uniqueid: string;

	@IsOptional()
	@IsString()
	return_uri: string;

	@IsOptional()
	@IsString()
	redirect_uri: string;

	@IsOptional()
	@IsString()
	ip: string;
}
export class LoginDto {
	@IsOptional()
	@IsString()
	@Matches(/.*@g7cr\.com$/, {
		message: 'Username must end with @g7cr'
	})
	Username: string;

	@IsOptional()
	@IsString()
	Password: string;

	@IsOptional()
	@IsEnum(['Microsoft', 'Credentials'])
	authType: string;

	@IsOptional()
	@IsString()
	authKey: string;

	@IsOptional()
	@Type(() => stateDto)
	@ValidateNested({ each: true })
	state: stateDto;
}
