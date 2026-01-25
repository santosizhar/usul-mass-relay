import fs from "fs";
import path from "path";

import {
  FactoryObject,
  FactoryObjectType,
  validateFactoryObject,
} from "../../factory-objects/src";

export interface FactoryStoreOptions {
  baseDir?: string;
  validate?: boolean;
}

const DEFAULT_FACTORY_DIR = path.resolve(process.cwd(), "artifacts", "factory-objects");

export const getFactoryObjectDir = (
  objectType: FactoryObjectType,
  baseDir = DEFAULT_FACTORY_DIR,
): string => {
  return path.join(baseDir, objectType);
};

export const getFactoryObjectId = (object: FactoryObject): string => {
  switch (object.object_type) {
    case "document":
      return object.document_id;
    case "record":
      return object.record_id;
    case "task":
      return object.task_id;
    case "workflow_run":
      return object.workflow_run_id;
    case "ai_request":
      return object.ai_request_id;
    case "ai_response":
      return object.ai_response_id;
    case "insight":
      return object.insight_id;
    case "evaluation_result":
      return object.evaluation_result_id;
    default:
      throw new Error("Unsupported object type");
  }
};

export const persistFactoryObject = (object: FactoryObject, options: FactoryStoreOptions = {}): string => {
  const baseDir = options.baseDir ?? DEFAULT_FACTORY_DIR;
  const shouldValidate = options.validate ?? true;

  if (shouldValidate) {
    const validation = validateFactoryObject(object);
    if (!validation.valid) {
      throw new Error(`Factory object validation failed: ${validation.errors.join("; ")}`);
    }
  }

  const objectDir = getFactoryObjectDir(object.object_type, baseDir);
  const objectId = getFactoryObjectId(object);
  const objectFile = path.join(objectDir, `${objectId}.json`);

  if (fs.existsSync(objectFile)) {
    throw new Error(`Factory object already exists at ${objectFile}`);
  }

  fs.mkdirSync(objectDir, { recursive: true });
  fs.writeFileSync(objectFile, `${JSON.stringify(object, null, 2)}\n`, "utf8");

  return objectFile;
};

export const loadFactoryObject = (
  objectType: FactoryObjectType,
  objectId: string,
  options: FactoryStoreOptions = {},
): FactoryObject => {
  const baseDir = options.baseDir ?? DEFAULT_FACTORY_DIR;
  const shouldValidate = options.validate ?? true;
  const objectFile = path.join(getFactoryObjectDir(objectType, baseDir), `${objectId}.json`);

  const contents = fs.readFileSync(objectFile, "utf8");
  const parsed = JSON.parse(contents) as FactoryObject;

  if (shouldValidate) {
    const validation = validateFactoryObject(parsed);
    if (!validation.valid) {
      throw new Error(`Factory object validation failed: ${validation.errors.join("; ")}`);
    }
  }

  return parsed;
};

export const listFactoryObjectIds = (
  objectType: FactoryObjectType,
  options: FactoryStoreOptions = {},
): string[] => {
  const baseDir = options.baseDir ?? DEFAULT_FACTORY_DIR;
  const objectDir = getFactoryObjectDir(objectType, baseDir);

  if (!fs.existsSync(objectDir)) {
    return [];
  }

  return fs
    .readdirSync(objectDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/, ""))
    .sort();
};
