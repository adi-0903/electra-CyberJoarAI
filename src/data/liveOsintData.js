// Extended pool of OSINT intelligence templates for live cycling
// Each call to generateLiveItems picks randomly from this pool
export const LIVE_OSINT_POOL = [
  { source: 'Twitter', candidate: 'Harpreet Singh Bedi', sentiment: 'Positive', excerpt: 'Massive public rally in Amritsar draws record crowds, party workers energized across all booths.' },
  { source: 'Twitter', candidate: 'Harpreet Singh Bedi', sentiment: 'Negative', excerpt: 'Viral thread criticizes AAP candidate slow response to waterlogging crisis in East ward areas.' },
  { source: 'Twitter', candidate: 'Harpreet Singh Bedi', sentiment: 'Neutral', excerpt: 'Political commentators analyze Bedi campaign strategy pivot towards rural outreach in recent weeks.' },
  { source: 'Reddit', candidate: 'Harpreet Singh Bedi', sentiment: 'Negative', excerpt: 'Residents criticize painfully slow progress on long-promised water treatment plant in East ward.' },
  { source: 'News', candidate: 'Harpreet Singh Bedi', sentiment: 'Positive', excerpt: 'AAP leader inaugurates smart classroom project benefiting 5,000 students in Amritsar East.' },
  { source: 'Forums', candidate: 'Harpreet Singh Bedi', sentiment: 'Positive', excerpt: 'Ground-level workers report strong door-to-door campaign momentum in key polling stations.' },

  { source: 'Reddit', candidate: 'Rajiv Sharma', sentiment: 'Negative', excerpt: 'Local communities express deep disappointment over unfulfilled development promises from last visit.' },
  { source: 'Twitter', candidate: 'Rajiv Sharma', sentiment: 'Positive', excerpt: 'BJP candidate announces comprehensive healthcare scheme targeting rural families in constituency.' },
  { source: 'News', candidate: 'Rajiv Sharma', sentiment: 'Neutral', excerpt: 'BJP high command reportedly reconsidering resource allocation for Amritsar East campaign.' },
  { source: 'Twitter', candidate: 'Rajiv Sharma', sentiment: 'Positive', excerpt: 'Star campaigner rally with Rajiv Sharma draws enthusiastic crowd, boosts party morale significantly.' },
  { source: 'Forums', candidate: 'Rajiv Sharma', sentiment: 'Negative', excerpt: 'Locals question BJP candidate awareness of ground-level infrastructure issues in the constituency.' },

  { source: 'News', candidate: 'Gurpreet Kaur Mann', sentiment: 'Positive', excerpt: 'INC leader announces comprehensive education reform plan targeting Punjab youth unemployment crisis.' },
  { source: 'Twitter', candidate: 'Gurpreet Kaur Mann', sentiment: 'Negative', excerpt: 'Controversial speech excerpt goes viral on social media, INC quickly distances from specific remarks.' },
  { source: 'Reddit', candidate: 'Gurpreet Kaur Mann', sentiment: 'Positive', excerpt: 'Women voter groups express strong support for INC candidate women-centric policy proposals.' },
  { source: 'Forums', candidate: 'Gurpreet Kaur Mann', sentiment: 'Neutral', excerpt: 'Analysts debate whether INC dynasty connections help or hinder candidate electability in constituency.' },
  { source: 'News', candidate: 'Gurpreet Kaur Mann', sentiment: 'Positive', excerpt: 'INC candidate pledges ₹500 crore special infrastructure package for Amritsar East development.' },

  { source: 'Twitter', candidate: 'Balwinder Dhaliwal', sentiment: 'Neutral', excerpt: 'Incumbent candidate spotted at local gurdwara community event, reactions remain mixed online.' },
  { source: 'News', candidate: 'Balwinder Dhaliwal', sentiment: 'Positive', excerpt: 'AAP incumbent inaugurates state-of-the-art community health center just weeks ahead of elections.' },
  { source: 'Twitter', candidate: 'Balwinder Dhaliwal', sentiment: 'Positive', excerpt: 'Dhaliwal campaign releases detailed 3-year progress report showing 78% promises fulfilled.' },
  { source: 'Reddit', candidate: 'Balwinder Dhaliwal', sentiment: 'Negative', excerpt: 'Anti-incumbency sentiment grows as voters cite unfulfilled promises on agricultural support.' },
  { source: 'Forums', candidate: 'Balwinder Dhaliwal', sentiment: 'Positive', excerpt: 'Local business owners credit incumbent policies for improved market conditions in Ludhiana West.' },
  { source: 'News', candidate: 'Balwinder Dhaliwal', sentiment: 'Negative', excerpt: 'Opposition parties allege misuse of constituency development funds, demand independent audit.' },

  { source: 'News', candidate: 'Sunita Verma', sentiment: 'Positive', excerpt: 'BJP candidate launches major women empowerment initiative in Ludhiana West constituency.' },
  { source: 'Forums', candidate: 'Sunita Verma', sentiment: 'Neutral', excerpt: 'Political analysts hotly debate BJP realistic chances in this traditionally non-BJP stronghold region.' },
  { source: 'Twitter', candidate: 'Sunita Verma', sentiment: 'Positive', excerpt: 'Sunita Verma digital campaign innovation praised by national media as model for future elections.' },
  { source: 'Reddit', candidate: 'Sunita Verma', sentiment: 'Positive', excerpt: 'Youth voters express fresh enthusiasm for BJP candidate modern approach to constituency issues.' },
  { source: 'News', candidate: 'Sunita Verma', sentiment: 'Neutral', excerpt: 'BJP central leadership reportedly considering Ludhiana West as a priority constituency for resource push.' },

  { source: 'Reddit', candidate: 'Amarjit Tiwari', sentiment: 'Negative', excerpt: 'Questions raised about independent candidate funding sources, party affiliations, and past associations.' },
  { source: 'Twitter', candidate: 'Amarjit Tiwari', sentiment: 'Positive', excerpt: 'Independent candidate grassroots movement gains traction in inner-city areas of Ludhiana West.' },
  { source: 'News', candidate: 'Amarjit Tiwari', sentiment: 'Neutral', excerpt: 'Electoral analysts consider potential spoiler effect of independent candidate on main party contests.' },
  { source: 'Forums', candidate: 'Amarjit Tiwari', sentiment: 'Positive', excerpt: 'Local union leaders endorse Tiwari candidacy citing strong labor rights track record.' },
  { source: 'Twitter', candidate: 'Amarjit Tiwari', sentiment: 'Negative', excerpt: 'Critics question Tiwari organizational capacity to convert grassroots support into polling booth results.' },

  { source: 'Forums', candidate: 'Paramjit Hundal', sentiment: 'Positive', excerpt: 'Long-time constituency workers praise incumbent track record on roads and infrastructure delivery.' },
  { source: 'Twitter', candidate: 'Paramjit Hundal', sentiment: 'Negative', excerpt: 'SAD party internal conflicts surface publicly as rival faction openly questions nomination decision.' },
  { source: 'News', candidate: 'Paramjit Hundal', sentiment: 'Positive', excerpt: 'SAD incumbent unveils comprehensive water management plan worth ₹200 crore for Jalandhar Central.' },
  { source: 'Reddit', candidate: 'Paramjit Hundal', sentiment: 'Neutral', excerpt: 'Voters weigh SAD party legacy against recent performance in deciding support for incumbent candidate.' },
  { source: 'Forums', candidate: 'Paramjit Hundal', sentiment: 'Negative', excerpt: 'Youth voters express frustration with incumbent lack of digital governance and transparency initiatives.' },

  { source: 'Twitter', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'AAP candidate viral video on clean governance garners 2M+ views and massive engagement overnight.' },
  { source: 'Forums', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'Youth forums overwhelmingly support AAP candidate bold digital transparency and accountability pledge.' },
  { source: 'News', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'National media profiles rising star Neha Kapoor as face of new-age Punjab politics transformation.' },
  { source: 'Twitter', candidate: 'Neha Kapoor', sentiment: 'Neutral', excerpt: 'Kapoor campaign deploys AI-driven voter outreach, sparking debate on technology role in elections.' },
  { source: 'Reddit', candidate: 'Neha Kapoor', sentiment: 'Negative', excerpt: 'Skeptics question AAP candidate administrative experience despite strong social media presence.' },
  { source: 'News', candidate: 'Neha Kapoor', sentiment: 'Positive', excerpt: 'AAP candidate secures endorsement from prominent Jalandhar business community leaders and industrialists.' },

  { source: 'News', candidate: 'Vikram Anand', sentiment: 'Neutral', excerpt: 'BJP central leadership reportedly in talks with local leaders about major campaign strategy shift.' },
  { source: 'Twitter', candidate: 'Vikram Anand', sentiment: 'Positive', excerpt: 'BJP candidate launches door-to-door voter connect program covering 50,000 households in constituency.' },
  { source: 'Reddit', candidate: 'Vikram Anand', sentiment: 'Negative', excerpt: 'Voters question BJP candidate connection to constituency issues as an outside political appointee.' },
  { source: 'Forums', candidate: 'Vikram Anand', sentiment: 'Positive', excerpt: 'Local BJP workers praise Anand organizational skills and systematic campaign booth strategy.' },
  { source: 'News', candidate: 'Vikram Anand', sentiment: 'Positive', excerpt: 'Vikram Anand announces tech startup incubation plan to create 10,000 jobs in Jalandhar Central.' },
  { source: 'Twitter', candidate: 'Vikram Anand', sentiment: 'Negative', excerpt: 'Rivals accuse BJP candidate of making unrealistic poll promises without clear implementation blueprint.' },
];

// Generate a randomized batch of live items with real timestamps
export function generateLiveBatch(count = 7) {
  const now = Date.now();
  const shuffled = [...LIVE_OSINT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((item, i) => ({
    ...item,
    id: now + i,
    animKey: now + i,
    time: formatRelativeTime(now - (Math.floor(Math.random() * 3600) + 60) * 1000),
    liveAt: new Date(now - (Math.floor(Math.random() * 3600) + 60) * 1000),
  }));
}

function formatRelativeTime(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
