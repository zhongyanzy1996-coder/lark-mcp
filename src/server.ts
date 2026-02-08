import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "./client.js";

// P0 — Core
import { registerImTools } from "./tools/im.js";
import { registerDocsTools } from "./tools/docs.js";
import { registerDriveTools } from "./tools/drive.js";
import { registerBitableTools } from "./tools/bitable.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerContactTools } from "./tools/contact.js";

// P1 — High priority
import { registerCalendarTools } from "./tools/calendar.js";
import { registerApprovalTools } from "./tools/approval.js";
import { registerTaskTools } from "./tools/task.js";
import { registerSheetsTools } from "./tools/sheets.js";
import { registerSearchTools } from "./tools/search.js";

// P2 — Medium
import { registerMailTools } from "./tools/mail.js";
import { registerVcTools } from "./tools/vc.js";
import { registerAttendanceTools } from "./tools/attendance.js";
import { registerHelpdeskTools } from "./tools/helpdesk.js";
import { registerLingoTools } from "./tools/lingo.js";

// P3 — Extended
import { registerHireTools } from "./tools/hire.js";
import { registerOkrTools } from "./tools/okr.js";
import { registerCorehrTools } from "./tools/corehr.js";
import { registerEhrTools } from "./tools/ehr.js";
import { registerAdminTools } from "./tools/admin.js";
import { registerApplicationTools } from "./tools/application.js";

// P4 — Niche
import { registerAcsTools } from "./tools/acs.js";
import { registerAiTools } from "./tools/ai.js";
import { registerPersonalSettingsTools } from "./tools/personal_settings.js";
import { registerWorkplaceTools } from "./tools/workplace.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "lark-mcp",
    version: "0.2.0",
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

  // P2 — Medium
  registerMailTools(server, client);
  registerVcTools(server, client);
  registerAttendanceTools(server, client);
  registerHelpdeskTools(server, client);
  registerLingoTools(server, client);

  // P3 — Extended
  registerHireTools(server, client);
  registerOkrTools(server, client);
  registerCorehrTools(server, client);
  registerEhrTools(server, client);
  registerAdminTools(server, client);
  registerApplicationTools(server, client);

  // P4 — Niche
  registerAcsTools(server, client);
  registerAiTools(server, client);
  registerPersonalSettingsTools(server, client);
  registerWorkplaceTools(server, client);

  return server;
}
