import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";
const prismaPlugin = async (app) => {
    const prisma = new PrismaClient({
        log: app.log.level === "debug" ? ["query", "warn", "error"] : ["warn", "error"],
    });
    await prisma.$connect();
    app.decorate("prisma", prisma);
    app.addHook("onClose", async (instance) => {
        await instance.prisma.$disconnect();
    });
};
export default fp(prismaPlugin);
//# sourceMappingURL=prisma.js.map