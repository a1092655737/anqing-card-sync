import { Link } from 'react-router-dom';
import { FileSearch, Users, FolderOpen, BarChart3, ArrowRight } from 'lucide-react';

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

export default function FlowMatch() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">业务流程</h2>
        <p className="text-xs text-white/40 mt-1">四大核心业务板块，点击进入对应模块</p>
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
              {/* Background decoration */}
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
