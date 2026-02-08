import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerMailTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Send mail ──────────────────────────────────────────────────
  server.tool(
    "lark_mail_send_message",
    "Send an email via a user mailbox",
    {
      user_mailbox_id: z.string().describe("User mailbox ID (email address)"),
      subject: z.string().describe("Email subject"),
      to: z.string().describe('JSON array of recipients, e.g. [{"mail_address":"a@b.com"}]'),
      body_html: z.string().optional().describe("HTML body content"),
      body_text: z.string().optional().describe("Plain text body content"),
      cc: z.string().optional().describe("JSON array of CC recipients"),
    },
    async ({ user_mailbox_id, subject, to, body_html, body_text, cc }) =>
      safeCall(() =>
        getClient().mail.userMailboxMessage.send({
          path: { user_mailbox_id },
          data: {
            subject,
            to: JSON.parse(to),
            cc: cc ? JSON.parse(cc) : undefined,
            body: {
              content: body_html || body_text || "",
              type: body_html ? "text/html" : "text/plain",
            },
          } as any,
        })
      )
  );

  // ── List mail groups ───────────────────────────────────────────
  server.tool(
    "lark_mail_list_mailgroups",
    "List email distribution groups",
    {
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().mail.mailgroup.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Create mail group ──────────────────────────────────────────
  server.tool(
    "lark_mail_create_mailgroup",
    "Create an email distribution group",
    {
      email: z.string().describe("Group email address"),
      name: z.string().optional().describe("Display name"),
      description: z.string().optional(),
      who_can_send_mail: z
        .enum(["ANYONE", "ALL_INTERNAL_USERS", "ALL_GROUP_MEMBERS", "CUSTOM_MEMBERS"])
        .default("ALL_INTERNAL_USERS"),
    },
    async ({ email, name, description, who_can_send_mail }) =>
      safeCall(() =>
        getClient().mail.mailgroup.create({
          data: { email, name, description, who_can_send_mail },
        })
      )
  );

  // ── Get mail group ─────────────────────────────────────────────
  server.tool(
    "lark_mail_get_mailgroup",
    "Get details of a mail group",
    {
      mailgroup_id: z.string().describe("Mail group ID"),
    },
    async ({ mailgroup_id }) =>
      safeCall(() =>
        getClient().mail.mailgroup.get({ path: { mailgroup_id } })
      )
  );

  // ── Add member to mail group ───────────────────────────────────
  server.tool(
    "lark_mail_add_mailgroup_member",
    "Add a member to a mail distribution group",
    {
      mailgroup_id: z.string().describe("Mail group ID"),
      email: z.string().optional().describe("Member email address"),
      user_id: z.string().optional().describe("Member user ID"),
      type: z
        .enum(["USER", "DEPARTMENT", "COMPANY", "EXTERNAL_USER", "MAIL_GROUP", "PUBLIC_MAILBOX", "OTHER_MEMBER"])
        .default("USER")
        .describe("Member type"),
    },
    async ({ mailgroup_id, email, user_id, type }) =>
      safeCall(() =>
        getClient().mail.mailgroupMember.create({
          path: { mailgroup_id },
          data: { email, user_id, type },
        })
      )
  );

  // ── List mail group members ────────────────────────────────────
  server.tool(
    "lark_mail_list_mailgroup_members",
    "List members of a mail distribution group",
    {
      mailgroup_id: z.string().describe("Mail group ID"),
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ mailgroup_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().mail.mailgroupMember.list({
          path: { mailgroup_id },
          params: { page_size, page_token },
        })
      )
  );

  // ── List public mailboxes ──────────────────────────────────────
  server.tool(
    "lark_mail_list_public_mailboxes",
    "List public/shared mailboxes",
    {
      page_size: z.number().max(200).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().mail.publicMailbox.list({
          params: { page_size, page_token },
        })
      )
  );

  // ── Create public mailbox ──────────────────────────────────────
  server.tool(
    "lark_mail_create_public_mailbox",
    "Create a public/shared mailbox",
    {
      email: z.string().describe("Public mailbox email address"),
      name: z.string().optional().describe("Display name"),
    },
    async ({ email, name }) =>
      safeCall(() =>
        getClient().mail.publicMailbox.create({
          data: { email, name },
        })
      )
  );
}
