import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerVcTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Reserve a meeting ──────────────────────────────────────────
  server.tool(
    "lark_vc_reserve_meeting",
    "Reserve (schedule) a video conference meeting",
    {
      subject: z.string().describe("Meeting subject/title"),
      start_time: z.string().describe("Start time (Unix seconds)"),
      end_time: z.string().describe("End time (Unix seconds)"),
      meeting_settings: z
        .string()
        .optional()
        .describe("JSON meeting settings {owner_id, join_meeting_permission, ...}"),
    },
    async ({ subject, start_time, end_time, meeting_settings }) =>
      safeCall(() =>
        getClient().vc.reserve.apply({
          data: {
            subject,
            start_time,
            end_time,
            meeting_settings: meeting_settings
              ? JSON.parse(meeting_settings)
              : undefined,
          } as any,
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── Get meeting info ───────────────────────────────────────────
  server.tool(
    "lark_vc_get_meeting",
    "Get details of a video conference meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
    },
    async ({ meeting_id }) =>
      safeCall(() =>
        getClient().vc.meeting.get({
          path: { meeting_id },
          params: { with_participants: true, user_id_type: "open_id" },
        })
      )
  );

  // ── List meetings by number ────────────────────────────────────
  server.tool(
    "lark_vc_list_meetings",
    "List meetings by meeting number",
    {
      meeting_no: z.string().describe("Meeting number"),
      start_time: z.string().optional().describe("Start time filter (Unix seconds)"),
      end_time: z.string().optional().describe("End time filter (Unix seconds)"),
      page_size: z.number().max(50).default(20),
      page_token: z.string().optional(),
    },
    async ({ meeting_no, start_time, end_time, page_size, page_token }) =>
      safeCall(() =>
        getClient().vc.meeting.listByNo({
          params: {
            meeting_no,
            start_time,
            end_time,
            page_size,
            page_token,
          } as any,
        })
      )
  );

  // ── End meeting ────────────────────────────────────────────────
  server.tool(
    "lark_vc_end_meeting",
    "End an active video conference meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
    },
    async ({ meeting_id }) =>
      safeCall(() =>
        getClient().vc.meeting.end({ path: { meeting_id } })
      )
  );

  // ── Get recording ──────────────────────────────────────────────
  server.tool(
    "lark_vc_get_recording",
    "Get recording info for a meeting",
    {
      meeting_id: z.string().describe("Meeting ID"),
    },
    async ({ meeting_id }) =>
      safeCall(() =>
        getClient().vc.meetingRecording.get({ path: { meeting_id } })
      )
  );

  // ── List rooms ─────────────────────────────────────────────────
  server.tool(
    "lark_vc_list_rooms",
    "List meeting rooms",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().vc.room.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Search rooms ───────────────────────────────────────────────
  server.tool(
    "lark_vc_search_rooms",
    "Search meeting rooms by keyword",
    {
      query: z.string().describe("Search keyword"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ query, page_size, page_token }) =>
      safeCall(() =>
        getClient().vc.room.search({
          data: { query },
          params: { page_size, page_token },
        } as any)
      )
  );

  // ── Get daily report ───────────────────────────────────────────
  server.tool(
    "lark_vc_get_daily_report",
    "Get daily VC usage report",
    {
      start_time: z.string().describe("Start date (Unix seconds)"),
      end_time: z.string().describe("End date (Unix seconds)"),
    },
    async ({ start_time, end_time }) =>
      safeCall(() =>
        getClient().vc.report.getDaily({
          params: { start_time, end_time },
        })
      )
  );

  // ── Get top users ──────────────────────────────────────────────
  server.tool(
    "lark_vc_get_top_users",
    "Get top VC users report",
    {
      start_time: z.string().describe("Start date (Unix seconds)"),
      end_time: z.string().describe("End date (Unix seconds)"),
      limit: z.number().max(100).default(10),
      order_by: z.enum(["total_duration", "meeting_count"]).default("total_duration"),
    },
    async ({ start_time, end_time, limit, order_by }) =>
      safeCall(() =>
        getClient().vc.report.getTopUser({
          params: { start_time, end_time, limit: String(limit), order_by } as any,
        })
      )
  );
}
