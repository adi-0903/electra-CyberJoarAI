import React, { useState, useCallback, useMemo } from 'react';
import { Search, Zap, Radio, Users, Target, Clock, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { MetricCard, AIPanel } from '../ui/SharedUI';
import { CONSTITUENCIES } from '../../data/seedData';
import { getPartyColor, getPartyBg, getPowColor, getPowBg, round1 } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

export default function CommandCenter({ candidates, powMap, lastSync, liveEnabled }) {
  const [sortCol, setSortCol] = useState('pow');
  const [sortDir, setSortDir] = useState('desc');
  const [filter, setFilter] = useState('');
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });

  const avgConfidence = useMemo(() => {
    const vals = Object.values(powMap);
    return vals.length ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [powMap]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        c.constituency.toLowerCase().includes(q)
    );
  }, [candidates, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'name': av = a.name; bv = b.name; break;
        case 'party': av = a.party; bv = b.party; break;
        case 'constituency': av = a.constituency; bv = b.constituency; break;
        case 'pow': av = powMap[a.id] || 0; bv = powMap[b.id] || 0; break;
        case 'sentiment': av = a.scores.digitalSentiment; bv = b.scores.digitalSentiment; break;
        default: av = 0; bv = 0;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sortCol, sortDir, powMap]);

  const handleSort = useCallback((col) => {
    setSortCol((prev) => {
      if (prev === col) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); return col; }
      setSortDir('desc');
      return col;
    });
  }, []);

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <span className="trend-animate inline-flex text-emerald-400"><ArrowUpRight className="w-4 h-4" /></span>;
    if (trend === 'down') return <span className="trend-animate inline-flex text-red-400"><ArrowDownRight className="w-4 h-4" /></span>;
    return <span className="inline-flex text-amber-400"><ArrowRight className="w-4 h-4" /></span>;
  };

  const runAiBrief = useCallback(async () => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const context = JSON.stringify(
        candidates.map((c) => ({ name: c.name, party: c.party, constituency: c.constituency, pow: powMap[c.id], trend: c.trend }))
      );
      const prompt = `Analyze the current electoral landscape based on this data and provide a strategic 3-paragraph intelligence summary covering key dynamics, constituency-level observations, and overall forecast:\n\n${context}`;
      await callClaude(prompt, (chunk) => setAiState((s) => ({ ...s, response: chunk })));
      setAiState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, [candidates, powMap]);

  const SortHeader = ({ col, label }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
    >
      <span className="flex items-center gap-1">
        {label}
        {sortCol === col && <span className="text-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Electoral Intelligence Platform</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time predictive analytics & OSINT monitoring</p>
        </div>
        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 border transition-all duration-300 ${
          liveEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${liveEnabled ? 'bg-emerald-400 animate-pulse-dot' : 'bg-amber-400'}`} />
          <span className={`text-xs font-semibold tracking-wide ${liveEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
            {liveEnabled ? 'LIVE DATA' : 'STATIC MODE'}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Target} label="Constituencies" value={CONSTITUENCIES.length} sub="Monitored regions" accent="blue" />
        <MetricCard icon={Users} label="Active Candidates" value={candidates.length} sub="Across all regions" accent="emerald" />
        <MetricCard icon={Radio} label="Avg Confidence" value={`${avgConfidence}%`} sub="PoW probability mean" accent="amber" />
        <MetricCard icon={Clock} label="Last OSINT Sync" value={lastSync ? lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'} sub={lastSync ? lastSync.toLocaleDateString('en-IN') : 'Awaiting sync'} accent="violet" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter candidates..."
            className="w-full bg-slate-800/60 border border-slate-700/50 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={runAiBrief}
          disabled={aiState.loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20"
        >
          <Zap className="w-4 h-4" />
          {aiState.loading ? 'Analyzing...' : 'Run AI Brief'}
        </button>
      </div>

      {/* Table */}
      <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                <SortHeader col="name" label="Name" />
                <SortHeader col="party" label="Party" />
                <SortHeader col="constituency" label="Constituency" />
                <SortHeader col="pow" label="PoW %" />
                <SortHeader col="sentiment" label="Sentiment" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {sorted.map((c) => {
                const pow = powMap[c.id] || 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-700/20 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white">{c.name}</span>
                      {c.incumbent && (
                        <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-medium">INC.</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPartyBg(c.party)}`}>
                        {c.party}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c.constituency}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getPowBg(pow)}`}
                            style={{ width: `${Math.min(pow * 1.8, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: getPowColor(pow) }}>
                          {pow}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${c.scores.digitalSentiment}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{c.scores.digitalSentiment}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TrendIcon trend={c.trend} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Brief Panel */}
      <AIPanel
        title="ELECTRA Intelligence Brief"
        content={aiState.response}
        loading={aiState.loading}
        error={aiState.error}
        onRegenerate={runAiBrief}
      />
    </div>
  );
}
