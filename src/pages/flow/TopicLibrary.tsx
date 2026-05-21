import { ArrowLeft, FolderOpen, Plus, Search, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface Topic {
  id: string;
  title: string;
  category: string;
  tags: string[];
  usageCount: number;
  lastUsed: string;
}

const categories = ['全部', '流量卡', '套餐对比', '使用技巧', '优惠活动', '行业资讯'];

const mockTopics: Topic[] = [
  { id: '1', title: '2026年最值得办理的流量卡推荐', category: '流量卡', tags: ['电信', '移动', '联通'], usageCount: 156, lastUsed: '2026-05-18' },
  { id: '2', title: '19元套餐 vs 29元套餐，哪个更划算？', category: '套餐对比', tags: ['价格', '对比'], usageCount: 89, lastUsed: '2026-05-17' },
  { id: '3', title: '流量卡激活后如何查询剩余流量', category: '使用技巧', tags: ['教程', '查询'], usageCount: 234, lastUsed: '2026-05-19' },
  { id: '4', title: '学生党必看：月租低于30元的高性价比卡', category: '优惠活动', tags: ['学生', '低价'], usageCount: 178, lastUsed: '2026-05-16' },
  { id: '5', title: '5G网络下各运营商网速实测对比', category: '行业资讯', tags: ['5G', '测速'], usageCount: 67, lastUsed: '2026-05-15' },
  { id: '6', title: '物联卡与个人卡的区别详解', category: '使用技巧', tags: ['物联卡', '科普'], usageCount: 145, lastUsed: '2026-05-14' },
];

export default function TopicLibrary() {
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [filterCat, setFilterCat] = useState('全部');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState('流量卡');

  const filtered = topics.filter(t => {
    if (filterCat !== '全部' && t.category !== filterCat) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addTopic = () => {
    if (!newTopic.trim()) return;
    setTopics([{ id: Date.now().toString(), title: newTopic.trim(), category: newCategory, tags: [], usageCount: 0, lastUsed: new Date().toISOString().split('T')[0] }, ...topics]);
    setNewTopic('');
    setShowAdd(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/flow-match" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-400" />
            选题库区
          </h2>
          <p className="text-xs text-white/40 mt-0.5">管理和分类存储选题资源</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="stat-card p-4"><p className="text-[11px] text-white/40 mb-1">总选题</p><p className="text-2xl font-bold text-white">{topics.length}</p></div>
        <div className="stat-card p-4"><p className="text-[11px] text-emerald-400/70 mb-1">总使用</p><p className="text-2xl font-bold text-emerald-400">{topics.reduce((s, t) => s + t.usageCount, 0)}</p></div>
        <div className="stat-card p-4"><p className="text-[11px] text-blue-400/70 mb-1">分类数</p><p className="text-2xl font-bold text-blue-400">{categories.length - 1}</p></div>
        <div className="stat-card p-4"><p className="text-[11px] text-amber-400/70 mb-1">本周更新</p><p className="text-2xl font-bold text-amber-400">3</p></div>
      </div>

      {/* Toolbar */}
      <div className="card-glass p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input type="text" placeholder="搜索选题..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 input-dark text-xs" />
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors">
              <Plus className="w-3.5 h-3.5" /> 新增
            </button>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card-glass p-4 mb-4">
          <div className="flex gap-3">
            <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()} placeholder="输入选题标题..." className="flex-1 input-dark text-sm px-4 py-2" autoFocus />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="select-dark text-xs px-3 py-2">
              {categories.filter(c => c !== '全部').map(c => <option key={c} value={c} className="bg-[#0f0c29]">{c}</option>)}
            </select>
            <button onClick={addTopic} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">添加</button>
          </div>
        </div>
      )}

      {/* Topic List */}
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="card-glass p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white/90">{t.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">{t.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/30">
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3" />
                <div className="flex gap-1">
                  {t.tags.map((tag, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-white/40">{tag}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span>使用 <span className="text-white/60">{t.usageCount}</span> 次</span>
                <span>最近: {t.lastUsed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
