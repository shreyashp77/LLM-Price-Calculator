# LLM Price Calculator 🧮

A real-time, privacy-friendly dashboard for calculating and comparing the API costs of various Large Language Models (LLMs). 

This application fetches live pricing data from [OpenRouter](https://openrouter.ai/), allowing developers to estimate costs for OpenAI, Anthropic, Google Gemini, Meta Llama, and Mistral models based on specific token usage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)

## ✨ Key Features

*   **Real-time Pricing:** Fetches the latest pricing for hundreds of models via the OpenRouter public API.
*   **Interactive Cost Visualization:** 
    *   Toggle between Bar and Line charts.
    *   Compare Input vs. Output vs. Total costs.
    *   "Halo" effect tooltips for high readability.
*   **Smart Filtering & Sorting:**
    *   Filter by Provider (OpenAI, Google, Anthropic, etc.).
    *   Sort by Context Window, Input Price, or Total Cost.
    *   **Selection Mode:** Pick specific models to compare side-by-side in the chart.
*   **Currency Conversion:** Live switching between **USD ($)** and **INR (₹)** using real-time exchange rates.
*   **Privacy Focused:** No backend required. All calculations happen in the browser. No API keys are needed to run the app.

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **Data Source:** OpenRouter API (Models), ExchangeRate-API (Currency)
*   **State Management:** React Hooks + LocalStorage (for caching API responses)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/llm-price-calculator.git
    cd llm-price-calculator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    # or if using Vite
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## ☁️ Deployment

Since this is a **Static Single Page Application (SPA)**, you can host it for free on various platforms.

### Option 1: Firebase Hosting (Recommended)
1.  Install Firebase tools: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init` (Select 'Hosting', choose 'dist' or 'build' as public directory).
4.  Build: `npm run build`
5.  Deploy: `firebase deploy`

### Option 2: Vercel / Netlify
1.  Push your code to GitHub.
2.  Import the repository into Vercel or Netlify.
3.  They will automatically detect the React framework and deploy.

## 📁 Project Structure

```
├── components/
│   ├── ComparisonTable.tsx  # Sortable data table with multi-select
│   ├── CostChart.tsx        # Recharts integration (Bar/Line)
│   └── InputCard.tsx        # Token input handling
├── services/
│   └── apiService.ts        # OpenRouter API fetching & caching logic
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application logic
└── index.tsx                # Entry point
```

## 🔒 Privacy & API Usage

*   **No API Key Required:** The app uses the public OpenRouter models endpoint which does not require authentication.
*   **Client-Side Processing:** Token inputs and calculations are never sent to a server. They remain in your browser's memory.
*   **Caching:** Model data is cached in `localStorage` for 1 hour to reduce API calls and improve load times.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
