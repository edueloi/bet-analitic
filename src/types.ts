/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamStats {
  id: number;
  name: string;
  logo: string;
  shortName: string;
  division?: 'serie_a' | 'serie_b_c' | 'feminino' | 'custom';
  country?: string;
  state?: string;
  city?: string;
  league?: string;
  isNational?: boolean;
  matchesPlayed: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgShots: number;
  avgShotsOnTarget: number;
  avgCorners: number;
  avgCornersFor: number;
  avgCornersAgainst: number;
  avgPossession: number;
  avgCardsYellow: number;
  avgCardsRed: number;
  bttsPercentage: number;
  over25Percentage: number;
  over15Percentage: number;
  over35Percentage: number;
  over05HTPercentage: number;
  cleanSheetsPercentage: number;
  avgFouls: number;
  avgOffsides: number;
  avgTackles: number;
}

export interface PlayerStats {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  position: 'Atacante' | 'Meio-campo' | 'Defensor' | 'Goleiro';
  matches: number;
  goals: number;
  assists: number;
  shotsPerGame: number;
  shotsOnTargetPerGame: number;
  cornersWonPerGame: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export interface HistoricalMatch {
  id: string;
  date: string;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  possessionHome: number; // e.g. 55 -> 55%
  possessionAway: number;
  cardsYellowHome: number;
  cardsYellowAway: number;
}

export interface LiveMatchUpdate {
  fixtureId: number;
  minute: number;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  event?: {
    type: 'GOL' | 'CARTAO' | 'ESCANTEIO' | 'FINALIZACAO';
    detail: string; // e.g. "Gol! Calleri (São Paulo)" or "Escanteio para o Palmeiras"
    teamId: number;
    player?: string;
  };
  stats: {
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    cornersHome: number;
    cornersAway: number;
    possessionHome: number;
    possessionAway: number;
    cardsYellowHome: number;
    cardsYellowAway: number;
    cardsRedHome: number;
    cardsRedAway: number;
  };
}

export interface PredictionReport {
  timestamp: string;
  homeTeam: string;
  awayTeam: string;
  overallAnalysis: string;
  bttsProbability: number; // e.g. 62 -> 62%
  over25Probability: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  predictedWinner: string;
  recommendedBets: Array<{
    market: string; // e.g. "Escanteios Mais de 9.5"
    confidence: number; // percentage from 0 to 100
    oddEstimated: number; // e.g. 1.85
    justification: string;
  }>;
  playerToWatch: {
    name: string;
    metric: string;
    reason: string;
  };
}
