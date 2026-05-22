import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getPool } from "./queries/connection";

export const titleRouter = createRouter({
  // List all title items
  list: publicQuery.query(async () => {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, name, direction, reference, reference_images, director_suggest, director_vote, editor_suggest, editor_vote, operator_suggest, operator_vote, final_decision, row_highlight, created_at FROM title_items ORDER BY id DESC"
    );
    return (rows as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      direction: r.direction || "",
      reference: r.reference || "",
      referenceImages: JSON.parse(r.reference_images || "[]"),
      directorSuggest: r.director_suggest || "",
      directorVote: r.director_vote || "pending",
      editorSuggest: r.editor_suggest || "",
      editorVote: r.editor_vote || "pending",
      operatorSuggest: r.operator_suggest || "",
      operatorVote: r.operator_vote || "pending",
      finalDecision: r.final_decision || "execute",
      rowHighlight: r.row_highlight || "none",
      createdAt: r.created_at,
    }));
  }),

  // Bulk replace (for sync)
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
      const pool = getPool();
      await pool.execute("DELETE FROM title_items");
      if (input.length > 0) {
        const values = input.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(",");
        const params = input.flatMap((item) => [
          item.name,
          item.direction,
          item.reference,
          JSON.stringify(item.referenceImages),
          item.directorSuggest,
          item.directorVote,
          item.editorSuggest,
          item.editorVote,
          item.operatorSuggest,
          item.operatorVote,
          item.finalDecision,
          item.rowHighlight,
          item.createdAt,
        ]);
        await pool.execute(
          `INSERT INTO title_items (name, direction, reference, reference_images, director_suggest, director_vote, editor_suggest, editor_vote, operator_suggest, operator_vote, final_decision, row_highlight, created_at) VALUES ${values}`,
          params
        );
      }
      return { count: input.length };
    }),
});
