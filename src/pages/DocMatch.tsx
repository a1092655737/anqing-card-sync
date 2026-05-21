import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT } from '@/data/products';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';

const operators = ['全部', '中国广电', '中国移动', '中国电信', '中国联通'];

const OP_BTN: Record<string, { active: string; inactive: string }> = {
  '全部': {
    active: 'bg-white/90 text-[#0f0c29]',
    inactive: 'bg-white/5 text-white/50 hover:bg-white/10',
  },
  '中国广电': {
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    inactive: 'bg-emerald-500/5 text-emerald-400/50 hover:bg-emerald-500/10',
  },
  '中国移动': {
    active: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    inactive: 'bg-blue-500/5 text-blue-400/50 hover:bg-blue-500/10',
  },
  '中国电信': {
    active: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    inactive: 'bg-orange-500/5 text-orange-400/50 hover:bg-orange-500/10',
  },
  '中国联通': {
    active: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    inactive: 'bg-purple-500/5 text-purple-400/50 hover:bg-purple-500/10',
  },
};

export default function DocMatch() {
  const { state } = useData();
  const [search, setSearch] = useState('');
  const [filterOp, setFilterOp] = useState('全部');

  const filtered = state.products.filter(p => {
    if (filterOp !== '全部' && p.operator !== filterOp) return false;
    if (search && !p.product_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const withDoc = filtered.filter(p => p.discount_package && p.discount_package.length > 5).length;
  const withoutDoc = filtered.length - withDoc;

  const getDocStatus = (p: typeof state.products[0]) => {
    if (p.discount_package && p.discount_package.length > 5) {
      return { status: 'matched', label: '已匹配', cls: 'status-matched' };
    }
    return { status: 'missing', label: '待补充', cls: 'status-missing' };
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">文稿匹配</h2>
        <p className="text-xs text-white/40 mt-1">检查产品文档与优惠期信息的匹配状态</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="stat-card p-4">
          <p className="text-[11px] text-white/40 mb-1.5">总产品</p>
          <p className="text-2xl font-bold text-white">{filtered.length}</p>
        </div>
        <div className="stat-card p-4" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
          <p className="text-[11px] text-emerald-400/70 mb-1.5">已匹配文档</p>
          <p className="text-2xl font-bold text-emerald-400">{withDoc}</p>
        </div>
        <div className="stat-card p-4" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
          <p className="text-[11px] text-amber-400/70 mb-1.5">待补充文档</p>
          <p className="text-2xl font-bold text-amber-400">{withoutDoc}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card-glass p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {operators.map(op => (
              <button
                key={op}
                onClick={() => setFilterOp(op)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  filterOp === op ? OP_BTN[op].active : OP_BTN[op].inactive
                }`}
              >
                {op === '全部' ? '全部' : op}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="搜索产品名称..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 input-dark text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">产品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">运营商</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">文档状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">优惠期信息</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">流量信息</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const docStatus = getDocStatus(p);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-white/90">{p.product_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      p.operator === '中国广电' ? 'op-badge-gd' :
                      p.operator === '中国移动' ? 'op-badge-yd' :
                      p.operator === '中国电信' ? 'op-badge-dx' : 'op-badge-lt'
                    }`}>
                      {OPERATOR_SHORT[p.operator]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${docStatus.cls}`}>
                      {docStatus.status === 'matched' ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{docStatus.label}</span>
                      ) : (
                        <span className="flex items-center gap-1"><XCircle className="w-3 h-3" />{docStatus.label}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50 max-w-xs truncate">
                    {p.discount_package || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    通用{p.general_flow}G
                    {p.directed_flow > 0 && <span className="text-orange-400 ml-1.5">定向{p.directed_flow}G</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30">没有找到匹配的产品</p>
          </div>
        )}
      </div>
    </main>
  );
}
