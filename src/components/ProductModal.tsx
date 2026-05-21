import { Product } from '@/types';
import { OPERATOR_SHORT } from '@/data/products';
import { X, MapPin, Clock, CreditCard, Phone, Users, RefreshCw, Tag, FileText, Wifi, TrendingUp } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const OP_BADGE: Record<string, string> = {
  '中国广电': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  '中国移动': 'bg-blue-50 text-blue-600 border border-blue-100',
  '中国电信': 'bg-orange-50 text-orange-600 border border-orange-100',
  '中国联通': 'bg-purple-50 text-purple-600 border border-purple-100',
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  const details = [
    { icon: Tag, label: '套餐类型', value: product.main_tag },
    { icon: FileText, label: '副标签', value: product.sub_tag || '无' },
    { icon: MapPin, label: '适用地区', value: product.full_areas || product.areas },
    { icon: Clock, label: '年龄限制', value: product.age_limit },
    { icon: CreditCard, label: '需身份证', value: product.need_idcard },
    { icon: FileText, label: '优惠套餐', value: product.discount_package || '无' },
    { icon: FileText, label: '协议期', value: product.agreement_period || '无' },
    { icon: Users, label: '副卡', value: product.extra_card || '不支持' },
    { icon: RefreshCw, label: '流量结转', value: product.flow_rollover || '不支持' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10 border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${OP_BADGE[product.operator]}`}>
              {OPERATOR_SHORT[product.operator]}
            </span>
            <h3 className="font-bold text-gray-900">{product.product_name}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Price & Flow Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{product.monthly_rent}</p>
                <p className="text-[11px] text-gray-500 mt-1">元/月</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{product.total_flow}G</p>
                <p className="text-[11px] text-gray-500 mt-1">总流量</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{product.minutes}</p>
                <p className="text-[11px] text-gray-500 mt-1">分钟</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-600">
              {product.general_flow > 0 && (
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-blue-500" /> 通用 {product.general_flow}G
                </span>
              )}
              {product.directed_flow > 0 && (
                <span className="flex items-center gap-1 text-orange-500">
                  <TrendingUp className="w-3 h-3" /> 定向 {product.directed_flow}G
                </span>
              )}
              {product.provincial_flow > 0 && (
                <span className="flex items-center gap-1 text-gray-600">省内 {product.provincial_flow}G</span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {details.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-100 last:border-0">
                <d.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-500">{d.label}</p>
                  <p className="text-sm text-gray-800 mt-0.5 break-words">{d.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Package Intro */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-[11px] text-gray-500 mb-1">套餐简介</p>
            <p className="text-sm text-gray-700">{product.package_intro}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
