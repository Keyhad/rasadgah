import { randomBytes } from 'node:crypto';
import type { Clock, TokenGenerator } from '@/application/ports';

/** 24 random bytes encode to exactly 32 base64url characters (192 bits of entropy). */
export const cryptoTokenGenerator: TokenGenerator = {
  generate: () => randomBytes(24).toString('base64url'),
};

export const systemClock: Clock = {
  now: () => new Date(),
};
