import { io, Socket, SocketOptions, ManagerOptions } from 'socket.io-client';

const SOCKET_URL = process.env.SOCKET_URL;
const SOCKET_CONFIG: Partial<ManagerOptions & SocketOptions> = {
  reconnectionAttempts: 50,
};

export class RobotRedford {
  socket: Socket;
  events: any;

  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('No apiKey given');
    }
    this.socket = io(SOCKET_URL, {
      ...SOCKET_CONFIG,
      extraHeaders: { 'rr-api-key': apiKey },
    });
    this.#registerEvents();
    this.events = {};
  }

  #registerEvents(): void {
    this.socket.on('user', (payload) => {
      this.#onUser(payload);
    });
    this.socket.on('follow', (payload) => {
      this.#emit('follow', payload);
    });
    this.socket.on('subscribe', (payload) => {
      this.#emit('subscribe', payload);
    });
  }

  #onUser(payload): void {
    this.#join(payload?.username);
  }

  #join(username?: string): void {
    if (username) {
      this.socket.emit('join', username);
    }
  }

  on(event, listener) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return () => this.removeListener(event, listener);
  }

  removeListener(event, listener) {
    if (typeof this.events[event] === 'object') {
      const idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  #emit(event, ...args) {
    if (typeof this.events[event] === 'object') {
      this.events[event].forEach((listener) => listener.apply(this, args));
    }
  }

  once(event, listener) {
    const remove = this.on(event, (...args) => {
      remove();
      listener.apply(this, args);
    });
  }
}
