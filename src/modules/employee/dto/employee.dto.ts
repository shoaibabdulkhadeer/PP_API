import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional, Matches, IsArray, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
	@IsNotEmpty()
	@IsString()
	FullName: string;

	@IsNotEmpty()
	@IsString()
	@Matches(/^[a-zA-Z0-9_.+-]+@g7cr\.com$/, { message: 'Invalid Username. Must be of the form user@g7cr.com' })
	Username: string;

	@IsNotEmpty()
	@IsEmail()
	CommunicationEmailAddress: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(20, { message: 'EmployeeID must be at most 20 characters long' })
	EmployeeID: string;

	@IsNotEmpty()
	@IsString()
	JoiningDate: string;

	@IsNotEmpty()
	@IsNumber()
	TotalYearsOfExperience: number;

	@IsNotEmpty()
	@IsNumber()
	DesignationId: number;

	@IsNotEmpty()
	@IsNumber()
	DepartmentId: number;

	@IsNotEmpty()
	@IsNumber()
	HourlyCost: number;

	@IsOptional()
	@IsString()
	ReportingManagerEmployeeGuID?: string;

	@IsNotEmpty()
	@IsArray()
	RoleID: number[];
}
