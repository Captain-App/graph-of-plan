/**
 * Derives edges and reverse relations from the graph.
 */

import type {
  PlanNode,
  Thesis,
  Capability,
  Primitive,
  SupplierPrimitive,
  Tooling,
  Risk,
  Product,
  Project,
  Supplier,
  Customer,
  Competitor,
  Milestone,
  Repository,
  Constraint,
  Competency,
  Diagnosis,
  GuidingPolicy,
  ActionGate,
  ProxyMetric,
  Assumption,
  Decision,
} from "../schema.js";
import {
  isThesis,
  isCapability,
  isRisk,
  isProduct,
  isProject,
  isSupplierPrimitive,
  isTooling,
  isMilestone,
  isRepository,
  isCompetency,
  isDiagnosis,
  isGuidingPolicy,
  isActionGate,
  isAssumption,
  isDecision,
} from "../schema.js";

export interface DerivedRelations {
  /** Which nodes justify this node (reverse of justifiedBy) */
  justifies: Map<PlanNode, Thesis[]>;
  /** Which nodes depend on this node (reverse of dependsOn) */
  dependedOnBy: Map<PlanNode, Capability[]>;
  /** Which capabilities use this supplier primitive (reverse of supplierPrimitives) */
  usedByCapabilities: Map<PlanNode, Capability[]>;
  /** Which tooling uses this supplier primitive (reverse of tooling.supplierPrimitives) */
  usedByTooling: Map<PlanNode, Tooling[]>;
  /** Which capabilities use this tooling (reverse of capability.tooling) */
  toolingUsedByCapabilities: Map<PlanNode, Capability[]>;
  /** Which products use this tooling (reverse of product.tooling) */
  toolingUsedByProducts: Map<PlanNode, Product[]>;
  /** Which projects use this tooling (reverse of project.tooling) */
  toolingUsedByProjects: Map<PlanNode, Project[]>;
  /** Which primitives this tooling depends on (for reverse) */
  toolingDependedOnBy: Map<PlanNode, Tooling[]>;
  /** Which projects this capability enables (reverse of project.enabledBy) */
  enablesProjects: Map<PlanNode, Project[]>;
  /** Which nodes are at risk from this node */
  risksFor: Map<PlanNode, Capability[]>;
  /** Which nodes mitigate this risk (reverse of mitigatedBy) */
  mitigates: Map<PlanNode, Risk[]>;
  /** Which products this capability enables (reverse of enabledBy) */
  enables: Map<PlanNode, Product[]>;
  /** Which capabilities this supplier supplies (reverse of suppliers) */
  supplies: Map<PlanNode, Capability[]>;
  /** Which supplier primitives this supplier provides */
  providesSupplierPrimitives: Map<PlanNode, SupplierPrimitive[]>;
  /** Which products target this customer (reverse of customers) */
  targetedBy: Map<PlanNode, Product[]>;
  /** Which products compete with this competitor (reverse of competitors) */
  competedBy: Map<PlanNode, Product[]>;
  /** Which milestones depend on this milestone (reverse of dependsOnMilestones) */
  milestoneDependsOn: Map<PlanNode, Milestone[]>;
  /** Which milestones depend on this capability (reverse of dependsOnCapabilities) */
  milestoneForCapability: Map<PlanNode, Milestone[]>;
  /** Which milestones advance this product (reverse of products) */
  milestoneForProduct: Map<PlanNode, Milestone[]>;
  /** Which repositories depend on this repository (reverse of dependsOn) */
  repositoryDependedOnBy: Map<PlanNode, Repository[]>;
  /** Which repositories are forks of this repository (reverse of upstream) */
  repositoryForkedBy: Map<PlanNode, Repository[]>;
  /** Which repositories enable this product (reverse of products) */
  repositoryForProduct: Map<PlanNode, Repository[]>;
  /** Which repositories implement this capability (reverse of capabilities) */
  repositoryForCapability: Map<PlanNode, Repository[]>;
  // Rumelt's Good Strategy framework reverse relations
  /** Which competencies are evidenced by this repository (reverse of evidencedBy) */
  evidencesCompetency: Map<PlanNode, Competency[]>;
  /** Which diagnoses are evidenced by this risk (reverse of evidencedBy) */
  evidencesDiagnosis: Map<PlanNode, Diagnosis[]>;
  /** Which diagnoses are constrained by this constraint (reverse of constrainedBy) */
  constrainsDiagnosis: Map<PlanNode, Diagnosis[]>;
  /** Which guiding policies address this diagnosis (reverse of addressesDiagnosis) */
  addressedByPolicy: Map<PlanNode, GuidingPolicy[]>;
  /** Which guiding policies leverage this competency (reverse of leveragesCompetencies) */
  leveragedByPolicy: Map<PlanNode, GuidingPolicy[]>;
  /** Which guiding policies work around this constraint (reverse of worksAroundConstraints) */
  workedAroundByPolicy: Map<PlanNode, GuidingPolicy[]>;
  /** Which action gates use this proxy metric (reverse of proxyMetrics) */
  usedByActionGate: Map<PlanNode, ActionGate[]>;
  /** Which action gates are blocked by this gate (reverse of blockedBy) */
  blocksGate: Map<PlanNode, ActionGate[]>;
  /** Which action gates unlock this gate (reverse of unlocks) */
  unlockedByGate: Map<PlanNode, ActionGate[]>;
  /** Which milestones are gated by this action gate (reverse of gatedBy) */
  gatesMilestone: Map<PlanNode, Milestone[]>;
  // Assumption tracking reverse relations
  /** Which assumptions depend on this product (reverse of dependentProducts) */
  assumptionsForProduct: Map<PlanNode, Assumption[]>;
  /** Which assumptions depend on this milestone (reverse of dependentMilestones) */
  assumptionsForMilestone: Map<PlanNode, Assumption[]>;
  /** Which assumptions relate to this risk (reverse of relatedRisks) */
  assumptionsForRisk: Map<PlanNode, Assumption[]>;
  /** Which assumptions this assumption enables (reverse of dependsOnAssumptions) */
  enablesAssumptions: Map<PlanNode, Assumption[]>;
  // Decision tracking reverse relations
  /** Which decisions depend on this assumption (reverse of dependsOnAssumptions) */
  decisionsForAssumption: Map<PlanNode, Decision[]>;
  /** Which decisions affect this product (reverse of affectedProducts) */
  decisionsForProduct: Map<PlanNode, Decision[]>;
  /** Which decisions affect this milestone (reverse of affectedMilestones) */
  decisionsForMilestone: Map<PlanNode, Decision[]>;
  /** Which decisions this decision supersedes (reverse of supersededBy) */
  supersedes: Map<PlanNode, Decision[]>;
}

/**
 * Derive all reverse relations from the graph
 */
export function deriveRelations(nodes: PlanNode[]): DerivedRelations {
  const justifies = new Map<PlanNode, Thesis[]>();
  const dependedOnBy = new Map<PlanNode, Capability[]>();
  const usedByCapabilities = new Map<PlanNode, Capability[]>();
  const usedByTooling = new Map<PlanNode, Tooling[]>();
  const toolingUsedByCapabilities = new Map<PlanNode, Capability[]>();
  const toolingUsedByProducts = new Map<PlanNode, Product[]>();
  const toolingUsedByProjects = new Map<PlanNode, Project[]>();
  const toolingDependedOnBy = new Map<PlanNode, Tooling[]>();
  const enablesProjects = new Map<PlanNode, Project[]>();
  const risksFor = new Map<PlanNode, Capability[]>();
  const mitigates = new Map<PlanNode, Risk[]>();
  const enables = new Map<PlanNode, Product[]>();
  const supplies = new Map<PlanNode, Capability[]>();
  const providesSupplierPrimitives = new Map<PlanNode, SupplierPrimitive[]>();
  const targetedBy = new Map<PlanNode, Product[]>();
  const competedBy = new Map<PlanNode, Product[]>();
  const milestoneDependsOn = new Map<PlanNode, Milestone[]>();
  const milestoneForCapability = new Map<PlanNode, Milestone[]>();
  const milestoneForProduct = new Map<PlanNode, Milestone[]>();
  const repositoryDependedOnBy = new Map<PlanNode, Repository[]>();
  const repositoryForkedBy = new Map<PlanNode, Repository[]>();
  const repositoryForProduct = new Map<PlanNode, Repository[]>();
  const repositoryForCapability = new Map<PlanNode, Repository[]>();
  // Rumelt's Good Strategy framework
  const evidencesCompetency = new Map<PlanNode, Competency[]>();
  const evidencesDiagnosis = new Map<PlanNode, Diagnosis[]>();
  const constrainsDiagnosis = new Map<PlanNode, Diagnosis[]>();
  const addressedByPolicy = new Map<PlanNode, GuidingPolicy[]>();
  const leveragedByPolicy = new Map<PlanNode, GuidingPolicy[]>();
  const workedAroundByPolicy = new Map<PlanNode, GuidingPolicy[]>();
  const usedByActionGate = new Map<PlanNode, ActionGate[]>();
  const blocksGate = new Map<PlanNode, ActionGate[]>();
  const unlockedByGate = new Map<PlanNode, ActionGate[]>();
  const gatesMilestone = new Map<PlanNode, Milestone[]>();
  // Assumption tracking
  const assumptionsForProduct = new Map<PlanNode, Assumption[]>();
  const assumptionsForMilestone = new Map<PlanNode, Assumption[]>();
  const assumptionsForRisk = new Map<PlanNode, Assumption[]>();
  const enablesAssumptions = new Map<PlanNode, Assumption[]>();
  // Decision tracking
  const decisionsForAssumption = new Map<PlanNode, Decision[]>();
  const decisionsForProduct = new Map<PlanNode, Decision[]>();
  const decisionsForMilestone = new Map<PlanNode, Decision[]>();
  const supersedes = new Map<PlanNode, Decision[]>();

  // Initialize empty arrays for all nodes
  for (const node of nodes) {
    justifies.set(node, []);
    dependedOnBy.set(node, []);
    usedByCapabilities.set(node, []);
    usedByTooling.set(node, []);
    toolingUsedByCapabilities.set(node, []);
    toolingUsedByProducts.set(node, []);
    toolingUsedByProjects.set(node, []);
    toolingDependedOnBy.set(node, []);
    enablesProjects.set(node, []);
    risksFor.set(node, []);
    mitigates.set(node, []);
    enables.set(node, []);
    supplies.set(node, []);
    providesSupplierPrimitives.set(node, []);
    targetedBy.set(node, []);
    competedBy.set(node, []);
    milestoneDependsOn.set(node, []);
    milestoneForCapability.set(node, []);
    milestoneForProduct.set(node, []);
    repositoryDependedOnBy.set(node, []);
    repositoryForkedBy.set(node, []);
    repositoryForProduct.set(node, []);
    repositoryForCapability.set(node, []);
    // Rumelt's Good Strategy framework
    evidencesCompetency.set(node, []);
    evidencesDiagnosis.set(node, []);
    constrainsDiagnosis.set(node, []);
    addressedByPolicy.set(node, []);
    leveragedByPolicy.set(node, []);
    workedAroundByPolicy.set(node, []);
    usedByActionGate.set(node, []);
    blocksGate.set(node, []);
    unlockedByGate.set(node, []);
    gatesMilestone.set(node, []);
    // Assumption tracking
    assumptionsForProduct.set(node, []);
    assumptionsForMilestone.set(node, []);
    assumptionsForRisk.set(node, []);
    enablesAssumptions.set(node, []);
    // Decision tracking
    decisionsForAssumption.set(node, []);
    decisionsForProduct.set(node, []);
    decisionsForMilestone.set(node, []);
    supersedes.set(node, []);
  }

  // Derive relations
  for (const node of nodes) {
    if (isThesis(node)) {
      for (const cap of node.justifiedBy) {
        justifies.get(cap)?.push(node);
      }
    }

    if (isCapability(node)) {
      for (const prim of node.dependsOn) {
        dependedOnBy.get(prim)?.push(node);
      }
      for (const sp of node.supplierPrimitives) {
        usedByCapabilities.get(sp)?.push(node);
      }
      for (const tool of node.tooling) {
        toolingUsedByCapabilities.get(tool)?.push(node);
      }
      for (const risk of node.risks) {
        risksFor.get(risk)?.push(node);
      }
      for (const supplier of node.suppliers) {
        supplies.get(supplier)?.push(node);
      }
    }

    if (isTooling(node)) {
      for (const prim of node.dependsOn) {
        toolingDependedOnBy.get(prim)?.push(node);
      }
      for (const sp of node.supplierPrimitives) {
        usedByTooling.get(sp)?.push(node);
      }
    }

    if (isSupplierPrimitive(node)) {
      providesSupplierPrimitives.get(node.supplier)?.push(node);
    }

    if (isRisk(node)) {
      for (const prim of node.mitigatedBy) {
        mitigates.get(prim)?.push(node);
      }
    }

    if (isProduct(node)) {
      for (const cap of node.enabledBy) {
        enables.get(cap)?.push(node);
      }
      for (const tool of node.tooling) {
        toolingUsedByProducts.get(tool)?.push(node);
      }
      for (const customer of node.customers) {
        targetedBy.get(customer)?.push(node);
      }
      for (const competitor of node.competitors) {
        competedBy.get(competitor)?.push(node);
      }
    }

    if (isProject(node)) {
      for (const cap of node.enabledBy) {
        enablesProjects.get(cap)?.push(node);
      }
      for (const tool of node.tooling) {
        toolingUsedByProjects.get(tool)?.push(node);
      }
    }

    if (isMilestone(node)) {
      for (const ms of node.dependsOnMilestones) {
        milestoneDependsOn.get(ms)?.push(node);
      }
      for (const cap of node.dependsOnCapabilities) {
        milestoneForCapability.get(cap)?.push(node);
      }
      for (const prod of node.products) {
        milestoneForProduct.get(prod)?.push(node);
      }
    }

    if (isRepository(node)) {
      for (const repo of node.dependsOn) {
        repositoryDependedOnBy.get(repo)?.push(node);
      }
      if (node.upstream) {
        repositoryForkedBy.get(node.upstream)?.push(node);
      }
      for (const prod of node.products) {
        repositoryForProduct.get(prod)?.push(node);
      }
      for (const cap of node.capabilities) {
        repositoryForCapability.get(cap)?.push(node);
      }
    }

    // Rumelt's Good Strategy framework reverse relations
    if (isCompetency(node)) {
      for (const repo of node.evidencedBy) {
        evidencesCompetency.get(repo)?.push(node);
      }
    }

    if (isDiagnosis(node)) {
      for (const risk of node.evidencedBy) {
        evidencesDiagnosis.get(risk)?.push(node);
      }
      for (const constraint of node.constrainedBy) {
        constrainsDiagnosis.get(constraint)?.push(node);
      }
    }

    if (isGuidingPolicy(node)) {
      addressedByPolicy.get(node.addressesDiagnosis)?.push(node);
      for (const comp of node.leveragesCompetencies) {
        leveragedByPolicy.get(comp)?.push(node);
      }
      for (const constraint of node.worksAroundConstraints) {
        workedAroundByPolicy.get(constraint)?.push(node);
      }
    }

    if (isActionGate(node)) {
      for (const metric of node.proxyMetrics) {
        usedByActionGate.get(metric)?.push(node);
      }
      for (const gate of node.blockedBy) {
        blocksGate.get(gate)?.push(node);
      }
      for (const gate of node.unlocks) {
        unlockedByGate.get(gate)?.push(node);
      }
    }

    if (isMilestone(node)) {
      for (const gate of node.gatedBy) {
        gatesMilestone.get(gate)?.push(node);
      }
    }

    // Assumption tracking reverse relations
    if (isAssumption(node)) {
      for (const prod of node.dependentProducts) {
        assumptionsForProduct.get(prod)?.push(node);
      }
      for (const ms of node.dependentMilestones) {
        assumptionsForMilestone.get(ms)?.push(node);
      }
      for (const risk of node.relatedRisks) {
        assumptionsForRisk.get(risk)?.push(node);
      }
      // Reverse of dependsOnAssumptions: which assumptions this enables
      for (const dep of node.dependsOnAssumptions) {
        enablesAssumptions.get(dep)?.push(node);
      }
    }

    // Decision tracking reverse relations
    if (isDecision(node)) {
      for (const assumption of node.dependsOnAssumptions) {
        decisionsForAssumption.get(assumption)?.push(node);
      }
      for (const prod of node.affectedProducts) {
        decisionsForProduct.get(prod)?.push(node);
      }
      for (const ms of node.affectedMilestones) {
        decisionsForMilestone.get(ms)?.push(node);
      }
      if (node.supersededBy) {
        supersedes.get(node.supersededBy)?.push(node);
      }
    }
  }

  return {
    justifies,
    dependedOnBy,
    usedByCapabilities,
    usedByTooling,
    toolingUsedByCapabilities,
    toolingUsedByProducts,
    toolingUsedByProjects,
    toolingDependedOnBy,
    enablesProjects,
    risksFor,
    mitigates,
    enables,
    supplies,
    providesSupplierPrimitives,
    targetedBy,
    competedBy,
    milestoneDependsOn,
    milestoneForCapability,
    milestoneForProduct,
    repositoryDependedOnBy,
    repositoryForkedBy,
    repositoryForProduct,
    repositoryForCapability,
    // Rumelt's Good Strategy framework
    evidencesCompetency,
    evidencesDiagnosis,
    constrainsDiagnosis,
    addressedByPolicy,
    leveragedByPolicy,
    workedAroundByPolicy,
    usedByActionGate,
    blocksGate,
    unlockedByGate,
    gatesMilestone,
    // Assumption tracking
    assumptionsForProduct,
    assumptionsForMilestone,
    assumptionsForRisk,
    enablesAssumptions,
    // Decision tracking
    decisionsForAssumption,
    decisionsForProduct,
    decisionsForMilestone,
    supersedes,
  };
}
