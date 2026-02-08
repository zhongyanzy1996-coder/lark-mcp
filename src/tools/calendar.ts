import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerCalendarTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List calendars ─────────────────────────────────────────────
  server.tool(
    "lark_calendar_list",
    "List calendars accessible to the current user/app",
    {
      page_size: z.number().max(500).default(50),
      page_token: z.string().optional(),
      sync_token: z.string().optional().describe("Sync token for incremental sync"),
    },
    async ({ page_size, page_token, sync_token }) =>
      safeCall(() =>
        getClient().calendar.calendar.list({
          params: { page_size, page_token, sync_token },
        })
      )
  );

  // ── Get calendar ───────────────────────────────────────────────
  server.tool(
    "lark_calendar_get",
    "Get a calendar by ID",
    {
      calendar_id: z.string().describe("Calendar ID"),
    },
    async ({ calendar_id }) =>
      safeCall(() =>
        getClient().calendar.calendar.get({
          path: { calendar_id },
        })
      )
  );

  // ── Create event ───────────────────────────────────────────────
  server.tool(
    "lark_calendar_create_event",
    "Create a calendar event",
    {
      calendar_id: z.string().describe("Calendar ID"),
      summary: z.string().describe("Event title"),
      description: z.string().optional().describe("Event description"),
      start_time: z
        .string()
        .describe("Start time as Unix timestamp (seconds) or RFC3339"),
      end_time: z
        .string()
        .describe("End time as Unix timestamp (seconds) or RFC3339"),
      attendees: z
        .string()
        .optional()
        .describe("JSON array of attendees [{type, id}]"),
      location: z.string().optional().describe("Event location name"),
      need_notification: z.boolean().default(true).describe("Send notification"),
    },
    async ({
      calendar_id,
      summary,
      description,
      start_time,
      end_time,
      attendees,
      location,
      need_notification,
    }) =>
      safeCall(() =>
        getClient().calendar.calendarEvent.create({
          path: { calendar_id },
          data: {
            summary,
            description,
            need_notification,
            start_time: { timestamp: start_time },
            end_time: { timestamp: end_time },
            attendee_ability: "can_invite_others",
            location: location ? { name: location } : undefined,
          } as any,
        })
      )
  );

  // ── List events ────────────────────────────────────────────────
  server.tool(
    "lark_calendar_list_events",
    "List events in a calendar within a time range",
    {
      calendar_id: z.string().describe("Calendar ID"),
      start_time: z
        .string()
        .optional()
        .describe("Start of time range (Unix seconds)"),
      end_time: z
        .string()
        .optional()
        .describe("End of time range (Unix seconds)"),
      page_size: z.number().max(500).default(50),
      page_token: z.string().optional(),
    },
    async ({ calendar_id, start_time, end_time, page_size, page_token }) =>
      safeCall(() =>
        getClient().calendar.calendarEvent.list({
          path: { calendar_id },
          params: { start_time, end_time, page_size, page_token },
        })
      )
  );

  // ── Get event ──────────────────────────────────────────────────
  server.tool(
    "lark_calendar_get_event",
    "Get details of a specific calendar event",
    {
      calendar_id: z.string().describe("Calendar ID"),
      event_id: z.string().describe("Event ID"),
    },
    async ({ calendar_id, event_id }) =>
      safeCall(() =>
        getClient().calendar.calendarEvent.get({
          path: { calendar_id, event_id },
        })
      )
  );

  // ── Delete event ───────────────────────────────────────────────
  server.tool(
    "lark_calendar_delete_event",
    "Delete a calendar event",
    {
      calendar_id: z.string().describe("Calendar ID"),
      event_id: z.string().describe("Event ID"),
      need_notification: z.boolean().default(true),
    },
    async ({ calendar_id, event_id, need_notification }) =>
      safeCall(() =>
        getClient().calendar.calendarEvent.delete({
          path: { calendar_id, event_id },
          params: { need_notification: need_notification ? "true" : "false" },
        })
      )
  );

  // ── Create event attendees ─────────────────────────────────────
  server.tool(
    "lark_calendar_add_attendees",
    "Add attendees to a calendar event",
    {
      calendar_id: z.string().describe("Calendar ID"),
      event_id: z.string().describe("Event ID"),
      attendees: z
        .string()
        .describe(
          'JSON array of attendee objects, e.g. [{"type":"user","user_id":"ou_xxx"}]'
        ),
    },
    async ({ calendar_id, event_id, attendees }) =>
      safeCall(() =>
        getClient().calendar.calendarEventAttendee.create({
          path: { calendar_id, event_id },
          params: { user_id_type: "open_id" },
          data: { attendees: JSON.parse(attendees) },
        })
      )
  );

  // ── Query freebusy ─────────────────────────────────────────────
  server.tool(
    "lark_calendar_freebusy",
    "Query free/busy status for users in a time range",
    {
      time_min: z.string().describe("Start of range (RFC3339 or Unix seconds)"),
      time_max: z.string().describe("End of range (RFC3339 or Unix seconds)"),
      user_ids: z
        .array(z.string())
        .describe("List of user open_ids to query"),
    },
    async ({ time_min, time_max, user_ids }) =>
      safeCall(() =>
        getClient().calendar.freebusy.list({
          data: {
            time_min,
            time_max,
            user_id: user_ids.map((id) => ({ user_id: id, type: "user" })),
          },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );
}
