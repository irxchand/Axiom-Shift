import { z } from "zod";
import { createAuthService } from "../services/authService.js";
const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters."),
});
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const authRoutes = async (app) => {
    const authService = createAuthService(app.prisma);
    app.post("/api/v1/auth/register", async (request, reply) => {
        const body = RegisterSchema.parse(request.body);
        const result = await authService.register(body.email, body.password);
        reply.code(201).send({ requestId: request.requestId, data: result });
    });
    app.post("/api/v1/auth/login", async (request, reply) => {
        const body = LoginSchema.parse(request.body);
        const result = await authService.login(body.email, body.password);
        reply.code(200).send({ requestId: request.requestId, data: result });
    });
};
export default authRoutes;
//# sourceMappingURL=auth.js.map