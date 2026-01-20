/**
 * Kernel public API
 */

export {
  NodeKind,
  PlanNode,
  Thesis,
  Capability,
  Primitive,
  Risk,
  Product,
  isThesis,
  isCapability,
  isPrimitive,
  isRisk,
  isProduct,
} from "./schema.js";

export { validatePlan, ValidationError, ValidationResult } from "./validate.js";
