// Complete TradePro Frontend - Consolidated React TypeScript Component
// This is a comprehensive trading dashboard for Indian markets with AI integration

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, TrendingDown, Bell, BarChart3, Brain, Clock, PieChart,
  Home, Target, Settings, ChevronUp, ChevronDown, Activity, DollarSign,
  AlertCircle, Zap, Plus, Minus, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Types and Interfaces
interface MarketIndex {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  updatedAt: string;
}

interface Portfolio {
  id: number;
  userId: number;
  totalValue: number;
  availableCash: number;
  todayPnL: number;
  updatedAt: string;
}

interface Position {
  id: number;
  userId: number;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  positionType: 'long' | 'short';
  createdAt: string;
}

interface OptionsData {
  id: number;
  underlyingSymbol: string;
  strike: number;
  callPrice: number;
  putPrice: number;
  callVolume: number;
  putVolume: number;
  callOI: number;
  putOI: number;
  expiryDate: string;
}

interface AIAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);
};

const formatTime = (date: Date): string => {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const getChangeColor = (change: number): string => {
  return change >= 0 ? 'text-green-400' : 'text-red-400';
};

const isMarketOpen = (): boolean => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();
  const currentTime = hour * 60 + minute;
  
  const marketOpenTime = 9 * 60 + 15; // 9:15 AM
  const marketCloseTime = 15 * 60 + 30; // 3:30 PM
  
  return currentTime >= marketOpenTime && currentTime <= marketCloseTime;
};

// API Functions
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
};

// Custom Hook for Data Fetching
const useQuery = <T>(endpoint: string, refetchInterval?: number) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await apiRequest(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, isLoading, error, refetch: fetchData };
};

// Header Component
const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: marketIndices } = useQuery<MarketIndex[]>('/market-indices', 3000);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TP</span>
          </div>
          <h1 className="text-xl font-bold text-white">TradePro</h1>
        </div>

        <div className="hidden lg:flex items-center space-x-6 text-sm">
          {marketIndices?.map((index) => (
            <div key={index.symbol} className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">
                {index.symbol === 'BANKNIFTY' ? 'BANK NIFTY' : 
                 index.symbol === 'NIFTY' ? 'NIFTY' : 
                 index.symbol === 'FINNIFTY' ? 'FIN NIFTY' : index.symbol}
              </span>
              <span className="text-white font-semibold">
                {index.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs flex items-center ${getChangeColor(index.change)}`}>
                {index.change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {formatPercentage(index.changePercent)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isMarketOpen() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isMarketOpen() ? 'text-green-500' : 'text-red-500'}`}>
            {isMarketOpen() ? 'Market Open' : 'Market Closed'}
          </span>
        </div>

        <div className="text-slate-400 text-sm font-medium">
          {formatTime(currentTime)}
        </div>

        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
          <span className="text-white text-sm font-semibold">JD</span>
        </div>
      </div>
    </header>
  );
};

// Portfolio Summary Component
const PortfolioSummary: React.FC = () => {
  const { data: portfolio } = useQuery<Portfolio>('/portfolio/1', 5000);

  if (!portfolio) return <div className="p-4 text-slate-400">Loading portfolio...</div>;

  return (
    <div className="p-4 border-b border-slate-700">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <PieChart className="w-4 h-4 mr-2" />
        Portfolio Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400">Total Value</span>
          <span className="text-white font-semibold">{formatCurrency(portfolio.totalValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Available Cash</span>
          <span className="text-white font-semibold">{formatCurrency(portfolio.availableCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Today's P&L</span>
          <span className={`font-semibold ${getChangeColor(portfolio.todayPnL)}`}>
            {portfolio.todayPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.todayPnL)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Active Positions Component
const ActivePositions: React.FC = () => {
  const { data: positions } = useQuery<Position[]>('/positions/1', 5000);

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <Target className="w-4 h-4 mr-2" />
        Active Positions
      </h3>
      <div className="space-y-3">
        {positions?.map((position, index) => (
          <div key={index} className="bg-slate-700 rounded-lg p-3">
            <div className="text-white text-sm font-medium mb-1">{position.symbol}</div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Qty: {position.quantity}</span>
              <span className="text-slate-400">Avg: ₹{position.avgPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-400">LTP: ₹{position.currentPrice.toFixed(2)}</span>
              <span className={`font-medium ${getChangeColor(position.pnl)}`}>
                {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{ currentPage: string; onPageChange: (page: string) => void }> = ({ currentPage, onPageChange }) => {
  const navigationItems = [
    { name: "Dashboard", icon: BarChart3, path: "dashboard" },
    { name: "Live Trading", icon: TrendingUp, path: "live-trading" },
    { name: "AI Strategy", icon: Brain, path: "ai-strategy" },
    { name: "Backtest", icon: Clock, path: "backtest" },
    { name: "Portfolio", icon: PieChart, path: "portfolio" },
    { name: "Analytics", icon: Activity, path: "analytics" },
  ];

  return (
    <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
      <nav className="p-4 border-b border-slate-700">
        <div className="space-y-2">
          {navigationItems.map(({ name, icon: Icon, path }) => {
            const isActive = currentPage === path;
            return (
              <button
                key={name}
                onClick={() => onPageChange(path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <PortfolioSummary />
      <ActivePositions />
    </aside>
  );
};

// Market Overview Component
const MarketOverview: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data: marketData } = useQuery<MarketIndex>(`/market-indices/${symbol}`, 3000);

  if (!marketData) return <div className="bg-slate-800 rounded-lg p-6 mb-6">Loading...</div>;

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">{marketData.name}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-white text-2xl font-bold">{marketData.price.toLocaleString('en-IN')}</span>
          <div className={`flex items-center space-x-1 ${getChangeColor(marketData.change)}`}>
            {marketData.change >= 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <span className="font-semibold">
              {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)} 
              ({formatPercentage(marketData.changePercent)})
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 text-sm">
        <div className="text-slate-400">
          Volume: <span className="text-white">{marketData.volume.toLocaleString()}</span>
        </div>
        <div className="text-slate-400">
          High: <span className="text-white">{(marketData.price * 1.02).toFixed(2)}</span>
        </div>
        <div className="text-slate-400">
          Low: <span className="text-white">{(marketData.price * 0.98).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// Options Chain Component
const OptionsChain: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data: optionsData } = useQuery<OptionsData[]>(`/options-chain/${symbol}/25%20Jan%202024`, 5000);

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Options Chain</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400">Strike</th>
              <th className="text-center py-3 px-4 text-green-400">CE Price</th>
              <th className="text-center py-3 px-4 text-green-400">CE Vol</th>
              <th className="text-center py-3 px-4 text-green-400">Action</th>
              <th className="text-center py-3 px-4 text-red-400">PE Price</th>
              <th className="text-center py-3 px-4 text-red-400">PE Vol</th>
              <th className="text-center py-3 px-4 text-red-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {optionsData?.map((option) => (
              <tr key={option.strike} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="py-3 px-4 text-white font-medium">{option.strike}</td>
                <td className="py-3 px-4 text-center text-green-400">{option.callPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-center text-slate-300">{option.callVolume.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex space-x-1">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                      BUY
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                      SELL
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-red-400">{option.putPrice.toFixed(2)}</td>
                <td className="py-3 px-4 text-center text-slate-300">{option.putVolume.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex space-x-1">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">
                      BUY
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">
                      SELL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// AI Trading Panel Component
const AITradingPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMarket = async (symbol: string) => {
    setIsAnalyzing(true);
    try {
      const result = await apiRequest(`/ai/analyze-market/${symbol}`, { method: 'POST' });
      setAnalysis(result);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        AI Trading Assistant
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['BANKNIFTY', 'NIFTY', 'FINNIFTY'].map((symbol) => (
          <button
            key={symbol}
            onClick={() => analyzeMarket(symbol)}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Analyze {symbol}
          </button>
        ))}
      </div>

      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">AI is analyzing market data...</p>
        </div>
      )}

      {analysis && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                analysis.signal === 'BUY' ? 'bg-green-600' : 
                analysis.signal === 'SELL' ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {analysis.signal}
              </span>
              <span className="text-slate-400">Confidence: {analysis.confidence}%</span>
            </div>
            <span className={`text-sm ${
              analysis.riskLevel === 'LOW' ? 'text-green-400' :
              analysis.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              Risk: {analysis.riskLevel}
            </span>
          </div>
          
          <p className="text-slate-300 mb-3">{analysis.reasoning}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Target Price:</span>
              <span className="text-white ml-2">₹{analysis.targetPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">Stop Loss:</span>
              <span className="text-white ml-2">₹{analysis.stopLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Page Components
const Dashboard: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <MarketOverview symbol="BANKNIFTY" />
    <OptionsChain symbol="BANKNIFTY" />
  </main>
);

const LiveTrading: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MarketOverview symbol="BANKNIFTY" />
      <AITradingPanel />
    </div>
    <OptionsChain symbol="BANKNIFTY" />
  </main>
);

const AIStrategy: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="grid grid-cols-1 gap-6">
      <AITradingPanel />
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Strategy Builder</h3>
        <p className="text-slate-400">AI-powered strategy creation and backtesting tools.</p>
      </div>
    </div>
  </main>
);

const Backtest: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-white text-xl font-bold">Strategy Backtesting</h2>
      <p className="text-slate-400 mt-2">Advanced backtesting and strategy optimization tools.</p>
    </div>
  </main>
);

const Portfolio: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-white text-xl font-bold">Portfolio Analysis</h2>
      <p className="text-slate-400 mt-2">Detailed portfolio analytics and performance metrics.</p>
    </div>
  </main>
);

const Analytics: React.FC = () => (
  <main className="flex-1 p-6 overflow-y-auto">
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-white text-xl font-bold">Trading Analytics</h2>
      <p className="text-slate-400 mt-2">Advanced trading analytics and market insights.</p>
    </div>
  </main>
);

// Main App Component
const TradePro: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'live-trading': return <LiveTrading />;
      case 'ai-strategy': return <AIStrategy />;
      case 'backtest': return <Backtest />;
      case 'portfolio': return <Portfolio />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        {renderPage()}
      </div>
    </div>
  );
};

export default TradePro;

// CSS Styles (Add to your stylesheet or use Tailwind CSS)
const styles = `
  .bg-slate-900 { background-color: #0f172a; }
  .bg-slate-800 { background-color: #1e293b; }
  .bg-slate-700 { background-color: #334155; }
  .border-slate-700 { border-color: #334155; }
  .text-slate-300 { color: #cbd5e1; }
  .text-slate-400 { color: #94a3b8; }
  .text-green-400 { color: #4ade80; }
  .text-red-400 { color: #f87171; }
  .text-blue-600 { color: #2563eb; }
  .bg-blue-600 { background-color: #2563eb; }
  .bg-green-600 { background-color: #16a34a; }
  .bg-red-600 { background-color: #dc2626; }
  .hover\\:bg-slate-700:hover { background-color: #334155; }
  .hover\\:bg-green-700:hover { background-color: #15803d; }
  .hover\\:bg-red-700:hover { background-color: #b91c1c; }
`;

/*
Installation Instructions:
1. npm install lucide-react
2. Add Tailwind CSS to your project
3. Import and use the TradePro component
4. Connect to your backend API endpoints
5. Add OpenAI API key for AI features

Required Backend Endpoints:
- GET /api/market-indices
- GET /api/market-indices/:symbol
- GET /api/portfolio/:userId
- GET /api/positions/:userId
- GET /api/options-chain/:symbol/:expiry
- POST /api/ai/analyze-market/:symbol

Usage Example:
import TradePro from './TradePro';

function App() {
  return <TradePro />;
}
*/
