import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerWikiTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List wiki spaces ───────────────────────────────────────────
  server.tool(
    "lark_wiki_list_spaces",
    "List all wiki spaces accessible to the app",
    {
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().wiki.space.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Get wiki space ─────────────────────────────────────────────
  server.tool(
    "lark_wiki_get_space",
    "Get info about a specific wiki space",
    {
      space_id: z.string().describe("Wiki space ID"),
    },
    async ({ space_id }) =>
      safeCall(() =>
        getClient().wiki.space.get({ path: { space_id } })
      )
  );

  // ── List wiki nodes ────────────────────────────────────────────
  server.tool(
    "lark_wiki_list_nodes",
    "List nodes (pages) in a wiki space",
    {
      space_id: z.string().describe("Wiki space ID"),
      parent_node_token: z
        .string()
        .optional()
        .describe("Parent node token (empty = root)"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ space_id, parent_node_token, page_size, page_token }) =>
      safeCall(() =>
        getClient().wiki.spaceNode.list({
          path: { space_id },
          params: { parent_node_token, page_size, page_token },
        } as any)
      )
  );

  // ── Get wiki node ──────────────────────────────────────────────
  server.tool(
    "lark_wiki_get_node",
    "Get info about a wiki node by token",
    {
      token: z.string().describe("Node token"),
    },
    async ({ token }) =>
      safeCall(() =>
        getClient().wiki.space.getNode({
          params: { token },
        })
      )
  );

  // ── Create wiki node ───────────────────────────────────────────
  server.tool(
    "lark_wiki_create_node",
    "Create a new wiki node (page) in a space",
    {
      space_id: z.string().describe("Wiki space ID"),
      obj_type: z
        .enum(["doc", "docx", "sheet", "mindnote", "bitable", "file", "slides"])
        .describe("Node document type"),
      parent_node_token: z
        .string()
        .optional()
        .describe("Parent node token (empty = root)"),
      title: z.string().optional().describe("Node title"),
    },
    async ({ space_id, obj_type, parent_node_token, title }) =>
      safeCall(() =>
        getClient().wiki.spaceNode.create({
          path: { space_id },
          data: { obj_type, parent_node_token, title },
        } as any)
      )
  );

  // ── Move wiki node ─────────────────────────────────────────────
  server.tool(
    "lark_wiki_move_node",
    "Move a wiki node to a different parent or space",
    {
      space_id: z.string().describe("Source space ID"),
      node_token: z.string().describe("Node token to move"),
      target_parent_token: z
        .string()
        .optional()
        .describe("Target parent node token"),
      target_space_id: z
        .string()
        .optional()
        .describe("Target space ID (for cross-space move)"),
    },
    async ({ space_id, node_token, target_parent_token, target_space_id }) =>
      safeCall(() =>
        getClient().wiki.spaceNode.move({
          path: { space_id, node_token },
          data: { target_parent_token, target_space_id },
        } as any)
      )
  );

  // ── Move docs to wiki ──────────────────────────────────────────
  server.tool(
    "lark_wiki_move_docs_to_wiki",
    "Move an existing Drive document into a wiki space as a node",
    {
      space_id: z.string().describe("Target wiki space ID"),
      parent_wiki_token: z
        .string()
        .optional()
        .describe("Parent node token in wiki"),
      obj_type: z
        .enum(["doc", "docx", "sheet", "mindnote", "bitable", "file", "slides"])
        .describe("Document type"),
      obj_token: z.string().describe("Document token to move"),
    },
    async ({ space_id, parent_wiki_token, obj_type, obj_token }) =>
      safeCall(() =>
        getClient().wiki.spaceNode.create({
          path: { space_id },
          data: {
            obj_type,
            obj_token,
            parent_node_token: parent_wiki_token,
          },
        } as any)
      )
  );
}
