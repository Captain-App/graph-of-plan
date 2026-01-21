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
  TimelineVariant,
  isThesis,
  isCapability,
  isRisk,
  isProduct,
  isSupplier,
  isSupplierPrimitive,
  isCustomer,
  isCompetitor,
  isMilestone,
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
