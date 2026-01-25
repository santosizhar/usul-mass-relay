const fs = require("fs");
const path = require("path");

const playbooksPath = path.join(
  __dirname,
  "..",
  "apps",
  "control-room-runs",
  "app",
  "data",
  "playbooks.json"
);

const playbooks = JSON.parse(fs.readFileSync(playbooksPath, "utf8"));

if (!Array.isArray(playbooks) || playbooks.length === 0) {
  throw new Error("Playbooks must be a non-empty array.");
}

const requiredKeys = [
  "playbook_id",
  "name",
  "version",
  "description",
  "owner",
  "created_at",
  "updated_at",
  "runtime",
  "inputs",
  "outputs",
  "governance",
  "steps"
];

playbooks.forEach((playbook) => {
  requiredKeys.forEach((key) => {
    if (!(key in playbook)) {
      throw new Error(`Playbook missing key: ${key}`);
    }
  });

  if (!Array.isArray(playbook.steps) || playbook.steps.length === 0) {
    throw new Error(`Playbook ${playbook.playbook_id} must include steps.`);
  }
});

console.log("Control Room playbook explorer check passed.");
