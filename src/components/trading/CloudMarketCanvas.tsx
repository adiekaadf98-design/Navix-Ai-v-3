import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  CandleData,
  ChartOverlayToggles,
  StrategyEngineType,
  EngineAnalysisResult,
  SMCZone,
  MarketStructureMarker,
  CandlePatternMarker,
  StructureSwingPoint,
  MarketStructureVerification,
  SNRLevel,
  RBSFlipZone,
  FibonacciSetup,
  CRTRangeSetup
} from '../../types/cloudMarket';
import { CloudMarketEngine } from '../../services/trading/cloudMarketEngine';
import { ShieldCheck, Activity, ChevronDown, ChevronUp, Layers, CheckCircle2, AlertTriangle, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  timeframe?: string;
  marketStatus?: 'LIVE' | 'CONNECTING' | 'OFFLINE';
  connectionSource?: string;
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
  patterns,
  timeframe = '15m',
  marketStatus = 'LIVE',
  connectionSource = 'Universal Feed'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport navigation state (panning and zoom)
  const [zoom, setZoom] = useState(1); // multiplier
  const [panOffset, setPanOffset] = useState(0); // number of candles shifted
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; dist: number } | null>(null);

  // Floating Market Structure Verification HUD toggle
  const [showStructureHUD, setShowStructureHUD] = useState(false);
  const [isHUDExpanded, setIsHUDExpanded] = useState(false);

  // Hover Crosshair state
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Calculate Order Flow Equilibrium & Liquidity levels
  const orderFlowLevels = useMemo(() => {
    if (candles.length < 20) return null;
    const recent = candles.slice(-35);
    const swingHigh = Math.max(...recent.map(c => c.high));
    const swingLow = Math.min(...recent.map(c => c.low));
    const eq50 = (swingHigh + swingLow) / 2;
    const premium75 = eq50 + (swingHigh - eq50) * 0.5;
    const discount25 = eq50 - (eq50 - swingLow) * 0.5;
    return { swingHigh, swingLow, eq50, premium75, discount25 };
  }, [candles]);

  // Calculate Swing Points (HH, HL, LH, LL)
  const swingPoints = useMemo(() => {
    return CloudMarketEngine.detectSwingPoints(candles);
  }, [candles]);

  // SNR (Support & Resistance) Levels
  const snrLevels: SNRLevel[] = useMemo(() => {
    return CloudMarketEngine.detectSNRLevels(candles);
  }, [candles]);

  // RBS & SBR Flip Zones
  const rbsZones: RBSFlipZone[] = useMemo(() => {
    return CloudMarketEngine.detectRBSFlipZones(candles);
  }, [candles]);

  // Fibonacci Retracement & Golden Pocket (0.618 - 0.786 OTE)
  const fibSetup: FibonacciSetup | null = useMemo(() => {
    return CloudMarketEngine.calculateFibonacciLevels(candles);
  }, [candles]);

  // CRT (Candle Range Theory) Setup
  const crtSetup: CRTRangeSetup | null = useMemo(() => {
    return CloudMarketEngine.detectCRTRange(candles);
  }, [candles]);

  // Market Structure vs Active Signal Verification
  const verification: MarketStructureVerification | null = useMemo(() => {
    if (!engineResult) return null;
    return CloudMarketEngine.verifySignalWithMarketStructure(
      engineResult,
      structures,
      zones,
      livePrice
    );
  }, [engineResult, structures, zones, livePrice]);

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

    // Clear canvas with deep matte slate chassis
    ctx.fillStyle = '#06070a';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) {
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Memuat data pergerakan live candlestick...', width / 2, height / 2);
      return;
    }

    const rightMargin = 76; // Space for high-precision price axis
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

    // Add breathing room (3.5 candles) on the right for clean institutional layout
    const rightOffsetBars = 3.5;
    const candleWidth = chartWidth / (visibleSlice.length + rightOffsetBars);
    const barSpacing = Math.max(1.5, candleWidth * 0.2);
    const barWidth = Math.max(1.5, candleWidth - barSpacing);

    const indexToX = (relativeIndex: number) => {
      return relativeIndex * candleWidth + candleWidth / 2;
    };

    // 1. Background Grid (No Gradients, Solid Precision Lines)
    ctx.strokeStyle = '#181b24';
    ctx.lineWidth = 0.6;
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
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(decimals), chartWidth + 6, y + 3);
    }

    // Vertical time grid lines
    const timeSteps = Math.min(6, visibleSlice.length);
    const isDaily = timeframe === '1d' || timeframe === 'd1' || timeframe === '1w';
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
        const timeStr = isDaily
          ? `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`
          : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillStyle = '#71717a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, x, height - 8);
      }
    }
    ctx.setLineDash([]); // Reset dash

    // 2. Volume Histogram (if toggled)
    if (toggles.volume) {
      const maxVol = Math.max(...visibleSlice.map(c => c.volume), 1);
      const volAreaHeight = chartHeight * 0.16;
      for (let i = 0; i < visibleSlice.length; i++) {
        const c = visibleSlice[i];
        const isBull = c.close >= c.open;
        const volHeight = (c.volume / maxVol) * volAreaHeight;
        const x = indexToX(i) - barWidth / 2;
        const y = chartHeight - volHeight;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(x, y, barWidth, volHeight);
      }
    }

    // Helper function to draw neat, non-bleeding badge pills for indicators
    const drawPillBadge = (
      text: string,
      x: number,
      y: number,
      options: {
        align?: 'left' | 'right' | 'center';
        bgColor?: string;
        borderColor?: string;
        textColor?: string;
        fontSize?: number;
        paddingX?: number;
        paddingY?: number;
      } = {}
    ) => {
      const align = options.align || 'left';
      const bgColor = options.bgColor || 'rgba(10, 12, 18, 0.92)';
      const borderColor = options.borderColor || 'rgba(63, 63, 70, 0.8)';
      const textColor = options.textColor || '#e4e4e7';
      const fontSize = options.fontSize || 9;
      const paddingX = options.paddingX || 6;
      const paddingY = options.paddingY || 2.5;

      ctx.save();
      ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const badgeWidth = textWidth + paddingX * 2;
      const badgeHeight = fontSize + paddingY * 2 + 2;

      let badgeX = x;
      if (align === 'right') {
        badgeX = x - badgeWidth;
      } else if (align === 'center') {
        badgeX = x - badgeWidth / 2;
      }
      const badgeY = y - badgeHeight / 2;

      // Draw pill background
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 3.5);
      } else {
        ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
      }
      ctx.fill();
      ctx.stroke();

      // Draw pill text
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(text, badgeX + paddingX, badgeY + fontSize + paddingY - 1);
      ctx.restore();
    };

    // 3. SNR (SUPPORT & RESISTANCE) OVERLAY - Focused & Tidy
    if (activeEngine === 'SNR' || toggles.snr) {
      ctx.save();
      // Filter the most relevant levels (closest 2 resistances above and closest 2 supports below livePrice)
      const resistances = snrLevels
        .filter(l => l.type === 'RESISTANCE' && l.price >= livePrice)
        .sort((a, b) => a.price - b.price)
        .slice(0, 2);
      const supports = snrLevels
        .filter(l => l.type === 'SUPPORT' && l.price <= livePrice)
        .sort((a, b) => b.price - a.price)
        .slice(0, 2);
      const visibleSNR = [...resistances, ...supports];

      visibleSNR.forEach((lvl, idx) => {
        const y = priceToY(lvl.price);
        if (y < 0 || y > chartHeight) return;
        const isRes = lvl.type === 'RESISTANCE';
        const color = isRes ? '#ef4444' : '#10b981';

        ctx.strokeStyle = isRes ? 'rgba(239, 68, 68, 0.65)' : 'rgba(16, 185, 129, 0.65)';
        ctx.lineWidth = lvl.strength >= 3 ? 1.2 : 0.8;
        ctx.setLineDash(lvl.strength >= 3 ? [6, 3] : [3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.setLineDash([]);
        const prefix = isRes ? `RES ${idx + 1}` : `SUP ${idx + 1}`;
        drawPillBadge(
          `${prefix} $${lvl.price.toFixed(decimals)} (${lvl.testCount}x Test)`,
          10,
          y,
          {
            bgColor: isRes ? 'rgba(30, 10, 16, 0.92)' : 'rgba(8, 28, 18, 0.92)',
            borderColor: isRes ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)',
            textColor: isRes ? '#fca5a5' : '#86efac',
            fontSize: 9
          }
        );
      });
      ctx.restore();
    }

    // 4. RBS (RESISTANCE BECOME SUPPORT) & SBR OVERLAY - Clean Flip Zones
    if (activeEngine === 'RBS' || toggles.rbs) {
      ctx.save();
      // Take up to 2 active flip zones closest to current price
      const relevantRBS = [...rbsZones]
        .sort((a, b) => Math.abs(a.price - livePrice) - Math.abs(b.price - livePrice))
        .slice(0, 2);

      relevantRBS.forEach(z => {
        const y = priceToY(z.price);
        if (y < 0 || y > chartHeight) return;
        const isBull = z.direction === 'bull';
        const bandHeight = 6;

        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.10)' : 'rgba(239, 68, 68, 0.10)';
        ctx.fillRect(0, y - bandHeight / 2, chartWidth, bandHeight);

        ctx.strokeStyle = isBull ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 1.1;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.setLineDash([]);
        drawPillBadge(
          `⚡ ${z.type} FLIP: $${z.price.toFixed(decimals)} (${z.retested ? 'Teruji Aktif' : 'Menunggu Retest'})`,
          10,
          y,
          {
            bgColor: isBull ? 'rgba(8, 28, 18, 0.94)' : 'rgba(30, 10, 16, 0.94)',
            borderColor: isBull ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            textColor: isBull ? '#34d399' : '#f87171',
            fontSize: 9
          }
        );
      });
      ctx.restore();
    }

    // 5. FIBONACCI RETRACEMENT & GOLDEN POCKET OVERLAY - Crisp & Elegant
    if ((activeEngine === 'FIBONACCI' || toggles.fibonacci) && fibSetup) {
      ctx.save();
      const gp618 = fibSetup.levels.find(l => l.ratio === 0.618);
      const ote786 = fibSetup.levels.find(l => l.ratio === 0.786);

      if (gp618 && ote786) {
        const gpY = priceToY(gp618.price);
        const oteY = priceToY(ote786.price);
        const topBox = Math.min(gpY, oteY);
        const boxH = Math.abs(oteY - gpY);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fillRect(0, topBox, chartWidth, boxH);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(0, topBox, chartWidth, boxH);
        ctx.setLineDash([]);
      }

      fibSetup.levels.forEach(f => {
        const y = priceToY(f.price);
        if (y < 0 || y > chartHeight) return;
        const isGolden = f.isGoldenPocket;
        const isEq = f.ratio === 0.5;
        const color = isGolden ? '#f59e0b' : isEq ? '#38bdf8' : 'rgba(161, 161, 170, 0.45)';

        ctx.strokeStyle = color;
        ctx.lineWidth = isGolden ? 1.4 : isEq ? 1.1 : 0.8;
        ctx.setLineDash(isGolden ? [] : isEq ? [4, 2] : [3, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.setLineDash([]);
        if (isGolden) {
          drawPillBadge(
            `FIB 0.618 [Golden Pocket] • $${f.price.toFixed(decimals)}`,
            10,
            y,
            {
              bgColor: 'rgba(32, 22, 8, 0.94)',
              borderColor: 'rgba(245, 158, 11, 0.8)',
              textColor: '#fbbf24',
              fontSize: 9
            }
          );
        } else if (isEq) {
          drawPillBadge(
            `FIB 0.50 [Equilibrium] • $${f.price.toFixed(decimals)}`,
            10,
            y,
            {
              bgColor: 'rgba(10, 24, 34, 0.94)',
              borderColor: 'rgba(56, 189, 248, 0.8)',
              textColor: '#38bdf8',
              fontSize: 9
            }
          );
        } else {
          drawPillBadge(
            `${f.label} • $${f.price.toFixed(decimals)}`,
            chartWidth - 10,
            y,
            {
              align: 'right',
              bgColor: 'rgba(18, 18, 22, 0.85)',
              borderColor: 'rgba(82, 82, 91, 0.4)',
              textColor: '#a1a1aa',
              fontSize: 8.5
            }
          );
        }
      });
      ctx.restore();
    }

    // 6. CRT (CANDLE RANGE THEORY) OVERLAY - Refined Framing
    if ((activeEngine === 'CRT' || toggles.crt) && crtSetup) {
      ctx.save();
      const rhY = priceToY(crtSetup.rangeHigh);
      const rlY = priceToY(crtSetup.rangeLow);
      const midY = priceToY(crtSetup.midRange);
      const expY = priceToY(crtSetup.targetExpansion);

      // CRT Master Range Box
      const topRange = Math.min(rhY, rlY);
      const rangeH = Math.abs(rlY - rhY);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(0, topRange, chartWidth, rangeH);

      // Range High
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(0, rhY);
      ctx.lineTo(chartWidth, rhY);
      ctx.stroke();

      drawPillBadge(
        `CRT RANGE HIGH (RH): $${crtSetup.rangeHigh.toFixed(decimals)}`,
        10,
        rhY,
        {
          bgColor: 'rgba(30, 10, 16, 0.92)',
          borderColor: 'rgba(239, 68, 68, 0.8)',
          textColor: '#f87171',
          fontSize: 9
        }
      );

      // Range Low
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, rlY);
      ctx.lineTo(chartWidth, rlY);
      ctx.stroke();

      drawPillBadge(
        `CRT RANGE LOW (RL): $${crtSetup.rangeLow.toFixed(decimals)}`,
        10,
        rlY,
        {
          bgColor: 'rgba(8, 28, 18, 0.92)',
          borderColor: 'rgba(16, 185, 129, 0.8)',
          textColor: '#34d399',
          fontSize: 9
        }
      );

      // 50% Mid-Range
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(chartWidth, midY);
      ctx.stroke();

      drawPillBadge(
        `CRT 50% MID: $${crtSetup.midRange.toFixed(decimals)}`,
        chartWidth - 10,
        midY,
        {
          align: 'right',
          bgColor: 'rgba(10, 24, 34, 0.92)',
          borderColor: 'rgba(56, 189, 248, 0.7)',
          textColor: '#38bdf8',
          fontSize: 9
        }
      );

      // Judas Sweep marker
      if (crtSetup.judasSweepPrice) {
        const jsY = priceToY(crtSetup.judasSweepPrice);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(chartWidth * 0.75, jsY, 4, 0, Math.PI * 2);
        ctx.fill();

        drawPillBadge(
          `🎯 JUDAS SWEEP: $${crtSetup.judasSweepPrice.toFixed(decimals)}`,
          chartWidth * 0.75 + 10,
          jsY,
          {
            bgColor: 'rgba(32, 22, 8, 0.94)',
            borderColor: 'rgba(245, 158, 11, 0.8)',
            textColor: '#fbbf24',
            fontSize: 9
          }
        );
      }

      // Range Expansion Target
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(0, expY);
      ctx.lineTo(chartWidth, expY);
      ctx.stroke();

      drawPillBadge(
        `🎯 CRT TARGET EXPANSION: $${crtSetup.targetExpansion.toFixed(decimals)}`,
        10,
        expY,
        {
          bgColor: 'rgba(28, 14, 38, 0.94)',
          borderColor: 'rgba(168, 85, 247, 0.8)',
          textColor: '#c084fc',
          fontSize: 9
        }
      );

      ctx.restore();
    }

    // 7. Institutional Order Flow & Equilibrium Levels
    if (orderFlowLevels) {
      ctx.save();
      const { eq50 } = orderFlowLevels;

      const eqY = priceToY(eq50);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)'; // Navix red accent
      ctx.lineWidth = 1.1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, eqY);
      ctx.lineTo(chartWidth, eqY);
      ctx.stroke();

      drawPillBadge(
        `50% EQUILIBRIUM: $${eq50.toFixed(decimals)}`,
        chartWidth - 10,
        eqY,
        {
          align: 'right',
          bgColor: 'rgba(32, 12, 14, 0.92)',
          borderColor: 'rgba(220, 38, 38, 0.7)',
          textColor: '#f87171',
          fontSize: 9
        }
      );
      ctx.restore();
    }

    // 8. SMC Zones: Historical Order Blocks & FVG
    if (toggles.smc || activeEngine === 'SMC') {
      ctx.save();
      zones.forEach(z => {
        const topY = priceToY(z.top);
        const bottomY = priceToY(z.bottom);
        const boxHeight = Math.max(2, Math.abs(bottomY - topY));
        const boxTop = Math.min(topY, bottomY);
        const isBull = z.type.includes('BULL');

        const isFresh = z.isFresh || z.status === 'FRESH';
        const isMitigated = z.status === 'MITIGATED';

        let startX = 0;
        if (z.startIndex >= startIndex) {
          startX = indexToX(z.startIndex - startIndex) - barWidth / 2;
        }

        let endX = chartWidth;
        if (z.mitigatedIndex && z.mitigatedIndex >= startIndex && z.mitigatedIndex <= startIndex + visibleSlice.length) {
          endX = indexToX(z.mitigatedIndex - startIndex);
        }

        const zoneWidth = Math.max(10, endX - startX);

        if (isFresh) {
          ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
          ctx.strokeStyle = isBull ? '#10b981' : '#ef4444';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([]);
        } else if (isMitigated) {
          ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)';
          ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
          ctx.strokeStyle = isBull ? '#059669' : '#dc2626';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 2]);
        }

        ctx.fillRect(startX, boxTop, zoneWidth, boxHeight);
        ctx.strokeRect(startX, boxTop, zoneWidth, boxHeight);

        const tag = isFresh ? '✨ FRESH OB' : isMitigated ? 'MITIGATED' : 'TESTED';
        drawPillBadge(
          `[${tag}] ${z.label} ($${z.bottom.toFixed(decimals)} - $${z.top.toFixed(decimals)})`,
          Math.max(startX + 6, 8),
          boxTop + 10,
          {
            bgColor: isFresh ? (isBull ? 'rgba(6, 28, 16, 0.92)' : 'rgba(32, 10, 14, 0.92)') : 'rgba(18, 18, 22, 0.85)',
            borderColor: isFresh ? (isBull ? 'rgba(16, 185, 129, 0.75)' : 'rgba(239, 68, 68, 0.75)') : 'rgba(113, 113, 122, 0.5)',
            textColor: isFresh ? (isBull ? '#34d399' : '#f87171') : '#a1a1aa',
            fontSize: 8.5
          }
        );
      });
      ctx.restore();
    }

    // 9. Candlesticks (Moving Market Engine)
    for (let i = 0; i < visibleSlice.length; i++) {
      const c = visibleSlice[i];
      const isLastBar = (i === visibleSlice.length - 1 && clampedOffset === 0);
      const closePrice = isLastBar ? livePrice : c.close;
      const highPrice = isLastBar ? Math.max(c.high, livePrice) : c.high;
      const lowPrice = isLastBar ? Math.min(c.low, livePrice) : c.low;

      const isBull = closePrice >= c.open;
      const x = indexToX(i);
      const openY = priceToY(c.open);
      const closeY = priceToY(closePrice);
      const highY = priceToY(highPrice);
      const lowY = priceToY(lowPrice);

      const color = isBull ? '#10b981' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      ctx.lineWidth = isLastBar ? 1.4 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);

      if (isLastBar) {
        ctx.save();
        ctx.strokeStyle = isBull ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - barWidth / 2 - 0.5, bodyTop - 0.5, barWidth + 1, bodyHeight + 1);
        ctx.restore();
      }
    }

    // 10. Historical Market Structure (BOS, CHoCH)
    if (toggles.smc || toggles.snr || toggles.rbs || toggles.crt) {
      ctx.save();
      swingPoints.forEach(sp => {
        const localIdx = sp.index - startIndex;
        if (localIdx >= 0 && localIdx < visibleSlice.length) {
          const x = indexToX(localIdx);
          const y = priceToY(sp.price);
          const isHigh = sp.type === 'HH' || sp.type === 'LH';

          ctx.fillStyle = isHigh ? '#38bdf8' : '#a855f7';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(sp.type, x, isHigh ? y - 8 : y + 14);

          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      structures.forEach(st => {
        const y = priceToY(st.price);
        const breakLocalIdx = st.index - startIndex;
        if (breakLocalIdx < 0 || breakLocalIdx >= visibleSlice.length) return;

        const isBull = st.direction === 'bull';
        const strokeColor = st.type === 'CHOCH' ? '#f59e0b' : isBull ? '#10b981' : '#ef4444';

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = strokeColor;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`• ${st.label}`, chartWidth - 8, y - 4);
      });
      ctx.restore();
    }

    // 11. Candlestick Pattern Markers if toggles.polaLilin
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

    // 12. Active Setup Execution Plan (Entry, SL, TP Box)
    if (engineResult && engineResult.status === 'setup') {
      ctx.save();
      const entryY = priceToY(engineResult.entryPrice);
      const slY = priceToY(engineResult.slPrice);
      const tpY = priceToY(engineResult.tpPrice);

      // Stop Loss Zone
      const slBoxTop = Math.min(entryY, slY);
      const slBoxHeight = Math.abs(entryY - slY);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(chartWidth * 0.25, slBoxTop, chartWidth * 0.75, slBoxHeight);

      // Take Profit Zone
      const tpBoxTop = Math.min(entryY, tpY);
      const tpBoxHeight = Math.abs(entryY - tpY);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(chartWidth * 0.25, tpBoxTop, chartWidth * 0.75, tpBoxHeight);

      // Lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, entryY);
      ctx.lineTo(chartWidth, entryY);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, slY);
      ctx.lineTo(chartWidth, slY);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(chartWidth * 0.25, tpY);
      ctx.lineTo(chartWidth, tpY);
      ctx.stroke();

      ctx.setLineDash([]);

      drawPillBadge(
        `ENTRY $${engineResult.entryPrice.toFixed(decimals)}`,
        chartWidth - 8,
        entryY,
        {
          align: 'right',
          bgColor: 'rgba(6, 24, 32, 0.94)',
          borderColor: '#06b6d4',
          textColor: '#22d3ee',
          fontSize: 9.5
        }
      );

      drawPillBadge(
        `SL $${engineResult.slPrice.toFixed(decimals)}`,
        chartWidth - 8,
        slY,
        {
          align: 'right',
          bgColor: 'rgba(32, 8, 12, 0.94)',
          borderColor: '#ef4444',
          textColor: '#f87171',
          fontSize: 9.5
        }
      );

      drawPillBadge(
        `TP $${engineResult.tpPrice.toFixed(decimals)} (${engineResult.rrRatio})`,
        chartWidth - 8,
        tpY,
        {
          align: 'right',
          bgColor: 'rgba(6, 28, 16, 0.94)',
          borderColor: '#10b981',
          textColor: '#34d399',
          fontSize: 9.5
        }
      );

      ctx.restore();
    }

    // 13. Live Dynamic Price Laser Line & Right Badge with Countdown
    const liveY = priceToY(livePrice);
    const lastActiveCandle = candles[candles.length - 1];
    const isBullishTick = lastActiveCandle ? livePrice >= lastActiveCandle.open : true;
    const liveStrokeColor = isBullishTick ? '#10b981' : '#ef4444';
    const liveBadgeBg = isBullishTick ? '#059669' : '#dc2626';

    ctx.save();
    ctx.strokeStyle = liveStrokeColor;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(chartWidth, liveY);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = liveStrokeColor;
    ctx.beginPath();
    ctx.arc(chartWidth - 4, liveY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Live Price Right Badge
    ctx.fillStyle = liveBadgeBg;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(chartWidth + 2, liveY - 10, rightMargin - 4, 20, 4);
    } else {
      ctx.rect(chartWidth + 2, liveY - 10, rightMargin - 4, 20);
    }
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(livePrice.toFixed(decimals), chartWidth + rightMargin / 2, liveY + 3.5);

    // Candle close countdown timer underneath price badge
    if (lastActiveCandle) {
      const tfMs = CloudMarketEngine.getTimeframeDurationMs(timeframe);
      const closeTime = lastActiveCandle.time + tfMs;
      const remSec = Math.max(0, Math.floor((closeTime - Date.now()) / 1000));
      let countdownStr = '';
      if (remSec < 3600) {
        const mm = Math.floor(remSec / 60);
        const ss = remSec % 60;
        countdownStr = `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
      } else {
        const hh = Math.floor(remSec / 3600);
        const mm = Math.floor((remSec % 3600) / 60);
        countdownStr = `${hh}h ${mm}m`;
      }
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '8px monospace';
      ctx.fillText(countdownStr, chartWidth + rightMargin / 2, liveY + 18);
    }
    ctx.restore();

    // 14. Interactive Hover Crosshair
    if (mousePos && mousePos.x <= chartWidth && mousePos.y <= chartHeight) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();

      const hoverPrice = yToPrice(mousePos.y);
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(chartWidth + 2, mousePos.y - 9, rightMargin - 4, 18, 3);
      } else {
        ctx.rect(chartWidth + 2, mousePos.y - 9, rightMargin - 4, 18);
      }
      ctx.fill();

      ctx.fillStyle = '#f4f4f5';
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
    swingPoints,
    zoom,
    panOffset,
    mousePos,
    orderFlowLevels,
    snrLevels,
    rbsZones,
    fibSetup,
    crtSetup,
    timeframe
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

  // Continuous 60fps animation frame sync for ultra-fluid market movement & countdown
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvas();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // Helper to update hovered candle based on X coordinate
  const updateHoveredCandle = (x: number, containerWidth: number) => {
    const rightMargin = 76;
    const chartWidth = containerWidth - rightMargin;
    if (x <= chartWidth && candles.length > 0) {
      const baseVisibleCandles = 50;
      const visibleCount = Math.max(15, Math.min(candles.length, Math.round(baseVisibleCandles / zoom)));
      const maxOffset = Math.max(0, candles.length - visibleCount);
      const clampedOffset = Math.max(0, Math.min(maxOffset, Math.round(panOffset)));
      const startIndex = Math.max(0, candles.length - visibleCount - clampedOffset);
      const visibleSlice = candles.slice(startIndex, startIndex + visibleCount);

      const rightOffsetBars = 3.5;
      const candleWidth = chartWidth / (visibleSlice.length + rightOffsetBars);
      const idx = Math.floor(x / candleWidth);
      if (idx >= 0 && idx < visibleSlice.length) {
        setHoveredCandle(visibleSlice[idx]);
        return;
      }
    }
    setHoveredCandle(null);
  };

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
    updateHoveredCandle(x, rect.width);

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

  // Mobile Touch Gestures (Single Finger Pan, Double Finger Pinch Zoom, Tap Crosshair)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, dist: 0 };
      setIsDragging(true);
      setDragStartX(touch.clientX);
      setMousePos({ x, y });
      updateHoveredCandle(x, rect.width);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      touchStartRef.current = { x: 0, y: 0, dist };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging && touchStartRef.current) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      setMousePos({ x, y });
      updateHoveredCandle(x, rect.width);

      const dx = touch.clientX - dragStartX;
      const candleShift = dx / 12;
      setPanOffset(prev => prev + candleShift);
      setDragStartX(touch.clientX);
    } else if (e.touches.length === 2 && touchStartRef.current && touchStartRef.current.dist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const ratio = newDist / touchStartRef.current.dist;
      if (ratio > 1.04) {
        setZoom(z => Math.min(4.0, z * 1.04));
        touchStartRef.current.dist = newDist;
      } else if (ratio < 0.96) {
        setZoom(z => Math.max(0.4, z * 0.96));
        touchStartRef.current.dist = newDist;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
  };

  const currentCandle = hoveredCandle || candles[candles.length - 1];
  const candleChange = currentCandle
    ? ((currentCandle.close - currentCandle.open) / (currentCandle.open || 1)) * 100
    : 0;

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-[#06070a] rounded-xl overflow-hidden border border-neutral-800 shadow-2xl select-none flex flex-col" ref={containerRef}>
      {/* Top Floating Modern Header with OHLC Bar */}
      <div className="absolute top-2 left-2 right-14 sm:right-auto z-10 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono bg-[#0c0e14]/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400 shadow-lg overflow-x-auto custom-scrollbar whitespace-nowrap">
        <span className="text-white font-bold tracking-wide">{symbol}</span>
        <span className="text-neutral-500 uppercase">{timeframe}</span>
        {currentCandle && (
          <>
            <span>O: <strong className="text-neutral-200">{currentCandle.open.toFixed(decimals)}</strong></span>
            <span>H: <strong className="text-emerald-400">{currentCandle.high.toFixed(decimals)}</strong></span>
            <span>L: <strong className="text-red-400">{currentCandle.low.toFixed(decimals)}</strong></span>
            <span>C: <strong className={currentCandle.close >= currentCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              {currentCandle.close.toFixed(decimals)}
            </strong></span>
            <span className={`font-bold ${candleChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({candleChange >= 0 ? '+' : ''}{candleChange.toFixed(2)}%)
            </span>
          </>
        )}
      </div>

      {/* Floating Market Structure & Signal Verification HUD */}
      {showStructureHUD && verification && (
        <div className="absolute top-12 left-3 z-20 max-w-xs transition-all duration-200">
          <div className="bg-[#0b0d13] border border-neutral-800 rounded-xl p-2.5 shadow-2xl text-xs font-mono">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <ShieldCheck size={14} className="text-red-400 shrink-0" />
                <span className="text-[11px] tracking-wide text-neutral-200">Audit Sinyal vs Struktur</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {verification.confidenceScore}% Valid
                </span>
                <button
                  onClick={() => setIsHUDExpanded(v => !v)}
                  className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Detail Audit"
                >
                  {isHUDExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Bias Tren:</span>
                <span className={`font-bold ${
                  verification.structureBias === 'BULLISH' 
                    ? 'text-emerald-400' 
                    : verification.structureBias === 'BEARISH'
                      ? 'text-red-400'
                      : 'text-amber-400'
                }`}>
                  {verification.structureBias}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Verifikasi BOS:</span>
                <span className="flex items-center gap-1 font-bold">
                  {verification.isSignalAlignedWithBOS ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Searah Tren</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={11} className="text-amber-400" />
                      <span className="text-amber-400">Counter-Trend</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Pijakan Order Block:</span>
                <span className="flex items-center gap-1 font-bold">
                  {verification.isSignalFromFreshOB ? (
                    <>
                      <CheckCircle2 size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">OB Baru (Fresh)</span>
                    </>
                  ) : (
                    <span className="text-neutral-400">Equilibrium/Market</span>
                  )}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {isHUDExpanded && (
              <div className="mt-2 pt-2 border-t border-neutral-800 space-y-1.5 text-[10px] text-neutral-300">
                <div className="p-1.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 leading-relaxed">
                  {verification.summaryText}
                </div>
                <div className="flex justify-between text-neutral-400 pt-0.5">
                  <span>Historical OB: <strong className="text-white">{verification.historicalOBCount}</strong></span>
                  <span>BOS/CHoCH: <strong className="text-white">{verification.historicalBOSCount}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Zoom & Tool Controls */}
      <div className="absolute top-2 right-2 sm:right-3 z-10 flex items-center gap-1 bg-[#0c0e14]/90 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-lg border border-neutral-800 text-xs font-mono shadow-lg">
        <button
          onClick={() => setShowStructureHUD(v => !v)}
          className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition ${
            showStructureHUD ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40' : 'text-neutral-400 hover:text-white'
          }`}
          title="Toggle Audit HUD"
        >
          <Layers size={11} />
          <span className="hidden sm:inline">Audit Layer</span>
        </button>

        <span className="text-neutral-700">|</span>

        <button
          onClick={() => setZoom(z => Math.min(4.0, z * 1.2))}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-300 cursor-pointer"
          title="Perbesar Chart"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={() => { setZoom(1); setPanOffset(0); }}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          title="Reset Zoom & Pan"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-300 cursor-pointer"
          title="Perkecil Chart"
        >
          <ZoomOut size={13} />
        </button>
      </div>

      {/* HTML5 Canvas Surface with Mouse & Touch Event Listeners */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
};
