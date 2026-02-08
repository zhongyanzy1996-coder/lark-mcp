import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

const ReceiveIdType = z
  .enum(["open_id", "user_id", "union_id", "email", "chat_id"])
  .describe("ID type of the message receiver");

export function registerImTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── Send message ───────────────────────────────────────────────
  server.tool(
    "lark_im_send_message",
    "Send a message to a user or chat in Feishu/Lark",
    {
      receive_id_type: ReceiveIdType,
      receive_id: z.string().describe("Receiver ID (open_id / chat_id / …)"),
      msg_type: z
        .enum(["text", "post", "image", "interactive", "file", "audio", "media", "sticker", "share_chat", "share_user"])
        .describe("Message type"),
      content: z
        .string()
        .describe('Message content as JSON string, e.g. {"text":"hello"}'),
    },
    async ({ receive_id_type, receive_id, msg_type, content }) =>
      safeCall(() =>
        getClient().im.message.create({
          params: { receive_id_type },
          data: { receive_id, msg_type, content },
        })
      )
  );

  // ── Reply to message ───────────────────────────────────────────
  server.tool(
    "lark_im_reply_message",
    "Reply to a specific message",
    {
      message_id: z.string().describe("ID of the message to reply to"),
      msg_type: z
        .enum(["text", "post", "image", "interactive", "file"])
        .describe("Reply message type"),
      content: z.string().describe("Reply content as JSON string"),
    },
    async ({ message_id, msg_type, content }) =>
      safeCall(() =>
        getClient().im.message.reply({
          path: { message_id },
          data: { msg_type, content },
        })
      )
  );

  // ── Get message ────────────────────────────────────────────────
  server.tool(
    "lark_im_get_message",
    "Get a specific message by ID",
    {
      message_id: z.string().describe("Message ID"),
    },
    async ({ message_id }) =>
      safeCall(() =>
        getClient().im.message.get({ path: { message_id } })
      )
  );

  // ── List messages ──────────────────────────────────────────────
  server.tool(
    "lark_im_list_messages",
    "List messages in a chat (recent history)",
    {
      container_id_type: z.literal("chat").default("chat"),
      container_id: z.string().describe("Chat ID"),
      start_time: z.string().optional().describe("Start timestamp (seconds)"),
      end_time: z.string().optional().describe("End timestamp (seconds)"),
      page_size: z.number().max(50).default(20).describe("Page size, max 50"),
      page_token: z.string().optional().describe("Pagination token"),
    },
    async (params) =>
      safeCall(() =>
        getClient().im.message.list({
          params: {
            container_id_type: params.container_id_type,
            container_id: params.container_id,
            start_time: params.start_time,
            end_time: params.end_time,
            page_size: params.page_size,
            page_token: params.page_token,
          },
        })
      )
  );

  // ── Delete message ─────────────────────────────────────────────
  server.tool(
    "lark_im_delete_message",
    "Recall / delete a message",
    {
      message_id: z.string().describe("Message ID to delete"),
    },
    async ({ message_id }) =>
      safeCall(() =>
        getClient().im.message.delete({ path: { message_id } })
      )
  );

  // ── Update message (edit) ──────────────────────────────────────
  server.tool(
    "lark_im_update_message",
    "Edit / update an existing message",
    {
      message_id: z.string().describe("Message ID to update"),
      msg_type: z.enum(["text", "post", "interactive"]).describe("New message type"),
      content: z.string().describe("New content as JSON string"),
    },
    async ({ message_id, msg_type, content }) =>
      safeCall(() =>
        getClient().im.message.update({
          path: { message_id },
          data: { msg_type, content },
        })
      )
  );

  // ── Add reaction ───────────────────────────────────────────────
  server.tool(
    "lark_im_add_reaction",
    "Add an emoji reaction to a message",
    {
      message_id: z.string().describe("Message ID"),
      emoji_type: z.string().describe('Emoji type, e.g. "THUMBSUP", "SMILE"'),
    },
    async ({ message_id, emoji_type }) =>
      safeCall(() =>
        getClient().im.messageReaction.create({
          path: { message_id },
          data: { reaction_type: { emoji_type } },
        })
      )
  );

  // ── Create chat group ─────────────────────────────────────────
  server.tool(
    "lark_im_create_chat",
    "Create a new group chat",
    {
      name: z.string().optional().describe("Group name"),
      description: z.string().optional().describe("Group description"),
      user_id_list: z
        .array(z.string())
        .optional()
        .describe("List of user open_ids to add"),
      chat_mode: z
        .enum(["group", "topic", "p2p"])
        .optional()
        .default("group")
        .describe("Chat mode"),
    },
    async ({ name, description, user_id_list, chat_mode }) =>
      safeCall(() =>
        getClient().im.chat.create({
          params: { user_id_type: "open_id" },
          data: { name, description, user_id_list, chat_mode },
        })
      )
  );

  // ── Get chat info ──────────────────────────────────────────────
  server.tool(
    "lark_im_get_chat",
    "Get information about a chat group",
    {
      chat_id: z.string().describe("Chat ID"),
    },
    async ({ chat_id }) =>
      safeCall(() =>
        getClient().im.chat.get({
          path: { chat_id },
          params: { user_id_type: "open_id" },
        })
      )
  );

  // ── List chats ─────────────────────────────────────────────────
  server.tool(
    "lark_im_list_chats",
    "List chats the bot has joined",
    {
      page_size: z.number().max(100).default(20).describe("Page size"),
      page_token: z.string().optional().describe("Pagination token"),
    },
    async ({ page_size, page_token }) =>
      safeCall(() =>
        getClient().im.chat.list({
          params: {
            user_id_type: "open_id",
            page_size,
            page_token,
          },
        })
      )
  );

  // ── Add members to chat ────────────────────────────────────────
  server.tool(
    "lark_im_add_chat_members",
    "Add members to a group chat",
    {
      chat_id: z.string().describe("Chat ID"),
      id_list: z
        .array(z.string())
        .describe("List of user IDs to add"),
      member_id_type: z
        .enum(["open_id", "user_id", "union_id", "app_id"])
        .default("open_id")
        .describe("Member ID type"),
    },
    async ({ chat_id, id_list, member_id_type }) =>
      safeCall(() =>
        getClient().im.chatMembers.create({
          path: { chat_id },
          params: { member_id_type },
          data: { id_list },
        })
      )
  );

  // ── Remove members from chat ───────────────────────────────────
  server.tool(
    "lark_im_remove_chat_members",
    "Remove members from a group chat",
    {
      chat_id: z.string().describe("Chat ID"),
      id_list: z.array(z.string()).describe("List of user IDs to remove"),
      member_id_type: z
        .enum(["open_id", "user_id", "union_id", "app_id"])
        .default("open_id")
        .describe("Member ID type"),
    },
    async ({ chat_id, id_list, member_id_type }) =>
      safeCall(() =>
        getClient().im.chatMembers.delete({
          path: { chat_id },
          params: { member_id_type },
          data: { id_list },
        })
      )
  );

  // ── List chat members ──────────────────────────────────────────
  server.tool(
    "lark_im_list_chat_members",
    "List members of a group chat",
    {
      chat_id: z.string().describe("Chat ID"),
      page_size: z.number().max(100).default(20).describe("Page size"),
      page_token: z.string().optional().describe("Pagination token"),
      member_id_type: z
        .enum(["open_id", "user_id", "union_id"])
        .default("open_id"),
    },
    async ({ chat_id, page_size, page_token, member_id_type }) =>
      safeCall(() =>
        getClient().im.chatMembers.get({
          path: { chat_id },
          params: { member_id_type, page_size, page_token },
        })
      )
  );

  // ── Pin message ────────────────────────────────────────────────
  server.tool(
    "lark_im_pin_message",
    "Pin a message in a chat",
    {
      message_id: z.string().describe("Message ID to pin"),
    },
    async ({ message_id }) =>
      safeCall(() =>
        getClient().im.pin.create({
          data: { message_id },
        })
      )
  );

  // ── Upload image ───────────────────────────────────────────────
  server.tool(
    "lark_im_upload_image",
    "Upload an image to Feishu for sending in messages",
    {
      image_type: z.enum(["message", "avatar"]).default("message"),
      image_uri: z.string().describe("Local file path or URL of the image"),
    },
    async ({ image_type }) =>
      // Note: actual file upload requires fs.createReadStream — simplified here
      safeCall(async () => {
        throw new Error(
          "Image upload requires local file access. Use lark_drive_upload_file for file uploads."
        );
      })
  );
}
