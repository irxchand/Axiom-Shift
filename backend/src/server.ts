import { env } from "./lib/env.js";
import { buildApp } from "./app.js";
import { documentHandoffWorker } from './workers/documentHandoffWorker.js';
import { agentRunWorker } from './workers/agentRunWorker.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "Shutting down");
    await documentHandoffWorker.close();
    await agentRunWorker.close();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main();
