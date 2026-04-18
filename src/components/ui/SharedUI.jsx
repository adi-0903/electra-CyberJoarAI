import React from 'react';
import { AlertTriangle, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

export function Skeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton-shimmer rounded-md h-4"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function ErrorCard({ message, onRetry }) {
  return (
    <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-300 font-medium">Request Failed</p>
        <p className="text-xs text-red-400/80 mt-1 break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function AIPanel({ content, loading, error, onRegenerate, onCopy, title = 'AI Analysis' }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  if (!loading && !error && !content) return null;

  return (
    <div className="mt-4 border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-700/30 border-b border-slate-700/50">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-dot" />
          {title}
        </span>
        {content && !loading && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRegenerate}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-600/50 transition-all duration-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
            <button
              onClick={onCopy || handleCopy}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-600/50 transition-all duration-200 flex items-center gap-1"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        {loading && <Skeleton lines={5} />}
        {error && <ErrorCard message={error} onRetry={onRegenerate} />}
        {content && !loading && !error && (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap animate-fade-in">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, sub, accent = 'blue' }) {
  const accents = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
  };
  const iconAccents = {
    blue: 'text-blue-400 bg-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
    violet: 'text-violet-400 bg-violet-500/20',
  };

  return (
    <div
      className={`bg-gradient-to-br ${accents[accent]} border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconAccents[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export function EmptyState({ message = 'No data available', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      {Icon && <Icon className="w-10 h-10 mb-3 opacity-40" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}
