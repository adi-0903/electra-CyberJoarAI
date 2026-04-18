import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AIPanel } from '../ui/SharedUI';
import { PLATFORMS } from '../../data/seedData';
import { generateLiveBatch } from '../../data/liveOsintData';
import { getSentimentBg, getSourceIcon, getPartyColor } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

const SENTIMENT_PIE_COLORS = { Positive: '#22c55e', Negative: '#ef4444', Neutral: '#f59e0b' };

export default function OSINTFeed({ candidates, liveEnabled }) {
  const [visibleItems, setVisibleItems] = useState(() => generateLiveBatch(7));
  const [allCollected, setAllCollected] = useState(() => generateLiveBatch(15));
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });
  const [liveIntelState, setLiveIntelState] = useState({ loading: false, error: null, items: [] });
  const [cycleCount, setCycleCount] = useState(0);

  // Auto-cycle feed every 8 seconds when live
  useEffect(() => {
    if (!liveEnabled) return;
    const interval = setInterval(() => {
      const batch = generateLiveBatch(7);
      setVisibleItems(batch);
      setAllCollected((prev) => {
        const merged = [...batch, ...prev];
        // Keep last 50 items max
        return merged.slice(0, 50);
      });
      setCycleCount((n) => n + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [liveEnabled]);

  const sentimentDist = useMemo(() => {
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    visibleItems.forEach((item) => { counts[item.sentiment] = (counts[item.sentiment] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [visibleItems]);

  // Heatmap: all candidates × all platforms using all collected items
  const heatmapData = useMemo(() => {
    return candidates.map((c) => ({
      name: c.name.split(' ').pop(),
      fullName: c.name,
      party: c.party,
      platforms: PLATFORMS.map((p) => {
        const items = allCollected.filter((f) => f.candidate === c.name && f.source === p);
        if (items.length === 0) return { platform: p, score: null, label: '—' };
        const score = items.reduce(
          (sum, i) => sum + (i.sentiment === 'Positive' ? 1 : i.sentiment === 'Negative' ? -1 : 0), 0
        ) / items.length;
        return {
          platform: p,
          score,
          label: score > 0.3 ? '+' : score < -0.3 ? '−' : '~',
        };
      }),
    }));
  }, [candidates, allCollected]);

  const getHeatColor = (score) => {
    if (score === null) return 'bg-slate-800/40 text-slate-600';
    if (score > 0.3) return 'bg-emerald-500/20 text-emerald-400';
    if (score < -0.3) return 'bg-red-500/20 text-red-400';
    return 'bg-amber-500/20 text-amber-400';
  };

  const manualRefresh = useCallback(() => {
    const batch = generateLiveBatch(7);
    setVisibleItems(batch);
    setAllCollected((prev) => [...batch, ...prev].slice(0, 50));
    setCycleCount((n) => n + 1);
  }, []);

  // Generate live intel items using Claude AI
  const generateLiveIntel = useCallback(async () => {
    setLiveIntelState({ loading: true, error: null, items: [] });
    try {
      const candidateNames = candidates.map((c) => `${c.name} (${c.party}, ${c.constituency})`).join(', ');
      const prompt = `Generate exactly 5 new realistic OSINT intelligence items about Punjab state elections. These candidates are in the race: ${candidateNames}. 

For each item return a JSON array with objects containing: source (Twitter/Reddit/News/Forums), candidate (full name from list), sentiment (Positive/Negative/Neutral), excerpt (one compelling sentence, 15-25 words).

Return ONLY the JSON array, no explanations. Make each item feel like a genuine intelligence intercept from today.`;
      const result = await callClaude(prompt);

      try {
        // Extract JSON array from response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const liveItems = parsed.map((item, i) => ({
            ...item,
            id: Date.now() + i + 1000,
            animKey: Date.now() + i + 1000,
            time: 'Just now',
            liveAt: new Date(),
          }));
          setLiveIntelState({ loading: false, error: null, items: liveItems });
          // Add to the visible feed and collected pool
          setVisibleItems((prev) => [...liveItems.slice(0, 3), ...prev].slice(0, 7));
          setAllCollected((prev) => [...liveItems, ...prev].slice(0, 50));
        } else {
          setLiveIntelState({ loading: false, error: 'Could not parse AI response as intel items.', items: [] });
        }
      } catch {
        setLiveIntelState({ loading: false, error: 'Failed to parse generated intel items.', items: [] });
      }
    } catch (err) {
      setLiveIntelState({ loading: false, error: err.message, items: [] });
    }
  }, [candidates]);

  const runSynthesis = useCallback(async () => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const feedSnapshot = visibleItems.map((i) => ({
        source: i.source, candidate: i.candidate, sentiment: i.sentiment, excerpt: i.excerpt,
      }));
      const prompt = `Synthesize this OSINT feed snapshot into a 150-word threat/opportunity assessment for campaign strategists. Identify emerging narratives, sentiment shifts, and actionable intelligence:\n\n${JSON.stringify(feedSnapshot)}`;
      await callClaude(prompt, (chunk) => setAiState((s) => ({ ...s, response: chunk })));
      setAiState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, [visibleItems]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">OSINT Sentiment Feed</h2>
          <p className="text-sm text-slate-400 mt-1">
            Live social intelligence monitoring • <span className="text-slate-500">{allCollected.length} items collected</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={manualRefresh}
            className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 px-3 py-1.5 rounded-lg transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 border ${
            liveEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${liveEnabled ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-500'}`} />
            <span className={`text-[10px] font-medium ${liveEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {liveEnabled ? `Auto-refresh 8s • Cycle #${cycleCount}` : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed Items */}
        <div className="lg:col-span-2 space-y-3">
          {visibleItems.map((item) => (
            <div
              key={item.animKey}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 animate-slide-in flex items-start gap-3 hover:bg-slate-800/60 transition-all duration-200"
            >
              <span className="text-xl shrink-0 mt-0.5">{getSourceIcon(item.source)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.source}</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                  <span className="text-slate-700">•</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSentimentBg(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  {item.time === 'Just now' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      AI GEN
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{item.excerpt}</p>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Mentions: <span className="text-slate-400 font-medium">{item.candidate}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Donut Chart */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sentiment Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sentimentDist}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentDist.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_PIE_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {sentimentDist.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_PIE_COLORS[s.name] }} />
                  <span className="text-[10px] text-slate-400">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Buttons */}
          <button
            onClick={generateLiveIntel}
            disabled={liveIntelState.loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-violet-600/20"
          >
            <Zap className="w-4 h-4" />
            {liveIntelState.loading ? 'Generating Intel...' : 'Generate Live Intel (AI)'}
          </button>

          <button
            onClick={runSynthesis}
            disabled={aiState.loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            <Zap className="w-4 h-4" />
            {aiState.loading ? 'Synthesizing...' : 'Synthesize OSINT with AI'}
          </button>

          {/* Live Intel Results */}
          {liveIntelState.loading && (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer rounded-md h-4" style={{ width: `${90 - i * 10}%` }} />
              ))}
            </div>
          )}
          {liveIntelState.error && (
            <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-3">
              <p className="text-xs text-red-400">{liveIntelState.error}</p>
              <button onClick={generateLiveIntel} className="text-[10px] text-red-300 mt-1 hover:underline">Retry</button>
            </div>
          )}
          {liveIntelState.items.length > 0 && !liveIntelState.loading && (
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-violet-400 uppercase mb-2">
                ✦ {liveIntelState.items.length} AI-generated items injected into feed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Heatmap */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          Sentiment Heatmap
          <span className="text-[10px] text-slate-500 font-normal ml-2 normal-case">
            (computed from {allCollected.length} collected items)
          </span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Candidate</th>
                {PLATFORMS.map((p) => (
                  <th key={p} className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {heatmapData.map((row) => (
                <tr key={row.fullName}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: getPartyColor(row.party) }} />
                      <span className="text-xs text-slate-300 font-medium">{row.name}</span>
                    </div>
                  </td>
                  {row.platforms.map((p) => (
                    <td key={p.platform} className="px-3 py-2 text-center">
                      <span className={`inline-block w-10 text-center text-xs font-bold py-1 rounded-md ${getHeatColor(p.score)}`}>
                        {p.label}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/30">
          <span className="text-[10px] text-slate-500">Legend:</span>
          <span className="text-[10px] text-emerald-400">+ Positive</span>
          <span className="text-[10px] text-red-400">− Negative</span>
          <span className="text-[10px] text-amber-400">~ Neutral</span>
          <span className="text-[10px] text-slate-600">— No Data</span>
        </div>
      </div>

      <AIPanel
        title="OSINT Threat/Opportunity Assessment"
        content={aiState.response}
        loading={aiState.loading}
        error={aiState.error}
        onRegenerate={runSynthesis}
      />
    </div>
  );
}
