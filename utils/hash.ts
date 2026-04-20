import * as Crypto from 'expo-crypto';

// hashes a password with SHA-256 using expo-crypto
// i went with sha-256 because bcrypt/argon2 need native modules which dont work in expo go
// in a real production app id use bcrypt with a salt, but for this coursework sha-256 is
// way better than storing plaintext. mentioned this limitation in the report too
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}