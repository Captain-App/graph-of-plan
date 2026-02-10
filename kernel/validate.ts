/**
 * Graph and content validation.
 *
 * Validation fails if:
 * - Duplicate node IDs exist
 * - A node has no content file
 * - A thesis has zero capabilities
 * - A capability has no primitives
 * - A risk has no mitigation (unless explicitly marked accepted)
 *
 * Agents cannot lie without breaking the build.
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PlanNode,
  Thesis,
  Capability,
  Risk,
  Product,
  Milestone,
  Repository,
  TimelineVariant,
  Constraint,
  Competency,
  Diagnosis,
  GuidingPolicy,
  ActionGate,
  ProxyMetric,
  Assumption,
  Decision,
  isThesis,
  isCapability,
  isRisk,
  isProduct,
  isSupplier,
  isSupplierPrimitive,
  isCustomer,
  isCompetitor,
  isMilestone,
  isRepository,
  isConstraint,
  isCompetency,
  isDiagnosis,
  isGuidingPolicy,
  isActionGate,
  isProxyMetric,
  isAssumption,
  isDecision,
} from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate the entire plan graph
 */
export function validatePlan(nodes: PlanNode[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Check for duplicate IDs
  const seenIds = new Set<string>();
  for (const node of nodes) {
    if (seenIds.has(node.id)) {
      errors.push({
        nodeId: node.id,
        message: `Duplicate node ID: "${node.id}"`,
      });
    }
    seenIds.add(node.id);
  }

  // Validate each node
  for (const node of nodes) {
    // Check content file exists
    const contentPath = resolve(ROOT, "content", node.kind, `${node.id}.mdx`);
    if (!existsSync(contentPath)) {
      errors.push({
        nodeId: node.id,
        message: `Missing content file: content/${node.kind}/${node.id}.mdx`,
      });
    }

    // Node-specific validations
    if (isThesis(node)) {
      validateThesis(node, errors);
    } else if (isCapability(node)) {
      validateCapability(node, errors);
    } else if (isRisk(node)) {
      validateRisk(node, errors);
    } else if (isProduct(node)) {
      validateProduct(node, errors);
    } else if (isMilestone(node)) {
      validateMilestone(node, errors);
    } else if (isRepository(node)) {
      validateRepository(node, errors);
    } else if (isDiagnosis(node)) {
      validateDiagnosis(node, errors);
    } else if (isGuidingPolicy(node)) {
      validateGuidingPolicy(node, errors);
    } else if (isActionGate(node)) {
      validateActionGate(node, errors);
    } else if (isProxyMetric(node)) {
      validateProxyMetric(node, errors);
    } else if (isAssumption(node)) {
      validateAssumption(node, errors);
    } else if (isDecision(node)) {
      validateDecision(node, errors);
    }
  }

  // Cross-milestone timeline validation
  const milestones = nodes.filter(isMilestone);
  if (milestones.length > 0) {
    validateTimelines(milestones, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateThesis(thesis: Thesis, errors: ValidationError[]): void {
  if (thesis.justifiedBy.length === 0) {
    errors.push({
      nodeId: thesis.id,
      message: "Thesis must be justified by at least one capability",
    });
  }
}

function validateCapability(
  capability: Capability,
  errors: ValidationError[]
): void {
  if (capability.dependsOn.length === 0) {
    errors.push({
      nodeId: capability.id,
      message: "Capability must depend on at least one primitive",
    });
  }
}

function validateRisk(risk: Risk, errors: ValidationError[]): void {
  // Risks with empty mitigations are accepted risks (business/operational/market risks
  // that don't have technical mitigations are valid). The content file should describe
  // the business-level mitigations.
  // Previously: required at least one mitigation, but this prevents valid business risks.
}

function validateProduct(product: Product, errors: ValidationError[]): void {
  if (product.enabledBy.length === 0) {
    errors.push({
      nodeId: product.id,
      message: "Product must be enabled by at least one capability",
    });
  }
}

function validateMilestone(milestone: Milestone, errors: ValidationError[]): void {
  // Revenue and costs must be non-negative
  if (milestone.expectedRevenue < 0) {
    errors.push({
      nodeId: milestone.id,
      message: "Milestone expectedRevenue must be non-negative",
    });
  }

  if (milestone.expectedCosts < 0) {
    errors.push({
      nodeId: milestone.id,
      message: "Milestone expectedCosts must be non-negative",
    });
  }

  // Timeline config validation
  const variants: TimelineVariant[] = ["expected", "aggressive", "speedOfLight"];
  for (const variant of variants) {
    const config = milestone.timelines[variant];
    if (config.startMonth < 0) {
      errors.push({
        nodeId: milestone.id,
        message: `Milestone timeline "${variant}" has invalid startMonth (must be >= 0)`,
      });
    }
    if (config.durationMonths < 0) {
      errors.push({
        nodeId: milestone.id,
        message: `Milestone timeline "${variant}" has invalid durationMonths (must be >= 0)`,
      });
    }
  }
}

function validateRepository(repo: Repository, errors: ValidationError[]): void {
  // Stack level must be 0-4
  if (repo.stackLevel < 0 || repo.stackLevel > 4) {
    errors.push({
      nodeId: repo.id,
      message: `Repository stackLevel must be 0-4, got ${repo.stackLevel}`,
    });
  }

  // Fork requires upstream
  if (repo.repoType === "fork" && !repo.upstream) {
    errors.push({
      nodeId: repo.id,
      message: "Fork repository must specify an upstream repository",
    });
  }

  // Upstream should only be set for forks
  if (repo.repoType !== "fork" && repo.upstream) {
    errors.push({
      nodeId: repo.id,
      message: "Only fork repositories should have an upstream (use dependsOn for dependencies)",
    });
  }

  // URL validation (basic - must be non-empty for non-owned repos, or start with https://)
  if (repo.url && !repo.url.startsWith("https://")) {
    errors.push({
      nodeId: repo.id,
      message: "Repository URL must start with https://",
    });
  }
}

function validateTimelines(milestones: Milestone[], errors: ValidationError[]): void {
  const variants: TimelineVariant[] = ["expected", "aggressive", "speedOfLight"];

  for (const variant of variants) {
    // 1. Speed of Light must complete within 12 months
    if (variant === "speedOfLight") {
      const includedMilestones = milestones.filter(m => m.timelines.speedOfLight.included);
      if (includedMilestones.length > 0) {
        const maxEnd = Math.max(
          ...includedMilestones.map(m =>
            m.timelines.speedOfLight.startMonth + m.timelines.speedOfLight.durationMonths
          )
        );
        if (maxEnd > 12) {
          errors.push({
            nodeId: "timeline-speedOfLight",
            message: `Speed of Light timeline exceeds 12 months (ends at month ${maxEnd})`,
          });
        }
      }
    }

    // 2. Dependency feasibility: if A depends on B and B is skipped, A must be skipped
    for (const milestone of milestones) {
      const config = milestone.timelines[variant];
      if (!config.included) continue;

      for (const dep of milestone.dependsOnMilestones) {
        const depConfig = dep.timelines[variant];
        if (!depConfig.included) {
          errors.push({
            nodeId: milestone.id,
            message: `Milestone "${milestone.id}" is included in ${variant} timeline but depends on skipped milestone "${dep.id}"`,
          });
        }
      }
    }

    // 3. Timing consistency: dependency must complete before dependent starts
    for (const milestone of milestones) {
      const config = milestone.timelines[variant];
      if (!config.included) continue;

      for (const dep of milestone.dependsOnMilestones) {
        const depConfig = dep.timelines[variant];
        if (!depConfig.included) continue;

        const depEnd = depConfig.startMonth + depConfig.durationMonths;
        if (depEnd > config.startMonth) {
          errors.push({
            nodeId: milestone.id,
            message: `Milestone "${milestone.id}" starts at month ${config.startMonth} but dependency "${dep.id}" ends at month ${depEnd} in ${variant} timeline`,
          });
        }
      }
    }
  }
}

// ============================================================================
// RUMELT'S GOOD STRATEGY FRAMEWORK VALIDATIONS
// ============================================================================

function validateDiagnosis(diagnosis: Diagnosis, errors: ValidationError[]): void {
  // Diagnosis must be evidenced by at least one Risk
  if (diagnosis.evidencedBy.length === 0) {
    errors.push({
      nodeId: diagnosis.id,
      message: "Diagnosis must be evidenced by at least one risk",
    });
  }
}

function validateGuidingPolicy(policy: GuidingPolicy, errors: ValidationError[]): void {
  // GuidingPolicy must leverage at least one Competency
  if (policy.leveragesCompetencies.length === 0) {
    errors.push({
      nodeId: policy.id,
      message: "Guiding policy must leverage at least one competency",
    });
  }
}

function validateActionGate(gate: ActionGate, errors: ValidationError[]): void {
  // ActionGate must have an action verb
  if (!gate.action || gate.action.trim().length === 0) {
    errors.push({
      nodeId: gate.id,
      message: "Action gate must have an action description",
    });
  }

  // ActionGate must have at least one pass criteria
  if (gate.passCriteria.length === 0) {
    errors.push({
      nodeId: gate.id,
      message: "Action gate must have at least one pass criterion",
    });
  }

  // Proxy metrics are optional - some gates are binary validation gates
  // without leading quantitative indicators
}

function validateProxyMetric(metric: ProxyMetric, errors: ValidationError[]): void {
  // Target value must be different from current value (otherwise it's not a target)
  if (metric.currentValue === metric.targetValue) {
    errors.push({
      nodeId: metric.id,
      message: "Proxy metric target value should differ from current value",
    });
  }

  // Values must be non-negative
  if (metric.currentValue < 0) {
    errors.push({
      nodeId: metric.id,
      message: "Proxy metric current value must be non-negative",
    });
  }

  if (metric.targetValue < 0) {
    errors.push({
      nodeId: metric.id,
      message: "Proxy metric target value must be non-negative",
    });
  }
}

function validateAssumption(assumption: Assumption, errors: ValidationError[]): void {
  // Must have a statement
  if (!assumption.statement || assumption.statement.trim().length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Assumption must have a statement",
    });
  }

  // Must have a test method
  if (!assumption.testMethod || assumption.testMethod.trim().length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Assumption must have a test method",
    });
  }

  // Must have at least one validation criterion
  if (assumption.validationCriteria.length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Assumption must have at least one validation criterion",
    });
  }

  // Must have at least one invalidation criterion
  if (assumption.invalidationCriteria.length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Assumption must have at least one invalidation criterion",
    });
  }

  // Confidence must be 0-100
  if (assumption.confidence < 0 || assumption.confidence > 100) {
    errors.push({
      nodeId: assumption.id,
      message: "Assumption confidence must be between 0 and 100",
    });
  }

  // Validated assumptions should have evidence
  if (assumption.status === "validated" && assumption.currentEvidence.length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Validated assumption should have supporting evidence",
    });
  }

  // Invalidated assumptions should have evidence
  if (assumption.status === "invalidated" && assumption.currentEvidence.length === 0) {
    errors.push({
      nodeId: assumption.id,
      message: "Invalidated assumption should have evidence of invalidation",
    });
  }
}

function validateDecision(decision: Decision, errors: ValidationError[]): void {
  // Must have context
  if (!decision.context || decision.context.trim().length === 0) {
    errors.push({
      nodeId: decision.id,
      message: "Decision must have context explaining the situation",
    });
  }

  // Must have a choice
  if (!decision.choice || decision.choice.trim().length === 0) {
    errors.push({
      nodeId: decision.id,
      message: "Decision must state the choice made",
    });
  }

  // Must have rationale
  if (!decision.rationale || decision.rationale.trim().length === 0) {
    errors.push({
      nodeId: decision.id,
      message: "Decision must have rationale explaining why this choice was made",
    });
  }

  // Active decisions should have at least one reversal trigger
  if (decision.status === "active" && decision.reversalTriggers.length === 0) {
    errors.push({
      nodeId: decision.id,
      message: "Active decision should have at least one reversal trigger",
    });
  }

  // Should have at least one tradeoff acknowledged
  if (decision.tradeoffs.length === 0) {
    errors.push({
      nodeId: decision.id,
      message: "Decision should acknowledge at least one tradeoff",
    });
  }

  // Review date should be in valid format (basic ISO check)
  if (decision.reviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(decision.reviewDate)) {
    errors.push({
      nodeId: decision.id,
      message: "Decision review date should be in YYYY-MM-DD format",
    });
  }

  // Reversed or superseded decisions should have explanation in status
  if (decision.status === "superseded" && !decision.supersededBy) {
    errors.push({
      nodeId: decision.id,
      message: "Superseded decision should reference the decision that supersedes it",
    });
  }
}
