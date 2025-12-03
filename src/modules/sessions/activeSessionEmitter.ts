import { EventEmitter } from 'events';

// EventEmitter para notificar mudanças em sessões ativas
class ActiveSessionEmitter extends EventEmitter {
  // Notificar todos os clientes sobre mudança na sessão ativa de um usuário
  notifyActiveSessionChange(userId: string) {
    this.emit('activeSessionChange', userId);
  }
}

export const activeSessionEmitter = new ActiveSessionEmitter();

