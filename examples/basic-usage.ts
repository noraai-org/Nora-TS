import { CryptoWebSocketClient } from '../src';
import { TechnicalAnalysis } from '../src/indicators/technical';
import { RiskManager } from '../src/trading/RiskManager';
import { Position } from '../src/trading/Position';
import { PerformanceAnalytics } from '../src/analytics/Performance';

const STRATEGY_NAME = 'basic-strategy';
const TOKEN_MINT = 'YOUR_TOKEN_MINT';

// Initialize WebSocket client
const client = new CryptoWebSocketClient('YOUR_API_KEY', {
    autoReconnect: true,
    reconnectInterval: 5000,
});

// Initialize Risk Manager with placeholder values
const riskManager = new RiskManager(
    50000,  // Will be updated with actual balance
    0.02,   // 2% max risk per trade
    0.1     // 10% max position size
);

let historicalCandles = [];
let currentStrategy: any = null;

client.on('connected', async () => {
    console.log('Connected to WebSocket server');

    // Get account balance
    client.getBalance();
    
    // Create or get strategy
    client.createStrategy(STRATEGY_NAME);
    
    // Subscribe to market data
    client.subscribe(TOKEN_MINT);
    
    // Subscribe to signals with minimum volume threshold
    client.subscribeSignal('1h', 1000); // Subscribe to 1h timeframe signals with 1000 volume threshold
    
    // Request historical data
    client.history(TOKEN_MINT, Date.now() - 86400000, Date.now());
});

// Handle balance updates
client.on('balance', (balance) => {
    console.log('Account balance:', balance);
    riskManager.updateAccountBalance(balance.amount);
});

// Handle strategy creation/retrieval
client.on('strategy', (strategy) => {
    console.log('Current strategy:', strategy);
    currentStrategy = strategy;
});

// Handle signal notifications
client.on('signal', (signal) => {
    console.log('Received signal:', signal);
    // Implement signal-based trading logic here
});

// Handle transaction confirmations
client.on('transaction', (transaction) => {
    console.log('Transaction completed:', transaction);
    // Update position tracking or perform post-trade actions
});

function executeTrade(side: 'buy' | 'sell', price: number, size: number) {
    const amountSol = price * size;
    client.executeTrade(side, {
        mint: TOKEN_MINT,
        amountSol
    });
}

function performAnalysis() {
    console.log('Performing analysis');
    // Calculate technical indicators
    const rsi = TechnicalAnalysis.calculateRSI(historicalCandles, 14);
    const macd = TechnicalAnalysis.calculateMACD(historicalCandles);
    const bollinger = TechnicalAnalysis.calculateBollingerBands(historicalCandles, 20, 2);

    // Get latest price
    const currentPrice = historicalCandles[historicalCandles.length - 1].close;

    // Debug technical indicators
    console.log('Technical Analysis:', {
        currentPrice,
        rsi: rsi.length ? rsi[rsi.length - 1]?.toFixed(2) : 'N/A',
        macd: {
            line: macd.macd.length ? macd.macd[macd.macd.length - 1]?.toFixed(2) : 'N/A',
            signal: macd.signal.length ? macd.signal[macd.signal.length - 1]?.toFixed(2) : 'N/A',
            histogram: macd.histogram.length ? macd.histogram[macd.histogram.length - 1]?.toFixed(2) : 'N/A'
        },
        bollinger: {
            upper: bollinger.upper.length ? bollinger.upper[bollinger.upper.length - 1]?.toFixed(2) : 'N/A',
            middle: bollinger.middle.length ? bollinger.middle[bollinger.middle.length - 1]?.toFixed(2) : 'N/A',
            lower: bollinger.lower.length ? bollinger.lower[bollinger.lower.length - 1]?.toFixed(2) : 'N/A'
        }
    });

    // Modified trading logic to execute trades
    if (rsi.length && macd.histogram.length && 
        rsi[rsi.length - 1] < 30 && 
        macd.histogram[macd.histogram.length - 1] > 0) {
        
        const stopLoss = currentPrice * 0.98;
        const takeProfit = currentPrice * 1.04;
        const tradeValidation = riskManager.validateTrade(currentPrice, stopLoss, takeProfit);

        if (tradeValidation.isValid) {
            const positionSize = riskManager.calculatePositionSize(currentPrice, stopLoss);
            
            // Execute the trade
            executeTrade('buy', currentPrice, positionSize);
            
            const position = new Position({
                entryPrice: currentPrice,
                size: positionSize,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                side: 'long'
            });
        }
    } else {
        console.log('No trading signal:', {
            rsi: rsi.length ? rsi[rsi.length - 1]?.toFixed(2) : 'N/A',
            macdHistogram: macd.histogram.length ? macd.histogram[macd.histogram.length - 1]?.toFixed(2) : 'N/A'
        });
    }
}

// Track performance
let returns = [];
client.on('trade', (trade) => {
    if (trade.type === 'fill') {
        returns.push(trade.pnl / riskManager.getAccountBalance());

        // Calculate performance metrics
        const sharpeRatio = PerformanceAnalytics.calculateSharpeRatio(returns);
        const maxDrawdown = PerformanceAnalytics.calculateDrawdown(
            returns.map((r, i) => 1 + returns.slice(0, i + 1).reduce((a, b) => a + b, 0))
        );

        console.log('Performance Metrics:', {
            sharpeRatio,
            maxDrawdown: maxDrawdown * 100 + '%'
        });
    }
});

client.on('error', (error) => {
    console.error('WebSocket error:', error);
});

client.on('disconnected', () => {
    console.log('Disconnected from WebSocket server');
});

// Connect to the WebSocket server
client.connect(); 