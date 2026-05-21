import { Product } from '@/types';
import { OPERATOR_SHORT } from '@/data/products';
import { Phone, Users, RefreshCw } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (p: Product) => void;
  index: number;
}

const OP_BADGE: Record<string, string> = {
  '中国广电': 'op-badge-gd',
  '中国移动': 'op-badge-yd',
  '中国电信': 'op-badge-dx',
  '中国联通': 'op-badge-lt',
};

const OP_BAR: Record<string, string> = {
  '中国广电': 'from-emerald-500 to-emerald-400',
  '中国移动': 'from-blue-500 to-blue-400',
  '中国电信': 'from-orange-500 to-orange-400',
  '中国联通': 'from-purple-500 to-purple-400',
};

export default function ProductCard({ product, onClick, index }: ProductCardProps) {
  const maxFlow = 300;
  const flowPercent = Math.min((product.total_flow / maxFlow) * 100, 100);
  const hasExtraCard = product.extra_card && product.extra_card.includes('副卡');
  const hasRollover = product.flow_rollover && product.flow_rollover.length > 0;

  const getAreaTag = () => {
    if (product.areas.includes('全国')) return { text: '全国', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
    if (product.areas.includes('随机')) return { text: '随机', cls: 'bg-blue-50 text-blue-500 border border-blue-100' };
    return { text: product.areas, cls: 'bg-amber-50 text-amber-600 border border-amber-100' };
  };

  const areaTag = getAreaTag();

  return (
    <div
      onClick={() => onClick(product)}
      className={`product-card-dark cursor-pointer relative overflow-hidden p-4 fade-in-up`}
      style={{
        animationDelay: `${index * 0.04}s`,
        animationFillMode: 'both',
        borderLeftWidth: '3px',
        borderLeftColor: product.operator === '中国广电' ? '#10b981' :
                        product.operator === '中国移动' ? '#3b82f6' :
                        product.operator === '中国电信' ? '#f97316' : '#a855f7',
      }}
    >
      {/* Top row: operator badge left, area + age right */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${OP_BADGE[product.operator]}`}>
          {OPERATOR_SHORT[product.operator]}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${areaTag.cls}`}>
            {areaTag.text}
          </span>
          <span className="text-[10px] text-gray-300">{product.age_limit}</span>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 text-sm mb-2.5 truncate">{product.product_name}</h3>

      <div className="flex items-baseline gap-0.5 mb-2">
        <span className="text-2xl font-bold text-gray-900">{product.monthly_rent}</span>
        <span className="text-xs text-gray-400">元/月</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-gray-900">{product.total_flow}G</span>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${OP_BAR[product.operator]}`}
            style={{ width: `${flowPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {product.general_flow > 0 && <span>通用 {product.general_flow}G</span>}
        {product.directed_flow > 0 && <span className="text-orange-500">定向 {product.directed_flow}G</span>}
      </div>

      {/* 优惠期标签 */}
      {product.discount_package && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {product.discount_package.split('、').slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
              {tag}
            </span>
          ))}
          {product.discount_package.split('、').length > 3 && (
            <span className="text-[10px] text-gray-400 px-1">+{product.discount_package.split('、').length - 3}</span>
          )}
        </div>
      )}

      {product.minutes > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Phone className="w-3 h-3" />
          <span>{product.minutes} 分钟通话</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {hasExtraCard && (
          <span className="text-[10px] flex items-center gap-0.5 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
            <Users className="w-2.5 h-2.5" /> 副卡
          </span>
        )}
        {hasRollover && (
          <span className="text-[10px] flex items-center gap-0.5 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
            <RefreshCw className="w-2.5 h-2.5" /> 结转
          </span>
        )}
      </div>

      <p className="text-[10px] text-gray-300 mt-2 truncate">{product.package_intro}</p>
    </div>
  );
}
