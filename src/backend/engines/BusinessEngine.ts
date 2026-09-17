import { logger } from '../utils/logger';
import { taskEngine } from './TaskEngine';
import { pgClient } from '../database/pg-client';

export class BackendBusinessEngine {
  
  async executeTradingLogic(symbol: string, action: string, amount: number) {
    logger.info(`BusinessEngine: Executing trade logic via live market feed`, { symbol, action, amount });
    let executedPrice = 0;
    try {
      const cleanSymbol = (symbol || 'BTCUSDT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
      if (res.ok) {
        const data: any = await res.json();
        executedPrice = parseFloat(data.price);
      }
    } catch (e: any) {
      console.warn("[BusinessEngine] Failed fetching live price:", e?.message || e);
    }

    if (!executedPrice) {
      throw new Error(`CAPABILITY_NOT_AVAILABLE: Gagal mendapatkan harga eksekusi pasar riil untuk ${symbol}. Provider bursa tidak merespons.`);
    }

    return {
      success: true,
      symbol,
      action: (action || 'BUY').toUpperCase(),
      amount: amount || 1,
      executedPrice,
      timestamp: new Date().toISOString()
    };
  }

  async runAnalytics(dataset: any[]) {
    logger.info(`BusinessEngine: Running analytics on dataset size ${dataset?.length || 0}`);
    if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset kosong atau tidak valid untuk dianalisis.");
    }
    const numbers = dataset.map(d => typeof d === 'number' ? d : parseFloat(d?.value || d?.price || d)).filter(n => !isNaN(n));
    if (numbers.length === 0) {
      throw new Error("Dataset tidak mengandung data numerik yang valid untuk dianalisis.");
    }
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const trend = numbers[numbers.length - 1] >= numbers[0] ? 'BULLISH_UPWARD' : 'BEARISH_DOWNWARD';

    return {
      count: numbers.length,
      average: parseFloat(avg.toFixed(4)),
      min,
      max,
      trend,
      first: numbers[0],
      last: numbers[numbers.length - 1]
    };
  }

  async triggerAutomation(workflowId: string, payload: any) {
    logger.info(`BusinessEngine: Triggering automation`, { workflowId });
    return { status: 'queued', taskId: await taskEngine.submitTask('automation', { workflowId, payload }) };
  }

  async generateReport(type: string, dateRange: any) {
    logger.info(`BusinessEngine: Generating report`, { type, dateRange });
    return { status: 'queued', taskId: await taskEngine.submitTask('report_generation', { type, dateRange }) };
  }
}

export const businessEngine = new BackendBusinessEngine();
