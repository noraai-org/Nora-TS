export class PerformanceAnalytics {
    public static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
        const excessReturns = returns.map(r => r - riskFreeRate);
        const avgExcessReturn = excessReturns.reduce((a, b) => a + b) / returns.length;
        const stdDev = Math.sqrt(excessReturns.reduce((a, b) => a + Math.pow(b - avgExcessReturn, 2), 0) / returns.length);
        return avgExcessReturn / stdDev;
    }

    public static calculateDrawdown(equity: number[]): number {
        let maxDrawdown = 0;
        let peak = equity[0];

        for (const value of equity) {
            if (value > peak) peak = value;
            const drawdown = (peak - value) / peak;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }

        return maxDrawdown;
    }
} 