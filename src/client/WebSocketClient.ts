import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';
import { WebSocketOptions } from '../types';

const API_URL = 'https://api.nora.systems'

export class CryptoWebSocketClient extends EventEmitter {
    private socket: Socket | null = null;
    private readonly options: WebSocketOptions;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private readonly API_KEY: string;

    constructor(API_KEY: string, options: Partial<WebSocketOptions> = {}) {
        super();
        this.API_KEY = API_KEY;
        this.options = {
            autoReconnect: true,
            reconnectInterval: 5000,
            ...options
        };
    }

    public connect(): void {
        try {
            this.socket = io(this.options.API_URL ?? API_URL, {
                reconnection: this.options.autoReconnect,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.options.reconnectInterval,
                auth: {
                    API_KEY: this.API_KEY
                }
            });
            this.setupEventHandlers();
        } catch (error) {
            this.emit('error', error);
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public subscribe(mint: string): void {
        if (this.socket) {
            console.log('Subscribing to channel', mint);
            this.socket.emit('message', JSON.stringify({event: 'subscribe', data: mint}));
        }
    }

    public unsubscribe(mint: string): void {
        if (this.socket) {  
            console.log('Unsubscribing from channel', mint);
            this.socket.emit('message', JSON.stringify({event: 'unsubscribe', data: mint}));
        }
    }

    public history(mint: string, start: number, end: number): void {
        if (this.socket) {
            console.log('Requesting history for', mint, start, end);
            this.socket.emit('message', JSON.stringify({event: 'history', data: {mint, start, end}}));
        }
    }

    public subscribeSignal(timeframe: string, threshold: number): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: 'subscribeSignal',
                timeframe,
                threshold
            }));
        }
    }

    public unsubscribeSignal(timeframe: string): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: 'unsubscribeSignal',
                timeframe
            }));
        }
    }

    public createStrategy(name: string): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: 'createStrategy',
                name
            }));
        }
    }

    public getStrategies(): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: 'getStrategies'
            }));
        }
    }

    public getBalance(): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: 'getBalance'
            }));
        }
    }

    public executeTrade(type: 'buy' | 'sell', data: { mint: string, amountSol: number }): void {
        if (this.socket) {
            this.socket.emit('message', JSON.stringify({
                event: type,
                data
            }));
        }
    }

    public getOwnedTokens(): void {
        if (this.socket) {
            console.log('Requesting owned tokens');
            this.socket.emit('message', JSON.stringify({
                event: 'getOwnedTokens'
            }));
        }
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.reconnectAttempts = 0;
            this.emit('connected');
        });

        this.socket.on('message', (data) => {
            try {
                this.emit('message', data);
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('disconnect', () => {
            this.emit('disconnected');
        });

        this.socket.on('connect_error', (error) => {
            this.emit('error', error);
        });

        this.socket.on('signal', (data) => {
            try {
                this.emit('signal', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('strategy', (data) => {
            try {
                this.emit('strategy', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('strategies', (data) => {
            try {
                this.emit('strategies', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('balance', (data) => {
            try {
                this.emit('balance', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('transaction', (data) => {
            try {
                this.emit('transaction', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });

        this.socket.on('ownedTokens', (data) => {
            try {
                this.emit('ownedTokens', JSON.parse(data));
            } catch (error) {
                this.emit('error', error);
            }
        });
    }
} 
