import { createHash, randomBytes } from 'node:crypto';
import type { Clock, TokenGenerator } from '@/application/ports';

/** 24 bytes encode to exactly 32 base64url characters (192 bits). */
export const cryptoTokenGenerator: TokenGenerator = {
  generate: () => randomBytes(24).toString('base64url'),
  readTokenFor: (writeToken) =>
    createHash('sha256').update(`read:${writeToken}`).digest().subarray(0, 24).toString('base64url'),
};

export const systemClock: Clock = {
  now: () => new Date(),
};
