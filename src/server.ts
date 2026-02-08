import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "./client.js";
import { registerImTools } from "./tools/im.js";
import { registerDocsTools } from "./tools/docs.js";
import { registerDriveTools } from "./tools/drive.js";
import { registerBitableTools } from "./tools/bitable.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerContactTools } from "./tools/contact.js";
import { registerCalendarTools } from "./tools/calendar.js";
import { registerApprovalTools } from "./tools/approval.js";
import { registerTaskTools } from "./tools/task.js";
import { registerSheetsTools } from "./tools/sheets.js";
import { registerSearchTools } from "./tools/search.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "lark-mcp",
    version: "0.1.0",
  });

  const client = getClient;

  // P0 — Core
  registerImTools(server, client);
  registerDocsTools(server, client);
  registerDriveTools(server, client);
  registerBitableTools(server, client);
  registerWikiTools(server, client);
  registerContactTools(server, client);

  // P1 — High priority
  registerCalendarTools(server, client);
  registerApprovalTools(server, client);
  registerTaskTools(server, client);
  registerSheetsTools(server, client);
  registerSearchTools(server, client);

  return server;
}
