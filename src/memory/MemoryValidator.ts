import { CreateMemoryInput } from '../types/memory';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateMemory(input: CreateMemoryInput): ValidationResult {
  if (!input.userId || typeof input.userId !== 'string') {
    return { valid: false, reason: 'userId wajib diisi.' };
  }

  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, reason: 'Judul memori tidak boleh kosong.' };
  }

  if (!input.content || input.content.trim().length === 0) {
    return { valid: false, reason: 'Konten memori tidak boleh kosong.' };
  }

  if (input.importance !== undefined && (input.importance < 0 || input.importance > 100)) {
    return { valid: false, reason: 'Nilai importance harus antara 0 dan 100.' };
  }

  if (input.confidence !== undefined && (input.confidence < 0 || input.confidence > 100)) {
    return { valid: false, reason: 'Nilai confidence harus antara 0 dan 100.' };
  }

  return { valid: true };
}
