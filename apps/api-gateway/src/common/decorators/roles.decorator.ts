import { SetMetadata } from '@nestjs/common';

export enum Role {
  AUTHOR = 'AUTHOR',
  EDITOR = 'EDITOR',
  REVIEWER = 'REVIEWER',
  PUBLISHER = 'PUBLISHER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
