import { TaskType } from './ThinkingEngine';

export interface VerificationResult {
  passed: boolean;
  score: number;
  issues: string[];
  evidence: string;
  domain?: string;
  auditTrail?: Record<string, any>;
}

export class VerificationEngine {
  public verify(taskType: TaskType | string, output: any): VerificationResult {
    const result: VerificationResult = {
      passed: true,
      score: 100,
      issues: [],
      evidence: 'Verification successfully completed.',
      domain: String(taskType)
    };

    if (!output) {
      return {
        passed: false,
        score: 0,
        issues: ['Output is empty or null (Zero execution data).'],
        evidence: 'Engine returned no data.',
        domain: String(taskType)
      };
    }

    const dataObj = output?.data || output?.output || output?.realOutput || output;

    switch (taskType) {
      case 'trading': {
        const direction = dataObj?.direction || dataObj?.mainDirection;
        const entry = dataObj?.entry || dataObj?.entryPrice;
        const sl = dataObj?.sl || dataObj?.slPrice || dataObj?.mainSL;
        const tp = dataObj?.tp || dataObj?.tpPrice || dataObj?.mainTP1;
        const activeMethod = dataObj?.activeMethod || dataObj?.engineKey || dataObj?.activeEngine;

        if (!direction || !entry) {
          result.passed = false;
          result.score = Math.min(result.score, 20);
          result.issues.push('Missing trading direction or entry price.');
          result.evidence = 'Signal lacks entry structure.';
        }
        if (!sl || !tp) {
          result.passed = false;
          result.score = Math.min(result.score, 50);
          result.issues.push('Missing Stop Loss (Invalidation) or Take Profit (Target) levels.');
          result.evidence = 'Risk management parameters missing.';
        }
        if (dataObj.crossMethodContamination === true) {
          result.passed = false;
          result.score = Math.min(result.score, 30);
          result.issues.push('Cross-method contamination detected. Single method isolation violated.');
          result.evidence = 'Hard isolation rule failure.';
        }
        if (result.passed) {
          result.evidence = `Trading signal verified: ${activeMethod || 'Native'} ${direction.toUpperCase()} @ ${entry} (SL: ${sl}, TP: ${tp})`;
        }
        break;
      }

      case 'code':
      case 'coding':
      case 'code_engineering': {
        const codeStr = dataObj?.code || (typeof dataObj === 'string' ? dataObj : JSON.stringify(dataObj || ''));
        if (!codeStr || codeStr.length < 10) {
          result.passed = false;
          result.score = 0;
          result.issues.push('No executable code generated.');
          result.evidence = 'Empty code payload.';
        } else if (codeStr.includes('TODO_UNIMPLEMENTED') || codeStr.includes('YOUR_API_KEY_HERE') || codeStr.includes('PLACEHOLDER_NOT_REAL')) {
          result.passed = false;
          result.score = 60;
          result.issues.push('Code contains unresolved placeholder constants or mock tokens.');
          result.evidence = 'Fake success placeholder detected.';
        } else {
          // Check basic bracket balancing
          let openBrackets = 0;
          for (let i = 0; i < codeStr.length; i++) {
            if (codeStr[i] === '{') openBrackets++;
            if (codeStr[i] === '}') openBrackets--;
          }
          if (openBrackets !== 0) {
            result.issues.push('Warning: Potential unbalanced curly braces detected.');
            result.score = 85;
          }
          result.evidence = `Code artifact verified (${codeStr.length} characters).`;
        }
        break;
      }

      case 'image':
      case 'shadow_engine': {
        const hasImage = dataObj?.imageBase64 || dataObj?.url || (typeof dataObj === 'string' && (dataObj.startsWith('data:image') || dataObj.startsWith('http')));
        if (!hasImage) {
          result.passed = false;
          result.score = 10;
          result.issues.push('Image generation returned no image binary, base64 payload, or valid URI.');
          result.evidence = 'Missing visual image output.';
        } else {
          result.evidence = 'Visual image artifact validated successfully.';
        }
        break;
      }

      case 'video': {
        const hasVideo = dataObj?.videoUrl || dataObj?.url || dataObj?.videoBase64 || (typeof dataObj === 'string' && (dataObj.startsWith('data:video') || dataObj.startsWith('http') || dataObj.includes('.mp4')));
        if (!hasVideo) {
          result.passed = false;
          result.score = 10;
          result.issues.push('Video synthesis produced no playable stream or URL.');
          result.evidence = 'Missing video artifact.';
        } else {
          result.evidence = 'Video stream artifact validated.';
        }
        break;
      }

      case 'audio': {
        const hasAudio = dataObj?.audioBase64 || dataObj?.url || (typeof dataObj === 'string' && (dataObj.startsWith('data:audio') || dataObj.startsWith('http')));
        if (!hasAudio) {
          result.passed = false;
          result.score = 20;
          result.issues.push('Audio synthesis returned no playable audio stream.');
          result.evidence = 'Missing audio payload.';
        } else {
          result.evidence = 'Audio waveform artifact validated.';
        }
        break;
      }

      case 'document':
      case 'file_analysis': {
        const hasContent = dataObj?.text || dataObj?.markdown || dataObj?.extractedData || dataObj?.tables || (typeof dataObj === 'object' && Object.keys(dataObj).length > 1);
        if (!hasContent) {
          result.passed = false;
          result.score = 30;
          result.issues.push('Document semantic extraction produced no verifiable textual or tabular data.');
          result.evidence = 'Empty document extraction.';
        } else {
          result.evidence = 'Document structured extraction verified.';
        }
        break;
      }

      case 'research':
      case 'data_analysis': {
        if (!dataObj || output.status === 'FAILED' || output.status === 'error') {
          result.passed = false;
          result.score = 30;
          result.issues.push(output.message || output.error || 'Analytical and factual research synthesis failed.');
          result.evidence = 'Failed research execution.';
        } else {
          result.evidence = 'Research & analytical synthesis verified.';
        }
        break;
      }

      case 'security': {
        if (!dataObj || (!dataObj.defensePoliciesActive && !dataObj.sanitizationResult && !dataObj.vulnerabilities && !dataObj.inspected)) {
          result.passed = false;
          result.score = 40;
          result.issues.push('Security scan output incomplete or unverified.');
          result.evidence = 'Security guardrail audit failed.';
        } else {
          result.evidence = 'Zero-trust security inspection verified.';
        }
        break;
      }

      case 'quiz':
      case 'knowledge_lab':
      case 'scientific_lab': {
        if (!dataObj || output.status === 'error' || output.status === 'FAILED') {
          result.passed = false;
          result.score = 40;
          result.issues.push('Scientific lab or Quiz generation output incomplete.');
          result.evidence = 'Knowledge lab distillation failed.';
        } else {
          result.evidence = 'Knowledge lab distillation verified.';
        }
        break;
      }

      case 'skill':
      case 'mcp': {
        if (!dataObj || output.status === 'error' || output.success === false) {
          result.passed = false;
          result.score = 30;
          result.issues.push(output.message || output.error || 'Skill execution failed or returned invalid status.');
          result.evidence = 'MCP skill error.';
        } else {
          result.evidence = 'Skill execution verified.';
        }
        break;
      }

      default: {
        if (output.status === 'FAILED' || output.status === 'error') {
          result.passed = false;
          result.score = 40;
          result.issues.push(output.message || output.error || 'General execution failed.');
        } else {
          result.evidence = 'Standard output contract verified.';
        }
        break;
      }
    }

    result.auditTrail = {
      timestamp: Date.now(),
      taskType: String(taskType),
      score: result.score,
      passed: result.passed,
      issuesCount: result.issues.length
    };

    return result;
  }
}

export const globalVerificationEngine = new VerificationEngine();

