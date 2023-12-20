import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

class EmployeeData {
	@IsString()
	@IsNotEmpty({ message: 'Employee Name should not be empty' })
	FullName: string;

	@IsNumber()
	@Min(1, { message: 'Daily allocated hours should not be less than 1' })
	@Max(14, { message: 'Daily allocated hours should not be more than 14' })
	@IsNotEmpty({ message: 'Daily allocated hours should not be empty' })
	DailyAllocatedHours: number;
}

class EmployeeData2 {
	@IsString()
	@IsOptional({ message: 'Employee name should not be empty' })
	FullName: string;

	@IsNumber()
	@Max(14, { message: 'Daily allocated hours should not be more than 14' })
	@Min(1, { message: 'Daily allocated hours should not be less than 1' })
	@IsOptional()
	DailyAllocatedHours: number;
}

export class ProjectsDto {
	@IsOptional()
	@IsString()
	ProjectGuId: string;

	@IsString()
	@IsNotEmpty()
	ProjectName: string;

	@IsNotEmpty()
	@IsString()
	ProjectDescription: string;

	@IsDate()
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	StartDate: Date;

	@IsDate()
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	EndDate: Date;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => EmployeeData)
	EmployeeData: EmployeeData[];
}

export class UpdateProjectsDto {
	@IsOptional()
	@IsString()
	ProjectGuId: string;

	@IsString({ message: 'ProjectName must be a string' })
	@IsOptional()
	ProjectName: string;

	@IsOptional()
	@IsString({ message: 'ProjectDescription must be a string' })
	ProjectDescription: string;

	@IsDate({ message: 'StartDate must be a valid date' })
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	StartDate: Date;

	@IsDate({ message: 'EndDate must be a valid date' })
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	EndDate: Date;

	@IsArray({ message: 'EmployeeData must be an array' })
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => EmployeeData2)
	EmployeeData: EmployeeData2[];
}
