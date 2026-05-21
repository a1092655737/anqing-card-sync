import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

const REFRESH_INTERVAL = 2 * 60 * 60 * 1000;

export default function AutoRefresh() {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastRefresh, setLastRefresh] = useState(() => {
    const saved = localStorage.getItem('last_refresh_time');
    return saved ? parseInt(saved) : Date.now();
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastRefresh;
      const remaining = Math.max(0, REFRESH_INTERVAL - elapsed);
      setCountdown(remaining);
      if (remaining <= 0) { doRefresh(); }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  const doRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      localStorage.removeItem('anqing_card_data');
      localStorage.removeItem('anqing_card_images');
      localStorage.setItem('last_refresh_time', Date.now().toString());
      window.location.reload();
    } catch { setIsRefreshing(false); }
  }, [isRefreshing]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Clock className="w-3 h-3 text-white/30" />
      <span className="text-white/30 tabular-nums">{formatTime(countdown)}</span>
      <button
        onClick={doRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/60 transition-all disabled:opacity-40"
        title="立即刷新数据"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
