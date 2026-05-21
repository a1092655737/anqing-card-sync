import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { positionTasks } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const taskRouter = createRouter({
  // List all tasks
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(positionTasks).orderBy(desc(positionTasks.id));
    return items;
  }),

  // Create a new task
  create: publicQuery
    .input(
      z.object({
        cardProduct: z.string().optional(),
        topicName: z.string().optional(),
        publishAccount: z.string().optional(),
        copywriter: z.string().optional(),
        copyStartTime: z.string().optional(),
        copyEndTime: z.string().optional(),
        videoProducer: z.string().optional(),
        videoStartTime: z.string().optional(),
        videoEndTime: z.string().optional(),
        publishTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(positionTasks).values({
        cardProduct: input.cardProduct ?? "",
        topicName: input.topicName ?? "",
        publishAccount: input.publishAccount ?? "",
        copywriter: input.copywriter ?? "",
        copyStartTime: input.copyStartTime ?? "",
        copyEndTime: input.copyEndTime ?? "",
        videoProducer: input.videoProducer ?? "",
        videoStartTime: input.videoStartTime ?? "",
        videoEndTime: input.videoEndTime ?? "",
        publishTime: input.publishTime ?? "",
      });
      return { id: Number(result[0].insertId) };
    }),

  // Update a task
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        cardProduct: z.string().optional(),
        topicName: z.string().optional(),
        publishAccount: z.string().optional(),
        copywriter: z.string().optional(),
        copyStartTime: z.string().optional(),
        copyEndTime: z.string().optional(),
        videoProducer: z.string().optional(),
        videoStartTime: z.string().optional(),
        videoEndTime: z.string().optional(),
        publishTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(positionTasks).set(data).where(eq(positionTasks.id, id));
      return { ok: true };
    }),

  // Delete a task
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(positionTasks).where(eq(positionTasks.id, input.id));
      return { ok: true };
    }),

  // Bulk replace (for sync)
  bulkReplace: publicQuery
    .input(
      z.array(
        z.object({
          cardProduct: z.string(),
          topicName: z.string(),
          publishAccount: z.string(),
          copywriter: z.string(),
          copyStartTime: z.string(),
          copyEndTime: z.string(),
          videoProducer: z.string(),
          videoStartTime: z.string(),
          videoEndTime: z.string(),
          publishTime: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(positionTasks);
      if (input.length > 0) {
        await db.insert(positionTasks).values(input);
      }
      return { count: input.length };
    }),
});
