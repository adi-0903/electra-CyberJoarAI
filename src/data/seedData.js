export const WEIGHTS = {
  incumbency: 0.15,
  partyStrength: 0.20,
  pastWork: 0.18,
  personalBase: 0.17,
  religiousCasteBase: 0.15,
  digitalSentiment: 0.15,
};

export const FACTOR_LABELS = {
  incumbency: 'Incumbency Advantage',
  partyStrength: 'Party Strength',
  pastWork: 'Past Work Record',
  personalBase: 'Personal Base',
  religiousCasteBase: 'Religious/Caste Base',
  digitalSentiment: 'Digital Sentiment',
};

export const PARTY_COLORS = {
  AAP: '#f59e0b',
  BJP: '#f97316',
  INC: '#3b82f6',
  SAD: '#22c55e',
  Independent: '#6b7280',
};

export const CONSTITUENCIES = ['Amritsar East', 'Ludhiana West', 'Jalandhar Central'];

export const SYSTEM_PROMPT =
  'You are ELECTRA, an AI electoral intelligence analyst for South Asian political campaigns. You analyze data with strategic precision, geopolitical awareness of Indian electoral dynamics, and caste/community sensitivity. Always respond in clean structured prose. Never use bullet points. Cite the data given to you.';

export const SEED_CANDIDATES = [
  {
    id: 1, name: 'Harpreet Singh Bedi', party: 'AAP', constituency: 'Amritsar East',
    incumbent: true, trend: 'up',
    scores: { incumbency: 45, partyStrength: 72, pastWork: 68, personalBase: 60, religiousCasteBase: 55, digitalSentiment: 70 },
    turnoutCoeff: 0.35, swingCoeff: 0.8,
  },
  {
    id: 2, name: 'Rajiv Sharma', party: 'BJP', constituency: 'Amritsar East',
    incumbent: false, trend: 'down',
    scores: { incumbency: 0, partyStrength: 78, pastWork: 52, personalBase: 58, religiousCasteBase: 62, digitalSentiment: 55 },
    turnoutCoeff: 0.25, swingCoeff: 1.2,
  },
  {
    id: 3, name: 'Gurpreet Kaur Mann', party: 'INC', constituency: 'Amritsar East',
    incumbent: false, trend: 'stable',
    scores: { incumbency: 0, partyStrength: 55, pastWork: 75, personalBase: 65, religiousCasteBase: 70, digitalSentiment: 48 },
    turnoutCoeff: 0.40, swingCoeff: 0.6,
  },
  {
    id: 4, name: 'Balwinder Dhaliwal', party: 'AAP', constituency: 'Ludhiana West',
    incumbent: true, trend: 'up',
    scores: { incumbency: 38, partyStrength: 68, pastWork: 72, personalBase: 55, religiousCasteBase: 60, digitalSentiment: 65 },
    turnoutCoeff: 0.30, swingCoeff: 0.9,
  },
  {
    id: 5, name: 'Sunita Verma', party: 'BJP', constituency: 'Ludhiana West',
    incumbent: false, trend: 'up',
    scores: { incumbency: 0, partyStrength: 74, pastWork: 60, personalBase: 70, religiousCasteBase: 45, digitalSentiment: 72 },
    turnoutCoeff: 0.28, swingCoeff: 1.1,
  },
  {
    id: 6, name: 'Amarjit Tiwari', party: 'INC', constituency: 'Ludhiana West',
    incumbent: false, trend: 'down',
    scores: { incumbency: 0, partyStrength: 42, pastWork: 80, personalBase: 68, religiousCasteBase: 52, digitalSentiment: 50 },
    turnoutCoeff: 0.45, swingCoeff: 0.5,
  },
  {
    id: 7, name: 'Paramjit Hundal', party: 'SAD', constituency: 'Jalandhar Central',
    incumbent: true, trend: 'stable',
    scores: { incumbency: 55, partyStrength: 60, pastWork: 48, personalBase: 72, religiousCasteBase: 78, digitalSentiment: 40 },
    turnoutCoeff: 0.32, swingCoeff: 0.7,
  },
  {
    id: 8, name: 'Neha Kapoor', party: 'AAP', constituency: 'Jalandhar Central',
    incumbent: false, trend: 'up',
    scores: { incumbency: 0, partyStrength: 70, pastWork: 65, personalBase: 62, religiousCasteBase: 50, digitalSentiment: 78 },
    turnoutCoeff: 0.22, swingCoeff: 1.3,
  },
  {
    id: 9, name: 'Vikram Anand', party: 'BJP', constituency: 'Jalandhar Central',
    incumbent: false, trend: 'down',
    scores: { incumbency: 0, partyStrength: 76, pastWork: 58, personalBase: 55, religiousCasteBase: 48, digitalSentiment: 60 },
    turnoutCoeff: 0.27, swingCoeff: 1.0,
  },
];

export const OSINT_ITEMS = [
  { id: 1, source: 'Twitter', candidate: 'Harpreet Singh Bedi', sentiment: 'Positive', excerpt: 'Massive public rally in Amritsar draws record crowds, party workers energized across all booths.' },
  { id: 2, source: 'Reddit', candidate: 'Rajiv Sharma', sentiment: 'Negative', excerpt: 'Local communities express deep disappointment over unfulfilled development promises from last visit.' },
  { id: 3, source: 'News', candidate: 'Gurpreet Kaur Mann', sentiment: 'Positive', excerpt: 'INC leader announces comprehensive education reform plan targeting Punjab youth unemployment crisis.' },
  { id: 4, source: 'Twitter', candidate: 'Balwinder Dhaliwal', sentiment: 'Neutral', excerpt: 'Incumbent candidate spotted at local gurdwara community event, reactions remain mixed online.' },
  { id: 5, source: 'News', candidate: 'Sunita Verma', sentiment: 'Positive', excerpt: 'BJP candidate launches major women empowerment initiative in Ludhiana West constituency.' },
  { id: 6, source: 'Reddit', candidate: 'Amarjit Tiwari', sentiment: 'Negative', excerpt: 'Questions raised about independent candidate funding sources, party affiliations, and past associations.' },
  { id: 7, source: 'Forums', candidate: 'Paramjit Hundal', sentiment: 'Positive', excerpt: 'Long-time constituency workers praise incumbent track record on roads and infrastructure delivery.' },
  { id: 8, source: 'Twitter', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'AAP candidate viral video on clean governance garners 2M+ views and massive engagement overnight.' },
  { id: 9, source: 'News', candidate: 'Vikram Anand', sentiment: 'Neutral', excerpt: 'BJP central leadership reportedly in talks with local leaders about major campaign strategy shift.' },
  { id: 10, source: 'Reddit', candidate: 'Harpreet Singh Bedi', sentiment: 'Negative', excerpt: 'Residents criticize painfully slow progress on long-promised water treatment plant in East ward.' },
  { id: 11, source: 'Forums', candidate: 'Sunita Verma', sentiment: 'Neutral', excerpt: 'Political analysts hotly debate BJP realistic chances in this traditionally non-BJP stronghold region.' },
  { id: 12, source: 'Twitter', candidate: 'Gurpreet Kaur Mann', sentiment: 'Negative', excerpt: 'Controversial speech excerpt goes viral on social media, INC quickly distances from specific remarks.' },
  { id: 13, source: 'News', candidate: 'Balwinder Dhaliwal', sentiment: 'Positive', excerpt: 'AAP incumbent inaugurates state-of-the-art community health center just weeks ahead of elections.' },
  { id: 14, source: 'Forums', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'Youth forums overwhelmingly support AAP candidate bold digital transparency and accountability pledge.' },
  { id: 15, source: 'Twitter', candidate: 'Paramjit Hundal', sentiment: 'Negative', excerpt: 'SAD party internal conflicts surface publicly as rival faction openly questions nomination decision.' },
];

export const RELATIVE_TIMES = [
  '2m ago', '5m ago', '8m ago', '11m ago', '14m ago',
  '17m ago', '22m ago', '28m ago', '35m ago', '42m ago',
  '1h ago', '1h ago', '2h ago', '3h ago', '4h ago',
];

export const PLATFORMS = ['Twitter', 'Reddit', 'News', 'Forums'];
