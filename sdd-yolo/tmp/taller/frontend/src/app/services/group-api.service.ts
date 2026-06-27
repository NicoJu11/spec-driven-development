import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Standing, Match } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GroupApiService {
  private base = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<string[]> {
    return this.http.get<string[]>(this.base);
  }

  getStandings(letter: string): Observable<Standing[]> {
    return this.http.get<Standing[]>(`${this.base}/${letter}/standings`);
  }
}
