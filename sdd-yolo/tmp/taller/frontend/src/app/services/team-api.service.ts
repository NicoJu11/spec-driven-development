import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Team, Sticker, Confederation } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamApiService {
  private base = `${environment.apiBaseUrl}/teams`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.base);
  }

  getByGroup(group: string): Observable<Team[]> {
    return this.http.get<Team[]>(this.base, { params: { group } });
  }

  getByConfederation(confederation: Confederation): Observable<Team[]> {
    return this.http.get<Team[]>(this.base, { params: { confederation } });
  }

  getByCode(code: string): Observable<Team> {
    return this.http.get<Team>(`${this.base}/${code}`);
  }

  getStickers(code: string): Observable<Sticker[]> {
    return this.http.get<Sticker[]>(`${this.base}/${code}/stickers`);
  }
}
