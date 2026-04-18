import React, { useState, useCallback, useMemo } from 'react';
import { Zap } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AIPanel, EmptyState } from '../ui/SharedUI';
import { CONSTITUENCIES, FACTOR_LABELS } from '../../data/seedData';
import { getPartyColor, getPartyBg, getScoreColor, getQualLabel } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

export default function HeadToHead({ candidates, powMap }) {
  const [selectedConst, setSelectedConst] = useState('');
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });

  const constCandidates = useMemo(
    () => (selectedConst ? candidates.filter((c) => c.constituency === selectedConst) : []),
    [candidates, selectedConst]
  );

  const radarData = useMemo(() => {
    if (constCandidates.length === 0) return [];
    return Object.entries(FACTOR_LABELS).map(([key, label]) => {
      const entry = { factor: label.split(' ').slice(0, 2).join(' ') };
      constCandidates.forEach((c) => { entry[c.name.split(' ').pop()] = c.scores[key] || 0; });
      return entry;
    });
  }, [constCandidates]);

  const factors = Object.entries(FACTOR_LABELS);

  const runVerdict = useCallback(async () => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const matrixData = constCandidates.map((c) => ({
        name: c.name, party: c.party, pow: powMap[c.id], scores: c.scores, incumbent: c.incumbent,
      }));
      const prompt = `Analyze this head-to-head comparison matrix for ${selectedConst} constituency. Provide a 3-paragraph analysis covering factor-by-factor comparison, strategic dynamics, and predict a winner with a confidence percentage:\n\n${JSON.stringify(matrixData)}`;
      await callClaude(prompt, (chunk) => setAiState((s) => ({ ...s, response: chunk })));
      setAiState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, [constCandidates, selectedConst, powMap]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Head-to-Head Matrix</h2>
          <p className="text-sm text-slate-400 mt-1">Factor-by-factor candidate comparison</p>
        </div>
        <select
          value={selectedConst}
          onChange={(e) => { setSelectedConst(e.target.value); setAiState({ loading: false, error: null, response: '' }); }}
          className="bg-slate-800/60 border border-slate-700/50 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer"
        >
          <option value="">Select Constituency...</option>
          {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!selectedConst && <EmptyState message="Select a constituency to view head-to-head comparison" />}

      {selectedConst && constCandidates.length > 0 && (
        <>
          {/* Candidate Headers */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${constCandidates.length}, 1fr)` }}>
            <div />
            {constCandidates.map((c) => (
              <div key={c.id} className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-white">{c.name}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getPartyBg(c.party)}`}>
                  {c.party}
                </span>
                <p className="text-lg font-bold mt-2" style={{ color: getPartyColor(c.party) }}>{powMap[c.id]}%</p>
                <p className="text-[10px] text-slate-500">PoW Score</p>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="border border-slate-700/40 rounded-xl overflow-hidden">
            {factors.map(([key, label], fi) => {
              const scores = constCandidates.map((c) => c.scores[key] || 0);
              const maxScore = Math.max(...scores);
              return (
                <div
                  key={key}
                  className={`grid items-center gap-4 px-4 py-3 ${fi % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'}`}
                  style={{ gridTemplateColumns: `200px repeat(${constCandidates.length}, 1fr)` }}
                >
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                  {constCandidates.map((c, ci) => {
                    const val = scores[ci];
                    const isMax = val === maxScore && val > 0;
                    return (
                      <div
                        key={c.id}
                        className={`rounded-lg p-3 transition-all duration-200 ${isMax ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/30 border border-transparent'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${val}%`, background: getScoreColor(val) }}
                            />
                          </div>
                          <span className="text-sm font-bold text-white w-8 text-right">{val}</span>
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: getScoreColor(val) }}>{getQualLabel(val)}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Radar Chart */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/40 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Multi-Candidate Radar Overlay</h4>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                {constCandidates.map((c) => (
                  <Radar
                    key={c.id}
                    name={c.name.split(' ').pop()}
                    dataKey={c.name.split(' ').pop()}
                    stroke={getPartyColor(c.party)}
                    fill={getPartyColor(c.party)}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Verdict */}
          <button
            onClick={runVerdict}
            disabled={aiState.loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20"
          >
            <Zap className="w-4 h-4" />
            {aiState.loading ? 'Generating Verdict...' : 'Generate AI Verdict'}
          </button>

          <AIPanel
            title="Head-to-Head Verdict"
            content={aiState.response}
            loading={aiState.loading}
            error={aiState.error}
            onRegenerate={runVerdict}
          />
        </>
      )}
    </div>
  );
}
