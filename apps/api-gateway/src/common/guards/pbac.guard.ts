import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { POLICY_KEY } from '../decorators/require-policy.decorator';

@Injectable()
export class PbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPolicy = this.reflector.getAllAndOverride<{action: string, resource: string}>(POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPolicy) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.policies) {
      return false; // Fail safe if no policies
    }

    // Basic PBAC Evaluation
    // An admin might have an "action: '*', resource: '*'" policy
    const hasAccess = user.policies.some((policy: any) => {
      const matchAction = policy.action === '*' || policy.action === requiredPolicy.action;
      const matchResource = policy.resourceCode === '*' || policy.resourceCode === requiredPolicy.resource;
      return matchAction && matchResource && policy.effect !== 'DENY';
    });

    return hasAccess;
  }
}
