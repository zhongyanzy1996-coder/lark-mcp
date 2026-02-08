import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerTaskTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Create task ────────────────────────────────────────────────
  server.tool(
    "lark_task_create",
    "Create a new task in Feishu Tasks",
    {
      summary: z.string().describe("Task title / summary"),
      description: z.string().optional().describe("Task description"),
      due: z
        .string()
        .optional()
        .describe("Due timestamp (seconds) or RFC3339 string"),
      members: z
        .string()
        .optional()
        .describe(
          'JSON array of member objects, e.g. [{"id":"ou_xxx","role":"assignee"}]'
        ),
      origin: z
        .string()
        .optional()
        .describe("JSON origin object {platform_i18n_name, href}"),
    },
    async ({ summary, description, due, members, origin }) =>
      safeCall(() =>
        getClient().task.v2.task.create({
          data: {
            summary,
            description,
            due: due ? { timestamp: due, is_all_day: false } : undefined,
            members: members ? JSON.parse(members) : undefined,
            origin: origin ? JSON.parse(origin) : undefined,
          },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Get task ───────────────────────────────────────────────────
  server.tool(
    "lark_task_get",
    "Get details of a task by ID",
    {
      task_guid: z.string().describe("Task GUID"),
    },
    async ({ task_guid }) =>
      safeCall(() =>
        getClient().task.v2.task.get({
          path: { task_guid },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Update task ────────────────────────────────────────────────
  server.tool(
    "lark_task_update",
    "Update a task (summary, description, due date, etc.)",
    {
      task_guid: z.string().describe("Task GUID"),
      update_fields: z
        .string()
        .describe(
          'JSON object with fields to update, e.g. {"summary":"new title","completed_at":"1700000000"}'
        ),
    },
    async ({ task_guid, update_fields }) =>
      safeCall(() =>
        getClient().task.v2.task.patch({
          path: { task_guid },
          data: { task: JSON.parse(update_fields) },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Delete task ────────────────────────────────────────────────
  server.tool(
    "lark_task_delete",
    "Delete a task",
    {
      task_guid: z.string().describe("Task GUID"),
    },
    async ({ task_guid }) =>
      safeCall(() =>
        getClient().task.v2.task.delete({
          path: { task_guid },
        } as any)
      )
  );

  // ── Complete task ──────────────────────────────────────────────
  server.tool(
    "lark_task_complete",
    "Mark a task as completed",
    {
      task_guid: z.string().describe("Task GUID"),
    },
    async ({ task_guid }) =>
      safeCall(() =>
        getClient().task.v2.task.patch({
          path: { task_guid },
          data: {
            task: { completed_at: String(Math.floor(Date.now() / 1000)) },
          },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── List tasks ─────────────────────────────────────────────────
  server.tool(
    "lark_task_list",
    "List tasks (supports filtering by tasklist, completed status)",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      completed: z.boolean().optional().describe("Filter by completion status"),
    },
    async ({ page_size, page_token, completed }) =>
      safeCall(() =>
        getClient().task.v2.task.list({
          params: {
            page_size,
            page_token,
            completed: completed !== undefined ? String(completed) : undefined,
            user_id_type: "open_id",
          },
        } as any)
      )
  );

  // ── Add task comment ───────────────────────────────────────────
  server.tool(
    "lark_task_add_comment",
    "Add a comment to a task",
    {
      task_guid: z.string().describe("Task GUID"),
      content: z.string().describe("Comment content"),
    },
    async ({ task_guid, content }) =>
      safeCall(() =>
        getClient().task.v2.comment.create({
          data: {
            content,
            resource_type: "task",
            resource_id: task_guid,
          },
        })
      )
  );

  // ── List task comments ─────────────────────────────────────────
  server.tool(
    "lark_task_list_comments",
    "List comments on a task",
    {
      task_guid: z.string().describe("Task GUID"),
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ task_guid, page_size, page_token }) =>
      safeCall(() =>
        getClient().task.v2.comment.list({
          params: {
            page_size,
            page_token,
            resource_type: "task",
            resource_id: task_guid,
          },
        })
      )
  );

  // ── Add task members ───────────────────────────────────────────
  server.tool(
    "lark_task_add_members",
    "Add members (assignees/followers) to a task",
    {
      task_guid: z.string().describe("Task GUID"),
      members: z
        .string()
        .describe(
          'JSON array of member objects, e.g. [{"id":"ou_xxx","role":"assignee"}]'
        ),
    },
    async ({ task_guid, members }) =>
      safeCall(() =>
        getClient().task.v2.task.addMembers({
          path: { task_guid },
          data: { members: JSON.parse(members) },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── List tasklists ─────────────────────────────────────────────
  server.tool(
    "lark_task_list_tasklists",
    "List task lists",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().task.v2.tasklist.list({
          params: { page_size, page_token, user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Create tasklist ────────────────────────────────────────────
  server.tool(
    "lark_task_create_tasklist",
    "Create a new task list",
    {
      name: z.string().describe("Task list name"),
    },
    async ({ name }) =>
      safeCall(() =>
        getClient().task.v2.tasklist.create({
          data: { name },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );
}
