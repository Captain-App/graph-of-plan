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
  isThesis,
  isCapability,
  isRisk,
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
    }
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
  if (risk.mitigatedBy.length === 0) {
    errors.push({
      nodeId: risk.id,
      message:
        "Risk must have at least one mitigation (or be explicitly marked as accepted)",
    });
  }
}
