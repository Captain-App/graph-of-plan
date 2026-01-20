/**
 * The business plan graph.
 *
 * This file is agent-editable.
 * All relationships are object references, not strings.
 * Refactor-safe. Graph = code = plan.
 */

import {
  Thesis,
  Capability,
  Primitive,
  Risk,
  Product,
} from "../kernel/schema.js";

// ============================================================================
// PRIMITIVES
// ============================================================================

export const SnapshotMaterialisation = new Primitive(
  "snapshot-materialisation",
  "Snapshot materialisation"
);

export const CapabilityScopedExec = new Primitive(
  "capability-scoped-exec",
  "Capability-scoped sandbox execution"
);

// ============================================================================
// RISKS
// ============================================================================

export const AutonomyBlastRadius = new Risk(
  "autonomy-blast-radius",
  "Autonomy increases blast radius",
  [CapabilityScopedExec]
);

// ============================================================================
// CAPABILITIES
// ============================================================================

export const Smartbox = new Capability(
  "smartbox",
  "Smartbox: capability-scoped execution workspaces",
  [SnapshotMaterialisation, CapabilityScopedExec],
  [AutonomyBlastRadius]
);

export const NomosDomainApi = new Capability(
  "nomos-domain-api",
  "Nomos: domains compiled to OpenAPI, MCP, CLI and SDKs",
  [SnapshotMaterialisation] // Added a primitive dependency
);

// ============================================================================
// PRODUCTS
// ============================================================================

export const SmartBoxes = new Product(
  "smartboxes",
  "SmartBoxes",
  [Smartbox]
);

export const NomosCloud = new Product(
  "nomos-cloud",
  "Nomos Cloud",
  [NomosDomainApi]
);

export const P4gent = new Product(
  "p4gent",
  "P4gent",
  [Smartbox, NomosDomainApi]
);

export const Murphy = new Product(
  "murphy",
  "Murphy",
  [Smartbox, NomosDomainApi]
);

// ============================================================================
// THESIS
// ============================================================================

export const AgentNativePlatform = new Thesis(
  "agent-native-platform",
  "Agent-native execution is the platform shift",
  [Smartbox, NomosDomainApi]
);

// ============================================================================
// EXPORTED PLAN
// ============================================================================

export const PLAN = [
  // Primitives
  SnapshotMaterialisation,
  CapabilityScopedExec,
  // Risks
  AutonomyBlastRadius,
  // Capabilities
  Smartbox,
  NomosDomainApi,
  // Products
  SmartBoxes,
  NomosCloud,
  P4gent,
  Murphy,
  // Thesis
  AgentNativePlatform,
];
