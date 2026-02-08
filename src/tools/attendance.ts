import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerAttendanceTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get attendance group ───────────────────────────────────────
  server.tool(
    "lark_attendance_get_group",
    "Get an attendance group configuration",
    {
      group_id: z.string().describe("Attendance group ID"),
    },
    async ({ group_id }) =>
      safeCall(() =>
        getClient().attendance.group.get({
          path: { group_id },
          params: { employee_type: "employee_id", dept_type: "open_id" as const },
        })
      )
  );

  // ── Search attendance groups ───────────────────────────────────
  server.tool(
    "lark_attendance_search_groups",
    "Search attendance groups by name",
    {
      group_name: z.string().describe("Group name to search"),
    },
    async ({ group_name }) =>
      safeCall(() =>
        getClient().attendance.group.search({
          data: { group_name },
        })
      )
  );

  // ── List shifts ────────────────────────────────────────────────
  server.tool(
    "lark_attendance_list_shifts",
    "List available attendance shifts",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().attendance.shift.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Get shift ──────────────────────────────────────────────────
  server.tool(
    "lark_attendance_get_shift",
    "Get a specific shift configuration",
    {
      shift_id: z.string().describe("Shift ID"),
    },
    async ({ shift_id }) =>
      safeCall(() =>
        getClient().attendance.shift.get({
          path: { shift_id },
        })
      )
  );

  // ── Query user task (check records) ────────────────────────────
  server.tool(
    "lark_attendance_query_user_task",
    "Query user attendance check-in/out records for a date range",
    {
      user_ids: z.array(z.string()).describe("List of employee IDs"),
      check_date_from: z.number().describe("Start date (YYYYMMDD as number)"),
      check_date_to: z.number().describe("End date (YYYYMMDD as number)"),
    },
    async ({ user_ids, check_date_from, check_date_to }) =>
      safeCall(() =>
        getClient().attendance.userTask.query({
          data: { user_ids, check_date_from, check_date_to },
          params: { employee_type: "employee_id" },
        })
      )
  );

  // ── Query user stats data ──────────────────────────────────────
  server.tool(
    "lark_attendance_query_stats",
    "Query aggregated attendance statistics",
    {
      user_ids: z.array(z.string()).describe("List of employee IDs"),
      start_date: z.string().describe("Start date (YYYYMMDD)"),
      end_date: z.string().describe("End date (YYYYMMDD)"),
      locale: z.enum(["en", "ja", "zh"]).default("zh"),
    },
    async ({ user_ids, start_date, end_date, locale }) =>
      safeCall(() =>
        getClient().attendance.userStatsData.query({
          data: {
            user_ids,
            start_date,
            end_date,
            locale,
          } as any,
          params: { employee_type: "employee_id" },
        })
      )
  );

  // ── Query user flows (raw check records) ───────────────────────
  server.tool(
    "lark_attendance_query_user_flow",
    "Query raw check-in/out flow records for users",
    {
      user_ids: z.array(z.string()).describe("List of employee IDs"),
      check_time_from: z.string().describe("Start timestamp (seconds)"),
      check_time_to: z.string().describe("End timestamp (seconds)"),
    },
    async ({ user_ids, check_time_from, check_time_to }) =>
      safeCall(() =>
        getClient().attendance.userFlow.query({
          data: { user_ids, check_time_from, check_time_to },
          params: { employee_type: "employee_id" },
        })
      )
  );
}
