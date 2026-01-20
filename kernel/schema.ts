/**
 * Core schema for the business plan graph.
 *
 * This file:
 * - Never imports from /plan
 * - Never imports from /content
 * - Never changes shape lightly
 */

export type NodeKind = "thesis" | "capability" | "primitive" | "risk" | "product";

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
    public readonly risks: Risk[] = []
  ) {
    super("capability", id, title);
  }
}

export class Primitive extends PlanNode {
  constructor(id: string, title: string) {
    super("primitive", id, title);
  }
}

export class Risk extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly mitigatedBy: Primitive[]
  ) {
    super("risk", id, title);
  }
}

export class Product extends PlanNode {
  constructor(
    id: string,
    title: string,
    public readonly enabledBy: Capability[]
  ) {
    super("product", id, title);
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

export function isRisk(node: PlanNode): node is Risk {
  return node.kind === "risk";
}

export function isProduct(node: PlanNode): node is Product {
  return node.kind === "product";
}
