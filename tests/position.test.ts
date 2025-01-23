import { Position } from '../src/trading/Position';
import { describe, it, expect, beforeEach } from '@jest/globals';
describe('Position', () => {
    describe('Long Position', () => {
        let longPosition: Position;

        beforeEach(() => {
            longPosition = new Position({
                entryPrice: 100,
                size: 1,
                leverage: 2,
                stopLoss: 95,
                takeProfit: 110,
                side: 'long'
            });
        });

        it('should calculate positive PnL correctly', () => {
            longPosition.updatePnL(105);
            expect(longPosition['unrealizedPnL']).toBe(10); // (105 - 100) * 1 * 2
        });

        it('should calculate negative PnL correctly', () => {
            longPosition.updatePnL(97);
            expect(longPosition['unrealizedPnL']).toBe(-6); // (97 - 100) * 1 * 2
        });

        it('should trigger stop loss', () => {
            expect(longPosition.shouldClose(94)).toBe(true);
        });

        it('should trigger take profit', () => {
            expect(longPosition.shouldClose(111)).toBe(true);
        });

        it('should not trigger any close conditions', () => {
            expect(longPosition.shouldClose(100)).toBe(false);
        });
    });

    describe('Short Position', () => {
        let shortPosition: Position;

        beforeEach(() => {
            shortPosition = new Position({
                entryPrice: 100,
                size: 1,
                leverage: 2,
                stopLoss: 105,
                takeProfit: 90,
                side: 'short'
            });
        });

        it('should calculate positive PnL correctly', () => {
            shortPosition.updatePnL(95);
            expect(shortPosition['unrealizedPnL']).toBe(10); // (100 - 95) * 1 * 2
        });

        it('should calculate negative PnL correctly', () => {
            shortPosition.updatePnL(103);
            expect(shortPosition['unrealizedPnL']).toBe(-6); // (100 - 103) * 1 * 2
        });

        it('should trigger stop loss', () => {
            expect(shortPosition.shouldClose(106)).toBe(true);
        });

        it('should trigger take profit', () => {
            expect(shortPosition.shouldClose(89)).toBe(true);
        });

        it('should not trigger any close conditions', () => {
            expect(shortPosition.shouldClose(100)).toBe(false);
        });
    });

    describe('Position Configuration', () => {
        it('should handle position without leverage', () => {
            const position = new Position({
                entryPrice: 100,
                size: 1,
                side: 'long'
            });
            position.updatePnL(110);
            expect(position['unrealizedPnL']).toBe(10); // (110 - 100) * 1 * 1
        });

        it('should handle position without stop loss and take profit', () => {
            const position = new Position({
                entryPrice: 100,
                size: 1,
                side: 'long'
            });
            expect(position.shouldClose(90)).toBe(false);
            expect(position.shouldClose(110)).toBe(false);
        });
    });
}); 