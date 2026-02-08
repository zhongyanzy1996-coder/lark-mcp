import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerDocsTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Create document ────────────────────────────────────────────
  server.tool(
    "lark_docs_create_document",
    "Create a new Feishu document",
    {
      title: z.string().optional().describe("Document title"),
      folder_token: z
        .string()
        .optional()
        .describe("Folder token to create the doc in"),
    },
    async ({ title, folder_token }) =>
      safeCall(() =>
        getClient().docx.document.create({
          data: { title, folder_token },
        })
      )
  );

  // ── Get document metadata ──────────────────────────────────────
  server.tool(
    "lark_docs_get_document",
    "Get metadata of a Feishu document (title, revision, etc.)",
    {
      document_id: z.string().describe("Document ID (doc token)"),
    },
    async ({ document_id }) =>
      safeCall(() =>
        getClient().docx.document.get({
          path: { document_id },
        })
      )
  );

  // ── Get document raw content ───────────────────────────────────
  server.tool(
    "lark_docs_get_raw_content",
    "Get the plain-text content of a Feishu document",
    {
      document_id: z.string().describe("Document ID"),
    },
    async ({ document_id }) =>
      safeCall(() =>
        getClient().docx.document.rawContent({
          path: { document_id },
        })
      )
  );

  // ── List document blocks ───────────────────────────────────────
  server.tool(
    "lark_docs_list_blocks",
    "List all blocks in a Feishu document",
    {
      document_id: z.string().describe("Document ID"),
      page_size: z.number().max(500).default(100).describe("Page size"),
      page_token: z.string().optional().describe("Pagination token"),
    },
    async ({ document_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().docx.documentBlock.list({
          path: { document_id },
          params: {
            page_size,
            page_token,
            document_revision_id: -1,
          },
        })
      )
  );

  // ── Get a single block ─────────────────────────────────────────
  server.tool(
    "lark_docs_get_block",
    "Get a specific block in a document",
    {
      document_id: z.string().describe("Document ID"),
      block_id: z.string().describe("Block ID"),
    },
    async ({ document_id, block_id }) =>
      safeCall(() =>
        getClient().docx.documentBlock.get({
          path: { document_id, block_id },
          params: { document_revision_id: -1 },
        })
      )
  );

  // ── Create block (append children) ─────────────────────────────
  server.tool(
    "lark_docs_create_block",
    "Append child blocks under a parent block in a document. Use block_id = document_id to append to root.",
    {
      document_id: z.string().describe("Document ID"),
      block_id: z
        .string()
        .describe("Parent block ID (use document_id for root)"),
      children: z
        .string()
        .describe(
          "JSON array of block objects to insert. Each block needs block_type and corresponding content field."
        ),
      index: z
        .number()
        .optional()
        .describe("Insert position index (-1 = end)"),
    },
    async ({ document_id, block_id, children, index }) =>
      safeCall(() =>
        getClient().docx.documentBlockChildren.create({
          path: { document_id, block_id },
          params: { document_revision_id: -1 },
          data: {
            children: JSON.parse(children),
            index: index ?? -1,
          },
        })
      )
  );

  // ── Update block ───────────────────────────────────────────────
  server.tool(
    "lark_docs_update_block",
    "Update the content of a block (e.g. change text, update a table cell)",
    {
      document_id: z.string().describe("Document ID"),
      block_id: z.string().describe("Block ID to update"),
      update_body: z
        .string()
        .describe(
          "JSON object describing the update. Must contain the appropriate update action for the block type."
        ),
    },
    async ({ document_id, block_id, update_body }) =>
      safeCall(() =>
        getClient().docx.documentBlock.patch({
          path: { document_id, block_id },
          params: { document_revision_id: -1 },
          data: JSON.parse(update_body),
        })
      )
  );

  // ── Delete block ───────────────────────────────────────────────
  server.tool(
    "lark_docs_delete_block",
    "Delete child blocks under a parent block",
    {
      document_id: z.string().describe("Document ID"),
      block_id: z
        .string()
        .describe("Parent block ID whose children to delete"),
      start_index: z.number().describe("Start index of children to delete"),
      end_index: z.number().describe("End index (exclusive) of children to delete"),
    },
    async ({ document_id, block_id, start_index, end_index }) =>
      safeCall(() =>
        getClient().docx.documentBlockChildren.batchDelete({
          path: { document_id, block_id },
          params: { document_revision_id: -1 },
          data: { start_index, end_index },
        })
      )
  );
}
