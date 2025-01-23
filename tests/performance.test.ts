import { PerformanceAnalytics } from '../src/analytics/Performance';
import { describe, it, expect } from '@jest/globals';

describe('PerformanceAnalytics', () => {
    describe('Sharpe Ratio Calculation', () => {
        it('should calculate positive Sharpe ratio correctly', () => {
            const returns = [0.05, 0.06, 0.04, 0.07, 0.05];
            const sharpeRatio = PerformanceAnalytics.calculateSharpeRatio(returns);
            expect(sharpeRatio).toBeGreaterThan(0);
        });

        it('should calculate negative Sharpe ratio correctly', () => {
            const returns = [-0.05, -0.06, -0.04, -0.07, -0.05];
            const sharpeRatio = PerformanceAnalytics.calculateSharpeRatio(returns);
            expect(sharpeRatio).toBeLessThan(0);
        });

        it('should handle custom risk-free rate', () => {
            const returns = [0.05, 0.06, 0.04, 0.07, 0.05];
            const sharpeRatio1 = PerformanceAnalytics.calculateSharpeRatio(returns, 0.02);
            const sharpeRatio2 = PerformanceAnalytics.calculateSharpeRatio(returns, 0.03);
            expect(sharpeRatio1).toBeGreaterThan(sharpeRatio2);
        });
    });

    describe('Drawdown Calculation', () => {
        it('should calculate maximum drawdown correctly', () => {
            const equity = [100, 95, 90, 95, 85, 80, 85, 90];
            const maxDrawdown = PerformanceAnalytics.calculateDrawdown(equity);
            expect(maxDrawdown).toBe(0.2); // 20% drawdown from 100 to 80
        });

        it('should handle ascending equity curve', () => {
            const equity = [100, 105, 110, 115, 120];
            const maxDrawdown = PerformanceAnalytics.calculateDrawdown(equity);
            expect(maxDrawdown).toBe(0);
        });

        it('should handle single value', () => {
            const equity = [100];
            const maxDrawdown = PerformanceAnalytics.calculateDrawdown(equity);
            expect(maxDrawdown).toBe(0);
        });
    });
}); 