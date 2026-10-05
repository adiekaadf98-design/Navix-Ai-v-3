/**
 * NAVIX PRO AI — ARTIFACT MANAGER & LIFECYCLE ENGINE (MACHINE 19)
 * 
 * Manages the authoritative lifecycle of system artifacts:
 * - Identification & MIME validation
 * - Non-zero byte verification
 * - Deterministic integrity hash
 * - Storage coordination with mediaStore and MediaStorageManager
 * - Lineage tracking for downstream Machine-to-Machine handoffs
 */

import { IEngine, EngineResult } from '../../types/engine';
import { mediaStore } from '../../utils/mediaStorage';

export interface ArtifactReference {
  artifactId: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'code' | 'data' | 'other';
  mimeType: string;
  byteLength: number;
  uri: string;
  integrityHash: string;
  sourceEngine: string;
  createdAt: number;
  metadata?: Record<string, any>;
  verificationPassed: boolean;
}

export class ArtifactManager implements IEngine {
  public name = 'ArtifactManager';
  public description = 'Authoritative manager for multimodal and data artifact lifecycles, integrity verification, and storage.';
  public category: 'general' = 'general';
  public capabilities = ['artifact', 'artifact_manager', 'media_storage', 'artifact_lifecycle'];

  private registry: Map<string, ArtifactReference> = new Map();

  /**
   * Generates a stable deterministic integrity hash from artifact payload string/bytes.
   */
  public generateIntegrityHash(content: string | Uint8Array): string {
    let hash = 0x811c9dc5; // FNV-1a 32-bit offset
    if (typeof content === 'string') {
      for (let i = 0; i < content.length; i++) {
        hash ^= content.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
    } else {
      for (let i = 0; i < content.length; i++) {
        hash ^= content[i];
        hash = Math.imul(hash, 0x01000193);
      }
    }
    return `fnv1a_${(hash >>> 0).toString(16)}`;
  }

  /**
   * Registers a newly synthesized artifact with strict byte and MIME checks.
   */
  public registerArtifact(params: {
    artifactId?: string;
    category: 'image' | 'video' | 'audio' | 'document' | 'code' | 'data' | 'other';
    mimeType: string;
    payload: string | Uint8Array;
    uri?: string;
    sourceEngine: string;
    metadata?: Record<string, any>;
  }): ArtifactReference {
    const rawPayload = params.payload;
    const byteLength = typeof rawPayload === 'string'
      ? (rawPayload.startsWith('data:') ? Math.round((rawPayload.length - rawPayload.indexOf(',') - 1) * 0.75) : Buffer.byteLength(rawPayload, 'utf8'))
      : rawPayload.length;

    if (byteLength <= 0) {
      throw new Error(`[ArtifactManager] Cannot register empty artifact (byteLength: ${byteLength})`);
    }

    const artifactId = params.artifactId || `navix_art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const integrityHash = this.generateIntegrityHash(rawPayload);
    const uri = params.uri || (typeof rawPayload === 'string' && rawPayload.startsWith('data:') ? rawPayload : `/api/artifacts/${artifactId}`);

    const ref: ArtifactReference = {
      artifactId,
      category: params.category,
      mimeType: params.mimeType,
      byteLength,
      uri,
      integrityHash,
      sourceEngine: params.sourceEngine,
      createdAt: Date.now(),
      metadata: params.metadata,
      verificationPassed: byteLength > 0 && Boolean(params.mimeType)
    };

    this.registry.set(artifactId, ref);

    // Sync to mediaStore if it is an image/video/audio in browser environment
    try {
      if (typeof window !== 'undefined' && typeof rawPayload === 'string' && rawPayload.startsWith('data:')) {
        mediaStore.saveMediaToVault(artifactId, {
          type: params.category,
          prompt: params.metadata?.prompt || 'System Artifact',
          mediaUrl: uri
        }).catch(() => {});
      }
    } catch {}

    return ref;
  }

  /**
   * Retrieves an artifact reference by ID.
   */
  public getArtifact(artifactId: string): ArtifactReference | undefined {
    return this.registry.get(artifactId);
  }

  /**
   * Validates whether an artifact reference satisfies completion requirements:
   * Non-zero bytes, recognized MIME type, and verifiable URI.
   */
  public validateArtifactForCompletion(ref: ArtifactReference | any): { valid: boolean; reason?: string } {
    if (!ref) {
      return { valid: false, reason: 'Artifact reference is null or undefined.' };
    }
    if (typeof ref.byteLength !== 'number' || ref.byteLength <= 0) {
      return { valid: false, reason: `Artifact byte length invalid (${ref.byteLength}).` };
    }
    if (!ref.mimeType || typeof ref.mimeType !== 'string' || !ref.mimeType.includes('/')) {
      return { valid: false, reason: `Invalid MIME type (${ref.mimeType}).` };
    }
    if (!ref.uri || typeof ref.uri !== 'string' || ref.uri.length < 5) {
      return { valid: false, reason: 'Invalid or inaccessible artifact URI.' };
    }
    return { valid: true };
  }

  /**
   * IEngine execution endpoint.
   */
  public async execute(input: any, _signal?: AbortSignal): Promise<EngineResult> {
    const action = input?.action || 'register';

    if (action === 'get') {
      const art = this.getArtifact(input.artifactId);
      if (!art) {
        return {
          status: 'FAILED',
          source: 'ArtifactManager',
          error: `Artifact [${input.artifactId}] not found in registry.`
        };
      }
      return {
        status: 'SUCCESS',
        source: 'ArtifactManager',
        data: art
      };
    }

    if (action === 'validate') {
      const validation = this.validateArtifactForCompletion(input.artifact || input);
      return {
        status: validation.valid ? 'SUCCESS' : 'FAILED',
        source: 'ArtifactManager',
        data: validation,
        error: validation.reason
      };
    }

    // Default: Register payload
    try {
      const payload = input.payload || input.data || input.base64 || input.text || '';
      const ref = this.registerArtifact({
        artifactId: input.artifactId,
        category: input.category || 'other',
        mimeType: input.mimeType || 'application/octet-stream',
        payload,
        uri: input.uri,
        sourceEngine: input.sourceEngine || 'UnknownEngine',
        metadata: input.metadata
      });

      return {
        status: 'SUCCESS',
        source: 'ArtifactManager',
        data: ref,
        realOutput: ref
      };
    } catch (err: any) {
      return {
        status: 'FAILED',
        source: 'ArtifactManager',
        error: err.message
      };
    }
  }
}

export const globalArtifactManager = new ArtifactManager();
