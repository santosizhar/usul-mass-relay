import {
  GatewayPromptInput,
  ModelAdapter,
  ModelInvocationRequest,
  ModelInvocationResult,
} from "./gateway";

interface ChatCompletionDefaults {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
}

interface AdapterResponseUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

const coerceUsage = (usage: AdapterResponseUsage | undefined): Record<string, number> | undefined => {
  if (!usage) {
    return undefined;
  }

  const normalized: Record<string, number> = {};
  if (typeof usage.prompt_tokens === "number") {
    normalized.prompt_tokens = usage.prompt_tokens;
  }
  if (typeof usage.completion_tokens === "number") {
    normalized.completion_tokens = usage.completion_tokens;
  }
  if (typeof usage.total_tokens === "number") {
    normalized.total_tokens = usage.total_tokens;
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const mapChatMessages = (inputs: GatewayPromptInput[]) => {
  return inputs.map((input) => ({
    role: input.role,
    content: input.content,
  }));
};

const mapGeminiRole = (role: GatewayPromptInput["role"]): "user" | "model" => {
  return role === "assistant" ? "model" : "user";
};

const ensureApiKey = (apiKey: string | undefined, provider: string): string => {
  if (!apiKey) {
    throw new Error(`${provider} API key is required.`);
  }
  return apiKey;
};

export interface OpenAIAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  defaultParams?: ChatCompletionDefaults;
}

export class OpenAIAdapter implements ModelAdapter {
  id: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization?: string;
  private readonly project?: string;
  private readonly defaultParams: ChatCompletionDefaults;

  constructor(id = "openai", config: OpenAIAdapterConfig = {}) {
    this.id = id;
    this.apiKey = ensureApiKey(config.apiKey ?? process.env.OPENAI_API_KEY, "OpenAI");
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
    this.organization = config.organization ?? process.env.OPENAI_ORG_ID;
    this.project = config.project ?? process.env.OPENAI_PROJECT_ID;
    this.defaultParams = config.defaultParams ?? {};
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...(this.organization ? { "OpenAI-Organization": this.organization } : {}),
        ...(this.project ? { "OpenAI-Project": this.project } : {}),
      },
      body: JSON.stringify({
        model: request.model,
        messages: mapChatMessages(request.inputs),
        ...this.defaultParams,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: AdapterResponseUsage;
    };
    const output = payload.choices?.[0]?.message?.content ?? "";

    return {
      output_text: output,
      model: request.model,
      usage: coerceUsage(payload.usage),
      metadata: { adapter_id: this.id, provider: "openai" },
    };
  }
}

export interface GrokAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultParams?: ChatCompletionDefaults;
}

export class GrokAdapter implements ModelAdapter {
  id: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultParams: ChatCompletionDefaults;

  constructor(id = "grok", config: GrokAdapterConfig = {}) {
    this.id = id;
    this.apiKey = ensureApiKey(config.apiKey ?? process.env.GROK_API_KEY, "Grok");
    this.baseUrl = config.baseUrl ?? "https://api.x.ai/v1";
    this.defaultParams = config.defaultParams ?? {};
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: mapChatMessages(request.inputs),
        ...this.defaultParams,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Grok request failed: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: AdapterResponseUsage;
    };
    const output = payload.choices?.[0]?.message?.content ?? "";

    return {
      output_text: output,
      model: request.model,
      usage: coerceUsage(payload.usage),
      metadata: { adapter_id: this.id, provider: "grok" },
    };
  }
}

export interface DeepseekAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultParams?: ChatCompletionDefaults;
}

export class DeepseekAdapter implements ModelAdapter {
  id: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultParams: ChatCompletionDefaults;

  constructor(id = "deepseek", config: DeepseekAdapterConfig = {}) {
    this.id = id;
    this.apiKey = ensureApiKey(config.apiKey ?? process.env.DEEPSEEK_API_KEY, "Deepseek");
    this.baseUrl = config.baseUrl ?? "https://api.deepseek.com";
    this.defaultParams = config.defaultParams ?? {};
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: mapChatMessages(request.inputs),
        ...this.defaultParams,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Deepseek request failed: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: AdapterResponseUsage;
    };
    const output = payload.choices?.[0]?.message?.content ?? "";

    return {
      output_text: output,
      model: request.model,
      usage: coerceUsage(payload.usage),
      metadata: { adapter_id: this.id, provider: "deepseek" },
    };
  }
}

export interface GeminiAdapterConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultParams?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
  };
}

export class GeminiAdapter implements ModelAdapter {
  id: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultParams: GeminiAdapterConfig["defaultParams"];

  constructor(id = "gemini", config: GeminiAdapterConfig = {}) {
    this.id = id;
    this.apiKey = ensureApiKey(config.apiKey ?? process.env.GEMINI_API_KEY, "Gemini");
    this.baseUrl = config.baseUrl ?? "https://generativelanguage.googleapis.com/v1beta";
    this.defaultParams = config.defaultParams;
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    const url = new URL(`${this.baseUrl}/models/${request.model}:generateContent`);
    url.searchParams.set("key", this.apiKey);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: request.inputs.map((input) => ({
          role: mapGeminiRole(input.role),
          parts: [{ text: input.content }],
        })),
        generationConfig: this.defaultParams,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };
    const output = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return {
      output_text: output,
      model: request.model,
      usage: coerceUsage(
        payload.usageMetadata
          ? {
              prompt_tokens: payload.usageMetadata.promptTokenCount,
              completion_tokens: payload.usageMetadata.candidatesTokenCount,
              total_tokens: payload.usageMetadata.totalTokenCount,
            }
          : undefined,
      ),
      metadata: { adapter_id: this.id, provider: "gemini" },
    };
  }
}

export interface OllamaAdapterConfig {
  baseUrl?: string;
  defaultParams?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export class OllamaAdapter implements ModelAdapter {
  id: string;
  private readonly baseUrl: string;
  private readonly defaultParams: OllamaAdapterConfig["defaultParams"];

  constructor(id = "ollama", config: OllamaAdapterConfig = {}) {
    this.id = id;
    this.baseUrl = config.baseUrl ?? "http://localhost:11434";
    this.defaultParams = config.defaultParams;
  }

  async invoke(request: ModelInvocationRequest): Promise<ModelInvocationResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: mapChatMessages(request.inputs),
        options: this.defaultParams,
        stream: false,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Ollama request failed: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };

    return {
      output_text: payload.message?.content ?? "",
      model: request.model,
      usage: coerceUsage({
        prompt_tokens: payload.prompt_eval_count,
        completion_tokens: payload.eval_count,
        total_tokens:
          typeof payload.prompt_eval_count === "number" && typeof payload.eval_count === "number"
            ? payload.prompt_eval_count + payload.eval_count
            : undefined,
      }),
      metadata: { adapter_id: this.id, provider: "ollama" },
    };
  }
}
