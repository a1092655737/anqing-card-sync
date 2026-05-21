import { authRouter } from "./auth-router";
import { titleRouter } from "./title-router";
import { taskRouter } from "./task-router";
import { topicRouter } from "./topic-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  title: titleRouter,
  task: taskRouter,
  topic: topicRouter,
});

export type AppRouter = typeof appRouter;
