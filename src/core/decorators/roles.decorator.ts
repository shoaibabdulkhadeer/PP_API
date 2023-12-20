import { SetMetadata } from '@nestjs/common';
import { DecoratorConstant } from '../constants/decorator.constant';
import { RoleType } from '../enums/app-role.enum';

export const HasRoles: any = (roles: RoleType[]) => SetMetadata(DecoratorConstant.HAS_ROLES, roles);
