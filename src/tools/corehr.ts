import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerCorehrTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Search employees ───────────────────────────────────────────
  server.tool(
    "lark_corehr_search_employees",
    "Search CoreHR employees (advanced HR employee records)",
    {
      fields: z.array(z.string()).optional().describe("Fields to return"),
      employment_id_list: z.array(z.string()).optional().describe("Filter by employment IDs"),
      work_email_list: z.array(z.string()).optional().describe("Filter by work emails"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ fields, employment_id_list, work_email_list, page_size, page_token }) =>
      safeCall(() =>
        (getClient() as any).corehr.employee.search({
          data: { fields, employment_id_list, work_email_list },
          params: { page_size, page_token, user_id_type: "open_id" },
        })
      )
  );

  // ── List departments ───────────────────────────────────────────
  server.tool(
    "lark_corehr_list_departments",
    "List CoreHR departments",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
      department_id_list: z.array(z.string()).optional().describe("Filter by department IDs"),
    },
    async ({ page_size, page_token, department_id_list }) =>
      safeCall(() =>
        getClient().corehr.department.list({
          params: { page_size, page_token, department_id_list } as any,
        })
      )
  );

  // ── Get department ─────────────────────────────────────────────
  server.tool(
    "lark_corehr_get_department",
    "Get a CoreHR department by ID",
    {
      department_id: z.string().describe("Department ID"),
    },
    async ({ department_id }) =>
      safeCall(() =>
        getClient().corehr.department.get({
          path: { department_id },
        })
      )
  );

  // ── List job levels ────────────────────────────────────────────
  server.tool(
    "lark_corehr_list_job_levels",
    "List job levels",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.jobLevel.list({
          params: { page_size: String(page_size), page_token },
        })
      )
  );

  // ── List job families ──────────────────────────────────────────
  server.tool(
    "lark_corehr_list_job_families",
    "List job families (career tracks)",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.jobFamily.list({
          params: { page_size: String(page_size), page_token },
        })
      )
  );

  // ── List companies ─────────────────────────────────────────────
  server.tool(
    "lark_corehr_list_companies",
    "List companies in the organization",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.company.list({
          params: { page_size: String(page_size), page_token },
        })
      )
  );

  // ── List locations ─────────────────────────────────────────────
  server.tool(
    "lark_corehr_list_locations",
    "List office locations",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.location.list({
          params: { page_size: String(page_size), page_token },
        })
      )
  );

  // ── Get contract ───────────────────────────────────────────────
  server.tool(
    "lark_corehr_get_contract",
    "Get an employee contract by ID",
    {
      contract_id: z.string().describe("Contract ID"),
    },
    async ({ contract_id }) =>
      safeCall(() =>
        getClient().corehr.contract.get({
          path: { contract_id },
        })
      )
  );

  // ── Search offboarding ─────────────────────────────────────────
  server.tool(
    "lark_corehr_search_offboarding",
    "Search employee offboarding records",
    {
      employment_ids: z.array(z.string()).optional().describe("Filter by employment IDs"),
      apply_initiating_time_begin: z.string().optional().describe("Start time filter"),
      apply_initiating_time_end: z.string().optional().describe("End time filter"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ employment_ids, apply_initiating_time_begin, apply_initiating_time_end, page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.offboarding.search({
          data: {
            employment_ids,
            apply_initiating_time_begin,
            apply_initiating_time_end,
          } as any,
          params: { page_size, page_token, user_id_type: "open_id" },
        })
      )
  );

  // ── List employee types ────────────────────────────────────────
  server.tool(
    "lark_corehr_list_employee_types",
    "List employee type definitions",
    {
      page_size: z.number().max(100).default(50),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().corehr.employeeType.list({
          params: { page_size: String(page_size), page_token },
        })
      )
  );
}
