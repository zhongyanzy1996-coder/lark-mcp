import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerBitableTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Get Bitable meta ───────────────────────────────────────────
  server.tool(
    "lark_bitable_get_meta",
    "Get metadata of a Bitable app (tables, name, etc.)",
    {
      app_token: z.string().describe("Bitable app token"),
    },
    async ({ app_token }) =>
      safeCall(() =>
        getClient().bitable.appTable.list({
          path: { app_token },
        })
      )
  );

  // ── List tables ────────────────────────────────────────────────
  server.tool(
    "lark_bitable_list_tables",
    "List all tables in a Bitable app",
    {
      app_token: z.string().describe("Bitable app token"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ app_token, page_size, page_token }) =>
      safeCall(() =>
        getClient().bitable.appTable.list({
          path: { app_token },
          params: { page_size, page_token },
        })
      )
  );

  // ── Create table ───────────────────────────────────────────────
  server.tool(
    "lark_bitable_create_table",
    "Create a new table in a Bitable app",
    {
      app_token: z.string().describe("Bitable app token"),
      name: z.string().describe("Table name"),
      default_view_name: z.string().optional().describe("Default view name"),
      fields: z
        .string()
        .optional()
        .describe("JSON array of field definitions [{field_name, type}]"),
    },
    async ({ app_token, name, default_view_name, fields }) =>
      safeCall(() =>
        getClient().bitable.appTable.create({
          path: { app_token },
          data: {
            table: {
              name,
              default_view_name,
              fields: fields ? JSON.parse(fields) : undefined,
            },
          },
        })
      )
  );

  // ── List fields ────────────────────────────────────────────────
  server.tool(
    "lark_bitable_list_fields",
    "List all fields (columns) in a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      page_size: z.number().max(100).default(100),
      page_token: z.string().optional(),
    },
    async ({ app_token, table_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().bitable.appTableField.list({
          path: { app_token, table_id },
          params: { page_size, page_token },
        })
      )
  );

  // ── Create field ───────────────────────────────────────────────
  server.tool(
    "lark_bitable_create_field",
    "Add a new field (column) to a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      field_name: z.string().describe("Field name"),
      type: z.number().describe("Field type (1=Text, 2=Number, 3=Select, 5=DateTime, 7=Checkbox, 11=Person, 13=Phone, 15=URL, 17=Attachment, 18=Link, 20=Formula, 22=Location, 23=Group, 1001=CreatedTime, 1002=LastModifiedTime, 1003=CreatedBy, 1004=LastModifiedBy, 1005=AutoNumber)"),
      property: z.string().optional().describe("JSON field property config"),
    },
    async ({ app_token, table_id, field_name, type, property }) =>
      safeCall(() =>
        getClient().bitable.appTableField.create({
          path: { app_token, table_id },
          data: {
            field_name,
            type,
            property: property ? JSON.parse(property) : undefined,
          },
        })
      )
  );

  // ── List records ───────────────────────────────────────────────
  server.tool(
    "lark_bitable_list_records",
    "List records (rows) in a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      view_id: z.string().optional().describe("View ID to filter by"),
      filter: z.string().optional().describe('Filter expression, e.g. AND(CurrentValue.[Status]="Open")'),
      sort: z.string().optional().describe('Sort expression, e.g. ["field_name DESC"]'),
      page_size: z.number().max(500).default(100),
      page_token: z.string().optional(),
    },
    async ({ app_token, table_id, view_id, filter, sort, page_size, page_token }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.list({
          path: { app_token, table_id },
          params: {
            view_id,
            filter,
            sort,
            page_size,
            page_token,
          },
        })
      )
  );

  // ── Search records ─────────────────────────────────────────────
  server.tool(
    "lark_bitable_search_records",
    "Search records in a Bitable table with advanced filter",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      view_id: z.string().optional().describe("View ID"),
      field_names: z.array(z.string()).optional().describe("Fields to return"),
      filter: z
        .string()
        .optional()
        .describe("JSON filter object {conjunction, conditions}"),
      sort: z
        .string()
        .optional()
        .describe("JSON sort array [{field_name, desc}]"),
      page_size: z.number().max(500).default(100),
      page_token: z.string().optional(),
    },
    async ({ app_token, table_id, view_id, field_names, filter, sort, page_size, page_token }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.search({
          path: { app_token, table_id },
          params: { page_size, page_token },
          data: {
            view_id,
            field_names,
            filter: filter ? JSON.parse(filter) : undefined,
            sort: sort ? JSON.parse(sort) : undefined,
          },
        })
      )
  );

  // ── Get record ─────────────────────────────────────────────────
  server.tool(
    "lark_bitable_get_record",
    "Get a single record by ID",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      record_id: z.string().describe("Record ID"),
    },
    async ({ app_token, table_id, record_id }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.get({
          path: { app_token, table_id, record_id },
        })
      )
  );

  // ── Create record ──────────────────────────────────────────────
  server.tool(
    "lark_bitable_create_record",
    "Create a new record (row) in a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      fields: z
        .string()
        .describe('JSON object of field values, e.g. {"Name":"foo","Status":"Open"}'),
    },
    async ({ app_token, table_id, fields }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.create({
          path: { app_token, table_id },
          data: { fields: JSON.parse(fields) },
        })
      )
  );

  // ── Update record ──────────────────────────────────────────────
  server.tool(
    "lark_bitable_update_record",
    "Update an existing record in a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      record_id: z.string().describe("Record ID"),
      fields: z
        .string()
        .describe('JSON object of field values to update'),
    },
    async ({ app_token, table_id, record_id, fields }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.update({
          path: { app_token, table_id, record_id },
          data: { fields: JSON.parse(fields) },
        })
      )
  );

  // ── Delete record ──────────────────────────────────────────────
  server.tool(
    "lark_bitable_delete_record",
    "Delete a record from a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      record_id: z.string().describe("Record ID"),
    },
    async ({ app_token, table_id, record_id }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.delete({
          path: { app_token, table_id, record_id },
        })
      )
  );

  // ── Batch create records ───────────────────────────────────────
  server.tool(
    "lark_bitable_batch_create_records",
    "Create multiple records at once",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      records: z
        .string()
        .describe('JSON array of {fields: {...}} objects'),
    },
    async ({ app_token, table_id, records }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.batchCreate({
          path: { app_token, table_id },
          data: { records: JSON.parse(records) },
        })
      )
  );

  // ── Batch update records ───────────────────────────────────────
  server.tool(
    "lark_bitable_batch_update_records",
    "Update multiple records at once",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      records: z
        .string()
        .describe('JSON array of {record_id, fields} objects'),
    },
    async ({ app_token, table_id, records }) =>
      safeCall(() =>
        getClient().bitable.appTableRecord.batchUpdate({
          path: { app_token, table_id },
          data: { records: JSON.parse(records) },
        })
      )
  );

  // ── List views ─────────────────────────────────────────────────
  server.tool(
    "lark_bitable_list_views",
    "List all views in a Bitable table",
    {
      app_token: z.string().describe("Bitable app token"),
      table_id: z.string().describe("Table ID"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ app_token, table_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().bitable.appTableView.list({
          path: { app_token, table_id },
          params: { page_size, page_token },
        })
      )
  );
}
