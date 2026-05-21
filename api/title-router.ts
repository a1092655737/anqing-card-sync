import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { titleItems } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const titleRouter = createRouter({
  // List all title items
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(titleItems).orderBy(desc(titleItems.id));
    return items;
  }),

  // Create a new title item
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        direction: z.string().optional(),
        reference: z.string().optional(),
        referenceImages: z.array(z.string()).optional(),
        directorSuggest: z.string().optional(),
        directorVote: z.enum(["agree", "pending"]).optional(),
        editorSuggest: z.string().optional(),
        editorVote: z.enum(["agree", "pending"]).optional(),
        operatorSuggest: z.string().optional(),
        operatorVote: z.enum(["agree", "pending"]).optional(),
        finalDecision: z.enum(["execute", "reject"]).optional(),
        rowHighlight: z.enum(["none", "green", "red"]).optional(),
        createdAt: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(titleItems).values({
        name: input.name,
        direction: input.direction ?? "",
        reference: input.reference ?? "",
        referenceImages: input.referenceImages ?? [],
        directorSuggest: input.directorSuggest ?? "",
        directorVote: input.directorVote ?? "pending",
        editorSuggest: input.editorSuggest ?? "",
        editorVote: input.editorVote ?? "pending",
        operatorSuggest: input.operatorSuggest ?? "",
        operatorVote: input.operatorVote ?? "pending",
        finalDecision: input.finalDecision ?? "execute",
        rowHighlight: input.rowHighlight ?? "none",
        createdAt: input.createdAt,
      });
      return { id: Number(result[0].insertId) };
    }),

  // Update a title item
  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        direction: z.string().optional(),
        reference: z.string().optional(),
        referenceImages: z.array(z.string()).optional(),
        directorSuggest: z.string().optional(),
        directorVote: z.enum(["agree", "pending"]).optional(),
        editorSuggest: z.string().optional(),
        editorVote: z.enum(["agree", "pending"]).optional(),
        operatorSuggest: z.string().optional(),
        operatorVote: z.enum(["agree", "pending"]).optional(),
        finalDecision: z.enum(["execute", "reject"]).optional(),
        rowHighlight: z.enum(["none", "green", "red"]).optional(),
        createdAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(titleItems).set(data).where(eq(titleItems.id, id));
      return { ok: true };
    }),

  // Delete a title item
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(titleItems).where(eq(titleItems.id, input.id));
      return { ok: true };
    }),

  // Bulk create (for import)
  bulkCreate: publicQuery
    .input(
      z.array(
        z.object({
          name: z.string(),
          direction: z.string(),
          reference: z.string(),
          referenceImages: z.array(z.string()),
          directorSuggest: z.string(),
          directorVote: z.enum(["agree", "pending"]),
          editorSuggest: z.string(),
          editorVote: z.enum(["agree", "pending"]),
          operatorSuggest: z.string(),
          operatorVote: z.enum(["agree", "pending"]),
          finalDecision: z.enum(["execute", "reject"]),
          rowHighlight: z.enum(["none", "green", "red"]),
          createdAt: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.length > 0) {
        await db.insert(titleItems).values(input);
      }
      return { count: input.length };
    }),

  // Bulk replace (delete all + create new)
  bulkReplace: publicQuery
    .input(
      z.array(
        z.object({
          name: z.string(),
          direction: z.string(),
          reference: z.string(),
          referenceImages: z.array(z.string()),
          directorSuggest: z.string(),
          directorVote: z.enum(["agree", "pending"]),
          editorSuggest: z.string(),
          editorVote: z.enum(["agree", "pending"]),
          operatorSuggest: z.string(),
          operatorVote: z.enum(["agree", "pending"]),
          finalDecision: z.enum(["execute", "reject"]),
          rowHighlight: z.enum(["none", "green", "red"]),
          createdAt: z.string(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(titleItems);
      if (input.length > 0) {
        await db.insert(titleItems).values(input);
      }
      return { count: input.length };
    }),
});
