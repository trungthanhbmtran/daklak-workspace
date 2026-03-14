import { Injectable } from '@nestjs/common';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: Date;
  read: boolean;
}

@Injectable()
export class NotificationsService {
  private store: InAppNotification[] = [];
  private idCounter = 0;

  push(userId: string | number, title: string, body: string): InAppNotification {
    const id = `n-${++this.idCounter}-${Date.now()}`;
    const n: InAppNotification = {
      id,
      userId: String(userId),
      title,
      body,
      createdAt: new Date(),
      read: false,
    };
    this.store.push(n);
    return n;
  }

  listByUser(userId: string | number): InAppNotification[] {
    const uid = String(userId);
    return this.store
      .filter((n) => n.userId === uid)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }

  markRead(id: string, userId: string | number): boolean {
    const n = this.store.find((x) => x.id === id && x.userId === String(userId));
    if (n) {
      n.read = true;
      return true;
    }
    return false;
  }
}
