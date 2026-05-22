import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT } from '@/data/products';
import { Search, Download, Image, Loader2, Check } from 'lucide-react';

const OPERATORS = ['全部', '中国广电', '中国移动', '中国电信', '中国联通'] as const;

export default function Generator() {
  const { state } = useData();
  const [selectedOp, setSelectedOp] = useState<string>('全部');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = state.products.filter(p => {
    if (selectedOp !== '全部' && p.operator !== selectedOp) return false;
    if (search && !p.product_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedProduct = state.products.find(p => p.id === selectedId) || null;

  // Card image URL (pre-generated)
  const cardUrl = useMemo(() => {
    if (!selectedProduct) return '';
    return `/images/cards/${selectedProduct.id}.jpg`;
  }, [selectedProduct]);

  const handleDownload = () => {
    if (!selectedProduct) return;
    const a = document.createElement('a');
    a.download = `${selectedProduct.product_name}.jpg`;
    a.href = cardUrl;
    a.click();
  };

  const handleGenerate = async (product: typeof state.products[0]) => {
    setGenerating(product.id);
    setSelectedId(product.id);
    await new Promise(r => setTimeout(r, 300));
    setGenerating(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">图片生成器</h2>
          <p className="text-xs text-white/40 mt-1">基于卡模板生成推广图片</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product List */}
        <div className="lg:col-span-5">
          <div className="card-glass p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-gray-800 text-sm">选择产品</h3>
              <span className="text-xs text-gray-400 ml-auto">{filtered.length} 款</span>
            </div>
            <div className="flex gap-1 flex-wrap mb-3">
              {OPERATORS.map(op => (
                <button key={op} onClick={() => setSelectedOp(op)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedOp === op ? 'filter-btn-active' : 'filter-btn'
                  }`}>{op === '全部' ? '全部' : OPERATOR_SHORT[op]}</button>
              ))}
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="搜索产品..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 input-dark text-xs text-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {filtered.map(p => (
                <div key={p.id} onClick={() => handleGenerate(p)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedId === p.id ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      p.operator === '中国广电' ? 'bg-emerald-100 text-emerald-600' :
                      p.operator === '中国移动' ? 'bg-blue-100 text-blue-600' :
                      p.operator === '中国电信' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>{OPERATOR_SHORT[p.operator]}</span>
                    {generating === p.id && <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />}
                    {selectedId === p.id && !generating && <Check className="w-3 h-3 text-green-500" />}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-xs truncate">{p.product_name}</h4>
                  <p className="text-[10px] text-gray-400">{p.monthly_rent}元 | {p.total_flow}G | {p.minutes}分钟</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-7">
          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">图片预览</h3>
              <button onClick={handleDownload} disabled={!selectedProduct}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                  selectedProduct ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}><Download className="w-4 h-4" /> 下载图片</button>
            </div>

            {selectedProduct ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ maxWidth: 360 }}>
                  <img src={cardUrl} alt={selectedProduct.product_name}
                    className="w-full h-auto"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }} />
                </div>
                <p className="text-xs text-gray-500">
                  {selectedProduct.product_name} · {selectedProduct.monthly_rent}元/月 · {selectedProduct.total_flow}G · {selectedProduct.minutes}分钟
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <Image className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-gray-400 text-sm">点击左侧产品生成图片</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
