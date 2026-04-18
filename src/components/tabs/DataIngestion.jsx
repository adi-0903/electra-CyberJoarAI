import React, { useState, useCallback } from 'react';
import { Upload, Zap, Copy, CheckCircle2, AlertTriangle, Plus, FileJson } from 'lucide-react';
import { AIPanel, ErrorCard } from '../ui/SharedUI';
import { CONSTITUENCIES } from '../../data/seedData';
import { getPartyBg, getInitials, getPartyColor } from '../../utils/helpers';
import { callClaude } from '../../utils/api';

const REQUIRED_SCORE_KEYS = ['incumbency', 'partyStrength', 'pastWork', 'personalBase', 'religiousCasteBase', 'digitalSentiment'];

const EMPTY_FORM = {
  name: '', party: 'AAP', constituency: CONSTITUENCIES[0],
  incumbent: false,
  incumbency: '', partyStrength: '', pastWork: '', personalBase: '', religiousCasteBase: '', digitalSentiment: '',
};

export default function DataIngestion({ candidates, setCandidates }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { success, message, candidates }
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formMsg, setFormMsg] = useState(null);
  const [aiState, setAiState] = useState({ loading: false, error: null, response: '' });
  const [copied, setCopied] = useState(false);

  const validateAndParse = useCallback((jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        return { success: false, message: 'JSON must contain a non-empty "candidates" array.' };
      }
      const parsed = [];
      for (let i = 0; i < data.candidates.length; i++) {
        const c = data.candidates[i];
        if (!c.name || !c.party || !c.constituency || !c.scores) {
          return { success: false, message: `Candidate at index ${i} missing required fields (name, party, constituency, scores).` };
        }
        for (const key of REQUIRED_SCORE_KEYS) {
          if (typeof c.scores[key] !== 'number' || c.scores[key] < 0 || c.scores[key] > 100) {
            return { success: false, message: `Candidate "${c.name}": scores.${key} must be a number between 0-100.` };
          }
        }
        parsed.push({
          id: Date.now() + i + Math.random(),
          name: c.name,
          party: c.party,
          constituency: c.constituency,
          incumbent: c.incumbent || false,
          trend: 'stable',
          scores: {
            incumbency: c.scores.incumbency,
            partyStrength: c.scores.partyStrength,
            pastWork: c.scores.pastWork,
            personalBase: c.scores.personalBase,
            religiousCasteBase: c.scores.religiousCasteBase,
            digitalSentiment: c.scores.digitalSentiment,
          },
          turnoutCoeff: +(Math.random() * 0.3 + 0.2).toFixed(2),
          swingCoeff: +(Math.random() * 0.8 + 0.5).toFixed(2),
        });
      }
      return { success: true, message: `Successfully parsed ${parsed.length} candidate(s).`, candidates: parsed };
    } catch {
      return { success: false, message: 'Invalid JSON format. Please check the file contents.' };
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setUploadResult({ success: false, message: 'Only .json files are accepted.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = validateAndParse(ev.target.result);
      setUploadResult(result);
      if (result.success && result.candidates) {
        setCandidates((prev) => [...prev, ...result.candidates]);
      }
    };
    reader.readAsText(file);
  }, [validateAndParse, setCandidates]);

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const submitForm = useCallback(() => {
    if (!form.name.trim()) { setFormMsg({ type: 'error', text: 'Candidate name is required.' }); return; }
    for (const key of REQUIRED_SCORE_KEYS) {
      const v = Number(form[key]);
      if (isNaN(v) || v < 0 || v > 100) {
        setFormMsg({ type: 'error', text: `Score "${key}" must be a number between 0-100.` });
        return;
      }
    }
    const newCandidate = {
      id: Date.now() + Math.random(),
      name: form.name.trim(),
      party: form.party,
      constituency: form.constituency,
      incumbent: form.incumbent,
      trend: 'stable',
      scores: {
        incumbency: +form.incumbency,
        partyStrength: +form.partyStrength,
        pastWork: +form.pastWork,
        personalBase: +form.personalBase,
        religiousCasteBase: +form.religiousCasteBase,
        digitalSentiment: +form.digitalSentiment,
      },
      turnoutCoeff: +(Math.random() * 0.3 + 0.2).toFixed(2),
      swingCoeff: +(Math.random() * 0.8 + 0.5).toFixed(2),
    };
    setCandidates((prev) => [...prev, newCandidate]);
    setFormMsg({ type: 'success', text: `${form.name} added successfully.` });
    setForm({ ...EMPTY_FORM });
    setTimeout(() => setFormMsg(null), 3000);
  }, [form, setCandidates]);

  const generateSample = useCallback(async () => {
    setAiState({ loading: true, error: null, response: '' });
    try {
      const prompt = `Generate a valid JSON payload with exactly 3 fictional candidates from Ludhiana, Punjab. Use this exact schema:\n\n{ "candidates": [ { "name": "Full Name", "party": "AAP|BJP|INC|SAD|Independent", "constituency": "Ludhiana South", "incumbent": false, "scores": { "incumbency": 0-100, "partyStrength": 0-100, "pastWork": 0-100, "personalBase": 0-100, "religiousCasteBase": 0-100, "digitalSentiment": 0-100 } } ] }\n\nReturn ONLY the JSON object, no explanation. Make the names and data realistic for Ludhiana Punjab politics.`;
      const result = await callClaude(prompt);
      setAiState({ loading: false, error: null, response: result });
    } catch (err) {
      setAiState({ loading: false, error: err.message, response: '' });
    }
  }, []);

  const copyResponse = useCallback(() => {
    if (aiState.response) {
      navigator.clipboard.writeText(aiState.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [aiState.response]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Data Ingestion</h2>
        <p className="text-sm text-slate-400 mt-1">Upload candidate data or enter manually</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drag & Drop Zone */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">JSON Upload</h4>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/20 hover:border-slate-600'
            }`}
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? 'text-blue-400' : 'text-slate-600'}`} />
            <p className="text-sm text-slate-400">
              {dragActive ? 'Drop JSON file here...' : 'Drag & drop a .json file here'}
            </p>
            <p className="text-[10px] text-slate-600 mt-2">
              Schema: {'{ candidates: [{ name, party, constituency, scores: {...} }] }'}
            </p>
          </div>

          {uploadResult && (
            <div className={`rounded-xl p-4 border animate-fade-in ${
              uploadResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {uploadResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${uploadResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                  {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
                </span>
              </div>
              <p className={`text-xs ${uploadResult.success ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                {uploadResult.message}
              </p>
              {uploadResult.success && uploadResult.candidates && (
                <div className="mt-3 space-y-2">
                  {uploadResult.candidates.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: `${getPartyColor(c.party)}30` }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <span className="text-xs text-white">{c.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPartyBg(c.party)}`}>{c.party}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual Entry Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Manual Entry</h4>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Name *</label>
                <input
                  value={form.name} onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Party</label>
                <select
                  value={form.party} onChange={(e) => handleFormChange('party', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {['AAP', 'BJP', 'INC', 'SAD', 'Independent'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Constituency</label>
                <select
                  value={form.constituency} onChange={(e) => handleFormChange('constituency', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.incumbent}
                    onChange={(e) => handleFormChange('incumbent', e.target.checked)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-400">Incumbent</span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-700/30 pt-3">
              <p className="text-[10px] text-slate-500 uppercase mb-3">Scores (0-100)</p>
              <div className="grid grid-cols-3 gap-3">
                {REQUIRED_SCORE_KEYS.map((key) => (
                  <div key={key}>
                    <label className="text-[10px] text-slate-500 capitalize mb-1 block">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="number" min={0} max={100} value={form[key]}
                      onChange={(e) => handleFormChange(key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="0-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={submitForm}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" /> Add Candidate
              </button>
              {formMsg && (
                <span className={`text-xs animate-fade-in ${formMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formMsg.text}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Sample JSON */}
      <div className="border-t border-slate-700/30 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">AI-Generated Sample Data</h4>
          <button
            onClick={generateSample}
            disabled={aiState.loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            <Zap className="w-4 h-4" />
            {aiState.loading ? 'Generating...' : 'Generate Sample JSON'}
          </button>
        </div>

        {aiState.loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-shimmer rounded-md h-4" style={{ width: `${90 - i * 8}%` }} />
            ))}
          </div>
        )}
        {aiState.error && <ErrorCard message={aiState.error} onRetry={generateSample} />}
        {aiState.response && !aiState.loading && (
          <div className="animate-fade-in">
            <div className="relative">
              <pre className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 overflow-x-auto text-sm text-emerald-400 font-mono leading-relaxed">
                {aiState.response}
              </pre>
              <button
                onClick={copyResponse}
                className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-all border border-slate-700/50"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={generateSample}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
