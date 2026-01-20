/**
 * Generates Apollo/Docusaurus navigation config.
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, NodeKind } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const KIND_LABELS: Record<NodeKind, string> = {
  thesis: "Thesis",
  capability: "Capabilities",
  primitive: "Primitives",
  risk: "Risks",
};

const KIND_ORDER: NodeKind[] = ["thesis", "capability", "primitive", "risk"];

/**
 * Generate navigation structure from nodes
 */
export function generateNav(nodes: PlanNode[]): NavGroup[] {
  const grouped = new Map<NodeKind, PlanNode[]>();

  // Initialize groups
  for (const kind of KIND_ORDER) {
    grouped.set(kind, []);
  }

  // Group nodes by kind
  for (const node of nodes) {
    grouped.get(node.kind)?.push(node);
  }

  // Build nav structure
  const nav: NavGroup[] = [];

  for (const kind of KIND_ORDER) {
    const nodesOfKind = grouped.get(kind) ?? [];
    if (nodesOfKind.length === 0) continue;

    nav.push({
      label: KIND_LABELS[kind],
      items: nodesOfKind.map((node) => ({
        label: node.title,
        path: `/docs/${node.kind}/${node.id}`,
      })),
    });
  }

  return nav;
}

/**
 * Write navigation config to site/nav.json
 */
export function writeNav(nodes: PlanNode[]): void {
  const nav = generateNav(nodes);
  const outPath = resolve(ROOT, "site/nav.json");
  writeFileSync(outPath, JSON.stringify(nav, null, 2), "utf-8");
}
