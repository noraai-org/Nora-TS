"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoWebSocketClient = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
class CryptoWebSocketClient extends events_1.EventEmitter {
    constructor(url, options = {}) {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.url = url;
        this.options = {
            autoReconnect: true,
            reconnectInterval: 5000,
            ...options
        };
    }
    connect() {
        try {
            this.ws = new ws_1.default(this.url);
            this.setupEventHandlers();
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    subscribe(channel, symbol) {
        const message = {
            type: 'subscribe',
            channel,
            symbol
        };
        this.send(message);
    }
    unsubscribe(channel, symbol) {
        const message = {
            type: 'unsubscribe',
            channel,
            symbol
        };
        this.send(message);
    }
    send(message) {
        if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            this.emit('error', new Error('WebSocket is not connected'));
        }
    }
    setupEventHandlers() {
        if (!this.ws)
            return;
        this.ws.on('open', () => {
            this.reconnectAttempts = 0;
            this.emit('connected');
        });
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.emit('message', message);
            }
            catch (error) {
                this.emit('error', error);
            }
        });
        this.ws.on('close', () => {
            this.emit('disconnected');
            if (this.options.autoReconnect) {
                this.handleReconnect();
            }
        });
        this.ws.on('error', (error) => {
            this.emit('error', error);
        });
    }
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, this.options.reconnectInterval);
        }
        else {
            this.emit('error', new Error('Max reconnection attempts reached'));
        }
    }
}
exports.CryptoWebSocketClient = CryptoWebSocketClient;
