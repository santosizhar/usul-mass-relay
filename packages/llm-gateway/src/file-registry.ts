import fs from "node:fs";
import path from "node:path";

import { PromptRegistry, PromptRegistryRecord, PromptVersion } from "./gateway";

export interface FilePromptRegistryOptions {
  baseDir?: string;
}

const loadPromptRecords = (baseDir: string): PromptRegistryRecord[] => {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const files = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(baseDir, entry.name));

  return files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw) as PromptRegistryRecord;
  });
};

export const createFilePromptRegistry = (options: FilePromptRegistryOptions = {}): PromptRegistry => {
  const baseDir = options.baseDir ?? path.resolve(process.cwd(), "artifacts", "prompts");
  const records = loadPromptRecords(baseDir);

  return {
    getPrompt: (promptId: string): PromptRegistryRecord | undefined => {
      return records.find((record) => record.prompt_id === promptId);
    },
    getPromptVersion: (promptId: string, version: string): PromptVersion | undefined => {
      const prompt = records.find((record) => record.prompt_id === promptId);
      return prompt?.versions.find((item) => item.version === version);
    },
    listPromptVersions: (promptId: string): PromptVersion[] => {
      const prompt = records.find((record) => record.prompt_id === promptId);
      return prompt?.versions ?? [];
    }
  };
};
