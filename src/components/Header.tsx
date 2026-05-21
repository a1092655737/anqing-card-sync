import { Link, useLocation } from 'react-router-dom';
import { Zap, Package } from 'lucide-react';
import { useData } from '@/context/DataContext';
import AutoRefresh from './AutoRefresh';

const navItems = [
  { path: '/', label: '数据中心' },
  { path: '/generator', label: '图片生成器' },
  { path: '/gallery', label: '图库展示' },
  { path: '/manage', label: '产品管理' },
];

export default function Header() {
  const location = useLocation();
  const { state } = useData();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">安青卡业</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-400 leading-tight">产品数据中心</p>
              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                <Package className="w-2.5 h-2.5" />
                上架中 {state.products.length} 款
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <AutoRefresh />
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  location.pathname === item.path
                    ? 'text-blue-700 bg-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  location.pathname === item.path
                    ? 'text-blue-700 bg-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label.slice(0, 2)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
