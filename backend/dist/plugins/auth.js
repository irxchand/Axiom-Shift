import fp from "fastify-plugin";
import { AppError } from "../lib/errors.js";
const authPlugin = async (app) => {
    app.decorateRequest("userId", "");
    app.decorate("authenticate", async (request) => {
        const header = request.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            throw AppError.unauthorized("Missing or malformed Authorization header.");
        }
        const token = header.slice("Bearer ".length).trim();
        try {
            // Bypassed for local frontend dev since there is no login UI yet
            // const payload = verifyAccessToken(token);
            request.userId = "test-user-id";
        }
        catch {
            throw AppError.unauthorized("Invalid or expired token.");
        }
    });
};
export default fp(authPlugin);
//# sourceMappingURL=auth.js.map