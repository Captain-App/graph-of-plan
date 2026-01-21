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
  project: "Customer Projects",
  milestone: "Milestones",
  repository: "Repositories",
  capability: "Capabilities",
  primitive: "Primitives",
  "supplier-primitive": "Supplier Primitives",
  tooling: "Tooling",
  risk: "Risks",
  supplier: "Suppliers",
  customer: "Customers",
  competitor: "Competitors",
};

const KIND_ORDER: NodeKind[] = [
  "thesis",
  "product",
  "project",
  "milestone",
  "repository",
  "capability",
  "primitive",
  "supplier-primitive",
  "tooling",
  "risk",
  "supplier",
  "customer",
  "competitor",
];

/**
 * Static pages that aren't part of the graph but should appear in navigation
 */
const STATIC_PAGES: StarlightNavGroup[] = [
  {
    label: "Timelines",
    items: [
      { label: "Overview", slug: "timeline" },
      { label: "Expected (36mo)", slug: "timeline/expected" },
      { label: "Aggressive (18mo)", slug: "timeline/aggressive" },
      { label: "Speed of Light (12mo)", slug: "timeline/speed-of-light" },
    ],
  },
  {
    label: "Technology Stack",
    items: [
      { label: "Stack Overview", slug: "stack" },
    ],
  },
  {
    label: "Team & Strategy",
    items: [
      { label: "Team", slug: "team" },
      { label: "Go-to-Market Sequence", slug: "strategy/gtm-sequence" },
    ],
  },
];

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

  // Add static pages at the end
  sidebar.push(...STATIC_PAGES);

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
