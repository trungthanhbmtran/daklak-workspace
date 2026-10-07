export interface LocalCommand {
  id: string;
  instanceId: string;
  actionName: string;
  actionData?: any;
  expectedVersion?: number;
  correlationId?: string;
  idempotencyKey?: string;
  note?: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SUCCESS';
  createdAt: number;
  error?: string;
}

const QUEUE_KEY = 'workflow_local_command_queue';

export const localCommandQueue = {
  getQueue: (): LocalCommand[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (queue: LocalCommand[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  addCommand: (command: Omit<LocalCommand, 'id' | 'status' | 'createdAt'>): LocalCommand => {
    const queue = localCommandQueue.getQueue();
    const newCommand: LocalCommand = {
      ...command,
      id: Math.random().toString(36).substring(2, 10),
      status: 'PENDING',
      createdAt: Date.now(),
    };
    queue.push(newCommand);
    localCommandQueue.saveQueue(queue);
    return newCommand;
  },

  updateCommandStatus: (id: string, status: LocalCommand['status'], error?: string) => {
    const queue = localCommandQueue.getQueue();
    const commandIndex = queue.findIndex(c => c.id === id);
    if (commandIndex >= 0) {
      queue[commandIndex].status = status;
      if (error) queue[commandIndex].error = error;
      localCommandQueue.saveQueue(queue);
    }
  },

  removeCommand: (id: string) => {
    const queue = localCommandQueue.getQueue();
    const newQueue = queue.filter(c => c.id !== id);
    localCommandQueue.saveQueue(newQueue);
  },

  getPendingCommands: (instanceId?: string): LocalCommand[] => {
    const queue = localCommandQueue.getQueue();
    return queue.filter(c => 
      (c.status === 'PENDING' || c.status === 'FAILED') && 
      (!instanceId || c.instanceId === instanceId)
    );
  }
};
