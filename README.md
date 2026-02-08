# lark-mcp

A comprehensive [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for the **Feishu / Lark Open Platform**. Provides 100+ tools covering messaging, documents, spreadsheets, databases, calendars, approvals, tasks, HR, recruitment, and more — enabling LLMs to interact with your Feishu workspace.

## Features

| Priority | Module | Tools | Description |
|----------|--------|-------|-------------|
| P0 | **IM** | 15 | Send/reply/edit messages, manage chats & members, reactions, pins |
| P0 | **Bitable** | 14 | Multi-dimensional tables: CRUD records, fields, views, batch ops |
| P0 | **Drive** | 9 | Cloud storage: files, folders, permissions, search, export |
| P0 | **Docs** | 8 | Documents: create, read, block-level editing |
| P0 | **Wiki** | 7 | Knowledge base: spaces, nodes, cross-space operations |
| P0 | **Contact** | 7 | Directory: users, departments, groups, search |
| P1 | **Task** | 11 | Tasks: CRUD, comments, members, task lists |
| P1 | **Approval** | 10 | Workflows: submit, approve, reject, transfer, cancel |
| P1 | **Calendar** | 8 | Calendars, events, attendees, free/busy queries |
| P1 | **Sheets** | 7 | Spreadsheets: read/write ranges, append rows, manage tabs |
| P1 | **Search** | 3 | Cross-module search: messages, docs, data sources |
| P2 | **Mail** | 8 | Email: send, manage mail groups, public mailboxes |
| P2 | **VC** | 9 | Video conferencing: meetings, rooms, recordings, reserves |
| P2 | **Attendance** | 7 | Attendance: groups, shifts, check records, stats |
| P2 | **Helpdesk** | 8 | Support tickets, FAQs, agents, categories |
| P2 | **Lingo** | 5 | Enterprise glossary: terms, classifications |
| P3 | **Hire** | 10 | Recruitment: jobs, applications, interviews, offers |
| P3 | **OKR** | 5 | Objectives & Key Results management |
| P3 | **CoreHR** | 10 | HR: employees, contracts, departments, offboarding |
| P3 | **EHR** | 2 | Employee HR records |
| P3 | **Admin** | 5 | Administration: audit logs, badges, stats |
| P3 | **Application** | 5 | App management & usage analytics |
| P4 | **ACS** | 5 | Physical access control: visitors, records, devices |
| P4 | **AI** | 4 | OCR, translation, speech-to-text |
| P4 | **Personal Settings** | 3 | System status management |
| P4 | **Workplace** | 2 | Workplace portal analytics |

## Quick Start

### Prerequisites

- Node.js >= 18
- A Feishu/Lark self-built app with the necessary API scopes ([Create App](https://open.feishu.cn/app))

### Install

```bash
git clone https://github.com/zhongyanzy1996-coder/lark-mcp.git
cd lark-mcp
npm install
npm run build
```

### Configure

Set environment variables:

```bash
export LARK_APP_ID="cli_your_app_id"
export LARK_APP_SECRET="your_app_secret"
export LARK_DOMAIN="feishu"  # or "lark" for international
```

### Run

```bash
npm start
# or
node dist/index.js
```

## MCP Client Configuration

### Claude Desktop / Claude Code

Add to your MCP config (e.g. `~/.claude/mcp.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "lark": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/lark-mcp/dist/index.js"],
      "env": {
        "LARK_APP_ID": "cli_xxx",
        "LARK_APP_SECRET": "xxx"
      }
    }
  }
}
```

### OpenClaw

```json
{
  "mcpServers": {
    "lark": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/lark-mcp/dist/index.js"],
      "env": {
        "LARK_APP_ID": "cli_xxx",
        "LARK_APP_SECRET": "xxx"
      }
    }
  }
}
```

### npx (zero-install)

Once published to npm:

```json
{
  "mcpServers": {
    "lark": {
      "type": "stdio",
      "command": "npx",
      "args": ["lark-mcp"],
      "env": {
        "LARK_APP_ID": "cli_xxx",
        "LARK_APP_SECRET": "xxx"
      }
    }
  }
}
```

## Tool Naming Convention

All tools follow the pattern `lark_{module}_{action}`:

```
lark_im_send_message        # IM → send message
lark_bitable_list_records   # Bitable → list records
lark_docs_create_document   # Docs → create document
lark_calendar_create_event  # Calendar → create event
lark_hire_list_jobs         # Hire → list jobs
```

## Required App Scopes

Depending on which tools you use, your Feishu app needs different OAuth scopes. Common ones:

| Module | Scopes |
|--------|--------|
| IM | `im:message`, `im:chat`, `im:resource` |
| Docs | `docx:document`, `docs:doc` |
| Drive | `drive:drive`, `drive:file` |
| Bitable | `bitable:app`, `bitable:record` |
| Wiki | `wiki:wiki` |
| Contact | `contact:user.base:readonly`, `contact:department.base:readonly` |
| Calendar | `calendar:calendar`, `calendar:calendar.event` |
| Approval | `approval:approval`, `approval:instance` |
| Mail | `mail:mailgroup`, `mail:user_mailbox.message` |
| Attendance | `attendance:record`, `attendance:shift` |
| Hire | `hire:job`, `hire:application` |
| CoreHR | `corehr:employee:readonly`, `corehr:department:readonly` |

See the [Feishu API Scope Reference](https://open.feishu.cn/document/server-docs/api-call-guide/server-api-list) for the full list.

## Architecture

```
┌─────────────────────────────────────────────┐
│              MCP Client (LLM)               │
│  (Claude, OpenClaw, Cursor, Cline, etc.)    │
└──────────────────┬──────────────────────────┘
                   │ stdio (JSON-RPC)
┌──────────────────▼──────────────────────────┐
│              lark-mcp Server                │
│  ┌──────────────────────────────────┐       │
│  │       @modelcontextprotocol/sdk  │       │
│  └──────────────┬───────────────────┘       │
│  ┌──────────────▼───────────────────┐       │
│  │   Tool Registry (server.ts)      │       │
│  │   ┌─────┐ ┌──────┐ ┌─────────┐  │       │
│  │   │ im  │ │ docs │ │ bitable │  │       │
│  │   ├─────┤ ├──────┤ ├─────────┤  │       │
│  │   │drive│ │ wiki │ │ contact │  │       │
│  │   ├─────┤ ├──────┤ ├─────────┤  │       │
│  │   │cal. │ │ task │ │approval │  │       │
│  │   ├─────┤ ├──────┤ ├─────────┤  │       │
│  │   │mail │ │  vc  │ │  hire   │  │       │
│  │   ├─────┤ ├──────┤ ├─────────┤  │       │
│  │   │ ... │ │ ...  │ │   ...   │  │       │
│  │   └─────┘ └──────┘ └─────────┘  │       │
│  └──────────────┬───────────────────┘       │
│  ┌──────────────▼───────────────────┐       │
│  │  @larksuiteoapi/node-sdk Client  │       │
│  └──────────────┬───────────────────┘       │
└─────────────────┼───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│       Feishu / Lark Open Platform API       │
└─────────────────────────────────────────────┘
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check without emitting
npm run lint

# Watch mode
npm run dev
```

### Adding a new module

1. Create `src/tools/{module}.ts`
2. Export a `register{Module}Tools(server, getClient)` function
3. Import and call it in `src/server.ts`
4. Run `npm run build` to verify

## License

MIT

## Acknowledgments

- [Feishu Open Platform](https://open.feishu.cn/) — API provider
- [@larksuiteoapi/node-sdk](https://github.com/larksuite/node-sdk) — Official Lark Node.js SDK
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — MCP TypeScript SDK
