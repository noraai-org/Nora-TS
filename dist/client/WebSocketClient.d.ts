/// <reference types="node" />
import { EventEmitter } from 'events';
import { WebSocketOptions } from '../types';
export declare class CryptoWebSocketClient extends EventEmitter {
    private ws;
    private readonly url;
    private readonly options;
    private reconnectAttempts;
    private readonly maxReconnectAttempts;
    constructor(url: string, options?: Partial<WebSocketOptions>);
    connect(): void;
    disconnect(): void;
    subscribe(channel: string, symbol: string): void;
    unsubscribe(channel: string, symbol: string): void;
    private send;
    private setupEventHandlers;
    private handleReconnect;
}
