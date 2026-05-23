import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getPlanetScalePool } from "./queries/planetscale";

export const taskRouter = createRouter({
  list: publicQuery.query(async () => {
    const pool = getPlanetScalePool();
    const [rows] = await pool.execute(
      "SELECT * FROM position_tasks ORDER BY id DESC"
    );
    return (rows as any[]).map((r) => ({
      id: r.id,
      cardProduct: r.card_product || "",
      topicName: r.topic_name || "",
      publishAccount: r.publish_account || "",
      copywriter: r.copywriter || "",
      copyStartTime: r.copy_start_time || "",
      copyEndTime: r.copy_end_time || "",
      videoProducer: r.video_producer || "",
      videoStartTime: r.video_start_time || "",
      videoEndTime: r.video_end_time || "",
      publishTime: r.publish_time || "",
    }));
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
      const pool = getPlanetScalePool();
      await pool.execute("DELETE FROM position_tasks");
      if (input.length > 0) {
        const placeholders = input.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(",");
        const params = input.flatMap((item) => [
          item.cardProduct,
          item.topicName,
          item.publishAccount,
          item.copywriter,
          item.copyStartTime,
          item.copyEndTime,
          item.videoProducer,
          item.videoStartTime,
          item.videoEndTime,
          item.publishTime,
        ]);
        await pool.execute(
          `INSERT INTO position_tasks (card_product, topic_name, publish_account, copywriter, copy_start_time, copy_end_time, video_producer, video_start_time, video_end_time, publish_time) VALUES ${placeholders}`,
          params
        );
      }
      return { count: input.length };
    }),
});
