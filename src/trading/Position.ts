export interface PositionConfig {
    entryPrice: number;
    size: number;
    leverage?: number;
    stopLoss?: number;
    takeProfit?: number;
    side: 'long' | 'short';
}

export class Position {
    private entryPrice: number;
    private size: number;
    private leverage: number;
    private stopLoss?: number;
    private takeProfit?: number;
    private side: 'long' | 'short';
    private unrealizedPnL: number = 0;

    constructor(config: PositionConfig) {
        this.entryPrice = config.entryPrice;
        this.size = config.size;
        this.leverage = config.leverage || 1;
        this.stopLoss = config.stopLoss;
        this.takeProfit = config.takeProfit;
        this.side = config.side;
    }

    public updatePnL(currentPrice: number): void {
        if (this.side === 'long') {
            this.unrealizedPnL = (currentPrice - this.entryPrice) * this.size * this.leverage;
        } else {
            this.unrealizedPnL = (this.entryPrice - currentPrice) * this.size * this.leverage;
        }
    }

    public shouldClose(currentPrice: number): boolean {
        if (this.stopLoss && this.side === 'long' && currentPrice <= this.stopLoss) return true;
        if (this.stopLoss && this.side === 'short' && currentPrice >= this.stopLoss) return true;
        if (this.takeProfit && this.side === 'long' && currentPrice >= this.takeProfit) return true;
        if (this.takeProfit && this.side === 'short' && currentPrice <= this.takeProfit) return true;
        return false;
    }
} 