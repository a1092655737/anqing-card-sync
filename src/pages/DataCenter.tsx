import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT, PRICE_OPTIONS, FLOW_OPTIONS } from '@/data/products';
import { Search, MapPin } from 'lucide-react';
import AutoRefresh from '@/components/AutoRefresh';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import type { Product } from '@/types';

const OPERATORS = ['全部', '中国广电', '中国移动', '中国电信', '中国联通'] as const;

const OP_TEXT: Record<string, string> = {
  '全部': 'text-white',
  '中国广电': 'text-emerald-400',
  '中国移动': 'text-blue-400',
  '中国电信': 'text-orange-400',
  '中国联通': 'text-purple-400',
};

export default function DataCenter() {
  const { state, filteredProducts, operatorCounts, setFilter } = useData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Title + Status */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">卡品信息</h2>
          <p className="text-xs text-white/40 mt-1">实时产品数据概览与筛选</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
            <span className="text-white/60">上架中</span>
            <span className="font-bold text-white">{state.products.length}</span>
            <span className="text-white/40">款</span>
          </span>
          <AutoRefresh />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div className="stat-card p-4">
          <p className="text-[11px] text-gray-500 mb-1.5">总产品</p>
          <p className="text-2xl font-bold text-gray-800">{state.products.length}</p>
        </div>
        {OPERATORS.slice(1).map(op => (
          <div key={op} className="stat-card p-4">
            <p className="text-[11px] text-gray-500 mb-1.5">{OPERATOR_SHORT[op]}</p>
            <p className={`text-2xl font-bold ${OP_TEXT[op]}`}>
              {operatorCounts[op] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card-glass p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {OPERATORS.map(op => (
              <button
                key={op}
                onClick={() => setFilter({ operator: op })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  state.filter.operator === op ? 'filter-btn-active' : 'filter-btn'
                }`}
              >
                {op === '全部' ? '全部' : OPERATOR_SHORT[op]}
              </button>
            ))}
          </div>
          <div className="flex-1 lg:max-w-md ml-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="搜索产品名称..."
                value={state.filter.search}
                onChange={e => setFilter({ search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 input-dark text-sm text-gray-900"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="搜索归属地..."
                value={state.filter.areaSearch}
                onChange={e => setFilter({ areaSearch: e.target.value })}
                className="w-full pl-9 pr-3 py-2 input-dark text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-purple-500/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">月租:</span>
            <select
              value={state.filter.priceRange}
              onChange={e => setFilter({ priceRange: e.target.value })}
              className="text-xs select-dark px-2 py-1.5 text-gray-700"
            >
              {PRICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">流量:</span>
            <select
              value={state.filter.flowRange}
              onChange={e => setFilter({ flowRange: e.target.value })}
              className="text-xs select-dark px-2 py-1.5 text-gray-700"
            >
              {FLOW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="ml-auto text-xs text-gray-400">
            共 <span className="font-semibold text-gray-700">{filteredProducts.length}</span> 款
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/30">没有找到符合条件的产品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onClick={setSelectedProduct} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </main>
  );
}
