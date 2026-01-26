import { webcrypto } from "node:crypto";
globalThis.crypto = webcrypto;
import { createRemoteJWKSet, jwtVerify } from "jose";

const region = "ap-east-1";
const userPoolId = "ap-east-1_LguNAJT1O";
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const jwks = createRemoteJWKSet(
    new URL(`${issuer}/.well-known/jwks.json`)
);

export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const token = authHeader.replace("Bearer ", "");

        const { payload } = await jwtVerify(token, jwks, {
            issuer,
        });

        if (payload.token_use !== "id") {
            return res.status(401).json({
                error: "Invalid token type (access token required)",
            });
        }

        console.log("✅ Authenticated user payload:", payload);

        req.user = payload;
        next();
    } catch (err) {
        console.error("❌ JWT VERIFY ERROR:", err);
        return res.status(401).json({
            error: "Invalid token",
            reason: err.message,
        });
    }
}
