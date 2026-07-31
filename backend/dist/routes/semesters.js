import { z } from "zod";
import { createSemesterService } from "../services/semesterService.js";
import { requireIdempotencyKey, withIdempotency } from "../lib/idempotency.js";
const CreateSemesterSchema = z.object({
    name: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    timezone: z.string().min(1).default("Asia/Kolkata"),
});
const CreateSubjectSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    credits: z.number().positive().optional(),
    color: z.string().optional(),
});
const semesterRoutes = async (app) => {
    const semesterService = createSemesterService(app.prisma);
    app.get("/api/v1/semesters", { preHandler: app.authenticate }, async (request, reply) => {
        const semesters = await semesterService.listForUser(request.userId);
        reply.code(200).send({ requestId: request.requestId, data: semesters });
    });
    app.post("/api/v1/semesters", { preHandler: app.authenticate }, async (request, reply) => {
        const key = requireIdempotencyKey(request);
        const body = CreateSemesterSchema.parse(request.body);
        const { statusCode, body: responseBody, replayed } = await withIdempotency(app.prisma, { userId: request.userId, key, route: "POST /api/v1/semesters" }, async () => {
            const semester = await semesterService.create(request.userId, body);
            return { statusCode: 201, body: { requestId: request.requestId, data: semester } };
        });
        reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    });
    app.post("/api/v1/semesters/:semesterId/subjects", { preHandler: app.authenticate }, async (request, reply) => {
        const key = requireIdempotencyKey(request);
        const { semesterId } = request.params;
        const body = CreateSubjectSchema.parse(request.body);
        const { statusCode, body: responseBody, replayed } = await withIdempotency(app.prisma, { userId: request.userId, key, route: `POST /api/v1/semesters/${semesterId}/subjects` }, async () => {
            const subject = await semesterService.createSubject(request.userId, semesterId, body);
            return { statusCode: 201, body: { requestId: request.requestId, data: subject } };
        });
        reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    });
};
export default semesterRoutes;
//# sourceMappingURL=semesters.js.map