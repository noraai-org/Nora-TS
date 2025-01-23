export interface WebSocketOptions {
  autoReconnect: boolean;
  reconnectInterval: number;
  API_URL: string;
}

export interface SubscriptionMessage {
  type: 'subscribe' | 'unsubscribe';
  channel: string;
  symbol: string;
}

export interface TradeMessage {
  type: 'trade';
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
} 