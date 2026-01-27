import { EventEmitter } from 'events';

class ActiveSessionEmitter extends EventEmitter {
  notifyActiveSessionChange(userId: string) {
    this.emit('activeSessionChange', userId);
  }
}

export const activeSessionEmitter = new ActiveSessionEmitter();
