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
  Product,
  Project,
  Supplier,
  Customer,
  Competitor,
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
 * Risk definition with mitigations
 */
interface RiskDef {
  title: string;
  mitigatedBy: string[];
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
 * The complete graph definition
 */
export interface GraphDef {
  primitives?: Record<string, LeafNodeDef>;
  supplierPrimitives?: Record<string, SupplierPrimitiveDef>;
  tooling?: Record<string, ToolingDef>;
  suppliers?: Record<string, LeafNodeDef>;
  customers?: Record<string, LeafNodeDef>;
  competitors?: Record<string, LeafNodeDef>;
  risks?: Record<string, RiskDef>;
  capabilities?: Record<string, CapabilityDef>;
  products?: Record<string, ProductDef>;
  projects?: Record<string, ProjectDef>;
  thesis?: Record<string, ThesisDef>;
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

  for (const [id, title] of Object.entries(def.competitors ?? {})) {
    competitors.set(id, new Competitor(id, title));
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
    risks.set(id, new Risk(id, riskDef.title, mitigatedBy));
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

  // Phase 8: Create thesis (depend on capabilities)
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
    ...theses.values(),
  ];
}
