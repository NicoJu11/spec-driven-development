import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Match } from '../../models/models';
import { BracketApiService } from '../../services/bracket-api.service';

const PHASE_LABELS: Record<string, string> = {
  R32: 'Dieciseisavos de Final',
  R16: 'Octavos de Final',
  QF: 'Cuartos de Final',
  SF: 'Semifinales',
  FINAL: 'Final',
  THIRD_PLACE: 'Tercer Puesto',
};
const PHASE_ORDER = ['R32','R16','QF','SF','FINAL','THIRD_PLACE'];

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  template: `
    <h2>Bracket Eliminatorio — FIFA Mundial 2026</h2>
    <div *ngFor="let phase of phases">
      <h3>{{ phaseLabel(phase) }}</h3>
      <div class="match-row">
        <mat-card *ngFor="let m of bracket[phase]" class="match-card">
          <mat-card-content>
            <div class="match">
              <span class="team" [class.winner]="m.winnerCode === m.homeTeamCode">{{ m.homeTeamCode }}</span>
              <span class="score">
                <ng-container *ngIf="m.homeScore !== null && m.awayScore !== null">
                  {{ m.homeScore }} - {{ m.awayScore }}
                </ng-container>
                <ng-container *ngIf="m.homeScore === null || m.awayScore === null">vs</ng-container>
              </span>
              <span class="team" [class.winner]="m.winnerCode === m.awayTeamCode">{{ m.awayTeamCode }}</span>
            </div>
            <p class="venue" *ngIf="m.venue">{{ m.venue }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    h3 { margin-top: 24px; color: #1976d2; }
    .match-row { display: flex; flex-wrap: wrap; gap: 12px; }
    .match-card { min-width: 200px; }
    .match { display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 16px; }
    .score { font-weight: bold; font-size: 18px; padding: 0 8px; }
    .team.winner { font-weight: bold; color: #1976d2; }
    .venue { font-size: 11px; color: #777; margin-top: 4px; text-align: center; }
  `]
})
export class BracketComponent implements OnInit {
  bracket: Record<string, Match[]> = {};
  phases: string[] = [];

  constructor(private bracketApi: BracketApiService) {}

  ngOnInit(): void {
    this.bracketApi.getFullBracket().subscribe(b => {
      this.bracket = b;
      this.phases = PHASE_ORDER.filter(p => b[p]?.length);
    });
  }

  phaseLabel(phase: string): string {
    return PHASE_LABELS[phase] ?? phase;
  }
}
