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
  // Thesis
  AgentNativePlatform,
];
