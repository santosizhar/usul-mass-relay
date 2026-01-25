import type { FactoryObject } from "../../factory-objects/src/types";
import { persistFactoryObject } from "./factory-store";

export interface FactoryPipelineResult {
  persisted: string[];
  failed: Array<{ object_type: string; error: string }>;
}

export const persistFactoryObjects = (
  objects: FactoryObject[],
  options: { validate?: boolean; baseDir?: string } = {}
): FactoryPipelineResult => {
  const persisted: string[] = [];
  const failed: Array<{ object_type: string; error: string }> = [];

  for (const object of objects) {
    try {
      const file = persistFactoryObject(object, options);
      persisted.push(file);
    } catch (error) {
      failed.push({
        object_type: object.object_type,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return { persisted, failed };
};
