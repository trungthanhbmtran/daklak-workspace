/**
 * Policy Decision Point (PDP) Module
 *
 * Provides functions to evaluate if a user has permission to perform an action on a resource,
 * based on policies and dynamic conditions.
 */

export interface UserContext {
  id: number;
  roles: string[];
  unitCode: string; // Used for "ORGANIZATION" or "DEPARTMENT" scopes
  isLeader?: boolean;
  positionLevel?: number;
}

export interface ResourceContext {
  ownerId?: number;
  createdBy?: number;
  assigneeIds?: number[];
  processingUsers?: number[];
  departmentId?: number;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  status?: string;
  [key: string]: any;
}

export interface Policy {
  action: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: any; // The JSON object containing "expression" or other rules
}

/**
 * Checks if the current user has the right to perform the action on the given resource.
 * @param user The current user context.
 * @param policies The list of policies assigned to the user (via roles or directly).
 * @param action The action being requested (e.g. 'VIEW', 'UPDATE').
 * @param resource The resource being accessed.
 * @returns boolean True if allowed, false otherwise.
 */
export function checkPDP(
  user: UserContext | null,
  policies: Policy[],
  action: string,
  resource?: ResourceContext
): boolean {
  if (!user) return false;

  // 1. Find matching policies
  const matchingPolicies = policies.filter((p) => p.action === '*' || p.action === action);

  if (matchingPolicies.length === 0) {
    return false; // Default deny if no policy applies
  }

  // 2. Evaluate policies
  let isAllowed = false;

  for (const policy of matchingPolicies) {
    if (policy.effect === 'DENY') {
      return false; // Explicit DENY overrides any ALLOW
    }

    if (policy.effect === 'ALLOW') {
      const conditionExp = policy.conditions?.expression;
      
      if (!conditionExp || conditionExp === 'ALLOW ALWAYS') {
        isAllowed = true;
        continue;
      }

      // 3. Evaluate dynamic condition expression
      if (evaluateCondition(conditionExp, user, resource)) {
        isAllowed = true;
      }
    }
  }

  return isAllowed;
}

/**
 * Basic evaluator for the PBAC string expressions defined in seed.ts
 */
function evaluateCondition(expression: string, user: UserContext, resource?: ResourceContext): boolean {
  if (!resource) return true; // If resource context is not provided, we might be checking general access. For strict PBAC, this could return false.

  const currentUserId = user.id;

  // Parse specific known conditions (Simulating a rules engine)
  if (expression.includes('resource.ownerId == currentUserId') && resource.ownerId === currentUserId) {
    return true;
  }
  
  if (expression.includes('currentUserId IN resource.assigneeIds')) {
    if (resource.assigneeIds?.includes(currentUserId)) return true;
  }

  if (expression.includes('resource.createdBy == currentUserId')) {
     if (resource.createdBy === currentUserId) return true;
  }

  if (expression.includes("resource.status == 'DRAFT'") && resource.status !== 'DRAFT') {
    return false; // AND condition failed
  }

  if (expression.includes('user.positionLevel >=')) {
    const match = expression.match(/user\.positionLevel >= (\d+)/);
    if (match && user.positionLevel && user.positionLevel >= parseInt(match[1])) return true;
  }

  if (expression.includes("resource.visibility == 'PUBLIC'")) {
     if (resource.visibility === 'PUBLIC') return true;
  }

  if (expression.includes('user.isLeader == true') && user.isLeader) {
     return true;
  }

  return false;
}
