import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerWorkplaceTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Search workplace access data ───────────────────────────────
  server.tool(
    "lark_workplace_search_access_data",
    "Search workplace portal access analytics data",
    {
      from_date: z.string().describe("Start date (YYYYMMDD)"),
      to_date: z.string().describe("End date (YYYYMMDD)"),
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ from_date, to_date, page_size, page_token }) =>
      safeCall(() =>
        getClient().workplace.workplaceAccessData.search({
          params: { from_date, to_date, page_size, page_token },
        })
      )
  );

  // ── Search custom workplace access data ────────────────────────
  server.tool(
    "lark_workplace_search_custom_access_data",
    "Search custom workplace widget access analytics",
    {
      from_date: z.string().describe("Start date (YYYYMMDD)"),
      to_date: z.string().describe("End date (YYYYMMDD)"),
      custom_workplace_id: z.string().optional().describe("Custom workplace ID"),
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ from_date, to_date, custom_workplace_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().workplace.customWorkplaceAccessData.search({
          params: { from_date, to_date, custom_workplace_id, page_size, page_token },
        })
      )
  );
}
