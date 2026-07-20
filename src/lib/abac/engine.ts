import { UserAttributes, AbacAction, ResourceAttributes } from './types';
import { policyRegistry } from './policies';

export function isAllowed(
  user: UserAttributes,
  action: AbacAction,
  resource: ResourceAttributes
): boolean {
  const resourcePolicies = policyRegistry[resource.type];
  if (!resourcePolicies) return false;

  const policy = resourcePolicies[action];
  if (!policy) return false;

  return policy(user, resource);
}