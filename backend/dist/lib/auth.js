import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
const SALT_ROUNDS = 12;
export async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
export function signAccessToken(userId) {
    const payload = { sub: userId };
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
}
//# sourceMappingURL=auth.js.map