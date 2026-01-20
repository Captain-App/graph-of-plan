/**
 * Derives edges and reverse relations from the graph.
 */

import type {
  PlanNode,
  Thesis,
  Capability,
  Primitive,
  Risk,
  Product,
} from "../schema.js";
import { isThesis, isCapability, isRisk, isProduct } from "../schema.js";

export interface DerivedRelations {
  /** Which nodes justify this node (reverse of justifiedBy) */
  justifies: Map<PlanNode, Thesis[]>;
  /** Which nodes depend on this node (reverse of dependsOn) */
  dependedOnBy: Map<PlanNode, Capability[]>;
  /** Which nodes are at risk from this node */
  risksFor: Map<PlanNode, Capability[]>;
  /** Which nodes mitigate this risk (reverse of mitigatedBy) */
  mitigates: Map<PlanNode, Risk[]>;
  /** Which products this capability enables (reverse of enabledBy) */
  enables: Map<PlanNode, Product[]>;
}

/**
 * Derive all reverse relations from the graph
 */
export function deriveRelations(nodes: PlanNode[]): DerivedRelations {
  const justifies = new Map<PlanNode, Thesis[]>();
  const dependedOnBy = new Map<PlanNode, Capability[]>();
  const risksFor = new Map<PlanNode, Capability[]>();
  const mitigates = new Map<PlanNode, Risk[]>();
  const enables = new Map<PlanNode, Product[]>();

  // Initialize empty arrays for all nodes
  for (const node of nodes) {
    justifies.set(node, []);
    dependedOnBy.set(node, []);
    risksFor.set(node, []);
    mitigates.set(node, []);
    enables.set(node, []);
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
      for (const risk of node.risks) {
        risksFor.get(risk)?.push(node);
      }
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
    }
  }

  return { justifies, dependedOnBy, risksFor, mitigates, enables };
}
