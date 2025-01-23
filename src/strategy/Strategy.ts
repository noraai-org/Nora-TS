import { TechnicalAnalysis } from "../indicators/technical";
import { HistoricalCandle } from "../indicators/types";
import { RiskManager } from "../trading/RiskManager";

export interface StrategyConfig {
    name: string;
    timeframe: string;
    parameters: Record<string, any>;
}

export abstract class Strategy {
    protected config: StrategyConfig;
    protected indicators: TechnicalAnalysis;
    protected riskManager: RiskManager;

    constructor(config: StrategyConfig, riskManager: RiskManager) {
        this.config = config;
        this.indicators = new TechnicalAnalysis();
        this.riskManager = riskManager;
    }

    abstract analyze(data: HistoricalCandle[]): {
        signal: 'buy' | 'sell' | 'hold';
        confidence: number;
        metadata: Record<string, any>;
    };

    abstract backtest(data: HistoricalCandle[]): {  
        returns: number;
        sharpeRatio: number;
        maxDrawdown: number;
        winRate: number;
    };
} 