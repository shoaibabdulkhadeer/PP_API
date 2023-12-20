import { projectStatus } from '@app/core/enums/project-status.enum';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class projectFetchDto {
	@IsOptional()
	@ApiProperty({ description: 'EmployeeGuID of an Employee', example: '0C1122A9-4197-4CF4-87F4-BFE09DAF6C4C' })
	@IsUUID('all', { message: messageFactory(messages.W4, ['EmployeeGuID']) })
	EmployeeGuID: string;

	@ApiProperty({ description: 'projectStatus of the employee', example: 'ACTIVE' })
	@IsEnum(projectStatus, { message: messageFactory(messages.W4, ['projectStatus']) })
	@IsNotEmpty({ message: messageFactory(messages.W3, ['projectStatus']) })
	@IsString()
	projectStatus: string;
}
