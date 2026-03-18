import crypto from 'crypto';

const IV_LENGTH = 16;

export const encryptFile = (buffer) => {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in .env');
  }

  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 characters, got ${ENCRYPTION_KEY.length}`);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
};

export const decryptFile = (buffer) => {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in .env');
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const encryptedData = buffer.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};