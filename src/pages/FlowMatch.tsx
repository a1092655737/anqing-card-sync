import { Link } from 'react-router-dom';
import { FileSearch, Users, FolderOpen, BarChart3, ArrowRight, Upload, Download, RefreshCw, CheckCircle, Laptop, Cloud } from 'lucide-react';
import { useState } from 'react';

const modules = [
  {
    path: '/flow-match/title-select',
    title: '标题甄选',
    desc: '智能筛选和评估最优产品标题方案',
    icon: FileSearch,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
  {
    path: '/flow-match/position-process',
    title: '岗位进程',
    desc: '跟踪和管理各岗位工作进度状态',
    icon: Users,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    path: '/flow-match/topic-library',
    title: '选题库区',
    desc: '集中管理和分类存储选题资源',
    icon: FolderOpen,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    path: '/flow-match/review-summary',
    title: '复盘总结',
    desc: '数据分析与阶段性工作总结报告',
    icon: BarChart3,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
];

interface SyncData {
  titleSelect?: any[];
  positionProcess?: any[];
  exportTime: string;
  version: string;
}

export default function FlowMatch() {
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncType, setSyncType] = useState<'success' | 'error' | null>(null);

  const showMsg = (msg: string, type: 'success' | 'error') => {
    setSyncMsg(msg);
    setSyncType(type);
    setTimeout(() => { setSyncMsg(null); setSyncType(null); }, 4000);
  };

  const exportAll = () => {
    try {
      const titleData = localStorage.getItem('aq_title_select_v2');
      const taskData = localStorage.getItem('aq_position_process_v2');
      const payload: SyncData = {
        titleSelect: titleData ? JSON.parse(titleData) : undefined,
        positionProcess: taskData ? JSON.parse(taskData) : undefined,
        exportTime: new Date().toISOString(),
        version: '2.0',
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `安青卡业_全部数据_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMsg(`导出成功：标题甄选 ${payload.titleSelect?.length || 0} 条，岗位进程 ${payload.positionProcess?.length || 0} 条`, 'success');
    } catch (e) {
      showMsg('导出失败：' + (e as Error).message, 'error');
    }
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: SyncData = JSON.parse(reader.result as string);
        let count = 0;
        if (data.titleSelect && Array.isArray(data.titleSelect)) {
          localStorage.setItem('aq_title_select_v2', JSON.stringify(data.titleSelect));
          count += data.titleSelect.length;
        }
        if (data.positionProcess && Array.isArray(data.positionProcess)) {
          localStorage.setItem('aq_position_process_v2', JSON.stringify(data.positionProcess));
          count += data.positionProcess.length;
        }
        showMsg(`导入成功，共 ${count} 条数据。请刷新页面查看。`, 'success');
      } catch {
        showMsg('导入失败：文件格式错误', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">业务流程</h2>
        <p className="text-xs text-white/40 mt-1">四大核心业务板块，点击进入对应模块</p>
      </div>

      {/* Cloud Sync Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cloud className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-emerald-300 mb-1">云端自动同步已启用</h3>
            <p className="text-xs text-emerald-400/60 mb-3 leading-relaxed">
              标题甄选和岗位进程的数据会自动同步到云端数据库。在任何设备上登录网站即可看到最新数据。同时也支持手动导出/导入作为备份。
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> 导出全部数据
              </button>
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> 导入全部数据
                <input type="file" accept=".json" onChange={importAll} className="hidden" />
              </label>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 刷新页面
              </button>
            </div>
            {syncMsg && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs ${syncType === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {syncType === 'success' ? <CheckCircle className="w-3 h-3" /> : <Cloud className="w-3 h-3" />}
                {syncMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-2 gap-5">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.path}
              to={m.path}
              className={`group relative overflow-hidden rounded-2xl border ${m.borderColor} bg-gradient-to-br ${m.color} backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
              style={{ minHeight: '200px' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all" />
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${m.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed flex-1">{m.desc}</p>
                <div className="flex items-center gap-2 mt-4 text-white/40 group-hover:text-white/70 transition-colors">
                  <span className="text-xs font-medium">进入模块</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
