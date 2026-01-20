/**
 * Main compilation orchestrator.
 *
 * Steps:
 * 1. Load PLAN from /plan/graph.ts
 * 2. Validate graph integrity
 * 3. Derive reverse relations
 * 4. Render pages to site/docs
 * 5. Generate navigation config
 * 6. Emit graph.json for visualization
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePlan } from "../validate.js";
import { deriveRelations } from "./derive-relations.js";
import { writePages } from "./render-pages.js";
import { writeNav } from "./render-nav.js";
import type { PlanNode } from "../schema.js";
import { isThesis, isCapability, isRisk } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

interface GraphNode {
  id: string;
  kind: string;
  title: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

interface GraphJson {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Generate graph.json for visualization
 */
function generateGraphJson(nodes: PlanNode[]): GraphJson {
  const graphNodes: GraphNode[] = nodes.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
  }));

  const edges: GraphEdge[] = [];

  for (const node of nodes) {
    if (isThesis(node)) {
      for (const cap of node.justifiedBy) {
        edges.push({ from: node.id, to: cap.id, relation: "justifiedBy" });
      }
    }

    if (isCapability(node)) {
      for (const prim of node.dependsOn) {
        edges.push({ from: node.id, to: prim.id, relation: "dependsOn" });
      }
      for (const risk of node.risks) {
        edges.push({ from: node.id, to: risk.id, relation: "hasRisk" });
      }
    }

    if (isRisk(node)) {
      for (const prim of node.mitigatedBy) {
        edges.push({ from: node.id, to: prim.id, relation: "mitigatedBy" });
      }
    }
  }

  return { nodes: graphNodes, edges };
}

async function main() {
  console.log("Compiling plan...\n");

  // Step 1: Load plan
  const { PLAN } = await import("../../plan/graph.js");
  console.log(`Loaded ${PLAN.length} nodes`);

  // Step 2: Validate
  const validation = validatePlan(PLAN);
  if (!validation.valid) {
    console.error("\n✗ Validation failed:\n");
    for (const error of validation.errors) {
      console.error(`  [${error.nodeId}] ${error.message}`);
    }
    process.exit(1);
  }
  console.log("✓ Validation passed");

  // Step 3: Derive relations
  const relations = deriveRelations(PLAN);
  console.log("✓ Relations derived");

  // Step 4: Ensure site directories exist
  mkdirSync(resolve(ROOT, "site/docs"), { recursive: true });

  // Step 5: Write pages
  writePages(PLAN, relations);
  console.log("✓ Pages written to site/docs/");

  // Step 6: Write navigation
  writeNav(PLAN);
  console.log("✓ Navigation written to site/nav.json");

  // Step 7: Write graph.json
  const graphJson = generateGraphJson(PLAN);
  writeFileSync(
    resolve(ROOT, "site/graph.json"),
    JSON.stringify(graphJson, null, 2),
    "utf-8"
  );
  console.log("✓ Graph written to site/graph.json");

  console.log("\n✓ Compilation complete");
}

main().catch((err) => {
  console.error("Compilation error:", err);
  process.exit(1);
});
