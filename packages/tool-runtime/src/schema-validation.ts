export interface SchemaValidationIssue {
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  issues: SchemaValidationIssue[];
}

type SchemaNode = {
  type?: string;
  required?: string[];
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  enum?: string[];
  minLength?: number;
  minimum?: number;
  pattern?: string;
  format?: string;
  additionalProperties?: boolean;
  $ref?: string;
  $defs?: Record<string, SchemaNode>;
};

const isDateTime = (value: string): boolean => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
};

const resolveRef = (root: SchemaNode, ref: string): SchemaNode | undefined => {
  if (!ref.startsWith("#/$defs/")) {
    return undefined;
  }
  const key = ref.replace("#/$defs/", "");
  return root.$defs?.[key];
};

const validateNode = (
  root: SchemaNode,
  schemaNode: SchemaNode | undefined,
  value: unknown,
  path: string,
  issues: SchemaValidationIssue[]
): void => {
  if (!schemaNode) {
    return;
  }

  if (schemaNode.$ref) {
    const resolved = resolveRef(root, schemaNode.$ref);
    validateNode(root, resolved, value, path, issues);
    return;
  }

  if (schemaNode.type === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      issues.push({ path, message: "should be an object" });
      return;
    }

    const required = schemaNode.required ?? [];
    required.forEach((key) => {
      if (!(key in value)) {
        issues.push({ path: `${path}.${key}`, message: "is required" });
      }
    });

    const properties = schemaNode.properties ?? {};
    Object.keys(value as Record<string, unknown>).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(properties, key)) {
        if (schemaNode.additionalProperties === false) {
          issues.push({ path: `${path}.${key}`, message: "is not allowed" });
        }
        return;
      }
      validateNode(root, properties[key], (value as Record<string, unknown>)[key], `${path}.${key}`, issues);
    });
    return;
  }

  if (schemaNode.type === "array") {
    if (!Array.isArray(value)) {
      issues.push({ path, message: "should be an array" });
      return;
    }
    const itemsSchema = schemaNode.items;
    value.forEach((item, index) => {
      validateNode(root, itemsSchema, item, `${path}[${index}]`, issues);
    });
    return;
  }

  if (schemaNode.type === "string") {
    if (typeof value !== "string") {
      issues.push({ path, message: "should be a string" });
      return;
    }
    if (schemaNode.minLength && value.length < schemaNode.minLength) {
      issues.push({ path, message: `should be at least ${schemaNode.minLength} characters` });
    }
    if (schemaNode.enum && !schemaNode.enum.includes(value)) {
      issues.push({ path, message: `should be one of ${schemaNode.enum.join(", ")}` });
    }
    if (schemaNode.pattern) {
      const regex = new RegExp(schemaNode.pattern);
      if (!regex.test(value)) {
        issues.push({ path, message: `does not match pattern ${schemaNode.pattern}` });
      }
    }
    if (schemaNode.format === "date-time" && !isDateTime(value)) {
      issues.push({ path, message: "should be an ISO-8601 date-time string" });
    }
    return;
  }

  if (schemaNode.type === "number") {
    if (typeof value !== "number") {
      issues.push({ path, message: "should be a number" });
      return;
    }
    if (schemaNode.minimum !== undefined && value < schemaNode.minimum) {
      issues.push({ path, message: `should be at least ${schemaNode.minimum}` });
    }
    return;
  }

  if (schemaNode.type === "boolean") {
    if (typeof value !== "boolean") {
      issues.push({ path, message: "should be a boolean" });
    }
  }
};

export const validateAgainstSchema = (
  schema: SchemaNode,
  payload: unknown,
  rootLabel: string
): SchemaValidationResult => {
  const issues: SchemaValidationIssue[] = [];
  validateNode(schema, schema, payload, rootLabel, issues);
  return {
    valid: issues.length === 0,
    issues
  };
};
