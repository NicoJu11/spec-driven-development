import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CollectionResponse } from '../models/models';
import { SessionService } from './session.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly _collectedIds = signal<Set<number>>(new Set());

  readonly collectedIds = computed(() => this._collectedIds());

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {
    this.loadCollection();
  }

  private get headers() {
    return { 'X-Session-Id': this.sessionService.getSessionId() };
  }

  loadCollection(): void {
    this.http
      .get<CollectionResponse>(`${environment.apiBaseUrl}/collection`, {
        headers: this.headers,
      })
      .subscribe((res) => this._collectedIds.set(new Set(res.stickerIds)));
  }

  isCollected(stickerId: number): boolean {
    return this._collectedIds().has(stickerId);
  }

  toggle(stickerId: number): void {
    if (this.isCollected(stickerId)) {
      this.http
        .delete(`${environment.apiBaseUrl}/collection/${stickerId}`, {
          headers: this.headers,
        })
        .subscribe(() => {
          const next = new Set(this._collectedIds());
          next.delete(stickerId);
          this._collectedIds.set(next);
        });
    } else {
      this.http
        .post(`${environment.apiBaseUrl}/collection/${stickerId}`, null, {
          headers: this.headers,
        })
        .subscribe(() => {
          const next = new Set(this._collectedIds());
          next.add(stickerId);
          this._collectedIds.set(next);
        });
    }
  }
}
