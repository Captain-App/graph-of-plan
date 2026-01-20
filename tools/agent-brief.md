# Agent Editing Rules

This document defines what agents may and may not edit in this repository.

## Editable

You may edit:

- `/plan/graph.ts` — The typed business plan graph
- `/content/**` — Narrative MDX content

## Not editable

You may NOT edit:

- `/kernel/**` — Core schema and compiler (stable, rarely changes)
- `/site/**` — Generated output (will be overwritten)

## Rules

1. **Do not introduce string-based dependencies**
   - All relationships must be object references
   - If you need a new node, create it as a typed class instance

2. **Do not remove risks without justification**
   - Risks exist because they are real
   - If a risk is mitigated, add the mitigation to `mitigatedBy`
   - If a risk is accepted, document why in the content

3. **Do not add prose to structure files**
   - `/plan/graph.ts` contains structure only
   - Narrative belongs in `/content/**/*.mdx`

4. **Do not add front-matter to MDX files**
   - Content files are prose only
   - Metadata comes from the graph

5. **Maintain referential integrity**
   - Every node in the graph must have a corresponding content file
   - Every content file must have a corresponding node

## Your job

Your job is to improve:

- **Clarity**: Make the argument easier to understand
- **Structure**: Organise nodes and relationships logically
- **Argument strength**: Ensure claims are supported by evidence

Run `npm run check` to validate your changes.
Run `npm run compile` to generate the site.
