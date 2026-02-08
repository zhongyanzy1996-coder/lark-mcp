import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerAcsTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List access records ────────────────────────────────────────
  server.tool(
    "lark_acs_list_access_records",
    "List physical access control records",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      from: z.number().optional().describe("Start timestamp (seconds)"),
      to: z.number().optional().describe("End timestamp (seconds)"),
      user_id: z.string().optional().describe("Filter by user ID"),
    },
    async ({ page_size, page_token, from, to, user_id }) =>
      safeCall(() =>
        getClient().acs.accessRecord.list({
          params: {
            page_size,
            page_token,
            from,
            to,
            user_id_type: "open_id",
            user_id,
          } as any,
        })
      )
  );

  // ── List devices ───────────────────────────────────────────────
  server.tool(
    "lark_acs_list_devices",
    "List access control devices",
    {},
    async () =>
      safeCall(() => getClient().acs.device.list({}))
  );

  // ── Create visitor ─────────────────────────────────────────────
  server.tool(
    "lark_acs_create_visitor",
    "Register a visitor for access control",
    {
      visitor_body: z.string().describe("JSON visitor object {user, department, ...}"),
    },
    async ({ visitor_body }) =>
      safeCall(() =>
        getClient().acs.visitor.create({
          data: JSON.parse(visitor_body),
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── Get ACS user ───────────────────────────────────────────────
  server.tool(
    "lark_acs_get_user",
    "Get an access control user profile",
    {
      user_id: z.string().describe("ACS user ID"),
    },
    async ({ user_id }) =>
      safeCall(() =>
        getClient().acs.user.get({
          path: { user_id },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── List ACS users ─────────────────────────────────────────────
  server.tool(
    "lark_acs_list_users",
    "List access control users",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().acs.user.list({
          params: { page_size, page_token, user_id_type: "open_id" },
        })
      )
  );
}
