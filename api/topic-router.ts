import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { lockedTopics } from "@db/schema";
import { eq, isNull } from "drizzle-orm";

export const topicRouter = createRouter({
  // List active locked topics
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(lockedTopics)
      .where(isNull(lockedTopics.unlockedAt));
    return items.map((t) => t.topicName);
  }),

  // Lock topics
  lock: publicQuery
    .input(
      z.object({
        topicNames: z.array(z.string()),
        lockDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const name of input.topicNames) {
        await db.insert(lockedTopics).values({
          topicName: name,
          lockDate: input.lockDate,
        });
      }
      return { count: input.topicNames.length };
    }),

  // Unlock topics
  unlock: publicQuery
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const name of input) {
        await db
          .update(lockedTopics)
          .set({ unlockedAt: new Date() })
          .where(eq(lockedTopics.topicName, name));
      }
      return { ok: true };
    }),
});
