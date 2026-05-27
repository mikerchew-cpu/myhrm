export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const PROVIDER_CONFIGS: Record<string, { baseEndpoint: string; model: string }> = {
  deepseek: { baseEndpoint: "https://api.deepseek.com/v1/chat/completions", model: "deepseek-chat" },
  gemini: { baseEndpoint: "https://generativelanguage.googleapis.com/v1beta/models", model: "gemini-3.5-flash" },
  claude: { baseEndpoint: "https://api.anthropic.com/v1/messages", model: "claude-sonnet-4-20250514" },
};

export async function callAi(
  provider: string,
  apiKey: string,
  messages: AiMessage[],
  customEndpoint?: string,
): Promise<string> {
  const cfg = PROVIDER_CONFIGS[provider];
  if (!cfg) throw new Error(`Unknown AI provider: ${provider}`);

  const endpoint = customEndpoint || cfg.baseEndpoint;

  if (provider === "gemini") {
    const url = `${endpoint}/${cfg.model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  if (provider === "claude") {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 4096,
        messages: messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content })),
        system: messages.find(m => m.role === "system")?.content,
      }),
    });
    if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data?.content?.[0]?.text || "";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`${provider} API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function testConnection(provider: string, apiKey: string, endpoint?: string): Promise<string> {
  try {
    const result = await callAi(provider, apiKey, [
      { role: "user", content: "Reply with only the word: OK" },
    ], endpoint);
    return result.includes("OK") ? "Connected" : "Responded but unexpected";
  } catch (e: unknown) {
    const err = e as Error;
    return `Failed: ${err.message}`;
  }
}
