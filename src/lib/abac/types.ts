// src/lib/abac/types.ts
export interface UserAttributes {
  id: number;  // Matched to your JWTPayload
  role: string;    // Matched to your JWTPayload
  email: string;
}

export interface ResourceAttributes {
  type: 'comment' | 'document_link' | 'document';
  ownerId: number; // Switched to number to match your userId type
  attributes: Record<string, any>;
}

export type AbacAction = 'create' | 'read' | 'update' | 'delete';
export type PolicyFn = (user: UserAttributes, resource: ResourceAttributes) => boolean;