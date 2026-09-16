import { TaskType } from './ThinkingEngine';

export interface ToolCapability {
  name: string;
  description: string;
  requiredInput: string;
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
    { name: 'DataAnalyticsCalculator', description: 'Deterministic statistical and numerical aggregations', requiredInput: 'dataset' },
    { name: 'SecurityShieldAuditor', description: 'Zero-trust sanitization and vulnerability inspection', requiredInput: 'payload' }
  ];

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
}

export const globalToolSelector = new ToolSelector();
