/**
 * Renders the technology stack overview page.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Repository, StackLevel } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SITE_DOCS = resolve(ROOT, "src/content/docs");

const STACK_LEVEL_NAMES: Record<StackLevel, string> = {
  0: "Cloud",
  1: "Runtime",
  2: "Frameworks",
  3: "Libraries",
  4: "Our Code",
};

const STACK_LEVEL_DESCRIPTIONS: Record<StackLevel, string> = {
  0: "Infrastructure providers (see Suppliers)",
  1: "Execution environments and runtimes",
  2: "Application and web frameworks",
  3: "Utility libraries and packages",
  4: "Code we own and maintain",
};

/**
 * Render the main stack overview page
 */
export function renderStackIndex(repositories: Repository[]): string {
  const sections: string[] = [
    "---",
    'title: "Technology Stack"',
    'description: "The layers of technology we rely on"',
    "---",
    "",
    "The stack visualizes our technology dependencies from cloud infrastructure up to our own code.",
    "",
  ];

  // Summary stats
  const owned = repositories.filter(r => r.repoType === "owned");
  const forks = repositories.filter(r => r.repoType === "fork");
  const deps = repositories.filter(r => r.repoType === "dependency");

  sections.push("## Overview\n");
  sections.push(`| Type | Count |`);
  sections.push(`|------|-------|`);
  sections.push(`| Owned | ${owned.length} |`);
  sections.push(`| Forks | ${forks.length} |`);
  sections.push(`| Dependencies | ${deps.length} |`);
  sections.push(`| **Total** | **${repositories.length}** |`);
  sections.push("");

  // ASCII Stack visualization
  sections.push("## The Stack\n");
  sections.push("```");
  sections.push(renderAsciiStack(repositories));
  sections.push("```");
  sections.push("");

  // Detailed tables per level (top to bottom: L4 to L1)
  const levels: StackLevel[] = [4, 3, 2, 1];
  for (const level of levels) {
    const levelRepos = repositories.filter(r => r.stackLevel === level);
    if (levelRepos.length === 0) continue;

    sections.push(`## L${level}: ${STACK_LEVEL_NAMES[level]}\n`);
    sections.push(`${STACK_LEVEL_DESCRIPTIONS[level]}\n`);
    sections.push(`| Repository | Type | Language | Dependencies |`);
    sections.push(`|------------|------|----------|--------------|`);

    for (const repo of levelRepos) {
      const depCount = repo.dependsOn.length;
      const depText = depCount > 0 ? `${depCount} deps` : "—";
      const typeIcon = repo.repoType === "owned" ? "🏠" : repo.repoType === "fork" ? "🔱" : "📦";
      sections.push(`| [${repo.title}](/repository/${repo.id}) | ${typeIcon} ${repo.repoType} | ${repo.language} | ${depText} |`);
    }
    sections.push("");
  }

  // Note about L0
  sections.push("## L0: Cloud\n");
  sections.push("Cloud infrastructure is tracked under [Suppliers](/supplier/cloudflare) rather than repositories.");
  sections.push("");

  return sections.join("\n");
}

/**
 * Render ASCII stack diagram
 */
function renderAsciiStack(repositories: Repository[]): string {
  const lines: string[] = [];
  const levels: StackLevel[] = [4, 3, 2, 1, 0];

  for (const level of levels) {
    const levelRepos = repositories.filter(r => r.stackLevel === level);
    const levelName = `L${level}: ${STACK_LEVEL_NAMES[level]}`;

    if (level === 0) {
      // Special case for cloud - just show reference
      lines.push(`${levelName}`);
      lines.push(`└── (see Suppliers)`);
    } else if (levelRepos.length > 0) {
      lines.push(levelName);
      levelRepos.forEach((repo, i) => {
        const isLast = i === levelRepos.length - 1;
        const prefix = isLast ? "└──" : "├──";
        const typeIcon = repo.repoType === "owned" ? " [owned]" : repo.repoType === "fork" ? " [fork]" : "";
        lines.push(`${prefix} ${repo.title}${typeIcon}`);
      });
    } else {
      lines.push(levelName);
      lines.push(`└── (none)`);
    }

    // Add separator between levels except after last
    if (level > 0) {
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Write all stack pages to the docs directory
 */
export function writeStackPages(repositories: Repository[]): void {
  // Ensure stack directory exists
  const stackDir = resolve(SITE_DOCS, "stack");
  mkdirSync(stackDir, { recursive: true });

  // Write index page
  const indexContent = renderStackIndex(repositories);
  writeFileSync(resolve(stackDir, "index.mdx"), indexContent, "utf-8");

  console.log("✓ Stack pages written to src/content/docs/stack/");
}
