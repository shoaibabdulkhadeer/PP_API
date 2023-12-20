import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCertificationDto {
	@ApiProperty({ description: 'EmployeeGuID of the employee', example: 'D064E696-0C98-4E30-8F1A-39B8012008BC' })
	@IsNotEmpty({ message: messageFactory(messages.W3, ['EmployeeGuID']) })
	@IsUUID('all', { message: messageFactory(messages.W4, ['EmployeeGuID']) })
	EmployeeGuID: string;

	@ApiProperty({ description: 'CertificationGuId of the employee', example: 'A74124B4-E97C-4C06-A3D3-37B9CFF8DCBC' })
	@IsNotEmpty({ message: messageFactory(messages.W3, ['CertificationGuId']) })
	@IsUUID('all', { message: messageFactory(messages.W4, ['CertificationGuId']) })
	CertificationGuId: string;
}
