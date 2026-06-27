export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type StickerType = 'PLAYER' | 'SEDE';
export type Phase = 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'THIRD_PLACE';

export interface Team {
  id: number;
  code: string;
  name: string;
  groupLetter: string;
  confederation: Confederation;
  flagPath: string;
}

export interface Sticker {
  id: number;
  teamCode: string;
  playerName: string | null;
  position: Position | null;
  shirtNumber: number | null;
  imageUrl: string;
  type: StickerType;
}

export interface Standing {
  teamCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Match {
  id: number;
  phase: Phase;
  homeTeamCode: string;
  awayTeamCode: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string | null;
  venue: string | null;
  winnerCode: string | null;
}

export interface CollectionResponse {
  stickerIds: number[];
  total: number;
}
