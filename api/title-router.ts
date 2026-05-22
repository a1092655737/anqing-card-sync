import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { load, save } from "./lib/store";

const STORAGE_KEY = "title_items";

export const titleRouter = createRouter({
  list: publicQuery.query(async () => {
    return load(STORAGE_KEY, []);
  }),

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
      save(STORAGE_KEY, input);
      return { count: input.length };
    }),
});
