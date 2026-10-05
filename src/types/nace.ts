/**
 * NAVIX PRO AI — NACE (NAVIX Adaptive Cognitive Engine) CONTRACT
 * 
 * Target Architecture:
 * USER -> MAIN CHAT / AI DEBATE -> NACE (Understand, Complexity, Decompose, Capability, Dynamic Plan)
 *      -> EXISTING PILGUN / TOOL SELECTOR -> EXISTING ADAPTIVE EXECUTION ENGINE
 *      -> SPECIALIST ENGINES -> EXISTING VERIFICATION ENGINE -> MEMORY / OBSERVABILITY -> RESULT
 * 
 * Strict Hard Rules:
 * - Anti-monolith, anti-wrapper, anti-mock
 * - Reuses and strengthens existing contracts (ExecutionPlan, WorkflowStep, Subtask, VerificationResult, EngineResult)
 * - Model-agnostic & bounded execution
 */

import type { VerificationResult } from '../services/VerificationEngine';
import type { EngineResult, EngineStatus } from './engine';
import type { TaskType } from '../services/ThinkingEngine';

// ============================================================================
// 1. TASK ENVELOPE (Cognitive Ingestion Contract)
// ============================================================================

export interface DeliberationMandate {
  primaryGoal: string;
  category: string;
  targetCapability?: string;
  recommendedEngine?: string;
  implicitConstraints: string[];
  prohibitedAssumptions: string[];
  antiLazinessDirectives: string[];
  dialogueLog?: Array<{
    agentId: string;
    agentName: string;
    role: string;
    thought: string;
    critique?: string;
    recommendation: string;
    timestamp: number;
  }>;
}

export interface TaskEnvelope {
  taskId: string;
  sessionId?: string;
  userId?: string;
  rawRequest: string;
  context?: {
    history?: Array<{ role: string; content?: string; text?: string; parts?: any[] }>;
    attachments?: any[];
    attachmentsCount?: number;
    globalMemory?: string;
    deliberationMandate?: DeliberationMandate;
    deliberationVerdict?: any;
    metadata?: Record<string, any>;
  };
  createdAt: number;
}

// ============================================================================
// 2. COGNITIVE UNDERSTANDING & INTENT CONTRACTS
// ============================================================================

export type TaskDomain =
  | 'CHAT'
  | 'TRADING'
  | 'MATH'
  | 'CODE'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'RESEARCH'
  | 'DATA_ANALYSIS'
  | 'SECURITY'
  | 'SKILL'
  | 'SYSTEM';

export interface TaskIntent {
  name: string;
  domain: TaskDomain;
  taskType: TaskType | string;
  primaryGoal: string;
  rawIntent: string;
  confidence: number; // 0.0 - 1.0
}

export type NaceComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'DEEP';

// Backward-compatible mapping for existing TaskComplexity ('SIMPLE' | 'MODERATE' | 'COMPLEX' | 'CRITICAL')
export type LegacyComplexityLevel = 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'CRITICAL';

export function toNaceComplexity(legacy: LegacyComplexityLevel | string): NaceComplexityLevel {
  switch (legacy) {
    case 'SIMPLE': return 'LOW';
    case 'MODERATE': return 'MEDIUM';
    case 'COMPLEX': return 'HIGH';
    case 'CRITICAL': return 'DEEP';
    case 'LOW': return 'LOW';
    case 'MEDIUM': return 'MEDIUM';
    case 'HIGH': return 'HIGH';
    case 'DEEP': return 'DEEP';
    default: return 'MEDIUM';
  }
}

export function toLegacyComplexity(nace: NaceComplexityLevel | string): LegacyComplexityLevel {
  switch (nace) {
    case 'LOW': return 'SIMPLE';
    case 'MEDIUM': return 'MODERATE';
    case 'HIGH': return 'COMPLEX';
    case 'DEEP': return 'CRITICAL';
    default: return 'MODERATE';
  }
}

export type VerificationLevel = 'NONE' | 'BASIC' | 'RIGOROUS' | 'VERITAS_AUDIT';

export type ExecutionDepth = 'FAST_PATH' | 'NORMAL_PATH' | 'DEEP_PATH';

export interface CognitiveUnderstanding {
  intent: TaskIntent;
  domain: TaskDomain;
  complexity: NaceComplexityLevel;
  requiredCapabilities: string[];
  constraints: string[];
  verificationLevel: VerificationLevel;
  executionDepth: ExecutionDepth;
  rationale: string[];
  deliberationMandate?: DeliberationMandate;
  timestamp: number;
}

// ============================================================================
// 3. CAPABILITY DESCRIPTOR CONTRACT
// ============================================================================

export interface CapabilityDescriptor {
  name: string;
  domain: TaskDomain;
  description: string;
  requiredInputs: string[];
  producedOutputs: string[];
  supportedEngines: string[];
  isDeterministic: boolean; // e.g. true for Math, false for Creative
  verificationMethod?: string;
  minHealthScore?: number;
}

// ============================================================================
// 4. DYNAMIC EXECUTION PLAN & STEP CONTRACTS
// ============================================================================

export interface StepInputContract {
  requiredKeys: string[];
  optionalKeys?: string[];
  schemaDescription?: string;
}

export interface StepOutputContract {
  expectedKeys: string[];
  validationRule?: string;
}

export interface StepVerificationRequirement {
  required: boolean;
  domain?: string;
  strictGate?: boolean; // If true, failure aborts the chain immediately
  allowRecalculate?: boolean;
  maxRecalculateRetries?: number;
}

export interface NaceExecutionStep {
  stepId: string;
  sequence: number;
  objective: string;
  requiredCapability: string;
  preferredEngine?: string;
  fallbackEngine?: string;
  assignedEngine?: string;
  inputContract: StepInputContract;
  outputContract: StepOutputContract;
  verificationRequirement: StepVerificationRequirement;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  inputData?: any;
  outputData?: any;
  error?: string;
  latencyMs?: number;
}

export interface ExecutionPolicy {
  fastPath: boolean;
  timeoutMs: number;
  maxRetries: number;
  allowParallel: boolean;
  failClosedOnVerification: boolean;
}

export interface NaceExecutionPlan {
  planId: string;
  taskId: string;
  complexity: NaceComplexityLevel;
  steps: NaceExecutionStep[];
  requiredCapabilities: string[];
  verificationLevel: VerificationLevel;
  executionPolicy: ExecutionPolicy;
  createdAt: number;
  status: 'DRAFT' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'ABORTED';
}

// ============================================================================
// 5. EXECUTION RESULT & OBSERVABILITY CONTRACTS
// ============================================================================

export interface NaceExecutionResult<T = any> {
  taskId: string;
  planId: string;
  stepId?: string;
  engineName: string;
  status: 'SUCCESS' | 'FAILURE' | 'SKIPPED';
  outputData: T;
  latencyMs: number;
  error?: string;
  verification?: VerificationResult;
  timestamp: number;
}

export interface NaceObservabilityEntry {
  taskId: string;
  planId: string;
  stepId?: string;
  capability: string;
  selectedEngine: string;
  state: string;
  timestamp: number;
  latencyMs: number;
  resultStatus: EngineStatus | 'SUCCESS' | 'FAILURE';
  verificationPassed?: boolean;
  failureReason?: string;
  recoveryApplied?: string;
}

// ============================================================================
// 6. CONTRACT RE-EXPORTS & INTEGRATION ADAPTERS
// ============================================================================

export type { VerificationResult } from '../services/VerificationEngine';
export type { EngineResult, EngineStatus, IEngine } from './engine';
