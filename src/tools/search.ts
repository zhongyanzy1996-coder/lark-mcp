import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerSearchTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Search messages ────────────────────────────────────────────
  server.tool(
    "lark_search_messages",
    "Search messages across chats in Feishu",
    {
      query: z.string().describe("Search query keyword"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
      chat_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by chat IDs"),
      from_user_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by sender open_ids"),
      message_type: z
        .enum(["file", "image", "media"])
        .optional()
        .describe("Filter by message type"),
      start_time: z.string().optional().describe("Start timestamp (seconds)"),
      end_time: z.string().optional().describe("End timestamp (seconds)"),
    },
    async ({
      query,
      page_size,
      page_token,
      chat_ids,
      from_user_ids,
      message_type,
      start_time,
      end_time,
    }) =>
      safeCall(() =>
        getClient().search.message.create({
          data: {
            query,
            from_ids: from_user_ids,
            chat_ids,
            message_type,
            start_time,
            end_time,
          },
          params: {
            page_size,
            page_token,
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Search docs ────────────────────────────────────────────────
  server.tool(
    "lark_search_docs",
    "Search across Feishu documents, spreadsheets, and other file types",
    {
      query: z.string().describe("Search query"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
      docs_types: z
        .array(
          z.enum([
            "doc",
            "docx",
            "sheet",
            "bitable",
            "mindnote",
            "slides",
            "wiki",
          ])
        )
        .optional()
        .describe("Filter by doc types"),
      owner_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by owner open_ids"),
      chat_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by shared chat IDs"),
    },
    async ({ query, page_size, page_token, docs_types, owner_ids, chat_ids }) =>
      safeCall(() =>
        getClient().search.app.create({
          data: {
            query,
          },
          params: {
            page_size,
            page_token,
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Search data source items ───────────────────────────────────
  server.tool(
    "lark_search_data_source",
    "Search items in a custom data source (for enterprise search)",
    {
      query: z.string().describe("Search query"),
      data_source_id: z.string().describe("Data source ID"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ query, data_source_id, page_size, page_token }) =>
      safeCall(() =>
        (getClient() as any).request({
          method: "POST",
          url: "/open-apis/search/v2/data_sources/" + data_source_id + "/items",
          params: { page_size, page_token },
          data: { query },
        })
      )
  );
}
