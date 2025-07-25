// Complete TradePro Backend Server - Consolidated Node.js/Express Server
// This is a comprehensive trading dashboard backend with AI integration

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory data storage (replace with PostgreSQL in production)
let portfolios = new Map();
let positions = new Map();
let optionsData = new Map();
let marketData = new Map();
let priceAlerts = new Map();
let trades = new Map();
let aiAnalysis = new Map();

// Initialize demo trading data
function initializeDemoData() {
  console.log('Initializing demo trading data...');
  
  // Demo portfolio
  portfolios.set(1, {
    id: 1,
    userId: 1,
    totalValue: 547892.00,
    availableCash: 123567.00,
    todayPnL: 12456.00,
    updatedAt: new Date()
  });

  // Demo positions for Bank Nifty options
  positions.set(1, {
    id: 1,
    userId: 1,
    symbol: 'BANKNIFTY 48000 CE',
    quantity: 100,
    avgPrice: 287.50,
    currentPrice: 330.00,
    pnl: 4250.00,
    positionType: 'long',
    createdAt: new Date()
  });

  positions.set(2, {
    id: 2,
    userId: 1,
    symbol: 'BANKNIFTY 47500 PE',
    quantity: 50,
    avgPrice: 156.75,
    currentPrice: 134.25,
    pnl: -1125.00,
    positionType: 'short',
    createdAt: new Date()
  });

  // Demo options chain for BANKNIFTY
  const bankNiftyOptions = [
    { strike: 47000, callPrice: 2156.75, putPrice: 45.30, callVolume: 1250, putVolume: 890, callOI: 15000, putOI: 8900 },
    { strike: 47500, callPrice: 1687.25, putPrice: 78.45, callVolume: 2340, putVolume: 1560, callOI: 23400, putOI: 15600 },
    { strike: 48000, callPrice: 1285.90, putPrice: 134.25, callVolume: 3450, putVolume: 2890, callOI: 34500, putOI: 28900 },
    { strike: 48500, callPrice: 945.75, putPrice: 213.60, callVolume: 2670, putVolume: 3240, callOI: 26700, putOI: 32400 },
    { strike: 49000, callPrice: 678.30, putPrice: 327.80, callVolume: 1890, putVolume: 4120, callOI: 18900, putOI: 41200 },
    { strike: 49500, callPrice: 456.25, putPrice: 478.90, callVolume: 1240, putVolume: 2890, callOI: 12400, putOI: 28900 },
    { strike: 50000, callPrice: 298.75, putPrice: 667.45, callVolume: 890, putVolume: 2340, callOI: 8900, putOI: 23400 }
  ];

  optionsData.set('BANKNIFTY', bankNiftyOptions.map((option, index) => ({
    id: index + 1,
    underlyingSymbol: 'BANKNIFTY',
    ...option,
    expiryDate: '25 Jan 2024',
    timestamp: new Date()
  })));

  // Demo market indices data
  const marketIndices = [
    { id: 1, symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 47825.50, change: 245.75, changePercent: 0.52, volume: 1234567 },
    { id: 2, symbol: 'NIFTY', name: 'Nifty 50', price: 21845.30, change: 125.40, changePercent: 0.58, volume: 987654 },
    { id: 3, symbol: 'SENSEX', name: 'Sensex', price: 72456.80, change: 189.20, changePercent: 0.26, volume: 654321 },
    { id: 4, symbol: 'FINNIFTY', name: 'Fin Nifty', price: 20567.90, change: -45.60, changePercent: -0.22, volume: 456789 }
  ];

  marketIndices.forEach(index => {
    marketData.set(index.symbol, {
      ...index,
      timestamp: new Date()
    });
  });

  console.log('Demo data initialized successfully');
}

// Simulate live market data updates
function updateMarketData() {
  const symbols = ['BANKNIFTY', 'NIFTY', 'SENSEX', 'FINNIFTY'];
  
  symbols.forEach(symbol => {
    const current = marketData.get(symbol);
    if (current) {
      // Simulate price fluctuation (±1% max change)
      const fluctuation = (Math.random() - 0.5) * 0.02; // ±2% max
      const newPrice = current.price * (1 + fluctuation);
      const change = newPrice - current.price;
      const changePercent = (change / current.price) * 100;

      const updatedData = {
        ...current,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 500000) + 500000,
        timestamp: new Date()
      };

      marketData.set(symbol, updatedData);
      
      // Broadcast to WebSocket clients
      broadcastToClients({
        type: 'marketUpdate',
        symbol,
        data: updatedData
      });
    }
  });
}

// WebSocket Setup for real-time updates
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Send initial market data
  const initialData = {};
  marketData.forEach((data, symbol) => {
    initialData[symbol] = data;
  });
  
  ws.send(JSON.stringify({
    type: 'initialData',
    data: initialData
  }));

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast data to all WebSocket clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// AI Trading Agent Functions
async function analyzeMarketWithAI(symbol) {
  // Simulate AI analysis (replace with actual OpenAI API call)
  const marketDataPoint = marketData.get(symbol);
  if (!marketDataPoint) {
    throw new Error('Market data not found');
  }

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate random but realistic AI analysis
  const signals = ['BUY', 'SELL', 'HOLD'];
  const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
  
  const signal = signals[Math.floor(Math.random() * signals.length)];
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  const targetMultiplier = signal === 'BUY' ? 1.02 : 0.98;
  const stopMultiplier = signal === 'BUY' ? 0.98 : 1.02;

  return {
    symbol,
    signal,
    confidence,
    reasoning: `Based on current market analysis of ${symbol}, the AI model detected ${
      signal === 'BUY' ? 'bullish momentum with strong volume support' :
      signal === 'SELL' ? 'bearish pressure with resistance at current levels' :
      'consolidation pattern with mixed signals'
    }. Technical indicators suggest ${riskLevel.toLowerCase()} risk entry point.`,
    targetPrice: marketDataPoint.price * targetMultiplier,
    stopLoss: marketDataPoint.price * stopMultiplier,
    riskLevel,
    timestamp: new Date()
  };
}

async function generateTradingSignal(symbol) {
  const analysis = await analyzeMarketWithAI(symbol);
  
  // Store analysis for later retrieval
  aiAnalysis.set(`${symbol}_${Date.now()}`, analysis);
  
  return {
    ...analysis,
    entryPrice: analysis.targetPrice * 0.999, // Slightly better entry
    quantity: Math.floor(Math.random() * 100) + 25, // 25-125 lots
    timeframe: '5min'
  };
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'TradePro Backend Server Running'
  });
});

// Market data endpoints
app.get('/api/market-indices', (req, res) => {
  try {
    const indices = Array.from(marketData.values());
    res.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/market-indices/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = marketData.get(symbol);
    
    if (!data) {
      return res.status(404).json({ error: 'Market data not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Portfolio endpoints
app.get('/api/portfolio/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const portfolio = Array.from(portfolios.values()).find(p => p.userId === userId);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/portfolio', (req, res) => {
  try {
    const { userId, totalValue, availableCash, todayPnL } = req.body;
    const id = portfolios.size + 1;
    
    const portfolio = {
      id,
      userId,
      totalValue: parseFloat(totalValue),
      availableCash: parseFloat(availableCash),
      todayPnL: parseFloat(todayPnL),
      updatedAt: new Date()
    };
    
    portfolios.set(id, portfolio);
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Positions endpoints
app.get('/api/positions/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userPositions = Array.from(positions.values())
      .filter(p => p.userId === userId);
    
    res.json(userPositions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/positions', (req, res) => {
  try {
    const { userId, symbol, quantity, avgPrice, currentPrice, pnl, positionType } = req.body;
    const id = positions.size + 1;
    
    const position = {
      id,
      userId,
      symbol,
      quantity: parseInt(quantity),
      avgPrice: parseFloat(avgPrice),
      currentPrice: parseFloat(currentPrice),
      pnl: parseFloat(pnl),
      positionType,
      createdAt: new Date()
    };
    
    positions.set(id, position);
    res.status(201).json(position);
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Options chain endpoint
app.get('/api/options-chain/:symbol/:expiry', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const options = optionsData.get(symbol) || [];
    res.json(options);
  } catch (error) {
    console.error('Error fetching options chain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Trading endpoints
app.post('/api/ai/analyze-market/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const analysis = await analyzeMarketWithAI(symbol);
    res.json(analysis);
  } catch (error) {
    console.error('Error in AI market analysis:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

app.post('/api/ai/trading-signal/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const signal = await generateTradingSignal(symbol);
    res.json(signal);
  } catch (error) {
    console.error('Error generating trading signal:', error);
    res.status(500).json({ error: 'Signal generation failed' });
  }
});

app.post('/api/ai/create-strategy', async (req, res) => {
  try {
    const { symbols, riskTolerance, timeframe, investment } = req.body;
    
    // Simulate strategy creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const strategy = {
      id: Date.now(),
      name: `AI Strategy ${new Date().toLocaleDateString()}`,
      symbols,
      riskTolerance,
      timeframe,
      investment: parseFloat(investment),
      expectedReturn: Math.random() * 20 + 10, // 10-30%
      riskScore: Math.random() * 100,
      createdAt: new Date()
    };
    
    res.json(strategy);
  } catch (error) {
    console.error('Error creating AI strategy:', error);
    res.status(500).json({ error: 'Strategy creation failed' });
  }
});

app.post('/api/ai/execute-trade', async (req, res) => {
  try {
    const { symbol, action, quantity, orderType } = req.body;
    
    // Simulate trade execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const trade = {
      id: Date.now(),
      symbol,
      action,
      quantity: parseInt(quantity),
      orderType,
      status: 'EXECUTED',
      executedPrice: marketData.get(symbol)?.price || 0,
      executedAt: new Date()
    };
    
    trades.set(trade.id, trade);
    res.json(trade);
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ error: 'Trade execution failed' });
  }
});

app.get('/api/ai/risk-assessment/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const portfolio = Array.from(portfolios.values()).find(p => p.userId === userId);
    const userPositions = Array.from(positions.values()).filter(p => p.userId === userId);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    // Simulate AI risk assessment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const totalPnL = userPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const portfolioRisk = Math.abs(totalPnL) / portfolio.totalValue * 100;
    
    const riskAssessment = {
      portfolioValue: portfolio.totalValue,
      totalPnL,
      riskScore: portfolioRisk,
      riskLevel: portfolioRisk < 2 ? 'LOW' : portfolioRisk < 5 ? 'MEDIUM' : 'HIGH',
      recommendations: [
        'Consider diversifying across different sectors',
        'Monitor position sizing relative to portfolio value',
        'Set stop-losses for all open positions'
      ],
      assessedAt: new Date()
    };
    
    res.json(riskAssessment);
  } catch (error) {
    console.error('Error in risk assessment:', error);
    res.status(500).json({ error: 'Risk assessment failed' });
  }
});

// Price alerts endpoints
app.get('/api/alerts/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userAlerts = Array.from(priceAlerts.values())
      .filter(a => a.userId === userId);
    
    res.json(userAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/alerts', (req, res) => {
  try {
    const { userId, symbol, condition, targetPrice } = req.body;
    const id = priceAlerts.size + 1;
    
    const alert = {
      id,
      userId,
      symbol,
      condition,
      targetPrice: parseFloat(targetPrice),
      isActive: true,
      isTriggered: false,
      createdAt: new Date(),
      triggeredAt: null
    };
    
    priceAlerts.set(id, alert);
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trading execution endpoint
app.post('/api/trade', (req, res) => {
  try {
    const { userId, symbol, tradeType, quantity, price } = req.body;
    const id = trades.size + 1;
    
    const trade = {
      id,
      userId,
      symbol,
      tradeType,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      status: 'EXECUTED',
      executedAt: new Date()
    };
    
    trades.set(id, trade);
    
    // Update or create position
    const existingPosition = Array.from(positions.values())
      .find(p => p.userId === userId && p.symbol === symbol);
    
    if (existingPosition) {
      const newQuantity = tradeType === 'buy' 
        ? existingPosition.quantity + parseInt(quantity)
        : existingPosition.quantity - parseInt(quantity);
      
      const updatedPosition = {
        ...existingPosition,
        quantity: newQuantity,
        currentPrice: parseFloat(price),
        pnl: (parseFloat(price) - existingPosition.avgPrice) * newQuantity
      };
      
      positions.set(existingPosition.id, updatedPosition);
    } else if (tradeType === 'buy') {
      const newPosition = {
        id: positions.size + 1,
        userId,
        symbol,
        quantity: parseInt(quantity),
        avgPrice: parseFloat(price),
        currentPrice: parseFloat(price),
        pnl: 0,
        positionType: 'long',
        createdAt: new Date()
      };
      
      positions.set(newPosition.id, newPosition);
    }
    
    res.status(201).json(trade);
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Watchlist endpoint
app.get('/api/watchlist', (req, res) => {
  try {
    const watchlist = Array.from(marketData.values()).map(data => ({
      symbol: data.symbol,
      price: data.price.toFixed(2),
      change: (data.change >= 0 ? '+' : '') + data.change.toFixed(2),
      changePercent: (data.changePercent >= 0 ? '+' : '') + data.changePercent.toFixed(2) + '%'
    }));
    
    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files (React app)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve React app for all non-API routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not found. Please build the React app first.');
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize demo data
initializeDemoData();

// Start real-time market data updates
setInterval(updateMarketData, 5000); // Update every 5 seconds

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TradePro Backend Server running on port ${PORT}`);
  console.log(`📊 Market data updating every 5 seconds`);
  console.log(`🔌 WebSocket server available at ws://localhost:${PORT}/ws`);
  console.log(`🧠 AI trading features enabled`);
  console.log(`📈 Demo data initialized for Indian markets`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export for testing
module.exports = app;

/*
Package.json dependencies needed:
{
  "name": "tradepro-backend",
  "version": "1.0.0",
  "description": "TradePro Trading Dashboard Backend Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "http": "^0.0.1-security"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}

Environment Variables:
PORT=5000
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here (optional, for real AI features)

Deployment Instructions:
1. Copy this file as server.js
2. Run: npm install express cors ws
3. Create public/ folder for React build files
4. Run: node server.js
5. Access at http://localhost:5000

Features:
✅ Real-time market data simulation
✅ WebSocket support for live updates
✅ AI trading analysis simulation
✅ Portfolio and position management
✅ Options chain data
✅ Trading execution
✅ Price alerts system
✅ Risk assessment tools
✅ Complete API for Indian markets (NIFTY, BANKNIFTY, SENSEX, FINNIFTY)
*/
