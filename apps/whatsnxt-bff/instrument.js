// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
    dsn: "https://dcecc7d4c848bcfc5e76526ccafd687f@o4508515139518464.ingest.de.sentry.io/4508559334572112",
    integrations: [
        nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
});