import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hash a password using Node's native scrypt algorithm.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384 }).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored scrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = scryptSync(password, salt, 64, { N: 16384 }).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
}
