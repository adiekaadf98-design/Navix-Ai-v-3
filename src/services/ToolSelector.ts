import { TaskType } from './ThinkingEngine';
import { globalEngineRegistry, EngineHealthStatus } from './EngineRegistry';

export interface ToolCapability {
  name: string;
  description: string;
  requiredInput: string;
}

export type CapabilityLifecycleStatus = 
  | 'REGISTERED'        // Engine or tool is cataloged in registry
  | 'AVAILABLE'         // Engine is present in runtime environment
  | 'EXECUTABLE'        // Engine health check PASS and ready for execution
  | 'VERIFIED'          // Output passed VerificationEngine gate
  | 'USER_DELIVERABLE'; // Sanitized and grounded for user delivery

export interface EngineCandidateEvaluation {
  engineName: string;
  type: 'NAVIX_CORE' | 'OPEN_SOURCE_GITHUB';
  health: EngineHealthStatus;
  compatibilityScore: number; // 0 - 100
  latencyScore: number;       // 0 - 100
  qualityScore: number;       // 0 - 100
  totalScore: number;         // 0 - 100
  selectable: boolean;
  rejectionReason?: string;
  githubRepo?: string;
  license?: string;
}

export interface PilgunSelectionResult {
  capability: string;
  selectedEngine: string;
  selectedType: 'NAVIX_CORE' | 'OPEN_SOURCE_GITHUB';
  evaluations: EngineCandidateEvaluation[];
  rationale: string;
}

export class ToolSelector {
  private availableTools: ToolCapability[] = [
    { name: 'Search', description: 'Search the web for realtime information', requiredInput: 'query' },
    { name: 'MarketData', description: 'Fetch realtime crypto/forex prices and trends', requiredInput: 'symbol' },
    { name: 'CodeScanner', description: 'Scan code for vulnerabilities, syntax errors, and architecture', requiredInput: 'code_snippet' },
    { name: 'ImageGenerator', description: 'Generate or edit images with high fidelity', requiredInput: 'prompt' },
    { name: 'VideoGenerator', description: 'Generate video motion scenes and storyboards', requiredInput: 'prompt' },
    { name: 'AudioSynthesizer', description: 'Studio-grade audio processing, voice, and harmonic synthesis', requiredInput: 'query' },
    { name: 'DocumentParser', description: 'Extract semantic structures, tables, and claims from documents', requiredInput: 'document_text' },
    { name: 'MathCalculator', description: 'Deterministic 50-digit high-precision mathematical expression evaluator and integer analyzer', requiredInput: 'expression' },
    { name: 'DataAnalyticsCalculator', description: 'Deterministic statistical and numerical aggregations', requiredInput: 'dataset' },
    { name: 'SecurityShieldAuditor', description: 'Zero-trust sanitization and vulnerability inspection', requiredInput: 'payload' },
    { name: 'GitHubOpenSourceScanner', description: 'Audit 50,000+ open-source GitHub skills, repositories, and licenses', requiredInput: 'query' }
  ];

  /**
   * Pilgun (Pilihan Ganda / Engine Selection Arbitrator):
   * Mengevaluasi kandidat mesin (Navix Core maupun Open-Source GitHub) berdasarkan:
   * - availability & health status
   * - compatibility
   * - latency
   * - quality & resource
   * - task requirement
   */
  public selectOptimalEngine(capability: string, context?: { query?: string; complexity?: string; preferredType?: 'NAVIX' | 'OPEN_SOURCE_GITHUB' }): PilgunSelectionResult {
    const q = (context?.query || '').toLowerCase();
    const cap = capability.toLowerCase();

    // Matriks Kandidat per Kapabilitas (Navix Core & Open-Source GitHub Terverifikasi)
    const candidateMap: Record<string, Array<{ name: string; type: 'NAVIX_CORE' | 'OPEN_SOURCE_GITHUB'; repo?: string; license?: string }>> = {
      'web_research': [
        { name: 'SearchEngine', type: 'NAVIX_CORE' },
        { name: 'KnowledgeLab', type: 'NAVIX_CORE' },
        { name: 'SearXNGResearchEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'searxng/searxng', license: 'AGPL-3.0 / MIT wrapper' },
        { name: 'Crawl4AiScraperEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'unclecode/crawl4ai, cheeriojs/cheerio', license: 'Apache-2.0 / MIT' }
      ],
      'search': [
        { name: 'SearchEngine', type: 'NAVIX_CORE' },
        { name: 'KnowledgeLab', type: 'NAVIX_CORE' },
        { name: 'SearXNGResearchEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'searxng/searxng', license: 'AGPL-3.0 / MIT wrapper' },
        { name: 'Crawl4AiScraperEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'unclecode/crawl4ai, cheeriojs/cheerio', license: 'Apache-2.0 / MIT' }
      ],
      'research': [
        { name: 'SearchEngine', type: 'NAVIX_CORE' },
        { name: 'KnowledgeLab', type: 'NAVIX_CORE' },
        { name: 'SearXNGResearchEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'searxng/searxng', license: 'AGPL-3.0 / MIT wrapper' }
      ],
      'deep_research': [
        { name: 'SearchEngine', type: 'NAVIX_CORE' },
        { name: 'KnowledgeLab', type: 'NAVIX_CORE' }
      ],
      'trading': [
        { name: 'SignalEngine', type: 'NAVIX_CORE' },
        { name: 'RetailTraderGitHubEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'ccxt/ccxt, ta-lib/ta-lib-python, freqtrade/freqtrade', license: 'MIT / BSD-3-Clause' },
        { name: 'TradingViewService', type: 'NAVIX_CORE' },
        { name: 'CryptoEngine', type: 'NAVIX_CORE' },
        { name: 'StockEngine', type: 'NAVIX_CORE' }
      ],
      'market': [
        { name: 'SignalEngine', type: 'NAVIX_CORE' },
        { name: 'CryptoEngine', type: 'NAVIX_CORE' },
        { name: 'StockEngine', type: 'NAVIX_CORE' }
      ],
      'crypto': [
        { name: 'CryptoEngine', type: 'NAVIX_CORE' },
        { name: 'SignalEngine', type: 'NAVIX_CORE' },
        { name: 'RetailTraderGitHubEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'ccxt/ccxt', license: 'MIT' }
      ],
      'stock': [
        { name: 'StockEngine', type: 'NAVIX_CORE' },
        { name: 'SignalEngine', type: 'NAVIX_CORE' },
        { name: 'RetailTraderGitHubEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'ta-lib/ta-lib-python', license: 'BSD-3-Clause' }
      ],
      'saham': [
        { name: 'StockEngine', type: 'NAVIX_CORE' },
        { name: 'SignalEngine', type: 'NAVIX_CORE' }
      ],
      'macro': [
        { name: 'ForexFactoryService', type: 'NAVIX_CORE' }
      ],
      'github_opensource': [
        { name: 'GitHubOpenSourceEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'https://github.com', license: 'Open Source / MIT' },
        { name: 'ProjectMapEngine', type: 'NAVIX_CORE' },
        { name: 'CodingEngine', type: 'NAVIX_CORE' }
      ],
      'code': [
        { name: 'CodingEngine', type: 'NAVIX_CORE' },
        { name: 'ProjectMapEngine', type: 'NAVIX_CORE' },
        { name: 'GitHubOpenSourceEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'https://github.com', license: 'MIT' },
        { name: 'AIStudioAppBuilderEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'google-gemini/ai-studio-starter', license: 'Apache-2.0' }
      ],
      'coding': [
        { name: 'CodingEngine', type: 'NAVIX_CORE' },
        { name: 'ProjectMapEngine', type: 'NAVIX_CORE' },
        { name: 'GitHubOpenSourceEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'https://github.com', license: 'MIT' }
      ],
      'code_engineering': [
        { name: 'CodingEngine', type: 'NAVIX_CORE' },
        { name: 'ProjectMapEngine', type: 'NAVIX_CORE' },
        { name: 'GitHubOpenSourceEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'https://github.com', license: 'MIT' },
        { name: 'AIStudioAppBuilderEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'google-gemini/ai-studio-starter', license: 'Apache-2.0' }
      ],
      'document': [
        { name: 'DocumentEngine', type: 'NAVIX_CORE' },
        { name: 'MarkitDownParserEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'microsoft/markitdown', license: 'MIT' },
        { name: 'PdfJsExtractionEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'mozilla/pdf.js', license: 'Apache-2.0' }
      ],
      'pdf': [
        { name: 'DocumentEngine', type: 'NAVIX_CORE' },
        { name: 'PdfJsExtractionEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'mozilla/pdf.js', license: 'Apache-2.0' }
      ],
      'file_analysis': [
        { name: 'DocumentEngine', type: 'NAVIX_CORE' }
      ],
      'data_analysis': [
        { name: 'DataAnalysisEngine', type: 'NAVIX_CORE' },
        { name: 'DanfoDataEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'javascriptdata/danfojs', license: 'MIT' },
        { name: 'DuckDbAnalyticsEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'duckdb/duckdb-wasm', license: 'MIT' }
      ],
      'memory_rag': [
        { name: 'EpisodicMemoryEngine', type: 'NAVIX_CORE' },
        { name: 'KnowledgeBaseEngine', type: 'NAVIX_CORE' },
        { name: 'ChromaVectorEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'chroma-core/chroma', license: 'Apache-2.0' }
      ],
      'memory': [
        { name: 'EpisodicMemoryEngine', type: 'NAVIX_CORE' }
      ],
      'rag': [
        { name: 'KnowledgeBaseEngine', type: 'NAVIX_CORE' },
        { name: 'EpisodicMemoryEngine', type: 'NAVIX_CORE' }
      ],
      'image': [
        { name: 'ImageEngine', type: 'NAVIX_CORE' },
        { name: 'PhotorealismEngine', type: 'NAVIX_CORE' },
        { name: 'LocalDreamImageEngine', type: 'NAVIX_CORE' },
        { name: 'SharpProcessingEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'lovell/sharp', license: 'Apache-2.0' }
      ],
      'image_generation': [
        { name: 'ImageEngine', type: 'NAVIX_CORE' },
        { name: 'PhotorealismEngine', type: 'NAVIX_CORE' },
        { name: 'LocalDreamImageEngine', type: 'NAVIX_CORE' },
        { name: 'SharpProcessingEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'lovell/sharp', license: 'Apache-2.0' }
      ],
      'video': [
        { name: 'VideoEngine', type: 'NAVIX_CORE' }
      ],
      'video_generation': [
        { name: 'VideoEngine', type: 'NAVIX_CORE' }
      ],
      'audio': [
        { name: 'AudioEngine', type: 'NAVIX_CORE' },
        { name: 'ToneJsAudioEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'Tonejs/Tone.js', license: 'MIT' }
      ],
      'audio_generation': [
        { name: 'AudioEngine', type: 'NAVIX_CORE' },
        { name: 'ToneJsAudioEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'Tonejs/Tone.js', license: 'MIT' }
      ],
      'security': [
        { name: 'NavixShield', type: 'NAVIX_CORE' },
        { name: 'ZapSecurityEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'zaproxy/zaproxy', license: 'Apache-2.0' }
      ],
      'security_audit': [
        { name: 'NavixShield', type: 'NAVIX_CORE' },
        { name: 'ZapSecurityEngine', type: 'OPEN_SOURCE_GITHUB', repo: 'zaproxy/zaproxy', license: 'Apache-2.0' }
      ],
      'automation': [
        { name: 'AutomationsEngine', type: 'NAVIX_CORE' },
        { name: 'AgentEngine', type: 'NAVIX_CORE' },
        { name: 'McpSkillRouter', type: 'OPEN_SOURCE_GITHUB', repo: 'modelcontextprotocol/servers', license: 'MIT' }
      ],
      'agent': [
        { name: 'AgentEngine', type: 'NAVIX_CORE' },
        { name: 'AutomationsEngine', type: 'NAVIX_CORE' },
        { name: 'McpSkillRouter', type: 'OPEN_SOURCE_GITHUB', repo: 'modelcontextprotocol/servers', license: 'MIT' }
      ],
      'mcp': [
        { name: 'McpSkillRouter', type: 'OPEN_SOURCE_GITHUB', repo: 'modelcontextprotocol/servers', license: 'MIT' },
        { name: 'AgentEngine', type: 'NAVIX_CORE' }
      ],
      'skill': [
        { name: 'McpSkillRouter', type: 'OPEN_SOURCE_GITHUB', repo: 'modelcontextprotocol/servers', license: 'MIT' },
        { name: 'AgentEngine', type: 'NAVIX_CORE' }
      ],
      'pilgun': [
        { name: 'InteractiveQuizEngine', type: 'NAVIX_CORE' }
      ],
      'vision': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'DocumentEngine', type: 'NAVIX_CORE' }
      ],
      'visual_reasoning': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'DocumentEngine', type: 'NAVIX_CORE' }
      ],
      'ocr': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'DocumentEngine', type: 'NAVIX_CORE' }
      ],
      'chart_understanding': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'SignalEngine', type: 'NAVIX_CORE' }
      ],
      'chart_analysis': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'SignalEngine', type: 'NAVIX_CORE' }
      ],
      'spatial_reasoning': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' }
      ],
      'ui_understanding': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'CodingEngine', type: 'NAVIX_CORE' }
      ],
      'diagram_interpretation': [
        { name: 'VisionEngine', type: 'NAVIX_CORE' },
        { name: 'CodingEngine', type: 'NAVIX_CORE' }
      ],
      'math': [
        { name: 'MathEngine', type: 'NAVIX_CORE' },
        { name: 'DataAnalysisEngine', type: 'NAVIX_CORE' },
        { name: 'AutonomousScientificLab', type: 'NAVIX_CORE' }
      ],
      'arithmetic': [
        { name: 'MathEngine', type: 'NAVIX_CORE' }
      ],
      'single_integer': [
        { name: 'MathEngine', type: 'NAVIX_CORE' }
      ],
      'reasoning': [
        { name: 'AdaptiveReasoningEngine', type: 'NAVIX_CORE' },
        { name: 'TaskDecompositionEngine', type: 'NAVIX_CORE' }
      ],
      'quiz': [
        { name: 'InteractiveQuizEngine', type: 'NAVIX_CORE' }
      ],
      'scientific_research': [
        { name: 'AutonomousScientificLab', type: 'NAVIX_CORE' },
        { name: 'KnowledgeLab', type: 'NAVIX_CORE' },
        { name: 'DocumentEngine', type: 'NAVIX_CORE' }
      ],
      'artifact': [
        { name: 'ArtifactManager', type: 'NAVIX_CORE' },
        { name: 'ArtifactEngine', type: 'NAVIX_CORE' }
      ],
      'artifact_manager': [
        { name: 'ArtifactManager', type: 'NAVIX_CORE' }
      ],
      'evidence_bundle': [
        { name: 'EvidenceBundleEngine', type: 'NAVIX_CORE' },
        { name: 'EvidenceEngine', type: 'NAVIX_CORE' }
      ],
      'evidence': [
        { name: 'EvidenceBundleEngine', type: 'NAVIX_CORE' }
      ],
      'concurrency': [
        { name: 'EngineConcurrencyManager', type: 'NAVIX_CORE' },
        { name: 'PerformanceEngine', type: 'NAVIX_CORE' }
      ],
      'performance': [
        { name: 'EngineConcurrencyManager', type: 'NAVIX_CORE' }
      ],
      'browser': [
        { name: 'ComputerInteractionEngine', type: 'NAVIX_CORE' },
        { name: 'BrowserEngine', type: 'NAVIX_CORE' }
      ],
      'computer_interaction': [
        { name: 'ComputerInteractionEngine', type: 'NAVIX_CORE' }
      ],
      'context': [
        { name: 'ContextBuilderEngine', type: 'NAVIX_CORE' }
      ],
      'context_builder': [
        { name: 'ContextBuilderEngine', type: 'NAVIX_CORE' }
      ]
    };

    const rawCandidates = candidateMap[cap] || [
      { name: 'DefaultEngine', type: 'NAVIX_CORE' }
    ];

    const evaluations: EngineCandidateEvaluation[] = [];

    for (const cand of rawCandidates) {
      const health = globalEngineRegistry.getEngineHealth(cand.name);
      const info = globalEngineRegistry.getEngineInfo(cand.name);

      let selectable = true;
      let rejectionReason: string | undefined;

      // 1. Health & Availability check
      if (health === 'FAILED' || health === 'CAPABILITY_NOT_AVAILABLE' || health === 'AUTH_ERROR' || health === 'DISABLED') {
        selectable = false;
        rejectionReason = `Mesin tidak sehat atau tidak tersedia (Status: ${health}).`;
      }

      // 2. Compatibility scoring (Prioritizing Navix Core unless Open-Source or specific engine is requested/justified)
      let compatibilityScore = cand.type === 'NAVIX_CORE' ? 88 : 82;

      // User explicitly requested open-source or specific repository/library
      const mentionsOpenSource = q.includes('github') || q.includes('open-source') || q.includes('open source') || q.includes('repo') || q.includes('library') || q.includes('package');
      if (cand.type === 'OPEN_SOURCE_GITHUB' && mentionsOpenSource) {
        compatibilityScore = 98;
      } else if (context?.preferredType === 'OPEN_SOURCE_GITHUB' && cand.type === 'OPEN_SOURCE_GITHUB') {
        compatibilityScore = 96;
      } else if (context?.preferredType === 'NAVIX' && cand.type === 'NAVIX_CORE') {
        compatibilityScore = 96;
      }

      // Domain-specific match bonuses
      if (cand.name === 'SearXNGResearchEngine' && (q.includes('searxng') || q.includes('metasearch') || q.includes('agregasi'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'Crawl4AiScraperEngine' && (q.includes('crawl4ai') || q.includes('scrape') || q.includes('markdown extraction') || q.includes('crawl'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'MarkitDownParserEngine' && (q.includes('markitdown') || q.includes('commonmark') || q.includes('convert markdown'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'DanfoDataEngine' && (q.includes('danfo') || q.includes('dataframe') || q.includes('pandas'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'DuckDbAnalyticsEngine' && (q.includes('duckdb') || q.includes('olap') || q.includes('sql dataset'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'ChromaVectorEngine' && (q.includes('chroma') || q.includes('vector db') || q.includes('nearest neighbor'))) {
        compatibilityScore = 99;
      } else if (cand.name === 'RetailTraderGitHubEngine' && (q.includes('ccxt') || q.includes('ta-lib') || q.includes('freqtrade') || q.includes('non-repainting'))) {
        compatibilityScore = 98;
      } else if (cand.name === 'SignalEngine' && (q.includes('sinyal') || q.includes('sl') || q.includes('tp') || q.includes('entry'))) {
        compatibilityScore = 96;
      } else if (cand.name === 'SearchEngine' && (q.includes('cari') || q.includes('search') || q.includes('berita') || q.includes('fakta'))) {
        compatibilityScore = 95;
      } else if (cand.name === 'CryptoEngine' && (q.includes('btc') || q.includes('eth') || q.includes('sol') || q.includes('kripto'))) {
        compatibilityScore = 94;
      } else if (cand.name === 'StockEngine' && (q.includes('saham') || q.includes('idx') || q.includes('bbca') || q.includes('nvda'))) {
        compatibilityScore = 94;
      }

      // 3. Latency scoring
      const avgLat = info?.latencyAvgMs || (cand.type === 'OPEN_SOURCE_GITHUB' ? 40 : 45);
      let latencyScore = Math.max(10, Math.min(100, Math.round(100 - (avgLat / 20))));

      // 4. Quality scoring
      let qualityScore = 92;
      if (info?.successCount && info.successCount > 0) {
        const totalRuns = info.successCount + (info.failureCount || 0);
        qualityScore = Math.round((info.successCount / totalRuns) * 100);
      }

      // Total Weighted Score: Compatibility 45%, Quality 35%, Latency 20%
      const totalScore = selectable ? Math.round((compatibilityScore * 0.45) + (qualityScore * 0.35) + (latencyScore * 0.20)) : 0;

      evaluations.push({
        engineName: cand.name,
        type: cand.type,
        health,
        compatibilityScore,
        latencyScore,
        qualityScore,
        totalScore,
        selectable,
        rejectionReason,
        githubRepo: cand.repo,
        license: cand.license
      });
    }

    // Urutkan kandidat dari skor tertinggi
    evaluations.sort((a, b) => b.totalScore - a.totalScore);

    const best = evaluations.find(e => e.selectable) || evaluations[0];
    const candidateListStr = evaluations.map(e => `${e.engineName} (${e.type === 'OPEN_SOURCE_GITHUB' ? 'GitHub' : 'Navix'}, Skor: ${e.totalScore})`).join(', ');
    const rationale = `Pilgun mengevaluasi ${evaluations.length} kandidat untuk kapabilitas "${capability}": [${candidateListStr}]. Terpilih: ${best.engineName} (${best.type}) dengan skor komposit ${best.totalScore}/100 (Health: ${best.health}${best.githubRepo ? `, Repo: ${best.githubRepo}, Lisensi: ${best.license}` : ''}).`;

    return {
      capability,
      selectedEngine: best.selectable ? best.engineName : 'CAPABILITY_NOT_AVAILABLE',
      selectedType: best.type,
      evaluations,
      rationale
    };
  }

  public selectToolsForTask(taskType: TaskType, complexity: string): ToolCapability[] {
    const selected: ToolCapability[] = [];
    
    if (taskType === 'trading') {
      selected.push(this.availableTools.find(t => t.name === 'MarketData')!);
    }
    
    if (taskType === 'research') {
      selected.push(this.availableTools.find(t => t.name === 'Search')!);
    }
    
    if (taskType === 'code') {
      selected.push(this.availableTools.find(t => t.name === 'CodeScanner')!);
      selected.push(this.availableTools.find(t => t.name === 'GitHubOpenSourceScanner')!);
    }

    if (taskType === 'security') {
      selected.push(this.availableTools.find(t => t.name === 'SecurityShieldAuditor')!);
      selected.push(this.availableTools.find(t => t.name === 'CodeScanner')!);
    }
    
    if (taskType === 'image') {
      selected.push(this.availableTools.find(t => t.name === 'ImageGenerator')!);
    }
    
    if (taskType === 'video') {
      selected.push(this.availableTools.find(t => t.name === 'VideoGenerator')!);
    }

    if (taskType === 'audio') {
      selected.push(this.availableTools.find(t => t.name === 'AudioSynthesizer')!);
    }

    if (taskType === 'document' || taskType === 'file_analysis') {
      selected.push(this.availableTools.find(t => t.name === 'DocumentParser')!);
    }

    if (taskType === 'data_analysis') {
      selected.push(this.availableTools.find(t => t.name === 'DataAnalyticsCalculator')!);
    }

    // High complexity tasks might always need search for extra verification
    if ((complexity === 'CRITICAL' || complexity === 'critical' || complexity === 'hard') && !selected.find(t => t.name === 'Search')) {
      selected.push(this.availableTools.find(t => t.name === 'Search')!);
    }

    return selected.filter(Boolean);
  }

  /**
   * Evaluates the precise lifecycle state of a capability:
   * REGISTERED != AVAILABLE != EXECUTABLE != VERIFIED != USER_DELIVERABLE
   * 
   * Strict Rule:
   * - FAILED / DISABLED / AUTH_ERROR / TIMEOUT / CAPABILITY_NOT_AVAILABLE must NEVER be called AVAILABLE.
   * - REGISTERED: Engine/capability tercatat di registry / catalog.
   * - AVAILABLE: Capability tersedia di environment/runtime dan dependensi dasarnya tersedia.
   * - EXECUTABLE: Capability AVAILABLE + execution contract dapat dijalankan saat ini (HEALTHY / OPERATIONAL).
   */
  public getCapabilityLifecycleStatus(capabilityName: string): CapabilityLifecycleStatus {
    const engine = globalEngineRegistry.getEngine(capabilityName);
    if (!engine) {
      return 'REGISTERED';
    }
    const health = globalEngineRegistry.getEngineHealth(capabilityName);
    const info = globalEngineRegistry.getEngineInfo(capabilityName);

    // Kontrak Ketat: Health failure TIDAK BOLEH dianggap AVAILABLE
    if (health === 'DISABLED' || health === 'FAILED' || health === 'AUTH_ERROR' || health === 'TIMEOUT' || health === 'CAPABILITY_NOT_AVAILABLE') {
      return 'REGISTERED';
    }

    // Available: Tersedia di runtime environment tetapi sedang busy / processing / standby
    if (health === 'BUSY' || health === 'PROCESSING' || (info && info.lifecycle === 'INITIALIZED')) {
      return 'AVAILABLE';
    }

    // Executable: Available + siap menjalankan tugas komputasi saat ini
    if (health === 'AVAILABLE' || health === 'DEGRADED' || (info && (info.lifecycle === 'EXECUTABLE' || info.lifecycle === 'HEALTHY'))) {
      return 'EXECUTABLE';
    }

    return 'REGISTERED';
  }
}

export const globalToolSelector = new ToolSelector();

