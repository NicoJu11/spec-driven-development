import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { Standing } from '../../models/models';
import { GroupApiService } from '../../services/group-api.service';

const GROUPS = 'ABCDEFGHIJKL'.split('');

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTabsModule, MatTableModule],
  template: `
    <h2>Grupos — FIFA Mundial 2026</h2>
    <mat-tab-group>
      <mat-tab *ngFor="let g of groups" [label]="'Grupo ' + g">
        <div class="tab-content">
          <table mat-table [dataSource]="standingsMap[g] || []" class="standings-table">
            <ng-container matColumnDef="teamCode">
              <th mat-header-cell *matHeaderCellDef>Equipo</th>
              <td mat-cell *matCellDef="let s">
                <a [routerLink]="['/teams', s.teamCode]">{{ s.teamCode }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="played"><th mat-header-cell *matHeaderCellDef>PJ</th><td mat-cell *matCellDef="let s">{{ s.played }}</td></ng-container>
            <ng-container matColumnDef="won"><th mat-header-cell *matHeaderCellDef>G</th><td mat-cell *matCellDef="let s">{{ s.won }}</td></ng-container>
            <ng-container matColumnDef="drawn"><th mat-header-cell *matHeaderCellDef>E</th><td mat-cell *matCellDef="let s">{{ s.drawn }}</td></ng-container>
            <ng-container matColumnDef="lost"><th mat-header-cell *matHeaderCellDef>P</th><td mat-cell *matCellDef="let s">{{ s.lost }}</td></ng-container>
            <ng-container matColumnDef="goalsFor"><th mat-header-cell *matHeaderCellDef>GF</th><td mat-cell *matCellDef="let s">{{ s.goalsFor }}</td></ng-container>
            <ng-container matColumnDef="goalsAgainst"><th mat-header-cell *matHeaderCellDef>GC</th><td mat-cell *matCellDef="let s">{{ s.goalsAgainst }}</td></ng-container>
            <ng-container matColumnDef="goalDifference"><th mat-header-cell *matHeaderCellDef>DG</th><td mat-cell *matCellDef="let s">{{ s.goalDifference }}</td></ng-container>
            <ng-container matColumnDef="points"><th mat-header-cell *matHeaderCellDef>Pts</th><td mat-cell *matCellDef="let s"><strong>{{ s.points }}</strong></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .tab-content { padding: 16px 0; }
    .standings-table { width: 100%; }
    a { color: #1976d2; text-decoration: none; }
  `]
})
export class GroupsComponent implements OnInit {
  groups = GROUPS;
  standingsMap: Record<string, Standing[]> = {};
  columns = ['teamCode','played','won','drawn','lost','goalsFor','goalsAgainst','goalDifference','points'];

  constructor(private groupApi: GroupApiService) {}

  ngOnInit(): void {
    this.groups.forEach(g =>
      this.groupApi.getStandings(g).subscribe(s => this.standingsMap[g] = s)
    );
  }
}
