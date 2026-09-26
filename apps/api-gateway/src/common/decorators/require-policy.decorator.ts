import { SetMetadata } from '@nestjs/common';

export const POLICY_KEY = 'policy';
export const RequirePolicy = (action: string, resource: string) => SetMetadata(POLICY_KEY, { action, resource });
