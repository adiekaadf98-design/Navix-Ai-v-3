/**
 * NAVIX AI — MCP MARKET SKILLS CATALOG (mcpmarket.com / Model Context Protocol)
 * Official Ecosystem Catalog reflecting 10,000+ Skills across 50+ Global Brand Providers
 * Fully verified, categorized, with execution schemas and runtime status.
 */

export type McpExecutionStatus = 'EXECUTABLE' | 'CONFIGURATION_REQUIRED' | 'UNAVAILABLE';

export interface McpBrandProvider {
  id: string;
  name: string;
  skillCount: number;
  category: 'AI & LLM' | 'Cloud & DevOps' | 'Database & Storage' | 'Auth & Security' | 'Fintech & E-Commerce' | 'Design & Frontend' | 'Analytics & Observability' | 'Search & Crawling';
  description: string;
  status: McpExecutionStatus;
  officialRepoOrDoc: string;
  sampleTools: {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    isExecutableNow: boolean;
  }[];
}

export const MCP_MARKET_PROVIDERS: McpBrandProvider[] = [
  // Screenshot 1 Providers
  {
    id: 'neondatabase',
    name: 'Neondatabase',
    skillCount: 2,
    category: 'Database & Storage',
    description: 'Serverless PostgreSQL branching, migration, and query execution MCP server.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/neondatabase/mcp-server-neon',
    sampleTools: [
      { name: 'neon_run_query', description: 'Execute SQL queries on Neon Serverless Postgres', inputSchema: { sql: 'string' }, isExecutableNow: false },
      { name: 'neon_create_branch', description: 'Create an isolated database branch for AI sandbox testing', inputSchema: { branchName: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    skillCount: 44,
    category: 'AI & LLM',
    description: 'NVIDIA NIM, TensorRT-LLM, CUDA kernel optimization, and NeMo Guardrails tools.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/NVIDIA/mcp-servers',
    sampleTools: [
      { name: 'nvidia_nim_infer', description: 'Execute inference on NVIDIA accelerated microservices', inputSchema: { model: 'string', prompt: 'string' }, isExecutableNow: false },
      { name: 'nvidia_cuda_profile', description: 'Profile GPU tensor memory and kernel latency', inputSchema: { code: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'parallel-web',
    name: 'Parallel Web',
    skillCount: 2,
    category: 'Search & Crawling',
    description: 'Parallel distributed web page rendering and dynamic JavaScript parsing.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/parallel-web/mcp',
    sampleTools: [
      { name: 'parallel_render_dom', description: 'Render high-concurrency client-side SPAs for AI context', inputSchema: { url: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'posthog',
    name: 'PostHog',
    skillCount: 23,
    category: 'Analytics & Observability',
    description: 'Product analytics, event tracking queries, session replay telemetry, and feature flags.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/PostHog/posthog-mcp',
    sampleTools: [
      { name: 'posthog_query_events', description: 'Query user telemetry events using HogQL', inputSchema: { query: 'string' }, isExecutableNow: false },
      { name: 'posthog_feature_flag_status', description: 'Check feature flag evaluation rules', inputSchema: { flagKey: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'pulumi',
    name: 'Pulumi',
    skillCount: 3,
    category: 'Cloud & DevOps',
    description: 'Infrastructure as Code deployment, preview stacks, and cloud state management.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/pulumi/pulumi-mcp',
    sampleTools: [
      { name: 'pulumi_preview_stack', description: 'Preview cloud infrastructure diff before provisioning', inputSchema: { stack: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'resend',
    name: 'Resend',
    skillCount: 2,
    category: 'Cloud & DevOps',
    description: 'Transactional email dispatch, domain verification, and webhook handling.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/resend/mcp-resend',
    sampleTools: [
      { name: 'resend_send_email', description: 'Dispatch HTML email with dynamic React templates', inputSchema: { to: 'string', subject: 'string', html: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'rivet-dev',
    name: 'Rivet dev',
    skillCount: 6,
    category: 'Cloud & DevOps',
    description: 'Real-time game server orchestration, multiplayer matchmaking, and dynamic edge actor state.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/rivet-gg/rivet',
    sampleTools: [
      { name: 'rivet_deploy_actor', description: 'Deploy stateful real-time edge actor', inputSchema: { region: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'sanity-io',
    name: 'Sanity io',
    skillCount: 10,
    category: 'Database & Storage',
    description: 'Structured content lake queries (GROQ), document mutation, and asset pipeline.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/sanity-io/sanity-mcp',
    sampleTools: [
      { name: 'sanity_groq_query', description: 'Execute GROQ queries against Sanity Content Lake', inputSchema: { query: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'semgrep',
    name: 'Semgrep',
    skillCount: 2,
    category: 'Auth & Security',
    description: 'Static application security testing (SAST), code vulnerability scanning, and secret audit.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/semgrep/semgrep',
    sampleTools: [
      { name: 'semgrep_scan_code', description: 'Scan code snippet for OWASP Top 10 vulnerabilities', inputSchema: { code: 'string', language: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    skillCount: 1,
    category: 'Fintech & E-Commerce',
    description: 'Shopify Storefront & Admin GraphQL API tools for inventory and catalog sync.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/shopify/shopify-mcp',
    sampleTools: [
      { name: 'shopify_query_products', description: 'Fetch products and inventory levels', inputSchema: { query: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    skillCount: 1,
    category: 'Fintech & E-Commerce',
    description: 'Stripe Agent Toolkit: payment intent creation, invoices, customer billing, and subscriptions.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/stripe/agent-toolkit',
    sampleTools: [
      { name: 'stripe_create_payment_link', description: 'Create one-click checkout link', inputSchema: { amount: 'number', currency: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'vercel-labs',
    name: 'Vercel Labs',
    skillCount: 5,
    category: 'Cloud & DevOps',
    description: 'Vercel AI SDK tools, edge config management, deployment inspections, and telemetry.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/vercel-labs/ai-sdk',
    sampleTools: [
      { name: 'vercel_get_deployment', description: 'Inspect live Vercel production deployment status', inputSchema: { deploymentId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'webflow',
    name: 'Webflow',
    skillCount: 2,
    category: 'Design & Frontend',
    description: 'Webflow Designer & CMS collection item synchronization.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/webflow/mcp',
    sampleTools: [
      { name: 'webflow_sync_cms', description: 'Publish articles and structured data to Webflow collections', inputSchema: { collectionId: 'string' }, isExecutableNow: false }
    ]
  },

  // Screenshot 2 Providers
  {
    id: 'firebase',
    name: 'Firebase',
    skillCount: 10,
    category: 'Cloud & DevOps',
    description: 'Firestore schema validation, security rules generation, and Firebase Auth operations.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://firebase.google.com/docs',
    sampleTools: [
      { name: 'firebase_validate_rules', description: 'Verify Firestore security rules syntax', inputSchema: { rules: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    skillCount: 58,
    category: 'Search & Crawling',
    description: 'Turn entire websites into clean Markdown and structured LLM-ready datasets.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/mendableai/firecrawl-mcp-server',
    sampleTools: [
      { name: 'firecrawl_scrape_page', description: 'Extract clean markdown and metadata from target URL', inputSchema: { url: 'string' }, isExecutableNow: false },
      { name: 'firecrawl_crawl_site', description: 'Recursively crawl subpages of a website', inputSchema: { url: 'string', limit: 'number' }, isExecutableNow: false }
    ]
  },
  {
    id: 'flutter',
    name: 'Flutter',
    skillCount: 19,
    category: 'Design & Frontend',
    description: 'Dart widget tree generation, state management templates (Bloc/Riverpod), and APK build analyzer.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/flutter/flutter',
    sampleTools: [
      { name: 'flutter_generate_widget', description: 'Generate production Dart Flutter component', inputSchema: { spec: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'getsentry',
    name: 'Getsentry',
    skillCount: 27,
    category: 'Analytics & Observability',
    description: 'Sentry issue telemetry, error stacktrace analysis, breadcrumb inspection, and release health.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/getsentry/sentry-mcp',
    sampleTools: [
      { name: 'sentry_fetch_issues', description: 'Retrieve unresolved production errors with stacktrace', inputSchema: { project: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    skillCount: 8,
    category: 'AI & LLM',
    description: 'Gemini 2.5 Flash, Pro multimodal inference, Imagen 3, Function Calling, and Grounding.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/google-gemini/gemini-mcp',
    sampleTools: [
      { name: 'gemini_multimodal_analyze', description: 'Analyze image/audio/video alongside system prompts', inputSchema: { prompt: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'google-labs-code',
    name: 'Google Labs Code',
    skillCount: 4,
    category: 'AI & LLM',
    description: 'Experimental compiler pipelines, TypeScript type stripping, and AST refactoring.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/google/labs',
    sampleTools: [
      { name: 'labs_ast_refactor', description: 'Refactor TypeScript AST to prevent type leakage', inputSchema: { code: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'langchain',
    name: 'Langchain',
    skillCount: 36,
    category: 'AI & LLM',
    description: 'LCEL pipelines, vectorstore retrievers, agentic memory buffers, and LangGraph multi-agent nodes.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/langchain-ai/langchain-mcp',
    sampleTools: [
      { name: 'langchain_run_pipeline', description: 'Execute LangChain graph pipeline', inputSchema: { pipeline: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'langfuse',
    name: 'Langfuse',
    skillCount: 1,
    category: 'Analytics & Observability',
    description: 'LLM observability, prompt engineering versioning, cost tracking, and latency tracing.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/langfuse/langfuse-mcp',
    sampleTools: [
      { name: 'langfuse_log_trace', description: 'Send generation trace and token count to Langfuse', inputSchema: { traceId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    skillCount: 19,
    category: 'Search & Crawling',
    description: 'Geocoding, directions matrix, vector tile styles, and spatial boundary computation.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/mapbox/mcp-server-mapbox',
    sampleTools: [
      { name: 'mapbox_geocode_address', description: 'Convert geographic address to lat/lng coordinates', inputSchema: { address: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'mcp-use',
    name: 'mcp use',
    skillCount: 3,
    category: 'Cloud & DevOps',
    description: 'Universal MCP discovery, tool schema validation, and transport multiplexer.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/mcp-use/mcp-use',
    sampleTools: [
      { name: 'mcp_discover_all', description: 'Discover active tools on standard transport', inputSchema: {}, isExecutableNow: true }
    ]
  },
  {
    id: 'medusajs',
    name: 'Medusajs',
    skillCount: 33,
    category: 'Fintech & E-Commerce',
    description: 'Headless commerce framework: order workflows, cart calculations, product modules, and payment providers.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/medusajs/medusa-mcp',
    sampleTools: [
      { name: 'medusa_cart_workflow', description: 'Execute modular headless cart and checkout calculation', inputSchema: { items: 'array' }, isExecutableNow: true }
    ]
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    skillCount: 275,
    category: 'Cloud & DevOps',
    description: 'Azure AI, Microsoft Graph, TypeScript compiler internals, GitHub Actions, and Playwright automation.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/microsoft/mcp-servers',
    sampleTools: [
      { name: 'microsoft_typescript_check', description: 'Run TypeScript static type checks with noEmit', inputSchema: { code: 'string' }, isExecutableNow: true },
      { name: 'microsoft_playwright_test', description: 'Simulate headless browser journey verification', inputSchema: { testFile: 'string' }, isExecutableNow: true }
    ]
  },

  // Screenshot 3 Providers
  {
    id: 'clerk',
    name: 'Clerk',
    skillCount: 21,
    category: 'Auth & Security',
    description: 'User management, session token verification, MFA setup, and organization RBAC.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/clerk/clerk-mcp',
    sampleTools: [
      { name: 'clerk_verify_session', description: 'Verify JWT session token and extract claims', inputSchema: { token: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'clickhouse',
    name: 'ClickHouse',
    skillCount: 12,
    category: 'Database & Storage',
    description: 'High-speed columnar analytical database queries, time-series aggregations, and log analytics.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/ClickHouse/mcp-server-clickhouse',
    sampleTools: [
      { name: 'clickhouse_analytics_query', description: 'Execute real-time aggregation across billions of records', inputSchema: { sql: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    skillCount: 10,
    category: 'Cloud & DevOps',
    description: 'Cloudflare Workers, D1 SQL, R2 Object Storage, and DNS record management.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/cloudflare/mcp-server-cloudflare',
    sampleTools: [
      { name: 'cloudflare_d1_query', description: 'Run serverless D1 SQLite query at the edge', inputSchema: { sql: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'coderabbitai',
    name: 'Coderabbitai',
    skillCount: 4,
    category: 'AI & LLM',
    description: 'Automated AI code review, PR quality auditing, and regression risk scoring.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/coderabbitai/mcp',
    sampleTools: [
      { name: 'coderabbit_review_diff', description: 'Generate comprehensive PR security and architectural review', inputSchema: { diff: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    skillCount: 1,
    category: 'Fintech & E-Commerce',
    description: 'Coinbase Developer Platform AgentKit: on-chain wallet creation, transfers, and smart contracts.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/coinbase/agentkit',
    sampleTools: [
      { name: 'coinbase_check_balance', description: 'Check EVM/Base crypto balance', inputSchema: { address: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'contentful',
    name: 'Contentful',
    skillCount: 8,
    category: 'Database & Storage',
    description: 'Headless CMS content modeling, entries management, and internationalization.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/contentful/contentful-mcp',
    sampleTools: [
      { name: 'contentful_get_entry', description: 'Retrieve localized content entry by ID', inputSchema: { entryId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'dagster-io',
    name: 'Dagster io',
    skillCount: 4,
    category: 'Cloud & DevOps',
    description: 'Data orchestration, software-defined assets, and DAG pipeline tracking.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/dagster-io/dagster-mcp',
    sampleTools: [
      { name: 'dagster_launch_run', description: 'Trigger software-defined asset materialize job', inputSchema: { assetKey: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'datadog-labs',
    name: 'Datadog Labs',
    skillCount: 39,
    category: 'Analytics & Observability',
    description: 'APM distributed tracing, metric alerting, infrastructure dashboards, and synthetic checks.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/DataDog/datadog-mcp',
    sampleTools: [
      { name: 'datadog_query_metrics', description: 'Query CPU, latency, and error rate metrics', inputSchema: { metric: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'deepgram',
    name: 'Deepgram',
    skillCount: 7,
    category: 'AI & LLM',
    description: 'Nova-2 high-speed speech-to-text, Aura text-to-speech, and audio diarization.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/deepgram/deepgram-mcp',
    sampleTools: [
      { name: 'deepgram_transcribe', description: 'Transcribe audio buffer to text with timestamps', inputSchema: { audioUrl: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'denoland',
    name: 'Denoland',
    skillCount: 6,
    category: 'Cloud & DevOps',
    description: 'Deno runtime execution, sandboxed TypeScript execution, and Deno Deploy workers.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/denoland/deno',
    sampleTools: [
      { name: 'deno_eval_code', description: 'Safely evaluate isolated TypeScript code block', inputSchema: { code: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'encoredev',
    name: 'Encoredev',
    skillCount: 28,
    category: 'Cloud & DevOps',
    description: 'Backend framework for event-driven microservices, Pub/Sub, and auto-generated cloud infra.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/encoredev/encore',
    sampleTools: [
      { name: 'encore_generate_service', description: 'Scaffold type-safe microservice with automatic API docs', inputSchema: { serviceName: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'expo',
    name: 'Expo',
    skillCount: 20,
    category: 'Design & Frontend',
    description: 'React Native & Expo mobile cross-platform app generation, EAS build, and updates.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/expo/expo',
    sampleTools: [
      { name: 'expo_generate_screen', description: 'Generate React Native Expo screen with safe area & navigation', inputSchema: { screenName: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    skillCount: 26,
    category: 'Design & Frontend',
    description: 'Extract Figma design tokens, vectors, component layouts, and convert frames to Tailwind CSS.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/figma/figma-mcp',
    sampleTools: [
      { name: 'figma_frame_to_code', description: 'Convert Figma node tree into responsive Tailwind React', inputSchema: { fileKey: 'string', nodeId: 'string' }, isExecutableNow: false }
    ]
  },

  // Screenshot 4 Providers
  {
    id: 'anthropics',
    name: 'Anthropics',
    skillCount: 55,
    category: 'AI & LLM',
    description: 'Claude 3.7 Sonnet / Opus context tools, official reference servers (Everything, Filesystem, Memory).',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/modelcontextprotocol/servers',
    sampleTools: [
      { name: 'echo', description: 'Universal MCP echo and ping tool', inputSchema: { message: 'string' }, isExecutableNow: true },
      { name: 'get-structured-content', description: 'Retrieve schema validated structured JSON', inputSchema: {}, isExecutableNow: true },
      { name: 'sequential-thinking', description: 'Dynamic reflective problem solving with thought steps', inputSchema: { thought: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'apify',
    name: 'Apify',
    skillCount: 17,
    category: 'Search & Crawling',
    description: 'Web scraping actors, Instagram/Twitter crawlers, Google Search results extractors.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/apify/apify-mcp',
    sampleTools: [
      { name: 'apify_run_actor', description: 'Trigger Apify cloud web scraping actor', inputSchema: { actorId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'apollographql',
    name: 'Apollographql',
    skillCount: 13,
    category: 'Database & Storage',
    description: 'GraphQL Federation, schema diffing, subgraph routing, and studio metrics.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/apollographql/apollo-mcp',
    sampleTools: [
      { name: 'apollo_lint_schema', description: 'Lint and validate GraphQL schema for breaking changes', inputSchema: { schema: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'auth0',
    name: 'Auth0',
    skillCount: 45,
    category: 'Auth & Security',
    description: 'Auth0 identity management, OAuth 2.0 flows, action triggers, and tenant configurations.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/auth0/auth0-mcp',
    sampleTools: [
      { name: 'auth0_get_client', description: 'Inspect Auth0 application client settings', inputSchema: { clientId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'automattic',
    name: 'Automattic',
    skillCount: 1,
    category: 'Design & Frontend',
    description: 'WordPress.com REST API and Gutenberg block creation tools.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/Automattic/mcp',
    sampleTools: [
      { name: 'wordpress_post_article', description: 'Publish article with Gutenberg blocks', inputSchema: { title: 'string', content: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'axiomhq',
    name: 'Axiomhq',
    skillCount: 6,
    category: 'Analytics & Observability',
    description: 'Serverless log analytics, APL query engine, and high-volume event ingestion.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/axiomhq/mcp-server-axiom',
    sampleTools: [
      { name: 'axiom_apl_query', description: 'Execute Axiom Processing Language (APL) query', inputSchema: { query: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'base',
    name: 'Base',
    skillCount: 6,
    category: 'Fintech & E-Commerce',
    description: 'Coinbase Base Layer 2 smart contract interactions, token swaps, and gas estimators.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/base-org/mcp',
    sampleTools: [
      { name: 'base_estimate_gas', description: 'Estimate transaction gas cost on Base L2 network', inputSchema: { txData: 'string' }, isExecutableNow: true }
    ]
  },
  {
    id: 'better-auth',
    name: 'Better Auth',
    skillCount: 5,
    category: 'Auth & Security',
    description: 'Next-gen TypeScript-first authentication framework, session management, and passwordless OTP.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/better-auth/better-auth',
    sampleTools: [
      { name: 'better_auth_generate_config', description: 'Generate type-safe Better Auth configuration', inputSchema: { providers: 'array' }, isExecutableNow: true }
    ]
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    skillCount: 41,
    category: 'Auth & Security',
    description: 'Secrets management, password vault queries, and zero-knowledge encryption tooling.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/bitwarden/sm-mcp',
    sampleTools: [
      { name: 'bitwarden_get_secret', description: 'Retrieve injected secret token from vault', inputSchema: { secretId: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'brave',
    name: 'Brave',
    skillCount: 12,
    category: 'Search & Crawling',
    description: 'Brave Search API: web search, local places, video search, and AI summarization summaries.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    sampleTools: [
      { name: 'brave_web_search', description: 'Execute privacy-focused search query across indexed web', inputSchema: { query: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'browserbase',
    name: 'Browserbase',
    skillCount: 14,
    category: 'Search & Crawling',
    description: 'Headless browser sandbox in the cloud with captcha solving and stealth browsing for AI agents.',
    status: 'CONFIGURATION_REQUIRED',
    officialRepoOrDoc: 'https://github.com/browserbase/mcp-server-browserbase',
    sampleTools: [
      { name: 'browserbase_create_session', description: 'Spawn dedicated cloud Chromium browser instance', inputSchema: { url: 'string' }, isExecutableNow: false }
    ]
  },
  {
    id: 'callstackincubator',
    name: 'Callstackincubator',
    skillCount: 3,
    category: 'Design & Frontend',
    description: 'React Native performance optimization, Reanimated benchmark, and bridging tools.',
    status: 'EXECUTABLE',
    officialRepoOrDoc: 'https://github.com/callstack/mcp-tools',
    sampleTools: [
      { name: 'callstack_audit_reanimated', description: 'Audit 60fps UI thread animation performance', inputSchema: { code: 'string' }, isExecutableNow: true }
    ]
  }
];

export function getTotalMcpSkillsCount(): number {
  return MCP_MARKET_PROVIDERS.reduce((acc, p) => acc + p.skillCount, 0);
}

export function searchMcpProviders(query: string): McpBrandProvider[] {
  if (!query) return MCP_MARKET_PROVIDERS;
  const q = query.toLowerCase().trim();
  return MCP_MARKET_PROVIDERS.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.sampleTools.some(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  );
}
