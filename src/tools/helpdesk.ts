import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerHelpdeskTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get ticket ─────────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_get_ticket",
    "Get a helpdesk ticket by ID",
    {
      ticket_id: z.string().describe("Ticket ID"),
    },
    async ({ ticket_id }) =>
      safeCall(() =>
        getClient().helpdesk.ticket.get({
          path: { ticket_id },
        })
      )
  );

  // ── List tickets ───────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_list_tickets",
    "List helpdesk tickets with optional filters",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
      status: z.number().optional().describe("Ticket status filter"),
      query: z.string().optional().describe("Search query"),
    },
    async ({ page_size, page_token, status, query }) =>
      safeCall(() =>
        getClient().helpdesk.ticket.list({
          params: { page_size, page_token, status, query } as any,
        })
      )
  );

  // ── Update ticket ──────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_update_ticket",
    "Update a helpdesk ticket (status, tags, etc.)",
    {
      ticket_id: z.string().describe("Ticket ID"),
      update_body: z.string().describe("JSON update object {status, tag_names, ...}"),
    },
    async ({ ticket_id, update_body }) =>
      safeCall(() =>
        getClient().helpdesk.ticket.update({
          path: { ticket_id },
          data: JSON.parse(update_body),
        })
      )
  );

  // ── Create ticket message ──────────────────────────────────────
  server.tool(
    "lark_helpdesk_send_ticket_message",
    "Send a message in a helpdesk ticket",
    {
      ticket_id: z.string().describe("Ticket ID"),
      msg_type: z.enum(["text", "post", "image", "interactive"]).default("text"),
      content: z.string().describe("Message content as JSON string"),
    },
    async ({ ticket_id, msg_type, content }) =>
      safeCall(() =>
        getClient().helpdesk.ticketMessage.create({
          path: { ticket_id },
          data: { msg_type, content },
        })
      )
  );

  // ── List FAQs ──────────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_list_faqs",
    "List helpdesk FAQs",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().helpdesk.faq.list({
          params: { page_size, page_token } as any,
        })
      )
  );

  // ── Search FAQs ────────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_search_faqs",
    "Search helpdesk FAQs by keyword",
    {
      query: z.string().describe("Search query"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ query, page_size, page_token }) =>
      safeCall(() =>
        getClient().helpdesk.faq.search({
          params: { query, page_size, page_token } as any,
        })
      )
  );

  // ── List categories ────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_list_categories",
    "List helpdesk ticket categories",
    {},
    async () =>
      safeCall(() => getClient().helpdesk.category.list({} as any))
  );

  // ── List agents ────────────────────────────────────────────────
  server.tool(
    "lark_helpdesk_list_agent_schedules",
    "List helpdesk agent schedules",
    {},
    async () =>
      safeCall(() => getClient().helpdesk.agentSchedule.list({ params: { status: [1] } }))
  );
}
