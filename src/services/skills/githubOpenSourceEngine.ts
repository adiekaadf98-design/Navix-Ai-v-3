/**
 * NAVIX AI — GITHUB & OPEN-SOURCE SKILLS UNIFIED ENGINE
 * 
 * Mengintegrasikan seluruh ekosistem open-source dan GitHub:
 * 1. 50.000+ domain keahlian open-source resmi (AI/LLM, Vision, Trading Quant, Security, Mobile, Web)
 * 2. 13 ECC Agentic Skills (Deep Research, Content Engine, Dmux Workflow, Eval Harness, Fal.ai Media, dll.)
 * 3. Live GitHub API Search & Repository Inspection (Real Stars, Forks, Language, License, Topics)
 * 4. Architectural Synthesis & Dependency Wiring (npm, pip, docker, git)
 */

import { IEngine, EngineResult, EngineStatus } from '../../types/engine';
import { ECC_SKILLS_LIST, ECCSkill } from './githubSkillCatalog';
import { 
  OPEN_SOURCE_SKILLS_DIRECTORY, 
  getGlobalSkillCount, 
  searchOpenSourceSkills, 
  fetchLiveGitHubRepoData, 
  searchLiveGitHubSkills,
  OpenSkillCluster
} from './openSourceSkillMatrix';

export interface GitHubOpenSourceResult {
  query: string;
  totalIndexedSkills: number;
  matchedClusters: OpenSkillCluster[];
  matchedEccSkills: ECCSkill[];
  liveGitHubData?: any;
  liveSearchResults?: any[];
  installationGuides: Array<{ tool: string; command: string; language: string }>;
  recommendedArchitecture?: string;
  implementationCodeSnippet?: string;
}

export class GitHubOpenSourceEngine implements IEngine {
  public name = 'GitHubOpenSourceEngine';
  public description = 'Mesin Terpadu Ekosistem GitHub & 50.000+ Skill Open Source (Live Repo Search, Stars, ECC Skills, Blueprints)';
  public capabilities = [
    'github_repo_inspection',
    'live_github_search',
    'open_source_skills_matrix',
    'ecc_agentic_skills',
    'dependency_synthesis',
    'architecture_blueprint'
  ];
  public isReady = true;

  async initialize(): Promise<void> {
    console.log('[GitHubOpenSourceEngine] Initialized with 50,000+ open-source skills and live GitHub integration.');
  }

  async execute(payload: any): Promise<EngineResult<GitHubOpenSourceResult>> {
    const startTime = Date.now();
    const query = payload.query || payload.prompt || payload.repo || '';
    const q = query.toLowerCase().trim();

    try {
      // 1. Check if user is referencing a specific GitHub repository (e.g., 'owner/repo' or full github.com URL)
      const repoMatch = query.match(/(?:github\.com\/|^)([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
      let liveRepoData: any = null;

      if (repoMatch && repoMatch[1]) {
        const repoPath = repoMatch[1];
        console.log(`[GitHubOpenSourceEngine] 🔍 Inspecting Live GitHub Repo: ${repoPath}`);
        liveRepoData = await fetchLiveGitHubRepoData(repoPath);
      }

      // 2. Search local matrix of 50,000+ open source skills
      const localSearchResults = searchOpenSourceSkills(query);

      // 3. Search matching ECC Agentic Skills (13 core skills)
      const matchedEccSkills = ECC_SKILLS_LIST.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => q.includes(t) || t.includes(q))
      );

      // 4. If query is a general tech topic or library, perform live GitHub API search
      let liveSearchResults: any[] = [];
      const cleanKeyword = q
        .replace(/cari(kan)?/g, '')
        .replace(/repo(sitory)?/g, '')
        .replace(/github/g, '')
        .replace(/open source/g, '')
        .replace(/tentang/g, '')
        .trim();

      const searchTarget = cleanKeyword.length >= 2 ? cleanKeyword : q;
      if (searchTarget.length >= 2) {
        console.log(`[GitHubOpenSourceEngine] 🌐 Querying Live GitHub API for: "${searchTarget}"`);
        const ghSearch = await searchLiveGitHubSkills(searchTarget);
        if (ghSearch.success && ghSearch.items) {
          liveSearchResults = ghSearch.items.slice(0, 5);
        }
      }

      // 5. Build installation commands & recommended architecture
      const installationGuides: Array<{ tool: string; command: string; language: string }> = [];

      // Collect top repos identified from local or live search
      const topRepoNames = [
        ...(liveSearchResults.map(r => r.name || r.fullName)),
        ...(localSearchResults.matches.flatMap(m => m.featuredRepos.map(r => r.name)))
      ];

      if (q.includes('python') || q.includes('langchain') || q.includes('ta-lib') || q.includes('freqtrade') || q.includes('transformers') || q.includes('torch')) {
        installationGuides.push({
          tool: 'pip / poetry',
          command: 'pip install ccxt ta-lib transformers torch langchain pydantic fastapi uvicorn',
          language: 'bash'
        });
      }

      if (q.includes('react') || q.includes('tailwind') || q.includes('next') || q.includes('vue') || q.includes('node') || q.includes('typescript')) {
        installationGuides.push({
          tool: 'npm / pnpm',
          command: 'npm install lucide-react clsx tailwind-merge motion recharts d3 @radix-ui/react-slot',
          language: 'bash'
        });
      }

      if (q.includes('rust') || q.includes('cargo') || q.includes('wasm')) {
        installationGuides.push({
          tool: 'cargo',
          command: 'cargo add tokio serde serde_json reqwest tracing',
          language: 'bash'
        });
      }

      if (q.includes('docker') || q.includes('k8s') || q.includes('devops')) {
        installationGuides.push({
          tool: 'Docker',
          command: 'docker run -d -p 8080:8080 --name navix-agent-runtime navix/runtime:latest',
          language: 'bash'
        });
      }

      // 6. Formulate sample boilerplate snippet if relevant
      let implementationCodeSnippet = '';
      if (q.includes('agent') || q.includes('langchain') || q.includes('llm')) {
        implementationCodeSnippet = `import { GoogleGenAI } from '@google/genai';\n\n// Enterprise Agent Pattern with Open-Source Verification\nconst ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n\nexport async function runAgentWorkflow(taskPrompt: string) {\n  const response = await ai.models.generateContent({\n    model: 'gemini-2.5-flash',\n    contents: taskPrompt\n  });\n  return response.text;\n}`;
      } else if (q.includes('trading') || q.includes('ccxt') || q.includes('chart')) {
        implementationCodeSnippet = `import ccxt from 'ccxt';\n\nexport async function fetchLiveOrderbook(symbol = 'BTC/USDT') {\n  const exchange = new ccxt.binance({ enableRateLimit: true });\n  const orderbook = await exchange.fetchOrderBook(symbol, 20);\n  return { symbol, bestBid: orderbook.bids[0], bestAsk: orderbook.asks[0] };\n}`;
      }

      const resultData: GitHubOpenSourceResult = {
        query,
        totalIndexedSkills: getGlobalSkillCount(),
        matchedClusters: localSearchResults.matches,
        matchedEccSkills: matchedEccSkills.slice(0, 4),
        liveGitHubData: liveRepoData,
        liveSearchResults,
        installationGuides,
        recommendedArchitecture: `Arsitektur Open-Source Terpadu Navix AI: Mengintegrasikan ${topRepoNames.slice(0, 4).join(', ') || 'repositori GitHub terpilih'} dengan standardisasi arsitektur modular.`,
        implementationCodeSnippet: implementationCodeSnippet || undefined
      };

      const latencyMs = Date.now() - startTime;

      return {
        status: 'SUCCESS' as EngineStatus,
        source: this.name,
        engineName: this.name,
        latencyMs,
        output: resultData,
        data: resultData,
        realOutput: resultData,
        message: `Berhasil mengompilasi data GitHub & matriks open source (${resultData.totalIndexedSkills.toLocaleString()} skill terindeks, ${resultData.matchedClusters.length} kluster relevan, ${liveSearchResults.length} repositori live GitHub).`
      };
    } catch (err: any) {
      return {
        status: 'FAILED' as EngineStatus,
        source: this.name,
        engineName: this.name,
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Gagal mengeksekusi GitHubOpenSourceEngine',
        message: `Terjadi kendala pada GitHubOpenSourceEngine: ${err?.message || 'Unknown error'}`
      };
    }
  }

  async shutdown(): Promise<void> {}
}
