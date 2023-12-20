import { nineBoxEnum } from '@app/shared/models.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class BulkUploadDto {
	@ApiProperty()
	@ValidateNested({ each: true })
	@Type(() => AddNewReportDto)
	reports: AddNewReportDto[];
}

export class AddNewReportDto {
	@IsString()
	@IsNotEmpty()
	EmployeeGuID: string;

	@IsNotEmpty()
	@IsPositive()
	BillableHours: number;

	@IsNotEmpty()
	NonBillableHours: number;

	@IsNotEmpty()
	@IsString()
	Remarks: string;

	@IsNotEmpty()
	PositionId: nineBoxEnum;

	@IsNotEmpty()
	ForMonth: Date;

	@IsNotEmpty()
	@IsOptional()
	CreatedBy: string;
}

export class EditNewReportDto {
	@IsNotEmpty()
	MonthlyPerformanceInfoGuId;
	@IsNotEmpty()
	BillableHours: number;

	@IsNotEmpty()
	NonBillableHours: number;

	@IsNotEmpty()
	@IsString()
	Remarks: string;

	@IsOptional()
	@IsNotEmpty()
	PositionId: nineBoxEnum;

	@IsOptional()
	ForMonth: Date;

	@IsOptional()
	UpdatedBy: string;
}
