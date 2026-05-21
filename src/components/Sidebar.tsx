import { Link, useLocation } from 'react-router-dom';
import { Database, Image, Settings, FileText, GitBranch, Zap } from 'lucide-react';

const menuItems = [
  { path: '/', label: '卡品信息', icon: Database },
  { path: '/generator', label: '图片生成器', icon: Image },
  { path: '/doc-match', label: '文稿匹配', icon: FileText },
  { path: '/flow-match', label: '业务流程', icon: GitBranch },
  { path: '/manage', label: '产品管理', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 sidebar-dark fixed left-0 top-0 bottom-0 z-50 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-wide">安青卡业</h1>
            <p className="text-[10px] text-white/30 leading-tight mt-0.5">产品卡品信息</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
                isActive ? 'menu-item-active' : 'menu-item'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-white/30'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-white/20 text-center">安青卡业 v2.0</p>
      </div>
    </aside>
  );
}
