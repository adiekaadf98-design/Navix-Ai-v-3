import ErrorBoundary from "./ErrorBoundary";
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Suppress "Script error." and third-party script failures in the sandbox environment
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || "");
    const src = String(source || "");
    if (
      msg.includes("Script error") || 
      src.includes("tradingview") || 
      src.includes("chrome-extension") ||
      msg.includes("SecurityError") ||
      msg.includes("ResizeObserver")
    ) {
      console.warn("Muted benign cross-origin/script error:", msg, src);
      return true; // Prevent default error handler from showing the error overlay
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    const msg = String(event.message || "");
    const src = String(event.filename || "");
    if (
      msg.includes("Script error") || 
      src.includes("tradingview") || 
      src.includes("chrome-extension") ||
      msg.includes("SecurityError") ||
      msg.includes("ResizeObserver")
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.warn("Muted event listener cross-origin error:", msg, src);
    }
  }, { capture: true });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || "");
    if (reason.includes("tradingview") || reason.includes("SecurityError")) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.warn("Muted unhandled rejection:", reason);
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>,
);

