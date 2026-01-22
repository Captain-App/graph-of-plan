/**
 * The business plan graph.
 *
 * This file is agent-editable.
 * Define nodes grouped by kind, with relations as string IDs.
 * The DSL resolves references and creates the object graph.
 */

import { defineGraph } from "../kernel/dsl.js";

export const PLAN = defineGraph({
  // ==========================================================================
  // PRIMITIVES - foundational building blocks (internal)
  // ==========================================================================
  primitives: {
    "snapshot-materialisation": "Snapshot materialisation",
    "capability-scoped-exec": "Capability-scoped sandbox execution",
  },

  // ==========================================================================
  // SUPPLIERS - external dependencies that enable capabilities
  // ==========================================================================
  suppliers: {
    "cloudflare": "Cloudflare",
    "firebase": "Firebase (Google Cloud)",
    "convex": "Convex",
    "anthropic": "Anthropic",
    "twilio": "Twilio",
    "stripe": "Stripe",
    "sendgrid": "SendGrid (Twilio)",
  },

  // ==========================================================================
  // SUPPLIER PRIMITIVES - building blocks provided by suppliers
  // ==========================================================================
  supplierPrimitives: {
    // Cloudflare primitives
    "cf-workers": {
      title: "Cloudflare Workers",
      supplier: "cloudflare",
    },
    "cf-durable-objects": {
      title: "Cloudflare Durable Objects",
      supplier: "cloudflare",
    },
    "cf-r2": {
      title: "Cloudflare R2",
      supplier: "cloudflare",
    },
    "cf-d1": {
      title: "Cloudflare D1",
      supplier: "cloudflare",
    },
    "cf-queues": {
      title: "Cloudflare Queues",
      supplier: "cloudflare",
    },
    "cf-workflows": {
      title: "Cloudflare Workflows",
      supplier: "cloudflare",
    },
    "cf-pages": {
      title: "Cloudflare Pages",
      supplier: "cloudflare",
    },
    // Anthropic primitives
    "anthropic-claude": {
      title: "Claude API",
      supplier: "anthropic",
    },
    // Firebase primitives (used by nomos_persistence)
    "firebase-firestore": {
      title: "Cloud Firestore",
      supplier: "firebase",
    },
    "firebase-storage": {
      title: "Cloud Storage for Firebase",
      supplier: "firebase",
    },
    "firebase-functions": {
      title: "Cloud Functions for Firebase",
      supplier: "firebase",
    },
    "firebase-auth": {
      title: "Firebase Authentication",
      supplier: "firebase",
    },
    // Twilio primitives (messaging interfaces)
    "twilio-whatsapp": {
      title: "Twilio WhatsApp Business API",
      supplier: "twilio",
    },
    "twilio-sms": {
      title: "Twilio Programmable SMS",
      supplier: "twilio",
    },
    "twilio-conversations": {
      title: "Twilio Conversations",
      supplier: "twilio",
    },
    // Stripe primitives (payments)
    "stripe-payments": {
      title: "Stripe Payments",
      supplier: "stripe",
    },
    "stripe-billing": {
      title: "Stripe Billing",
      supplier: "stripe",
    },
    "stripe-connect": {
      title: "Stripe Connect",
      supplier: "stripe",
    },
    // SendGrid primitives (email)
    "sendgrid-email": {
      title: "SendGrid Email API",
      supplier: "sendgrid",
    },
    // Convex primitives (potential migration target)
    "convex-database": {
      title: "Convex Database",
      supplier: "convex",
    },
    "convex-functions": {
      title: "Convex Functions",
      supplier: "convex",
    },
  },

  // ==========================================================================
  // TOOLING - development and operational tools
  // ==========================================================================
  tooling: {
    "wrangler-cli": {
      title: "Wrangler CLI",
      supplierPrimitives: ["cf-workers", "cf-pages", "cf-r2", "cf-d1"],
    },
    "nomos-codegen": {
      title: "Nomos Code Generator",
      dependsOn: ["snapshot-materialisation"],
      supplierPrimitives: ["cf-workers"],
    },
    "smartbox-cli": {
      title: "SmartBox CLI",
      dependsOn: ["capability-scoped-exec"],
      supplierPrimitives: ["anthropic-claude", "cf-workers"],
    },
  },

  // ==========================================================================
  // CUSTOMERS - market segments that products target
  // ==========================================================================
  customers: {
    "agencies": "Digital Agencies & Consultancies",
    "smb-founders": "SMB Founders & Operators",
    "enterprise-ai-teams": "Enterprise AI/ML Teams",
    "solopreneurs": "Solopreneurs & Freelancers",
  },

  // ==========================================================================
  // COMPETITORS - competing products with threat levels
  // ==========================================================================
  competitors: {
    // SmartBoxes competitors
    "cursor": { title: "Cursor", threatLevel: "low" },
    "replit": { title: "Replit Agent", threatLevel: "medium" },
    // Murphy competitors
    "linear": { title: "Linear", threatLevel: "low" },
    "forecast-app": { title: "Forecast.app", threatLevel: "medium" },
    // P4gent competitors
    "ramp": { title: "Ramp", threatLevel: "none" },
    "brex": { title: "Brex", threatLevel: "none" },
    // Nomos Cloud competitors
    "langsmith": { title: "LangSmith", threatLevel: "low" },
    "helicone": { title: "Helicone", threatLevel: "low" },
  },

  // ==========================================================================
  // RISKS - threats mitigated by primitives
  // ==========================================================================
  risks: {
    "autonomy-blast-radius": {
      title: "Autonomy increases blast radius",
      mitigatedBy: ["capability-scoped-exec"],
      status: "mitigated",
    },
    "model-degradation": {
      title: "Model degradation",
      mitigatedBy: ["snapshot-materialisation"], // Abstraction layer helps swap models
      status: "mitigated", // Switching AI providers is cheap
    },
    "regulatory-ai-autonomy": {
      title: "Regulatory: AI autonomy rules tightening",
      mitigatedBy: ["capability-scoped-exec"], // Configurable autonomy levels
      status: "mitigated",
    },
    "competitive-big-tech": {
      title: "Competitive: Big tech enters agent infrastructure",
      mitigatedBy: [], // Business strategy risk - no technical mitigation
      status: "accepted",
    },
    "execution-team-capacity": {
      title: "Execution: One team, many products",
      mitigatedBy: [], // Operational risk - no technical mitigation
      status: "active",
    },
    "supplier-concentration": {
      title: "Supplier concentration: Cloudflare/Anthropic dependency",
      mitigatedBy: [], // Supplier risk - no technical mitigation
      status: "accepted",
    },
    "market-timing": {
      title: "Market timing: Is the market ready for agent-native?",
      mitigatedBy: [], // Market risk - no technical mitigation
      status: "active",
    },
  },

  // ==========================================================================
  // CAPABILITIES - what we can do, built on primitives
  // ==========================================================================
  capabilities: {
    "smartbox": {
      title: "Smartbox: capability-scoped execution workspaces",
      dependsOn: ["snapshot-materialisation", "capability-scoped-exec"],
      supplierPrimitives: [
        // Cloudflare (compute & storage)
        "cf-workers",
        "cf-durable-objects",
        "cf-r2",
        "cf-d1",
        "cf-queues",
        "cf-pages",
        // Anthropic (AI reasoning)
        "anthropic-claude",
        // Twilio (messaging interfaces)
        "twilio-whatsapp",
        "twilio-sms",
        "twilio-conversations",
      ],
      tooling: ["wrangler-cli", "smartbox-cli"],
      risks: ["autonomy-blast-radius"],
    },
    "nomos-domain-api": {
      title: "Nomos: domains compiled to OpenAPI, MCP, CLI and SDKs",
      dependsOn: ["snapshot-materialisation"],
      supplierPrimitives: [
        // Current: Firebase + Cloud Functions (Dart implementation)
        "firebase-firestore",
        "firebase-storage",
        "firebase-functions",
        "firebase-auth",
        // Target: Cloudflare (TypeScript implementation)
        "cf-workers",
        "cf-durable-objects",
        "cf-r2",
        "cf-d1",
        // Alternative target: Convex
        "convex-database",
        "convex-functions",
      ],
      tooling: ["wrangler-cli", "nomos-codegen"],
    },
  },

  // ==========================================================================
  // PRODUCTS - what we ship, enabled by capabilities
  // ==========================================================================
  products: {
    "smartboxes": {
      title: "SmartBoxes",
      enabledBy: ["smartbox"],
      tooling: ["smartbox-cli", "wrangler-cli"],
      customers: ["agencies", "enterprise-ai-teams", "smb-founders"],
      competitors: ["cursor", "replit"],
    },
    "nomos-cloud": {
      title: "Nomos Cloud",
      enabledBy: ["nomos-domain-api"],
      tooling: ["nomos-codegen", "wrangler-cli"],
      customers: ["enterprise-ai-teams", "agencies"],
      competitors: ["langsmith", "helicone"],
    },
    "p4gent": {
      title: "P4gent",
      enabledBy: ["smartbox", "nomos-domain-api"],
      tooling: ["smartbox-cli", "nomos-codegen"],
      customers: ["solopreneurs", "smb-founders"],
      competitors: ["ramp", "brex"],
    },
    "murphy": {
      title: "Murphy",
      enabledBy: ["smartbox", "nomos-domain-api"],
      tooling: ["smartbox-cli", "nomos-codegen"],
      customers: ["agencies", "enterprise-ai-teams"],
      competitors: ["linear", "forecast-app"],
    },
  },

  // ==========================================================================
  // CUSTOMER PROJECTS - projects built on the platform
  // ==========================================================================
  projects: {
    "co2": {
      title: "CO2 Target Asset Tracking",
      enabledBy: ["nomos-domain-api"],
      tooling: ["nomos-codegen"],
    },
  },

  // ==========================================================================
  // MILESTONES - execution timeline with financial projections
  // ==========================================================================
  milestones: {
    // SmartBoxes milestones
    "smartbox-mvp": {
      title: "SmartBox MVP",
      expectedRevenue: 0,
      expectedCosts: 2000,
      dependsOnMilestones: [],
      dependsOnCapabilities: ["smartbox"],
      products: ["smartboxes"],
      gatedBy: ["internal-daily-use"],
      timelines: {
        expected: { startMonth: 0, durationMonths: 4, included: true },
        aggressive: { startMonth: 0, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 0, durationMonths: 1, included: true },
      },
    },
    "smartbox-beta": {
      title: "SmartBox Public Beta",
      expectedRevenue: 5000,
      expectedCosts: 3000,
      dependsOnMilestones: ["smartbox-mvp"],
      dependsOnCapabilities: [],
      products: ["smartboxes"],
      gatedBy: ["first-external-user", "first-100-followers"],
      timelines: {
        expected: { startMonth: 4, durationMonths: 4, included: true },
        aggressive: { startMonth: 2, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 1, durationMonths: 2, included: true },
      },
    },
    "smartbox-revenue": {
      title: "SmartBox First Revenue",
      expectedRevenue: 17000,
      expectedCosts: 4000,
      dependsOnMilestones: ["smartbox-beta"],
      dependsOnCapabilities: [],
      products: ["smartboxes"],
      timelines: {
        expected: { startMonth: 8, durationMonths: 4, included: true },
        aggressive: { startMonth: 4, durationMonths: 3, included: true },
        speedOfLight: { startMonth: 3, durationMonths: 2, included: true },
      },
    },
    // Murphy milestones
    "murphy-alpha": {
      title: "Murphy Design Partners",
      expectedRevenue: 0,
      expectedCosts: 1000,
      dependsOnMilestones: ["smartbox-mvp"],
      dependsOnCapabilities: ["smartbox", "nomos-domain-api"],
      products: ["murphy"],
      timelines: {
        expected: { startMonth: 4, durationMonths: 3, included: true },
        aggressive: { startMonth: 2, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 1, durationMonths: 1, included: true },
      },
    },
    "murphy-beta": {
      title: "Murphy Public Beta",
      expectedRevenue: 5000,
      expectedCosts: 2000,
      dependsOnMilestones: ["murphy-alpha"],
      dependsOnCapabilities: [],
      products: ["murphy"],
      timelines: {
        expected: { startMonth: 7, durationMonths: 4, included: true },
        aggressive: { startMonth: 4, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 2, durationMonths: 2, included: true },
      },
    },
    "murphy-revenue": {
      title: "Murphy First Revenue",
      expectedRevenue: 19000,
      expectedCosts: 3000,
      dependsOnMilestones: ["murphy-beta"],
      dependsOnCapabilities: [],
      products: ["murphy"],
      timelines: {
        expected: { startMonth: 11, durationMonths: 5, included: true },
        aggressive: { startMonth: 6, durationMonths: 3, included: true },
        speedOfLight: { startMonth: 4, durationMonths: 2, included: true },
      },
    },
    "murphy-enterprise": {
      title: "Murphy Enterprise",
      expectedRevenue: 35000,
      expectedCosts: 5000,
      dependsOnMilestones: ["murphy-revenue"],
      dependsOnCapabilities: [],
      products: ["murphy"],
      timelines: {
        expected: { startMonth: 16, durationMonths: 8, included: true },
        aggressive: { startMonth: 9, durationMonths: 5, included: true },
        speedOfLight: { startMonth: 0, durationMonths: 0, included: false }, // Skipped
      },
    },
    // Nomos migration milestones
    "nomos-ts-port": {
      title: "Nomos TypeScript Port",
      expectedRevenue: 0,
      expectedCosts: 3000,
      dependsOnMilestones: [],
      dependsOnCapabilities: ["nomos-domain-api"],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 2, durationMonths: 4, included: true },
        aggressive: { startMonth: 1, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 0, durationMonths: 2, included: true },
      },
    },
    "nomos-cloudflare-migration": {
      title: "Nomos Cloudflare Migration",
      expectedRevenue: 0,
      expectedCosts: 2000,
      dependsOnMilestones: ["nomos-ts-port"],
      dependsOnCapabilities: [],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 6, durationMonths: 3, included: true },
        aggressive: { startMonth: 3, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 2, durationMonths: 1, included: true },
      },
    },
    // Nomos Cloud milestones
    "nomos-internal": {
      title: "Nomos Internal Use",
      expectedRevenue: 0,
      expectedCosts: 2000,
      dependsOnMilestones: ["nomos-cloudflare-migration"],
      dependsOnCapabilities: ["nomos-domain-api"],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 9, durationMonths: 3, included: true },
        aggressive: { startMonth: 5, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 3, durationMonths: 1, included: true },
      },
    },
    "nomos-beta": {
      title: "Nomos Public Beta",
      expectedRevenue: 15000,
      expectedCosts: 4000,
      dependsOnMilestones: ["nomos-internal"],
      dependsOnCapabilities: [],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 12, durationMonths: 4, included: true },
        aggressive: { startMonth: 7, durationMonths: 3, included: true },
        speedOfLight: { startMonth: 4, durationMonths: 2, included: true },
      },
    },
    "nomos-revenue": {
      title: "Nomos First Revenue",
      expectedRevenue: 62000,
      expectedCosts: 6000,
      dependsOnMilestones: ["nomos-beta"],
      dependsOnCapabilities: [],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 16, durationMonths: 6, included: true },
        aggressive: { startMonth: 10, durationMonths: 4, included: true },
        speedOfLight: { startMonth: 6, durationMonths: 3, included: true },
      },
    },
    "nomos-enterprise": {
      title: "Nomos Enterprise Contract",
      expectedRevenue: 100000,
      expectedCosts: 10000,
      dependsOnMilestones: ["nomos-revenue"],
      dependsOnCapabilities: [],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 22, durationMonths: 10, included: true },
        aggressive: { startMonth: 14, durationMonths: 6, included: true },
        speedOfLight: { startMonth: 0, durationMonths: 0, included: false }, // Skipped
      },
    },
    // P4gent milestones
    "p4gent-mvp": {
      title: "P4gent MVP",
      expectedRevenue: 0,
      expectedCosts: 1000,
      dependsOnMilestones: ["smartbox-mvp"],
      dependsOnCapabilities: ["smartbox"],
      products: ["p4gent"],
      timelines: {
        expected: { startMonth: 6, durationMonths: 4, included: true },
        aggressive: { startMonth: 3, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 2, durationMonths: 2, included: true },
      },
    },
    "p4gent-launch": {
      title: "P4gent Public Launch",
      expectedRevenue: 1000,
      expectedCosts: 1000,
      dependsOnMilestones: ["p4gent-mvp"],
      dependsOnCapabilities: [],
      products: ["p4gent"],
      timelines: {
        expected: { startMonth: 10, durationMonths: 4, included: true },
        aggressive: { startMonth: 5, durationMonths: 3, included: true },
        speedOfLight: { startMonth: 4, durationMonths: 2, included: true },
      },
    },
    "p4gent-revenue": {
      title: "P4gent Revenue Milestone",
      expectedRevenue: 3000,
      expectedCosts: 1000,
      dependsOnMilestones: ["p4gent-launch"],
      dependsOnCapabilities: [],
      products: ["p4gent"],
      timelines: {
        expected: { startMonth: 14, durationMonths: 6, included: true },
        aggressive: { startMonth: 8, durationMonths: 4, included: true },
        speedOfLight: { startMonth: 0, durationMonths: 0, included: false }, // Skipped
      },
    },
  },

  // ==========================================================================
  // REPOSITORIES - code we maintain, depend on, or fork
  // ==========================================================================
  repositories: {
    // L4: Our Code (owned)
    "shipbox": {
      title: "Shipbox",
      url: "https://github.com/Captain-App/shipbox-dev",
      stackLevel: 4,
      repoType: "owned",
      language: "TypeScript",
      products: ["smartboxes"],
      capabilities: ["smartbox"],
      dependsOn: ["effect", "hono", "react", "cloudflare-sandbox", "mcp-sdk", "supabase-js"],
    },
    "sandbox-mcp": {
      title: "Sandbox MCP",
      url: "https://github.com/Captain-App/sandbox-mcp",
      stackLevel: 4,
      repoType: "owned",
      language: "TypeScript",
      products: ["smartboxes"],
      capabilities: ["smartbox"],
      dependsOn: ["effect", "hono", "cloudflare-sandbox", "mcp-sdk"],
    },
    "nomos-dart": {
      title: "Nomos Dart",
      url: "https://github.com/Captain-App/nomos",
      stackLevel: 4,
      repoType: "owned",
      language: "Dart",
      products: ["nomos-cloud"],
      capabilities: ["nomos-domain-api"],
      dependsOn: ["flutter", "riverpod"],
    },
    "co2-app": {
      title: "CO2 Target Asset Management",
      url: "https://github.com/Captain-App/co2-target-asset-management",
      stackLevel: 4,
      repoType: "owned",
      language: "Dart",
      dependsOn: ["flutter", "riverpod", "flutter-map-fork", "nomos-dart"],
    },
    "graph-of-plan": {
      title: "Graph of Plan",
      url: "https://github.com/Captain-App/graph-of-plan",
      stackLevel: 4,
      repoType: "owned",
      language: "TypeScript",
      dependsOn: ["astro", "starlight"],
    },

    // L4: Forks (fork)
    "flutter-map-fork": {
      title: "flutter_map (fork)",
      url: "https://github.com/Captain-App/flutter_map",
      stackLevel: 4,
      repoType: "fork",
      language: "Dart",
      upstream: "flutter-map",
    },

    // L3: Libraries (dependency) - significant architectural choices
    "effect": {
      title: "Effect-TS",
      url: "https://github.com/Effect-TS/effect",
      stackLevel: 3,
      repoType: "dependency",
      language: "TypeScript",
    },
    "cloudflare-sandbox": {
      title: "@cloudflare/sandbox",
      url: "https://github.com/cloudflare/sandbox",
      stackLevel: 3,
      repoType: "dependency",
      language: "TypeScript",
    },
    "mcp-sdk": {
      title: "MCP SDK",
      url: "https://github.com/modelcontextprotocol/typescript-sdk",
      stackLevel: 3,
      repoType: "dependency",
      language: "TypeScript",
    },
    "supabase-js": {
      title: "Supabase JS",
      url: "https://github.com/supabase/supabase-js",
      stackLevel: 3,
      repoType: "dependency",
      language: "TypeScript",
    },
    "riverpod": {
      title: "Riverpod",
      url: "https://github.com/rrousselGit/riverpod",
      stackLevel: 3,
      repoType: "dependency",
      language: "Dart",
    },

    // L2: Frameworks (dependency)
    "hono": {
      title: "Hono",
      url: "https://github.com/honojs/hono",
      stackLevel: 2,
      repoType: "dependency",
      language: "TypeScript",
    },
    "react": {
      title: "React",
      url: "https://github.com/facebook/react",
      stackLevel: 2,
      repoType: "dependency",
      language: "JavaScript",
    },
    "flutter": {
      title: "Flutter",
      url: "https://github.com/flutter/flutter",
      stackLevel: 2,
      repoType: "dependency",
      language: "Dart",
    },
    "flutter-map": {
      title: "flutter_map",
      url: "https://github.com/fleaflet/flutter_map",
      stackLevel: 2,
      repoType: "dependency",
      language: "Dart",
    },
    "astro": {
      title: "Astro",
      url: "https://github.com/withastro/astro",
      stackLevel: 2,
      repoType: "dependency",
      language: "TypeScript",
    },
    "starlight": {
      title: "Starlight",
      url: "https://github.com/withastro/starlight",
      stackLevel: 2,
      repoType: "dependency",
      language: "TypeScript",
      dependsOn: ["astro"],
    },
    "vite": {
      title: "Vite",
      url: "https://github.com/vitejs/vite",
      stackLevel: 2,
      repoType: "dependency",
      language: "TypeScript",
    },

    // L1: Runtime (dependency)
    "workerd": {
      title: "workerd",
      url: "https://github.com/cloudflare/workerd",
      stackLevel: 1,
      repoType: "dependency",
      language: "C++",
    },
    "node": {
      title: "Node.js",
      url: "https://github.com/nodejs/node",
      stackLevel: 1,
      repoType: "dependency",
      language: "C++",
    },
    "dart-vm": {
      title: "Dart VM",
      url: "https://github.com/dart-lang/sdk",
      stackLevel: 1,
      repoType: "dependency",
      language: "C++",
    },
  },

  // ==========================================================================
  // THESIS - why we exist, justified by capabilities
  // ==========================================================================
  thesis: {
    "agent-native-platform": {
      title: "Agent-native execution is the platform shift",
      justifiedBy: ["smartbox", "nomos-domain-api"],
    },
  },

  // ==========================================================================
  // RUMELT'S GOOD STRATEGY FRAMEWORK
  // ==========================================================================

  // CONSTRAINTS - hard facts that limit action
  constraints: {
    "no-audience": {
      title: "No Audience",
      severity: "hard",
      category: "distribution",
    },
    "single-founder": {
      title: "Single Founder",
      severity: "hard",
      category: "team",
    },
    "limited-capital": {
      title: "Limited Capital",
      severity: "soft",
      category: "capital",
    },
  },

  // PROXY METRICS - leading indicators that predict gate success
  proxyMetrics: {
    "posts-per-week": {
      title: "Posts Per Week",
      currentValue: 0,
      targetValue: 1,
      frequency: "weekly",
      unit: "posts",
    },
    "engagement-per-post": {
      title: "Engagement Per Post",
      currentValue: 0,
      targetValue: 25,
      frequency: "weekly",
      unit: "engagements",
    },
    "internal-usage-hours": {
      title: "Internal Usage Hours",
      currentValue: 0,
      targetValue: 10,
      frequency: "weekly",
      unit: "hours",
    },
    "commands-per-session": {
      title: "Commands Per Session",
      currentValue: 0,
      targetValue: 15,
      frequency: "daily",
      unit: "commands",
    },
  },

  // COMPETENCIES - what we can demonstrably do, with evidence
  competencies: {
    "cloudflare-native-dev": {
      title: "Cloudflare Native Development",
      evidencedBy: ["shipbox", "sandbox-mcp"],
    },
    "event-sourcing-patterns": {
      title: "Event Sourcing Patterns",
      evidencedBy: ["nomos-dart"],
    },
  },

  // DIAGNOSES - the critical challenge we face
  diagnoses: {
    "distribution-cold-start": {
      title: "Distribution Cold Start",
      evidencedBy: ["execution-team-capacity", "market-timing"],
      constrainedBy: ["no-audience", "single-founder", "limited-capital"],
    },
  },

  // ACTION GATES - proximate objectives with pass/fail criteria
  actionGates: {
    "internal-daily-use": {
      title: "Internal Daily Use",
      action: "Use SmartBox ourselves for 10+ hours/week of productive work",
      passCriteria: [
        "10+ hours per week tracked",
        "Using for actual development, not testing",
        "Replacing other tools, not supplementing",
      ],
      proxyMetrics: ["internal-usage-hours", "commands-per-session"],
    },
    "first-external-user": {
      title: "First External User",
      action: "Get one person outside the team to complete a real task in SmartBox",
      passCriteria: [
        "User completes task independently",
        "Task was a real need, not a favour",
        "User provides honest feedback",
      ],
      proxyMetrics: ["commands-per-session"],
      blockedBy: ["internal-daily-use"],
    },
    "first-100-followers": {
      title: "First 100 Followers",
      action: "Publish 10 technical posts about Cloudflare Workers and grow to 100 followers",
      passCriteria: [
        "100+ engaged followers",
        "10+ substantive technical posts published",
        "3+ posts with 50+ meaningful engagements",
      ],
      proxyMetrics: ["posts-per-week", "engagement-per-post"],
    },
  },

  // GUIDING POLICIES - our chosen approach to address the diagnosis
  guidingPolicies: {
    "dogfood-first": {
      title: "Dogfood First",
      addressesDiagnosis: "distribution-cold-start",
      leveragesCompetencies: ["cloudflare-native-dev", "event-sourcing-patterns"],
      worksAroundConstraints: ["no-audience", "single-founder"],
    },
    "build-in-public": {
      title: "Build In Public",
      addressesDiagnosis: "distribution-cold-start",
      leveragesCompetencies: ["cloudflare-native-dev", "event-sourcing-patterns"],
      worksAroundConstraints: ["no-audience", "limited-capital"],
    },
  },

  // ==========================================================================
  // ASSUMPTIONS - documented hypotheses underpinning the plan
  // ==========================================================================
  assumptions: {
    // Market assumptions
    "agents-need-sandboxes": {
      title: "Agents Need Sandboxes",
      statement: "AI agents executing code need isolated, capability-scoped environments rather than running directly on user machines or in shared infrastructure.",
      category: "market",
      status: "untested",
      testMethod: "Customer discovery interviews with AI developers; analysis of agent failure modes in production systems.",
      validationCriteria: [
        "5+ enterprise teams cite isolation as a blocker",
        "Security incidents in agent systems make news",
        "Competitors emerge in sandbox space",
      ],
      invalidationCriteria: [
        "Major agent frameworks ship without isolation",
        "No security incidents despite widespread agent deployment",
        "Enterprises comfortable with direct execution",
      ],
      confidence: 70,
      reviewFrequency: "monthly",
      dependentProducts: ["smartboxes"],
      relatedRisks: ["market-timing"],
    },
    "developers-will-pay-for-sandboxes": {
      title: "Developers Will Pay For Sandboxes",
      statement: "Developers and AI-native companies will pay for managed sandbox infrastructure rather than building their own.",
      category: "customer",
      status: "untested",
      testMethod: "Pricing experiments; competitor analysis; customer interviews on build vs. buy decisions.",
      validationCriteria: [
        "3+ paying customers at target price point",
        "Build vs. buy analysis favours managed solution",
        "Churn rate under 5% monthly",
      ],
      invalidationCriteria: [
        "Customers consistently build in-house",
        "Open source solutions adequate",
        "Price sensitivity prevents viable unit economics",
      ],
      confidence: 50,
      reviewFrequency: "monthly",
      dependentProducts: ["smartboxes"],
      dependentMilestones: ["smartbox-revenue"],
    },
    "cloudflare-cost-structure": {
      title: "Cloudflare Cost Structure Works",
      statement: "Cloudflare's pricing model (Workers, Durable Objects, R2) will remain cost-competitive for our workload patterns and unit economics.",
      category: "financial",
      status: "testing",
      testMethod: "Track actual costs as usage scales; model break-even points; monitor Cloudflare pricing announcements.",
      validationCriteria: [
        "Gross margin over 70% at scale",
        "No pricing changes that break model",
        "Costs scale sub-linearly with usage",
      ],
      invalidationCriteria: [
        "Cloudflare raises prices by over 50%",
        "Workload patterns hit expensive tiers",
        "Gross margin under 50% at projected scale",
      ],
      currentEvidence: [
        "Current dev costs within projections",
        "Workers pricing stable for 2+ years",
      ],
      confidence: 75,
      reviewFrequency: "quarterly",
      dependentProducts: ["smartboxes", "nomos-cloud"],
      relatedRisks: ["supplier-concentration"],
    },
    "content-marketing-works": {
      title: "Content Marketing Works For Us",
      statement: "Technical content about edge computing and agent infrastructure will generate qualified leads for our products.",
      category: "market",
      status: "untested",
      testMethod: "Publish content; track engagement, followers, and conversion to signups.",
      validationCriteria: [
        "100+ engaged followers from content",
        "10%+ of signups cite content as discovery source",
        "Content generates inbound inquiries",
      ],
      invalidationCriteria: [
        "6 months of publishing with fewer than 50 followers",
        "Zero conversions from content",
        "Engagement metrics consistently poor",
      ],
      confidence: 40,
      reviewFrequency: "monthly",
      relatedRisks: ["execution-team-capacity"],
    },
    "market-timing-right": {
      title: "Market Timing Is Right",
      statement: "The market for agent infrastructure is emerging now, and we're early enough to establish position but not so early that we'll exhaust runway waiting.",
      category: "market",
      status: "untested",
      testMethod: "Track agent adoption curves; monitor competitor funding; assess customer urgency in sales conversations.",
      validationCriteria: [
        "Competitors raising significant funding",
        "Customers have budget allocated for agent tooling",
        "Urgent demand in discovery calls",
      ],
      invalidationCriteria: [
        "Customers say 'maybe next year'",
        "No competitor activity for 12+ months",
        "Agent hype cycle crashes",
      ],
      confidence: 60,
      reviewFrequency: "quarterly",
      dependentProducts: ["smartboxes", "nomos-cloud", "murphy", "p4gent"],
      relatedRisks: ["market-timing"],
    },
    "non-devs-want-ai-tools": {
      title: "Non-Developers Want AI Tools",
      statement: "Non-technical users (SMB founders, operators) will want and use AI-powered tools that currently require developer skills.",
      category: "customer",
      status: "untested",
      testMethod: "User research with non-technical founders; beta testing with SMB operators; analysis of no-code AI tool adoption.",
      validationCriteria: [
        "Non-devs complete onboarding without support",
        "Weekly active use by non-technical users",
        "Word-of-mouth referrals from non-dev users",
      ],
      invalidationCriteria: [
        "Non-devs consistently fail onboarding",
        "Usage concentrated in developer segment",
        "Support burden from non-devs unsustainable",
      ],
      confidence: 55,
      reviewFrequency: "monthly",
      dependentProducts: ["smartboxes", "p4gent"],
    },
    "agencies-feel-delivery-pain": {
      title: "Agencies Feel Delivery Pain",
      statement: "Digital agencies and consultancies experience significant pain around project delivery prediction, and would pay for a solution.",
      category: "customer",
      status: "untested",
      testMethod: "Discovery calls with agency owners; analysis of agency failure modes; competitive research on project management tools.",
      validationCriteria: [
        "5+ agencies express strong interest",
        "Willingness to pay at target price point",
        "Pain point ranked in top 3 challenges",
      ],
      invalidationCriteria: [
        "Agencies satisfied with existing tools",
        "Delivery prediction not a priority",
        "Price sensitivity prevents viable business",
      ],
      confidence: 45,
      reviewFrequency: "monthly",
      dependentProducts: ["murphy"],
      dependentMilestones: ["murphy-alpha", "murphy-revenue"],
    },
    "audit-trails-required": {
      title: "Audit Trails Will Be Required",
      statement: "As AI agents make autonomous decisions in production, enterprises will require comprehensive audit trails for compliance, debugging, and governance.",
      category: "market",
      status: "untested",
      testMethod: "Monitor regulatory developments; enterprise customer interviews; analysis of AI governance frameworks.",
      validationCriteria: [
        "Regulatory guidance mandates audit trails",
        "Enterprise RFPs require audit capabilities",
        "Compliance teams blocking agent deployment without trails",
      ],
      invalidationCriteria: [
        "Regulations remain silent on agent observability",
        "Enterprises deploy agents without governance",
        "Audit trails seen as optional nice-to-have",
      ],
      confidence: 65,
      reviewFrequency: "quarterly",
      dependentProducts: ["nomos-cloud"],
      dependentMilestones: ["nomos-revenue", "nomos-enterprise"],
      relatedRisks: ["regulatory-ai-autonomy"],
    },
    "can-ship-fast-enough": {
      title: "Can Ship Fast Enough",
      statement: "A single founder with AI assistance can ship four products fast enough to test them before runway exhausts.",
      category: "operational",
      status: "testing",
      testMethod: "Track actual shipping velocity against plan; measure AI productivity gains; monitor runway burn.",
      validationCriteria: [
        "MVP shipped within 2x planned timeline",
        "AI tools providing measurable productivity boost",
        "Runway extends to validation point",
      ],
      invalidationCriteria: [
        "Shipping takes over 3x planned time",
        "AI assistance doesn't improve velocity",
        "Runway exhausts before validation",
      ],
      currentEvidence: [
        "Graph-of-plan shipped with AI assistance",
        "Shipbox prototype functional",
      ],
      confidence: 60,
      reviewFrequency: "weekly",
      relatedRisks: ["execution-team-capacity"],
    },
    "plg-works-for-infra": {
      title: "PLG Works For Infrastructure",
      statement: "Product-led growth (self-serve signup, usage-based expansion) will work for developer infrastructure products like SmartBoxes and Nomos Cloud.",
      category: "market",
      status: "untested",
      testMethod: "Track self-serve conversion rates; analyse expansion revenue patterns; compare to PLG benchmarks.",
      validationCriteria: [
        "Self-serve signup rate over 100/month",
        "Trial-to-paid conversion over 5%",
        "Net revenue retention over 100%",
      ],
      invalidationCriteria: [
        "All deals require sales touch",
        "Self-serve churn over 20% monthly",
        "CAC payback over 18 months",
      ],
      confidence: 50,
      reviewFrequency: "monthly",
      dependentProducts: ["smartboxes", "nomos-cloud"],
      dependentMilestones: ["smartbox-beta", "nomos-beta"],
    },
  },

  // ==========================================================================
  // DECISIONS - strategic choices made under scarcity
  // ==========================================================================
  decisions: {
    "cloudflare-first": {
      title: "Cloudflare-First Architecture",
      context: "We need to choose a cloud platform to build on. The options are traditional cloud (AWS/GCP/Azure), edge-native (Cloudflare), or multi-cloud.",
      category: "technical",
      status: "active",
      alternatives: [
        { option: "AWS/GCP/Azure", rationale: "Higher complexity, longer lock-in, but more mature ecosystem" },
        { option: "Multi-cloud", rationale: "Higher complexity, longer time to market, uncertain benefit" },
        { option: "Self-hosted", rationale: "Not viable for our scale and capital constraints" },
      ],
      choice: "Build on Cloudflare Workers, Durable Objects, R2, and D1 as our primary infrastructure.",
      rationale: "Cloudflare offers (1) cost structure aligned with usage-based pricing, (2) global edge deployment by default, (3) simpler mental model than traditional cloud, (4) strong DX with Wrangler. We accept the risk of smaller ecosystem.",
      tradeoffs: [
        "Smaller ecosystem than AWS/GCP",
        "Less flexibility in compute (no GPUs, limited runtime)",
        "Single vendor dependency",
        "Some enterprise features less mature",
      ],
      reversalTriggers: [
        "Cloudflare pricing becomes uncompetitive (over 2x equivalent AWS)",
        "Critical capability gap that blocks product development",
        "Cloudflare reliability issues affecting customers",
        "Enterprise customers require specific cloud compliance",
      ],
      reviewDate: "2025-06-01",
      dependsOnAssumptions: ["cloudflare-cost-structure"],
      affectedProducts: ["smartboxes", "nomos-cloud", "murphy", "p4gent"],
    },
    "credits-over-subscription": {
      title: "Credits Over Subscription",
      context: "SmartBoxes needs a pricing model. Options are traditional SaaS subscription, usage-based (pay-as-you-go), or prepaid credits.",
      category: "commercial",
      status: "active",
      alternatives: [
        { option: "Monthly subscription", rationale: "Predictable revenue but misaligned with variable value delivery" },
        { option: "Pure usage-based", rationale: "Risk of bill shock, harder to predict revenue" },
      ],
      choice: "Prepaid credits model where users top up credits that are consumed by usage.",
      rationale: "Credits (1) align payment with value delivered, (2) avoid bill shock since users can't overspend, (3) provide revenue predictability via prepayments, (4) create natural pause points rather than churn. PAYG feels fairer for a power tool with variable usage.",
      tradeoffs: [
        "Less predictable MRR than subscription",
        "Need to manage credit balances and top-up UX",
        "May attract lower-commitment users",
        "Harder to compare to subscription competitors",
      ],
      reversalTriggers: [
        "Credit fatigue: users complain about top-up friction",
        "Revenue unpredictability makes planning impossible",
        "Competitors win on subscription simplicity",
        "Unit economics require minimum commitment",
      ],
      reviewDate: "2025-04-01",
      dependsOnAssumptions: ["developers-will-pay-for-sandboxes"],
      affectedProducts: ["smartboxes"],
      affectedMilestones: ["smartbox-revenue"],
    },
    "smartboxes-first": {
      title: "SmartBoxes First",
      context: "We have four product ideas (SmartBoxes, Murphy, P4gent, Nomos Cloud). Need to choose which to launch first given single-founder constraints.",
      category: "sequencing",
      status: "active",
      alternatives: [
        { option: "Murphy first", rationale: "Clearer ICP (agencies) but requires more domain expertise" },
        { option: "Nomos Cloud first", rationale: "Higher enterprise value but longer sales cycle" },
        { option: "P4gent first", rationale: "Simpler product but smaller market" },
        { option: "Parallel development", rationale: "Spreads risk but dilutes focus" },
      ],
      choice: "Launch SmartBoxes first, use it to build audience and revenue, then sequence other products.",
      rationale: "SmartBoxes (1) can be used to build itself (dogfooding), (2) targets a broad market (developers + non-devs), (3) generates content naturally (AI agent stories), (4) has lowest sales complexity. It's also the most 'horizontal' product.",
      tradeoffs: [
        "Murphy may have faster path to revenue with clearer buyer",
        "Enterprise Nomos deals could be larger",
        "Opportunity cost if SmartBoxes market smaller than expected",
        "May not build enterprise muscle needed for Nomos",
      ],
      reversalTriggers: [
        "SmartBoxes market validation fails after 6 months",
        "Inbound demand emerges for different product",
        "Strategic partnership requires different product",
        "Competition makes SmartBoxes untenable",
      ],
      reviewDate: "2025-06-01",
      dependsOnAssumptions: ["agents-need-sandboxes", "non-devs-want-ai-tools", "plg-works-for-infra"],
      affectedProducts: ["smartboxes", "murphy", "nomos-cloud", "p4gent"],
      affectedMilestones: ["smartbox-mvp", "smartbox-beta"],
    },
    "dogfood-before-selling": {
      title: "Dogfood Before Selling",
      context: "We could start selling SmartBoxes immediately or use it ourselves first. Need to decide how to validate the product.",
      category: "operational",
      status: "active",
      alternatives: [
        { option: "Immediate beta release", rationale: "Faster revenue but risk of poor first impressions" },
        { option: "Paid alpha with early adopters", rationale: "Revenue earlier but requires support capacity" },
      ],
      choice: "Use SmartBoxes ourselves for real work for at least 4 weeks before inviting external users.",
      rationale: "Dogfooding (1) validates the product with a real use case, (2) generates authentic content and case studies, (3) finds bugs before customers do, (4) builds conviction in the product. We can't sell what we don't use.",
      tradeoffs: [
        "Delays time to first external user",
        "May over-optimise for our own use case",
        "Risk of building in bubble",
        "Revenue starts later",
      ],
      reversalTriggers: [
        "4 weeks passes without meaningful internal use",
        "External demand too strong to delay",
        "Internal use case too different from target market",
        "Runway constraints require faster revenue",
      ],
      reviewDate: "2025-03-15",
      dependsOnAssumptions: ["can-ship-fast-enough"],
      affectedProducts: ["smartboxes"],
      affectedMilestones: ["smartbox-mvp"],
    },
  },
});
