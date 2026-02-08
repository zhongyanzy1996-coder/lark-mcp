import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerEhrTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List EHR employees ─────────────────────────────────────────
  server.tool(
    "lark_ehr_list_employees",
    "List employee HR records (EHR lightweight view)",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      status: z
        .array(z.number())
        .optional()
        .describe("Status filter (2=Active, 4=Left)"),
      user_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by user IDs"),
    },
    async ({ page_size, page_token, status, user_ids }) =>
      safeCall(() =>
        getClient().ehr.employee.list({
          params: {
            page_size,
            page_token,
            status,
            user_ids,
            user_id_type: "open_id",
            view: "full",
          } as any,
        })
      )
  );

  // ── Get EHR attachment ─────────────────────────────────────────
  server.tool(
    "lark_ehr_get_attachment",
    "Get an EHR attachment URL",
    {
      token: z.string().describe("Attachment token"),
    },
    async ({ token }) =>
      safeCall(() =>
        getClient().ehr.attachment.get({
          path: { token },
        })
      )
  );
}
