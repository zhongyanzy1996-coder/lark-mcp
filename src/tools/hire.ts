import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerHireTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── List jobs ──────────────────────────────────────────────────
  server.tool(
    "lark_hire_list_jobs",
    "List recruitment jobs",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().hire.job.list({
          params: {
            page_size,
            page_token,
            user_id_type: "open_id",
          },
        })
      )
  );

  // ── Get job detail ─────────────────────────────────────────────
  server.tool(
    "lark_hire_get_job",
    "Get detailed information about a recruitment job",
    {
      job_id: z.string().describe("Job ID"),
    },
    async ({ job_id }) =>
      safeCall(() =>
        getClient().hire.job.getDetail({
          path: { job_id },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── List applications ──────────────────────────────────────────
  server.tool(
    "lark_hire_list_applications",
    "List job applications",
    {
      job_id: z.string().optional().describe("Filter by job ID"),
      talent_id: z.string().optional().describe("Filter by talent ID"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ job_id, talent_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().hire.application.list({
          params: {
            job_id,
            talent_id,
            page_size,
            page_token,
            user_id_type: "open_id",
          } as any,
        })
      )
  );

  // ── Get application ────────────────────────────────────────────
  server.tool(
    "lark_hire_get_application",
    "Get details of a job application",
    {
      application_id: z.string().describe("Application ID"),
    },
    async ({ application_id }) =>
      safeCall(() =>
        getClient().hire.application.get({
          path: { application_id },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Get application detail ─────────────────────────────────────
  server.tool(
    "lark_hire_get_application_detail",
    "Get full application detail including resume and interview info",
    {
      application_id: z.string().describe("Application ID"),
    },
    async ({ application_id }) =>
      safeCall(() =>
        getClient().hire.application.getDetail({
          path: { application_id },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── Get talent ─────────────────────────────────────────────────
  server.tool(
    "lark_hire_get_talent",
    "Get details of a talent/candidate",
    {
      talent_id: z.string().describe("Talent ID"),
    },
    async ({ talent_id }) =>
      safeCall(() =>
        getClient().hire.talent.get({
          path: { talent_id },
          params: { user_id_type: "open_id" },
        } as any)
      )
  );

  // ── List interviews for application ────────────────────────────
  server.tool(
    "lark_hire_list_interviews",
    "List interviews for a job application",
    {
      application_id: z.string().describe("Application ID"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ application_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().hire.applicationInterview.list({
          path: { application_id },
          params: { page_size, page_token, user_id_type: "open_id" },
        })
      )
  );

  // ── Get offer ──────────────────────────────────────────────────
  server.tool(
    "lark_hire_get_offer",
    "Get an offer by ID",
    {
      offer_id: z.string().describe("Offer ID"),
    },
    async ({ offer_id }) =>
      safeCall(() =>
        getClient().hire.offer.get({
          path: { offer_id },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── List offers ────────────────────────────────────────────────
  server.tool(
    "lark_hire_list_offers",
    "List offers",
    {
      talent_id: z.string().describe("Talent ID to list offers for"),
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ talent_id, page_size, page_token }) =>
      safeCall(() =>
        getClient().hire.offer.list({
          params: { talent_id, page_size, page_token, user_id_type: "open_id" },
        })
      )
  );

  // ── List job processes ─────────────────────────────────────────
  server.tool(
    "lark_hire_list_job_processes",
    "List job hiring processes (pipelines)",
    {
      page_size: z.number().max(100).default(20),
      page_token: z.string().optional(),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().hire.jobProcess.list({
          params: { page_size, page_token },
        })
      )
  );
}
