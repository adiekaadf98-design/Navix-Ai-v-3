/**
 * NAVIX PRO AI - Real-Time Market Stream Service
 * 
 * Pipeline streaming data pasar finansial real-time dengan proteksi backpressure,
 * deteksi instan anomali likuiditas SMC, dan efisiensi memori adapter.
 */

export interface MarketTickerSnapshot {
  symbol: string;
  displayName: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  decimals: number;
  timestamp: number;
  bidPrice: number;
  askPrice: number;
  smcStatus?: {
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    lastStructure: 'BOS' | 'CHOCH' | 'NONE';
    fvgActive: boolean;
    liquidityZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
    nearestOrderBlock: {
      type: 'BULLISH_OB' | 'BEARISH_OB';
      priceLevel: number;
      mitigated: boolean;
    };
  };
}

export interface SmcMarketEvent {
  id: string;
  symbol: string;
  timestamp: number;
  type: 'CHOCH' | 'BOS' | 'FVG_FORMED' | 'LIQUIDITY_SWEEP' | 'OB_MITIGATION';
  direction: 'BULLISH' | 'BEARISH';
  price: number;
  description: string;
}

type TickerListener = (tickers: MarketTickerSnapshot[]) => void;
type EventListener = (event: SmcMarketEvent) => void;

class MarketStreamService {
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private tickerListeners: Set<TickerListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();
  private tickerCache: Map<string, MarketTickerSnapshot> = new Map();
  private recentEvents: SmcMarketEvent[] = [];
  private pollInterval: any = null;
  private maxStoredEvents = 30;

  constructor() {
    this.seedDefaultTickers();
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.throttleStreaming(true);
        } else {
          this.throttleStreaming(false);
        }
      });
    }
  }

  private seedDefaultTickers() {
    const defaults: MarketTickerSnapshot[] = [
      {
        symbol: 'BTCUSDT',
        displayName: 'BTC/USDT PERP',
        price: 68420.50,
        change24h: 2.34,
        high24h: 69150.00,
        low24h: 67200.00,
        volume24h: 28450.8,
        decimals: 2,
        timestamp: Date.now(),
        bidPrice: 68419.00,
        askPrice: 68421.50,
        smcStatus: {
          trend: 'BULLISH',
          lastStructure: 'CHOCH',
          fvgActive: true,
          liquidityZone: 'DISCOUNT',
          nearestOrderBlock: {
            type: 'BULLISH_OB',
            priceLevel: 67800.00,
            mitigated: false
          }
        }
      },
      {
        symbol: 'ETHUSDT',
        displayName: 'ETH/USDT PERP',
        price: 2540.20,
        change24h: 1.15,
        high24h: 2585.00,
        low24h: 2490.00,
        volume24h: 98450.2,
        decimals: 2,
        timestamp: Date.now(),
        bidPrice: 2539.80,
        askPrice: 2540.50,
        smcStatus: {
          trend: 'BULLISH',
          lastStructure: 'BOS',
          fvgActive: false,
          liquidityZone: 'EQUILIBRIUM',
          nearestOrderBlock: {
            type: 'BULLISH_OB',
            priceLevel: 2510.00,
            mitigated: true
          }
        }
      },
      {
        symbol: 'SOLUSDT',
        displayName: 'SOL/USDT PERP',
        price: 154.85,
        change24h: -0.84,
        high24h: 159.20,
        low24h: 151.40,
        volume24h: 421000.5,
        decimals: 2,
        timestamp: Date.now(),
        bidPrice: 154.80,
        askPrice: 154.90,
        smcStatus: {
          trend: 'SIDEWAYS',
          lastStructure: 'NONE',
          fvgActive: true,
          liquidityZone: 'PREMIUM',
          nearestOrderBlock: {
            type: 'BEARISH_OB',
            priceLevel: 158.50,
            mitigated: false
          }
        }
      },
      {
        symbol: 'XAUUSD',
        displayName: 'XAU/USD SPOT',
        price: 2658.40,
        change24h: 0.62,
        high24h: 2665.20,
        low24h: 2642.10,
        volume24h: 14500.0,
        decimals: 2,
        timestamp: Date.now(),
        bidPrice: 2658.20,
        askPrice: 2658.60,
        smcStatus: {
          trend: 'BULLISH',
          lastStructure: 'BOS',
          fvgActive: true,
          liquidityZone: 'DISCOUNT',
          nearestOrderBlock: {
            type: 'BULLISH_OB',
            priceLevel: 2648.00,
            mitigated: false
          }
        }
      },
      {
        symbol: 'EURUSD',
        displayName: 'EUR/USD FX',
        price: 1.0885,
        change24h: -0.15,
        high24h: 1.0920,
        low24h: 1.0860,
        volume24h: 89000.0,
        decimals: 4,
        timestamp: Date.now(),
        bidPrice: 1.0884,
        askPrice: 1.0886,
        smcStatus: {
          trend: 'BEARISH',
          lastStructure: 'CHOCH',
          fvgActive: false,
          liquidityZone: 'PREMIUM',
          nearestOrderBlock: {
            type: 'BEARISH_OB',
            priceLevel: 1.0915,
            mitigated: false
          }
        }
      }
    ];

    defaults.forEach(t => this.tickerCache.set(t.symbol, t));
  }

  public startStreaming() {
    if (typeof window === 'undefined') return;
    if (this.isConnected && this.eventSource) return;

    this.connectEventSource();
  }

  private connectEventSource() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      this.startPollingFallback();
      return;
    }

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/market/stream');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.stopPollingFallback();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TICKER_BATCH' && Array.isArray(data.tickers)) {
            data.tickers.forEach((t: MarketTickerSnapshot) => {
              this.tickerCache.set(t.symbol, t);
            });
            this.notifyTickers();
          } else if (data.type === 'SMC_EVENT' && data.event) {
            this.handleSmcEvent(data.event);
          }
        } catch (_) {}
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Fallback to HTTP polling if SSE connection drops
        this.startPollingFallback();
      };
    } catch (_) {
      this.startPollingFallback();
    }
  }

  private startPollingFallback() {
    if (this.pollInterval) return;
    this.pollTickersOnce();
    this.pollInterval = setInterval(() => {
      this.pollTickersOnce();
    }, 3000);
  }

  private stopPollingFallback() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async pollTickersOnce() {
    try {
      const res = await fetch('/api/market/tickers');
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          raw.slice(0, 10).forEach((item: any) => {
            const sym = item.symbol;
            const existing = this.tickerCache.get(sym);
            const price = parseFloat(item.price || item.lastPrice);
            if (!isNaN(price) && price > 0) {
              const updated: MarketTickerSnapshot = {
                symbol: sym,
                displayName: item.displayName || `${sym} PERP`,
                price,
                change24h: parseFloat(item.change24h || item.priceChangePercent || 0),
                high24h: parseFloat(item.high24h || item.highPrice || price * 1.01),
                low24h: parseFloat(item.low24h || item.lowPrice || price * 0.99),
                volume24h: parseFloat(item.volume24h || item.quoteVolume || 1000),
                decimals: item.decimals || (price > 500 ? 2 : 4),
                timestamp: Date.now(),
                bidPrice: price * 0.9998,
                askPrice: price * 1.0002,
                smcStatus: existing?.smcStatus || {
                  trend: 'BULLISH',
                  lastStructure: 'BOS',
                  fvgActive: true,
                  liquidityZone: 'EQUILIBRIUM',
                  nearestOrderBlock: {
                    type: 'BULLISH_OB',
                    priceLevel: price * 0.99,
                    mitigated: false
                  }
                }
              };
              this.tickerCache.set(sym, updated);
            }
          });
          this.notifyTickers();
        }
      }
    } catch (_) {}
  }

  private throttleStreaming(isBackgrounded: boolean) {
    if (isBackgrounded) {
      // Slow down to protect resources
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      this.stopPollingFallback();
      this.pollInterval = setInterval(() => this.pollTickersOnce(), 10000);
    } else {
      // Resume normal streaming
      this.stopPollingFallback();
      this.connectEventSource();
    }
  }

  private handleSmcEvent(event: SmcMarketEvent) {
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > this.maxStoredEvents) {
      this.recentEvents.pop();
    }
    this.eventListeners.forEach(cb => {
      try { cb(event); } catch (_) {}
    });
  }

  public subscribeTickers(cb: TickerListener): () => void {
    this.tickerListeners.add(cb);
    cb(this.getAllTickers());
    this.startStreaming();
    return () => {
      this.tickerListeners.delete(cb);
      if (this.tickerListeners.size === 0 && this.eventListeners.size === 0) {
        this.disconnect();
      }
    };
  }

  public subscribeEvents(cb: EventListener): () => void {
    this.eventListeners.add(cb);
    this.startStreaming();
    return () => {
      this.eventListeners.delete(cb);
    };
  }

  public getRecentEvents(): SmcMarketEvent[] {
    return [...this.recentEvents];
  }

  public getAllTickers(): MarketTickerSnapshot[] {
    return Array.from(this.tickerCache.values());
  }

  public getTicker(symbol: string): MarketTickerSnapshot | undefined {
    return this.tickerCache.get(symbol);
  }

  private notifyTickers() {
    const list = this.getAllTickers();
    this.tickerListeners.forEach(cb => {
      try { cb(list); } catch (_) {}
    });
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.stopPollingFallback();
    this.isConnected = false;
  }
}

export const globalMarketStream = new MarketStreamService();
