/**
 * CLI entry point for validation.
 */

import { validatePlan } from "./validate.js";

async function main() {
  const { PLAN } = await import("../plan/graph.js");

  console.log("Validating plan...\n");

  const result = validatePlan(PLAN);

  if (result.valid) {
    console.log("✓ Plan is valid");
    console.log(`  ${PLAN.length} nodes validated`);
    process.exit(0);
  } else {
    console.error("✗ Validation failed:\n");
    for (const error of result.errors) {
      console.error(`  [${error.nodeId}] ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
