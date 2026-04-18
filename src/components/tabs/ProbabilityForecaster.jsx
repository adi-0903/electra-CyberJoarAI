import React, { useState, useCallback, useMemo } from 'react';
import { Zap, Save, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AIPanel } from '../ui/SharedUI';
import { CONSTITUENCIES } from '../../data/seedData';
import { computeAdjustedPoW, getPartyColor, round1 } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

export default function ProbabilityForecaster({ candidates, powMap }) {
  const [turnout, setTurnout] = useState(62);
  const [swing, setSwing] = useState(5);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });

  const adjustedPow = useMemo(
    () => computeAdjustedPoW(candidates, turnout, swing),
    [candidates, turnout, swing]
  );

  const chartData = useMemo(() => {
    return CONSTITUENCIES.map((constName) => {
      const cands = candidates.filter((c) => c.constituency === constName);
      const entry = { constituency: constName.split(' ').join('\n') };
      cands.forEach((c) => {
        entry[c.name.split(' ').pop()] = adjustedPow[c.id] || 0;
        entry[`${c.name.split(' ').pop()}_color`] = getPartyColor(c.party);
      });
      return entry;
    });
  }, [candidates, adjustedPow]);

  const allLastNames = useMemo(() => {
    const nameSet = new Set();
    candidates.forEach((c) => nameSet.add(c.name.split(' ').pop()));
    return [...nameSet];
  }, [candidates]);

  const candidateColorMap = useMemo(() => {
    const m = {};
    candidates.forEach((c) => { m[c.name.split(' ').pop()] = getPartyColor(c.party); });
    return m;
  }, [candidates]);

  const saveScenario = useCallback(() => {
    if (!scenarioName.trim() || scenarios.length >= 3) return;
    setScenarios((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: scenarioName.trim(),
        turnout,
        swing,
        data: { ...adjustedPow },
      },
    ]);
    setScenarioName('');
    setShowSaveInput(false);
  }, [scenarioName, turnout, swing, adjustedPow, scenarios.length]);

  const removeScenario = useCallback((id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const runForecast = useCallback(async () => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const forecastData = candidates.map((c) => ({
        name: c.name, party: c.party, constituency: c.constituency,
        basePow: powMap[c.id], adjustedPow: adjustedPow[c.id],
      }));
      const prompt = `With voter turnout at ${turnout}% and swing voter sensitivity at ${swing}/10, analyze these adjusted probability forecasts. Provide a probabilistic narrative covering likely outcomes per constituency and overall landscape shifts:\n\n${JSON.stringify(forecastData)}`;
      await callClaude(prompt, (chunk) => setAiState((s) => ({ ...s, response: chunk })));
      setAiState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, [candidates, powMap, adjustedPow, turnout, swing]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Probability Forecaster</h2>
        <p className="text-sm text-slate-400 mt-1">Dynamic scenario modeling with real-time recalculation</p>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Voter Turnout</label>
            <span className="text-lg font-bold text-blue-400">{turnout}%</span>
          </div>
          <input
            type="range" min={40} max={80} value={turnout}
            onChange={(e) => setTurnout(+e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>40%</span><span>60%</span><span>80%</span>
          </div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Swing Voter Sensitivity</label>
            <span className="text-lg font-bold text-amber-400">{swing}/10</span>
          </div>
          <input
            type="range" min={1} max={10} value={swing}
            onChange={(e) => setSwing(+e.target.value)}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-500">
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Adjusted PoW% by Constituency</h4>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="constituency" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 60]} unit="%" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            {allLastNames.map((ln) => (
              <Bar key={ln} dataKey={ln} fill={candidateColorMap[ln] || '#6b7280'} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {!showSaveInput ? (
          <button
            onClick={() => setShowSaveInput(true)}
            disabled={scenarios.length >= 3}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Save Scenario ({scenarios.length}/3)
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Scenario name..."
              className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && saveScenario()}
              autoFocus
            />
            <button onClick={saveScenario} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg transition-all">Save</button>
            <button onClick={() => setShowSaveInput(false)} className="text-slate-400 hover:text-white p-2"><X className="w-4 h-4" /></button>
          </div>
        )}
        <button
          onClick={runForecast}
          disabled={aiState.loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20"
        >
          <Zap className="w-4 h-4" />
          {aiState.loading ? 'Forecasting...' : 'Forecast with AI'}
        </button>
      </div>

      {/* Saved Scenarios Comparison */}
      {scenarios.length > 0 && (
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Scenario Comparison</h4>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
            {scenarios.map((sc) => (
              <div key={sc.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{sc.name}</span>
                  <button onClick={() => removeScenario(sc.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5 mb-3">
                  <p>Turnout: {sc.turnout}% | Swing: {sc.swing}/10</p>
                </div>
                <div className="space-y-1.5">
                  {candidates.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 truncate">{c.name.split(' ').pop()}</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(sc.data[c.id] || 0) * 1.8}%`, background: getPartyColor(c.party) }} />
                      </div>
                      <span className="text-[10px] text-slate-400 w-10 text-right">{round1(sc.data[c.id] || 0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AIPanel
        title="Probabilistic Forecast"
        content={aiState.response}
        loading={aiState.loading}
        error={aiState.error}
        onRegenerate={runForecast}
      />
    </div>
  );
}
