import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerApplicationTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get application info ───────────────────────────────────────
  server.tool(
    "lark_app_get",
    "Get information about a Feishu application",
    {
      app_id: z.string().describe("Application ID"),
    },
    async ({ app_id }) =>
      safeCall(() =>
        getClient().application.application.get({
          path: { app_id },
          params: { lang: "zh_cn" },
        })
      )
  );

  // ── List applications ──────────────────────────────────────────
  server.tool(
    "lark_app_list",
    "List Feishu applications in the organization",
    {
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
      lang: z.enum(["zh_cn", "en_us", "ja_jp"]).default("zh_cn"),
    },
    async ({ page_size, page_token, lang }) =>
      safeCall(() =>
        getClient().application.application.list({
          params: { page_size, page_token, lang },
        })
      )
  );

  // ── Get app usage overview ─────────────────────────────────────
  server.tool(
    "lark_app_usage_overview",
    "Get application usage statistics overview",
    {
      app_id: z.string().describe("Application ID"),
      date: z.string().describe("Date (YYYYMMDD format)"),
      cycle_type: z.number().describe("1=Daily, 2=Weekly, 3=Monthly"),
      ability: z.enum(["app", "mp", "h5", "bot", "gadget"]).optional(),
    },
    async ({ app_id, date, cycle_type, ability }) =>
      safeCall(() =>
        getClient().application.applicationAppUsage.overview({
          path: { app_id },
          data: { date, cycle_type, ability } as any,
          params: { department_id_type: "open_department_id" },
        })
      )
  );

  // ── Get department usage overview ──────────────────────────────
  server.tool(
    "lark_app_department_overview",
    "Get application usage by department",
    {
      app_id: z.string().describe("Application ID"),
      date: z.string().describe("Date (YYYYMMDD)"),
      cycle_type: z.number().describe("1=Daily, 2=Weekly, 3=Monthly"),
      department_id: z.string().optional().describe("Department ID filter"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ app_id, date, cycle_type, department_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().application.applicationAppUsage.departmentOverview({
          path: { app_id },
          data: { date, cycle_type, department_id, page_size, page_token } as any,
          params: { department_id_type: "open_department_id" },
        })
      )
  );

  // ── List app feedback ──────────────────────────────────────────
  server.tool(
    "lark_app_list_feedback",
    "List user feedback for an application",
    {
      app_id: z.string().describe("Application ID"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
      feedback_type: z.number().optional().describe("1=Positive, 2=Negative"),
      status: z.number().optional().describe("0=Unprocessed, 1=Processing, 2=Processed, 3=Closed"),
    },
    async ({ app_id, page_size, page_token, feedback_type, status }) =>
      safeCall(() =>
        getClient().application.applicationFeedback.list({
          path: { app_id },
          params: { page_size, page_token, feedback_type, status, user_id_type: "open_id" },
        })
      )
  );
}
