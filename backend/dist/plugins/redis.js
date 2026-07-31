import fp from "fastify-plugin";
import { Redis } from "ioredis";
import { env } from "../lib/env.js";
const redisPlugin = async (app) => {
    const redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: false,
    });
    redis.on("error", (err) => {
        app.log.error({ err }, "Redis connection error");
    });
    app.decorate("redis", redis);
    app.addHook("onClose", async (instance) => {
        instance.redis.disconnect();
    });
};
export default fp(redisPlugin);
//# sourceMappingURL=redis.js.map