import { ArrowLeft, Workflow, Plus, X, ChevronDown, Upload, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { trpc } from '@/providers/trpc';
import { useSyncedState } from '@/hooks/useSyncedState';

interface PositionTask {
  id: string;
  cardProduct: string;
  topicName: string;
  publishAccount: string;
  copywriter: string;
  copyStartTime: string;
  copyEndTime: string;
  videoProducer: string;
  videoStartTime: string;
  videoEndTime: string;
  publishTime: string;
}

const emptyTask = (): PositionTask => ({
  id: 'new_' + Date.now().toString() + '_' + Math.random().toString(36).slice(2, 6),
  cardProduct: '', topicName: '', publishAccount: '', copywriter: '',
  copyStartTime: '', copyEndTime: '', videoProducer: '', videoStartTime: '',
  videoEndTime: '', publishTime: '',
});

const mockTasks: PositionTask[] = [
  { id: '1', cardProduct: '电信星耀卡', topicName: '19元185G全国流量', publishAccount: '@流量卡测评君', copywriter: '张三', copyStartTime: '2026-05-19', copyEndTime: '2026-05-20', videoProducer: '李四', videoStartTime: '2026-05-20', videoEndTime: '2026-05-21', publishTime: '2026-05-22T20:00' },
  { id: '2', cardProduct: '移动潮玩卡', topicName: '39元200G超大流量', publishAccount: '@手机卡推荐', copywriter: '王五', copyStartTime: '2026-05-19', copyEndTime: '2026-05-21', videoProducer: '赵六', videoStartTime: '2026-05-21', videoEndTime: '2026-05-22', publishTime: '2026-05-23T18:00' },
  { id: '3', cardProduct: '联通天王卡', topicName: '29元220G通用流量', publishAccount: '@通信达人', copywriter: '张三', copyStartTime: '2026-05-18', copyEndTime: '2026-05-19', videoProducer: '李四', videoStartTime: '2026-05-19', videoEndTime: '2026-05-20', publishTime: '2026-05-21T19:00' },
];

const DEFAULT_HEADERS = ['本期卡品','选题名称','发布账号','文案撰写人员','文案开始时间','文案结束时间','视频制作人员','视频开始时间','视频结束时间','预计发布时间'];
const GRID_COLS = 'repeat(10, 1fr)';
const GAP = '8px';

const OPERATOR_CATEGORIES = [
  { key: '移动', label: '移动', color: '#10b981', match: '移动' },
  { key: '电信', label: '电信', color: '#3b82f6', match: '电信' },
  { key: '联通', label: '联通', color: '#f97316', match: '联通' },
  { key: '广电', label: '广电', color: '#8b5cf6', match: '广电' },
];

function stripOperatorPrefix(name: string): string {
  for (const cat of OPERATOR_CATEGORIES) {
    if (name.startsWith(cat.key)) return name.slice(cat.key.length);
  }
  return name;
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = '0px';
  el.style.height = el.scrollHeight + 'px';
}

// ===== Card Product Dropdown =====
const CardProductCell = memo(function CardProductCell({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const { state } = useData();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = '0px'; textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; } }, [value]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const groupMap = useMemo(() => {
    const result: Record<string, { full: string; suffix: string }[]> = {};
    OPERATOR_CATEGORIES.forEach(cat => { result[cat.key] = []; });
    state.products.forEach(p => {
      const cat = OPERATOR_CATEGORIES.find(c => p.operator.includes(c.match));
      if (cat) {
        const suffix = stripOperatorPrefix(p.product_name);
        if (!result[cat.key].some(x => x.suffix === suffix)) result[cat.key].push({ full: p.product_name, suffix });
      }
    });
    return result;
  }, [state.products]);

  const handleSelect = (suffix: string) => {
    const prefix = value ? value + '\n' : '';
    onChange(prefix + suffix);
  };

  const selectedLines = value ? value.split('\n').filter(l => l.trim()) : [];

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-stretch bg-white rounded" style={{ minHeight: 30 }}>
        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)} rows={1}
          className="flex-1 m-0 rounded-l border-0 outline-none resize-none overflow-hidden box-border self-center"
          style={{ fontSize: 12, padding: '6px 8px', lineHeight: '1.5', textAlign: 'left', background: 'transparent', color: value ? '#000' : '#999', minHeight: 30 }}
          placeholder={placeholder} />
        <button onClick={() => setOpen(!open)} className="px-1 flex items-center justify-center rounded-r hover:bg-black/5 transition-colors flex-shrink-0" style={{ minHeight: 30 }}>
          <ChevronDown className="w-3 h-3" style={{ color: '#999', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden shadow-xl"
          style={{ top: 'calc(100% + 4px)', background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 400, overflowY: 'auto' }}>
          {OPERATOR_CATEGORIES.map(cat => {
            const products = groupMap[cat.key] || [];
            return (
              <div key={cat.key}>
                <div className="px-3 py-1.5 flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.label}:</span>
                  <span className="text-[10px] text-white/30">{products.length}款</span>
                </div>
                {products.length === 0 ? <div className="px-3 py-1 text-[10px] text-white/20">暂无</div> : (
                  <div className="px-2 py-1 flex flex-wrap gap-1">
                    {products.map(({ full, suffix }) => {
                      const isSelected = selectedLines.includes(suffix);
                      return (
                        <button key={full} onClick={() => handleSelect(suffix)} disabled={isSelected}
                          className="px-2 py-1 rounded text-[11px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: isSelected ? `${cat.color}30` : 'rgba(255,255,255,0.05)', color: isSelected ? cat.color : 'rgba(255,255,255,0.6)', border: `1px solid ${isSelected ? cat.color + '60' : 'rgba(255,255,255,0.08)'}` }} title={full}>
                          {suffix}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// ===== Text Cell =====
const TextCell = memo(function TextCell({ value, onChange, placeholder, headerStyle }: {
  value: string; onChange: (v: string) => void; placeholder: string; headerStyle?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const initRef = useRef(false);
  useEffect(() => { if (!initRef.current && ref.current) { initRef.current = true; autoResize(ref.current); } }, []);
  return (
    <div className="flex items-stretch">
      <textarea ref={ref} value={value} onChange={e => { onChange(e.target.value); autoResize(ref.current); }} rows={1}
        className="w-full m-0 rounded border-0 outline-none resize-none overflow-hidden box-border self-center"
        style={{ fontFamily: headerStyle ? '"PingFang SC", "Microsoft YaHei", sans-serif' : 'inherit', fontWeight: headerStyle ? 700 : 400, fontSize: headerStyle ? 14 : 12, padding: '6px 8px', lineHeight: '1.5', textAlign: 'center', background: headerStyle ? 'rgba(167,139,250,0.06)' : '#fff', color: headerStyle ? '#a78bfa' : '#000', border: headerStyle ? '1px solid rgba(167,139,250,0.2)' : 'none', minHeight: headerStyle ? 40 : 30 }}
        placeholder={placeholder} />
    </div>
  );
});

const DateCell = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-stretch">
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      className="w-full m-0 rounded border-0 outline-none box-border bg-white text-black self-center"
      style={{ fontSize: 12, padding: '6px 8px', lineHeight: '1.5', textAlign: 'center', height: 30 }} />
  </div>
);

const DateTimeCell = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-stretch">
    <input type="datetime-local" value={value} onChange={e => onChange(e.target.value)}
      className="w-full m-0 rounded border-0 outline-none box-border bg-white text-black self-center"
      style={{ fontSize: 12, padding: '6px 8px', lineHeight: '1.5', textAlign: 'center', height: 30 }} />
  </div>
);

// ===== Main =====
export default function PositionProcess() {
  const { state } = useData();
  const utils = trpc.useUtils();

  const { data: tasks, setData: setTasks, syncing, backendAvailable } = useSyncedState<PositionTask[]>({
    localKey: 'aq_position_process_v2',
    defaultValue: mockTasks,
    rpcQuery: async () => {
      const items = await utils.client.task.list.query();
      return items.map((t: any) => ({
        id: String(t.id), cardProduct: t.cardProduct, topicName: t.topicName,
        publishAccount: t.publishAccount, copywriter: t.copywriter,
        copyStartTime: t.copyStartTime, copyEndTime: t.copyEndTime,
        videoProducer: t.videoProducer, videoStartTime: t.videoStartTime,
        videoEndTime: t.videoEndTime, publishTime: t.publishTime,
      }));
    },
    rpcMutate: async (value) => {
      const payload = value.map(t => ({
        cardProduct: t.cardProduct, topicName: t.topicName,
        publishAccount: t.publishAccount, copywriter: t.copywriter,
        copyStartTime: t.copyStartTime, copyEndTime: t.copyEndTime,
        videoProducer: t.videoProducer, videoStartTime: t.videoStartTime,
        videoEndTime: t.videoEndTime, publishTime: t.publishTime,
      }));
      await utils.client.task.bulkReplace.mutate(payload);
    },
  });

  const [headers, setHeaders] = useState<string[]>(DEFAULT_HEADERS);

  // Sync locked topics from TitleSelect
  useEffect(() => {
    const lockedTopics = state.lockedTopics;
    if (lockedTopics.length === 0) return;
    const existingNames = new Set(tasks.map(t => t.topicName));
    const newTasks = lockedTopics.filter(name => !existingNames.has(name)).map(name => ({ ...emptyTask(), topicName: name }));
    if (newTasks.length > 0) setTasks([...tasks, ...newTasks]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lockedTopics]);

  const addRow = () => setTasks(p => [...p, emptyTask()]);
  const removeRow = (id: string) => setTasks(p => p.filter(t => t.id !== id));
  const updateField = (id: string, field: keyof PositionTask, value: string) =>
    setTasks(p => p.map(t => t.id === id ? { ...t, [field]: value } : t));
  const updateHeader = (i: number, v: string) => setHeaders(p => p.map((h, idx) => idx === i ? v : h));

  const exportData = () => {
    const data = JSON.stringify({ tasks, headers, exportTime: new Date().toISOString(), version: '1.0' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `岗位进程_${new Date().toISOString().split('T')[0]}.json`;
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
        if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
        if (data.headers && Array.isArray(data.headers)) setHeaders(data.headers);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="max-w-[1920px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link to="/flow-match" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </Link>
          <div>
            <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', fontWeight: 700, color: '#a78bfa' }}>
              <Workflow className="w-5 h-5" />岗位进程
            </h2>
            <p className="text-xs text-white/40 mt-0.5">跟踪各岗位任务进度</p>
          </div>
          {syncing && <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin ml-4" title="正在同步..." />}
          {backendAvailable && !syncing && <span className="text-[10px] text-emerald-400 ml-4 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />云端同步中</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            <Upload className="w-4 h-4" />导入
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
          <button onClick={exportData} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8' }}>
            <Download className="w-4 h-4" />导出
          </button>
          <button onClick={addRow} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: '#a78bfa', color: '#fff' }}>
            <Plus className="w-4 h-4" />添加任务
          </button>
        </div>
      </div>

      <div className="rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: GAP }}>
          {headers.map((h, i) => (<TextCell key={'h'+i} value={h} onChange={(v) => updateHeader(i, v)} placeholder="" headerStyle />))}
        </div>
        <div style={{ height: 8 }} />
        {tasks.map(task => (
          <div key={task.id} className="relative group" style={{ marginBottom: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: GAP, alignItems: 'stretch' }}>
              <CardProductCell value={task.cardProduct} onChange={(v) => updateField(task.id, 'cardProduct', v)} placeholder={headers[0]} />
              <TextCell value={task.topicName} onChange={(v) => updateField(task.id, 'topicName', v)} placeholder={headers[1]} />
              <TextCell value={task.publishAccount} onChange={(v) => updateField(task.id, 'publishAccount', v)} placeholder={headers[2]} />
              <TextCell value={task.copywriter} onChange={(v) => updateField(task.id, 'copywriter', v)} placeholder={headers[3]} />
              <DateCell value={task.copyStartTime} onChange={(v) => updateField(task.id, 'copyStartTime', v)} />
              <DateCell value={task.copyEndTime} onChange={(v) => updateField(task.id, 'copyEndTime', v)} />
              <TextCell value={task.videoProducer} onChange={(v) => updateField(task.id, 'videoProducer', v)} placeholder={headers[6]} />
              <DateCell value={task.videoStartTime} onChange={(v) => updateField(task.id, 'videoStartTime', v)} />
              <DateCell value={task.videoEndTime} onChange={(v) => updateField(task.id, 'videoEndTime', v)} />
              <DateTimeCell value={task.publishTime} onChange={(v) => updateField(task.id, 'publishTime', v)} />
            </div>
            <button onClick={() => removeRow(task.id)}
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
              style={{ right: -32 }}>
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
