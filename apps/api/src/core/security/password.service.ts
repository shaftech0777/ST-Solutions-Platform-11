import bcrypt from "bcrypt";

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Enterprise Centralized Password Hashing and Comparison Service using bcrypt.
 */
export class PasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = DEFAULT_SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hashes a plaintext password asynchronously.
   *
   * @param password Plaintext password to hash
   * @returns Hashed password string
   */
  public async hashPassword(password: string): Promise<string> {
    if (!password || typeof password !== "string" || password.length === 0) {
      throw new Error("PasswordServiceError: Password cannot be empty");
    }

    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compares a plaintext password against a stored bcrypt hash asynchronously.
   *
   * @param password Plaintext password candidate
   * @param hash Stored bcrypt hash
   * @returns True if password matches hash, false otherwise
   */
  public async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash || typeof password !== "string" || typeof hash !== "string") {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
}

/**
 * Default Singleton Instance of PasswordService.
 */
export const passwordService = new PasswordService();

/**
 * Convenience helper to hash password.
 */
export async function hashPassword(password: string): Promise<string> {
  return passwordService.hashPassword(password);
}

/**
 * Convenience helper to compare password against hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return passwordService.comparePassword(password, hash);
}
