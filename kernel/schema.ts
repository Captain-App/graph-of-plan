/**
 * Core schema for the business plan graph.
 *
 * This file:
 * - Never imports from /plan
 * - Never imports from /content
 * - Never changes shape lightly
 */

export type NodeKind =
  | "thesis"
  | "capability"
  | "primitive"
  | "supplier-primitive"
  | "tooling"
  | "risk"
  | "product"
  | "project"
  | "supplier"
  | "customer"
  | "competitor"
  | "milestone"
  | "repository"
  | "constraint"
  | "competency"
  | "diagnosis"
  | "guiding-policy"
  | "action-gate"
  | "proxy-metric"
  | "assumption"
  | "decision";

export abstract class PlanNode {
  readonly id: string;

  protected constructor(
    public readonly kind: NodeKind,
    id: string,
    public readonly title: string
  ) {
    this.id = id;
  }
}

export class Thesis extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly justifiedBy: Capability[]
  ) {
    super("thesis", id, title);
  }
}

export class Capability extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly dependsOn: Primitive[],
    public readonly risks: Risk[] = [],
    public readonly suppliers: Supplier[] = [],
    public readonly supplierPrimitives: SupplierPrimitive[] = [],
    public readonly tooling: Tooling[] = []
  ) {
    super("capability", id, title);
  }
}

export class Primitive extends PlanNode {
  constructor(id: string, title: string) {
    super("primitive", id, title);
  }
}

/**
 * A primitive/building block provided by an external supplier
 */
export class SupplierPrimitive extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly supplier: Supplier
  ) {
    super("supplier-primitive", id, title);
  }
}

/**
 * Development or operational tooling built on primitives
 */
export class Tooling extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly dependsOn: Primitive[] = [],
    public readonly supplierPrimitives: SupplierPrimitive[] = []
  ) {
    super("tooling", id, title);
  }
}

export type RiskStatus = "active" | "mitigated" | "accepted";

export class Risk extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly mitigatedBy: Primitive[],
    public readonly status: RiskStatus = "active"
  ) {
    super("risk", id, title);
  }
}

export class Product extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly enabledBy: Capability[],
    public readonly customers: Customer[] = [],
    public readonly competitors: Competitor[] = [],
    public readonly tooling: Tooling[] = []
  ) {
    super("product", id, title);
  }
}

/**
 * A customer project built on the platform capabilities
 */
export class Project extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly enabledBy: Capability[],
    public readonly tooling: Tooling[] = []
  ) {
    super("project", id, title);
  }
}

/**
 * External dependency or partner that enables a capability
 */
export class Supplier extends PlanNode {
  constructor(id: string, title: string) {
    super("supplier", id, title);
  }
}

/**
 * Market segment or customer persona that products target
 */
export class Customer extends PlanNode {
  constructor(id: string, title: string) {
    super("customer", id, title);
  }
}

export type ThreatLevel = "none" | "low" | "medium" | "high";

/**
 * Competing product or company
 */
export class Competitor extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly threatLevel: ThreatLevel = "low"
  ) {
    super("competitor", id, title);
  }
}

/**
 * Timeline variant types for milestones
 */
export type TimelineVariant = "expected" | "aggressive" | "speedOfLight";

export interface TimelineConfig {
  startMonth: number;
  durationMonths: number;
  included: boolean;
}

/**
 * A milestone in the execution timeline
 */
export class Milestone extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly expectedRevenue: number,
    public readonly expectedCosts: number,
    public readonly dependsOnMilestones: Milestone[],
    public readonly dependsOnCapabilities: Capability[],
    public readonly products: Product[],
    public readonly timelines: {
      expected: TimelineConfig;
      aggressive: TimelineConfig;
      speedOfLight: TimelineConfig;
    },
    public readonly gatedBy: ActionGate[] = []
  ) {
    super("milestone", id, title);
  }
}

/**
 * Stack level for technology stack visualization
 * L0: Cloud (covered by Suppliers)
 * L1: Runtime (Node.js, Workerd)
 * L2: Frameworks (Astro, Hono)
 * L3: Libraries (zod, drizzle-orm)
 * L4: Our Code
 */
export type StackLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Repository type classification
 */
export type RepoType = "owned" | "fork" | "dependency";

/**
 * A code repository in the technology stack
 */
export class Repository extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly url: string,
    public readonly stackLevel: StackLevel,
    public readonly repoType: RepoType,
    public readonly language: string,
    public readonly dependsOn: Repository[],
    public readonly upstream: Repository | null,
    public readonly products: Product[],
    public readonly capabilities: Capability[]
  ) {
    super("repository", id, title);
  }
}

/**
 * Constraint severity levels
 */
export type ConstraintSeverity = "hard" | "soft";

/**
 * Constraint categories
 */
export type ConstraintCategory = "distribution" | "capital" | "team" | "technical" | "market";

/**
 * A constraint that limits action (Rumelt's framework)
 */
export class Constraint extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly severity: ConstraintSeverity,
    public readonly category: ConstraintCategory
  ) {
    super("constraint", id, title);
  }
}

/**
 * A competency we can demonstrably do, with evidence (Rumelt's framework)
 */
export class Competency extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly evidencedBy: Repository[]
  ) {
    super("competency", id, title);
  }
}

/**
 * The critical challenge we face (Rumelt's framework)
 */
export class Diagnosis extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly evidencedBy: Risk[],
    public readonly constrainedBy: Constraint[]
  ) {
    super("diagnosis", id, title);
  }
}

/**
 * Our chosen approach to address the diagnosis (Rumelt's framework)
 */
export class GuidingPolicy extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly addressesDiagnosis: Diagnosis,
    public readonly leveragesCompetencies: Competency[],
    public readonly worksAroundConstraints: Constraint[]
  ) {
    super("guiding-policy", id, title);
  }
}

/**
 * Measurement frequency for proxy metrics
 */
export type MeasurementFrequency = "daily" | "weekly" | "monthly";

/**
 * A leading indicator that predicts gate success (Rumelt's framework)
 */
export class ProxyMetric extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly currentValue: number,
    public readonly targetValue: number,
    public readonly frequency: MeasurementFrequency,
    public readonly unit: string
  ) {
    super("proxy-metric", id, title);
  }
}

/**
 * A proximate objective with pass/fail criteria (Rumelt's framework)
 */
export class ActionGate extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly action: string,
    public readonly passCriteria: string[],
    public readonly proxyMetrics: ProxyMetric[],
    public readonly blockedBy: ActionGate[],
    public readonly unlocks: ActionGate[]
  ) {
    super("action-gate", id, title);
  }
}

/**
 * Assumption validation status
 */
export type AssumptionStatus =
  | "untested"
  | "testing"
  | "validated"
  | "invalidated"
  | "partially-validated";

/**
 * Categories of assumptions
 */
export type AssumptionCategory =
  | "market"      // Market size, timing, demand
  | "customer"    // Customer behaviour, willingness to pay
  | "technical"   // Technical feasibility, performance
  | "financial"   // Unit economics, pricing
  | "competitive" // Competitor behaviour, moats
  | "operational"; // Team capacity, execution speed

/**
 * How often to review an assumption
 */
export type ReviewFrequency = "weekly" | "monthly" | "quarterly";

/**
 * A documented assumption that underpins the plan
 */
export class Assumption extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly statement: string,
    public readonly category: AssumptionCategory,
    public readonly status: AssumptionStatus,
    public readonly testMethod: string,
    public readonly validationCriteria: string[],
    public readonly invalidationCriteria: string[],
    public readonly currentEvidence: string[],
    public readonly confidence: number, // 0-100
    public readonly reviewFrequency: ReviewFrequency,
    public readonly dependentProducts: Product[],
    public readonly dependentMilestones: Milestone[],
    public readonly relatedRisks: Risk[]
  ) {
    super("assumption", id, title);
  }
}

/**
 * Decision status - tracks lifecycle of strategic choices
 */
export type DecisionStatus =
  | "active"        // Currently in effect
  | "under-review"  // Being reconsidered due to new information
  | "reversed"      // Changed course
  | "superseded";   // Replaced by a newer decision

/**
 * Decision category - what kind of choice this is
 */
export type DecisionCategory =
  | "strategic"     // High-level direction
  | "technical"     // Architecture/stack choices
  | "commercial"    // Pricing, GTM, business model
  | "operational"   // How we work
  | "sequencing";   // What order to do things

/**
 * An alternative that was considered but rejected
 */
export interface RejectedAlternative {
  option: string;
  rationale: string;
}

/**
 * A strategic decision - a choice made under scarcity
 */
export class Decision extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly context: string,
    public readonly category: DecisionCategory,
    public readonly status: DecisionStatus,
    public readonly alternatives: RejectedAlternative[],
    public readonly choice: string,
    public readonly rationale: string,
    public readonly tradeoffs: string[],
    public readonly reversalTriggers: string[],
    public readonly reviewDate: string,
    public readonly dependsOnAssumptions: Assumption[],
    public readonly affectedProducts: Product[],
    public readonly affectedMilestones: Milestone[],
    public readonly supersededBy: Decision | null
  ) {
    super("decision", id, title);
  }
}

/**
 * Type guard utilities
 */
export function isThesis(node: PlanNode): node is Thesis {
  return node.kind === "thesis";
}

export function isCapability(node: PlanNode): node is Capability {
  return node.kind === "capability";
}

export function isPrimitive(node: PlanNode): node is Primitive {
  return node.kind === "primitive";
}

export function isSupplierPrimitive(node: PlanNode): node is SupplierPrimitive {
  return node.kind === "supplier-primitive";
}

export function isTooling(node: PlanNode): node is Tooling {
  return node.kind === "tooling";
}

export function isRisk(node: PlanNode): node is Risk {
  return node.kind === "risk";
}

export function isProduct(node: PlanNode): node is Product {
  return node.kind === "product";
}

export function isProject(node: PlanNode): node is Project {
  return node.kind === "project";
}

export function isSupplier(node: PlanNode): node is Supplier {
  return node.kind === "supplier";
}

export function isCustomer(node: PlanNode): node is Customer {
  return node.kind === "customer";
}

export function isCompetitor(node: PlanNode): node is Competitor {
  return node.kind === "competitor";
}

export function isMilestone(node: PlanNode): node is Milestone {
  return node.kind === "milestone";
}

export function isRepository(node: PlanNode): node is Repository {
  return node.kind === "repository";
}

export function isConstraint(node: PlanNode): node is Constraint {
  return node.kind === "constraint";
}

export function isCompetency(node: PlanNode): node is Competency {
  return node.kind === "competency";
}

export function isDiagnosis(node: PlanNode): node is Diagnosis {
  return node.kind === "diagnosis";
}

export function isGuidingPolicy(node: PlanNode): node is GuidingPolicy {
  return node.kind === "guiding-policy";
}

export function isActionGate(node: PlanNode): node is ActionGate {
  return node.kind === "action-gate";
}

export function isProxyMetric(node: PlanNode): node is ProxyMetric {
  return node.kind === "proxy-metric";
}

export function isAssumption(node: PlanNode): node is Assumption {
  return node.kind === "assumption";
}

export function isDecision(node: PlanNode): node is Decision {
  return node.kind === "decision";
}
