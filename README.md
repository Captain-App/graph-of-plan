# Graph of Plan

A **typed, agent-centric business-plan compiler** where:

- **Structure and dependencies are expressed as TypeScript values**
- **Narrative content lives in MDX files**
- **Agents iterate on both structure and prose**
- **The plan compiles into an Apollo Docs site**
- **The compiler enforces honesty, completeness, and referential integrity**

## Quick Start

```bash
npm install
npm run check    # Validate graph + content integrity
npm run compile  # Compile to Apollo Docs site
```

## Repository Layout

```
graph-of-plan/
├─ kernel/              # STABLE CORE (rarely changes)
│  ├─ schema.ts         # Typed node classes
│  ├─ validate.ts       # Graph + content validation
│  ├─ compile/          # Compilation pipeline
│  └─ index.ts
│
├─ plan/                # AGENT EDITS (STRUCTURE)
│  └─ graph.ts          # Typed graph (nodes + deps)
│
├─ content/             # AGENT EDITS (NARRATIVE)
│  ├─ thesis/
│  ├─ capability/
│  ├─ primitive/
│  └─ risk/
│
├─ site/                # GENERATED (Apollo Docs input)
│  ├─ docs/
│  ├─ nav.json
│  └─ graph.json
│
└─ tools/
   └─ agent-brief.md    # Editing rules for agents
```

## Core Principles

1. **No stringly-typed graphs** — All relationships are object references
2. **Agents think in code and prose** — Structure in TypeScript, narrative in MDX
3. **Kernel is small and boring** — Schema + compiler + validation only
4. **Plan graph is agent-editable** — The graph *is* the business plan
5. **Markdown is output, not source of truth** — Apollo Docs is a compiled view

## Editing the Plan

Edit `/plan/graph.ts` to modify structure and relationships.
Edit `/content/**/*.mdx` to modify narrative prose.

See `tools/agent-brief.md` for agent editing rules.
