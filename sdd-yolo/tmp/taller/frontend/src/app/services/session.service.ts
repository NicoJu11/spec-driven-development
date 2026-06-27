import { Injectable } from '@angular/core';

const SESSION_KEY = 'mundial-session-id';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private sessionId: string;

  constructor() {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      this.sessionId = stored;
    } else {
      this.sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, this.sessionId);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}
