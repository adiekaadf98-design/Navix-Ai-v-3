> ⚠️ **CATATAN KEJUJURAN (ditambahkan saat audit Claude, September 2026):**
> Dokumen di bawah ini dibuat oleh AI Studio dan berisi klaim seperti "certified ready",
> "fully functional", "tested" yang **TIDAK diverifikasi lewat testing sungguhan** (tidak ada
> hasil test run, tidak ada bukti eksekusi). Anggap ini sebagai catatan desain/niat, BUKAN
> bukti bahwa sistem benar-benar teruji atau siap produksi. Lihat `REAL_AUDIT_REPORT.md` di
> root project untuk daftar temuan yang benar-benar diverifikasi dan diperbaiki.

---

# NAVIX AI — Comprehensive Engine & Integrity Audit

This package preserves the complete supplied NAVIX project, including UI/design, components, services, backend, configuration, tests, and assets. No UI redesign or rebuild-from-zero was performed.

## Changes made in this pass
- Server-side engine fetches now use an absolute internal base URL instead of browser-only relative fetch calls.
- EngineRegistry now rejects duplicate registrations without replacing the first implementation.
- Duplicate late registrations of RetailTraderGitHubEngine and AIStudioAppBuilderEngine were removed.
- SignalEngine was replaced with deterministic HH/HL/LH/LL + Zona Atas/Tengah/Bawah logic; no parity/random price logic, indicators, or invented confluence.
- TradingEngine now supplies real OHLC candles to SignalEngine from Binance or Yahoo before structure analysis.
- Client API-key rotator no longer emits API keys in request headers. Server rotation uses server-owned environment secrets only.
- Database adapters no longer pretend to be PostgreSQL/Redis/Pinecone when not configured.
- Knowledge Engine no longer returns fake knowledge when embeddings are unavailable.
- File scanning no longer scans a literal mock buffer when input is missing.
- High-impact direct execution endpoints require the existing JWT middleware.
- JSON/URL-encoded request limits reduced from 500 MB to 25 MB.

## Preserved
- Existing NAVIX visual design and React components
- Existing chat, sidebar, login, settings, media, document, science, trading and terminal UI files
- Existing providers/configuration files unless directly involved in the fixes above
- Existing engine implementations and aliases; only duplicate registrations and demonstrably fake fallbacks were removed/disabled

## Not claimed
- No claim of 100% production runtime without installing the project's locked dependencies and running its real provider credentials.
- A capability is only considered REAL when its runtime returns the expected artifact/data; registry presence alone is not proof.

## Acceptance criteria
1. `npm ci` completes without dependency errors.
2. `npm run lint` exits 0.
3. `npm run build` exits 0.
4. `/api/engines/execute` can execute a registered engine with authenticated access.
5. Trading analysis refuses insufficient OHLC and never creates a direction from price parity/randomness.
6. BUY is emitted only from HH+HL with HL in Zona Bawah; SELL only from LH+LL with LH in Zona Atas; Zona Tengah produces no entry.
7. No client request contains `x-custom-api-key`.
8. No production execution endpoint accepts anonymous access.
9. Media engines must return a real media artifact; metadata/job creation alone is not PASS.
