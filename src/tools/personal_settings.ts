import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerPersonalSettingsTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List system statuses ───────────────────────────────────────
  server.tool(
    "lark_personal_list_system_statuses",
    "List available system statuses (e.g. In Meeting, On Leave)",
    {
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().personal_settings.systemStatus.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Batch open system status ───────────────────────────────────
  server.tool(
    "lark_personal_batch_open_status",
    "Batch enable a system status for users",
    {
      system_status_id: z.string().describe("System status ID"),
      user_list: z
        .string()
        .describe('JSON array of user objects [{user_id:"ou_xxx"}]'),
    },
    async ({ system_status_id, user_list }) =>
      safeCall(() =>
        getClient().personal_settings.systemStatus.batchOpen({
          path: { system_status_id },
          data: { user_list: JSON.parse(user_list) },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── Batch close system status ──────────────────────────────────
  server.tool(
    "lark_personal_batch_close_status",
    "Batch disable a system status for users",
    {
      system_status_id: z.string().describe("System status ID"),
      user_list: z
        .string()
        .describe('JSON array of user objects [{user_id:"ou_xxx"}]'),
    },
    async ({ system_status_id, user_list }) =>
      safeCall(() =>
        getClient().personal_settings.systemStatus.batchClose({
          path: { system_status_id },
          data: { user_list: JSON.parse(user_list) },
          params: { user_id_type: "open_id" },
        })
      )
  );
}
