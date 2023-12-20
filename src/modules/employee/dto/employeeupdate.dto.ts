import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional, Matches, IsArray } from 'class-validator';

export class UpdateEmployeeDto {
	@IsOptional()
	@IsString()
	FullName?: string;

	@IsOptional()
	@IsString()
	@Matches(/^[a-zA-Z0-9_.+-]+@g7cr\.com$/, { message: 'Invalid Username. Must be of the form user@g7cr.com' })
	Username?: string;

	@IsOptional()
	@IsEmail()
	CommunicationEmailAddress?: string;

	@IsOptional()
	@IsString()
	EmployeeID?: string;

	@IsOptional()
	@IsString()
	JoiningDate?: string;

	@IsOptional()
	@IsNumber()
	TotalYearsOfExperience?: number;

	@IsOptional()
	@IsNumber()
	DesignationId?: number;

	@IsOptional()
	@IsNumber()
	DepartmentId?: number;

	@IsOptional()
	@IsNumber()
	HourlyCost?: number;

	@IsOptional()
	@IsString()
	ReportingManagerEmployeeGuID?: string;

	@IsOptional()
	@IsArray()
	RoleID?: number[];
}
