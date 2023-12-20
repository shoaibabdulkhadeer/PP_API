import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class patchSkillDto {
	@ApiProperty({ description: 'SelfRating of the employee', example: 4 })
	@IsNumber()
	@IsNotEmpty({ message: messageFactory(messages.W3, ['SelfRating']) })
	@Min(1, { message: messageFactory(messages.W3, ['SelfRating']) })
	@Max(5, { message: 'SelfRating must be less than or equal to 5' })
	SelfRating: number;

	@ApiProperty({ description: 'SkillGuId of a skill', example: '933F6F88-6F40-4949-B571-04F7C1A3F3CB' })
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W3, ['SkillGuId']) })
	@IsUUID('all', { message: messageFactory(messages.W4, ['SkillGuId']) })
	SkillGuId: string;
}
