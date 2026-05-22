import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { load, save } from "./lib/store";

const STORAGE_KEY = "position_tasks";

export const taskRouter = createRouter({
  list: publicQuery.query(async () => {
    return load(STORAGE_KEY, []);
  }),

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
      save(STORAGE_KEY, input);
      return { count: input.length };
    }),
});
