/**
 * Maps nodes to their MDX content files.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlanNode } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

/**
 * Load MDX content for a node
 */
export function loadContent(node: PlanNode): string {
  const contentPath = resolve(ROOT, "content", node.kind, `${node.id}.mdx`);
  return readFileSync(contentPath, "utf-8");
}

/**
 * Get the content path for a node
 */
export function getContentPath(node: PlanNode): string {
  return `content/${node.kind}/${node.id}.mdx`;
}
