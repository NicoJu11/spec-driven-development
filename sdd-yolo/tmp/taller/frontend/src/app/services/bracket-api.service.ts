import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Match } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BracketApiService {
  private base = `${environment.apiBaseUrl}/bracket`;

  constructor(private http: HttpClient) {}

  getFullBracket(): Observable<Record<string, Match[]>> {
    return this.http.get<Record<string, Match[]>>(this.base);
  }
}
