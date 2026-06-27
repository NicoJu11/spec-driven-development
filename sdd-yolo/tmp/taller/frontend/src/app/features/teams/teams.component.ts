import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Team, Confederation } from '../../models/models';
import { TeamApiService } from '../../services/team-api.service';

const CONFEDERATIONS: Confederation[] = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];
const GROUPS = 'ABCDEFGHIJKL'.split('');

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatChipsModule, MatButtonModule,
    MatInputModule, MatFormFieldModule,
  ],
  template: `
    <h2>Selecciones — FIFA Mundial 2026</h2>

    <div class="filters">
      <span class="filter-label">Confederación:</span>
      <button mat-stroked-button
        [class.active-filter]="!selectedConfederation"
        (click)="filterByConfederation(null)">Todas</button>
      <button mat-stroked-button
        *ngFor="let c of confederations"
        [class.active-filter]="selectedConfederation === c"
        (click)="filterByConfederation(c)">{{ c }}</button>
    </div>

    <div class="filters">
      <span class="filter-label">Grupo:</span>
      <button mat-stroked-button
        [class.active-filter]="!selectedGroup"
        (click)="filterByGroup(null)">Todos</button>
      <button mat-stroked-button
        *ngFor="let g of groups"
        [class.active-filter]="selectedGroup === g"
        (click)="filterByGroup(g)">{{ g }}</button>
    </div>

    <p class="count">{{ teams.length }} selecciones</p>

    <div class="team-grid">
      <mat-card *ngFor="let t of teams" class="team-card" [routerLink]="['/teams', t.code]">
        <mat-card-header>
          <img mat-card-avatar [src]="t.flagPath" [alt]="t.name" class="flag-img" />
          <mat-card-title>{{ t.code }}</mat-card-title>
          <mat-card-subtitle>{{ t.name }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Grupo {{ t.groupLetter }} · {{ t.confederation }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
    .filter-label { font-weight: 500; }
    .active-filter { background: #1976d2; color: white; }
    .count { color: #555; margin-bottom: 16px; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .team-card { cursor: pointer; }
    .team-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.2); }
    .flag-img { width: 40px; height: 28px; object-fit: cover; border-radius: 2px; }
  `]
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  confederations = CONFEDERATIONS;
  groups = GROUPS;
  selectedConfederation: Confederation | null = null;
  selectedGroup: string | null = null;

  constructor(private teamApi: TeamApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.selectedConfederation) {
      this.teamApi.getByConfederation(this.selectedConfederation).subscribe(t => this.teams = t);
    } else if (this.selectedGroup) {
      this.teamApi.getByGroup(this.selectedGroup).subscribe(t => this.teams = t);
    } else {
      this.teamApi.getAll().subscribe(t => this.teams = t);
    }
  }

  filterByConfederation(conf: Confederation | null): void {
    this.selectedConfederation = conf;
    this.selectedGroup = null;
    this.load();
  }

  filterByGroup(group: string | null): void {
    this.selectedGroup = group;
    this.selectedConfederation = null;
    this.load();
  }
}
