import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerContactTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get user info ──────────────────────────────────────────────
  server.tool(
    "lark_contact_get_user",
    "Get information about a user by ID",
    {
      user_id: z.string().describe("User ID"),
      user_id_type: z
        .enum(["open_id", "union_id", "user_id"])
        .default("open_id")
        .describe("ID type"),
    },
    async ({ user_id, user_id_type }) =>
      safeCall(() =>
        getClient().contact.user.get({
          path: { user_id },
          params: { user_id_type },
        })
      )
  );

  // ── Batch get user IDs ─────────────────────────────────────────
  server.tool(
    "lark_contact_batch_get_user_id",
    "Get user IDs from emails or mobiles",
    {
      emails: z
        .array(z.string())
        .optional()
        .describe("List of emails to look up"),
      mobiles: z
        .array(z.string())
        .optional()
        .describe("List of mobile numbers to look up"),
    },
    async ({ emails, mobiles }) =>
      safeCall(() =>
        getClient().contact.user.batchGetId({
          data: { emails, mobiles },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── List users in department ───────────────────────────────────
  server.tool(
    "lark_contact_list_users",
    "List users in a department",
    {
      department_id: z
        .string()
        .describe('Department ID (use "0" for root)'),
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      department_id_type: z
        .enum(["department_id", "open_department_id"])
        .default("open_department_id"),
    },
    async ({ department_id, page_size, page_token, department_id_type }) =>
      safeCall(() =>
        getClient().contact.user.findByDepartment({
          params: {
            department_id,
            page_size,
            page_token,
            user_id_type: "open_id",
            department_id_type,
          },
        })
      )
  );

  // ── Search users ───────────────────────────────────────────────
  server.tool(
    "lark_contact_search_user",
    "Search users by name or other criteria",
    {
      query: z.string().describe("Search query (name, email, etc.)"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ query, page_size, page_token }) =>
      safeCall(() =>
        (getClient() as any).request({
          method: "POST",
          url: "/open-apis/search/v1/user",
          data: { query },
          params: {
            page_size,
            page_token,
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Get department ─────────────────────────────────────────────
  server.tool(
    "lark_contact_get_department",
    "Get department information",
    {
      department_id: z.string().describe("Department ID"),
      department_id_type: z
        .enum(["department_id", "open_department_id"])
        .default("open_department_id"),
    },
    async ({ department_id, department_id_type }) =>
      safeCall(() =>
        getClient().contact.department.get({
          path: { department_id },
          params: { department_id_type, user_id_type: "open_id" },
        })
      )
  );

  // ── List child departments ─────────────────────────────────────
  server.tool(
    "lark_contact_list_departments",
    "List child departments under a parent department",
    {
      parent_department_id: z
        .string()
        .describe('Parent department ID (use "0" for root)'),
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      department_id_type: z
        .enum(["department_id", "open_department_id"])
        .default("open_department_id"),
      fetch_child: z
        .boolean()
        .default(false)
        .describe("Whether to recursively fetch all children"),
    },
    async ({
      parent_department_id,
      page_size,
      page_token,
      department_id_type,
      fetch_child,
    }) =>
      safeCall(() =>
        getClient().contact.department.children({
          path: { department_id: parent_department_id },
          params: {
            page_size,
            page_token,
            department_id_type,
            user_id_type: "open_id",
            fetch_child,
          },
        })
      )
  );

  // ── List user groups ───────────────────────────────────────────
  server.tool(
    "lark_contact_list_groups",
    "List user groups in the organization",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      type: z
        .number()
        .optional()
        .describe("Group type (1=Normal, 2=Dynamic)"),
    },
    async ({ page_size, page_token, type }) =>
      safeCall(() =>
        getClient().contact.group.simplelist({
          params: { page_size, page_token, type },
        })
      )
  );
}
