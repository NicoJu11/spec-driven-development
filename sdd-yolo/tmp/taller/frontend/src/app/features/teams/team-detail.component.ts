import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Team, Sticker } from '../../models/models';
import { TeamApiService } from '../../services/team-api.service';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div *ngIf="team" class="header">
      <img [src]="team.flagPath" [alt]="team.name" class="flag" />
      <div>
        <h2>{{ team.name }} ({{ team.code }})</h2>
        <p>Grupo {{ team.groupLetter }} · {{ team.confederation }}
          <span *ngIf="isHost" class="sede-badge">🏟️ SEDE</span>
        </p>
      </div>
    </div>

    <div *ngIf="stickers.length" class="progress-bar">
      <p>Colección: {{ collected }}/{{ stickers.length }}</p>
      <mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
    </div>

    <div class="sticker-grid">
      <div *ngFor="let s of stickers"
           class="sticker-card"
           [class.collected]="collectionSvc.isCollected(s.id)"
           [class.sede]="s.type === 'SEDE'"
           (click)="collectionSvc.toggle(s.id)">
        <img [src]="s.imageUrl" [alt]="s.playerName || 'Sede'" class="sticker-img" />
        <div class="sticker-info">
          <span class="number" *ngIf="s.shirtNumber">{{ s.shirtNumber }}</span>
          <span class="name">{{ s.playerName }}</span>
          <span class="position" *ngIf="s.position">{{ s.position }}</span>
          <span class="type-badge" *ngIf="s.type === 'SEDE'">SEDE</span>
        </div>
        <div *ngIf="collectionSvc.isCollected(s.id)" class="collected-overlay">✓</div>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .flag { width: 80px; border-radius: 4px; }
    .sede-badge { background: #ff9800; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; }
    .progress-bar { margin-bottom: 24px; }
    .sticker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
    .sticker-card { position: relative; border: 2px solid #ddd; border-radius: 8px; padding: 8px; cursor: pointer; text-align: center; transition: border-color .2s; }
    .sticker-card:hover { border-color: #1976d2; }
    .sticker-card.collected { border-color: #4caf50; background: #f1f8e9; }
    .sticker-card.sede { border-color: #ff9800; }
    .sticker-img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
    .sticker-info { font-size: 11px; }
    .number { font-weight: bold; margin-right: 4px; }
    .position { color: #777; }
    .type-badge { background: #ff9800; color: white; padding: 1px 6px; border-radius: 8px; font-size: 10px; }
    .collected-overlay { position: absolute; top: 4px; right: 6px; color: #4caf50; font-size: 18px; font-weight: bold; }
  `]
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  stickers: Sticker[] = [];
  isHost = false;

  constructor(
    private route: ActivatedRoute,
    private teamApi: TeamApiService,
    readonly collectionSvc: CollectionService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code')!;
    this.teamApi.getByCode(code).subscribe(t => {
      this.team = t;
      this.isHost = ['USA', 'MEX', 'CAN'].includes(t.code);
    });
    this.teamApi.getStickers(code).subscribe(s => this.stickers = s);
  }

  get collected(): number {
    return this.stickers.filter(s => this.collectionSvc.isCollected(s.id)).length;
  }

  get progress(): number {
    return this.stickers.length ? (this.collected / this.stickers.length) * 100 : 0;
  }
}
