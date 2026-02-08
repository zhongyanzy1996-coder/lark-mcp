import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerAdminTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List audit logs ────────────────────────────────────────────
  server.tool(
    "lark_admin_list_audit_logs",
    "List admin audit logs (security events)",
    {
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().admin.auditInfo.list({
          params: { page_size, page_token } as any,
        })
      )
  );

  // ── List department stats ──────────────────────────────────────
  server.tool(
    "lark_admin_list_dept_stats",
    "List admin department statistics",
    {
      department_id_type: z
        .enum(["department_id", "open_department_id"])
        .default("open_department_id"),
      start_date: z.string().describe("Start date (YYYYMMDD)"),
      end_date: z.string().describe("End date (YYYYMMDD)"),
      department_id: z.string().optional().describe("Department ID filter"),
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ department_id_type, start_date, end_date, department_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().admin.adminDeptStat.list({
          params: {
            department_id_type,
            start_date,
            end_date,
            department_id,
            page_size,
            page_token,
          } as any,
        })
      )
  );

  // ── List user stats ────────────────────────────────────────────
  server.tool(
    "lark_admin_list_user_stats",
    "List admin user statistics",
    {
      user_id_type: z.enum(["open_id", "user_id", "union_id"]).default("open_id"),
      department_id_type: z
        .enum(["department_id", "open_department_id"])
        .default("open_department_id"),
      start_date: z.string().describe("Start date (YYYYMMDD)"),
      end_date: z.string().describe("End date (YYYYMMDD)"),
      department_id: z.string().optional(),
      user_id: z.string().optional(),
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ user_id_type, department_id_type, start_date, end_date, department_id, user_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().admin.adminUserStat.list({
          params: {
            user_id_type,
            department_id_type,
            start_date,
            end_date,
            department_id,
            user_id,
            page_size,
            page_token,
          },
        })
      )
  );

  // ── List badges ────────────────────────────────────────────────
  server.tool(
    "lark_admin_list_badges",
    "List admin badges",
    {
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().admin.badge.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Reset user password ────────────────────────────────────────
  server.tool(
    "lark_admin_reset_password",
    "Reset a user's password (admin operation)",
    {
      user_id: z.string().describe("User open_id"),
      password: z.string().describe("New password"),
    },
    async ({ user_id, password }) =>
      safeCall(() =>
        getClient().admin.password.reset({
          data: {
            password: { ent_email_password: password },
            user_id,
          },
          params: { user_id_type: "open_id" },
        })
      )
  );
}
