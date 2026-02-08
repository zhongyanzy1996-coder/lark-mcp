import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerOkrTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List OKR periods ───────────────────────────────────────────
  server.tool(
    "lark_okr_list_periods",
    "List OKR periods (quarters/cycles)",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().okr.period.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── List user OKRs ─────────────────────────────────────────────
  server.tool(
    "lark_okr_list_user_okrs",
    "List OKRs for a specific user in a period",
    {
      user_id: z.string().describe("User open_id"),
      offset: z.number().default(0),
      limit: z.number().max(50).default(20),
    },
    async ({ user_id, offset, limit }) =>
      safeCall(() =>
        getClient().okr.userOkr.list({
          path: { user_id },
          params: {
            offset: String(offset),
            limit: String(limit),
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Batch get OKRs ─────────────────────────────────────────────
  server.tool(
    "lark_okr_batch_get",
    "Batch get OKR details by IDs",
    {
      okr_ids: z.array(z.string()).describe("List of OKR IDs"),
    },
    async ({ okr_ids }) =>
      safeCall(() =>
        getClient().okr.okr.batchGet({
          params: {
            okr_ids,
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Create progress record ─────────────────────────────────────
  server.tool(
    "lark_okr_create_progress",
    "Create a progress record for an OKR",
    {
      okr_id: z.string().describe("OKR ID"),
      content: z.string().describe("JSON content object for the progress update"),
    },
    async ({ okr_id, content }) =>
      safeCall(() =>
        getClient().okr.progressRecord.create({
          data: {
            source_id: okr_id,
            source_type: 1,
            content: JSON.parse(content),
          } as any,
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── Get progress record ────────────────────────────────────────
  server.tool(
    "lark_okr_get_progress",
    "Get a specific progress record",
    {
      progress_id: z.string().describe("Progress record ID"),
    },
    async ({ progress_id }) =>
      safeCall(() =>
        getClient().okr.progressRecord.get({
          path: { progress_id },
          params: { user_id_type: "open_id" },
        })
      )
  );
}
