import { ArrowLeft, FileSearch, Plus, ChevronDown, ChevronRight, Edit3, Check, X, ThumbsUp, HelpCircle, Play, Square, MoreHorizontal, ArrowUp, ArrowDown, Lock, Unlock, Save, Image, Trash2, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { trpc } from '@/providers/trpc';

interface TitleItem {
  id: string;
  name: string;
  direction: string;
  reference: string;
  referenceImages: string[];
  directorSuggest: string;
  directorVote: 'agree' | 'pending';
  editorSuggest: string;
  editorVote: 'agree' | 'pending';
  operatorSuggest: string;
  operatorVote: 'agree' | 'pending';
  finalDecision: 'execute' | 'reject';
  rowHighlight: 'none' | 'green' | 'red';
  createdAt: string;
}

interface DateGroup {
  date: string;
  titles: TitleItem[];
}

const emptyItem = (date: string): TitleItem => ({
  id: 'new_' + Date.now().toString() + '_' + Math.random().toString(36).slice(2, 6),
  name: '', direction: '', reference: '', referenceImages: [],
  directorSuggest: '', directorVote: 'pending',
  editorSuggest: '', editorVote: 'pending',
  operatorSuggest: '', operatorVote: 'pending',
  finalDecision: 'execute', rowHighlight: 'none',
  createdAt: date,
});

const COLS = [
  { key: 'name', label: '选题名称', color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)' },
  { key: 'direction', label: '选题方向及思考', color: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)' },
  { key: 'reference', label: '参考样式', color: '#34d399', bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.2)' },
  { key: 'director', label: '编导建议', color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.2)' },
  { key: 'editor', label: '剪辑建议', color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' },
  { key: 'operator', label: '运营建议', color: '#22d3ee', bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.2)' },
  { key: 'decision', label: '最终决议', color: '#f472b6', bg: 'rgba(244,114,182,0.06)', border: 'rgba(244,114,182,0.2)' },
];

const VoteButton = ({ value, onChange, locked }: { value: 'agree' | 'pending'; onChange: (v: 'agree' | 'pending') => void; locked: boolean }) => (
  <div className={`flex gap-1 ${locked ? 'pointer-events-none opacity-40' : ''}`}>
    <button onClick={() => onChange('agree')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 border ${value === 'agree' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:text-emerald-600'}`}>
      <ThumbsUp className="w-3 h-3" /> 赞同
    </button>
    <button onClick={() => onChange('pending')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 border ${value === 'pending' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300 hover:text-amber-600'}`}>
      <HelpCircle className="w-3 h-3" /> 待定
    </button>
  </div>
);

const DecisionButton = ({ value, onChange, onDouble, locked }: { value: 'execute' | 'reject'; onChange: (v: 'execute' | 'reject') => void; onDouble: (v: 'execute' | 'reject') => void; locked: boolean }) => (
  <div className={`flex gap-1 ${locked ? 'pointer-events-none opacity-40' : ''}`}>
    <button onClick={() => onChange('execute')} onDoubleClick={() => onDouble('execute')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 border ${value === 'execute' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:text-emerald-600'}`}>
      <Play className="w-3 h-3" /> 执行
    </button>
    <button onClick={() => onChange('reject')} onDoubleClick={() => onDouble('reject')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 border ${value === 'reject' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600'}`}>
      <Square className="w-3 h-3" /> 不执行
    </button>
  </div>
);

// ===== Reference Cell: text + image upload =====
const ReferenceCell = ({ text, images, onTextChange, onImagesChange, locked }: {
  text: string; images: string[];
  onTextChange: (v: string) => void;
  onImagesChange: (imgs: string[]) => void;
  locked: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onImagesChange([...images, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className={`p-3 ${locked ? 'pointer-events-none opacity-40' : ''}`} style={{ background: COLS[2].bg }}>
      <textarea
        value={text}
        onChange={e => onTextChange(e.target.value)}
        rows={images.length > 0 ? 2 : 4}
        className="w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/40 placeholder-gray-400 leading-relaxed mb-2"
        placeholder="参考样式..."
      />
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/25 transition-all border border-emerald-500/10">
          <Image className="w-3 h-3" /> 上传图片
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
        {images.length > 0 && <span className="text-[10px] text-white/40">{images.length} 张图片</span>}
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group/img">
              <img src={img} alt={`参考 ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg border border-white/10 cursor-pointer hover:border-emerald-400/50 transition-colors" onClick={() => window.open(img, '_blank')} />
              <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                <Trash2 className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TitleSelect() {
  const { state, addLockedTopics, removeLockedTopics } = useData();
  const utils = trpc.useUtils();

  // tRPC queries & mutations
  const { data: serverTitles } = trpc.title.list.useQuery();
  const bulkReplace = trpc.title.bulkReplace.useMutation({
    onSuccess: () => utils.title.list.invalidate(),
  });

  // Local state
  const [titles, setTitles] = useState<TitleItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [dateEdits, setDateEdits] = useState<Record<string, string>>({});
  const [newForm, setNewForm] = useState({ name: '', direction: '', reference: '', directorSuggest: '', editorSuggest: '', operatorSuggest: '' });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [rowMenuOpen, setRowMenuOpen] = useState<string | null>(null);
  const [lockedDates, setLockedDates] = useState<Set<string>>(new Set());

  // Sync from server
  useEffect(() => {
    if (serverTitles && serverTitles.length > 0) {
      const mapped: TitleItem[] = serverTitles.map((t: any) => ({
        id: String(t.id),
        name: t.name,
        direction: t.direction,
        reference: t.reference,
        referenceImages: (t.referenceImages as string[]) || [],
        directorSuggest: t.directorSuggest,
        directorVote: t.directorVote as 'agree' | 'pending',
        editorSuggest: t.editorSuggest,
        editorVote: t.editorVote as 'agree' | 'pending',
        operatorSuggest: t.operatorSuggest,
        operatorVote: t.operatorVote as 'agree' | 'pending',
        finalDecision: t.finalDecision as 'execute' | 'reject',
        rowHighlight: t.rowHighlight as 'none' | 'green' | 'red',
        createdAt: t.createdAt,
      }));
      setTitles(mapped);
    }
  }, [serverTitles]);

  // Auto-save: sync local state to server (debounced)
  useEffect(() => {
    if (titles.length === 0) return;
    const timeout = setTimeout(() => {
      const payload = titles.map(t => ({
        name: t.name,
        direction: t.direction,
        reference: t.reference,
        referenceImages: t.referenceImages,
        directorSuggest: t.directorSuggest,
        directorVote: t.directorVote,
        editorSuggest: t.editorSuggest,
        editorVote: t.editorVote,
        operatorSuggest: t.operatorSuggest,
        operatorVote: t.operatorVote,
        finalDecision: t.finalDecision,
        rowHighlight: t.rowHighlight,
        createdAt: t.createdAt,
      }));
      bulkReplace.mutate(payload);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [titles]);

  const grouped: DateGroup[] = useMemo(() => {
    const map = new Map<string, TitleItem[]>();
    titles.forEach(t => { const list = map.get(t.createdAt) || []; list.push(t); map.set(t.createdAt, list); });
    return Array.from(map.entries()).map(([date, items]) => ({ date, titles: items })).sort((a, b) => b.date.localeCompare(a.date));
  }, [titles]);

  const toggleCollapse = (date: string) => {
    setCollapsedDates(prev => { const next = new Set(prev); if (next.has(date)) next.delete(date); else next.add(date); return next; });
  };
  const startEditDate = (date: string) => { setEditingDate(date); setDateEdits(prev => ({ ...prev, [date]: date })); };
  const saveEditDate = (oldDate: string) => { const newDate = dateEdits[oldDate]; if (newDate && newDate !== oldDate) setTitles(titles.map(t => t.createdAt === oldDate ? { ...t, createdAt: newDate } : t)); setEditingDate(null); };
  const cancelEditDate = () => setEditingDate(null);

  const toggleLock = (date: string) => {
    setLockedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
        const topicsToRemove = titles.filter(t => t.createdAt === date).map(t => t.name).filter(n => n.trim() !== '');
        if (topicsToRemove.length > 0) removeLockedTopics(topicsToRemove);
      } else {
        next.add(date);
        const topicsToAdd = titles.filter(t => t.createdAt === date).map(t => t.name).filter(n => n.trim() !== '');
        if (topicsToAdd.length > 0) addLockedTopics(topicsToAdd);
      }
      return next;
    });
  };

  const addTitle = () => {
    if (!newForm.name.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    setTitles([{ id: Date.now().toString(), name: newForm.name.trim(), direction: newForm.direction.trim(), reference: newForm.reference.trim(), referenceImages: [], directorSuggest: newForm.directorSuggest.trim(), directorVote: 'pending', editorSuggest: newForm.editorSuggest.trim(), editorVote: 'pending', operatorSuggest: newForm.operatorSuggest.trim(), operatorVote: 'pending', finalDecision: 'execute', rowHighlight: 'none', createdAt: today }, ...titles]);
    setNewForm({ name: '', direction: '', reference: '', directorSuggest: '', editorSuggest: '', operatorSuggest: '' });
    setShowAdd(false);
  };
  const updateField = (id: string, field: keyof TitleItem, value: string | string[]) => setTitles(titles.map(t => t.id === id ? { ...t, [field]: value } : t));
  const deleteTitle = (id: string) => setTitles(titles.filter(t => t.id !== id));

  const insertRow = (date: string, index: number, direction: 'above' | 'below') => {
    const item = emptyItem(date);
    let flatIdx = titles.findIndex(t => t.createdAt === date);
    if (flatIdx === -1) flatIdx = 0;
    flatIdx += direction === 'above' ? index : index + 1;
    const newTitles = [...titles];
    newTitles.splice(Math.min(flatIdx, newTitles.length), 0, item);
    setTitles(newTitles);
    setRowMenuOpen(null);
  };

  const handleDecisionDouble = (id: string, decision: 'execute' | 'reject') => {
    setTitles(titles.map(t => t.id === id ? { ...t, rowHighlight: decision === 'execute' ? 'green' as const : 'red' as const } : t));
  };

  const rowBg = (h: string) => {
    if (h === 'green') return { background: 'rgba(16,185,129,0.20)', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.35)' };
    if (h === 'red') return { background: 'rgba(239,68,68,0.20)', boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.35)' };
    return {};
  };

  const formInput = (label: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <div className="mb-3">
      <label className="text-[11px] text-white/50 mb-1.5 block font-medium">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTitle()} placeholder={placeholder} className="w-full bg-white text-gray-900 text-sm font-semibold px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400/40 placeholder-gray-400" />
    </div>
  );

  // Export data
  const exportData = () => {
    const data = JSON.stringify({ titles, exportTime: new Date().toISOString(), version: '1.0' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `标题甄选_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.titles && Array.isArray(data.titles)) setTitles(data.titles);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/flow-match" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-violet-400" />
            标题甄选
          </h2>
          <p className="text-xs text-white/40 mt-0.5">管理和评估产品推广标题</p>
        </div>
      </div>

      <div className="flex justify-end mb-4 gap-3">
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" /> 导入
          <input type="file" accept=".json" onChange={importData} className="hidden" />
        </label>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 text-sky-300 text-sm font-medium hover:bg-sky-500/30 transition-colors">
          <Download className="w-4 h-4" /> 导出
        </button>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors">
          <Plus className="w-4 h-4" /> 新增选题
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-5 mb-5">
          {formInput('选题名称', newForm.name, v => setNewForm({ ...newForm, name: v }), '输入选题名称...')}
          {formInput('选题方向及思考', newForm.direction, v => setNewForm({ ...newForm, direction: v }), '输入选题方向和思考...')}
          {formInput('参考样式', newForm.reference, v => setNewForm({ ...newForm, reference: v }), '输入参考样式...')}
          {formInput('编导建议', newForm.directorSuggest, v => setNewForm({ ...newForm, directorSuggest: v }), '输入编导建议...')}
          {formInput('剪辑建议', newForm.editorSuggest, v => setNewForm({ ...newForm, editorSuggest: v }), '输入剪辑建议...')}
          {formInput('运营建议', newForm.operatorSuggest, v => setNewForm({ ...newForm, operatorSuggest: v }), '输入运营建议...')}
          <button onClick={addTitle} className="w-full px-4 py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20">添加选题</button>
        </div>
      )}

      <div className="space-y-4">
        {grouped.map(group => {
          const isCollapsed = collapsedDates.has(group.date);
          const isEditing = editingDate === group.date;
          const isLocked = lockedDates.has(group.date);
          const executeCount = group.titles.filter(t => t.finalDecision === 'execute').length;
          const isMenuOpen = menuOpen === group.date;
          return (
            <div key={group.date} className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#13102b]/50 relative">
              <div className={`flex items-center justify-between px-5 py-3 border-b border-white/[0.06] ${isLocked ? 'bg-red-500/10' : 'bg-gradient-to-r from-white/[0.04] to-transparent'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleCollapse(group.date)} className="cursor-pointer w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                  </button>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={dateEdits[group.date] || group.date}
                        onChange={e => setDateEdits(prev => ({ ...prev, [group.date]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveEditDate(group.date); if (e.key === 'Escape') cancelEditDate(); }}
                        className="px-2 py-1 rounded bg-white text-gray-900 text-sm font-bold border border-gray-300 focus:border-violet-400 outline-none w-32" autoFocus />
                      <button onClick={() => saveEditDate(group.date)} className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/30"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
                      <button onClick={cancelEditDate} className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center hover:bg-red-500/30"><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{group.date}</span>
                      <button onClick={() => startEditDate(group.date)} className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center hover:bg-violet-500/30 transition-colors">
                        <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] text-white/25 px-2 py-0.5 rounded-full bg-white/5">{group.titles.length} 条</span>
                  {executeCount > 0 && <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">执行 {executeCount}</span>}
                  <button onClick={() => toggleLock(group.date)} className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isLocked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {isLocked ? '已锁定' : '锁定选题'}
                  </button>
                </div>
                <div className="relative">
                  <button onClick={() => setMenuOpen(isMenuOpen ? null : group.date)} className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center transition-all shadow-lg shadow-blue-500/30">
                    <MoreHorizontal className="w-4 h-4 text-white" />
                  </button>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl bg-[#1e1b4b] border border-white/10 shadow-2xl py-2">
                        <button onClick={() => { insertRow(group.date, 0, 'above'); setMenuOpen(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-white/70 hover:bg-white/5 transition-colors">
                          <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> 向上增加一行
                        </button>
                        <button onClick={() => { insertRow(group.date, group.titles.length - 1, 'below'); setMenuOpen(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs text-white/70 hover:bg-white/5 transition-colors">
                          <ArrowDown className="w-3.5 h-3.5 text-blue-400" /> 向下增加一行
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!isCollapsed && isLocked && (
                <div className="absolute left-0 right-0 bg-black/30 z-10 pointer-events-none rounded-b-2xl" style={{ top: '52px', bottom: 0 }} />
              )}

              {!isCollapsed && (
                <>
                <div className="grid grid-cols-7 gap-0 border-b border-white/[0.06]">
                  {COLS.map(c => (
                    <div key={c.key} className="px-3 py-2.5 text-center" style={{ background: c.bg, borderRight: `1px solid ${c.border}` }}>
                      <span className="text-[15px] font-black tracking-wide text-[#a78bfa]" style={{ fontFamily: "'NotoSansCJK-Bold', 'Noto Sans CJK SC', sans-serif" }}>{c.label}</span>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {group.titles.map((t, idx) => (
                    <div key={t.id} className={`grid grid-cols-7 gap-0 ${idx !== group.titles.length - 1 ? 'border-b border-white/[0.04]' : ''}`} style={rowBg(t.rowHighlight)}>
                      <div className="p-3" style={{ background: COLS[0].bg }}>
                        <textarea value={t.name} onChange={e => updateField(t.id, 'name', e.target.value)} rows={4} readOnly={isLocked}
                          className={`w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/40 placeholder-gray-400 leading-relaxed ${isLocked ? 'opacity-50' : ''}`} placeholder="选题名称..." />
                      </div>
                      <div className="p-3" style={{ background: COLS[1].bg }}>
                        <textarea value={t.direction} onChange={e => updateField(t.id, 'direction', e.target.value)} rows={4} readOnly={isLocked}
                          className={`w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/40 placeholder-gray-400 leading-relaxed ${isLocked ? 'opacity-50' : ''}`} placeholder="选题方向及思考..." />
                      </div>
                      <ReferenceCell
                        text={t.reference}
                        images={t.referenceImages}
                        onTextChange={v => updateField(t.id, 'reference', v)}
                        onImagesChange={imgs => updateField(t.id, 'referenceImages', imgs)}
                        locked={isLocked}
                      />
                      <div className="p-3" style={{ background: COLS[3].bg }}>
                        <textarea value={t.directorSuggest} onChange={e => updateField(t.id, 'directorSuggest', e.target.value)} rows={3} readOnly={isLocked}
                          className={`w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 placeholder-gray-400 leading-relaxed mb-2 ${isLocked ? 'opacity-50' : ''}`} placeholder="编导建议..." />
                        <VoteButton value={t.directorVote} onChange={v => updateField(t.id, 'directorVote', v)} locked={isLocked} />
                      </div>
                      <div className="p-3" style={{ background: COLS[4].bg }}>
                        <textarea value={t.editorSuggest} onChange={e => updateField(t.id, 'editorSuggest', e.target.value)} rows={3} readOnly={isLocked}
                          className={`w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/40 placeholder-gray-400 leading-relaxed mb-2 ${isLocked ? 'opacity-50' : ''}`} placeholder="剪辑建议..." />
                        <VoteButton value={t.editorVote} onChange={v => updateField(t.id, 'editorVote', v)} locked={isLocked} />
                      </div>
                      <div className="p-3" style={{ background: COLS[5].bg }}>
                        <textarea value={t.operatorSuggest} onChange={e => updateField(t.id, 'operatorSuggest', e.target.value)} rows={3} readOnly={isLocked}
                          className={`w-full bg-white text-gray-900 text-[13px] font-bold px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 placeholder-gray-400 leading-relaxed mb-2 ${isLocked ? 'opacity-50' : ''}`} placeholder="运营建议..." />
                        <VoteButton value={t.operatorVote} onChange={v => updateField(t.id, 'operatorVote', v)} locked={isLocked} />
                      </div>
                      <div className="p-3 flex flex-col justify-between relative" style={{ background: COLS[6].bg }}>
                        <div className="flex-1 flex flex-col justify-center items-center mb-2">
                          <DecisionButton value={t.finalDecision} onChange={v => updateField(t.id, 'finalDecision', v)} onDouble={(d) => handleDecisionDouble(t.id, d)} locked={isLocked} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setRowMenuOpen(rowMenuOpen === t.id ? null : t.id)}
                            className="flex-1 px-2 py-2 rounded-lg bg-blue-500/15 text-blue-400 text-[10px] font-medium hover:bg-blue-500/25 transition-all flex items-center justify-center gap-1 border border-blue-500/10 hover:border-blue-500/30">
                            <Plus className="w-3 h-3" /> 添加
                          </button>
                          <button onClick={() => deleteTitle(t.id)}
                            className="flex-1 px-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-medium hover:bg-red-500/25 transition-all flex items-center justify-center gap-1 border border-red-500/10 hover:border-red-500/30">
                            <X className="w-3 h-3" /> 删除
                          </button>
                        </div>
                        {rowMenuOpen === t.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setRowMenuOpen(null)} />
                            <div className="absolute right-3 bottom-14 z-50 min-w-[140px] rounded-xl bg-[#1e1b4b] border border-white/10 shadow-2xl py-2">
                              <button onClick={() => insertRow(group.date, idx, 'above')} className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] text-white/70 hover:bg-white/5 transition-colors">
                                <ArrowUp className="w-3 h-3 text-blue-400" /> 向上增加一行
                              </button>
                              <button onClick={() => insertRow(group.date, idx, 'below')} className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] text-white/70 hover:bg-white/5 transition-colors">
                                <ArrowDown className="w-3 h-3 text-blue-400" /> 向下增加一行
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
