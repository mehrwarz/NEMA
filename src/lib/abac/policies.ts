import { UserAttributes, ResourceAttributes, AbacAction, PolicyFn } from './types';

const commentPolicies: Record<AbacAction, PolicyFn> = {
  create: () => true,
  read: () => true,
  update: (user, resource) => {
    // Regular users can only update their own comments; moderators can update any
    return user.id === resource.ownerId || user.role === 'moderator';
  },
  delete: (user) => ['moderator', 'admin'].includes(user.role),
};

const linkPolicies: Record<AbacAction, PolicyFn> = {
  create: (user) => ['moderator', 'admin'].includes(user.role),
  read: () => true,
  update: (user) => user.role === 'moderator' || user.role === 'admin',
  delete: (user) => user.role === 'admin',
};

export const policyRegistry: Record<string, Record<AbacAction, PolicyFn>> = {
  comment: commentPolicies,
  document_link: linkPolicies,
};