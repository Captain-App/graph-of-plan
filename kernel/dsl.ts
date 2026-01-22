/**
 * Declarative DSL for defining the business plan graph.
 *
 * Reduces boilerplate by allowing grouped-by-kind definitions
 * with relations as string IDs that get resolved to object references.
 */

import {
  PlanNode,
  Thesis,
  Capability,
  Primitive,
  SupplierPrimitive,
  Tooling,
  Risk,
  RiskStatus,
  Product,
  Project,
  Supplier,
  Customer,
  Competitor,
  ThreatLevel,
  Milestone,
  TimelineConfig,
  Repository,
  StackLevel,
  RepoType,
  Constraint,
  ConstraintSeverity,
  ConstraintCategory,
  Competency,
  Diagnosis,
  GuidingPolicy,
  ProxyMetric,
  MeasurementFrequency,
  ActionGate,
  Assumption,
  AssumptionStatus,
  AssumptionCategory,
  ReviewFrequency,
  Decision,
  DecisionStatus,
  DecisionCategory,
  RejectedAlternative,
} from "./schema.js";

// ============================================================================
// DSL TYPES
// ============================================================================

/**
 * Leaf nodes (no outgoing relations) can be just a title string
 */
type LeafNodeDef = string;

/**
 * Supplier primitive definition - requires a supplier reference
 */
interface SupplierPrimitiveDef {
  title: string;
  supplier: string;
}

/**
 * Tooling definition - development or operational tools
 */
interface ToolingDef {
  title: string;
  dependsOn?: string[];
  supplierPrimitives?: string[];
}

/**
 * Risk definition with mitigations and status
 */
interface RiskDef {
  title: string;
  mitigatedBy: string[];
  status?: RiskStatus;
}

/**
 * Competitor definition with threat level
 */
interface CompetitorDef {
  title: string;
  threatLevel?: ThreatLevel;
}

/**
 * Capability definition with dependencies and optional relations
 */
interface CapabilityDef {
  title: string;
  dependsOn?: string[];
  supplierPrimitives?: string[];
  risks?: string[];
  suppliers?: string[];
  tooling?: string[];
}

/**
 * Product definition with enabling capabilities and optional relations
 */
interface ProductDef {
  title: string;
  enabledBy: string[];
  customers?: string[];
  competitors?: string[];
  tooling?: string[];
}

/**
 * Project definition - customer projects built on capabilities
 */
interface ProjectDef {
  title: string;
  enabledBy: string[];
  tooling?: string[];
}

/**
 * Thesis definition with justifying capabilities
 */
interface ThesisDef {
  title: string;
  justifiedBy: string[];
}

/**
 * Timeline configuration for a milestone in each variant
 */
interface TimelineConfigDef {
  startMonth: number;
  durationMonths: number;
  included: boolean;
}

/**
 * Milestone definition with timeline configurations
 */
interface MilestoneDef {
  title: string;
  expectedRevenue: number;
  expectedCosts: number;
  dependsOnMilestones?: string[];
  dependsOnCapabilities?: string[];
  products?: string[];
  gatedBy?: string[]; // ActionGate IDs
  timelines: {
    expected: TimelineConfigDef;
    aggressive: TimelineConfigDef;
    speedOfLight: TimelineConfigDef;
  };
}

/**
 * Repository definition for technology stack tracking
 */
interface RepositoryDef {
  title: string;
  url: string;
  stackLevel: StackLevel;
  repoType: RepoType;
  language?: string;
  dependsOn?: string[];
  upstream?: string;
  products?: string[];
  capabilities?: string[];
}

/**
 * Constraint definition (Rumelt's framework)
 */
interface ConstraintDef {
  title: string;
  severity: ConstraintSeverity;
  category: ConstraintCategory;
}

/**
 * Competency definition (Rumelt's framework)
 */
interface CompetencyDef {
  title: string;
  evidencedBy: string[]; // Repository IDs
}

/**
 * Diagnosis definition (Rumelt's framework)
 */
interface DiagnosisDef {
  title: string;
  evidencedBy: string[]; // Risk IDs
  constrainedBy: string[]; // Constraint IDs
}

/**
 * Guiding policy definition (Rumelt's framework)
 */
interface GuidingPolicyDef {
  title: string;
  addressesDiagnosis: string; // Diagnosis ID
  leveragesCompetencies: string[]; // Competency IDs
  worksAroundConstraints: string[]; // Constraint IDs
}

/**
 * Proxy metric definition (Rumelt's framework)
 */
interface ProxyMetricDef {
  title: string;
  currentValue: number;
  targetValue: number;
  frequency: MeasurementFrequency;
  unit: string;
}

/**
 * Action gate definition (Rumelt's framework)
 */
interface ActionGateDef {
  title: string;
  action: string;
  passCriteria: string[];
  proxyMetrics: string[]; // ProxyMetric IDs
  blockedBy?: string[]; // ActionGate IDs
  unlocks?: string[]; // ActionGate IDs
}

/**
 * Assumption definition - documented assumptions underpinning the plan
 */
interface AssumptionDef {
  title: string;
  statement: string;
  category: AssumptionCategory;
  status: AssumptionStatus;
  testMethod: string;
  validationCriteria: string[];
  invalidationCriteria: string[];
  currentEvidence?: string[];
  confidence: number; // 0-100
  reviewFrequency: ReviewFrequency;
  dependentProducts?: string[]; // Product IDs
  dependentMilestones?: string[]; // Milestone IDs
  relatedRisks?: string[]; // Risk IDs
}

/**
 * Decision definition - strategic choices made under scarcity
 */
interface DecisionDef {
  title: string;
  context: string;
  category: DecisionCategory;
  status: DecisionStatus;
  alternatives: RejectedAlternative[];
  choice: string;
  rationale: string;
  tradeoffs: string[];
  reversalTriggers: string[];
  reviewDate: string; // ISO date string
  dependsOnAssumptions?: string[]; // Assumption IDs
  affectedProducts?: string[]; // Product IDs
  affectedMilestones?: string[]; // Milestone IDs
  supersededBy?: string; // Decision ID (for self-reference)
}

/**
 * The complete graph definition
 */
export interface GraphDef {
  primitives?: Record<string, LeafNodeDef>;
  supplierPrimitives?: Record<string, SupplierPrimitiveDef>;
  tooling?: Record<string, ToolingDef>;
  suppliers?: Record<string, LeafNodeDef>;
  customers?: Record<string, LeafNodeDef>;
  competitors?: Record<string, LeafNodeDef | CompetitorDef>;
  risks?: Record<string, RiskDef>;
  capabilities?: Record<string, CapabilityDef>;
  products?: Record<string, ProductDef>;
  projects?: Record<string, ProjectDef>;
  milestones?: Record<string, MilestoneDef>;
  repositories?: Record<string, RepositoryDef>;
  thesis?: Record<string, ThesisDef>;
  // Rumelt's Good Strategy framework
  constraints?: Record<string, ConstraintDef>;
  competencies?: Record<string, CompetencyDef>;
  diagnoses?: Record<string, DiagnosisDef>;
  guidingPolicies?: Record<string, GuidingPolicyDef>;
  proxyMetrics?: Record<string, ProxyMetricDef>;
  actionGates?: Record<string, ActionGateDef>;
  // Assumption tracking
  assumptions?: Record<string, AssumptionDef>;
  // Decision tracking
  decisions?: Record<string, DecisionDef>;
}

// ============================================================================
// GRAPH BUILDER
// ============================================================================

/**
 * Build the plan graph from a declarative definition.
 *
 * @param def - The declarative graph definition
 * @returns Array of PlanNode instances ready for export as PLAN
 * @throws Error if any referenced ID doesn't exist
 */
export function defineGraph(def: GraphDef): PlanNode[] {
  // Phase 1: Create all leaf nodes (no dependencies)
  const primitives = new Map<string, Primitive>();
  const suppliers = new Map<string, Supplier>();
  const customers = new Map<string, Customer>();
  const competitors = new Map<string, Competitor>();

  for (const [id, title] of Object.entries(def.primitives ?? {})) {
    primitives.set(id, new Primitive(id, title));
  }

  for (const [id, title] of Object.entries(def.suppliers ?? {})) {
    suppliers.set(id, new Supplier(id, title));
  }

  for (const [id, title] of Object.entries(def.customers ?? {})) {
    customers.set(id, new Customer(id, title));
  }

  for (const [id, compDef] of Object.entries(def.competitors ?? {})) {
    if (typeof compDef === "string") {
      competitors.set(id, new Competitor(id, compDef));
    } else {
      competitors.set(id, new Competitor(id, compDef.title, compDef.threatLevel));
    }
  }

  // Phase 2: Create supplier primitives (depend on suppliers)
  const supplierPrimitives = new Map<string, SupplierPrimitive>();

  for (const [id, spDef] of Object.entries(def.supplierPrimitives ?? {})) {
    const supplier = suppliers.get(spDef.supplier);
    if (!supplier) {
      throw new Error(
        `SupplierPrimitive "${id}" references unknown supplier "${spDef.supplier}"`
      );
    }
    supplierPrimitives.set(id, new SupplierPrimitive(id, spDef.title, supplier));
  }

  // Phase 3: Create tooling (depend on primitives, supplier primitives)
  const tooling = new Map<string, Tooling>();

  for (const [id, toolDef] of Object.entries(def.tooling ?? {})) {
    const toolDependsOn = (toolDef.dependsOn ?? []).map((primId) => {
      const prim = primitives.get(primId);
      if (!prim) {
        throw new Error(
          `Tooling "${id}" references unknown primitive "${primId}"`
        );
      }
      return prim;
    });

    const toolSupplierPrimitives = (toolDef.supplierPrimitives ?? []).map((spId) => {
      const sp = supplierPrimitives.get(spId);
      if (!sp) {
        throw new Error(
          `Tooling "${id}" references unknown supplier primitive "${spId}"`
        );
      }
      return sp;
    });

    tooling.set(
      id,
      new Tooling(id, toolDef.title, toolDependsOn, toolSupplierPrimitives)
    );
  }

  // Phase 4: Create risks (depend on primitives)
  const risks = new Map<string, Risk>();

  for (const [id, riskDef] of Object.entries(def.risks ?? {})) {
    const mitigatedBy = riskDef.mitigatedBy.map((primId) => {
      const prim = primitives.get(primId);
      if (!prim) {
        throw new Error(
          `Risk "${id}" references unknown primitive "${primId}"`
        );
      }
      return prim;
    });
    risks.set(id, new Risk(id, riskDef.title, mitigatedBy, riskDef.status));
  }

  // Phase 5: Create capabilities (depend on primitives, supplier primitives, tooling, risks, suppliers)
  const capabilities = new Map<string, Capability>();

  for (const [id, capDef] of Object.entries(def.capabilities ?? {})) {
    const dependsOn = (capDef.dependsOn ?? []).map((primId) => {
      const prim = primitives.get(primId);
      if (!prim) {
        throw new Error(
          `Capability "${id}" references unknown primitive "${primId}"`
        );
      }
      return prim;
    });

    const capSupplierPrimitives = (capDef.supplierPrimitives ?? []).map((spId) => {
      const sp = supplierPrimitives.get(spId);
      if (!sp) {
        throw new Error(
          `Capability "${id}" references unknown supplier primitive "${spId}"`
        );
      }
      return sp;
    });

    const capTooling = (capDef.tooling ?? []).map((toolId) => {
      const tool = tooling.get(toolId);
      if (!tool) {
        throw new Error(
          `Capability "${id}" references unknown tooling "${toolId}"`
        );
      }
      return tool;
    });

    const capRisks = (capDef.risks ?? []).map((riskId) => {
      const risk = risks.get(riskId);
      if (!risk) {
        throw new Error(`Capability "${id}" references unknown risk "${riskId}"`);
      }
      return risk;
    });

    const capSuppliers = (capDef.suppliers ?? []).map((suppId) => {
      const supp = suppliers.get(suppId);
      if (!supp) {
        throw new Error(
          `Capability "${id}" references unknown supplier "${suppId}"`
        );
      }
      return supp;
    });

    capabilities.set(
      id,
      new Capability(
        id,
        capDef.title,
        dependsOn,
        capRisks,
        capSuppliers,
        capSupplierPrimitives,
        capTooling
      )
    );
  }

  // Phase 6: Create products (depend on capabilities, customers, competitors, tooling)
  const products = new Map<string, Product>();

  for (const [id, prodDef] of Object.entries(def.products ?? {})) {
    const enabledBy = prodDef.enabledBy.map((capId) => {
      const cap = capabilities.get(capId);
      if (!cap) {
        throw new Error(
          `Product "${id}" references unknown capability "${capId}"`
        );
      }
      return cap;
    });

    const prodCustomers = (prodDef.customers ?? []).map((custId) => {
      const cust = customers.get(custId);
      if (!cust) {
        throw new Error(
          `Product "${id}" references unknown customer "${custId}"`
        );
      }
      return cust;
    });

    const prodCompetitors = (prodDef.competitors ?? []).map((compId) => {
      const comp = competitors.get(compId);
      if (!comp) {
        throw new Error(
          `Product "${id}" references unknown competitor "${compId}"`
        );
      }
      return comp;
    });

    const prodTooling = (prodDef.tooling ?? []).map((toolId) => {
      const tool = tooling.get(toolId);
      if (!tool) {
        throw new Error(
          `Product "${id}" references unknown tooling "${toolId}"`
        );
      }
      return tool;
    });

    products.set(
      id,
      new Product(id, prodDef.title, enabledBy, prodCustomers, prodCompetitors, prodTooling)
    );
  }

  // Phase 7: Create projects (depend on capabilities, tooling)
  const projects = new Map<string, Project>();

  for (const [id, projDef] of Object.entries(def.projects ?? {})) {
    const enabledBy = projDef.enabledBy.map((capId) => {
      const cap = capabilities.get(capId);
      if (!cap) {
        throw new Error(
          `Project "${id}" references unknown capability "${capId}"`
        );
      }
      return cap;
    });

    const projTooling = (projDef.tooling ?? []).map((toolId) => {
      const tool = tooling.get(toolId);
      if (!tool) {
        throw new Error(
          `Project "${id}" references unknown tooling "${toolId}"`
        );
      }
      return tool;
    });

    projects.set(
      id,
      new Project(id, projDef.title, enabledBy, projTooling)
    );
  }

  // Phase 8: Create milestones (depend on capabilities, products, and other milestones)
  // Two-pass approach: first create with empty milestone deps, then resolve
  const milestones = new Map<string, Milestone>();
  const milestoneDeps = new Map<string, string[]>(); // Store deps for second pass

  // Pass 1: Create milestones with empty dependsOnMilestones
  for (const [id, msDef] of Object.entries(def.milestones ?? {})) {
    const dependsOnCapabilities = (msDef.dependsOnCapabilities ?? []).map((capId) => {
      const cap = capabilities.get(capId);
      if (!cap) {
        throw new Error(
          `Milestone "${id}" references unknown capability "${capId}"`
        );
      }
      return cap;
    });

    const msProducts = (msDef.products ?? []).map((prodId) => {
      const prod = products.get(prodId);
      if (!prod) {
        throw new Error(
          `Milestone "${id}" references unknown product "${prodId}"`
        );
      }
      return prod;
    });

    // Store milestone deps for second pass
    milestoneDeps.set(id, msDef.dependsOnMilestones ?? []);

    milestones.set(
      id,
      new Milestone(
        id,
        msDef.title,
        msDef.expectedRevenue,
        msDef.expectedCosts,
        [], // Placeholder - resolved in pass 2
        dependsOnCapabilities,
        msProducts,
        msDef.timelines
      )
    );
  }

  // Pass 2: Resolve milestone-to-milestone dependencies
  // We need to recreate milestones with the resolved dependencies
  for (const [id, depIds] of milestoneDeps.entries()) {
    if (depIds.length === 0) continue;

    const dependsOnMilestones = depIds.map((msId) => {
      const ms = milestones.get(msId);
      if (!ms) {
        throw new Error(
          `Milestone "${id}" references unknown milestone "${msId}"`
        );
      }
      return ms;
    });

    // Get the existing milestone and recreate with resolved deps
    const existing = milestones.get(id)!;
    milestones.set(
      id,
      new Milestone(
        existing.id,
        existing.title,
        existing.expectedRevenue,
        existing.expectedCosts,
        dependsOnMilestones,
        existing.dependsOnCapabilities,
        existing.products,
        existing.timelines
      )
    );
  }

  // Phase 9: Create thesis (depend on capabilities)
  const theses = new Map<string, Thesis>();

  for (const [id, thesisDef] of Object.entries(def.thesis ?? {})) {
    const justifiedBy = thesisDef.justifiedBy.map((capId) => {
      const cap = capabilities.get(capId);
      if (!cap) {
        throw new Error(
          `Thesis "${id}" references unknown capability "${capId}"`
        );
      }
      return cap;
    });
    theses.set(id, new Thesis(id, thesisDef.title, justifiedBy));
  }

  // Phase 10: Create repositories (depend on products, capabilities, and other repositories)
  // Two-pass approach: first create with empty deps, then resolve
  const repositories = new Map<string, Repository>();
  const repoDeps = new Map<string, { dependsOn: string[]; upstream?: string }>();

  // Pass 1: Create repositories with empty dependsOn and null upstream
  for (const [id, repoDef] of Object.entries(def.repositories ?? {})) {
    const repoProducts = (repoDef.products ?? []).map((prodId) => {
      const prod = products.get(prodId);
      if (!prod) {
        throw new Error(
          `Repository "${id}" references unknown product "${prodId}"`
        );
      }
      return prod;
    });

    const repoCapabilities = (repoDef.capabilities ?? []).map((capId) => {
      const cap = capabilities.get(capId);
      if (!cap) {
        throw new Error(
          `Repository "${id}" references unknown capability "${capId}"`
        );
      }
      return cap;
    });

    // Store deps for second pass
    repoDeps.set(id, {
      dependsOn: repoDef.dependsOn ?? [],
      upstream: repoDef.upstream,
    });

    repositories.set(
      id,
      new Repository(
        id,
        repoDef.title,
        repoDef.url,
        repoDef.stackLevel,
        repoDef.repoType,
        repoDef.language ?? "TypeScript",
        [], // Placeholder - resolved in pass 2
        null, // Placeholder - resolved in pass 2
        repoProducts,
        repoCapabilities
      )
    );
  }

  // Pass 2: Resolve repository-to-repository dependencies
  for (const [id, deps] of repoDeps.entries()) {
    if (deps.dependsOn.length === 0 && !deps.upstream) continue;

    const dependsOnRepos = deps.dependsOn.map((repoId) => {
      const repo = repositories.get(repoId);
      if (!repo) {
        throw new Error(
          `Repository "${id}" references unknown repository "${repoId}"`
        );
      }
      return repo;
    });

    const upstreamRepo = deps.upstream
      ? repositories.get(deps.upstream) ?? null
      : null;
    if (deps.upstream && !upstreamRepo) {
      throw new Error(
        `Repository "${id}" references unknown upstream repository "${deps.upstream}"`
      );
    }

    // Get the existing repository and recreate with resolved deps
    const existing = repositories.get(id)!;
    repositories.set(
      id,
      new Repository(
        existing.id,
        existing.title,
        existing.url,
        existing.stackLevel,
        existing.repoType,
        existing.language,
        dependsOnRepos,
        upstreamRepo,
        existing.products,
        existing.capabilities
      )
    );
  }

  // ============================================================================
  // RUMELT'S GOOD STRATEGY FRAMEWORK
  // ============================================================================

  // Phase 11: Create constraints (leaf nodes)
  const constraints = new Map<string, Constraint>();

  for (const [id, constDef] of Object.entries(def.constraints ?? {})) {
    constraints.set(
      id,
      new Constraint(id, constDef.title, constDef.severity, constDef.category)
    );
  }

  // Phase 12: Create proxy metrics (leaf nodes)
  const proxyMetrics = new Map<string, ProxyMetric>();

  for (const [id, pmDef] of Object.entries(def.proxyMetrics ?? {})) {
    proxyMetrics.set(
      id,
      new ProxyMetric(
        id,
        pmDef.title,
        pmDef.currentValue,
        pmDef.targetValue,
        pmDef.frequency,
        pmDef.unit
      )
    );
  }

  // Phase 13: Create competencies (depend on repositories)
  const competencies = new Map<string, Competency>();

  for (const [id, compDef] of Object.entries(def.competencies ?? {})) {
    const evidencedBy = compDef.evidencedBy.map((repoId) => {
      const repo = repositories.get(repoId);
      if (!repo) {
        throw new Error(
          `Competency "${id}" references unknown repository "${repoId}"`
        );
      }
      return repo;
    });
    competencies.set(id, new Competency(id, compDef.title, evidencedBy));
  }

  // Phase 14: Create diagnoses (depend on risks and constraints)
  const diagnoses = new Map<string, Diagnosis>();

  for (const [id, diagDef] of Object.entries(def.diagnoses ?? {})) {
    const evidencedBy = diagDef.evidencedBy.map((riskId) => {
      const risk = risks.get(riskId);
      if (!risk) {
        throw new Error(
          `Diagnosis "${id}" references unknown risk "${riskId}"`
        );
      }
      return risk;
    });

    const constrainedBy = diagDef.constrainedBy.map((constId) => {
      const constraint = constraints.get(constId);
      if (!constraint) {
        throw new Error(
          `Diagnosis "${id}" references unknown constraint "${constId}"`
        );
      }
      return constraint;
    });

    diagnoses.set(id, new Diagnosis(id, diagDef.title, evidencedBy, constrainedBy));
  }

  // Phase 15: Create action gates (depend on proxy metrics and other gates)
  // Two-pass approach: first create with empty gate deps, then resolve
  const actionGates = new Map<string, ActionGate>();
  const actionGateDeps = new Map<string, { blockedBy: string[]; unlocks: string[] }>();

  // Pass 1: Create action gates with empty blockedBy and unlocks
  for (const [id, gateDef] of Object.entries(def.actionGates ?? {})) {
    const gateMetrics = gateDef.proxyMetrics.map((pmId) => {
      const pm = proxyMetrics.get(pmId);
      if (!pm) {
        throw new Error(
          `ActionGate "${id}" references unknown proxy metric "${pmId}"`
        );
      }
      return pm;
    });

    // Store deps for second pass
    actionGateDeps.set(id, {
      blockedBy: gateDef.blockedBy ?? [],
      unlocks: gateDef.unlocks ?? [],
    });

    actionGates.set(
      id,
      new ActionGate(
        id,
        gateDef.title,
        gateDef.action,
        gateDef.passCriteria,
        gateMetrics,
        [], // Placeholder - resolved in pass 2
        []  // Placeholder - resolved in pass 2
      )
    );
  }

  // Pass 2: Resolve action gate-to-action gate dependencies
  for (const [id, deps] of actionGateDeps.entries()) {
    if (deps.blockedBy.length === 0 && deps.unlocks.length === 0) continue;

    const blockedBy = deps.blockedBy.map((gateId) => {
      const gate = actionGates.get(gateId);
      if (!gate) {
        throw new Error(
          `ActionGate "${id}" references unknown action gate "${gateId}" in blockedBy`
        );
      }
      return gate;
    });

    const unlocks = deps.unlocks.map((gateId) => {
      const gate = actionGates.get(gateId);
      if (!gate) {
        throw new Error(
          `ActionGate "${id}" references unknown action gate "${gateId}" in unlocks`
        );
      }
      return gate;
    });

    // Get the existing gate and recreate with resolved deps
    const existing = actionGates.get(id)!;
    actionGates.set(
      id,
      new ActionGate(
        existing.id,
        existing.title,
        existing.action,
        existing.passCriteria,
        existing.proxyMetrics,
        blockedBy,
        unlocks
      )
    );
  }

  // Phase 16: Create guiding policies (depend on diagnoses, competencies, constraints)
  const guidingPolicies = new Map<string, GuidingPolicy>();

  for (const [id, gpDef] of Object.entries(def.guidingPolicies ?? {})) {
    const diagnosis = diagnoses.get(gpDef.addressesDiagnosis);
    if (!diagnosis) {
      throw new Error(
        `GuidingPolicy "${id}" references unknown diagnosis "${gpDef.addressesDiagnosis}"`
      );
    }

    const leveragesCompetencies = gpDef.leveragesCompetencies.map((compId) => {
      const comp = competencies.get(compId);
      if (!comp) {
        throw new Error(
          `GuidingPolicy "${id}" references unknown competency "${compId}"`
        );
      }
      return comp;
    });

    const worksAroundConstraints = gpDef.worksAroundConstraints.map((constId) => {
      const constraint = constraints.get(constId);
      if (!constraint) {
        throw new Error(
          `GuidingPolicy "${id}" references unknown constraint "${constId}"`
        );
      }
      return constraint;
    });

    guidingPolicies.set(
      id,
      new GuidingPolicy(
        id,
        gpDef.title,
        diagnosis,
        leveragesCompetencies,
        worksAroundConstraints
      )
    );
  }

  // Phase 17: Resolve milestone gatedBy (depends on action gates)
  for (const [id, msDef] of Object.entries(def.milestones ?? {})) {
    const gatedByIds = msDef.gatedBy ?? [];
    if (gatedByIds.length === 0) continue;

    const gatedBy = gatedByIds.map((gateId) => {
      const gate = actionGates.get(gateId);
      if (!gate) {
        throw new Error(
          `Milestone "${id}" references unknown action gate "${gateId}" in gatedBy`
        );
      }
      return gate;
    });

    // Get the existing milestone and recreate with gatedBy
    const existing = milestones.get(id)!;
    milestones.set(
      id,
      new Milestone(
        existing.id,
        existing.title,
        existing.expectedRevenue,
        existing.expectedCosts,
        existing.dependsOnMilestones,
        existing.dependsOnCapabilities,
        existing.products,
        existing.timelines,
        gatedBy
      )
    );
  }

  // Phase 18: Create assumptions (depend on products, milestones, risks)
  const assumptions = new Map<string, Assumption>();

  for (const [id, assumptionDef] of Object.entries(def.assumptions ?? {})) {
    const dependentProducts = (assumptionDef.dependentProducts ?? []).map((prodId) => {
      const prod = products.get(prodId);
      if (!prod) {
        throw new Error(
          `Assumption "${id}" references unknown product "${prodId}"`
        );
      }
      return prod;
    });

    const dependentMilestones = (assumptionDef.dependentMilestones ?? []).map((msId) => {
      const ms = milestones.get(msId);
      if (!ms) {
        throw new Error(
          `Assumption "${id}" references unknown milestone "${msId}"`
        );
      }
      return ms;
    });

    const relatedRisks = (assumptionDef.relatedRisks ?? []).map((riskId) => {
      const risk = risks.get(riskId);
      if (!risk) {
        throw new Error(
          `Assumption "${id}" references unknown risk "${riskId}"`
        );
      }
      return risk;
    });

    assumptions.set(
      id,
      new Assumption(
        id,
        assumptionDef.title,
        assumptionDef.statement,
        assumptionDef.category,
        assumptionDef.status,
        assumptionDef.testMethod,
        assumptionDef.validationCriteria,
        assumptionDef.invalidationCriteria,
        assumptionDef.currentEvidence ?? [],
        assumptionDef.confidence,
        assumptionDef.reviewFrequency,
        dependentProducts,
        dependentMilestones,
        relatedRisks
      )
    );
  }

  // Phase 19: Create decisions (depend on assumptions, products, milestones, and other decisions)
  // Two-pass approach: first create with null supersededBy, then resolve
  const decisions = new Map<string, Decision>();
  const decisionSupersededBy = new Map<string, string | undefined>(); // Store for second pass

  // Pass 1: Create decisions with null supersededBy
  for (const [id, decisionDef] of Object.entries(def.decisions ?? {})) {
    const dependsOnAssumptions = (decisionDef.dependsOnAssumptions ?? []).map((assumptionId) => {
      const assumption = assumptions.get(assumptionId);
      if (!assumption) {
        throw new Error(
          `Decision "${id}" references unknown assumption "${assumptionId}"`
        );
      }
      return assumption;
    });

    const affectedProducts = (decisionDef.affectedProducts ?? []).map((prodId) => {
      const prod = products.get(prodId);
      if (!prod) {
        throw new Error(
          `Decision "${id}" references unknown product "${prodId}"`
        );
      }
      return prod;
    });

    const affectedMilestones = (decisionDef.affectedMilestones ?? []).map((msId) => {
      const ms = milestones.get(msId);
      if (!ms) {
        throw new Error(
          `Decision "${id}" references unknown milestone "${msId}"`
        );
      }
      return ms;
    });

    // Store supersededBy for second pass
    decisionSupersededBy.set(id, decisionDef.supersededBy);

    decisions.set(
      id,
      new Decision(
        id,
        decisionDef.title,
        decisionDef.context,
        decisionDef.category,
        decisionDef.status,
        decisionDef.alternatives,
        decisionDef.choice,
        decisionDef.rationale,
        decisionDef.tradeoffs,
        decisionDef.reversalTriggers,
        decisionDef.reviewDate,
        dependsOnAssumptions,
        affectedProducts,
        affectedMilestones,
        null // Placeholder - resolved in pass 2
      )
    );
  }

  // Pass 2: Resolve decision-to-decision supersededBy references
  for (const [id, supersededById] of decisionSupersededBy.entries()) {
    if (!supersededById) continue;

    const supersededBy = decisions.get(supersededById);
    if (!supersededBy) {
      throw new Error(
        `Decision "${id}" references unknown decision "${supersededById}" in supersededBy`
      );
    }

    // Get the existing decision and recreate with resolved supersededBy
    const existing = decisions.get(id)!;
    decisions.set(
      id,
      new Decision(
        existing.id,
        existing.title,
        existing.context,
        existing.category,
        existing.status,
        existing.alternatives,
        existing.choice,
        existing.rationale,
        existing.tradeoffs,
        existing.reversalTriggers,
        existing.reviewDate,
        existing.dependsOnAssumptions,
        existing.affectedProducts,
        existing.affectedMilestones,
        supersededBy
      )
    );
  }

  // Combine all nodes in dependency order
  return [
    ...primitives.values(),
    ...suppliers.values(),
    ...supplierPrimitives.values(),
    ...tooling.values(),
    ...customers.values(),
    ...competitors.values(),
    ...risks.values(),
    ...capabilities.values(),
    ...products.values(),
    ...projects.values(),
    ...milestones.values(),
    ...repositories.values(),
    ...theses.values(),
    // Rumelt's Good Strategy framework
    ...constraints.values(),
    ...proxyMetrics.values(),
    ...competencies.values(),
    ...diagnoses.values(),
    ...actionGates.values(),
    ...guidingPolicies.values(),
    // Assumption tracking
    ...assumptions.values(),
    // Decision tracking
    ...decisions.values(),
  ];
}
