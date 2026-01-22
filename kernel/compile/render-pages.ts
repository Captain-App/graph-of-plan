/**
 * Renders MDX pages for Astro Starlight output.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode, Thesis, Capability, Risk, Product, Project, Supplier, SupplierPrimitive, Tooling, Customer, Competitor, RiskStatus, ThreatLevel, Milestone, TimelineVariant, Repository, StackLevel, RepoType, Constraint, ConstraintSeverity, ConstraintCategory, Competency, Diagnosis, GuidingPolicy, ActionGate, ProxyMetric, MeasurementFrequency, Assumption, AssumptionStatus, AssumptionCategory, ReviewFrequency, Decision, DecisionStatus, DecisionCategory } from "../schema.js";
import { isThesis, isCapability, isRisk, isProduct, isProject, isPrimitive, isSupplierPrimitive, isTooling, isSupplier, isCustomer, isCompetitor, isMilestone, isRepository, isConstraint, isCompetency, isDiagnosis, isGuidingPolicy, isActionGate, isProxyMetric, isAssumption, isDecision } from "../schema.js";
import { loadContent } from "./load-content.js";
import type { DerivedRelations } from "./derive-relations.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SITE_DOCS = resolve(ROOT, "src/content/docs");
const CONTENT_DIR = resolve(ROOT, "content");

/**
 * Read a hand-written content snippet from content/homepage/
 */
function readContentSnippet(path: string): string {
  const fullPath = resolve(CONTENT_DIR, path);
  if (!existsSync(fullPath)) {
    console.warn(`  Warning: Content snippet not found: ${path}`);
    return "";
  }
  return readFileSync(fullPath, "utf-8").trim();
}

/**
 * Render a single node to an MDX page
 */
// Status formatting helpers
function formatRiskStatus(status: RiskStatus): string {
  const labels: Record<RiskStatus, string> = {
    active: "🔴 Active",
    mitigated: "🟢 Mitigated",
    accepted: "🟡 Accepted",
  };
  return labels[status];
}

function formatThreatLevel(level: ThreatLevel): string {
  const labels: Record<ThreatLevel, string> = {
    none: "⚪ None",
    low: "🟢 Low",
    medium: "🟡 Medium",
    high: "🔴 High",
  };
  return labels[level];
}

function formatStackLevel(level: StackLevel): string {
  const labels: Record<StackLevel, string> = {
    0: "L0: Cloud",
    1: "L1: Runtime",
    2: "L2: Frameworks",
    3: "L3: Libraries",
    4: "L4: Our Code",
  };
  return labels[level];
}

function formatRepoType(type: RepoType): string {
  const labels: Record<RepoType, string> = {
    owned: "Owned",
    fork: "Fork",
    dependency: "Dependency",
  };
  return labels[type];
}

function formatConstraintSeverity(severity: ConstraintSeverity): string {
  const labels: Record<ConstraintSeverity, string> = {
    hard: "Hard",
    soft: "Soft",
  };
  return labels[severity];
}

function formatConstraintCategory(category: ConstraintCategory): string {
  const labels: Record<ConstraintCategory, string> = {
    distribution: "Distribution",
    capital: "Capital",
    team: "Team",
    technical: "Technical",
    market: "Market",
  };
  return labels[category];
}

function formatMeasurementFrequency(frequency: MeasurementFrequency): string {
  const labels: Record<MeasurementFrequency, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };
  return labels[frequency];
}

function formatAssumptionStatus(status: AssumptionStatus): string {
  const labels: Record<AssumptionStatus, string> = {
    untested: "Untested",
    testing: "Testing",
    validated: "Validated",
    invalidated: "Invalidated",
    "partially-validated": "Partially Validated",
  };
  return labels[status];
}

function formatAssumptionStatusEmoji(status: AssumptionStatus): string {
  const emojis: Record<AssumptionStatus, string> = {
    untested: "⚪",
    testing: "🔄",
    validated: "✅",
    invalidated: "❌",
    "partially-validated": "🟡",
  };
  return emojis[status];
}

function formatAssumptionCategory(category: AssumptionCategory): string {
  const labels: Record<AssumptionCategory, string> = {
    market: "Market",
    customer: "Customer",
    technical: "Technical",
    financial: "Financial",
    competitive: "Competitive",
    operational: "Operational",
  };
  return labels[category];
}

function formatReviewFrequency(frequency: ReviewFrequency): string {
  const labels: Record<ReviewFrequency, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
  };
  return labels[frequency];
}

function formatDecisionStatus(status: DecisionStatus): string {
  const labels: Record<DecisionStatus, string> = {
    active: "Active",
    "under-review": "Under Review",
    reversed: "Reversed",
    superseded: "Superseded",
  };
  return labels[status];
}

function formatDecisionStatusEmoji(status: DecisionStatus): string {
  const emojis: Record<DecisionStatus, string> = {
    active: "✅",
    "under-review": "🔄",
    reversed: "↩️",
    superseded: "➡️",
  };
  return emojis[status];
}

function formatDecisionCategory(category: DecisionCategory): string {
  const labels: Record<DecisionCategory, string> = {
    strategic: "Strategic",
    technical: "Technical",
    commercial: "Commercial",
    operational: "Operational",
    sequencing: "Sequencing",
  };
  return labels[category];
}

// TL;DR summaries for products
const PRODUCT_TLDRS: Record<string, string> = {
  "murphy": "**What**: Delivery prediction for project teams · **Who**: Agencies, R&D teams · **Price**: £299-2,500/mo · **Year 1**: £19K MRR",
  "smartboxes": "**What**: Persistent AI agent sandboxes · **Who**: Non-devs, SMBs, creators · **Price**: PAYG ~£37/mo avg · **Year 1**: £17K MRR",
  "nomos-cloud": "**What**: Audit trails for AI agents · **Who**: Enterprise AI teams · **Price**: Usage-based + £25K enterprise · **Year 1**: £62K MRR",
  "p4gent": "**What**: AI purchasing assistant · **Who**: Solopreneurs, freelancers · **Price**: £9-79/mo · **Year 1**: £3K MRR",
};

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

  // Add TL;DR for products
  const tldr = isProduct(node) ? PRODUCT_TLDRS[node.id] : null;
  const tldrSection = tldr ? `:::note[TL;DR]\n${tldr}\n:::\n\n` : "";

  // Add status badge for risks
  const riskBadge = isRisk(node)
    ? `:::note[Status: ${formatRiskStatus(node.status)}]\n:::\n\n`
    : "";

  // Add threat level badge for competitors
  const competitorBadge = isCompetitor(node)
    ? `:::note[Threat Level: ${formatThreatLevel(node.threatLevel)}]\n:::\n\n`
    : "";

  // Add stack info badge for repositories
  const repoBadge = isRepository(node)
    ? `:::note[${formatRepoType(node.repoType)} · ${formatStackLevel(node.stackLevel)}]\n${node.url ? `[View on GitHub](${node.url})` : ""}\n:::\n\n`
    : "";

  // Add constraint badge
  const constraintBadge = isConstraint(node)
    ? `:::note[${formatConstraintSeverity(node.severity)} Constraint · ${formatConstraintCategory(node.category)}]\n:::\n\n`
    : "";

  // Add proxy metric badge
  const proxyMetricBadge = isProxyMetric(node)
    ? `:::note[${formatMeasurementFrequency(node.frequency)} · ${node.currentValue}/${node.targetValue} ${node.unit}]\n:::\n\n`
    : "";

  // Add assumption badge
  const assumptionBadge = isAssumption(node)
    ? `:::note[${formatAssumptionStatusEmoji(node.status)} ${formatAssumptionStatus(node.status)} · ${formatAssumptionCategory(node.category)} · ${node.confidence}% confidence]\nReview: ${formatReviewFrequency(node.reviewFrequency)}\n:::\n\n`
    : "";

  // Add decision badge
  const decisionBadge = isDecision(node)
    ? `:::note[${formatDecisionStatusEmoji(node.status)} ${formatDecisionStatus(node.status)} · ${formatDecisionCategory(node.category)}]\nReview: ${node.reviewDate}\n:::\n\n`
    : "";

  const sections: string[] = [frontmatter, tldrSection + riskBadge + competitorBadge + repoBadge + constraintBadge + proxyMetricBadge + assumptionBadge + decisionBadge + cleanContent];

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
  } else if (isMilestone(node)) {
    sections.push(renderMilestoneRelations(node, relations));
  } else if (isRepository(node)) {
    sections.push(renderRepositoryRelations(node, relations));
  } else if (isConstraint(node)) {
    sections.push(renderConstraintRelations(node, relations));
  } else if (isCompetency(node)) {
    sections.push(renderCompetencyRelations(node, relations));
  } else if (isDiagnosis(node)) {
    sections.push(renderDiagnosisRelations(node, relations));
  } else if (isGuidingPolicy(node)) {
    sections.push(renderGuidingPolicyRelations(node, relations));
  } else if (isActionGate(node)) {
    sections.push(renderActionGateRelations(node, relations));
  } else if (isProxyMetric(node)) {
    sections.push(renderProxyMetricRelations(node, relations));
  } else if (isAssumption(node)) {
    sections.push(renderAssumptionRelations(node, relations));
  } else if (isDecision(node)) {
    sections.push(renderDecisionRelations(node, relations));
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

  // Related assumptions (reverse relation)
  const assumptions = relations.assumptionsForRisk.get(risk) ?? [];
  if (assumptions.length > 0) {
    const links = assumptions
      .map((a) => `- [${a.title}](/assumption/${a.id}) — ${formatAssumptionStatusEmoji(a.status)} ${a.confidence}%`)
      .join("\n");
    sections.push(`## Related Assumptions\n\n${links}`);
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

  // Assumptions (reverse relation)
  const assumptions = relations.assumptionsForProduct.get(product) ?? [];
  if (assumptions.length > 0) {
    const links = assumptions
      .map((a) => `- [${a.title}](/assumption/${a.id}) — ${formatAssumptionStatusEmoji(a.status)} ${a.confidence}%`)
      .join("\n");
    sections.push(`## Underpinning Assumptions\n\n${links}`);
  }

  // Decisions affecting this product (reverse relation)
  const decisions = relations.decisionsForProduct.get(product) ?? [];
  if (decisions.length > 0) {
    const links = decisions
      .map((d) => `- [${d.title}](/decision/${d.id}) — ${formatDecisionStatusEmoji(d.status)} ${formatDecisionCategory(d.category)}`)
      .join("\n");
    sections.push(`## Related Decisions\n\n${links}`);
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

function formatTimelineVariant(variant: TimelineVariant): string {
  const names: Record<TimelineVariant, string> = {
    expected: "Expected",
    aggressive: "Aggressive",
    speedOfLight: "Speed of Light",
  };
  return names[variant];
}

function renderMilestoneRelations(
  milestone: Milestone,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Financial summary
  const netContribution = milestone.expectedRevenue - milestone.expectedCosts;
  sections.push(`## Financials\n`);
  sections.push(`| Metric | Value |`);
  sections.push(`|--------|-------|`);
  sections.push(`| Expected Revenue | £${milestone.expectedRevenue.toLocaleString()}/mo |`);
  sections.push(`| Expected Costs | £${milestone.expectedCosts.toLocaleString()}/mo |`);
  sections.push(`| Net Contribution | £${netContribution.toLocaleString()}/mo |`);

  // Timeline comparison
  sections.push(`\n## Timeline Variants\n`);
  sections.push(`| Variant | Start | Duration | End | Status |`);
  sections.push(`|---------|-------|----------|-----|--------|`);

  const variants: TimelineVariant[] = ["expected", "aggressive", "speedOfLight"];
  for (const variant of variants) {
    const config = milestone.timelines[variant];
    const endMonth = config.startMonth + config.durationMonths;
    const status = config.included ? "✅ Included" : "⏭️ Skipped";
    sections.push(`| ${formatTimelineVariant(variant)} | M${config.startMonth} | ${config.durationMonths}mo | M${endMonth} | ${status} |`);
  }

  // Products this milestone advances
  if (milestone.products.length > 0) {
    const links = milestone.products
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`\n## Advances Products\n\n${links}`);
  }

  // Dependencies (milestones)
  if (milestone.dependsOnMilestones.length > 0) {
    const links = milestone.dependsOnMilestones
      .map((m) => `- [${m.title}](/milestone/${m.id})`)
      .join("\n");
    sections.push(`## Depends On (Milestones)\n\n${links}`);
  }

  // Dependencies (capabilities)
  if (milestone.dependsOnCapabilities.length > 0) {
    const links = milestone.dependsOnCapabilities
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Requires Capabilities\n\n${links}`);
  }

  // Reverse: what milestones depend on this one
  const dependents = relations.milestoneDependsOn.get(milestone) ?? [];
  if (dependents.length > 0) {
    const links = dependents
      .map((m) => `- [${m.title}](/milestone/${m.id})`)
      .join("\n");
    sections.push(`## Enables (Milestones)\n\n${links}`);
  }

  // Gated by action gates (Rumelt framework)
  if (milestone.gatedBy.length > 0) {
    const links = milestone.gatedBy
      .map((g) => `- [${g.title}](/action-gate/${g.id})`)
      .join("\n");
    sections.push(`## Gated By\n\n${links}`);
  }

  // Assumptions (reverse relation)
  const assumptions = relations.assumptionsForMilestone.get(milestone) ?? [];
  if (assumptions.length > 0) {
    const links = assumptions
      .map((a) => `- [${a.title}](/assumption/${a.id}) — ${formatAssumptionStatusEmoji(a.status)} ${a.confidence}%`)
      .join("\n");
    sections.push(`\n## Underpinning Assumptions\n\n${links}`);
  }

  // Decisions affecting this milestone (reverse relation)
  const decisions = relations.decisionsForMilestone.get(milestone) ?? [];
  if (decisions.length > 0) {
    const links = decisions
      .map((d) => `- [${d.title}](/decision/${d.id}) — ${formatDecisionStatusEmoji(d.status)} ${formatDecisionCategory(d.category)}`)
      .join("\n");
    sections.push(`\n## Related Decisions\n\n${links}`);
  }

  return sections.join("\n");
}

function renderRepositoryRelations(
  repo: Repository,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Stack position
  sections.push(`## Stack Position\n`);
  sections.push(`**${formatStackLevel(repo.stackLevel)}**\n`);
  sections.push(`Language: ${repo.language}\n`);

  // Dependencies (other repos)
  if (repo.dependsOn.length > 0) {
    const links = repo.dependsOn
      .map((r) => `- [${r.title}](/repository/${r.id}) (${formatStackLevel(r.stackLevel)})`)
      .join("\n");
    sections.push(`## Depends On\n\n${links}`);
  }

  // Upstream (for forks)
  if (repo.upstream) {
    sections.push(`## Upstream\n\n- [${repo.upstream.title}](/repository/${repo.upstream.id})`);
  }

  // Reverse: what repos depend on this one
  const dependents = relations.repositoryDependedOnBy.get(repo) ?? [];
  if (dependents.length > 0) {
    const links = dependents
      .map((r) => `- [${r.title}](/repository/${r.id})`)
      .join("\n");
    sections.push(`## Used By\n\n${links}`);
  }

  // Reverse: what forks exist of this
  const forks = relations.repositoryForkedBy.get(repo) ?? [];
  if (forks.length > 0) {
    const links = forks
      .map((r) => `- [${r.title}](/repository/${r.id})`)
      .join("\n");
    sections.push(`## Forks\n\n${links}`);
  }

  // Products this repo enables
  if (repo.products.length > 0) {
    const links = repo.products
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Enables Products\n\n${links}`);
  }

  // Capabilities this repo implements
  if (repo.capabilities.length > 0) {
    const links = repo.capabilities
      .map((c) => `- [${c.title}](/capability/${c.id})`)
      .join("\n");
    sections.push(`## Implements Capabilities\n\n${links}`);
  }

  return sections.join("\n\n");
}

// ============================================================================
// RUMELT'S GOOD STRATEGY FRAMEWORK RENDERING
// ============================================================================

function renderConstraintRelations(
  constraint: Constraint,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Which diagnoses are constrained by this
  const diagnoses = relations.constrainsDiagnosis.get(constraint) ?? [];
  if (diagnoses.length > 0) {
    const links = diagnoses
      .map((d) => `- [${d.title}](/diagnosis/${d.id})`)
      .join("\n");
    sections.push(`## Constrains Diagnoses\n\n${links}`);
  }

  // Which policies work around this
  const policies = relations.workedAroundByPolicy.get(constraint) ?? [];
  if (policies.length > 0) {
    const links = policies
      .map((p) => `- [${p.title}](/guiding-policy/${p.id})`)
      .join("\n");
    sections.push(`## Worked Around By\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderCompetencyRelations(
  competency: Competency,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Evidence (repositories)
  if (competency.evidencedBy.length > 0) {
    const links = competency.evidencedBy
      .map((r) => `- [${r.title}](/repository/${r.id})`)
      .join("\n");
    sections.push(`## Evidenced By\n\n${links}`);
  }

  // Which policies leverage this
  const policies = relations.leveragedByPolicy.get(competency) ?? [];
  if (policies.length > 0) {
    const links = policies
      .map((p) => `- [${p.title}](/guiding-policy/${p.id})`)
      .join("\n");
    sections.push(`## Leveraged By\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderDiagnosisRelations(
  diagnosis: Diagnosis,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Evidence (risks)
  if (diagnosis.evidencedBy.length > 0) {
    const links = diagnosis.evidencedBy
      .map((r) => `- [${r.title}](/risk/${r.id})`)
      .join("\n");
    sections.push(`## Evidenced By\n\n${links}`);
  }

  // Constraints
  if (diagnosis.constrainedBy.length > 0) {
    const links = diagnosis.constrainedBy
      .map((c) => `- [${c.title}](/constraint/${c.id})`)
      .join("\n");
    sections.push(`## Constrained By\n\n${links}`);
  }

  // Which policies address this
  const policies = relations.addressedByPolicy.get(diagnosis) ?? [];
  if (policies.length > 0) {
    const links = policies
      .map((p) => `- [${p.title}](/guiding-policy/${p.id})`)
      .join("\n");
    sections.push(`## Addressed By\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderGuidingPolicyRelations(
  policy: GuidingPolicy,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Addresses diagnosis
  sections.push(`## Addresses\n\n- [${policy.addressesDiagnosis.title}](/diagnosis/${policy.addressesDiagnosis.id})`);

  // Leverages competencies
  if (policy.leveragesCompetencies.length > 0) {
    const links = policy.leveragesCompetencies
      .map((c) => `- [${c.title}](/competency/${c.id})`)
      .join("\n");
    sections.push(`## Leverages\n\n${links}`);
  }

  // Works around constraints
  if (policy.worksAroundConstraints.length > 0) {
    const links = policy.worksAroundConstraints
      .map((c) => `- [${c.title}](/constraint/${c.id})`)
      .join("\n");
    sections.push(`## Works Around\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderActionGateRelations(
  gate: ActionGate,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Action description
  sections.push(`## Action\n\n${gate.action}`);

  // Pass criteria
  if (gate.passCriteria.length > 0) {
    const criteria = gate.passCriteria
      .map((c) => `- ${c}`)
      .join("\n");
    sections.push(`## Pass Criteria\n\n${criteria}`);
  }

  // Proxy metrics
  if (gate.proxyMetrics.length > 0) {
    const links = gate.proxyMetrics
      .map((m) => `- [${m.title}](/proxy-metric/${m.id}) (${m.currentValue}/${m.targetValue} ${m.unit})`)
      .join("\n");
    sections.push(`## Proxy Metrics\n\n${links}`);
  }

  // Blocked by
  if (gate.blockedBy.length > 0) {
    const links = gate.blockedBy
      .map((g) => `- [${g.title}](/action-gate/${g.id})`)
      .join("\n");
    sections.push(`## Blocked By\n\n${links}`);
  }

  // Unlocks
  if (gate.unlocks.length > 0) {
    const links = gate.unlocks
      .map((g) => `- [${g.title}](/action-gate/${g.id})`)
      .join("\n");
    sections.push(`## Unlocks\n\n${links}`);
  }

  // Gates which milestones
  const milestones = relations.gatesMilestone.get(gate) ?? [];
  if (milestones.length > 0) {
    const links = milestones
      .map((m) => `- [${m.title}](/milestone/${m.id})`)
      .join("\n");
    sections.push(`## Gates Milestones\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderProxyMetricRelations(
  metric: ProxyMetric,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Progress bar
  const progress = Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 100));
  sections.push(`## Progress\n`);
  sections.push(`**${metric.currentValue}** / ${metric.targetValue} ${metric.unit} (${progress}%)\n`);
  sections.push(`Measured: ${formatMeasurementFrequency(metric.frequency)}`);

  // Used by action gates
  const gates = relations.usedByActionGate.get(metric) ?? [];
  if (gates.length > 0) {
    const links = gates
      .map((g) => `- [${g.title}](/action-gate/${g.id})`)
      .join("\n");
    sections.push(`## Used By\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderAssumptionRelations(
  assumption: Assumption,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Statement
  sections.push(`## Assumption\n\n> ${assumption.statement}`);

  // Test method
  sections.push(`## How To Test\n\n${assumption.testMethod}`);

  // Validation criteria
  if (assumption.validationCriteria.length > 0) {
    const criteria = assumption.validationCriteria
      .map((c) => `- ${c}`)
      .join("\n");
    sections.push(`## Validation Criteria\n\nThis assumption is **validated** if:\n\n${criteria}`);
  }

  // Invalidation criteria
  if (assumption.invalidationCriteria.length > 0) {
    const criteria = assumption.invalidationCriteria
      .map((c) => `- ${c}`)
      .join("\n");
    sections.push(`## Invalidation Criteria\n\nThis assumption is **invalidated** if:\n\n${criteria}`);
  }

  // Current evidence
  if (assumption.currentEvidence.length > 0) {
    const evidence = assumption.currentEvidence
      .map((e) => `- ${e}`)
      .join("\n");
    sections.push(`## Current Evidence\n\n${evidence}`);
  }

  // Dependent products
  if (assumption.dependentProducts.length > 0) {
    const links = assumption.dependentProducts
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Dependent Products\n\nIf this assumption is wrong, these products are affected:\n\n${links}`);
  }

  // Dependent milestones
  if (assumption.dependentMilestones.length > 0) {
    const links = assumption.dependentMilestones
      .map((m) => `- [${m.title}](/milestone/${m.id})`)
      .join("\n");
    sections.push(`## Dependent Milestones\n\nIf this assumption is wrong, these milestones are affected:\n\n${links}`);
  }

  // Related risks
  if (assumption.relatedRisks.length > 0) {
    const links = assumption.relatedRisks
      .map((r) => `- [${r.title}](/risk/${r.id})`)
      .join("\n");
    sections.push(`## Related Risks\n\n${links}`);
  }

  // Decisions depending on this assumption (reverse relation)
  const decisions = relations.decisionsForAssumption.get(assumption) ?? [];
  if (decisions.length > 0) {
    const links = decisions
      .map((d) => `- [${d.title}](/decision/${d.id}) — ${formatDecisionStatusEmoji(d.status)} ${formatDecisionCategory(d.category)}`)
      .join("\n");
    sections.push(`## Decisions Depending On This\n\n${links}`);
  }

  return sections.join("\n\n");
}

function renderDecisionRelations(
  decision: Decision,
  relations: DerivedRelations
): string {
  const sections: string[] = [];

  // Context
  sections.push(`## Context\n\n${decision.context}`);

  // The choice made
  sections.push(`## Decision\n\n> ${decision.choice}`);

  // Rationale
  sections.push(`## Rationale\n\n${decision.rationale}`);

  // Alternatives considered
  if (decision.alternatives.length > 0) {
    const altRows = decision.alternatives
      .map((a) => `| ${a.option} | ${a.rationale} |`)
      .join("\n");
    sections.push(`## Alternatives Considered\n\n| Option | Why Rejected |\n|--------|-------------|\n${altRows}`);
  }

  // Tradeoffs acknowledged
  if (decision.tradeoffs.length > 0) {
    const tradeoffs = decision.tradeoffs
      .map((t) => `- ${t}`)
      .join("\n");
    sections.push(`## Tradeoffs\n\n${tradeoffs}`);
  }

  // Reversal triggers
  if (decision.reversalTriggers.length > 0) {
    const triggers = decision.reversalTriggers
      .map((t) => `- ${t}`)
      .join("\n");
    sections.push(`## Reversal Triggers\n\nRevisit this decision if:\n\n${triggers}`);
  }

  // Depends on assumptions
  if (decision.dependsOnAssumptions.length > 0) {
    const links = decision.dependsOnAssumptions
      .map((a) => `- [${a.title}](/assumption/${a.id}) — ${formatAssumptionStatusEmoji(a.status)} ${a.confidence}%`)
      .join("\n");
    sections.push(`## Depends On Assumptions\n\n${links}`);
  }

  // Affected products
  if (decision.affectedProducts.length > 0) {
    const links = decision.affectedProducts
      .map((p) => `- [${p.title}](/product/${p.id})`)
      .join("\n");
    sections.push(`## Affects Products\n\n${links}`);
  }

  // Affected milestones
  if (decision.affectedMilestones.length > 0) {
    const links = decision.affectedMilestones
      .map((m) => `- [${m.title}](/milestone/${m.id})`)
      .join("\n");
    sections.push(`## Affects Milestones\n\n${links}`);
  }

  // Superseded by
  if (decision.supersededBy) {
    sections.push(`## Superseded By\n\n- [${decision.supersededBy.title}](/decision/${decision.supersededBy.id})`);
  }

  // Supersedes (reverse relation)
  const supersedes = relations.supersedes.get(decision) ?? [];
  if (supersedes.length > 0) {
    const links = supersedes
      .map((d) => `- [${d.title}](/decision/${d.id})`)
      .join("\n");
    sections.push(`## Supersedes\n\n${links}`);
  }

  return sections.join("\n\n");
}

/**
 * Render the index/landing page (mum-friendly version)
 */
function renderIndexPage(nodes: PlanNode[]): string {
  const products = nodes.filter(isProduct);
  const milestones = nodes.filter(isMilestone);

  // Read hand-written content snippets
  const intro = readContentSnippet("homepage/intro.mdx");
  const whoItsFor = readContentSnippet("homepage/who-its-for.mdx");
  const status = readContentSnippet("homepage/status.mdx");

  const productSnippets: Record<string, string> = {
    smartboxes: readContentSnippet("homepage/smartboxes.mdx"),
    murphy: readContentSnippet("homepage/murphy.mdx"),
    p4gent: readContentSnippet("homepage/p4gent.mdx"),
    "nomos-cloud": readContentSnippet("homepage/nomos-cloud.mdx"),
  };

  const sections: string[] = [
    "---",
    'title: "Captain App"',
    'description: "AI-powered tools that help businesses run more smoothly"',
    "---",
    "",
    intro,
    "",
    ":::note",
    "Early stage · 4 products · Looking for design partners",
    ":::",
    "",
  ];

  // Products - human-friendly descriptions
  sections.push("## What We Make\n");

  // Architecture diagram - shows how products and customer projects relate
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

  // Order: SmartBoxes, Murphy, P4gent, Nomos Cloud
  const productOrder = ["smartboxes", "murphy", "p4gent", "nomos-cloud"];
  for (const id of productOrder) {
    const product = products.find((p) => p.id === id);
    if (product) {
      const snippet = productSnippets[id] || "";
      sections.push(`### [${product.title}](/product/${product.id})\n`);
      sections.push(snippet);
      sections.push("");
    }
  }

  // Who It's For
  sections.push("---\n");
  sections.push("## Who It's For\n");
  sections.push(whoItsFor);
  sections.push("");

  // Current Status
  sections.push("---\n");
  sections.push("## Current Status\n");
  sections.push(status);
  sections.push("");

  // Dynamic stats
  sections.push(`${products.length} products · ${milestones.length} milestones planned · [View the timeline](/timeline)`);
  sections.push("");

  // Links to deeper pages
  sections.push("---\n");
  sections.push("[Technical Details](/technical) · [The Team](/team) · [Risks](/risk) · [Timeline](/timeline)");

  return sections.join("\n");
}

/**
 * Render the technical details page (for developers who want the full picture)
 */
function renderTechnicalPage(nodes: PlanNode[]): string {
  const theses = nodes.filter(isThesis);
  const capabilities = nodes.filter(isCapability);
  const products = nodes.filter(isProduct);
  const projects = nodes.filter(isProject);
  const primitives = nodes.filter(isPrimitive);
  const supplierPrimitives = nodes.filter(isSupplierPrimitive);
  const tooling = nodes.filter(isTooling);
  const risks = nodes.filter(isRisk);
  const suppliers = nodes.filter(isSupplier);
  const milestones = nodes.filter(isMilestone);
  const repositories = nodes.filter(isRepository);

  const sections: string[] = [
    "---",
    'title: "Technical Details"',
    'description: "The full graph: capabilities, primitives, suppliers, and how it all connects"',
    "---",
    "",
    "This page is for developers and technical folks who want to understand how Captain App is built.",
    "",
    "Most business plans are documents. This one is a graph. Every product traces down to the capabilities that enable it. Every capability traces down to the primitives that make it possible. Every primitive traces to the suppliers who provide it. Click any node. Follow the links.",
    "",
    ":::note[Summary]",
    `${products.length} products · ${capabilities.length} capabilities · ${primitives.length} primitives · ${suppliers.length} suppliers`,
    ":::",
    "",
  ];

  // Thesis
  if (theses.length > 0) {
    sections.push("## Thesis\n");
    sections.push(theses.map((t) => `**[${t.title}](/thesis/${t.id})**`).join("\n"));
    sections.push("");
    sections.push("We think AI agents need purpose-built infrastructure. We might be wrong. The products are our attempt to test this.");
    sections.push("");
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

  // Products - brief
  if (products.length > 0) {
    sections.push("## Products\n");
    sections.push(products.map((p) => `- [${p.title}](/product/${p.id})`).join("\n"));
    sections.push("");
  }

  // Projects section
  if (projects.length > 0) {
    sections.push("## Customer Projects\n");
    sections.push(projects.map((p) => `- [${p.title}](/project/${p.id})`).join("\n"));
    sections.push("");
  }

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

  // Supplier Primitives
  if (supplierPrimitives.length > 0) {
    sections.push("## Supplier Primitives\n");
    sections.push(supplierPrimitives.map((sp) => `- [${sp.title}](/supplier-primitive/${sp.id})`).join("\n"));
    sections.push("");
  }

  // Tooling
  if (tooling.length > 0) {
    sections.push("## Tooling\n");
    sections.push(tooling.map((t) => `- [${t.title}](/tooling/${t.id})`).join("\n"));
    sections.push("");
  }

  // Risks
  if (risks.length > 0) {
    sections.push("## Risks\n");
    sections.push("What could go wrong, and how we mitigate it.\n");
    sections.push(risks.map((r) => `- [${r.title}](/risk/${r.id}) — ${formatRiskStatus(r.status)}`).join("\n"));
    sections.push("");
  }

  // Timelines
  if (milestones.length > 0) {
    sections.push("## Timelines\n");
    sections.push("Three execution timelines: [Expected](/timeline/expected), [Aggressive](/timeline/aggressive), [Speed of Light](/timeline/speed-of-light).\n");
    sections.push(`**${milestones.length} milestones** tracked across all variants.\n`);

    // Calculate durations
    const expectedMilestones = milestones.filter(m => m.timelines.expected.included);
    const solMilestones = milestones.filter(m => m.timelines.speedOfLight.included);

    const expectedDuration = expectedMilestones.length > 0
      ? Math.max(...expectedMilestones.map(m => m.timelines.expected.startMonth + m.timelines.expected.durationMonths))
      : 0;
    const solDuration = solMilestones.length > 0
      ? Math.max(...solMilestones.map(m => m.timelines.speedOfLight.startMonth + m.timelines.speedOfLight.durationMonths))
      : 0;

    sections.push(`Expected: ${expectedDuration} months · Speed of Light: ${solDuration} months`);
    sections.push("");
  }

  // Technology Stack
  if (repositories.length > 0) {
    const owned = repositories.filter(r => r.repoType === "owned").length;
    const forks = repositories.filter(r => r.repoType === "fork").length;
    const deps = repositories.filter(r => r.repoType === "dependency").length;

    sections.push("## Technology Stack\n");
    sections.push(`**${repositories.length} repositories** across 5 stack levels.\n`);
    sections.push(`[View the full stack](/stack) · ${owned} owned · ${forks} forks · ${deps} tracked dependencies`);
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
  // Write index page (mum-friendly)
  const indexContent = renderIndexPage(nodes);
  writeFileSync(resolve(SITE_DOCS, "index.mdx"), indexContent, "utf-8");

  // Write technical details page
  const technicalContent = renderTechnicalPage(nodes);
  writeFileSync(resolve(SITE_DOCS, "technical.mdx"), technicalContent, "utf-8");

  // Write individual node pages
  for (const node of nodes) {
    const outDir = resolve(SITE_DOCS, node.kind);
    mkdirSync(outDir, { recursive: true });

    const content = renderPage(node, relations);
    const outPath = resolve(outDir, `${node.id}.mdx`);
    writeFileSync(outPath, content, "utf-8");
  }
}
