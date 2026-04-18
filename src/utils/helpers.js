import { WEIGHTS, PARTY_COLORS } from '../data/seedData';

export const computeRawPoW = (scores) =>
  Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + (scores[key] || 0) * weight, 0);

export const normalizePoW = (candidates) => {
  const grouped = {};
  candidates.forEach((c) => {
    if (!grouped[c.constituency]) grouped[c.constituency] = [];
    grouped[c.constituency].push(c);
  });

  const result = {};
  Object.values(grouped).forEach((cands) => {
    const rawScores = cands.map((c) => computeRawPoW(c.scores));
    const total = rawScores.reduce((a, b) => a + b, 0);
    cands.forEach((c, i) => {
      result[c.id] = total > 0 ? +((rawScores[i] / total) * 100).toFixed(1) : 0;
    });
  });
  return result;
};

export const computeAdjustedPoW = (candidates, turnout, swingSensitivity) => {
  const grouped = {};
  candidates.forEach((c) => {
    if (!grouped[c.constituency]) grouped[c.constituency] = [];
    grouped[c.constituency].push(c);
  });

  const result = {};
  Object.values(grouped).forEach((cands) => {
    const adjusted = cands.map((c) => {
      const base = computeRawPoW(c.scores);
      return Math.max(
        5,
        base + (turnout - 62) * (c.turnoutCoeff || 0.3) + (swingSensitivity - 5) * (c.swingCoeff || 0.8)
      );
    });
    const total = adjusted.reduce((a, b) => a + b, 0);
    cands.forEach((c, i) => {
      result[c.id] = total > 0 ? +((adjusted[i] / total) * 100).toFixed(1) : 0;
    });
  });
  return result;
};

export const getPartyColor = (party) => PARTY_COLORS[party] || '#6b7280';

export const getPartyBg = (party) => {
  const map = {
    AAP: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    BJP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    INC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SAD: 'bg-green-500/20 text-green-400 border-green-500/30',
    Independent: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return map[party] || map.Independent;
};

export const getQualLabel = (score) => {
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Moderate';
  if (score >= 35) return 'Weak';
  return 'Divided';
};

export const getScoreColor = (score) => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  if (score >= 35) return '#f97316';
  return '#ef4444';
};

export const getSentimentColor = (sentiment) => {
  if (sentiment === 'Positive') return '#22c55e';
  if (sentiment === 'Negative') return '#ef4444';
  return '#f59e0b';
};

export const getSentimentBg = (sentiment) => {
  if (sentiment === 'Positive') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (sentiment === 'Negative') return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
};

export const getSourceIcon = (source) => {
  const map = { Twitter: '𝕏', Reddit: '⊕', News: '📰', Forums: '💬' };
  return map[source] || '📡';
};

export const getInitials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const generateSparkline = (candidateId, basePow) => {
  const seed = candidateId * 7;
  return Array.from({ length: 6 }, (_, i) => ({
    week: `W${i + 1}`,
    pow: +(Math.max(15, Math.min(55, basePow + (((seed * (i + 1) * 13) % 17) - 8)))).toFixed(1),
  }));
};

export const getPowColor = (pow) => {
  if (pow > 55) return '#22c55e';
  if (pow >= 40) return '#f59e0b';
  return '#ef4444';
};

export const getPowBg = (pow) => {
  if (pow > 55) return 'bg-emerald-500';
  if (pow >= 40) return 'bg-amber-500';
  return 'bg-red-500';
};

export const round1 = (n) => +(+n).toFixed(1);
