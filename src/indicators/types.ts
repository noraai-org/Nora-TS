export interface HistoricalCandle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volumeSol: number;
    volumeToken: number;
}

export interface MACDResult {
    macd: number[];
    signal: number[];
    histogram: number[];
}

export interface BollingerBandsResult {
    upper: number[];
    middle: number[];
    lower: number[];
} 