import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type * as lark from "@larksuiteoapi/node-sdk";
import { z } from "zod";
import { safeCall } from "../utils.js";

export function registerAiTools(
  server: McpServer,
  getClient: () => lark.Client
) {
  // ── OCR: Basic image recognition ───────────────────────────────
  server.tool(
    "lark_ai_ocr_image",
    "Recognize text from an image using OCR",
    {
      image_key: z
        .string()
        .optional()
        .describe("Feishu image key (from uploaded image)"),
      image_url: z
        .string()
        .optional()
        .describe("Image URL to recognize"),
    },
    async ({ image_key, image_url }) =>
      safeCall(() =>
        (getClient() as any).optical_char_recognition.image.basicRecognize({
          data: { image: image_key, url: image_url },
        })
      )
  );

  // ── Translation: Translate text ────────────────────────────────
  server.tool(
    "lark_ai_translate_text",
    "Translate text between languages",
    {
      source_language: z
        .string()
        .describe("Source language code (zh, en, ja, etc.)"),
      target_language: z
        .string()
        .describe("Target language code"),
      text: z.string().describe("Text to translate"),
    },
    async ({ source_language, target_language, text }) =>
      safeCall(() =>
        getClient().translation.text.translate({
          data: { source_language, target_language, text },
        })
      )
  );

  // ── Translation: Detect language ───────────────────────────────
  server.tool(
    "lark_ai_detect_language",
    "Detect the language of a given text",
    {
      text: z.string().describe("Text to detect language for"),
    },
    async ({ text }) =>
      safeCall(() =>
        getClient().translation.text.detect({
          data: { text },
        })
      )
  );

  // ── Speech to text ─────────────────────────────────────────────
  server.tool(
    "lark_ai_speech_to_text",
    "Transcribe audio to text (file-based recognition)",
    {
      speech_key: z
        .string()
        .describe("Feishu file key of the audio resource"),
      format: z
        .string()
        .optional()
        .describe("Audio format (e.g. pcm, wav, mp3, ogg)"),
    },
    async ({ speech_key, format }) =>
      safeCall(() =>
        (getClient() as any).speech_to_text.speech.fileRecognize({
          data: { speech: { speech_key }, config: { format } },
        })
      )
  );
}
