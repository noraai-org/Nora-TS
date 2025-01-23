import { TechnicalAnalysis } from '../src/indicators/technical';
import { HistoricalCandle } from '../src/indicators/types';
import { describe, it, expect } from '@jest/globals';

describe('TechnicalAnalysis', () => {
    // Sample data for testing
    const sampleData: HistoricalCandle[] = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() + i * 60000,
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
        volumeSol: 1000,
        volumeToken: 1000
    }));

    describe('SMA Calculation', () => {
        it('should handle empty data', () => {
            const sma = TechnicalAnalysis.calculateSMA([], 5);
            expect(sma).toEqual([]);
        });
    });

    describe('RSI Calculation', () => {
        it('should calculate RSI correctly', () => {
            const rsi = TechnicalAnalysis.calculateRSI(sampleData);
            expect(rsi.length).toBe(sampleData.length - 14);
            expect(rsi[0]).toBeGreaterThanOrEqual(0);
            expect(rsi[0]).toBeLessThanOrEqual(100);
        });

        it('should handle insufficient data', () => {
            const rsi = TechnicalAnalysis.calculateRSI(sampleData.slice(0, 5));
            expect(rsi).toEqual([]);
        });
    });

    describe('MACD Calculation', () => {
        it('should calculate MACD correctly', () => {
            const macd = TechnicalAnalysis.calculateMACD(sampleData);
            expect(macd.macd.length).toBeGreaterThan(0);
            expect(macd.signal.length).toBe(macd.macd.length);
            expect(macd.histogram.length).toBe(macd.macd.length);
        });

        it('should handle insufficient data', () => {
            const macd = TechnicalAnalysis.calculateMACD(sampleData.slice(0, 10));
            expect(macd.macd).toEqual([]);
            expect(macd.signal).toEqual([]);
            expect(macd.histogram).toEqual([]);
        });
    });

    describe('Bollinger Bands Calculation', () => {
        it('should calculate Bollinger Bands correctly', () => {
            const bb = TechnicalAnalysis.calculateBollingerBands(sampleData);
            expect(bb.upper.length).toBeGreaterThan(0);
            expect(bb.middle.length).toBe(bb.upper.length);
            expect(bb.lower.length).toBe(bb.upper.length);
            
            // Upper band should be higher than middle band
            expect(bb.upper[0]).toBeGreaterThan(bb.middle[0]);
            // Lower band should be lower than middle band
            expect(bb.lower[0]).toBeLessThan(bb.middle[0]);
        });

        it('should handle insufficient data', () => {
            const bb = TechnicalAnalysis.calculateBollingerBands(sampleData.slice(0, 5));
            expect(bb.upper).toEqual([]);
            expect(bb.middle).toEqual([]);
            expect(bb.lower).toEqual([]);
        });
    });
}); 