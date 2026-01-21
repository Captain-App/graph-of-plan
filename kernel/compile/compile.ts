/**
 * Main compilation orchestrator for Astro Starlight.
 *
 * Steps:
 * 1. Load PLAN from /plan/graph.ts
 * 2. Validate graph integrity
 * 3. Derive reverse relations
 * 4. Render pages to src/content/docs
 * 5. Generate Starlight sidebar config
 * 6. Emit graph.json to public/
 */

import { mkdirSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePlan } from "../validate.js";
import { deriveRelations } from "./derive-relations.js";
import { writePages } from "./render-pages.js";
import { writeSidebar } from "./render-nav.js";
import { writeTimelinePages } from "./render-timelines.js";
import { writeStackPages } from "./render-stack.js";
import type { PlanNode } from "../schema.js";
import { isThesis, isCapability, isRisk, isProduct, isProject, isSupplierPrimitive, isTooling, isMilestone, isRepository } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const CONTENT_DIR = resolve(ROOT, "content");
const DOCS_DIR = resolve(ROOT, "src/content/docs");

/**
 * Static pages that should be copied from content/ to src/content/docs/
 * These are manually written pages, not generated from the graph.
 */
const STATIC_PAGES = [
  "team.mdx",
  "strategy/gtm-sequence.mdx",
];

/**
 * Copy static pages from content/ to src/content/docs/
 */
function copyStaticPages(): void {
  for (const page of STATIC_PAGES) {
    const src = resolve(CONTENT_DIR, page);
    const dest = resolve(DOCS_DIR, page);

    if (!existsSync(src)) {
      console.warn(`  Warning: Static page not found: ${page}`);
      continue;
    }

    // Ensure destination directory exists
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
}

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
      for (const sp of node.supplierPrimitives) {
        edges.push({ from: node.id, to: sp.id, relation: "usesSupplierPrimitive" });
      }
      for (const tool of node.tooling) {
        edges.push({ from: node.id, to: tool.id, relation: "usesTooling" });
      }
      for (const risk of node.risks) {
        edges.push({ from: node.id, to: risk.id, relation: "hasRisk" });
      }
      for (const supplier of node.suppliers) {
        edges.push({ from: node.id, to: supplier.id, relation: "suppliedBy" });
      }
    }

    if (isTooling(node)) {
      for (const prim of node.dependsOn) {
        edges.push({ from: node.id, to: prim.id, relation: "dependsOn" });
      }
      for (const sp of node.supplierPrimitives) {
        edges.push({ from: node.id, to: sp.id, relation: "usesSupplierPrimitive" });
      }
    }

    if (isSupplierPrimitive(node)) {
      edges.push({ from: node.id, to: node.supplier.id, relation: "providedBy" });
    }

    if (isRisk(node)) {
      for (const prim of node.mitigatedBy) {
        edges.push({ from: node.id, to: prim.id, relation: "mitigatedBy" });
      }
    }

    if (isProduct(node)) {
      for (const cap of node.enabledBy) {
        edges.push({ from: node.id, to: cap.id, relation: "enabledBy" });
      }
      for (const tool of node.tooling) {
        edges.push({ from: node.id, to: tool.id, relation: "usesTooling" });
      }
      for (const customer of node.customers) {
        edges.push({ from: node.id, to: customer.id, relation: "targets" });
      }
      for (const competitor of node.competitors) {
        edges.push({ from: node.id, to: competitor.id, relation: "competesWith" });
      }
    }

    if (isProject(node)) {
      for (const cap of node.enabledBy) {
        edges.push({ from: node.id, to: cap.id, relation: "enabledBy" });
      }
      for (const tool of node.tooling) {
        edges.push({ from: node.id, to: tool.id, relation: "usesTooling" });
      }
    }

    if (isMilestone(node)) {
      for (const ms of node.dependsOnMilestones) {
        edges.push({ from: node.id, to: ms.id, relation: "dependsOnMilestone" });
      }
      for (const cap of node.dependsOnCapabilities) {
        edges.push({ from: node.id, to: cap.id, relation: "requiresCapability" });
      }
      for (const prod of node.products) {
        edges.push({ from: node.id, to: prod.id, relation: "advancesProduct" });
      }
    }

    if (isRepository(node)) {
      for (const repo of node.dependsOn) {
        edges.push({ from: node.id, to: repo.id, relation: "dependsOnRepo" });
      }
      if (node.upstream) {
        edges.push({ from: node.id, to: node.upstream.id, relation: "forkedFrom" });
      }
      for (const prod of node.products) {
        edges.push({ from: node.id, to: prod.id, relation: "enablesProduct" });
      }
      for (const cap of node.capabilities) {
        edges.push({ from: node.id, to: cap.id, relation: "implementsCapability" });
      }
    }
  }

  return { nodes: graphNodes, edges };
}

async function main() {
  console.log("Compiling plan for Astro Starlight...\n");

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

  // Step 4: Ensure output directories exist
  mkdirSync(resolve(ROOT, "src/content/docs"), { recursive: true });
  mkdirSync(resolve(ROOT, "public"), { recursive: true });

  // Step 5: Write pages
  writePages(PLAN, relations);
  console.log("✓ Pages written to src/content/docs/");

  // Step 5.1: Copy static pages
  copyStaticPages();
  console.log("✓ Static pages copied");

  // Step 5.5: Write timeline pages
  const milestones = PLAN.filter(isMilestone);
  writeTimelinePages(milestones);

  // Step 5.6: Write stack pages
  const repositories = PLAN.filter(isRepository);
  writeStackPages(repositories);

  // Step 6: Write navigation (sidebar)
  writeSidebar(PLAN);
  console.log("✓ Sidebar config written to src/starlight-sidebar.ts");

  // Step 7: Write graph.json to public
  const graphJson = generateGraphJson(PLAN);
  writeFileSync(
    resolve(ROOT, "public/graph.json"),
    JSON.stringify(graphJson, null, 2),
    "utf-8"
  );
  console.log("✓ Graph written to public/graph.json");

  console.log("\n✓ Compilation complete");
}

main().catch((err) => {
  console.error("Compilation error:", err);
  process.exit(1);
});
