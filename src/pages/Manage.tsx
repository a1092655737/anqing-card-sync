import { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { OPERATOR_SHORT } from '@/data/products';
import { Plus, Pencil, Trash2, Download, Upload, RotateCcw, Search, Save, X } from 'lucide-react';

const EMPTY_PRODUCT: Record<string, any> = {
  operator: '中国广电',
  product_name: '',
  package_intro: '',
  monthly_rent: 29,
  total_flow: 0,
  general_flow: 0,
  directed_flow: 0,
  provincial_flow: 0,
  minutes: 0,
  main_tag: '',
  sub_tag: '',
  areas: '',
  age_limit: '18-60周岁',
  need_idcard: '否',
  discount_package: '',
  agreement_period: '',
  extra_card: '',
  flow_rollover: '',
};

const OP_BG: Record<string, string> = {
  '中国广电': 'bg-emerald-500/10 text-emerald-400',
  '中国移动': 'bg-blue-500/10 text-blue-400',
  '中国电信': 'bg-orange-500/10 text-orange-400',
  '中国联通': 'bg-purple-500/10 text-purple-400',
};

export default function Manage() {
  const { state, addProduct, updateProduct, deleteProduct, resetData, importData, exportData } = useData();
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ ...EMPTY_PRODUCT });
  const [sortField, setSortField] = useState('operator');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = state.products
    .filter((p: any) => !search || p.product_name.toLowerCase().includes(search.toLowerCase()) || p.operator.includes(search))
    .sort((a: any, b: any) => {
      const va = a[sortField as keyof typeof a];
      const vb = b[sortField as keyof typeof b];
      const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : (va as number) - (vb as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleEdit = (p: any) => { setEditingProduct(p); setForm({ ...p }); setIsAdding(false); };
  const handleAdd = () => { setIsAdding(true); setEditingProduct(null); setForm({ ...EMPTY_PRODUCT }); };
  const handleSave = () => {
    if (!form.product_name?.trim()) return;
    if (editingProduct) { updateProduct(form as any); }
    else { addProduct(form as any); }
    setIsAdding(false); setEditingProduct(null);
  };
  const handleDelete = (id: string) => { if (confirm('确定要删除此产品吗？')) deleteProduct(id); };
  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `安青卡业_${new Date().toISOString().split('T')[0]}.json`; a.click();
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { const data = JSON.parse(ev.target?.result as string); if (Array.isArray(data) && data[0]?.product_name) { importData(data); alert(`导入 ${data.length} 条数据`); } }
      catch { alert('格式错误'); }
    }; reader.readAsText(file); e.target.value = '';
  };
  const handleReset = () => { if (confirm('确定重置为默认数据？')) resetData(); };

  const formFields = [
    { label: '运营商', key: 'operator', type: 'select', options: ['中国广电', '中国移动', '中国电信', '中国联通'] },
    { label: '产品名称', key: 'product_name', type: 'text' },
    { label: '套餐简介', key: 'package_intro', type: 'text' },
    { label: '月租(元)', key: 'monthly_rent', type: 'number' },
    { label: '总流量(G)', key: 'total_flow', type: 'number' },
    { label: '通用流量(G)', key: 'general_flow', type: 'number' },
    { label: '定向流量(G)', key: 'directed_flow', type: 'number' },
    { label: '通话分钟', key: 'minutes', type: 'number' },
    { label: '主标签', key: 'main_tag', type: 'text' },
    { label: '副标签', key: 'sub_tag', type: 'text' },
    { label: '适用地区', key: 'areas', type: 'textarea' },
    { label: '年龄限制', key: 'age_limit', type: 'text' },
    { label: '需身份证', key: 'need_idcard', type: 'select', options: ['否', '是'] },
    { label: '优惠期', key: 'discount_package', type: 'textarea' },
    { label: '协议期', key: 'agreement_period', type: 'text' },
    { label: '副卡', key: 'extra_card', type: 'text' },
    { label: '流量结转', key: 'flow_rollover', type: 'text' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">产品管理</h2>
        <p className="text-xs text-white/40 mt-1">CRUD操作、数据导入导出与重置</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-5">
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20">
            <Plus className="w-4 h-4" /> 添加产品
          </button>
          <button onClick={handleExport} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all bg-white/5 hover:bg-white/10 text-white/70 border border-purple-500/15">
            <Download className="w-4 h-4" /> 导出
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all bg-white/5 hover:bg-white/10 text-white/70 border border-purple-500/15">
            <Upload className="w-4 h-4" /> 导入
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15">
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="搜索产品..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 input-dark text-sm" />
        </div>
      </div>

      <p className="text-xs text-white/30 mb-3">共 {filteredProducts.length} 款产品</p>

      {/* Table */}
      <div className="table-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {[{k:'operator',l:'运营商'},{k:'product_name',l:'产品名称'},{k:'monthly_rent',l:'月租'},{k:'total_flow',l:'流量'},{k:'minutes',l:'通话'},{k:'areas',l:'地区'}].map(c => (
                <th key={c.k} onClick={() => handleSort(c.k)} className="px-4 py-3 text-left text-xs font-medium text-white/40 cursor-pointer hover:text-white/60 select-none whitespace-nowrap">{c.l} {sortField === c.k && (sortDir === 'asc' ? '↑' : '↓')}</th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${OP_BG[p.operator]}`}>{OPERATOR_SHORT[p.operator]}</span></td>
                <td className="px-4 py-3 font-medium text-white/90 whitespace-nowrap">{p.product_name}</td>
                <td className="px-4 py-3 text-white/60">{p.monthly_rent}元</td>
                <td className="px-4 py-3 text-white/60">{p.total_flow}G</td>
                <td className="px-4 py-3 text-white/60">{p.minutes}分钟</td>
                <td className="px-4 py-3 text-white/40 max-w-[200px] truncate">{p.areas}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div className="text-center py-12"><p className="text-white/30">没有找到符合条件的产品</p></div>}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4" onClick={() => { setIsAdding(false); setEditingProduct(null); }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative modal-dark w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-purple-500/10 flex items-center justify-between sticky top-0 rounded-t-2xl" style={{ background: 'rgba(20,18,45,0.98)' }}>
              <h3 className="font-bold text-white">{isAdding ? '添加产品' : '编辑产品'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-white/50" /></button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-white/50 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="w-full px-3 py-2 input-dark text-sm">
                      {field.options?.map(o => <option key={o} value={o} className="bg-[#0f0c29]">{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} rows={2} className="w-full px-3 py-2 input-dark text-sm resize-none" />
                  ) : (
                    <input type={field.type} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? Number(e.target.value) || 0 : e.target.value }))} className="w-full px-3 py-2 input-dark text-sm" />
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-purple-500/10 flex justify-end gap-2 sticky bottom-0 bg-[#14122d] rounded-b-2xl">
              <button onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="px-4 py-2 text-white/50 hover:bg-white/5 rounded-lg text-sm">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"><Save className="w-4 h-4" /> 保存</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
