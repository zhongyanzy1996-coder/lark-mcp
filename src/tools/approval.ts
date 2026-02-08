import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerApprovalTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List approval definitions ──────────────────────────────────
  server.tool(
    "lark_approval_list_definitions",
    "List approval workflow definitions",
    {
      page_size: z.number().max(200).default(20),
      page_token: z.string().optional(),
      locale: z.enum(["zh-CN", "en-US", "ja-JP"]).default("zh-CN"),
    },
    async ({ page_size, page_token, locale }) =>
      safeCall(() =>
        (getClient() as any).request({
          method: "GET",
          url: "/open-apis/approval/v4/approvals",
          params: { page_size, page_token, locale },
        })
      )
  );

  // ── Get approval definition ────────────────────────────────────
  server.tool(
    "lark_approval_get_definition",
    "Get an approval definition by code",
    {
      approval_code: z.string().describe("Approval code"),
      locale: z.enum(["zh-CN", "en-US", "ja-JP"]).default("zh-CN"),
    },
    async ({ approval_code, locale }) =>
      safeCall(() =>
        getClient().approval.approval.get({
          path: { approval_code },
          params: { locale },
        } as any)
      )
  );

  // ── Create approval instance ───────────────────────────────────
  server.tool(
    "lark_approval_create_instance",
    "Submit a new approval instance (initiate an approval request)",
    {
      approval_code: z.string().describe("Approval definition code"),
      open_id: z.string().describe("Submitter open_id"),
      form: z
        .string()
        .describe(
          'JSON string of form data, e.g. [{"id":"widget1","type":"input","value":"xxx"}]'
        ),
      node_approver_open_id_list: z
        .string()
        .optional()
        .describe(
          "JSON array of node-level approver overrides"
        ),
    },
    async ({ approval_code, open_id, form, node_approver_open_id_list }) =>
      safeCall(() =>
        getClient().approval.instance.create({
          data: {
            approval_code,
            open_id,
            form,
            node_approver_open_id_list: node_approver_open_id_list
              ? JSON.parse(node_approver_open_id_list)
              : undefined,
          },
        })
      )
  );

  // ── Get approval instance ──────────────────────────────────────
  server.tool(
    "lark_approval_get_instance",
    "Get the details and status of an approval instance",
    {
      instance_id: z.string().describe("Approval instance ID"),
      locale: z.enum(["zh-CN", "en-US", "ja-JP"]).default("zh-CN"),
    },
    async ({ instance_id, locale }) =>
      safeCall(() =>
        getClient().approval.instance.get({
          path: { instance_id },
          params: { locale },
        } as any)
      )
  );

  // ── List approval instances ────────────────────────────────────
  server.tool(
    "lark_approval_list_instances",
    "List instances of a specific approval definition",
    {
      approval_code: z.string().describe("Approval definition code"),
      start_time: z.string().describe("Start timestamp (ms)"),
      end_time: z.string().describe("End timestamp (ms)"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ approval_code, start_time, end_time, page_size, page_token }) =>
      safeCall(() =>
        getClient().approval.instance.query({
          data: {
            approval_code,
            instance_start_time_from: start_time,
            instance_start_time_to: end_time,
          },
          params: {
            page_size,
            page_token,
          },
        })
      )
  );

  // ── Approve task ───────────────────────────────────────────────
  server.tool(
    "lark_approval_approve_task",
    "Approve an approval task",
    {
      approval_code: z.string().describe("Approval code"),
      instance_code: z.string().describe("Instance code"),
      user_id: z.string().describe("Approver open_id"),
      task_id: z.string().describe("Task ID"),
      comment: z.string().optional().describe("Approval comment"),
    },
    async ({ approval_code, instance_code, user_id, task_id, comment }) =>
      safeCall(() =>
        getClient().approval.task.approve({
          data: {
            approval_code,
            instance_code,
            user_id,
            task_id,
            comment,
          },
        })
      )
  );

  // ── Reject task ────────────────────────────────────────────────
  server.tool(
    "lark_approval_reject_task",
    "Reject an approval task",
    {
      approval_code: z.string().describe("Approval code"),
      instance_code: z.string().describe("Instance code"),
      user_id: z.string().describe("Approver open_id"),
      task_id: z.string().describe("Task ID"),
      comment: z.string().optional().describe("Rejection reason"),
    },
    async ({ approval_code, instance_code, user_id, task_id, comment }) =>
      safeCall(() =>
        getClient().approval.task.reject({
          data: {
            approval_code,
            instance_code,
            user_id,
            task_id,
            comment,
          },
        })
      )
  );

  // ── Transfer task ──────────────────────────────────────────────
  server.tool(
    "lark_approval_transfer_task",
    "Transfer an approval task to another user",
    {
      approval_code: z.string().describe("Approval code"),
      instance_code: z.string().describe("Instance code"),
      user_id: z.string().describe("Current approver open_id"),
      task_id: z.string().describe("Task ID"),
      transfer_user_id: z.string().describe("Target user open_id"),
      comment: z.string().optional().describe("Transfer comment"),
    },
    async ({
      approval_code,
      instance_code,
      user_id,
      task_id,
      transfer_user_id,
      comment,
    }) =>
      safeCall(() =>
        getClient().approval.task.transfer({
          data: {
            approval_code,
            instance_code,
            user_id,
            task_id,
            transfer_user_id,
            comment,
          },
        })
      )
  );

  // ── Add instance comment ───────────────────────────────────────
  server.tool(
    "lark_approval_add_comment",
    "Add a comment to an approval instance",
    {
      instance_id: z.string().describe("Instance ID"),
      content: z.string().describe("Comment content"),
      user_id: z.string().optional().describe("Commenter open_id"),
    },
    async ({ instance_id, content, user_id }) =>
      safeCall(() =>
        getClient().approval.instanceComment.create({
          path: { instance_id },
          data: { content, user_id },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Cancel approval instance ───────────────────────────────────
  server.tool(
    "lark_approval_cancel_instance",
    "Cancel / withdraw an approval instance",
    {
      approval_code: z.string().describe("Approval code"),
      instance_code: z.string().describe("Instance code"),
      user_id: z.string().describe("Submitter open_id"),
    },
    async ({ approval_code, instance_code, user_id }) =>
      safeCall(() =>
        getClient().approval.instance.cancel({
          data: { approval_code, instance_code, user_id },
        })
      )
  );
}
