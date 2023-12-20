import { DecoratorConstant } from '../constants/decorator.constant';
import { SetMetadata } from '@nestjs/common';

export const Authorize = () => SetMetadata(DecoratorConstant.SECURED, true);
