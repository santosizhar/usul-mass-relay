#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const scanRoots = [
  path.join(repoRoot, "packages"),
  path.join(repoRoot, "apps")
];
const forbiddenPattern = /\bprojects\//;

const errors = [];

const shouldScanFile = (filePath) => {
  const ext = path.extname(filePath);
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".md"].includes(ext);
};

const scanDir = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
      return;
    }

    if (!entry.isFile() || !shouldScanFile(fullPath)) {
      return;
    }

    const contents = fs.readFileSync(fullPath, "utf8");
    if (forbiddenPattern.test(contents)) {
      const relativePath = path.relative(repoRoot, fullPath);
      errors.push(`Forbidden projects/ reference found in ${relativePath}`);
    }
  });
};

scanRoots.forEach((root) => {
  if (fs.existsSync(root)) {
    scanDir(root);
  }
});

if (errors.length > 0) {
  console.error("Boundary enforcement checks failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Boundary enforcement checks passed.");
