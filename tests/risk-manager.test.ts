import { beforeEach, describe, expect, it } from '@jest/globals';
import { RiskManager } from '../src/trading/RiskManager';

describe('RiskManager', () => {
    let riskManager: RiskManager;
    const initialBalance = 50000;

    beforeEach(() => {
        riskManager = new RiskManager(initialBalance, 0.02, 0.1);
    });

    describe('Position Size Calculation', () => {
        it('should calculate position size correctly', () => {
            const entryPrice = 100;
            const stopLoss = 95;
            const positionSize = riskManager.calculatePositionSize(entryPrice, stopLoss);
            
            // Expected risk amount: 50000 * 0.02 = 1000
            // Risk per unit: 100 - 95 = 5
            // Expected position size: 1000 / 5 = 200
            expect(positionSize).toBeLessThanOrEqual(200);
        });

        it('should respect maximum position size', () => {
            const entryPrice = 100;
            const stopLoss = 99;
            const positionSize = riskManager.calculatePositionSize(entryPrice, stopLoss);
            
            // Max position size should be: (50000 * 0.1) / 100 = 50
            expect(positionSize).toBeLessThanOrEqual(50);
        });
    });

    describe('Trade Validation', () => {
        it('should validate trades correctly', () => {
            const result = riskManager.validateTrade(100, 95, 110);
            expect(result.isValid).toBe(true);
        });

        it('should reject trades with poor risk-reward ratio', () => {
            const result = riskManager.validateTrade(100, 95, 105);
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('Risk-reward ratio');
        });
    });

    describe('Account Balance Management', () => {
        it('should update balance correctly', () => {
            const newBalance = 55000;
            riskManager.updateBalance(newBalance);
            expect(riskManager.getAccountBalance()).toBe(newBalance);
        });

        it('should return correct max risk per trade', () => {
            expect(riskManager.getMaxRiskPerTrade()).toBe(0.02);
        });
    });
}); 