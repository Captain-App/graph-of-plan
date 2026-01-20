/**
 * Generates Astro Starlight sidebar config.
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, NodeKind } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

interface StarlightNavItem {
  label: string;
  slug: string;
}

interface StarlightNavGroup {
  label: string;
  items: StarlightNavItem[];
}

const KIND_LABELS: Record<NodeKind, string> = {
  thesis: "Thesis",
  product: "Products",
  capability: "Capabilities",
  primitive: "Primitives",
  risk: "Risks",
};

const KIND_ORDER: NodeKind[] = ["thesis", "product", "capability", "primitive", "risk"];

/**
 * Generate navigation structure from nodes
 */
export function generateSidebar(nodes: PlanNode[]): StarlightNavGroup[] {
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
  const sidebar: StarlightNavGroup[] = [];

  for (const kind of KIND_ORDER) {
    const nodesOfKind = grouped.get(kind) ?? [];
    if (nodesOfKind.length === 0) continue;

    sidebar.push({
      label: KIND_LABELS[kind],
      items: nodesOfKind.map((node) => ({
        label: node.title,
        slug: `${node.kind}/${node.id}`,
      })),
    });
  }

  return sidebar;
}

/**
 * Write navigation config to src/starlight-sidebar.ts
 */
export function writeSidebar(nodes: PlanNode[]): void {
  const sidebar = generateSidebar(nodes);
  const outPath = resolve(ROOT, "src/starlight-sidebar.ts");
  
  const content = `/**
 * Generated Starlight sidebar configuration.
 * DO NOT EDIT MANUALLY.
 */

export default ${JSON.stringify(sidebar, null, 2)};
`;
  
  writeFileSync(outPath, content, "utf-8");
}
