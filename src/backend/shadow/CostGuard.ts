// List of capability/service identifiers that are known to require a paid
// tier (RunPod, Replicate, paid Vertex GPU inference, paid Veo access, etc).
// Anything in this list is blocked whenever isFreeOnlyMode is true.
const PAID_ONLY_CAPABILITIES = new Set([
  'runpod',
  'replicate',
  'vertex-gpu-paid',
  'veo-paid',
  'paid-tts-premium',
  'paid-image-4k'
]);

export class CostGuardService {
    // NAVIX is intentionally free-tier-only: it must never silently incur
    // cost to the developer's Google Cloud / Gemini billing account.
    public isFreeOnlyMode = true;

    /**
     * REAL check (previously this always returned `{ allowed: true }`
     * regardless of input, which made the guard a no-op). Now it actually
     * inspects the requested capabilities against the paid-only list.
     */
    public checkService(capabilities: string[]): { allowed: boolean, reason?: string } {
        if (!this.isFreeOnlyMode) {
            return { allowed: true };
        }

        const blocked = (capabilities || []).filter(cap => PAID_ONLY_CAPABILITIES.has((cap || '').toLowerCase()));
        if (blocked.length > 0) {
            return {
                allowed: false,
                reason: `PAID_SERVICE_REQUIRED: capability(ies) [${blocked.join(', ')}] require a paid tier and NAVIX is running in FREE_ONLY mode.`
            };
        }
        return { allowed: true };
    }
}

export const globalCostGuard = new CostGuardService();
