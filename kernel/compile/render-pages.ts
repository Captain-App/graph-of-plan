/**
 * Renders MDX pages for Astro Starlight output.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, Thesis, Capability, Risk, Product } from "../schema.js";
import { isThesis, isCapability, isRisk, isProduct, isPrimitive } from "../schema.js";
import { loadContent } from "./load-content.js";
import type { DerivedRelations } from "./derive-relations.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SITE_DOCS = resolve(ROOT, "src/content/docs");

/**
 * Render a single node to an MDX page
 */
export function renderPage(node: PlanNode, relations: DerivedRelations): string {
  const content = loadContent(node);
  
  // Strip the first H1 if it exists, as Starlight uses frontmatter title
  const cleanContent = content.replace(/^# .*\n?/, "").trim();

  const frontmatter = [
    "---",
    `title: "${node.title}"`,
    `description: "Business plan node for ${node.title}"`,
    "---",
    "",
  ].join("\n");

  const sections: string[] = [frontmatter, cleanContent];

  // Add relation sections based on node type
  if (isThesis(node)) {
    sections.push(renderThesisRelations(node));
  } else if (isCapability(node)) {
    sections.push(renderCapabilityRelations(node, relations));
  } else if (isRisk(node)) {
    sections.push(renderRiskRelations(node, relations));
  } else if (isProduct(node)) {
    sections.push(renderProductRelations(node));
  } else if (isPrimitive(node)) {
    sections.push(renderPrimitiveRelations(node, relations));
  }

  return sections.filter(Boolean).join("\n\n");
}

function renderThesisRelations(thesis: Thesis): string {
  if (thesis.justifiedBy.length === 0) return "";

  const links = thesis.justifiedBy
    .map((cap) => `- [${cap.title}](/capability/${cap.id})`)
    .join("\n");

  return `## Justified By\n\n${links}`;
}

function renderCapabilityRelations(
  cap: Capability,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Depends on (primitives)
  if (cap.dependsOn.length > 0) {
    const links = cap.dependsOn
      .map((p) => `- [${p.title}](/primitive/${p.id})`)
      .join("\n");
    sections.push(`## Depends On\n\n${links}`);
  }

  // Risks
  if (cap.risks.length > 0) {
    const links = cap.risks
      .map((r) => `- [${r.title}](/risk/${r.id})`)
      .join("\n");
    sections.push(`## Risks\n\n${links}`);
  }

  // Justifies (reverse relation)
  const justifies = relations.justifies.get(cap) ?? [];
  if (justifies.length > 0) {
    const links = justifies
      .map((t) => `- [${t.title}](/thesis/${t.id})`)
      .join("\n");
    sections.push(`## Supports Thesis\n\n${links}`);
  }

  // Enables products (reverse relation)
  const enablesProducts = relations.enables.get(cap) ?? [];
  if (enablesProducts.length > 0) {
    const links = enablesProducts
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Enables Products\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderRiskRelations(
  risk: Risk,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Mitigated by
  if (risk.mitigatedBy.length > 0) {
    const links = risk.mitigatedBy
      .map((p) => `- [${p.title}](/primitive/${p.id})`)
      .join("\n");
    sections.push(`## Mitigated By\n\n${links}`);
  }

  // Affects capabilities (reverse relation)
  const affects = relations.risksFor.get(risk) ?? [];
  if (affects.length > 0) {
    const links = affects
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Affects\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderPrimitiveRelations(
  node: PlanNode,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Used by capabilities
  const usedBy = relations.dependedOnBy.get(node) ?? [];
  if (usedBy.length > 0) {
    const links = usedBy
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Used By\n\n${links}`);
  }

  // Mitigates risks
  const mitigates = relations.mitigates.get(node) ?? [];
  if (mitigates.length > 0) {
    const links = mitigates
      .map((r) => `- [${r.title}](/risk/${r.id})`)
      .join("\n");
    sections.push(`## Mitigates\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderProductRelations(product: Product): string {
  if (product.enabledBy.length === 0) return "";

  const links = product.enabledBy
    .map((cap) => `- [${cap.title}](/capability/${cap.id})`)
    .join("\n");

  return `## Enabled By\n\n${links}`;
}

/**
 * Render the index/landing page
 */
function renderIndexPage(nodes: PlanNode[]): string {
  const theses = nodes.filter(isThesis);
  const capabilities = nodes.filter(isCapability);
  const products = nodes.filter(isProduct);
  const primitives = nodes.filter(isPrimitive);
  const risks = nodes.filter(isRisk);

  const sections: string[] = [
    "---",
    'title: "Graph of Plan"',
    'description: "Business plan as a navigable graph"',
    "---",
    "",
    "Welcome to the Graph of Plan — a structured, navigable view of the business strategy.",
    "",
  ];

  if (theses.length > 0) {
    sections.push("## Thesis\n");
    sections.push(theses.map((t) => `- [${t.title}](/thesis/${t.id})`).join("\n"));
    sections.push("");
  }

  if (products.length > 0) {
    sections.push("## Products\n");
    sections.push(products.map((p) => `- [${p.title}](/product/${p.id})`).join("\n"));
    sections.push("");
  }

  if (capabilities.length > 0) {
    sections.push("## Capabilities\n");
    sections.push(capabilities.map((c) => `- [${c.title}](/capability/${c.id})`).join("\n"));
    sections.push("");
  }

  if (primitives.length > 0) {
    sections.push("## Primitives\n");
    sections.push(primitives.map((p) => `- [${p.title}](/primitive/${p.id})`).join("\n"));
    sections.push("");
  }

  if (risks.length > 0) {
    sections.push("## Risks\n");
    sections.push(risks.map((r) => `- [${r.title}](/risk/${r.id})`).join("\n"));
    sections.push("");
  }

  return sections.join("\n");
}

/**
 * Write all pages to src/content/docs
 */
export function writePages(
  nodes: PlanNode[],
  relations: DerivedRelations
): void {
  // Write index page
  const indexContent = renderIndexPage(nodes);
  writeFileSync(resolve(SITE_DOCS, "index.mdx"), indexContent, "utf-8");

  // Write individual node pages
  for (const node of nodes) {
    const outDir = resolve(SITE_DOCS, node.kind);
    mkdirSync(outDir, { recursive: true });

    const content = renderPage(node, relations);
    const outPath = resolve(outDir, `${node.id}.mdx`);
    writeFileSync(outPath, content, "utf-8");
  }
}
