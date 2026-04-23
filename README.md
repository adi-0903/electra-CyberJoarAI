# ELECTRA - Electoral Intelligence Platform

<div align="center">

**Predictive Electoral Analytics Intelligence Platform**

Real-time political intelligence and forecasting for South Asian electoral dynamics

[React](https://react.dev/) · [Vite](https://vitejs.dev/) · [TailwindCSS](https://tailwindcss.com/) · [Recharts](https://recharts.org/)

</div>

---

## 🎯 Overview

ELECTRA (Electoral Intelligence Computational Tactical Research Analytics) is a sophisticated web application designed for political campaign analysis and election forecasting. It provides real-time intelligence on candidate performance, sentiment analysis from social media, and predictive modeling based on multiple electoral factors.

The platform is specifically designed with awareness of Indian electoral dynamics, including caste/community sensitivities, regional party variations, and digital sentiment trends.

---

## ✨ Key Features

### 📊 Power of Winning (PoW) Scoring System
ELECTRA uses a proprietary weighted scoring algorithm to evaluate candidate electability across six critical factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Incumbency Advantage | 15% | Current office holder advantage |
| Party Strength | 20% | Regional party popularity and organization |
| Past Work Record | 18% | Historical performance and development work |
| Personal Base | 17% | Individual voter support and influence |
| Religious/Caste Base | 15% | Community and demographic alignment |
| Digital Sentiment | 15% | Social media and online presence |

### 🖥️ Six Integrated Modules

1. **Command Center** - Main dashboard with real-time candidate rankings and PoW scores
2. **Candidate Profiles** - Detailed candidate information with score breakdowns and trend analysis
3. **Head-to-Head** - Comparative matrix for direct candidate matchups across constituencies
4. **Probability Forecaster** - Advanced predictions with turnout and swing sensitivity adjustments
5. **OSINT Feed** - Open Source Intelligence aggregation from Twitter, Reddit, News, and Forums
6. **Data Ingestion** - Complete CRUD operations for candidate data management

### ⚡ Real-Time Simulation
- Live data simulation that perturbs scores every 12 seconds
- Dynamic trend tracking (up/down/stable)
- Toggle live/paused data updates
- Tick counter for simulation cycles
- Last sync timestamp tracking

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.4
- **Language**: TypeScript 6.0.2
- **Styling**: TailwindCSS 4.2.2
- **Data Visualization**: Recharts 3.8.1
- **Icons**: Lucide React 1.8.0

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/adi-0903/electra-CyberJoarAI.git
cd electra-CyberJoarAI
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

---

## 🚀 Usage

### Starting the Application
Run `npm run dev` to start the development server. The application will be available at `http://localhost:5173`.

### Navigation
Use the top navigation bar to switch between the six main modules:
- **Command Center**: View overall candidate rankings
- **Profiles**: Detailed candidate analysis
- **Head-to-Head**: Compare candidates directly
- **Forecaster**: Adjust parameters for predictions
- **OSINT Feed**: Monitor sentiment from social sources
- **Data Ingestion**: Add, edit, or remove candidates

### Live Data Toggle
Click the **LIVE/PAUSED** button in the top-right corner to:
- **LIVE**: Enable real-time score simulation (updates every 12 seconds)
- **PAUSED**: Freeze current scores for static analysis

---

## 📁 Project Structure

```
electra-CyberJoarAI/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── tabs/          # Main feature components
│   │   │   ├── CommandCenter.jsx
│   │   │   ├── CandidateProfiles.jsx
│   │   │   ├── HeadToHead.jsx
│   │   │   ├── ProbabilityForecaster.jsx
│   │   │   ├── OSINTFeed.jsx
│   │   │   └── DataIngestion.jsx
│   │   └── ui/            # Reusable UI components
│   ├── data/              # Seed data and constants
│   │   ├── seedData.js    # Candidates, weights, OSINT items
│   │   └── liveOsintData.js
│   ├── utils/             # Helper functions
│   │   └── helpers.js     # PoW calculations, utilities
│   ├── assets/            # Images, logos
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # TailwindCSS configuration
```

---

## 🧠 Core Algorithms

### PoW Calculation

The Power of Winning score is calculated as:

```
Raw PoW = Σ(Score_i × Weight_i)
```

Where scores are normalized per constituency:

```
Normalized PoW = (Raw PoW / Σ Raw PoW of all candidates in constituency) × 100
```

### Adjusted PoW (Forecaster)

For predictive modeling, the base score is adjusted for turnout and swing sensitivity:

```
Adjusted Score = Base PoW + (Turnout - 62) × TurnoutCoeff + (Swing - 5) × SwingCoeff
```

### Trend Detection

Trends are derived from score movements:
- **Up**: Raw PoW increases by > 0.3 points
- **Down**: Raw PoW decreases by > 0.3 points
- **Stable**: Change within ± 0.3 points

---

## 📊 Data Model

### Candidate Object Structure

```javascript
{
  id: 1,
  name: 'Harpreet Singh Bedi',
  party: 'AAP',
  constituency: 'Amritsar East',
  incumbent: true,
  trend: 'up',
  scores: {
    incumbency: 45,
    partyStrength: 72,
    pastWork: 68,
    personalBase: 60,
    religiousCasteBase: 55,
    digitalSentiment: 70
  },
  turnoutCoeff: 0.35,
  swingCoeff: 0.8
}
```

### Supported Parties

- **AAP** (Aam Aadmi Party) - Amber
- **BJP** (Bharatiya Janata Party) - Orange
- **INC** (Indian National Congress) - Blue
- **SAD** (Shiromani Akali Dal) - Green
- **Independent** - Gray

### Constituencies

- Amritsar East
- Ludhiana West
- Jalandhar Central

---

## 🎨 Component Breakdown

### CommandCenter.jsx
Main dashboard displaying:
- Candidate rankings by constituency
- Real-time PoW scores with color coding
- Trend indicators (up/down arrows)
- Last sync timestamp

### CandidateProfiles.jsx
Detailed candidate views:
- Individual score breakdowns
- Progress bars for each factor
- Historical sparkline charts
- Party affiliation badges

### HeadToHead.jsx
Comparative analysis:
- Side-by-side candidate comparison
- Score differentials
- Win probability visualization

### ProbabilityForecaster.jsx
Predictive modeling:
- Adjustable turnout slider (40-85%)
- Swing sensitivity controls
- Real-time forecast updates
- Probability distribution charts

### OSINTFeed.jsx
Sentiment aggregation:
- Live feed from Twitter, Reddit, News, Forums
- Sentiment classification (Positive/Negative/Neutral)
- Candidate attribution
- Relative timestamps

### DataIngestion.jsx
Data management:
- Add new candidates
- Edit existing candidate data
- Delete candidates
- Form validation

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Add any API keys or configuration here
VITE_API_URL=your_api_url
```

### Customizing Weights

Edit `src/data/seedData.js` to adjust scoring weights:

```javascript
export const WEIGHTS = {
  incumbency: 0.15,
  partyStrength: 0.20,
  pastWork: 0.18,
  personalBase: 0.17,
  religiousCasteBase: 0.15,
  digitalSentiment: 0.15,
};
```

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 👥 Authors

- **Aditya** - Project Lead

---

## 🙏 Acknowledgments

- Designed with geopolitical awareness of Indian electoral dynamics
- Caste/community sensitivity considerations integrated
- Open Source Intelligence methodologies applied

---

## 📞 Contact

For questions or support, please open an issue in the repository.

---

<div align="center">

**ELECTRA Electoral Intelligence Platform**

*Predictive Analytics Engine v2.0*

© 2026

</div>
