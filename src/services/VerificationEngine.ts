import { TaskType } from './ThinkingEngine';

export interface VerificationResult {
  passed: boolean;
  score: number;
  issues: string[];
  evidence: string;
}

export class VerificationEngine {
  public verify(taskType: TaskType, output: any): VerificationResult {
    const result: VerificationResult = {
      passed: true,
      score: 100,
      issues: [],
      evidence: 'Verification successfully completed.'
    };

    if (taskType === 'trading') {
      if (!output || !output.mainDirection) {
        result.passed = false;
        result.score = 0;
        result.issues.push('Missing trading signal direction.');
        result.evidence = 'Signal data is incomplete.';
      } else if (!output.mainSL || !output.mainTP1) {
        result.passed = false;
        result.score = 50;
        result.issues.push('Missing Stop Loss or Take Profit levels.');
        result.evidence = 'Risk management parameters missing.';
      }
    } else if (taskType === 'code') {
      const codeStr = output?.code || (typeof output === 'string' ? output : JSON.stringify(output || ''));
      if (!codeStr || codeStr.length < 5) {
        result.passed = false;
        result.score = 0;
        result.issues.push('No code generated.');
      } else if (codeStr.includes('TODO_UNIMPLEMENTED') || codeStr.includes('YOUR_API_KEY_HERE')) {
        result.passed = false;
        result.score = 70;
        result.issues.push('Code contains unresolved placeholder constants.');
      }
    } else if (taskType === 'security') {
      if (!output || (!output.defensePoliciesActive && !output.sanitizationResult && !output.vulnerabilities)) {
        result.passed = false;
        result.score = 40;
        result.issues.push('Security scan output incomplete or unverified.');
      }
    } else if (taskType === 'image' || taskType === 'video' || taskType === 'audio') {
      if (!output) {
        result.passed = false;
        result.score = 20;
        result.issues.push('Multimedia synthesis result is empty.');
      }
    } else if (taskType === 'document' || taskType === 'file_analysis') {
      if (!output || (typeof output === 'object' && Object.keys(output).length === 0)) {
        result.passed = false;
        result.score = 30;
        result.issues.push('Document semantic extraction produced no verifiable data.');
      }
    } else if (taskType === 'research' || taskType === 'data_analysis') {
      if (!output) {
        result.passed = false;
        result.score = 40;
        result.issues.push('Analytical and factual synthesis output missing.');
      }
    }

    return result;
  }
}

export const globalVerificationEngine = new VerificationEngine();
