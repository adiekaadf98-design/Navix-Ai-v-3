/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - ERROR HANDLER
 * Classifies multimedia errors into standardized categories.
 */

export type MultimediaErrorCategory = 
  | 'AUTH_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'BILLING_REQUIRED'
  | 'MODEL_NOT_FOUND'
  | 'INVALID_INPUT'
  | 'SAFETY_BLOCK'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface StructuredMultimediaError {
  category: MultimediaErrorCategory;
  message: string;
  originalError?: any;
  retryable: boolean;
  suggestedAction: string;
  timestamp: string;
}

export class MultimediaErrorHandler {
  public static classify(err: any): StructuredMultimediaError {
    const errMsg = String(err?.message || err || '').toLowerCase();
    const status = err?.status || err?.code || 0;

    let category: MultimediaErrorCategory = 'UNKNOWN_ERROR';
    let retryable = false;
    let suggestedAction = 'Periksa log sistem atau hubungi dukungan Navix.';

    if (
      status === 401 ||
      errMsg.includes('unauthenticated') ||
      errMsg.includes('api_key_invalid') ||
      errMsg.includes('invalid api key')
    ) {
      category = 'AUTH_ERROR';
      suggestedAction = 'Periksa API Key Gemini Anda di menu Pengaturan.';
    } else if (
      status === 429 ||
      errMsg.includes('resource_exhausted') ||
      errMsg.includes('quota') ||
      errMsg.includes('rate limit')
    ) {
      category = 'QUOTA_EXCEEDED';
      retryable = true;
      suggestedAction = 'Quota tier tercapai. Beralih otomatis ke tier fallback atau tunggu beberapa detik.';
    } else if (
      errMsg.includes('billing') ||
      errMsg.includes('payment') ||
      errMsg.includes('paid model') ||
      errMsg.includes('enable billing')
    ) {
      category = 'BILLING_REQUIRED';
      suggestedAction = 'Model ini membutuhkan API Key berbayar. Gunakan alur pengaturan API Key berbayar.';
    } else if (
      status === 404 ||
      errMsg.includes('model not found') ||
      errMsg.includes('unsupported model')
    ) {
      category = 'MODEL_NOT_FOUND';
      suggestedAction = 'Model tidak tersedia atau telah digantikan. Periksa ModelRegistry.';
    } else if (
      errMsg.includes('safety') ||
      errMsg.includes('blocked') ||
      errMsg.includes('content policy')
    ) {
      category = 'SAFETY_BLOCK';
      suggestedAction = 'Konten dibatasi oleh filter keamanan AI Studio.';
    } else if (
      errMsg.includes('invalid') ||
      errMsg.includes('payload') ||
      errMsg.includes('empty') ||
      errMsg.includes('unsupported')
    ) {
      category = 'INVALID_INPUT';
      suggestedAction = 'Periksa format MIME, base64 payload, atau resolusi file media.';
    } else if (
      errMsg.includes('network') ||
      errMsg.includes('timeout') ||
      errMsg.includes('fetch failed') ||
      errMsg.includes('econnrefused')
    ) {
      category = 'NETWORK_ERROR';
      retryable = true;
      suggestedAction = 'Koneksi jaringan terputus. Ulangi permintaan dalam beberapa saat.';
    }

    return {
      category,
      message: err?.message || String(err),
      originalError: err,
      retryable,
      suggestedAction,
      timestamp: new Date().toISOString()
    };
  }
}
