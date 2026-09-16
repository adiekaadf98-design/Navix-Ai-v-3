import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  CandleData,
  ChartOverlayToggles,
  StrategyEngineType,
  EngineAnalysisResult,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker
} from '../../types/cloudMarket';
import { CloudMarketEngine } from '../../services/trading/cloudMarketEngine';

interface CloudMarketCanvasProps {
  candles: CandleData[];
  livePrice: number;
  symbol: string;
  decimals: number;
  toggles: ChartOverlayToggles;
  activeEngine: StrategyEngineType;
  engineResult?: EngineAnalysisResult;
  zones: SMCZone[];
  structures: MarketStructureMarker[];
  patterns: CandlePatternMarker[];
}

export const CloudMarketCanvas: React.FC<CloudMarketCanvasProps> = ({
  candles,
  livePrice,
  symbol,
  decimals,
  toggles,
  activeEngine,
  engineResult,
  zones,
  structures,
  patterns
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport navigation state (panning and zoom)
  const [zoom, setZoom] = useState(1); // multiplier
  const [panOffset, setPanOffset] = useState(0); // number of candles shifted
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  // Hover Crosshair state
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Calculate EMA 200 curve
  const ema200 = useMemo(() => {
    return CloudMarketEngine.calculateEMA(candles, 30);
  }, [candles]);

  // Calculate Ichimoku Cloud
  const ichimoku = useMemo(() => {
    return CloudMarketEngine.calculateIchimoku(candles);
  }, [candles]);

  // Fibonacci Retracement levels
  const fibLevels = useMemo(() => {
    if (candles.length < 20) return null;
    const recent = candles.slice(-40);
    const high = Math.max(...recent.map(c => c.high));
    const low = Math.min(...recent.map(c => c.low));
    const diff = high - low;
    return {
      high,
      low,
      fib0: high,
      fib236: high - diff * 0.236,
      fib382: high - diff * 0.382,
      fib500: high - diff * 0.500,
      fib618: high - diff * 0.618,
      fib786: high - diff * 0.786,
      fib1000: low
    };
  }, [candles]);

  // Reset zoom & pan when symbol changes
  useEffect(() => {
    setZoom(1);
    setPanOffset(0);
  }, [symbol]);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (candles.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Memuat pergerakan live candle...', width / 2, height / 2);
      return;
    }

    const rightMargin = 72; // Space for price axis
    const bottomMargin = 26; // Space for time axis
    const chartWidth = width - rightMargin;
    const chartHeight = height - bottomMargin;

    // Visible window of candles
    const baseVisibleCandles = 50;
    const visibleCount = Math.max(15, Math.min(candles.length, Math.round(baseVisibleCandles / zoom)));
    const maxOffset = Math.max(0, candles.length - visibleCount);
    const clampedOffset = Math.max(0, Math.min(maxOffset, Math.round(panOffset)));

    const startIndex = Math.max(0, candles.length - visibleCount - clampedOffset);
    const visibleSlice = candles.slice(startIndex, startIndex + visibleCount);

    if (visibleSlice.length === 0) return;

    // Price range calculation
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const c of visibleSlice) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    }

    // Include entry, SL, TP in view if active
    if (engineResult && engineResult.status === 'setup') {
      minPrice = Math.min(minPrice, engineResult.slPrice, engineResult.tpPrice, engineResult.entryPrice);
      maxPrice = Math.max(maxPrice, engineResult.slPrice, engineResult.tpPrice, engineResult.entryPrice);
    }

    // Include current live price
    minPrice = Math.min(minPrice, livePrice);
    maxPrice = Math.max(maxPrice, livePrice);

    const pricePadding = (maxPrice - minPrice) * 0.08 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Coordinate conversion helpers
    const priceToY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    const yToPrice = (y: number) => {
      return maxPrice - (y / chartHeight) * priceRange;
    };

    const candleWidth = chartWidth / visibleSlice.length;
    const barSpacing = Math.max(1.5, candleWidth * 0.2);
    const barWidth = Math.max(1.5, candleWidth - barSpacing);

    const indexToX = (relativeIndex: number) => {
      return relativeIndex * candleWidth + candleWidth / 2;
    };

    // 1. Draw Background Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);

    // Horizontal price grid lines
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange * i) / gridSteps;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(decimals), chartWidth + 6, y + 3);
    }

    // Vertical time grid lines
    const timeSteps = Math.min(6, visibleSlice.length);
    for (let i = 0; i < timeSteps; i++) {
      const idx = Math.floor((i * visibleSlice.length) / timeSteps);
      const c = visibleSlice[idx];
      if (c) {
        const x = indexToX(idx);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();

        // Bottom time labels
        const d = new Date(c.time);
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, x, height - 8);
      }
    }
    ctx.setLineDash([]); // Reset dash

    // 2. Draw Volume Histogram (if toggled)
    if (toggles.volume) {
      const maxVol = Math.max(...visibleSlice.map(c => c.volume), 1);
      const volAreaHeight = chartHeight * 0.18;
      for (let i = 0; i < visibleSlice.length; i++) {
        const c = visibleSlice[i];
        const isBull = c.close >= c.open;
        const volHeight = (c.volume / maxVol) * volAreaHeight;
        const x = indexToX(i) - barWidth / 2;
        const y = chartHeight - volHeight;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(x, y, barWidth, volHeight);
      }
    }

    // 3. Draw Ichimoku Cloud (if activeEngine === 'ICHIMOKU' or toggles.garisMesin)
    if (activeEngine === 'ICHIMOKU' && ichimoku) {
      ctx.save();
      // Draw Senkou Span Cloud
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleSlice.length; i++) {
        const absIdx = startIndex + i;
        const spA = ichimoku.spanA[absIdx];
        if (spA !== null && spA !== undefined) {
          const x = indexToX(i);
          const y = priceToY(spA);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleSlice.length - 1; i >= 0; i--) {
        const absIdx = startIndex + i;
        const spB = ichimoku.spanB[absIdx];
        if (spB !== null && spB !== undefined) {
          const x = indexToX(i);
          const y = priceToY(spB);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fill();

      // Draw Tenkan (Conversion Line) - Cyan
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let tStarted = false;
      for (let i = 0; i < visibleSlice.length; i++) {
        const absIdx = startIndex + i;
        const val = ichimoku.tenkan[absIdx];
        if (val !== null && val !== undefined) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (!tStarted) { ctx.moveTo(x, y); tStarted = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // Draw Kijun (Base Line) - Red / Coral
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let kStarted = false;
      for (let i = 0; i < visibleSlice.length; i++) {
        const absIdx = startIndex + i;
        const val = ichimoku.kijun[absIdx];
        if (val !== null && val !== undefined) {
          const x = indexToX(i);
          const y = priceToY(val);
          if (!kStarted) { ctx.moveTo(x, y); kStarted = true; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Fibonacci Retracement Levels (if activeEngine === 'FIBONACCI')
    if (activeEngine === 'FIBONACCI' && fibLevels) {
      ctx.save();
      const fibs = [
        { label: 'Fib 1.0 (High)', price: fibLevels.fib0, color: '#94a3b8' },
        { label: 'Fib 0.786', price: fibLevels.fib236, color: '#f59e0b' },
        { label: 'Fib 0.618 (Golden Pocket)', price: fibLevels.fib382, color: '#10b981', bold: true },
        { label: 'Fib 0.500 (Equilibrium)', price: fibLevels.fib500, color: '#06b6d4' },
        { label: 'Fib 0.382', price: fibLevels.fib618, color: '#f59e0b' },
        { label: 'Fib 0.0 (Low)', price: fibLevels.fib1000, color: '#94a3b8' }
      ];

      // Golden pocket highlight box
      const gpTop = priceToY(fibLevels.fib236);
      const gpBottom = priceToY(fibLevels.fib382);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.fillRect(0, Math.min(gpTop, gpBottom), chartWidth, Math.abs(gpBottom - gpTop));

      fibs.forEach(f => {
        const y = priceToY(f.price);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = f.bold ? 1.5 : 0.8;
        ctx.setLineDash(f.bold ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = f.color;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${f.label} - ${f.price.toFixed(decimals)}`, 6, y - 3);
      });
      ctx.restore();
    }

    // 5. Draw Dynamic EMA200 / Garis Mesin (if toggles.garisMesin || activeEngine === 'EMA200')
    if (toggles.garisMesin || activeEngine === 'EMA200') {
      ctx.save();
      ctx.strokeStyle = '#f59e0b'; // Amber EMA line
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleSlice.length; i++) {
        const absIdx = startIndex + i;
        const emaVal = ema200[absIdx];
        if (emaVal !== undefined) {
          const x = indexToX(i);
          const y = priceToY(emaVal);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      // Label at end of line
      const lastEma = ema200[startIndex + visibleSlice.length - 1];
      if (lastEma) {
        const y = priceToY(lastEma);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('EMA 200', chartWidth - 8, y - 4);
      }
      ctx.restore();
    }

    // 6. Draw SMC Zones: Order Blocks & FVG (if toggles.zona || activeEngine === 'SMC')
    if (toggles.zona || activeEngine === 'SMC') {
      ctx.save();
      zones.forEach(z => {
        const topY = priceToY(z.top);
        const bottomY = priceToY(z.bottom);
        const boxHeight = Math.abs(bottomY - topY);
        const isBull = z.type.includes('BULL');

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = isBull ? '#10b981' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.fillRect(0, Math.min(topY, bottomY), chartWidth, boxHeight);
        ctx.strokeRect(0, Math.min(topY, bottomY), chartWidth, boxHeight);

        // Zone label
        ctx.fillStyle = isBull ? '#34d399' : '#f87171';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`[${z.label}] ${z.bottom.toFixed(decimals)} - ${z.top.toFixed(decimals)}`, 10, Math.min(topY, bottomY) + 12);
      });
      ctx.restore();
    }

    // 7. Draw Candlesticks (The Core Moving Chart Engine)
    for (let i = 0; i < visibleSlice.length; i++) {
      const c = visibleSlice[i];
      const isBull = c.close >= c.open;
      const x = indexToX(i);
      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const highY = priceToY(c.high);
      const lowY = priceToY(c.low);

      const color = isBull ? '#10b981' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // Draw wick (center line)
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw candle body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);
    }

    // 8. Draw Market Structure (BOS, CHoCH, Sweeps) if toggles.struktur
    if (toggles.struktur || activeEngine === 'SMC') {
      ctx.save();
      structures.forEach(st => {
        const y = priceToY(st.price);
        ctx.strokeStyle = st.direction === 'bull' ? '#38bdf8' : '#fb7185';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = st.direction === 'bull' ? '#38bdf8' : '#fb7185';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`• ${st.label}`, chartWidth - 10, y - 3);
      });
      ctx.restore();
    }

    // 9. Draw Candlestick Pattern Markers if toggles.polaLilin
    if (toggles.polaLilin) {
      ctx.save();
      patterns.forEach(pt => {
        const localIdx = pt.index - startIndex;
        if (localIdx >= 0 && localIdx < visibleSlice.length) {
          const x = indexToX(localIdx);
          const y = priceToY(pt.price);
          ctx.fillStyle = pt.isBullish ? '#10b981' : '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`▲ ${pt.label}`, x, pt.isBullish ? y + 16 : y - 10);
        }
      });
      ctx.restore();
    }

    // 10. Draw Active Setup Execution Plan (Entry, SL, TP Box)
    if (engineResult && engineResult.status === 'setup') {
      ctx.save();
      const entryY = priceToY(engineResult.entryPrice);
      const slY = priceToY(engineResult.slPrice);
      const tpY = priceToY(engineResult.tpPrice);

      // Stop Loss Zone (Red translucent)
      const slBoxTop = Math.min(entryY, slY);
      const slBoxHeight = Math.abs(entryY - slY);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(chartWidth * 0.25, slBoxTop, chartWidth * 0.75, slBoxHeight);

      // Take Profit Zone (Green translucent)
      const tpBoxTop = Math.min(entryY, tpY);
      const tpBoxHeight = Math.abs(entryY - tpY);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(chartWidth * 0.25, tpBoxTop, chartWidth * 0.75, tpBoxHeight);

      // Lines
      // Entry Line (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, entryY);
      ctx.lineTo(chartWidth, entryY);
      ctx.stroke();

      // SL Line (Red)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, slY);
      ctx.lineTo(chartWidth, slY);
      ctx.stroke();

      // TP Line (Green)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, tpY);
      ctx.lineTo(chartWidth, tpY);
      ctx.stroke();

      // Plan Labels
      ctx.setLineDash([]);
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';

      // Entry
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`ENTRY: $${engineResult.entryPrice.toFixed(decimals)}`, chartWidth - 8, entryY - 4);

      // SL
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`SL: $${engineResult.slPrice.toFixed(decimals)}`, chartWidth - 8, slY - 4);

      // TP
      ctx.fillStyle = '#10b981';
      ctx.fillText(`TP: $${engineResult.tpPrice.toFixed(decimals)} (${engineResult.rrRatio})`, chartWidth - 8, tpY - 4);

      ctx.restore();
    }

    // 11. Draw Live Pulsating Price Line
    const liveY = priceToY(livePrice);
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(chartWidth, liveY);
    ctx.stroke();

    // Live Price Right Badge
    ctx.setLineDash([]);
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(chartWidth + 2, liveY - 10, rightMargin - 4, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(livePrice.toFixed(decimals), chartWidth + rightMargin / 2, liveY + 3.5);
    ctx.restore();

    // 12. Draw Interactive Hover Crosshair
    if (mousePos && mousePos.x <= chartWidth && mousePos.y <= chartHeight) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();

      // Hover Price Label on Axis
      const hoverPrice = yToPrice(mousePos.y);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(chartWidth + 2, mousePos.y - 9, rightMargin - 4, 18, 3);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hoverPrice.toFixed(decimals), chartWidth + rightMargin / 2, mousePos.y + 3);
      ctx.restore();
    }

  }, [
    candles,
    livePrice,
    symbol,
    decimals,
    toggles,
    activeEngine,
    engineResult,
    zones,
    structures,
    patterns,
    zoom,
    panOffset,
    mousePos,
    ema200,
    ichimoku,
    fibLevels
  ]);

  // Handle Canvas Resize and DPI Adjustment
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Continuous animation frame sync
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Calculate hovered candle
    const rightMargin = 72;
    const chartWidth = rect.width - rightMargin;
    if (x <= chartWidth && candles.length > 0) {
      const baseVisibleCandles = 50;
      const visibleCount = Math.max(15, Math.min(candles.length, Math.round(baseVisibleCandles / zoom)));
      const maxOffset = Math.max(0, candles.length - visibleCount);
      const clampedOffset = Math.max(0, Math.min(maxOffset, Math.round(panOffset)));
      const startIndex = Math.max(0, candles.length - visibleCount - clampedOffset);
      const visibleSlice = candles.slice(startIndex, startIndex + visibleCount);

      const candleWidth = chartWidth / visibleSlice.length;
      const idx = Math.floor(x / candleWidth);
      if (idx >= 0 && idx < visibleSlice.length) {
        setHoveredCandle(visibleSlice[idx]);
      }
    } else {
      setHoveredCandle(null);
    }

    if (isDragging) {
      const dx = e.clientX - dragStartX;
      const candleShift = dx / 10;
      setPanOffset(prev => prev + candleShift);
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setMousePos(null);
    setHoveredCandle(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(4.0, z * 1.15));
    } else {
      setZoom(z => Math.max(0.4, z * 0.85));
    }
  };

  const currentCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="relative w-full h-[460px] bg-[#07090e] rounded-xl overflow-hidden border border-neutral-800/80 shadow-2xl select-none" ref={containerRef}>
      {/* Top Floating Candlestick OHLC Bar */}
      <div className="absolute top-2 left-3 z-10 flex items-center gap-3 text-[11px] font-mono bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-neutral-800 text-neutral-400">
        <span className="text-white font-bold">{symbol}</span>
        {currentCandle && (
          <>
            <span>O: <strong className="text-neutral-200">{currentCandle.open.toFixed(decimals)}</strong></span>
            <span>H: <strong className="text-emerald-400">{currentCandle.high.toFixed(decimals)}</strong></span>
            <span>L: <strong className="text-red-400">{currentCandle.low.toFixed(decimals)}</strong></span>
            <span>C: <strong className={currentCandle.close >= currentCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              {currentCandle.close.toFixed(decimals)}
            </strong></span>
            <span className="hidden sm:inline">Vol: <strong>{currentCandle.volume.toLocaleString()}</strong></span>
          </>
        )}
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute top-2 right-20 z-10 flex items-center gap-1 bg-neutral-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-neutral-800 text-xs font-mono">
        <button
          onClick={() => setZoom(z => Math.min(4.0, z * 1.2))}
          className="w-5 h-5 rounded hover:bg-neutral-800 text-neutral-300 flex items-center justify-center cursor-pointer"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => { setZoom(1); setPanOffset(0); }}
          className="px-1 text-[10px] text-neutral-400 hover:text-white cursor-pointer"
          title="Reset View"
        >
          Reset
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
          className="w-5 h-5 rounded hover:bg-neutral-800 text-neutral-300 flex items-center justify-center cursor-pointer"
          title="Zoom Out"
        >
          -
        </button>
      </div>

      {/* HTML5 Canvas Rendering Surface */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};
