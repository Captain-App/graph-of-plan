/**
 * Renders MDX pages for Apollo Docs output.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, Thesis, Capability, Risk } from "../schema.js";
import { isThesis, isCapability, isRisk } from "../schema.js";
import { loadContent } from "./load-content.js";
import type { DerivedRelations } from "./derive-relations.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SITE_DOCS = resolve(ROOT, "site/docs");

/**
 * Render a single node to an MDX page
 */
export function renderPage(node: PlanNode, relations: DerivedRelations): string {
  const content = loadContent(node);
  const sections: string[] = [content];

  // Add relation sections based on node type
  if (isThesis(node)) {
    sections.push(renderThesisRelations(node));
  } else if (isCapability(node)) {
    sections.push(renderCapabilityRelations(node, relations));
  } else if (isRisk(node)) {
    sections.push(renderRiskRelations(node, relations));
  } else {
    // Primitive
    sections.push(renderPrimitiveRelations(node, relations));
  }

  return sections.filter(Boolean).join("\n\n");
}

function renderThesisRelations(thesis: Thesis): string {
  if (thesis.justifiedBy.length === 0) return "";

  const links = thesis.justifiedBy
    .map((cap) => `- [${cap.title}](/docs/capability/${cap.id})`)
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
      .map((p) => `- [${p.title}](/docs/primitive/${p.id})`)
      .join("\n");
    sections.push(`## Depends On\n\n${links}`);
  }

  // Risks
  if (cap.risks.length > 0) {
    const links = cap.risks
      .map((r) => `- [${r.title}](/docs/risk/${r.id})`)
      .join("\n");
    sections.push(`## Risks\n\n${links}`);
  }

  // Justifies (reverse relation)
  const justifies = relations.justifies.get(cap) ?? [];
  if (justifies.length > 0) {
    const links = justifies
      .map((t) => `- [${t.title}](/docs/thesis/${t.id})`)
      .join("\n");
    sections.push(`## Supports Thesis\n\n${links}`);
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
      .map((p) => `- [${p.title}](/docs/primitive/${p.id})`)
      .join("\n");
    sections.push(`## Mitigated By\n\n${links}`);
  }

  // Affects capabilities (reverse relation)
  const affects = relations.risksFor.get(risk) ?? [];
  if (affects.length > 0) {
    const links = affects
      .map((c) => `- [${c.title}](/docs/capability/${c.id})`)
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
      .map((c) => `- [${c.title}](/docs/capability/${c.id})`)
      .join("\n");
    sections.push(`## Used By\n\n${links}`);
  }

  // Mitigates risks
  const mitigates = relations.mitigates.get(node) ?? [];
  if (mitigates.length > 0) {
    const links = mitigates
      .map((r) => `- [${r.title}](/docs/risk/${r.id})`)
      .join("\n");
    sections.push(`## Mitigates\n\n${links}`);
  }

  return sections.join("\n\n");
}

/**
 * Write all pages to site/docs
 */
export function writePages(
  nodes: PlanNode[],
  relations: DerivedRelations
): void {
  for (const node of nodes) {
    const outDir = resolve(SITE_DOCS, node.kind);
    mkdirSync(outDir, { recursive: true });

    const content = renderPage(node, relations);
    const outPath = resolve(outDir, `${node.id}.mdx`);
    writeFileSync(outPath, content, "utf-8");
  }
}
