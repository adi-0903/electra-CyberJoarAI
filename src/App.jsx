import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Crosshair, Users, Target, TrendingUp, Radio, Database, Wifi, WifiOff } from 'lucide-react';
import { SEED_CANDIDATES, CONSTITUENCIES } from './data/seedData';
import { normalizePoW, computeRawPoW } from './utils/helpers';

import CommandCenter from './components/tabs/CommandCenter';
import CandidateProfiles from './components/tabs/CandidateProfiles';
import HeadToHead from './components/tabs/HeadToHead';
import ProbabilityForecaster from './components/tabs/ProbabilityForecaster';
import OSINTFeed from './components/tabs/OSINTFeed';
import DataIngestion from './components/tabs/DataIngestion';

const TABS = [
  { id: 'command', label: 'Command Center', icon: Crosshair },
  { id: 'profiles', label: 'Profiles', icon: Users },
  { id: 'matrix', label: 'Head-to-Head', icon: Target },
  { id: 'forecast', label: 'Forecaster', icon: TrendingUp },
  { id: 'osint', label: 'OSINT Feed', icon: Radio },
  { id: 'ingest', label: 'Data Ingestion', icon: Database },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [candidates, setCandidates] = useState(SEED_CANDIDATES);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [liveTickCount, setLiveTickCount] = useState(0);
  const tickRef = useRef(0);

  // Live data simulation: perturb scores every 12 seconds
  useEffect(() => {
    if (!liveEnabled) return;

    const interval = setInterval(() => {
      tickRef.current += 1;
      setLiveTickCount(tickRef.current);

      setCandidates((prev) =>
        prev.map((c) => {
          const newScores = { ...c.scores };
          const mutableKeys = ['partyStrength', 'pastWork', 'personalBase', 'religiousCasteBase', 'digitalSentiment'];

          // Perturb 1-3 random non-incumbency scores by ±1-2 points
          const numChanges = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numChanges; i++) {
            const key = mutableKeys[Math.floor(Math.random() * mutableKeys.length)];
            const delta = (Math.random() - 0.5) * 4;
            newScores[key] = Math.max(0, Math.min(100, Math.round(newScores[key] + delta)));
          }

          // Derive trend from score movement
          const oldRaw = computeRawPoW(c.scores);
          const newRaw = computeRawPoW(newScores);
          const trend = newRaw > oldRaw + 0.3 ? 'up' : newRaw < oldRaw - 0.3 ? 'down' : c.trend;

          return { ...c, scores: newScores, trend };
        })
      );

      setLastSync(new Date());
    }, 12000);

    return () => clearInterval(interval);
  }, [liveEnabled]);

  const powMap = useMemo(() => normalizePoW(candidates), [candidates]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const toggleLive = useCallback(() => {
    setLiveEnabled((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', fontSize: '13px' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-700/40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center h-14">
            {/* Brand */}
            <div className="flex items-center gap-3 mr-8 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Crosshair className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white tracking-tight leading-none">ELECTRA</p>
                <p className="text-[9px] text-slate-500 tracking-widest uppercase">Intelligence v2.0</p>
              </div>
            </div>

            {/* Tab Items */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side — live toggle + status */}
            <div className="ml-auto flex items-center gap-4 shrink-0">
              {/* Live Data Toggle */}
              <button
                onClick={toggleLive}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 border ${
                  liveEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                }`}
              >
                {liveEnabled ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    LIVE
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    PAUSED
                  </>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500">
                <span>{candidates.length} candidates</span>
                <span className="text-slate-700">|</span>
                <span>Tick #{liveTickCount}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'command' && (
            <CommandCenter candidates={candidates} powMap={powMap} lastSync={lastSync} liveEnabled={liveEnabled} />
          )}
          {activeTab === 'profiles' && (
            <CandidateProfiles candidates={candidates} powMap={powMap} />
          )}
          {activeTab === 'matrix' && (
            <HeadToHead candidates={candidates} powMap={powMap} />
          )}
          {activeTab === 'forecast' && (
            <ProbabilityForecaster candidates={candidates} powMap={powMap} />
          )}
          {activeTab === 'osint' && (
            <OSINTFeed candidates={candidates} liveEnabled={liveEnabled} />
          )}
          {activeTab === 'ingest' && (
            <DataIngestion candidates={candidates} setCandidates={setCandidates} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-4 mt-8">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
          <p className="text-[10px] text-slate-600">ELECTRA Electoral Intelligence Platform • Predictive Analytics Engine</p>
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span>Last sync: {lastSync.toLocaleTimeString('en-IN')}</span>
            <span>•</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
