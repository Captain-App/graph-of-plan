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
  | "competitor";

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

/**
 * Competing product or company
 */
export class Competitor extends PlanNode {
  constructor(id: string, title: string) {
    super("competitor", id, title);
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
