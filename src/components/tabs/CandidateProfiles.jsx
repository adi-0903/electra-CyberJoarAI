import React, { useState, useCallback, useMemo } from 'react';
import { Search, Zap, X, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AIPanel } from '../ui/SharedUI';
import { FACTOR_LABELS } from '../../data/seedData';
import { getPartyColor, getPartyBg, getInitials, generateSparkline, getScoreColor, getQualLabel } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

export default function CandidateProfiles({ candidates, powMap }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.party.toLowerCase().includes(q) || c.constituency.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const generateDossier = useCallback(async (candidate) => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const context = JSON.stringify({
        name: candidate.name, party: candidate.party, constituency: candidate.constituency,
        incumbent: candidate.incumbent, pow: powMap[candidate.id], scores: candidate.scores,
      });
      const prompt = `Generate a 200-word intelligence dossier for this candidate. Cover their political positioning, strengths, vulnerabilities, and strategic significance in their constituency:\n\n${context}`;
      await callClaude(prompt, (chunk) => setAiState((s) => ({ ...s, response: chunk })));
      setAiState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, [powMap]);

  const closeDrawer = useCallback(() => {
    setSelected(null);
    setAiState({ loading: false, error: null, response: '' });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Candidate Profiles</h2>
          <p className="text-sm text-slate-400 mt-1">Comprehensive intelligence on all monitored candidates</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full bg-slate-800/60 border border-slate-700/50 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const pow = powMap[c.id] || 0;
          const partyColor = getPartyColor(c.party);
          return (
            <div
              key={c.id}
              onClick={() => { setSelected(c); setAiState({ loading: false, error: null, response: '' }); }}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl p-5 cursor-pointer hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200 hover:shadow-lg group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: `${partyColor}30`, border: `1px solid ${partyColor}50` }}
                >
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPartyBg(c.party)}`}>
                      {c.party}
                    </span>
                    {c.incumbent && (
                      <span className="flex items-center gap-1 text-[10px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full">
                        <Shield className="w-2.5 h-2.5" /> Incumbent
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{c.constituency}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold" style={{ color: getPartyColor(c.party) }}>{pow}%</p>
                  <p className="text-[10px] text-slate-500">PoW</p>
                </div>
              </div>

              {/* Mini Score Bars */}
              <div className="mt-4 space-y-1.5">
                {Object.entries(c.scores).slice(0, 5).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-12 truncate">{key.slice(0, 6)}</span>
                    <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${val}%`, background: partyColor }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Profile Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 pb-8 overflow-y-auto" onClick={closeDrawer}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: `${getPartyColor(selected.party)}30`, border: `2px solid ${getPartyColor(selected.party)}60` }}
                >
                  {getInitials(selected.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPartyBg(selected.party)}`}>
                      {selected.party}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{selected.constituency}</span>
                    {selected.incumbent && (
                      <>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-violet-400">Incumbent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Factor Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Weighted Factor Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                    const val = selected.scores[key] || 0;
                    return (
                      <div key={key} className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-40 shrink-0">{label}</span>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${val}%`, background: getScoreColor(val) }}
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 w-28">
                          <span className="text-sm font-bold text-white w-8 text-right">{val}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: getScoreColor(val), background: `${getScoreColor(val)}20` }}>
                            {getQualLabel(val)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sparkline */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">6-Week PoW% Trajectory</h4>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={generateSparkline(selected.id, powMap[selected.id] || 30)}>
                      <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Line
                        type="monotone" dataKey="pow" stroke={getPartyColor(selected.party)}
                        strokeWidth={2} dot={{ r: 3, fill: getPartyColor(selected.party) }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Dossier Button */}
              <button
                onClick={() => generateDossier(selected)}
                disabled={aiState.loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20"
              >
                <Zap className="w-4 h-4" />
                {aiState.loading ? 'Generating Dossier...' : 'Generate AI Dossier'}
              </button>

              <AIPanel
                title="Intelligence Dossier"
                content={aiState.response}
                loading={aiState.loading}
                error={aiState.error}
                onRegenerate={() => generateDossier(selected)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
