import { useEffect, useRef, useCallback } from 'react';
import { Product } from '@/types';

interface ImageCanvasProps {
  product: Product | null;
  onGenerate?: (id: string, dataUrl: string) => void;
  width?: number;
  height?: number;
  style?: 'default' | 'minimal' | 'gradient';
  rounded?: boolean;
  showShadow?: boolean;
  showWatermark?: boolean;
}

const OP_THEME: Record<string, { primary: string; secondary: string; accent: string; bg: string; header: string }> = {
  '中国广电': { primary: '#10b981', secondary: '#059669', accent: '#34d399', bg: '#ecfdf5', header: '#065f46' },
  '中国移动': { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', bg: '#eff6ff', header: '#1e40af' },
  '中国电信': { primary: '#f97316', secondary: '#ea580c', accent: '#fb923c', bg: '#fff7ed', header: '#9a3412' },
  '中国联通': { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', bg: '#faf5ff', header: '#5b21b6' },
};

export default function ImageCanvas({ 
  product, 
  onGenerate, 
  width = 375, 
  height = 812,
  style = 'gradient',
  rounded = true,
  showShadow = true,
  showWatermark = true,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = useCallback((ctx: CanvasRenderingContext2D, p: Product, w: number, h: number) => {
    const theme = OP_THEME[p.operator] || OP_THEME['中国移动'];
    const r = rounded ? 16 : 0;

    // Helper: round rect
    function roundRect(x: number, y: number, rw: number, rh: number, rr: number) {
      if (typeof rr === 'number') {
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + rw - rr, y);
        ctx.quadraticCurveTo(x + rw, y, x + rw, y + rr);
        ctx.lineTo(x + rw, y + rh - rr);
        ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rr, y + rh);
        ctx.lineTo(x + rr, y + rh);
        ctx.quadraticCurveTo(x, y + rh, x, y + rh - rr);
        ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + rw, y);
        ctx.lineTo(x + rw, y + rh);
        ctx.lineTo(x, y + rh);
      }
      ctx.closePath();
    }

    // Shadow
    if (showShadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#ffffff';
      roundRect(12, 12, w - 24, h - 24, r);
      ctx.fill();
      ctx.restore();
    }

    // Phone background
    ctx.fillStyle = '#ffffff';
    roundRect(12, 12, w - 24, h - 24, r);
    ctx.fill();
    ctx.clip();

    // Status bar (gradient)
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, theme.primary);
    grad.addColorStop(1, theme.secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(12, 12, w - 24, 50);

    // Status bar text
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('12:00', 24, 42);
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('5G', w - 52, 42);
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillText('100%', w - 80, 42);

    // Signal dots
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.4 + i * 0.2})`;
      ctx.beginPath();
      ctx.arc(w - 28 - i * 5, 40, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Battery icon
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w - 38, 35, 18, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(w - 36, 37, 14, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(w - 19, 37, 2, 4);

    // Area text
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(p.areas === '全国' ? '全国通用' : p.areas, 24, 66);

    // Main card (glass effect)
    const cardX = 28, cardY = 85, cardW = w - 56, cardH = 190;
    
    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#ffffff';
    roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.restore();

    // Card top accent (gradient line)
    const cardGrad = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
    cardGrad.addColorStop(0, theme.primary);
    cardGrad.addColorStop(1, theme.accent);
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    ctx.moveTo(cardX + 14, cardY);
    ctx.lineTo(cardX + cardW - 14, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + 14);
    ctx.lineTo(cardX + cardW, cardY + 4);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW - 4, cardY);
    ctx.lineTo(cardX + 4, cardY);
    ctx.quadraticCurveTo(cardX, cardY, cardX, cardY + 4);
    ctx.lineTo(cardX, cardY + 14);
    ctx.quadraticCurveTo(cardX, cardY, cardX + 14, cardY);
    ctx.closePath();
    ctx.fill();

    // Product name
    ctx.fillStyle = theme.header;
    ctx.font = 'bold 18px -apple-system, "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    const name = p.product_name.length > 12 ? p.product_name.substring(0, 12) + '...' : p.product_name;
    ctx.fillText(name, w / 2, 145);

    // Subtitle
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
    ctx.fillText(`${p.operator} · 正规号卡`, w / 2, 165);

    // Divider
    ctx.strokeStyle = '#f0f0f2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 20, 180);
    ctx.lineTo(cardX + cardW - 20, 180);
    ctx.stroke();

    // Three columns with styled numbers
    const cols = [
      { x: w * 0.28, label: '月租', suffix: '元/月', val: p.monthly_rent.toString() },
      { x: w * 0.50, label: '总流量', suffix: 'G', val: p.total_flow.toString() },
      { x: w * 0.72, label: '通话', suffix: '分钟', val: p.minutes.toString() },
    ];

    cols.forEach(col => {
      // Number
      const numGrad = ctx.createLinearGradient(col.x - 20, 0, col.x + 20, 0);
      numGrad.addColorStop(0, theme.primary);
      numGrad.addColorStop(1, theme.secondary);
      ctx.fillStyle = numGrad;
      ctx.font = `bold 28px -apple-system, "PingFang SC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(col.val, col.x, 215);
      
      // Unit
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText(col.suffix, col.x, 230);
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(col.label, col.x, 245);
    });

    // Detail info cards (2x2 grid)
    const detailY = 295;
    const cardGap = 8;
    const dCardW = (w - 56 - cardGap) / 2;
    const dCardH = 55;
    
    const details = [
      { label: '通用流量', value: `${p.general_flow}G`, color: theme.primary },
      { label: '定向流量', value: `${p.directed_flow}G`, color: theme.secondary },
      { label: '适用地区', value: p.areas, color: theme.header },
      { label: '协议期', value: p.agreement_period || '长期有效', color: theme.header },
    ];

    details.forEach((d, i) => {
      const dx = 28 + (i % 2) * (dCardW + cardGap);
      const dy = detailY + Math.floor(i / 2) * (dCardH + cardGap);
      
      // Card bg
      ctx.fillStyle = '#f8f8fa';
      roundRect(dx, dy, dCardW, dCardH, 10);
      ctx.fill();
      
      // Left accent bar
      ctx.fillStyle = d.color + '30';
      ctx.fillRect(dx, dy + 4, 3, dCardH - 8);
      
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'left';
      ctx.fillText(d.label, dx + 12, dy + 20);
      
      ctx.font = 'bold 13px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.fillText(d.value, dx + 12, dy + 40);
    });

    // Promotion section
    if (p.discount_package) {
      const promoY = detailY + 125;
      
      // Gradient bg
      const promoGrad = ctx.createLinearGradient(28, promoY, w - 28, promoY);
      promoGrad.addColorStop(0, theme.bg);
      promoGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = promoGrad;
      roundRect(28, promoY, w - 56, 60, 12);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = theme.accent + '40';
      ctx.lineWidth = 1;
      roundRect(28, promoY, w - 56, 60, 12);
      ctx.stroke();
      
      // Icon circle
      ctx.fillStyle = theme.primary + '15';
      ctx.beginPath();
      ctx.arc(52, promoY + 30, 14, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('惠', 52, promoY + 35);
      
      ctx.font = 'bold 12px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = theme.header;
      ctx.textAlign = 'left';
      ctx.fillText('优惠套餐', 74, promoY + 22);
      
      ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#6b7280';
      const promoText = p.discount_package.length > 22 ? p.discount_package.substring(0, 22) + '...' : p.discount_package;
      ctx.fillText(promoText, 74, promoY + 42);
    }

    // Bottom branding
    const brandY = h - 45;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(w / 2 - 30, brandY, 60, 3);
    ctx.fillStyle = '#d1d5db';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('安青卡业 · 正规号卡', w / 2, brandY + 18);

    // Watermark
    if (showWatermark) {
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = theme.primary;
      ctx.font = 'bold 60px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText('安青卡业', 0, 0);
      ctx.restore();
    }

  }, [rounded, showShadow, showWatermark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !product) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCard(ctx, product, width, height);
    if (onGenerate) {
      const dataUrl = canvas.toDataURL('image/png');
      onGenerate(product.id, dataUrl);
    }
  }, [product, width, height, drawCard, onGenerate]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl gap-3" 
           style={{ width, height: height * 0.6, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/30 text-sm">选择产品生成图片</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="rounded-2xl" 
        style={{ maxWidth: '100%', height: 'auto', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)' }} 
      />
    </div>
  );
}
