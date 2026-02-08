import * as lark from "@larksuiteoapi/node-sdk";

let _client: lark.Client | null = null;

export interface LarkConfig {
  appId: string;
  appSecret: string;
  domain?: "feishu" | "lark";
}

export function getConfig(): LarkConfig {
  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "LARK_APP_ID and LARK_APP_SECRET environment variables are required"
    );
  }
  return {
    appId,
    appSecret,
    domain: (process.env.LARK_DOMAIN as "feishu" | "lark") || "feishu",
  };
}

export function getClient(): lark.Client {
  if (_client) return _client;
  const cfg = getConfig();
  _client = new lark.Client({
    appId: cfg.appId,
    appSecret: cfg.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: cfg.domain === "lark" ? lark.Domain.Lark : lark.Domain.Feishu,
  });
  return _client;
}
