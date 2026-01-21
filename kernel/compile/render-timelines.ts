/**
 * Renders timeline overview pages.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Milestone, TimelineVariant } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SITE_DOCS = resolve(ROOT, "src/content/docs");

function formatTimelineVariant(variant: TimelineVariant): string {
  const names: Record<TimelineVariant, string> = {
    expected: "Expected",
    aggressive: "Aggressive",
    speedOfLight: "Speed of Light",
  };
  return names[variant];
}

/**
 * Render the timeline index page (comparison of all variants)
 */
export function renderTimelineIndex(milestones: Milestone[]): string {
  const sections: string[] = [
    "---",
    'title: "Timelines"',
    'description: "Execution timelines and milestone roadmap"',
    "---",
    "",
    "Three timelines. Same milestones. Different assumptions.",
    "",
  ];

  // Summary table
  sections.push("## At a Glance\n");
  sections.push("| Variant | Duration | Milestones | Total Revenue | Total Costs |");
  sections.push("|---------|----------|------------|---------------|-------------|");

  const variants: TimelineVariant[] = ["expected", "aggressive", "speedOfLight"];
  for (const variant of variants) {
    const included = milestones.filter(m => m.timelines[variant].included);
    const duration = included.length > 0
      ? Math.max(...included.map(m => m.timelines[variant].startMonth + m.timelines[variant].durationMonths))
      : 0;
    const revenue = included.reduce((sum, m) => sum + m.expectedRevenue, 0);
    const costs = included.reduce((sum, m) => sum + m.expectedCosts, 0);

    const variantSlug = variant === "speedOfLight" ? "speed-of-light" : variant;
    sections.push(`| [${formatTimelineVariant(variant)}](/timeline/${variantSlug}) | ${duration} months | ${included.length} | £${revenue.toLocaleString()}/mo | £${costs.toLocaleString()}/mo |`);
  }

  sections.push("");
  sections.push("Click each variant to see the detailed timeline with Gantt chart and milestone breakdown.");
  sections.push("");

  // Quick comparison of what's different
  sections.push("## What's Different?\n");
  sections.push("| | Expected | Aggressive | Speed of Light |");
  sections.push("|---|----------|------------|----------------|");
  sections.push("| **Pace** | Conservative | Compressed | Maximum velocity |");
  sections.push("| **Target** | 36 months | ~18 months | 12 months |");
  sections.push("| **Skipped** | None | None | Enterprise milestones |");
  sections.push("");

  return sections.join("\n");
}

/**
 * Render a single timeline variant page
 */
export function renderTimelineVariant(milestones: Milestone[], variant: TimelineVariant): string {
  const variantName = formatTimelineVariant(variant);
  const included = milestones
    .filter(m => m.timelines[variant].included)
    .sort((a, b) => a.timelines[variant].startMonth - b.timelines[variant].startMonth);
  const skipped = milestones.filter(m => !m.timelines[variant].included);

  const duration = included.length > 0
    ? Math.max(...included.map(m => m.timelines[variant].startMonth + m.timelines[variant].durationMonths))
    : 0;
  const totalRevenue = included.reduce((sum, m) => sum + m.expectedRevenue, 0);
  const totalCosts = included.reduce((sum, m) => sum + m.expectedCosts, 0);

  const sections: string[] = [
    "---",
    `title: "${variantName} Timeline"`,
    `description: "${variantName} execution timeline - ${duration} months"`,
    "---",
    "",
  ];

  // Summary callout
  sections.push(`:::note[${variantName} Timeline Summary]`);
  sections.push(`**${duration} months** · **${included.length} milestones** · **£${totalRevenue.toLocaleString()}/mo revenue** · **£${totalCosts.toLocaleString()}/mo costs**`);
  sections.push(":::");
  sections.push("");

  // ASCII timeline visualization
  if (included.length > 0) {
    sections.push("## Timeline View\n");
    sections.push("```");
    sections.push(renderAsciiTimeline(included, variant));
    sections.push("```");
    sections.push("");
  }

  // Milestone list
  sections.push("## Milestones\n");

  for (const milestone of included) {
    const config = milestone.timelines[variant];
    const endMonth = config.startMonth + config.durationMonths;
    const netContribution = milestone.expectedRevenue - milestone.expectedCosts;

    sections.push(`### [${milestone.title}](/milestone/${milestone.id})\n`);
    sections.push(`**M${config.startMonth} → M${endMonth}** (${config.durationMonths} months)\n`);
    sections.push(`| Revenue | Costs | Net |`);
    sections.push(`|---------|-------|-----|`);
    sections.push(`| £${milestone.expectedRevenue.toLocaleString()}/mo | £${milestone.expectedCosts.toLocaleString()}/mo | £${netContribution.toLocaleString()}/mo |`);
    sections.push("");
  }

  // Skipped milestones (if any)
  if (skipped.length > 0) {
    sections.push("## Skipped in This Timeline\n");
    sections.push("These milestones are deferred in the " + variantName + " timeline:\n");
    for (const milestone of skipped) {
      sections.push(`- ~~[${milestone.title}](/milestone/${milestone.id})~~`);
    }
    sections.push("");
  }

  // Cumulative financials
  sections.push("## Cumulative at Completion\n");
  sections.push(`At the end of month ${duration}:\n`);
  sections.push(`- **Monthly Revenue Run Rate**: £${totalRevenue.toLocaleString()}/mo`);
  sections.push(`- **Monthly Costs**: £${totalCosts.toLocaleString()}/mo`);
  sections.push(`- **Monthly Net**: £${(totalRevenue - totalCosts).toLocaleString()}/mo`);
  sections.push("");

  return sections.join("\n");
}

/**
 * Generate ASCII Gantt chart
 */
function renderAsciiTimeline(milestones: Milestone[], variant: TimelineVariant): string {
  const maxMonth = Math.max(...milestones.map(m => m.timelines[variant].startMonth + m.timelines[variant].durationMonths));
  const lines: string[] = [];

  // Determine column width based on max month
  const colWidth = maxMonth > 24 ? 2 : 3;

  // Header with month numbers
  const months = Array.from({ length: maxMonth + 1 }, (_, i) => {
    const label = `M${i}`;
    return label.padEnd(colWidth);
  }).join("");
  lines.push(`${"".padEnd(22)}${months}`);
  lines.push(`${"".padEnd(22)}${"─".repeat(maxMonth * colWidth)}`);

  // Each milestone as a bar
  for (const milestone of milestones) {
    const config = milestone.timelines[variant];
    const label = milestone.title.substring(0, 20).padEnd(20);

    let bar = "";
    for (let m = 0; m <= maxMonth; m++) {
      if (m >= config.startMonth && m < config.startMonth + config.durationMonths) {
        bar += "█".repeat(colWidth);
      } else {
        bar += " ".repeat(colWidth);
      }
    }
    lines.push(`${label} │${bar}│`);
  }

  return lines.join("\n");
}

/**
 * Write all timeline pages
 */
export function writeTimelinePages(milestones: Milestone[]): void {
  if (milestones.length === 0) return;

  // Create timeline directory
  mkdirSync(resolve(SITE_DOCS, "timeline"), { recursive: true });

  // Write timeline index
  writeFileSync(
    resolve(SITE_DOCS, "timeline/index.mdx"),
    renderTimelineIndex(milestones),
    "utf-8"
  );

  // Write variant pages
  const variants: Array<{ variant: TimelineVariant; slug: string }> = [
    { variant: "expected", slug: "expected" },
    { variant: "aggressive", slug: "aggressive" },
    { variant: "speedOfLight", slug: "speed-of-light" },
  ];

  for (const { variant, slug } of variants) {
    writeFileSync(
      resolve(SITE_DOCS, `timeline/${slug}.mdx`),
      renderTimelineVariant(milestones, variant),
      "utf-8"
    );
  }

  console.log("✓ Timeline pages written to src/content/docs/timeline/");
}
