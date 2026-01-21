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
  // COMPETITORS - competing products
  // ==========================================================================
  competitors: {
    // SmartBoxes competitors
    "cursor": "Cursor",
    "replit": "Replit Agent",
    // Murphy competitors
    "linear": "Linear",
    "forecast-app": "Forecast.app",
    // P4gent competitors
    "ramp": "Ramp",
    "brex": "Brex",
    // Nomos Cloud competitors
    "langsmith": "LangSmith",
    "helicone": "Helicone",
  },

  // ==========================================================================
  // RISKS - threats mitigated by primitives
  // ==========================================================================
  risks: {
    "autonomy-blast-radius": {
      title: "Autonomy increases blast radius",
      mitigatedBy: ["capability-scoped-exec"],
    },
    "model-degradation": {
      title: "Model degradation",
      mitigatedBy: ["snapshot-materialisation"], // Abstraction layer helps swap models
    },
    "regulatory-ai-autonomy": {
      title: "Regulatory: AI autonomy rules tightening",
      mitigatedBy: ["capability-scoped-exec"], // Configurable autonomy levels
    },
    "competitive-big-tech": {
      title: "Competitive: Big tech enters agent infrastructure",
      mitigatedBy: [], // Business strategy risk - no technical mitigation
    },
    "execution-team-capacity": {
      title: "Execution: One team, many products",
      mitigatedBy: [], // Operational risk - no technical mitigation
    },
    "supplier-concentration": {
      title: "Supplier concentration: Cloudflare/Anthropic dependency",
      mitigatedBy: [], // Supplier risk - no technical mitigation
    },
    "market-timing": {
      title: "Market timing: Is the market ready for agent-native?",
      mitigatedBy: [], // Market risk - no technical mitigation
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
  // THESIS - why we exist, justified by capabilities
  // ==========================================================================
  thesis: {
    "agent-native-platform": {
      title: "Agent-native execution is the platform shift",
      justifiedBy: ["smartbox", "nomos-domain-api"],
    },
  },
});
