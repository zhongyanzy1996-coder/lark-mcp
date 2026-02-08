import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerLingoTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List entities (glossary terms) ─────────────────────────────
  server.tool(
    "lark_lingo_list_entities",
    "List glossary/terminology entries in Feishu Lingo",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
      provider: z.string().optional().describe("Filter by provider"),
    },
    async ({ page_size, page_token, provider }) =>
      safeCall(() =>
        getClient().lingo.v1.entity.list({
          params: { page_size, page_token, provider },
        })
      )
  );

  // ── Search entities ────────────────────────────────────────────
  server.tool(
    "lark_lingo_search_entities",
    "Search glossary entries by keyword",
    {
      query: z.string().optional().describe("Search keyword"),
      classification_filter: z
        .string()
        .optional()
        .describe("JSON classification filter"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ query, classification_filter, page_size, page_token }) =>
      safeCall(() =>
        getClient().lingo.v1.entity.search({
          data: {
            query,
            classification_filter: classification_filter
              ? JSON.parse(classification_filter)
              : undefined,
          } as any,
          params: { page_size, page_token },
        })
      )
  );

  // ── Get entity ─────────────────────────────────────────────────
  server.tool(
    "lark_lingo_get_entity",
    "Get a glossary entry by ID",
    {
      entity_id: z.string().describe("Entity ID"),
    },
    async ({ entity_id }) =>
      safeCall(() =>
        getClient().lingo.v1.entity.get({
          path: { entity_id },
        })
      )
  );

  // ── Create entity ──────────────────────────────────────────────
  server.tool(
    "lark_lingo_create_entity",
    "Create a new glossary entry",
    {
      main_keys: z.string().describe('JSON array of main terms, e.g. [{"key":"MCP","display_status":{"allow_highlight":true,"allow_search":true}}]'),
      description: z.string().describe("Term description/definition"),
      aliases: z.string().optional().describe("JSON array of alias terms"),
      related_meta: z.string().optional().describe("JSON related metadata"),
    },
    async ({ main_keys, description, aliases, related_meta }) =>
      safeCall(() =>
        getClient().lingo.v1.entity.create({
          data: {
            main_keys: JSON.parse(main_keys),
            description,
            aliases: aliases ? JSON.parse(aliases) : undefined,
            related_meta: related_meta ? JSON.parse(related_meta) : undefined,
          } as any,
        })
      )
  );

  // ── List classifications ───────────────────────────────────────
  server.tool(
    "lark_lingo_list_classifications",
    "List glossary classifications/categories",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().lingo.v1.classification.list({
          params: { page_size, page_token },
        })
      )
  );
}
