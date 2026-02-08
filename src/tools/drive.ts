import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerDriveTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List files in a folder ─────────────────────────────────────
  server.tool(
    "lark_drive_list_files",
    "List files and folders in a Feishu Drive folder",
    {
      folder_token: z
        .string()
        .optional()
        .describe("Folder token (empty = root folder)"),
      page_size: z.number().max(200).default(50).describe("Page size"),
      page_token: z.string().optional().describe("Pagination token"),
      order_by: z
        .enum(["EditedTime", "CreatedTime"])
        .optional()
        .describe("Sort order"),
    },
    async ({ folder_token, page_size, page_token, order_by }) =>
      safeCall(() =>
        getClient().drive.file.list({
          params: {
            folder_token,
            page_size,
            page_token,
            order_by,
          },
        })
      )
  );

  // ── Get file metadata ──────────────────────────────────────────
  server.tool(
    "lark_drive_get_file_meta",
    "Get metadata of a file or document in Drive",
    {
      file_token: z.string().describe("File token"),
      file_type: z
        .enum(["doc", "docx", "sheet", "bitable", "folder", "file", "mindnote", "slides"])
        .describe("File type"),
    },
    async ({ file_token, file_type }) =>
      safeCall(() =>
        getClient().drive.meta.batchQuery({
          data: {
            request_docs: [{ doc_token: file_token, doc_type: file_type }],
            with_url: true,
          },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── Create folder ──────────────────────────────────────────────
  server.tool(
    "lark_drive_create_folder",
    "Create a new folder in Feishu Drive",
    {
      name: z.string().describe("Folder name"),
      folder_token: z
        .string()
        .describe("Parent folder token"),
    },
    async ({ name, folder_token }) =>
      safeCall(() =>
        getClient().drive.file.createFolder({
          data: { name, folder_token },
        })
      )
  );

  // ── Move file ──────────────────────────────────────────────────
  server.tool(
    "lark_drive_move_file",
    "Move a file or folder to a different folder",
    {
      file_token: z.string().describe("File token to move"),
      type: z
        .enum(["doc", "docx", "sheet", "bitable", "folder", "file", "mindnote", "slides"])
        .describe("File type"),
      folder_token: z.string().describe("Destination folder token"),
    },
    async ({ file_token, type, folder_token }) =>
      safeCall(() =>
        getClient().drive.file.move({
          path: { file_token },
          data: { type, folder_token },
        } as any)
      )
  );

  // ── Delete file ────────────────────────────────────────────────
  server.tool(
    "lark_drive_delete_file",
    "Delete a file or folder from Drive (moves to trash)",
    {
      file_token: z.string().describe("File token to delete"),
      type: z
        .enum(["doc", "docx", "sheet", "bitable", "folder", "file", "mindnote", "slides"])
        .describe("File type"),
    },
    async ({ file_token, type }) =>
      safeCall(() =>
        getClient().drive.file.delete({
          path: { file_token },
          params: { type },
        } as any)
      )
  );

  // ── Copy file ──────────────────────────────────────────────────
  server.tool(
    "lark_drive_copy_file",
    "Copy a file to another folder",
    {
      file_token: z.string().describe("Source file token"),
      name: z.string().describe("Name for the copy"),
      type: z
        .enum(["doc", "docx", "sheet", "bitable", "file", "mindnote", "slides"])
        .describe("File type"),
      folder_token: z
        .string()
        .describe("Destination folder token"),
    },
    async ({ file_token, name, type, folder_token }) =>
      safeCall(() =>
        getClient().drive.file.copy({
          path: { file_token },
          data: { name, type, folder_token },
        })
      )
  );

  // ── Create permission (share) ──────────────────────────────────
  server.tool(
    "lark_drive_create_permission",
    "Share a file with a user/group (add permission member)",
    {
      token: z.string().describe("File token"),
      type: z
        .enum(["doc", "docx", "sheet", "bitable", "folder", "file", "mindnote", "slides"])
        .describe("File type"),
      member_type: z
        .enum(["email", "openid", "unionid", "openchat", "opendepartmentid", "userid", "groupid", "wikispaceid"])
        .describe("Member type"),
      member_id: z.string().describe("Member ID"),
      perm: z
        .enum(["view", "edit", "full_access"])
        .describe("Permission level"),
    },
    async ({ token, type, member_type, member_id, perm }) =>
      safeCall(() =>
        getClient().drive.permissionMember.create({
          path: { token },
          params: { type, need_notification: true },
          data: { member_type, member_id, perm },
        })
      )
  );

  // ── Search files ───────────────────────────────────────────────
  server.tool(
    "lark_drive_search_files",
    "Search for files in Feishu Drive",
    {
      search_key: z.string().describe("Search keyword"),
      count: z.number().max(50).default(20).describe("Number of results"),
      offset: z.number().default(0).describe("Result offset"),
      owner_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by owner open_ids"),
      docs_types: z
        .array(
          z.enum(["doc", "docx", "sheet", "bitable", "folder", "mindnote", "slides"])
        )
        .optional()
        .describe("Filter by doc types"),
    },
    async ({ search_key, count, offset, owner_ids, docs_types }) =>
      safeCall(() =>
        (getClient() as any).request({
          method: "POST",
          url: "/open-apis/suite/docs-api/search/object",
          data: { search_key, count, offset, owner_ids, docs_types },
        })
      )
  );

  // ── Create export task ─────────────────────────────────────────
  server.tool(
    "lark_drive_export",
    "Export a document to a file format (PDF, DOCX, etc.)",
    {
      file_token: z.string().describe("File token"),
      type: z
        .enum(["doc", "docx", "sheet", "bitable"])
        .describe("Source file type"),
      file_extension: z
        .enum(["docx", "pdf", "xlsx", "csv"])
        .describe("Target export format"),
    },
    async ({ file_token, type, file_extension }) =>
      safeCall(() =>
        getClient().drive.exportTask.create({
          data: { file_token, type, file_extension },
        } as any)
      )
  );
}
