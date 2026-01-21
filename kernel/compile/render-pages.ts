/**
 * Renders MDX pages for Astro Starlight output.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, Thesis, Capability, Risk, Product, Project, Supplier, SupplierPrimitive, Tooling, Customer, Competitor } from "../schema.js";
import { isThesis, isCapability, isRisk, isProduct, isProject, isPrimitive, isSupplierPrimitive, isTooling, isSupplier, isCustomer, isCompetitor } from "../schema.js";
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
    sections.push(renderProductRelations(node, relations));
  } else if (isProject(node)) {
    sections.push(renderProjectRelations(node, relations));
  } else if (isPrimitive(node)) {
    sections.push(renderPrimitiveRelations(node, relations));
  } else if (isSupplierPrimitive(node)) {
    sections.push(renderSupplierPrimitiveRelations(node, relations));
  } else if (isTooling(node)) {
    sections.push(renderToolingRelations(node, relations));
  } else if (isSupplier(node)) {
    sections.push(renderSupplierRelations(node, relations));
  } else if (isCustomer(node)) {
    sections.push(renderCustomerRelations(node, relations));
  } else if (isCompetitor(node)) {
    sections.push(renderCompetitorRelations(node, relations));
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

  // Supplier Primitives
  if (cap.supplierPrimitives.length > 0) {
    const links = cap.supplierPrimitives
      .map((sp) => `- [${sp.title}](/supplier-primitive/${sp.id})`)
      .join("\n");
    sections.push(`## Uses Supplier Primitives\n\n${links}`);
  }

  // Tooling
  if (cap.tooling.length > 0) {
    const links = cap.tooling
      .map((t) => `- [${t.title}](/tooling/${t.id})`)
      .join("\n");
    sections.push(`## Uses Tooling\n\n${links}`);
  }

  // Suppliers
  if (cap.suppliers.length > 0) {
    const links = cap.suppliers
      .map((s) => `- [${s.title}](/supplier/${s.id})`)
      .join("\n");
    sections.push(`## Supplied By\n\n${links}`);
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

  // Enables projects (reverse relation)
  const enablesProjects = relations.enablesProjects.get(cap) ?? [];
  if (enablesProjects.length > 0) {
    const links = enablesProjects
      .map((p) => `- [${p.title}](/project/${p.id})`)
      .join("\n");
    sections.push(`## Enables Projects\n\n${links}`);
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

function renderProductRelations(
  product: Product,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Enabled by (capabilities)
  if (product.enabledBy.length > 0) {
    const links = product.enabledBy
      .map((cap) => `- [${cap.title}](/capability/${cap.id})`)
      .join("\n");
    sections.push(`## Enabled By\n\n${links}`);
  }

  // Tooling
  if (product.tooling.length > 0) {
    const links = product.tooling
      .map((t) => `- [${t.title}](/tooling/${t.id})`)
      .join("\n");
    sections.push(`## Uses Tooling\n\n${links}`);
  }

  // Customers
  if (product.customers.length > 0) {
    const links = product.customers
      .map((c) => `- [${c.title}](/customer/${c.id})`)
      .join("\n");
    sections.push(`## Target Customers\n\n${links}`);
  }

  // Competitors
  if (product.competitors.length > 0) {
    const links = product.competitors
      .map((c) => `- [${c.title}](/competitor/${c.id})`)
      .join("\n");
    sections.push(`## Competes With\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderProjectRelations(
  project: Project,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Enabled by (capabilities)
  if (project.enabledBy.length > 0) {
    const links = project.enabledBy
      .map((cap) => `- [${cap.title}](/capability/${cap.id})`)
      .join("\n");
    sections.push(`## Enabled By\n\n${links}`);
  }

  // Tooling
  if (project.tooling.length > 0) {
    const links = project.tooling
      .map((t) => `- [${t.title}](/tooling/${t.id})`)
      .join("\n");
    sections.push(`## Uses Tooling\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderSupplierPrimitiveRelations(
  node: SupplierPrimitive,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Provided by supplier
  sections.push(`## Provided By\n\n- [${node.supplier.title}](/supplier/${node.supplier.id})`);

  // Used by capabilities (reverse relation)
  const usedByCaps = relations.usedByCapabilities.get(node) ?? [];
  if (usedByCaps.length > 0) {
    const links = usedByCaps
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Used By Capabilities\n\n${links}`);
  }

  // Used by tooling (reverse relation)
  const usedByTools = relations.usedByTooling.get(node) ?? [];
  if (usedByTools.length > 0) {
    const links = usedByTools
      .map((t) => `- [${t.title}](/tooling/${t.id})`)
      .join("\n");
    sections.push(`## Used By Tooling\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderToolingRelations(
  node: Tooling,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Depends on primitives
  if (node.dependsOn.length > 0) {
    const links = node.dependsOn
      .map((p) => `- [${p.title}](/primitive/${p.id})`)
      .join("\n");
    sections.push(`## Depends On\n\n${links}`);
  }

  // Uses supplier primitives
  if (node.supplierPrimitives.length > 0) {
    const links = node.supplierPrimitives
      .map((sp) => `- [${sp.title}](/supplier-primitive/${sp.id})`)
      .join("\n");
    sections.push(`## Uses Supplier Primitives\n\n${links}`);
  }

  // Used by capabilities (reverse relation)
  const usedByCaps = relations.toolingUsedByCapabilities.get(node) ?? [];
  if (usedByCaps.length > 0) {
    const links = usedByCaps
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Enables Capabilities\n\n${links}`);
  }

  // Used by products (reverse relation)
  const usedByProds = relations.toolingUsedByProducts.get(node) ?? [];
  if (usedByProds.length > 0) {
    const links = usedByProds
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Used By Products\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderSupplierRelations(
  node: PlanNode,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Provides primitives
  const providesPrimitives = relations.providesSupplierPrimitives.get(node) ?? [];
  if (providesPrimitives.length > 0) {
    const links = providesPrimitives
      .map((sp) => `- [${sp.title}](/supplier-primitive/${sp.id})`)
      .join("\n");
    sections.push(`## Provides Primitives\n\n${links}`);
  }

  // Supplies capabilities (reverse relation)
  const supplies = relations.supplies.get(node) ?? [];
  if (supplies.length > 0) {
    const links = supplies
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Supplies\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderCustomerRelations(
  node: PlanNode,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Targeted by products (reverse relation)
  const targetedBy = relations.targetedBy.get(node) ?? [];
  if (targetedBy.length > 0) {
    const links = targetedBy
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Targeted By\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderCompetitorRelations(
  node: PlanNode,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Competed by products (reverse relation)
  const competedBy = relations.competedBy.get(node) ?? [];
  if (competedBy.length > 0) {
    const links = competedBy
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Competes Against\n\n${links}`);
  }

  return sections.join("\n\n");
}

/**
 * Render the index/landing page
 */
function renderIndexPage(nodes: PlanNode[]): string {
  const theses = nodes.filter(isThesis);
  const capabilities = nodes.filter(isCapability);
  const products = nodes.filter(isProduct);
  const projects = nodes.filter(isProject);
  const primitives = nodes.filter(isPrimitive);
  const supplierPrimitives = nodes.filter(isSupplierPrimitive);
  const tooling = nodes.filter(isTooling);
  const risks = nodes.filter(isRisk);
  const suppliers = nodes.filter(isSupplier);
  const customers = nodes.filter(isCustomer);
  const competitors = nodes.filter(isCompetitor);

  const sections: string[] = [
    "---",
    'title: "Graph of Plan"',
    'description: "A business plan as a navigable dependency graph"',
    "---",
    "",
    "Most business plans are documents. This one is a graph.",
    "",
    "Every product traces down to the capabilities that enable it. Every capability traces down to the primitives that make it possible. Every primitive traces to the suppliers who provide it. Click any node. Follow the links. See how it all connects.",
    "",
  ];

  // The Bet
  if (theses.length > 0) {
    sections.push("## The Bet\n");
    sections.push(theses.map((t) => `**[${t.title}](/thesis/${t.id})**`).join("\n"));
    sections.push("");
    sections.push("We're building infrastructure for the agent-native era. The products below demonstrate what the platform enables.");
    sections.push("");
  }

  // Products - with descriptions
  if (products.length > 0) {
    sections.push("## Products\n");
    sections.push("What we're building.\n");

    const productDescriptions: Record<string, string> = {
      "murphy": "Delivery autopilot. Reads your Jira/Linear/GitHub, tells you what will slip and why.",
      "p4gent": "Purchasing assistant. Tracks suppliers, monitors spend, drafts emails with relationship context.",
      "smartboxes": "Execution infrastructure for AI agents. Isolated, auditable, controllable.",
      "nomos-cloud": "System of record. Event-sourced domains with generated APIs.",
    };

    for (const p of products) {
      const desc = productDescriptions[p.id] || "";
      sections.push(`### [${p.title}](/product/${p.id})\n`);
      sections.push(desc);
      sections.push("");
    }
  }

  // Projects section
  if (projects.length > 0) {
    sections.push("## Customer Projects\n");
    sections.push("Built on the platform.\n");

    for (const p of projects) {
      sections.push(`### [${p.title}](/project/${p.id})\n`);
      sections.push("");
    }
  }

  // Architecture diagram
  sections.push("## How It Fits Together\n");
  sections.push("```");
  sections.push("┌────────────────────────────────┐  ┌────────────────────────────────┐");
  sections.push("│            PRODUCTS            │  │       CUSTOMER PROJECTS        │");
  sections.push("│  Murphy • P4gent • SmartBoxes  │  │             CO2                │");
  sections.push("│          Nomos Cloud           │  │             ...                │");
  sections.push("└───────────────┬────────────────┘  └───────────────┬────────────────┘");
  sections.push("                │                                   │");
  sections.push("                └───────────────┬───────────────────┘");
  sections.push("                                │ enabled by");
  sections.push("                                ▼");
  sections.push("┌─────────────────────────────────────────────────────────────────────┐");
  sections.push("│                           CAPABILITIES                              │");
  sections.push("│               SmartBox Execution    •    Nomos Domains              │");
  sections.push("└───────────────────────────────┬─────────────────────────────────────┘");
  sections.push("                                │ built on");
  sections.push("                                ▼");
  sections.push("┌─────────────────────────────────────────────────────────────────────┐");
  sections.push("│                            PRIMITIVES                               │");
  sections.push("│          Snapshot Materialisation  •  Capability-Scoped Exec        │");
  sections.push("└───────────────────────────────┬─────────────────────────────────────┘");
  sections.push("                                │ run on");
  sections.push("                                ▼");
  sections.push("┌─────────────────────────────────────────────────────────────────────┐");
  sections.push("│                            SUPPLIERS                                │");
  sections.push("│        Cloudflare   •   Anthropic   •   Firebase   •   Twilio       │");
  sections.push("└─────────────────────────────────────────────────────────────────────┘");
  sections.push("```");
  sections.push("");
  sections.push("Products and customer projects both depend on capabilities. Click through to see specific dependencies.");
  sections.push("");

  // Capabilities
  if (capabilities.length > 0) {
    sections.push("## Capabilities\n");
    sections.push("What we can do that makes the products possible.\n");
    sections.push(capabilities.map((c) => `- [${c.title}](/capability/${c.id})`).join("\n"));
    sections.push("");
  }

  // Primitives
  if (primitives.length > 0) {
    sections.push("## Primitives\n");
    sections.push("The foundational building blocks we've built.\n");
    sections.push(primitives.map((p) => `- [${p.title}](/primitive/${p.id})`).join("\n"));
    sections.push("");
  }

  // Suppliers
  if (suppliers.length > 0) {
    sections.push("## Suppliers\n");
    sections.push("The platforms we build on.\n");
    sections.push(suppliers.map((s) => `- [${s.title}](/supplier/${s.id})`).join("\n"));
    sections.push("");
  }

  // Risks
  if (risks.length > 0) {
    sections.push("## Risks\n");
    sections.push("What could go wrong, and how we mitigate it.\n");
    sections.push(risks.map((r) => `- [${r.title}](/risk/${r.id})`).join("\n"));
    sections.push("");
  }

  // Footer - the rest in collapsed sections or just simpler
  sections.push("---\n");
  sections.push("## Full Index\n");
  sections.push("Everything in the graph, by type.\n");

  if (supplierPrimitives.length > 0) {
    sections.push(`**Supplier Primitives** (${supplierPrimitives.length}): `);
    sections.push(supplierPrimitives.map((sp) => `[${sp.title}](/supplier-primitive/${sp.id})`).join(" • "));
    sections.push("");
  }

  if (tooling.length > 0) {
    sections.push(`**Tooling** (${tooling.length}): `);
    sections.push(tooling.map((t) => `[${t.title}](/tooling/${t.id})`).join(" • "));
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
