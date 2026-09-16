// Custom Toast Utility for Navix AI
// Provides a simple, lightweight custom-event based emitter to show toast alerts across any component.

export type ToastType = 'success' | 'error' | 'info' | 'warn';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = 'info') {
  const event = new CustomEvent('navix-toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
}

export function showSuccessToast(message: string) {
  showToast(message, 'success');
}

export function showErrorToast(message: string) {
  showToast(message, 'error');
}
