import { useState, useRef, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT } from '@/data/products';
import { Search, Download, X } from 'lucide-react';
import ImageCanvas from '@/components/ImageCanvas';
import JSZip from 'jszip';
import type { Product } from '@/types';

const OPERATORS = ['全部', '中国广电', '中国移动', '中国电信', '中国联通'] as const;

export default function Gallery() {
  const { state, saveImage } = useData();
  const [selectedOp, setSelectedOp] = useState<string>('全部');
  const [search, setSearch] = useState('');
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const canvasRefs = useRef<Record<string, HTMLCanvasElement>>({});

  const filteredProducts = state.products.filter(p => {
    if (selectedOp !== '全部' && p.operator !== selectedOp) return false;
    if (search && !p.product_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImageGenerated = useCallback((id: string, dataUrl: string) => {
    saveImage(id, dataUrl);
  }, [saveImage]);

  const downloadSingle = (product: Product) => {
    const dataUrl = state.generatedImages[product.id];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.download = `${product.product_name}.png`;
    a.href = dataUrl;
    a.click();
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const images = state.generatedImages;
    const products = state.products;

    setGenerating(true);
    setProgress({ current: 0, total: products.length });

    // Generate missing images first
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      setProgress({ current: i + 1, total: products.length });

      if (!images[p.id]) {
        // Need to generate - use offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = 375;
        canvas.height = 812;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw based on operator
          drawSimpleTemplate(ctx, p, 375, 812);
          const dataUrl = canvas.toDataURL('image/png');
          saveImage(p.id, dataUrl);
          zip.file(`${p.product_name}.png`, dataUrl.split(',')[1], { base64: true });
        }
      } else {
        zip.file(`${p.product_name}.png`, images[p.id].split(',')[1], { base64: true });
      }
    }

    setGenerating(false);
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '安青卡业_产品图库.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const drawSimpleTemplate = (ctx: CanvasRenderingContext2D, p: Product, w: number, h: number) => {
    const colors: Record<string, string> = {
      '中国广电': '#22c55e',
      '中国移动': '#3b82f6',
      '中国电信': '#f97316',
      '中国联通': '#a855f7',
    };
    const c = colors[p.operator] || '#3b82f6';

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, w, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('11:20', 20, 28);
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('5G', w - 20, 28);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(p.areas === '全国' ? '全国通用' : p.areas.substring(0, 8), 20, 58);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 90, w - 30, 160);
    ctx.fillStyle = c;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.product_name, w / 2, 140);

    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.moveTo(30, 175);
    ctx.lineTo(w - 30, 175);
    ctx.stroke();

    const yNum = 210, yUnit = 228, yLabel = 244;
    const cols = [
      { x: w * 0.2, label: '月租', suffix: '元', val: p.monthly_rent.toString() },
      { x: w * 0.5, label: '通话', suffix: '分钟', val: p.minutes.toString() },
      { x: w * 0.8, label: '流量', suffix: 'GB', val: p.total_flow.toString() },
    ];
    cols.forEach(col => {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.val, col.x, yNum);
      const metrics = ctx.measureText(col.val);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText(col.suffix, col.x + metrics.width / 2 + 6, yNum - 4);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(col.label, col.x, yLabel);
    });

    ctx.fillStyle = '#ccc';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('安青卡业 · 产品数据中心', w / 2, h - 20);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">总产品数</p>
          <p className="text-2xl font-bold text-gray-900">{state.products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
          <p className="text-xs text-green-500 mb-1">已生成图片</p>
          <p className="text-2xl font-bold text-green-600">{Object.keys(state.generatedImages).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
          <p className="text-xs text-blue-400 mb-1">运营商</p>
          <p className="text-2xl font-bold text-blue-600">4</p>
        </div>
        <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm">
          <p className="text-xs text-purple-400 mb-1">最近更新</p>
          <p className="text-sm font-semibold text-purple-600 mt-1">{new Date().toISOString().split('T')[0]}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {OPERATORS.map(op => (
              <button
                key={op}
                onClick={() => setSelectedOp(op)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedOp === op
                    ? op === '全部' ? 'bg-gray-900 text-white' :
                      op === '中国广电' ? 'bg-green-500 text-white' :
                      op === '中国移动' ? 'bg-blue-500 text-white' :
                      op === '中国电信' ? 'bg-orange-500 text-white' :
                      'bg-purple-500 text-white'
                    : op === '全部' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                      op === '中国广电' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                      op === '中国移动' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                      op === '中国电信' ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' :
                      'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {op === '全部' ? '全部' : op}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索产品名称..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={downloadAll}
              disabled={generating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {generating ? `生成中 ${progress.current}/${progress.total}` : '批量下载'}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg font-medium">未找到匹配的产品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              className="gallery-item bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
              onClick={() => setLightboxProduct(p)}
            >
              <div className="relative overflow-hidden">
                {state.generatedImages[p.id] ? (
                  <img
                    src={state.generatedImages[p.id]}
                    alt={p.product_name}
                    className="w-full aspect-[9/16] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] bg-gray-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-gray-400">预览生成中...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    p.operator === '中国广电' ? 'bg-green-50 text-green-600' :
                    p.operator === '中国移动' ? 'bg-blue-50 text-blue-600' :
                    p.operator === '中国电信' ? 'bg-orange-50 text-orange-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {OPERATOR_SHORT[p.operator]}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xs">{p.product_name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{p.monthly_rent}元/月 · {p.total_flow}G · {p.minutes}分钟</p>
                <p className="text-[10px] text-gray-300 mt-0.5 truncate">{p.areas.substring(0, 20)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden canvases for generation */}
      <div className="hidden">
        {filteredProducts.filter(p => !state.generatedImages[p.id]).map(p => (
          <div key={p.id} className="hidden-canvas">
            <ImageCanvas
              product={p}
              onGenerate={handleImageGenerated}
              width={375}
              height={812}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setLightboxProduct(null)}
        >
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxProduct(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={state.generatedImages[lightboxProduct.id] || ''}
              alt={lightboxProduct.product_name}
              className="w-full rounded-2xl shadow-2xl"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white">{lightboxProduct.product_name}</h3>
              <p className="text-white/60 text-sm mt-1">
                {lightboxProduct.monthly_rent}元/月 · {lightboxProduct.total_flow}G · {lightboxProduct.minutes}分钟
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => downloadSingle(lightboxProduct)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> 下载图片
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
