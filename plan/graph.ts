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
        // Cloudflare backend (nomos-router)
        "cf-workers",
        "cf-durable-objects",
        "cf-r2",
        "cf-d1",
        "cf-queues",
        "cf-workflows",
        // Firebase backend (nomos_persistence)
        "firebase-firestore",
        "firebase-storage",
        "firebase-functions",
        "firebase-auth",
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
    // Nomos Cloud milestones
    "nomos-internal": {
      title: "Nomos Internal Use",
      expectedRevenue: 0,
      expectedCosts: 2000,
      dependsOnMilestones: ["smartbox-mvp"],
      dependsOnCapabilities: ["nomos-domain-api"],
      products: ["nomos-cloud"],
      timelines: {
        expected: { startMonth: 4, durationMonths: 4, included: true },
        aggressive: { startMonth: 2, durationMonths: 2, included: true },
        speedOfLight: { startMonth: 1, durationMonths: 2, included: true },
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
        expected: { startMonth: 8, durationMonths: 5, included: true },
        aggressive: { startMonth: 4, durationMonths: 3, included: true },
        speedOfLight: { startMonth: 3, durationMonths: 2, included: true },
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
        expected: { startMonth: 13, durationMonths: 6, included: true },
        aggressive: { startMonth: 7, durationMonths: 4, included: true },
        speedOfLight: { startMonth: 5, durationMonths: 3, included: true },
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
        expected: { startMonth: 19, durationMonths: 10, included: true },
        aggressive: { startMonth: 11, durationMonths: 6, included: true },
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
  // THESIS - why we exist, justified by capabilities
  // ==========================================================================
  thesis: {
    "agent-native-platform": {
      title: "Agent-native execution is the platform shift",
      justifiedBy: ["smartbox", "nomos-domain-api"],
    },
  },
});
