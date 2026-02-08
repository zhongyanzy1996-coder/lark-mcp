/** Format a successful result as MCP text content. */
export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

/** Format an error as MCP text content. */
export function err(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

/** Safely execute a Lark API call and return MCP-formatted result. */
export async function safeCall<T>(fn: () => Promise<T>) {
  try {
    const result = await fn();
    return ok(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return err(msg);
  }
}
