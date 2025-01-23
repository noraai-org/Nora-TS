import { HistoricalCandle, MACDResult, BollingerBandsResult } from './types';

export class TechnicalAnalysis {
    /**
     * Calculates Simple Moving Average (SMA) from historical data
     * @param data Array of historical candles
     * @param period Number of periods to calculate SMA
     * @param field Price field to use (default: 'close')
     */
    public static calculateSMA(data: HistoricalCandle[], period: number, field: 'open' | 'high' | 'low' | 'close' = 'close'): number[] {
        if (!data || data.length < period) {
            return [];
        }
    
        const sma: number[] = [];
        
        // Calculate first SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i][field];
        }
        sma.push(sum / period);
    
        // Calculate subsequent SMAs
        for (let i = period; i < data.length; i++) {
            sum = sum - data[i - period][field] + data[i][field];
            sma.push(sum / period);
        }
    
        return sma;
    }

    /**
     * Calculates Relative Strength Index (RSI)
     * @param data Array of historical candles
     * @param period RSI period (typically 14)
     */
    public static calculateRSI(data: HistoricalCandle[], period: number = 14): number[] {
        const rsi: number[] = [];
        const gains: number[] = [];
        const losses: number[] = [];

        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        // Calculate initial averages
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

        // Calculate RSI
        for (let i = period; i < data.length; i++) {
            avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;

            const rs = avgGain / avgLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }

        return rsi;
    }

    /**
     * Calculates Moving Average Convergence Divergence (MACD)
     * @param data Array of historical candles
     * @param fastPeriod Fast EMA period (typically 12)
     * @param slowPeriod Slow EMA period (typically 26)
     * @param signalPeriod Signal line period (typically 9)
     */
    public static calculateMACD(
        data: HistoricalCandle[],
        fastPeriod: number = 12,
        slowPeriod: number = 26,
        signalPeriod: number = 9
    ): MACDResult {
        // Add debug logging
        console.log('MACD Input Data Length:', data.length);
        console.log('Sample prices:', data.slice(0, 5).map(d => d.close));

        // Ensure we have enough data
        if (!data || data.length < Math.max(fastPeriod, slowPeriod) + signalPeriod) {
            console.log('Insufficient data for MACD calculation');
            return { macd: [], signal: [], histogram: [] };
        }

        const closes = data.map(candle => candle.close);
        const fastEMA = this.calculateEMA(closes, fastPeriod);
        const slowEMA = this.calculateEMA(closes, slowPeriod);

        console.log('EMA Lengths:', {
            fast: fastEMA.length,
            slow: slowEMA.length
        });

        // Calculate MACD line
        const macd: number[] = [];
        const maxLength = Math.min(fastEMA.length, slowEMA.length);
        for (let i = 0; i < maxLength; i++) {
            macd.push(fastEMA[i] - slowEMA[i]);
        }

        // Calculate signal line (EMA of MACD)
        const signal = this.calculateEMA(macd, signalPeriod);

        console.log('MACD Components:', {
            macdLength: macd.length,
            signalLength: signal.length,
            sampleMACD: macd.slice(-5),
            sampleSignal: signal.slice(-5)
        });

        // Calculate histogram
        const histogram = macd.map((value, i) => 
            i < signal.length ? value - signal[i] : NaN
        ).filter(value => !isNaN(value));

        // Trim arrays to same length
        const minLength = Math.min(macd.length, signal.length);
        return {
            macd: macd.slice(0, minLength),
            signal: signal.slice(0, minLength),
            histogram: histogram.slice(0, minLength)
        };
    }

    /**
     * Helper function to calculate Exponential Moving Average (EMA)
     * @param data Array of prices
     * @param period EMA period
     */
    private static calculateEMA(data: number[], period: number): number[] {
        const ema: number[] = [];
        const multiplier = 2 / (period + 1);

        // Handle empty data or insufficient data points
        if (!data || data.length < period) {
            return [];
        }

        // Scale up the numbers to avoid floating point precision issues
        const scaleFactor = 1e10;
        const scaledData = data.map(price => price * scaleFactor);

        // Initialize first EMA with SMA
        let sum = 0;
        for (let i = 0; i < period && i < scaledData.length; i++) {
            if (typeof scaledData[i] !== 'number' || isNaN(scaledData[i])) {
                return [];
            }
            sum += scaledData[i];
        }
        const firstEMA = sum / period;
        ema.push(firstEMA);

        // Calculate subsequent EMAs
        for (let i = period; i < scaledData.length; i++) {
            if (typeof scaledData[i] !== 'number' || isNaN(scaledData[i])) {
                continue;
            }
            const currentEMA = (scaledData[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
            ema.push(currentEMA);
        }

        // Scale back down before returning
        return ema.map(value => value / scaleFactor);
    }

    /**
     * Calculates Bollinger Bands
     * @param data Array of historical candles
     * @param period Period for moving average (typically 20)
     * @param stdDev Number of standard deviations (typically 2)
     */
    public static calculateBollingerBands(
        data: HistoricalCandle[],
        period: number = 20,
        stdDev: number = 2
    ): BollingerBandsResult {
        if (!data || data.length < period) {
            return { upper: [], middle: [], lower: [] };
        }

        const scaleFactor = 1e10;
        const scaledData = data.map(candle => ({
            ...candle,
            close: candle.close * scaleFactor
        }));

        const middle = this.calculateSMA(scaledData, period);
        const upper: number[] = [];
        const lower: number[] = [];

        for (let i = period - 1; i < scaledData.length; i++) {
            const slice = scaledData.slice(i - period + 1, i + 1);
            const avg = middle[i - (period - 1)];
            
            // Calculate standard deviation
            const squaredDiffs = slice.map(candle => Math.pow(candle.close - avg, 2));
            const variance = squaredDiffs.reduce((a, b) => a + b) / period;
            const sd = Math.sqrt(variance);

            upper.push((avg + (stdDev * sd)) / scaleFactor);
            lower.push((avg - (stdDev * sd)) / scaleFactor);
        }

        return { 
            upper, 
            middle: middle.map(m => m / scaleFactor), 
            lower 
        };
    }
} 