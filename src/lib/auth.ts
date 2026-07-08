import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-mehrabani-change-me-in-production";
const secretKey = new TextEncoder().encode(JWT_SECRET);

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

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
}

/**
 * Sign a payload and return a JWT token.
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify a JWT token and return the payload or null.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}
