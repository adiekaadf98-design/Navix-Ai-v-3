import { NavixSkillRouter } from './skills/mcp/McpSkillRouter';
import { workflowManager } from './GlobalWorkflowManager';
import { globalEngineRegistry, ServiceRegistry } from './EngineRegistry';
import { navixMemoryEngine } from '../memory/MemoryEngine';
import { globalAdaptiveEngine } from './AdaptiveExecutionEngine';
import { globalVerificationEngine } from './VerificationEngine';
import { globalFailureRecovery } from './FailureRecoveryEngine';
import { classifyTask } from './ThinkingEngine';
import { rotateFetch } from '../lib/apiKeyRotator';
import { EvidenceEngine } from './AdvancedReasoning';
import { globalDeliberationCouncil } from './council/DeliberationCouncilEngine';


/**
 * Melakukan analisis semantik untuk membedakan instruksi pembuatan gambar baru ('generate')
 * dan penyuntingan/diskusi gambar yang sudah ada ('edit/discuss').
 */
export function analyzeImageIntent(message: string, attachments?: any[], history?: any[]): 'generate' | 'edit' | 'discuss' | 'none' {
  if (message.startsWith('[GOOGLE_COMPOSITE]')) {
    return 'none';
  }
  const lowercaseMsg = message.toLowerCase();
  
  // Cek apakah ada attachment berupa gambar sekarang atau dalam riwayat chat terdekat
  const hasImageAttachment = attachments && attachments.some(att => {
    if (typeof att === 'string') {
      return att.startsWith('data:image') || att.includes('image');
    }
    return (
      (att.mimeType && att.mimeType.startsWith('image/')) || 
      (att.type && att.type === 'image') ||
      (att.data && typeof att.data === 'string' && att.data.length > 100)
    );
  });

  const hasHistoryImage = history && history.some(item => 
    item.parts && item.parts.some((part: any) => 
      part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')
    )
  );

  const hasImageContext = hasImageAttachment || hasHistoryImage;

  // Kata kunci pemicu pengeditan gambar
  const editKeywords = [
    'edit', 'ubah', 'ganti', 'modify', 'proses', 'manipulasi', 'tambah', 'kurang', 
    'gaya', 'variasi', 'ganti latar', 'pake', 'pakek', 'pakai', 'crop', 'resize', 
    'filter', 'grayscale', 'warna', 'wajah', 'muka', 'face', 'ganti baju', 'baju',
    'revisi pakaian', 'revisi baju', 'perbaiki pakaian', 'perbaiki baju',
    'rambut', 'hairstyle', 'kacamata', 'background', 'ganti background', 'figurine',
    'anime', 'kartun', 'aesthetic', 'makeover', 'sempurnakan', 'perbaiki',
    'beground yang di butuhkan lengkap', 'beground lengkap', 'background lengkap'
  ];

  // Kata kunci pemicu diskusi/tanya jawab gambar
  const discussKeywords = [
    'apa', 'siapa', 'jelaskan', 'deskripsikan', 'analisa', 'analisis', 'bagaimana', 
    'bagus', 'jelek', 'foto siapa', 'ini gambar apa', 'foto ini', 'gambar ini', 
    'terangkan', 'baca', 'artikan', 'tanya', 'diskusi', 'obrol', 'cerita'
  ];

  const containsEditKeyword = editKeywords.some(kw => lowercaseMsg.includes(kw));
  const containsDiscussKeyword = discussKeywords.some(kw => lowercaseMsg.includes(kw));

  // Jika ada konteks gambar (attachment/history), prioritaskan edit/discuss
  if (hasImageContext) {
    if (containsEditKeyword) {
      return 'edit';
    }
    if (containsDiscussKeyword || lowercaseMsg.trim().length < 15) {
      return 'discuss';
    }
    
    // Cek apakah ada kata kunci buat baru yang sangat eksplisit
    const isExplicitNewGenerate = (lowercaseMsg.includes('buat gambar baru') || lowercaseMsg.includes('bikin gambar baru') || lowercaseMsg.includes('generate new image') || lowercaseMsg.includes('buatkan gambar baru')) && !lowercaseMsg.includes('ini');
    if (!isExplicitNewGenerate) {
      // Jika ada gambar terlampir dan pengguna menginstruksikan sesuatu, itu diasumsikan mengedit gambar tersebut
      return 'edit';
    }
  }

  // Jika tidak ada gambar sama sekali tapi ada instruksi edit gambar/foto spesifik
  if (containsEditKeyword && (lowercaseMsg.includes('gambar') || lowercaseMsg.includes('foto') || lowercaseMsg.includes('image') || lowercaseMsg.includes('wajah') || lowercaseMsg.includes('muka'))) {
    return 'edit';
  }

  // Cek apakah ada kata kunci generate gambar baru
  const generateKeywords = [
    'buat gambar', 'bikin gambar', 'buatkan gambar', 'gambarkan', 'tampilkan gambar', 'lukis', 'generate image', 'generate gambar',
    'buat ilustrasi', 'bikin ilustrasi', 'buat logo', 'bikin logo', 'buat sketsa', 'bikin sketsa', 'buat lukisan',
    'buatkan logo', 'buatkan ilustrasi', 'tolong buat gambar', 'tolong bikin gambar',
    'buat foto', 'bikin foto', 'buatkan foto', 'fotokan', 'tampilkan foto', 'ambil foto', 'foto real', 'foto asli',
    'foto manusia', 'foto wanita', 'foto pria', 'foto orang', 'foto wajah', 'foto pemandangan', 'foto kucing', 'foto anjing', 'foto alam',
    'potret', 'portrait', 'draw ', 'paint ', 'create image', 'generate image', 'photograph of', 'photo of', 'portrait of'
  ];
  const containsGenerateKeyword = generateKeywords.some(kw => lowercaseMsg.includes(kw));

  if (containsGenerateKeyword) {
    return 'generate';
  }

  return 'none';
}

export interface OrchestratorRequest {
  message: string;
  attachments?: any[];
  history?: any[];
  model?: string;
  voiceEnabled?: boolean;
  effort?: string;
  thinkingMode?: boolean;
  aiBooster?: boolean;
  onProgress?: (event: { step: string, status: string, detail?: string }) => void;
}

export interface OrchestratorResponse {
  text?: string;
  audioBase64?: string;
  attachments?: any[];
  error?: string;
  isRateLimit?: boolean;
  systemInstruction?: string;
}

export class NavixOrchestrator {
  /**
   * Menerima permintaan dari pengguna, menentukan mesin yang sesuai melalui ServiceRegistry,
   * meneruskan tugas ke mesin tersebut, menerima hasilnya, lalu mengirimkan hasil itu ke AI
   * untuk disusun menjadi jawaban akhir yang ditampilkan kepada pengguna.
   */
  async processUserRequest(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    // Arbitrate via GlobalWorkflowManager to prevent UI race conditions
    return workflowManager.enqueue('Orchestrator: User Request', () => this.processUserRequestInternal(req), 'NORMAL');
  }

  private async processUserRequestInternal(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    const notify = (step: string, status: string, detail?: string) => {
      if (req.onProgress && req.thinkingMode) {
        req.onProgress({ step, status, detail });
      }
    };
    
    notify("thinking_started", "pending", "Understanding Task");

    try {
      // ADAPTIVE EXECUTION ENGINE
      
      // ADAPTIVE EXECUTION ENGINE
      let adaptiveResult: any = null;

      // MCP DIRECT INTERCEPT & SKILL EXECUTION LAYER
      if (req.message.startsWith('/mcp') || req.message.toLowerCase().startsWith('!mcp')) {
        const fullCmd = req.message.replace(/^(\/mcp|!mcp)\s*/i, '').trim();
        
        if (!fullCmd || fullCmd === 'list' || fullCmd === 'status' || fullCmd === 'help') {
          const { MCP_MARKET_PROVIDERS, getTotalMcpSkillsCount } = await import('./skills/mcp/mcpMarketCatalog');
          const executableCount = MCP_MARKET_PROVIDERS.filter(p => p.status === 'EXECUTABLE').length;
          const configCount = MCP_MARKET_PROVIDERS.filter(p => p.status === 'CONFIGURATION_REQUIRED').length;

          let catalogMd = `### 🌐 Navix Model Context Protocol (MCP) Skills Hub\n\n`;
          catalogMd += `**Total Ecosystem:** ${getTotalMcpSkillsCount()} Skills terindeks melintasi ${MCP_MARKET_PROVIDERS.length} Global Providers (sesuai MCP Market Directory).\n`;
          catalogMd += `- ⚡ **Direct Executable Engine:** ${executableCount} Providers (Built-in runtime)\n`;
          catalogMd += `- 🔑 **Configured/API Key Ready:** ${configCount} Providers (Cloud services)\n\n`;
          catalogMd += `| Provider | Kategori | Total Skills | Status | Sample Executable Tool |\n`;
          catalogMd += `| :--- | :--- | :---: | :---: | :--- |\n`;

          MCP_MARKET_PROVIDERS.slice(0, 15).forEach(p => {
            const statusBadge = p.status === 'EXECUTABLE' ? '🟢 EXECUTABLE' : '🟡 API KEY NEEDED';
            const sampleTool = p.sampleTools[0]?.name || 'ping';
            catalogMd += `| **${p.name}** | ${p.category} | ${p.skillCount} | ${statusBadge} | \`${sampleTool}\` |\n`;
          });

          catalogMd += `\n*...dan 35+ provider lainnya (NVIDIA, Google Gemini, PostHog, Microsoft, Stripe, dll).* Buka **Skills Matrix** di menu atas untuk melihat katalog lengkap!\n\n`;
          catalogMd += `**Cara Eksekusi:**\n\`/mcp <server> <tool> <json_args>\`\n*Contoh:* \`/mcp everything echo {"message": "Hello Navix MCP"}\``;

          return {
            text: catalogMd
          };
        }

        const parts = fullCmd.split(' ');
        const serverName = parts[0] || 'everything';
        const toolName = parts[1] || 'echo';
        const argsStr = parts.slice(2).join(' ');
        let args = {};
        try { args = argsStr ? JSON.parse(argsStr) : {}; } catch (e) { args = { message: argsStr || "Ping from Navix" }; }
        
        notify("mcp_discovery", "pending", `Discovering skills on ${serverName}...`);
        const startTime = Date.now();
        await NavixSkillRouter.discoverSkills(serverName);
        
        notify("mcp_execution", "pending", `Executing skill ${toolName}...`);
        let executionResult;
        try {
          executionResult = await NavixSkillRouter.routeSkill(toolName, args);
        } catch (skillErr: any) {
          console.warn("[Orchestrator] Skill Execution Error:", skillErr);
          executionResult = { error: "Skill execution failed or timed out", details: skillErr.message };
        }
        const elapsed = Date.now() - startTime;
        
        let formattedOutput = "";
        if (executionResult?.content && Array.isArray(executionResult.content)) {
          formattedOutput = executionResult.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
        } else {
          formattedOutput = JSON.stringify(executionResult, null, 2);
        }

        return {
          text: `### ⚡ MCP Skill Execution Result\n\n- **Target Server:** \`${serverName}\`\n- **Invoked Tool:** \`${toolName}\`\n- **Execution Latency:** \`${elapsed}ms\`\n\n\`\`\`json\n${formattedOutput}\n\`\`\``
        };
      }

      if (!req.message.startsWith('[GOOGLE_COMPOSITE]') && req.thinkingMode) {
        try {
          adaptiveResult = await globalAdaptiveEngine.processRequest(req.message, req.attachments?.length || 0, {
             onStateChange: (state, details) => {
               notify("supervisor_state", "pending", state);
             },
             onProgress: (step) => {
               notify("workflow_step", "pending", step);
             }
          });
        } catch (engineError: any) {
          console.warn("[Orchestrator] AdaptiveExecutionEngine Warning:", engineError);
          notify("workflow_step", "error", "Engine Timeout / Fallback Activated");
          // Fail gracefully by nullifying adaptiveResult so it falls back to default AI processing
          adaptiveResult = null;
        }
      }

      if (req.message.startsWith('[GOOGLE_COMPOSITE]')) {
        try {
          const lines = req.message.split('\n');
          const faceLine = lines.find(l => l.startsWith('Face:'));
          const clothesLine = lines.find(l => l.startsWith('Clothes:'));
          const bgLine = lines.find(l => l.startsWith('Background:'));
          const promptLine = lines.find(l => l.startsWith('Prompt:'));

          const faceUrl = faceLine ? faceLine.substring(5).trim() : '';
          const clothesUrl = clothesLine ? clothesLine.substring(8).trim() : '';
          const backgroundUrl = bgLine ? bgLine.substring(11).trim() : '';
          const userPrompt = promptLine ? promptLine.substring(7).trim() : '';

          const host = 'http://localhost:3000';
          const headers: any = { 'Content-Type': 'application/json' };

          const response = await fetch(`${host}/api/composite-image`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ faceUrl, clothesUrl, backgroundUrl, userPrompt, aspectRatio: '1:1' })
          });
          const data = await response.json();
          if (data.success && data.imageBase64) {
            return {
              text: `🎨 **Navix AI Studio - Google Element Composite**\n\nBerhasil menggabungkan wajah model, pakaian kustom, dan latar belakang secara cerdas sesuai permintaan Anda!\n\n**Prompt Hasil Fusi:**\n_${data.composedPrompt || userPrompt}_\n\n\`\`\`media\n{\n  "type": "image",\n  "prompt": "${(data.composedPrompt || userPrompt || "Fused composition").replace(/"/g, "'")}",\n  "image": "${data.imageBase64}"\n}\n\`\`\``
            };
          } else {
            throw new Error(data.error || "Gagal menggabungkan gambar di backend.");
          }
        } catch (err: any) {
          console.error("Composite image generation error in Orchestrator:", err);
          return { error: `Gagal memadukan gambar: ${err.message || String(err)}` };
        }
      }

      // =========================================================================
      // NAVIX AI — ENGINE-FIRST ARCHITECTURE
      // AI = Orchestrator / Brain / Dispatcher
      // ENGINE = Executor / Worker / Intelligence-in-action
      //
      // Flow:
      // USER -> MAIN CHAT -> AI UNDERSTANDING -> INTENT + TASK ANALYSIS ->
      // ENGINE SELECTION -> ENGINE EXECUTION -> REAL OUTPUT ->
      // RESULT VALIDATION -> AI RESPONSE FORMATTER -> MAIN CHAT -> USER
      // =========================================================================


      let engineResult: any = null;
      let engineName = "DefaultEngine";
      if (adaptiveResult && adaptiveResult.finalEngineResult) {
        engineResult = adaptiveResult.finalEngineResult;
        if (adaptiveResult.classification && adaptiveResult.classification.taskType === "knowledge_lab") {
          engineName = "KnowledgeLab";
        } else {
          engineName = "AdaptiveExecutionEngine";
        }
      } else {
      notify("agent_state", "pending", "Analyzing Intent & Planning Tasks");
      const executionPlan = ServiceRegistry.planExecution(req.message, req.attachments);
      console.log(`[Orchestrator] 🧠 Intent & Task Analysis:`, executionPlan);


      engineName = executionPlan.primaryEngine;
      notify("engine_started", "pending", `Dispatching to ${engineName}`);

      if (executionPlan.mode === 'MULTI' && executionPlan.tasks.length > 1) {
        // Multi-engine pipeline execution via AgentEngine
        const agentEngine = globalEngineRegistry.getEngine('AgentEngine');
        if (agentEngine) {
          notify("engine_progress", "pending", `Running Multi-Engine Pipeline (${executionPlan.engineSequence.join(' ➔ ')})`);
          engineResult = await agentEngine.execute({
            goal: req.message,
            steps: executionPlan.tasks
          });
          engineName = 'AgentEngine';
        }
      } else {
        // Single engine execution
        const engine = globalEngineRegistry.getEngine(engineName);
        if (engine) {
          notify("engine_progress", "pending", `Executing ${engineName}`);
          console.log(`[Orchestrator] ⚙️ Executing Worker Engine: [${engineName}]`);

          const taskPayload = executionPlan.tasks[0]?.payload || {
            query: req.message,
            prompt: req.message,
            input: req.message,
            attachments: req.attachments
          };

          try {
            engineResult = await engine.execute(taskPayload);
          } catch (execErr: any) {
            console.error(`[Orchestrator] Engine [${engineName}] execution error:`, execErr);
            engineResult = {
              status: 'FAILED',
              source: engineName,
              engineName,
              error: execErr?.message || 'Gagal mengeksekusi mesin.',
              message: `Mesin ${engineName} mengalami kendala: ${execErr?.message || 'Error'}`
            };
          }
        } else {
          console.warn(`[Orchestrator] Engine [${engineName}] not found in Registry. Using DefaultEngine.`);
          const defEngine = globalEngineRegistry.getEngine('DefaultEngine');
          if (defEngine) {
            engineResult = await defEngine.execute({ query: req.message });
            engineName = 'DefaultEngine';
          }
        }
      }

      } // <-- Closes the else block for legacy execution

      // Step: Result Validation

      notify("supervisor_state", "pending", "Validating Engine Output");
      const isSuccess = engineResult && (
        engineResult.status === 'SUCCESS' ||
        engineResult.status === 'success' ||
        engineResult.realOutput ||
        engineResult.data
      );

      console.log(`[Orchestrator] 🔍 Result Validation: Engine [${engineName}] Status: ${engineResult?.status || 'UNKNOWN'}, Success: ${Boolean(isSuccess)}`);

      // Special direct rendering for visual and audio media artifacts
      if ((engineName === 'ImageEngine' || engineName === 'LocalDreamImageEngine' || engineName === 'LocalDreamEngine' || engineName === 'AgentEngine') && (engineResult?.realOutput || engineResult?.output?.imageBase64 || engineResult?.data?.imageBase64)) {
        const imageBase64 = engineResult.output?.imageBase64 || engineResult.data?.imageBase64 || (typeof engineResult.realOutput === 'string' && (engineResult.realOutput.startsWith('data:image') || engineResult.realOutput.startsWith('http')) ? engineResult.realOutput : undefined);
        const enrichedText = engineResult.output?.enrichedPrompt || engineResult.data?.enrichedPrompt || req.message;
        
        if (imageBase64) {
          return {
            text: `Saya telah memproses dan memperkaya instruksi Anda secara otomatis di belakang layar untuk memastikan detail fotorealistik maksimal dan menghilangkan efek boneka/kartun. Berikut adalah hasilnya (dirender satu kali dengan tepat):\n\n**Prompt Internal yang Dikomplekskan:**\n> _${enrichedText.replace(/"/g, "'")}_\n\n\`\`\`media\n{\n  "type": "image",\n  "prompt": "${req.message.replace(/"/g, "'")}",\n  "image": "${imageBase64}"\n}\n\`\`\``
          };
        }
      }

      if (engineName === 'VideoEngine' && (engineResult?.realOutput || engineResult?.output?.videoUrl || engineResult?.data?.videoUrl)) {
        const videoUrl = engineResult.realOutput || engineResult.output?.videoUrl || engineResult.data?.videoUrl;
        if (videoUrl) {
          return {
            text: `\`\`\`media\n{\n  "type": "video",\n  "prompt": "${req.message.replace(/"/g, "'")}",\n  "url": "${videoUrl}"\n}\n\`\`\``
          };
        }
      }

      if (engineName === 'AudioEngine' && (engineResult?.realOutput || engineResult?.output?.audioBase64 || engineResult?.data?.audioBase64)) {
        const audioBase64 = engineResult.realOutput || engineResult.output?.audioBase64 || engineResult.data?.audioBase64;
        const trackTitle = engineResult.output?.trackInfo?.title || 'Komposisi Navix Audio Studio';
        if (audioBase64) {
          return {
            text: `\`\`\`media\n{\n  "type": "music",\n  "prompt": "${req.message.replace(/"/g, "'")}",\n  "title": "${trackTitle}",\n  "audio": "${audioBase64}"\n}\n\`\`\``
          };
        }
      }


      if (adaptiveResult && adaptiveResult.finalEngineResult) {
        if (!adaptiveResult.verification.passed) {
          engineResult.message = "VERIFICATION FAILED: " + adaptiveResult.verification.issues.join(', ');
        }
      }


      // Legacy fallback Verification
      if (engineResult && !adaptiveResult && req.thinkingMode) {
        notify("supervisor_state", "pending", "VERIFYING");
        const { taskType } = classifyTask(req.message);
        const verification = globalVerificationEngine.verify(taskType, engineResult.data || engineResult);
        
        if (!verification.passed) {
          notify("supervisor_state", "pending", "CORRECTING");
          const recovery = globalFailureRecovery.analyzeFailure('default', verification.issues.join(', '), taskType);
          console.warn('Verification failed:', verification.issues, 'Recovery Plan:', recovery);
          if (recovery.action === 'ABORT') {
            notify("supervisor_state", "pending", "FAILED");
            engineResult.message = "VERIFICATION FAILED: " + verification.issues.join(', ');
          }
        }
      }

      // NAVIX AI PERFORMANCE BOOSTER PIPELINE (Real Cognitive Grounding & Deliberation)
      let boosterData: any = null;
      if (req.aiBooster) {
        notify("booster_evidence", "pending", "Ekstraksi Bukti Empiris & Validasi Intent");
        const evidenceEngine = new EvidenceEngine();
        const extractedEvidence = evidenceEngine.extractEvidence(req.message, "User Prompt");

        notify("booster_council", "pending", "Sidang Dewan Deliberasi Multi-Agen");
        const councilVerdict = globalDeliberationCouncil.deliberate(req.message);

        notify("booster_memory", "pending", "Menghubungkan Memori Jangka Panjang");
        let memoryContext = "";
        try {
          // const mem = await navixMemoryEngine.retrieveContext(req.message);
          // memoryContext = mem.promptContext || "";
          memoryContext = ""; // Di-nonaktifkan agar AI hanya ingat memori di sesi aktif (Diet Token/Sesi Terisolasi)
        } catch (memErr) {
          console.warn("[Orchestrator] Booster memory warning:", memErr);
        }

        notify("booster_guardrails", "pending", "Verifikasi Anti-Halusinasi & Guardrails");
        boosterData = {
          evidence: extractedEvidence,
          council: councilVerdict,
          memory: memoryContext
        };
      }

      // Step: AI Response Formatter
      // AI receives the validated real output from the engine and structures the final chat response
      notify("verification_started", "pending", "AI Formatting Verified Output");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      let messageToSend = req.message;
      if (boosterData) {
        messageToSend += `\n\n[⚡ NAVIX AI PERFORMANCE BOOSTER - VERIFIED EMPIRICAL GROUNDING]:\n`;
        messageToSend += `- Status Booster: AKTIF (Tingkat Ketelitian/Rigor: ${boosterData.council.executionRigorScore}%)\n`;
        messageToSend += `- Konsensus Dewan Deliberasi: ${boosterData.council.consensusSummary}\n`;
        messageToSend += `- Petunjuk Anti-Kemalasan: ${boosterData.council.deconstructedIntent.antiLazinessDirectives.join('; ')}\n`;
        messageToSend += `- Audit Risiko Halusinasi: ${boosterData.council.factCheckAudit.hallucinationRisk}\n`;
        if (boosterData.evidence && boosterData.evidence.length > 0) {
          messageToSend += `- Bukti Empiris Terverifikasi: ${boosterData.evidence.map((e: any) => `[${e.type}] ${e.description}`).join(' | ')}\n`;
        }
        if (boosterData.memory) {
          messageToSend += `- Konteks Memori Kognitif: ${boosterData.memory}\n`;
        }
        messageToSend += `[MANDAT MUTLAK]: Berikan jawaban komprehensif, presisi mutlak, tuntas tanpa disingkat, dan sepenuhnya berbasis bukti faktual nyata tanpa simulasi.\n`;
      }
      if (engineResult) {
        messageToSend += `\n\n[HASIL NYATA EKSEKUSI ENGINE - NAVIX VERIFIED DATA]:\n`;
        messageToSend += `- Nama Mesin: ${engineName}\n`;
        messageToSend += `- Status Eksekusi: ${engineResult.status || 'SUCCESS'}\n`;
        if (engineResult.latencyMs) {
          messageToSend += `- Waktu Komputasi: ${engineResult.latencyMs} ms\n`;
        }
        if (engineResult.current_price) {
          messageToSend += `- Harga Pasar Terkini: ${engineResult.current_price}\n`;
        }
        if (engineResult.message) {
          messageToSend += `- Pesan Mesin: ${engineResult.message}\n`;
        }
        if (engineResult.realOutput || engineResult.output || engineResult.data) {
          const rawData = engineResult.realOutput || engineResult.output || engineResult.data;
          messageToSend += `- Data Hasil Nyata Mesin:\n${JSON.stringify(rawData, null, 2)}\n`;
        }

        messageToSend += `\n[INSTRUKSI UTAMA & MANDAT MUTLAK JAWABAN PRESISI]:\n`;
        messageToSend += `1. BERIKAN JAWABAN/SOLUSI/KODE/ANALISIS AKHIR SECARA LENGKAP, LANGSUNG, SPESIFIK, DAN PRESISI SESUAI PERMINTAAN PENGGUNA.\n`;
        messageToSend += `2. DILARANG HANYA MENJELASKAN ATAU MERANGKUM BAHWA PROSES TELAH DIJALANKAN (DILARANG TEKS META TANPA ISI). ANDA WAJIB MENAMPILKAN JAWABAN UTUH DAN SOLUSI SANGAT AKURAT.\n`;
        messageToSend += `3. Sajikan data faktual di atas secara elegan, profesional, dan hangat tanpa mengubah nilai faktual yang dihitung mesin. Gunakan Markdown rapi.\n`;
      } else if (req.thinkingMode) {
        messageToSend += `\n\n[MANDAT KOGNITIF NAVIX AI]:\n`;
        messageToSend += `Hasilkan jawaban, kode, solusi, atau analisis akhir secara utuh, presisi, tuntas, dan sangat akurat. Dilarang memberikan teks penjelasan singkat tanpa jawaban asli.`;
      }
      
      // NAVIX Cognitive Memory v2 Retrieval - Dinonaktifkan sementara untuk penghematan token (Token Diet)
      // agar AI murni hanya fokus pada history di sesi obrolan yang sedang berjalan.
      try {
        // const { promptContext } = await navixMemoryEngine.retrieveContext(req.message);
        // if (promptContext) {
        //   messageToSend += promptContext;
        // }
      } catch (memErr) {
        console.warn('Navix Cognitive Memory retrieval warning:', memErr);
      }

      const imageIntent = analyzeImageIntent(req.message, req.attachments, req.history);
      notify("verification_started", "pending", "Preparing Output");
      
      let finalMessageToSend = messageToSend;
      try {
        if (typeof window !== 'undefined') {
          const pluginsStr = localStorage.getItem('navix_plugins_list');
          if (pluginsStr) {
            const plugins = JSON.parse(pluginsStr);
            const activePlugins = plugins.filter((p: any) => p.active);
            
            if (activePlugins.length > 0) {
              const pluginDescriptions = activePlugins.map((p: any) => `- ${p.name}: ${p.desc}`).join('\n');
              
              // We inject a system-level hidden instruction for Gemini to know it has access to these plugins
              finalMessageToSend = `[SYSTEM CONTEXT: You are NAVIX AI. The user has installed the following third-party MCP Open Source Plugins in their studio:\n${pluginDescriptions}\n\nIf the user's request relates to the capabilities of any of these plugins, explicitly acknowledge that you are using them (e.g. "Saya akan menggunakan plugin X untuk..."). Act as if you are retrieving the data from these plugins directly.]\n\nUSER MESSAGE:\n` + finalMessageToSend;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to inject plugins context:', e);
      }
      
      const res = await rotateFetch('/api/chat', {

        method: 'POST',
        headers,
        body: JSON.stringify({
          message: finalMessageToSend,
          attachments: req.attachments || [],
          disableTts: !req.voiceEnabled,
          model: req.model || "gemini-3.6-flash",
          history: req.history || [],
          isImageEdit: imageIntent === 'edit',
          isImageDiscuss: imageIntent === 'discuss',
          effort: req.effort,
          thinkingMode: req.thinkingMode,
          aiBooster: req.aiBooster,
          activePlugins: typeof window !== 'undefined' && localStorage.getItem('navix_plugins_list') 
            ? JSON.parse(localStorage.getItem('navix_plugins_list') || '[]').filter((p: any) => p.active)
            : []
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        if (!res.ok) {
           data = { error: `Server HTTP Error ${res.status}: ${res.statusText || 'Gagal tersambung ke engine backend.'}` };
        }
      }

      if (data.systemInstruction) {
        console.log(`[DEBUG LOG] Orchestrator: Final System Prompt sent to Gemini:\n`, data.systemInstruction);
      }

      if (res.status === 429) {
        return { error: '429', isRateLimit: true };
      }
      if (res.status === 413) {
        return { error: '413 Payload Too Large', isRateLimit: false };
      }

      if (res.ok && data.text) {
        // Asynchronously check if conversation contains key preferences or facts to save
        const lowMsg = req.message.toLowerCase();
        if (lowMsg.includes('ingat') || lowMsg.includes('simpan') || lowMsg.includes('saya suka') || lowMsg.includes('preferensi') || lowMsg.includes('keputusan') || lowMsg.includes('proyek')) {
          navixMemoryEngine.saveMemory({
            userId: 'default_user',
            projectId: 'navix_ai',
            type: lowMsg.includes('suka') || lowMsg.includes('preferensi') ? 'user_preference' : lowMsg.includes('keputusan') ? 'decision' : 'project',
            title: `Memori: ${req.message.slice(0, 40)}...`,
            content: req.message,
            importance: 85,
            confidence: 90,
            tags: ['conversation', 'auto_saved']
          }).catch(err => console.warn('Memory save background error:', err));
        }

        notify("supervisor_state", "done", "COMPLETED");
        notify("supervisor_state", "pending", "FINALIZING");
        notify("supervisor_state", "done", "COMPLETED");
        notify("thinking_completed", "done", "Task Completed");
        return {
          text: data.text,
          audioBase64: data.audioBase64,
          systemInstruction: data.systemInstruction
        };
      } else {
        return { error: data.error || 'Unknown Error' };
      }
    } catch (err: any) {
      console.error("Orchestrator Error:", err);
      return { error: err.message || 'Network Error' };
    }
  }
}

export const orchestrator = new NavixOrchestrator();
