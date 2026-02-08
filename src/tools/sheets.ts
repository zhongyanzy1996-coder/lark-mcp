import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerSheetsTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get spreadsheet metadata ───────────────────────────────────
  server.tool(
    "lark_sheets_get_spreadsheet",
    "Get metadata of a Feishu spreadsheet",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
    },
    async ({ spreadsheet_token }) =>
      safeCall(() =>
        getClient().sheets.spreadsheet.get({
          path: { spreadsheet_token },
        })
      )
  );

  // ── List sheets (tabs) ─────────────────────────────────────────
  server.tool(
    "lark_sheets_list_sheets",
    "List all sheets (tabs) in a spreadsheet",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
    },
    async ({ spreadsheet_token }) =>
      safeCall(() =>
        getClient().sheets.spreadsheetSheet.query({
          path: { spreadsheet_token },
        })
      )
  );

  // ── Read range ─────────────────────────────────────────────────
  server.tool(
    "lark_sheets_read_range",
    "Read cell values from a range in a sheet (e.g. Sheet1!A1:C10)",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
      range: z
        .string()
        .describe("Cell range, e.g. 'Sheet1!A1:C10' or 'sheetId!A1:C10'"),
      value_render_option: z
        .enum(["ToString", "Formula", "FormattedValue", "UnformattedValue"])
        .default("ToString")
        .describe("How to render cell values"),
    },
    async ({ spreadsheet_token, range, value_render_option }) =>
      safeCall(() =>
        getClient().sheets.spreadsheetSheetFilterView.get({
          path: { spreadsheet_token },
          params: { range, value_render_option } as any,
        } as any)
      )
  );

  // ── Write range ────────────────────────────────────────────────
  server.tool(
    "lark_sheets_write_range",
    "Write values to a range in a sheet",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
      range: z
        .string()
        .describe("Cell range, e.g. 'Sheet1!A1:C3'"),
      values: z
        .string()
        .describe(
          'JSON 2D array of values, e.g. [["a","b","c"],["d","e","f"]]'
        ),
    },
    async ({ spreadsheet_token, range, values }) =>
      safeCall(async () => {
        const client = getClient();
        const resp = await (client as any).request({
          method: "PUT",
          url: `/open-apis/sheets/v2/spreadsheets/${spreadsheet_token}/values`,
          data: {
            valueRange: {
              range,
              values: JSON.parse(values),
            },
          },
        });
        return resp;
      })
  );

  // ── Append rows ────────────────────────────────────────────────
  server.tool(
    "lark_sheets_append_rows",
    "Append rows to the end of a sheet",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
      range: z
        .string()
        .describe("Sheet range (determines which sheet to append to)"),
      values: z
        .string()
        .describe('JSON 2D array of row values to append'),
    },
    async ({ spreadsheet_token, range, values }) =>
      safeCall(async () => {
        const client = getClient();
        const resp = await (client as any).request({
          method: "POST",
          url: `/open-apis/sheets/v2/spreadsheets/${spreadsheet_token}/values_append`,
          data: {
            valueRange: {
              range,
              values: JSON.parse(values),
            },
          },
        });
        return resp;
      })
  );

  // ── Create sheet (add tab) ─────────────────────────────────────
  server.tool(
    "lark_sheets_create_sheet",
    "Add a new sheet (tab) to a spreadsheet",
    {
      spreadsheet_token: z.string().describe("Spreadsheet token"),
      title: z.string().describe("New sheet tab name"),
      index: z.number().optional().describe("Insert position index"),
    },
    async ({ spreadsheet_token, title, index }) =>
      safeCall(async () => {
        const client = getClient();
        const resp = await (client as any).request({
          method: "POST",
          url: `/open-apis/sheets/v2/spreadsheets/${spreadsheet_token}/sheets_batch_update`,
          data: {
            requests: [
              {
                addSheet: {
                  properties: { title, index },
                },
              },
            ],
          },
        });
        return resp;
      })
  );

  // ── Create spreadsheet ─────────────────────────────────────────
  server.tool(
    "lark_sheets_create_spreadsheet",
    "Create a new Feishu spreadsheet",
    {
      title: z.string().describe("Spreadsheet title"),
      folder_token: z
        .string()
        .optional()
        .describe("Folder token to create in"),
    },
    async ({ title, folder_token }) =>
      safeCall(() =>
        getClient().sheets.spreadsheet.create({
          data: { title, folder_token },
        })
      )
  );
}
