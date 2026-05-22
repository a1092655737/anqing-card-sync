import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT } from '@/data/products';
import { Search, Download, Image, Loader2, Check, Sparkles, Hash, Eye } from 'lucide-react';

const OPERATORS = ['全部', '中国广电', '中国移动', '中国电信', '中国联通'] as const;
type GenMode = 'product' | 'custom';

export default function Generator() {
  const { state } = useData();
  const products = state.products;
  const [mode, setMode] = useState<GenMode>('product');

  // Product mode state
  const [selectedOp, setSelectedOp] = useState<string>('全部');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  // Custom mode state
  const [customName, setCustomName] = useState('');
  const [customRent, setCustomRent] = useState('');
  const [customFlow, setCustomFlow] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [customOp, setCustomOp] = useState('中国电信');
  const CUSTOM_OPS = ['中国广电', '中国移动', '中国电信', '中国联通'];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(360);
  const roRef = useRef<ResizeObserver | null>(null);

  // Callback ref for ResizeObserver — ensures it fires when DOM node is ready
  const previewRef = useCallback((node: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (!node) return;
    const ro = new ResizeObserver(entries => {
      setPreviewWidth(entries[0].contentRect.width);
    });
    ro.observe(node);
    roRef.current = ro;
  }, []);

  // Cleanup ResizeObserver on unmount
  useEffect(() => {
    return () => {
      if (roRef.current) {
        roRef.current.disconnect();
        roRef.current = null;
      }
    };
  }, []);

  // Product mode logic
  const filtered = products.filter(p => {
    if (selectedOp !== '全部' && p.operator !== selectedOp) return false;
    if (search && !p.product_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const selectedProduct = products.find(p => p.id === selectedId) || null;
  const cardUrl = selectedProduct ? `/images/cards/${selectedProduct.id}.jpg` : '';

  const templateProduct = useMemo(() => {
    if (mode !== 'custom') return null;
    return products.find(p => p.operator === customOp) || null;
  }, [mode, customOp, products]);

  const isGuangdian = customOp === '中国广电';

  // ===== Download handler =====
  const handleDownload = useCallback(async () => {
    if (mode === 'product' && selectedProduct) {
      const a = document.createElement('a');
      a.download = `${selectedProduct.product_name}.jpg`;
      a.href = cardUrl;
      a.click();
      return;
    }

    if (mode !== 'custom') return;

    if (isGuangdian) {
      // Use fetch to get blob, then draw on canvas (avoids CORS)
      try {
        const res = await fetch('/images/guangdian-template.png');
        if (!res.ok) throw new Error('模板加载失败');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const TPL_W = 1179;
        const TPL_H = 2556;
        const CW = 500;
        const CH = Math.round(TPL_H * (CW / TPL_W));
        canvas.width = CW;
        canvas.height = CH;
        const s = CW / TPL_W;

        const rentNum = parseFloat(customRent);
        const flowNum = parseFloat(customFlow);

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, CW, CH);
          ctx.drawImage(img, 0, 0, CW, CH);

          // Draw numbers
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const positions: [string, number, number, number, number, number, number, number][] = [
            [String(rentNum), Math.round(246 * s), Math.round(1338 * s), Math.round(91 * s), Math.round(179 * s), Math.round(1293 * s), Math.round(135 * s), Math.round(91 * s)],
            [String(parseFloat(customMinutes) || 0), Math.round(586 * s), Math.round(1342 * s), Math.round(84 * s), Math.round(506 * s), Math.round(1300 * s), Math.round(161 * s), Math.round(84 * s)],
            [String(flowNum), Math.round(935 * s), Math.round(1341 * s), Math.round(82 * s), Math.round(861 * s), Math.round(1300 * s), Math.round(148 * s), Math.round(82 * s)],
          ];

          for (const [text, cx, cy, fontSize, cX, cY, cW, cH] of positions) {
            ctx.fillStyle = '#FFFBFB';
            ctx.fillRect(cX, cY, cW, cH);
            ctx.fillStyle = '#1A1A1A';
            ctx.font = `400 ${Math.max(12, fontSize)}px "MiSans", "MiSans-Regular", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`;
            ctx.fillText(text, cx, cy);
          }

          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `${customName || '自定义卡品'}.png`;
          a.href = dataUrl;
          a.click();
          URL.revokeObjectURL(blobUrl);
        };
        img.src = blobUrl;
      } catch (e) {
        alert('下载失败: ' + (e as Error).message);
      }
    } else {
      // Non-Guangdian: use card image
      const tp = templateProduct;
      if (!tp) return;
      try {
        const res = await fetch(`/images/cards/${tp.id}.jpg`);
        if (!res.ok) throw new Error('卡品图片加载失败');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 720;
        const H = 1280;
        canvas.width = W;
        canvas.height = H;

        const rentNum = parseFloat(customRent);
        const flowNum = parseFloat(customFlow);

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);

          // Price
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 6;
          ctx.font = `bold ${W * 0.14}px "PingFang SC", "Microsoft YaHei", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`${rentNum}`, W * 0.5, H * 0.40);
          ctx.font = `bold ${W * 0.045}px "PingFang SC", sans-serif`;
          ctx.fillText('元/月', W * 0.5, H * 0.45);

          // Flow
          ctx.font = `bold ${W * 0.055}px "PingFang SC", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(`${flowNum}GB`, W * 0.1, H * 0.57);

          // Minutes
          const minsNum = parseFloat(customMinutes) || 0;
          if (minsNum > 0) {
            ctx.fillText(`${minsNum}分钟`, W * 0.55, H * 0.57);
          }

          // Name
          if (customName) {
            ctx.font = `bold ${W * 0.05}px "PingFang SC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(customName, W * 0.5, H * 0.23);
          }

          // Operator badge
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = `bold ${W * 0.035}px "PingFang SC", sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(customOp, W * 0.9, H * 0.08);

          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `${customName || '自定义卡品'}.png`;
          a.href = dataUrl;
          a.click();
          URL.revokeObjectURL(blobUrl);
        };
        img.src = blobUrl;
      } catch (e) {
        alert('下载失败: ' + (e as Error).message);
      }
    }
  }, [mode, selectedProduct, cardUrl, isGuangdian, customRent, customFlow, customMinutes, customName, customOp, templateProduct]);

  const handleGenerate = async (product: typeof products[0]) => {
    setGenerating(product.id);
    setSelectedId(product.id);
    await new Promise(r => setTimeout(r, 300));
    setGenerating(null);
  };

  // ===== Preview sub-components =====

  // Guangdian preview: template PNG + CSS absolute-positioned numbers
  const GuangdianPreview = () => {
    const s = previewWidth / 1179;
    return (
      <div ref={previewRef} className="relative" style={{ maxWidth: 360 }}>
        <img
          src="/images/guangdian-template.png"
          alt={customName || '广电卡品'}
          className="w-full h-auto rounded-2xl"
        />
        <div className="absolute inset-0">
          {/* 月租: center=(246,1338), font_h=91 */}
          <span
            className="absolute text-[#1A1A1A]"
            style={{
              left: '20.86%', top: '52.35%',
              fontSize: `${Math.max(12, Math.round(91 * s))}px`,
              fontFamily: '"MiSans", "MiSans-Regular", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
              fontWeight: 330,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {customRent}
          </span>
          {/* 通话: center=(586,1342), font_h=84 */}
          <span
            className="absolute text-[#1A1A1A]"
            style={{
              left: '49.70%', top: '52.50%',
              fontSize: `${Math.max(12, Math.round(84 * s))}px`,
              fontFamily: '"MiSans", "MiSans-Regular", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
              fontWeight: 330,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {parseFloat(customMinutes) || 0}
          </span>
          {/* 流量: center=(935,1341), font_h=82 */}
          <span
            className="absolute text-[#1A1A1A]"
            style={{
              left: '79.30%', top: '52.46%',
              fontSize: `${Math.max(12, Math.round(82 * s))}px`,
              fontFamily: '"MiSans", "MiSans-Regular", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
              fontWeight: 330,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {customFlow}
          </span>
        </div>
      </div>
    );
  };

  // Non-Guangdian preview: card image + CSS absolute-positioned numbers
  const NonGuangdianPreview = () => {
    const tp = templateProduct;
    if (!tp) return null;
    const s = previewWidth / 720; // card images are 720x1280
    return (
      <div ref={previewRef} className="relative" style={{ maxWidth: 360 }}>
        <img
          src={`/images/cards/${tp.id}.jpg`}
          alt={customName || tp.product_name}
          className="w-full h-auto rounded-2xl"
        />
        <div className="absolute inset-0">
          {/* 卡品名称 - 23%高度 */}
          {customName && (
            <span
              className="absolute text-white font-bold"
              style={{
                left: '50%', top: '23%',
                fontSize: `${Math.max(12, Math.round(720 * 0.05 * s))}px`,
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                transform: 'translate(-50%, -50%)',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {customName}
            </span>
          )}
          {/* 月租大字 - 40%高度 */}
          <span
            className="absolute text-white font-bold"
            style={{
              left: '50%', top: '40%',
              fontSize: `${Math.max(18, Math.round(720 * 0.14 * s))}px`,
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              transform: 'translate(-50%, -50%)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {customRent}
          </span>
          {/* 元/月 - 45%高度 */}
          <span
            className="absolute text-white font-bold"
            style={{
              left: '50%', top: '45%',
              fontSize: `${Math.max(9, Math.round(720 * 0.045 * s))}px`,
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              transform: 'translate(-50%, -50%)',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            }}
          >
            元/月
          </span>
          {/* 流量 - 57%高度 */}
          <span
            className="absolute text-white font-bold"
            style={{
              left: '10%', top: '57%',
              fontSize: `${Math.max(10, Math.round(720 * 0.055 * s))}px`,
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              transform: 'translateY(-50%)',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            }}
          >
            {customFlow}GB
          </span>
          {/* 通话 - 57%高度 */}
          {parseFloat(customMinutes) > 0 && (
            <span
              className="absolute text-white font-bold"
              style={{
                left: '55%', top: '57%',
                fontSize: `${Math.max(10, Math.round(720 * 0.055 * s))}px`,
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                transform: 'translateY(-50%)',
                textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              }}
            >
              {customMinutes}分钟
            </span>
          )}
          {/* 运营商标签 - 右上角 */}
          <span
            className="absolute text-white/90 font-bold"
            style={{
              right: '10%', top: '8%',
              fontSize: `${Math.max(9, Math.round(720 * 0.035 * s))}px`,
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              transform: 'translateY(-50%)',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {customOp}
          </span>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Hidden canvas for download-only rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">图片生成器</h2>
        <p className="text-xs text-white/40 mt-1">基于卡模板生成推广图片</p>
      </div>

      {/* Mode Switch */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => { setMode('product'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'product'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
          }`}
        >
          <Hash className="w-4 h-4" /> 选择卡品
        </button>
        <button
          onClick={() => { setMode('custom'); setSelectedId(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === 'custom'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 自定义参数
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-white/[0.07] bg-[#13102b]/50 p-4">
            {mode === 'product' && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-4 h-4 text-purple-400" />
                  <h3 className="font-semibold text-white text-sm">选择产品</h3>
                  <span className="text-xs text-white/30 ml-auto">{filtered.length} 款</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {OPERATORS.map(op => (
                    <button
                      key={op}
                      onClick={() => setSelectedOp(op)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        selectedOp === op
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {op === '全部' ? '全部' : OPERATOR_SHORT[op]}
                    </button>
                  ))}
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="text"
                    placeholder="搜索产品..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                  {filtered.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleGenerate(p)}
                      className={`rounded-xl border p-3 cursor-pointer transition-all ${
                        selectedId === p.id
                          ? 'border-violet-500/40 bg-violet-500/10'
                          : 'border-white/[0.05] bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${p.operator === '中国广电' ? 'bg-emerald-500/15 text-emerald-400' : p.operator === '中国移动' ? 'bg-blue-500/15 text-blue-400' : p.operator === '中国电信' ? 'bg-orange-500/15 text-orange-400' : 'bg-purple-500/15 text-purple-400'}`}>{OPERATOR_SHORT[p.operator]}</span>
                        {generating === p.id && <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />}
                        {selectedId === p.id && !generating && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <h4 className="font-semibold text-white text-xs truncate">{p.product_name}</h4>
                      <p className="text-[10px] text-white/30">{p.monthly_rent}元 | {p.total_flow}G | {p.minutes}分钟</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {mode === 'custom' && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="font-semibold text-white text-sm">自定义参数</h3>
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-white/40 mb-1.5 block">运营商</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {CUSTOM_OPS.map(op => (
                      <button
                        key={op}
                        onClick={() => { setCustomOp(op); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          customOp === op
                            ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {OPERATOR_SHORT[op]}
                      </button>
                    ))}
                  </div>
                  {templateProduct && (
                    <p className="text-[10px] text-white/30 mt-1">模板底图：{templateProduct.product_name}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-white/40 mb-1.5 block">卡品名称</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="例如：星耀卡"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500/30 placeholder-white/20"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-white/40 mb-1.5 block">月租（元/月）</label>
                  <input
                    type="number"
                    value={customRent}
                    onChange={e => setCustomRent(e.target.value)}
                    placeholder="例如：19"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500/30 placeholder-white/20"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-white/40 mb-1.5 block">流量（G）</label>
                  <input
                    type="number"
                    value={customFlow}
                    onChange={e => setCustomFlow(e.target.value)}
                    placeholder="例如：185"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500/30 placeholder-white/20"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-white/40 mb-1.5 block">通话（分钟，可选）</label>
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    placeholder="例如：100（不填则为0）"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-violet-500/30 placeholder-white/20"
                  />
                </div>

                {customName && customRent && customFlow && (
                  <div className="mt-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs font-semibold text-violet-300">{customOp} · {customName}</p>
                    <p className="text-[10px] text-violet-400/60 mt-0.5">{customRent}元/月 | {customFlow}G{customMinutes ? ` | ${customMinutes}分钟` : ''}</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleDownload}
              disabled={mode === 'product' ? !selectedProduct : (!templateProduct || !customRent || !customFlow)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" /> 下载图片
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-white/[0.07] bg-[#13102b]/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-400" /> 图片预览
              </h3>
              {mode === 'custom' && templateProduct && customRent && customFlow && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  实时预览中
                </span>
              )}
            </div>
            <div className="flex justify-center">
              {mode === 'product' && selectedProduct ? (
                <div className="relative" style={{ maxWidth: 360 }}>
                  <img src={cardUrl} alt={selectedProduct.product_name} className="w-full h-auto rounded-2xl" />
                </div>
              ) : mode === 'custom' && isGuangdian && templateProduct ? (
                <GuangdianPreview />
              ) : mode === 'custom' && !isGuangdian && templateProduct ? (
                <NonGuangdianPreview />
              ) : mode === 'custom' && !templateProduct ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-red-400/30" />
                  </div>
                  <p className="text-sm font-medium">未找到该运营商的产品</p>
                  <p className="text-[10px] text-white/20">请先在管理页面添加产品数据</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <Image className="w-8 h-8 text-violet-400/30" />
                  </div>
                  <p className="text-white/30 text-sm">
                    {mode === 'product' ? '点击左侧产品生成图片' : '请选择运营商并填写参数'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
