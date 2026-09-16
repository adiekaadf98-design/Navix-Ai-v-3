export interface ECCSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  author: string;
  entryPoint?: string;
  tags: string[];
}

export const ECC_SKILLS_LIST: ECCSkill[] = [
  { id: 'competitive-analysis', name: 'Competitive Analysis', category: 'Research', description: 'Deep market intelligence and competitor benchmarking.', author: 'ECC-Core', tags: ['research', 'market', 'analysis'] },
  { id: 'content-engine', name: 'Content Engine', category: 'Creative', description: 'Multi-platform viral content generation, hooks, and strategy.', author: 'ECC-Core', tags: ['marketing', 'copywriting', 'seo'] },
  { id: 'crosspost', name: 'Crosspost Multi-Agent', category: 'Distribution', description: 'Automated syndicated content distribution across channels.', author: 'ECC-Core', tags: ['social', 'automation', 'dist'] },
  { id: 'deep-research', name: 'Deep Research Agent', category: 'Intelligence', description: 'Recursive multi-source research agent with citations.', author: 'ECC-Core', tags: ['ai', 'agent', 'research'] },
  { id: 'dmux-workflow', name: 'Dmux Workflow Orchestrator', category: 'Infrastructure', description: 'Multiplexed task execution for parallel sub-agents.', author: 'ECC-Core', tags: ['orchestration', 'subagents'] },
  { id: 'documentation-generator', name: 'Documentation Generator', category: 'DevOps', description: 'Automatic API, architecture, and code documentation.', author: 'ECC-Core', tags: ['docs', 'markdown', 'dev'] },
  { id: 'e2e-testing', name: 'E2E Testing Suite', category: 'QA', description: 'Automated end-to-end user journey and regression testing.', author: 'ECC-Core', tags: ['testing', 'qa', 'automation'] },
  { id: 'eval-harness', name: 'Eval Harness', category: 'AI Benchmarks', description: 'Model benchmarking, prompt evaluation, and scoring pipeline.', author: 'ECC-Core', tags: ['eval', 'benchmark', 'llm'] },
  { id: 'everything-claude', name: 'Everything Claude Context', category: 'Intelligence', description: 'Prompt optimization and architectural context bridge.', author: 'ECC-Core', tags: ['claude', 'prompts', 'context'] },
  { id: 'exa-search', name: 'Exa Neural Search', category: 'Search', description: 'Neural embedding search engine for live web data.', author: 'ECC-Core', tags: ['search', 'neural', 'web'] },
  { id: 'fal-ai-media', name: 'Fal.ai Media Engine', category: 'Media', description: 'High-speed distributed GPU media inference for video & image.', author: 'ECC-Core', tags: ['fal.ai', 'gpu', 'media'] },
  { id: 'frontend-patterns', name: 'Frontend Patterns', category: 'Design', description: 'Tailwind and React design system UI patterns.', author: 'ECC-Core', tags: ['ui', 'tailwind', 'components'] },
  { id: 'frontend-slides', name: 'Frontend Slides Deck', category: 'Presentation', description: 'Interactive presentation slides generator for web.', author: 'ECC-Core', tags: ['slides', 'presentation', 'web'] }
];
