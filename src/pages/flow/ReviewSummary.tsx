import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReviewData {
  id: string;
  title: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  conversion: number;
  trend: 'up' | 'down' | 'stable';
}

const mockData: ReviewData[] = [
  { id: '1', title: '电信星耀卡推广复盘', date: '2026-05-19', views: 4523, likes: 312, comments: 89, conversion: 4.2, trend: 'up' },
  { id: '2', title: '移动潮玩卡标题优化效果', date: '2026-05-18', views: 3891, likes: 245, comments: 67, conversion: 3.8, trend: 'up' },
  { id: '3', title: '联通天王卡素材测试总结', date: '2026-05-17', views: 2156, likes: 178, comments: 45, conversion: 2.9, trend: 'down' },
  { id: '4', title: '广电福兔卡推广数据分析', date: '2026-05-16', views: 5678, likes: 423, comments: 112, conversion: 5.1, trend: 'up' },
  { id: '5', title: '粤王卡周末推广复盘', date: '2026-05-15', views: 1876, likes: 134, comments: 38, conversion: 3.1, trend: 'stable' },
  { id: '6', title: '周度整体推广效果汇总', date: '2026-05-14', views: 14235, likes: 987, comments: 234, conversion: 4.5, trend: 'up' },
];

const totalViews = mockData.reduce((s, d) => s + d.views, 0);
const totalLikes = mockData.reduce((s, d) => s + d.likes, 0);
const totalComments = mockData.reduce((s, d) => s + d.comments, 0);
const avgConversion = (mockData.reduce((s, d) => s + d.conversion, 0) / mockData.length).toFixed(1);

export default function ReviewSummary() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/flow-match" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            复盘总结
          </h2>
          <p className="text-xs text-white/40 mt-0.5">数据分析与阶段性工作总结报告</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="stat-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <p className="text-[11px] text-white/40">总浏览量</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.5% 较上周</p>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="w-4 h-4 text-violet-400" />
            <p className="text-[11px] text-white/40">总点赞</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +8.3% 较上周</p>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <p className="text-[11px] text-white/40">总评论</p>
          </div>
          <p className="text-2xl font-bold text-white">{totalComments.toLocaleString()}</p>
          <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> -2.1% 较上周</p>
        </div>
        <div className="stat-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] text-white/40">平均转化率</p>
          </div>
          <p className="text-2xl font-bold text-white">{avgConversion}%</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +0.8% 较上周</p>
        </div>
      </div>

      {/* Conversion Trend */}
      <div className="card-glass p-4 mb-6">
        <h3 className="text-sm font-bold text-white/80 mb-4">转化率趋势</h3>
        <div className="flex items-end gap-3 h-32">
          {mockData.map((d, i) => {
            const barH = Math.min((d.conversion / 6) * 100, 100);
            const barColor = d.trend === 'up' ? 'bg-emerald-400' : d.trend === 'down' ? 'bg-red-400' : 'bg-amber-400';
            return (
              <div key={d.id} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-white/40">{d.conversion}%</span>
                <div className="w-full flex justify-center">
                  <div className="w-8 rounded-t-md transition-all" style={{ height: `${barH * 0.8}px`, background: barColor, opacity: 0.7 + i * 0.05 }} />
                </div>
                <span className="text-[9px] text-white/20">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail List */}
      <h3 className="text-sm font-bold text-white/80 mb-3">复盘记录</h3>
      <div className="space-y-3">
        {mockData.map(d => (
          <div key={d.id} className="card-glass p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${d.trend === 'up' ? 'bg-emerald-400' : d.trend === 'down' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="font-medium text-white/90">{d.title}</span>
              </div>
              <span className="text-xs text-white/30">{d.date}</span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[10px] text-white/30 mb-0.5">浏览量</p>
                <p className="text-sm font-semibold text-blue-400">{d.views.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 mb-0.5">点赞</p>
                <p className="text-sm font-semibold text-violet-400">{d.likes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 mb-0.5">评论</p>
                <p className="text-sm font-semibold text-amber-400">{d.comments}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 mb-0.5">转化率</p>
                <p className="text-sm font-semibold text-emerald-400">{d.conversion}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
