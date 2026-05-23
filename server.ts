/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ============================================================================
// SOLID REAL-WORLD SEED DATABASES (São Paulo, Corinthians, Palmeiras, etc.)
// ============================================================================

const TEAMS_DATA: any[] = [
  {
    id: 126, // São Paulo API-Football real ID
    name: "São Paulo FC",
    shortName: "SPFC",
    logo: "https://media.api-sports.io/football/teams/126.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.62,
    avgGoalsConceded: 1.05,
    avgShots: 14.8,
    avgShotsOnTarget: 5.4,
    avgCorners: 6.2,
    avgCornersFor: 6.2,
    avgCornersAgainst: 4.8,
    avgPossession: 56.4,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.12,
    bttsPercentage: 54,
    over25Percentage: 48,
    over15Percentage: 74,
    over35Percentage: 24,
    over05HTPercentage: 68,
    cleanSheetsPercentage: 34,
    avgFouls: 13.2,
    avgOffsides: 1.8,
    avgTackles: 16.5,
  },
  {
    id: 121, // Palmeiras API-Football real ID
    name: "SE Palmeiras",
    shortName: "PAL",
    logo: "https://media.api-sports.io/football/teams/121.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.84,
    avgGoalsConceded: 0.89,
    avgShots: 16.2,
    avgShotsOnTarget: 6.1,
    avgCorners: 6.9,
    avgCornersFor: 6.9,
    avgCornersAgainst: 4.1,
    avgPossession: 54.8,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.08,
    bttsPercentage: 46,
    over25Percentage: 53,
    over15Percentage: 78,
    over35Percentage: 29,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 42,
    avgFouls: 12.4,
    avgOffsides: 1.5,
    avgTackles: 17.2,
  },
  {
    id: 131, // Corinthians API-Football real ID
    name: "SC Corinthians Paulista",
    shortName: "COR",
    logo: "https://media.api-sports.io/football/teams/131.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.35,
    avgGoalsConceded: 1.21,
    avgShots: 13.5,
    avgShotsOnTarget: 4.8,
    avgCorners: 5.7,
    avgCornersFor: 5.7,
    avgCornersAgainst: 5.2,
    avgPossession: 51.2,
    avgCardsYellow: 2.6,
    avgCardsRed: 0.15,
    bttsPercentage: 58,
    over25Percentage: 44,
    over15Percentage: 70,
    over35Percentage: 20,
    over05HTPercentage: 62,
    cleanSheetsPercentage: 26,
    avgFouls: 14.5,
    avgOffsides: 2.1,
    avgTackles: 15.8,
  },
  {
    id: 97, // Flamengo API-Football ID
    name: "CR Flamengo",
    shortName: "FLA",
    logo: "https://media.api-sports.io/football/teams/97.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.76,
    avgGoalsConceded: 0.98,
    avgShots: 15.6,
    avgShotsOnTarget: 5.9,
    avgCorners: 6.5,
    avgCornersFor: 6.5,
    avgCornersAgainst: 4.3,
    avgPossession: 58.1,
    avgCardsYellow: 1.9,
    avgCardsRed: 0.05,
    bttsPercentage: 50,
    over25Percentage: 56,
    over15Percentage: 82,
    over35Percentage: 31,
    over05HTPercentage: 75,
    cleanSheetsPercentage: 38,
    avgFouls: 11.8,
    avgOffsides: 1.9,
    avgTackles: 15.2,
  },
  {
    id: 118, // Bahia API-Football ID
    name: "EC Bahia",
    shortName: "BAH",
    logo: "https://media.api-sports.io/football/teams/118.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.45,
    avgGoalsConceded: 1.32,
    avgShots: 12.9,
    avgShotsOnTarget: 4.5,
    avgCorners: 5.4,
    avgCornersFor: 5.4,
    avgCornersAgainst: 5.1,
    avgPossession: 52.8,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.10,
    bttsPercentage: 61,
    over25Percentage: 51,
    over15Percentage: 76,
    over35Percentage: 25,
    over05HTPercentage: 66,
    cleanSheetsPercentage: 24,
    avgFouls: 13.8,
    avgOffsides: 1.7,
    avgTackles: 16.1,
  },
  {
    id: 120, // Botafogo F.R.
    name: "Botafogo F.R.",
    shortName: "BOT",
    logo: "https://media.api-sports.io/football/teams/120.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.74,
    avgGoalsConceded: 1.02,
    avgShots: 15.3,
    avgShotsOnTarget: 5.7,
    avgCorners: 6.1,
    avgCornersFor: 6.1,
    avgCornersAgainst: 4.5,
    avgPossession: 53.6,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.11,
    bttsPercentage: 52,
    over25Percentage: 55,
    over15Percentage: 80,
    over35Percentage: 30,
    over05HTPercentage: 70,
    cleanSheetsPercentage: 36,
    avgFouls: 13.5,
    avgOffsides: 1.6,
    avgTackles: 16.8,
  },
  {
    id: 124, // Fluminense FC
    name: "Fluminense FC",
    shortName: "FLU",
    logo: "https://media.api-sports.io/football/teams/124.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.38,
    avgGoalsConceded: 1.18,
    avgShots: 13.2,
    avgShotsOnTarget: 4.7,
    avgCorners: 5.1,
    avgCornersFor: 5.1,
    avgCornersAgainst: 4.9,
    avgPossession: 59.2,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.13,
    bttsPercentage: 55,
    over25Percentage: 42,
    over15Percentage: 69,
    over35Percentage: 18,
    over05HTPercentage: 59,
    cleanSheetsPercentage: 29,
    avgFouls: 13.1,
    avgOffsides: 2.2,
    avgTackles: 14.9,
  },
  {
    id: 133, // Vasco da Gama
    name: "CR Vasco da Gama",
    shortName: "VAS",
    logo: "https://media.api-sports.io/football/teams/133.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.29,
    avgGoalsConceded: 1.41,
    avgShots: 12.4,
    avgShotsOnTarget: 4.2,
    avgCorners: 5.3,
    avgCornersFor: 5.3,
    avgCornersAgainst: 5.6,
    avgPossession: 47.5,
    avgCardsYellow: 2.7,
    avgCardsRed: 0.16,
    bttsPercentage: 59,
    over25Percentage: 46,
    over15Percentage: 72,
    over35Percentage: 22,
    over05HTPercentage: 63,
    cleanSheetsPercentage: 21,
    avgFouls: 14.8,
    avgOffsides: 1.9,
    avgTackles: 16.4,
  },
  {
    id: 106, // Atlético Mineiro
    name: "Clube Atlético Mineiro",
    shortName: "CAM",
    logo: "https://media.api-sports.io/football/teams/106.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.58,
    avgGoalsConceded: 1.12,
    avgShots: 14.2,
    avgShotsOnTarget: 5.2,
    avgCorners: 5.8,
    avgCornersFor: 5.8,
    avgCornersAgainst: 4.7,
    avgPossession: 55.1,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.09,
    bttsPercentage: 53,
    over25Percentage: 49,
    over15Percentage: 75,
    over35Percentage: 26,
    over05HTPercentage: 67,
    cleanSheetsPercentage: 31,
    avgFouls: 12.9,
    avgOffsides: 1.7,
    avgTackles: 15.9,
  },
  {
    id: 129, // Cruzeiro
    name: "Cruzeiro EC",
    shortName: "CRU",
    logo: "https://media.api-sports.io/football/teams/129.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.32,
    avgGoalsConceded: 1.08,
    avgShots: 13.1,
    avgShotsOnTarget: 4.6,
    avgCorners: 5.6,
    avgCornersFor: 5.6,
    avgCornersAgainst: 4.5,
    avgPossession: 52.3,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.08,
    bttsPercentage: 48,
    over25Percentage: 40,
    over15Percentage: 68,
    over35Percentage: 17,
    over05HTPercentage: 57,
    cleanSheetsPercentage: 35,
    avgFouls: 13.3,
    avgOffsides: 1.5,
    avgTackles: 16.7,
  },
  {
    id: 130, // Grêmio
    name: "Grêmio FBPA",
    shortName: "GRE",
    logo: "https://media.api-sports.io/football/teams/130.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.48,
    avgGoalsConceded: 1.36,
    avgShots: 13.4,
    avgShotsOnTarget: 4.9,
    avgCorners: 5.5,
    avgCornersFor: 5.5,
    avgCornersAgainst: 5.4,
    avgPossession: 48.9,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.12,
    bttsPercentage: 60,
    over25Percentage: 54,
    over15Percentage: 77,
    over35Percentage: 27,
    over05HTPercentage: 65,
    cleanSheetsPercentage: 23,
    avgFouls: 14.1,
    avgOffsides: 1.8,
    avgTackles: 16.2,
  },
  {
    id: 119, // Internacional
    name: "SC Internacional",
    shortName: "INT",
    logo: "https://media.api-sports.io/football/teams/119.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.50,
    avgGoalsConceded: 1.04,
    avgShots: 14.5,
    avgShotsOnTarget: 5.1,
    avgCorners: 5.9,
    avgCornersFor: 5.9,
    avgCornersAgainst: 4.6,
    avgPossession: 54.2,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.07,
    bttsPercentage: 49,
    over25Percentage: 45,
    over15Percentage: 71,
    over35Percentage: 21,
    over05HTPercentage: 60,
    cleanSheetsPercentage: 37,
    avgFouls: 12.7,
    avgOffsides: 1.6,
    avgTackles: 17.0,
  },
  {
    id: 128, // Athletico-PR
    name: "Athletico Paranaense",
    shortName: "CAP",
    logo: "https://media.api-sports.io/football/teams/128.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.42,
    avgGoalsConceded: 1.15,
    avgShots: 14.0,
    avgShotsOnTarget: 4.8,
    avgCorners: 6.0,
    avgCornersFor: 6.0,
    avgCornersAgainst: 4.8,
    avgPossession: 50.5,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.10,
    bttsPercentage: 51,
    over25Percentage: 43,
    over15Percentage: 71,
    over35Percentage: 19,
    over05HTPercentage: 61,
    cleanSheetsPercentage: 30,
    avgFouls: 13.9,
    avgOffsides: 1.4,
    avgTackles: 16.6,
  },
  {
    id: 134, // Fortaleza EC
    name: "Fortaleza EC",
    shortName: "FOR",
    logo: "https://media.api-sports.io/football/teams/134.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.54,
    avgGoalsConceded: 1.10,
    avgShots: 13.8,
    avgShotsOnTarget: 4.8,
    avgCorners: 5.8,
    avgCornersFor: 5.8,
    avgCornersAgainst: 4.9,
    avgPossession: 48.5,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.09,
    bttsPercentage: 50,
    over25Percentage: 46,
    over15Percentage: 73,
    over35Percentage: 21,
    over05HTPercentage: 63,
    cleanSheetsPercentage: 32,
    avgFouls: 14.1,
    avgOffsides: 1.6,
    avgTackles: 15.8,
  },
  {
    id: 122, // Red Bull Bragantino
    name: "Red Bull Bragantino",
    shortName: "RBB",
    logo: "https://media.api-sports.io/football/teams/122.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.40,
    avgGoalsConceded: 1.25,
    avgShots: 14.7,
    avgShotsOnTarget: 5.1,
    avgCorners: 6.4,
    avgCornersFor: 6.4,
    avgCornersAgainst: 4.7,
    avgPossession: 53.1,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.12,
    bttsPercentage: 55,
    over25Percentage: 48,
    over15Percentage: 75,
    over35Percentage: 23,
    over05HTPercentage: 65,
    cleanSheetsPercentage: 26,
    avgFouls: 13.6,
    avgOffsides: 1.8,
    avgTackles: 16.3,
  },
  {
    id: 135, // Juventude
    name: "EC Juventude",
    shortName: "JUV",
    logo: "https://media.api-sports.io/football/teams/135.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.15,
    avgGoalsConceded: 1.48,
    avgShots: 11.6,
    avgShotsOnTarget: 3.9,
    avgCorners: 4.8,
    avgCornersFor: 4.8,
    avgCornersAgainst: 6.1,
    avgPossession: 45.2,
    avgCardsYellow: 2.8,
    avgCardsRed: 0.18,
    bttsPercentage: 53,
    over25Percentage: 44,
    over15Percentage: 69,
    over35Percentage: 20,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 18,
    avgFouls: 15.3,
    avgOffsides: 1.5,
    avgTackles: 15.4,
  },
  {
    id: 138, // Criciúma EC
    name: "Criciúma EC",
    shortName: "CRI",
    logo: "https://media.api-sports.io/football/teams/138.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.22,
    avgGoalsConceded: 1.50,
    avgShots: 11.9,
    avgShotsOnTarget: 4.1,
    avgCorners: 4.9,
    avgCornersFor: 4.9,
    avgCornersAgainst: 5.9,
    avgPossession: 46.8,
    avgCardsYellow: 2.6,
    avgCardsRed: 0.15,
    bttsPercentage: 56,
    over25Percentage: 47,
    over15Percentage: 72,
    over35Percentage: 22,
    over05HTPercentage: 60,
    cleanSheetsPercentage: 20,
    avgFouls: 14.2,
    avgOffsides: 1.6,
    avgTackles: 15.9,
  },
  {
    id: 127, // Vitória
    name: "EC Vitória",
    shortName: "VIT",
    logo: "https://media.api-sports.io/football/teams/127.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.18,
    avgGoalsConceded: 1.38,
    avgShots: 12.1,
    avgShotsOnTarget: 4.0,
    avgCorners: 5.0,
    avgCornersFor: 5.0,
    avgCornersAgainst: 5.5,
    avgPossession: 46.1,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.14,
    bttsPercentage: 51,
    over25Percentage: 42,
    over15Percentage: 68,
    over35Percentage: 18,
    over05HTPercentage: 59,
    cleanSheetsPercentage: 22,
    avgFouls: 14.6,
    avgOffsides: 1.7,
    avgTackles: 16.0,
  },
  {
    id: 136, // Cuiabá EC
    name: "Cuiabá EC",
    shortName: "CUI",
    logo: "https://media.api-sports.io/football/teams/136.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.05,
    avgGoalsConceded: 1.30,
    avgShots: 11.2,
    avgShotsOnTarget: 3.7,
    avgCorners: 4.5,
    avgCornersFor: 4.5,
    avgCornersAgainst: 5.8,
    avgPossession: 44.9,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.11,
    bttsPercentage: 45,
    over25Percentage: 35,
    over15Percentage: 63,
    over35Percentage: 14,
    over05HTPercentage: 52,
    cleanSheetsPercentage: 28,
    avgFouls: 13.9,
    avgOffsides: 1.5,
    avgTackles: 15.2,
  },
  {
    id: 108, // Atlético Goianiense
    name: "Atlético Goianiense",
    shortName: "ACG",
    logo: "https://media.api-sports.io/football/teams/108.png",
    matchesPlayed: 38,
    avgGoalsScored: 0.95,
    avgGoalsConceded: 1.62,
    avgShots: 10.8,
    avgShotsOnTarget: 3.4,
    avgCorners: 4.3,
    avgCornersFor: 4.3,
    avgCornersAgainst: 6.2,
    avgPossession: 43.8,
    avgCardsYellow: 2.9,
    avgCardsRed: 0.19,
    bttsPercentage: 48,
    over25Percentage: 46,
    over15Percentage: 68,
    over35Percentage: 20,
    over05HTPercentage: 55,
    cleanSheetsPercentage: 15,
    avgFouls: 15.6,
    avgOffsides: 1.8,
    avgTackles: 14.8,
  }
];

const PLAYERS_DATA = [
  // São Paulo FC Players
  { id: 1001, name: "Lucas Moura", teamId: 126, teamName: "São Paulo FC", position: "Meio-campo", matches: 28, goals: 9, assists: 7, shotsPerGame: 2.8, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 1.4, yellowCards: 4, redCards: 0, rating: 7.42 },
  { id: 1002, name: "Jonathan Calleri", teamId: 126, teamName: "São Paulo FC", position: "Atacante", matches: 26, goals: 13, assists: 3, shotsPerGame: 3.2, shotsOnTargetPerGame: 1.5, cornersWonPerGame: 0.3, yellowCards: 6, redCards: 1, rating: 7.35 },
  { id: 1003, name: "Luciano", teamId: 126, teamName: "São Paulo FC", position: "Atacante", matches: 30, goals: 11, assists: 4, shotsPerGame: 2.5, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 0.5, yellowCards: 9, redCards: 0, rating: 7.15 },
  { id: 1004, name: "Alisson", teamId: 126, teamName: "São Paulo FC", position: "Meio-campo", matches: 32, goals: 3, assists: 5, shotsPerGame: 1.4, shotsOnTargetPerGame: 0.6, cornersWonPerGame: 1.1, yellowCards: 5, redCards: 0, rating: 7.08 },
  { id: 1005, name: "Wellington Rato", teamId: 126, teamName: "São Paulo FC", position: "Meio-campo", matches: 25, goals: 2, assists: 8, shotsPerGame: 1.9, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 2.3, yellowCards: 2, redCards: 0, rating: 7.20 },

  // SE Palmeiras Players
  { id: 2001, name: "Raphael Veiga", teamId: 121, teamName: "SE Palmeiras", position: "Meio-campo", matches: 31, goals: 12, assists: 9, shotsPerGame: 3.1, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 3.4, yellowCards: 3, redCards: 0, rating: 7.68 },
  { id: 2002, name: "Flaco López", teamId: 121, teamName: "SE Palmeiras", position: "Atacante", matches: 29, goals: 15, assists: 2, shotsPerGame: 3.4, shotsOnTargetPerGame: 1.6, cornersWonPerGame: 0.2, yellowCards: 4, redCards: 0, rating: 7.41 },
  { id: 2003, name: "Estêvão", teamId: 121, teamName: "SE Palmeiras", position: "Atacante", matches: 27, goals: 11, assists: 8, shotsPerGame: 2.9, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 1.8, yellowCards: 2, redCards: 0, rating: 7.75 },
  { id: 2004, name: "Gustavo Gómez", teamId: 121, teamName: "SE Palmeiras", position: "Defensor", matches: 33, goals: 4, assists: 1, shotsPerGame: 1.1, shotsOnTargetPerGame: 0.5, cornersWonPerGame: 0.1, yellowCards: 6, redCards: 1, rating: 7.28 },
  { id: 2005, name: "Richard Ríos", teamId: 121, teamName: "SE Palmeiras", position: "Meio-campo", matches: 28, goals: 3, assists: 4, shotsPerGame: 1.8, shotsOnTargetPerGame: 0.7, cornersWonPerGame: 0.8, yellowCards: 7, redCards: 0, rating: 7.12 },

  // SC Corinthians Players
  { id: 3001, name: "Rodrigo Garro", teamId: 131, teamName: "SC Corinthians Paulista", position: "Meio-campo", matches: 32, goals: 8, assists: 11, shotsPerGame: 2.4, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 3.8, yellowCards: 8, redCards: 0, rating: 7.62 },
  { id: 3002, name: "Yuri Alberto", teamId: 131, teamName: "SC Corinthians Paulista", position: "Atacante", matches: 30, goals: 14, assists: 4, shotsPerGame: 3.0, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 0.3, yellowCards: 5, redCards: 1, rating: 7.25 },
  { id: 3003, name: "Memphis Depay", teamId: 131, teamName: "SC Corinthians Paulista", position: "Atacante", matches: 15, goals: 7, assists: 4, shotsPerGame: 2.9, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 1.5, yellowCards: 3, redCards: 0, rating: 7.50 },
  { id: 3004, name: "Igor Coronado", teamId: 131, teamName: "SC Corinthians Paulista", position: "Meio-campo", matches: 24, goals: 3, assists: 5, shotsPerGame: 1.5, shotsOnTargetPerGame: 0.7, cornersWonPerGame: 1.9, yellowCards: 2, redCards: 0, rating: 7.18 },
  { id: 3005, name: "Fagner", teamId: 131, teamName: "SC Corinthians Paulista", position: "Defensor", matches: 28, goals: 1, assists: 6, shotsPerGame: 0.6, shotsOnTargetPerGame: 0.2, cornersWonPerGame: 0.9, yellowCards: 9, redCards: 1, rating: 7.04 },

  // CR Flamengo Players
  { id: 4001, name: "Gerson", teamId: 97, teamName: "CR Flamengo", position: "Meio-campo", matches: 30, goals: 6, assists: 8, shotsPerGame: 1.9, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 1.2, yellowCards: 4, redCards: 0, rating: 7.55 },
  { id: 4002, name: "Pedro", teamId: 97, teamName: "CR Flamengo", position: "Atacante", matches: 25, goals: 18, assists: 3, shotsPerGame: 3.6, shotsOnTargetPerGame: 1.9, cornersWonPerGame: 0.1, yellowCards: 2, redCards: 0, rating: 7.82 },
  { id: 4003, name: "Giorgian De Arrascaeta", teamId: 97, teamName: "CR Flamengo", position: "Meio-campo", matches: 26, goals: 7, assists: 9, shotsPerGame: 2.2, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 2.8, yellowCards: 3, redCards: 0, rating: 7.60 },

  // EC Bahia Players
  { id: 5001, name: "Everton Ribeiro", teamId: 118, teamName: "EC Bahia", position: "Meio-campo", matches: 32, goals: 5, assists: 7, shotsPerGame: 1.4, shotsOnTargetPerGame: 0.6, cornersWonPerGame: 1.5, yellowCards: 3, redCards: 0, rating: 7.30 },
  { id: 5002, name: "Everaldo", teamId: 118, teamName: "EC Bahia", position: "Atacante", matches: 31, goals: 10, assists: 2, shotsPerGame: 2.3, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 0.2, yellowCards: 5, redCards: 0, rating: 7.05 },

  // Botafogo F.R. Players
  { id: 6001, name: "Luiz Henrique", teamId: 120, teamName: "Botafogo F.R.", position: "Atacante", matches: 30, goals: 9, assists: 6, shotsPerGame: 2.7, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 1.1, yellowCards: 4, redCards: 0, rating: 7.45 },
  { id: 6002, name: "Thiago Almada", teamId: 120, teamName: "Botafogo F.R.", position: "Meio-campo", matches: 28, goals: 6, assists: 8, shotsPerGame: 2.2, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 2.2, yellowCards: 2, redCards: 0, rating: 7.50 },

  // Fluminense FC Players
  { id: 7001, name: "Ganso", teamId: 124, teamName: "Fluminense FC", position: "Meio-campo", matches: 31, goals: 4, assists: 9, shotsPerGame: 1.1, shotsOnTargetPerGame: 0.4, cornersWonPerGame: 0.8, yellowCards: 5, redCards: 0, rating: 7.28 },
  { id: 7002, name: "Jhon Arias", teamId: 124, teamName: "Fluminense FC", position: "Atacante", matches: 33, goals: 8, assists: 7, shotsPerGame: 2.4, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 1.9, yellowCards: 3, redCards: 0, rating: 7.42 },

  // CR Vasco da Gama Players
  { id: 8001, name: "Dimitri Payet", teamId: 133, teamName: "CR Vasco da Gama", position: "Meio-campo", matches: 26, goals: 5, assists: 10, shotsPerGame: 1.8, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 2.5, yellowCards: 4, redCards: 0, rating: 7.35 },
  { id: 8002, name: "Pablo Vegetti", teamId: 133, teamName: "CR Vasco da Gama", position: "Atacante", matches: 34, goals: 14, assists: 2, shotsPerGame: 3.5, shotsOnTargetPerGame: 1.6, cornersWonPerGame: 0.1, yellowCards: 7, redCards: 1, rating: 7.38 },

  // Clube Atlético Mineiro Players
  { id: 9001, name: "Hulk", teamId: 106, teamName: "Clube Atlético Mineiro", position: "Atacante", matches: 29, goals: 16, assists: 7, shotsPerGame: 3.8, shotsOnTargetPerGame: 1.8, cornersWonPerGame: 1.2, yellowCards: 6, redCards: 0, rating: 7.64 },
  { id: 9002, name: "Paulinho", teamId: 106, teamName: "Clube Atlético Mineiro", position: "Atacante", matches: 32, goals: 12, assists: 5, shotsPerGame: 2.9, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 0.5, yellowCards: 5, redCards: 0, rating: 7.30 },

  // Cruzeiro EC Players
  { id: 10001, name: "Matheus Pereira", teamId: 129, teamName: "Cruzeiro EC", position: "Meio-campo", matches: 33, goals: 8, assists: 12, shotsPerGame: 2.3, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 3.1, yellowCards: 5, redCards: 0, rating: 7.60 },
  { id: 10002, name: "Kaio Jorge", teamId: 129, teamName: "Cruzeiro EC", position: "Atacante", matches: 27, goals: 7, assists: 3, shotsPerGame: 2.2, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 0.2, yellowCards: 2, redCards: 0, rating: 7.08 },

  // Grêmio FBPA Players
  { id: 11001, name: "Franco Cristaldo", teamId: 130, teamName: "Grêmio FBPA", position: "Meio-campo", matches: 32, goals: 9, assists: 6, shotsPerGame: 2.1, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 2.1, yellowCards: 4, redCards: 0, rating: 7.31 },
  { id: 11002, name: "Yeferson Soteldo", teamId: 130, teamName: "Grêmio FBPA", position: "Atacante", matches: 28, goals: 6, assists: 5, shotsPerGame: 1.9, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 1.4, yellowCards: 3, redCards: 0, rating: 7.22 },

  // SC Internacional Players
  { id: 12001, name: "Alan Patrick", teamId: 119, teamName: "SC Internacional", position: "Meio-campo", matches: 27, goals: 8, assists: 9, shotsPerGame: 2.0, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 1.8, yellowCards: 3, redCards: 0, rating: 7.48 },
  { id: 12002, name: "Enner Valencia", teamId: 119, teamName: "SC Internacional", position: "Atacante", matches: 25, goals: 11, assists: 3, shotsPerGame: 3.1, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 0.2, yellowCards: 4, redCards: 1, rating: 7.25 },

  // Athletico Paranaense Players
  { id: 13001, name: "Nikão", teamId: 128, teamName: "Athletico Paranaense", position: "Meio-campo", matches: 29, goals: 5, assists: 6, shotsPerGame: 1.7, shotsOnTargetPerGame: 0.7, cornersWonPerGame: 1.5, yellowCards: 2, redCards: 0, rating: 7.12 },
  { id: 13002, name: "Gonzalo Mastriani", teamId: 128, teamName: "Athletico Paranaense", position: "Atacante", matches: 26, goals: 10, assists: 1, shotsPerGame: 2.6, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 0.3, yellowCards: 3, redCards: 0, rating: 7.18 },

  // Fortaleza EC Players
  { id: 14001, name: "Yago Pikachu", teamId: 134, teamName: "Fortaleza EC", position: "Meio-campo", matches: 34, goals: 8, assists: 6, shotsPerGame: 1.6, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 1.2, yellowCards: 4, redCards: 0, rating: 7.21 },
  { id: 14002, name: "Juan Martín Lucero", teamId: 134, teamName: "Fortaleza EC", position: "Atacante", matches: 32, goals: 13, assists: 3, shotsPerGame: 2.8, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 0.2, yellowCards: 5, redCards: 0, rating: 7.39 },

  // Red Bull Bragantino Players
  { id: 15001, name: "Helinho", teamId: 122, teamName: "Red Bull Bragantino", position: "Atacante", matches: 29, goals: 7, assists: 8, shotsPerGame: 2.5, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 1.7, yellowCards: 3, redCards: 0, rating: 7.35 },
  { id: 15002, name: "Eduardo Sasha", teamId: 122, teamName: "Red Bull Bragantino", position: "Atacante", matches: 31, goals: 9, assists: 4, shotsPerGame: 2.3, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 0.4, yellowCards: 4, redCards: 0, rating: 7.15 },

  // EC Juventude Players
  { id: 16001, name: "Nenê", teamId: 135, teamName: "EC Juventude", position: "Meio-campo", matches: 24, goals: 3, assists: 6, shotsPerGame: 1.2, shotsOnTargetPerGame: 0.5, cornersWonPerGame: 1.8, yellowCards: 5, redCards: 0, rating: 7.02 },
  { id: 16002, name: "Gilberto", teamId: 135, teamName: "EC Juventude", position: "Atacante", matches: 28, goals: 8, assists: 2, shotsPerGame: 2.1, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 0.2, yellowCards: 6, redCards: 0, rating: 6.95 },

  // Criciúma EC Players
  { id: 17001, name: "Yannick Bolasie", teamId: 138, teamName: "Criciúma EC", position: "Atacante", matches: 25, goals: 6, assists: 5, shotsPerGame: 2.0, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 0.8, yellowCards: 4, redCards: 0, rating: 7.20 },
  { id: 17002, name: "Matheusinho", teamId: 138, teamName: "Criciúma EC", position: "Meio-campo", matches: 29, goals: 5, assists: 4, shotsPerGame: 1.5, shotsOnTargetPerGame: 0.6, cornersWonPerGame: 1.2, yellowCards: 3, redCards: 0, rating: 6.98 },

  // EC Vitória Players
  { id: 18001, name: "Osvaldo", teamId: 127, teamName: "EC Vitória", position: "Atacante", matches: 27, goals: 6, assists: 7, shotsPerGame: 1.8, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 1.4, yellowCards: 2, redCards: 0, rating: 7.10 },
  { id: 18002, name: "Alerrandro", teamId: 127, teamName: "EC Vitória", position: "Atacante", matches: 30, goals: 9, assists: 2, shotsPerGame: 2.2, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 0.1, yellowCards: 4, redCards: 0, rating: 7.04 },

  // Cuiabá EC Players
  { id: 19001, name: "Isidro Pitta", teamId: 136, teamName: "Cuiabá EC", position: "Atacante", matches: 32, goals: 10, assists: 3, shotsPerGame: 2.4, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 0.3, yellowCards: 5, redCards: 0, rating: 7.14 },
  { id: 19002, name: "Clayson", teamId: 136, teamName: "Cuiabá EC", position: "Atacante", matches: 29, goals: 5, assists: 4, shotsPerGame: 1.7, shotsOnTargetPerGame: 0.7, cornersWonPerGame: 1.1, yellowCards: 4, redCards: 0, rating: 6.90 },

  // Atlético Goianiense Players
  { id: 20001, name: "Shaylon", teamId: 108, teamName: "Atlético Goianiense", position: "Meio-campo", matches: 33, goals: 6, assists: 8, shotsPerGame: 1.6, shotsOnTargetPerGame: 0.7, cornersWonPerGame: 2.1, yellowCards: 3, redCards: 0, rating: 7.15 },
  { id: 20002, name: "Luiz Fernando", teamId: 108, teamName: "Atlético Goianiense", position: "Atacante", matches: 31, goals: 8, assists: 2, shotsPerGame: 2.1, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 0.9, yellowCards: 5, redCards: 1, rating: 7.02 }
];

const HISTORICAL_MATCHES = [
  // São Paulo x Corinthians (Majestoso)
  { id: "h1", date: "2026-03-10", homeTeamId: 126, homeTeamName: "São Paulo FC", awayTeamId: 131, awayTeamName: "SC Corinthians Paulista", homeScore: 2, awayScore: 1, shotsHome: 16, shotsAway: 12, shotsOnTargetHome: 7, shotsOnTargetAway: 4, cornersHome: 8, cornersAway: 5, possessionHome: 58, possessionAway: 42, cardsYellowHome: 3, cardsYellowAway: 4 },
  { id: "h2", date: "2025-09-22", homeTeamId: 131, homeTeamName: "SC Corinthians Paulista", awayTeamId: 126, awayTeamName: "São Paulo FC", homeScore: 1, awayScore: 1, shotsHome: 11, shotsAway: 14, shotsOnTargetHome: 4, shotsOnTargetAway: 5, cornersHome: 4, cornersAway: 7, possessionHome: 48, possessionAway: 52, cardsYellowHome: 4, cardsYellowAway: 2 },
  { id: "h3", date: "2025-05-14", homeTeamId: 126, homeTeamName: "São Paulo FC", awayTeamId: 131, awayTeamName: "SC Corinthians Paulista", homeScore: 1, awayScore: 0, shotsHome: 18, shotsAway: 9, shotsOnTargetHome: 6, shotsOnTargetAway: 2, cornersHome: 9, cornersAway: 3, possessionHome: 61, possessionAway: 39, cardsYellowHome: 2, cardsYellowAway: 5 },
  { id: "h4", date: "2024-10-05", homeTeamId: 131, homeTeamName: "SC Corinthians Paulista", awayTeamId: 126, awayTeamName: "São Paulo FC", homeScore: 2, awayScore: 2, shotsHome: 14, shotsAway: 13, shotsOnTargetHome: 5, shotsOnTargetAway: 6, cornersHome: 5, cornersAway: 6, possessionHome: 51, possessionAway: 49, cardsYellowHome: 5, cardsYellowAway: 4 },

  // Palmeiras x Corinthians (Derby Paulista)
  { id: "h5", date: "2026-04-12", homeTeamId: 121, homeTeamName: "SE Palmeiras", awayTeamId: 131, awayTeamName: "SC Corinthians Paulista", homeScore: 3, awayScore: 1, shotsHome: 19, shotsAway: 10, shotsOnTargetHome: 8, shotsOnTargetAway: 3, cornersHome: 9, cornersAway: 4, possessionHome: 56, possessionAway: 44, cardsYellowHome: 2, cardsYellowAway: 5 },
  { id: "h6", date: "2025-11-03", homeTeamId: 131, homeTeamName: "SC Corinthians Paulista", awayTeamId: 121, awayTeamName: "SE Palmeiras", homeScore: 2, awayScore: 2, shotsHome: 13, shotsAway: 17, shotsOnTargetHome: 5, shotsOnTargetAway: 7, cornersHome: 3, cornersAway: 8, possessionHome: 45, possessionAway: 55, cardsYellowHome: 4, cardsYellowAway: 3 },
  { id: "h7", date: "2025-07-20", homeTeamId: 121, homeTeamName: "SE Palmeiras", awayTeamId: 131, awayTeamName: "SC Corinthians Paulista", homeScore: 1, awayScore: 0, shotsHome: 15, shotsAway: 8, shotsOnTargetHome: 5, shotsOnTargetAway: 2, cornersHome: 7, cornersAway: 3, possessionHome: 53, possessionAway: 47, cardsYellowHome: 3, cardsYellowAway: 4 },

  // Palmeiras x São Paulo (Choque-Rei)
  { id: "h8", date: "2026-02-15", homeTeamId: 126, homeTeamName: "São Paulo FC", awayTeamId: 121, awayTeamName: "SE Palmeiras", homeScore: 1, awayScore: 2, shotsHome: 13, shotsAway: 15, shotsOnTargetHome: 4, shotsOnTargetAway: 6, cornersHome: 5, cornersAway: 7, possessionHome: 50, possessionAway: 50, cardsYellowHome: 4, cardsYellowAway: 3 },
  { id: "h9", date: "2025-10-18", homeTeamId: 121, homeTeamName: "SE Palmeiras", awayTeamId: 126, awayTeamName: "São Paulo FC", homeScore: 2, awayScore: 0, shotsHome: 17, shotsAway: 11, shotsOnTargetHome: 7, shotsOnTargetAway: 3, cornersHome: 8, cornersAway: 4, possessionHome: 54, possessionAway: 46, cardsYellowHome: 2, cardsYellowAway: 3 },
  { id: "h10", date: "2025-06-08", homeTeamId: 126, homeTeamName: "São Paulo FC", awayTeamId: 121, awayTeamName: "SE Palmeiras", homeScore: 1, awayScore: 1, shotsHome: 12, shotsAway: 14, shotsOnTargetHome: 5, shotsOnTargetAway: 5, cornersHome: 6, cornersAway: 5, possessionHome: 52, possessionAway: 48, cardsYellowHome: 3, cardsYellowAway: 3 },

  // Outros clássicos / jogos importantes
  { id: "h11", date: "2026-05-01", homeTeamId: 97, homeTeamName: "CR Flamengo", awayTeamId: 126, awayTeamName: "São Paulo FC", homeScore: 2, awayScore: 1, shotsHome: 18, shotsAway: 12, shotsOnTargetHome: 7, shotsOnTargetAway: 4, cornersHome: 7, cornersAway: 5, possessionHome: 57, possessionAway: 43, cardsYellowHome: 2, cardsYellowAway: 3 },
  { id: "h12", date: "2026-04-25", homeTeamId: 121, homeTeamName: "SE Palmeiras", awayTeamId: 97, awayTeamName: "CR Flamengo", homeScore: 2, awayScore: 2, shotsHome: 15, shotsAway: 14, shotsOnTargetHome: 5, shotsOnTargetAway: 5, cornersHome: 8, cornersAway: 6, possessionHome: 51, possessionAway: 49, cardsYellowHome: 3, cardsYellowAway: 2 }
];

// Active live stream state (Simulating realtime match updates)
let activeLiveFixture: any | null = null;
let liveInterval: NodeJS.Timeout | null = null;
const alertSubscribers: Array<{
  id: string;
  fixtureId: number;
  metricType: 'GOL' | 'CARTAO' | 'ESCANTEIO' | 'FINALIZACAO';
  thresholdValue?: number;
  triggered: boolean;
  message: string;
}> = [];

// Helper to start the live simulator
function startLiveSimulator() {
  if (liveInterval) return;

  // Let's configure a live match between São Paulo & Palmeiras (Choque-Rei) or standard high-drama match
  activeLiveFixture = {
    fixtureId: 98765,
    minute: 0,
    homeTeam: "São Paulo FC",
    awayTeam: "SE Palmeiras",
    homeLogo: "https://media.api-sports.io/football/teams/126.png",
    awayLogo: "https://media.api-sports.io/football/teams/121.png",
    homeScore: 0,
    awayScore: 0,
    stats: {
      shotsHome: 0,
      shotsAway: 0,
      shotsOnTargetHome: 0,
      shotsOnTargetAway: 0,
      cornersHome: 0,
      cornersAway: 0,
      possessionHome: 50,
      possessionAway: 50,
      cardsYellowHome: 0,
      cardsYellowAway: 0,
      cardsRedHome: 0,
      cardsRedAway: 0,
    },
    event: {
      type: 'FINALIZACAO',
      detail: "Partida iniciada! Clássico Choque-Rei ferve no MorumBIS.",
      teamId: 126
    }
  };

  liveInterval = setInterval(() => {
    if (!activeLiveFixture) return;

    activeLiveFixture.minute += 1;

    // Reset periodic event
    activeLiveFixture.event = undefined;

    // Every 5-6 Simulated minutes, trigger stats updates or goals
    const min = activeLiveFixture.minute;
    if (min >= 90) {
      // Loop simulator or stop
      activeLiveFixture.minute = 0;
      activeLiveFixture.homeScore = 0;
      activeLiveFixture.awayScore = 0;
      activeLiveFixture.stats = {
        shotsHome: 0,
        shotsAway: 0,
        shotsOnTargetHome: 0,
        shotsOnTargetAway: 0,
        cornersHome: 0,
        cornersAway: 0,
        possessionHome: 50,
        possessionAway: 50,
        cardsYellowHome: 0,
        cardsYellowAway: 0,
        cardsRedHome: 0,
        cardsRedAway: 0,
      };
      activeLiveFixture.event = {
        type: 'FINALIZACAO',
        detail: "Simulador reiniciado para o primeiro tempo!",
        teamId: 126
      };
      return;
    }

    // Possession slight oscillation
    const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const currentHP = activeLiveFixture.stats.possessionHome;
    activeLiveFixture.stats.possessionHome = Math.min(75, Math.max(25, currentHP + offset));
    activeLiveFixture.stats.possessionAway = 100 - activeLiveFixture.stats.possessionHome;

    const roll = Math.random();

    if (roll < 0.08) {
      // Corner won!
      const teamId = Math.random() > 0.48 ? 126 : 121;
      const teamName = teamId === 126 ? "São Paulo FC" : "SE Palmeiras";
      if (teamId === 126) activeLiveFixture.stats.cornersHome += 1;
      else activeLiveFixture.stats.cornersAway += 1;

      activeLiveFixture.event = {
        type: 'ESCANTEIO',
        detail: `Escanteio cobrado para o ${teamName}!`,
        teamId
      };

      // Check subscribers for Escanteios alerts
      triggerAlerts('ESCANTEIO', teamId, activeLiveFixture.stats.cornersHome + activeLiveFixture.stats.cornersAway, `Soma de escanteios atingiu ${activeLiveFixture.stats.cornersHome + activeLiveFixture.stats.cornersAway}`);
    } else if (roll >= 0.08 && roll < 0.16) {
      // Shot / Finalização
      const teamId = Math.random() > 0.45 ? 126 : 121;
      const teamName = teamId === 126 ? "São Paulo FC" : "SE Palmeiras";
      const onTarget = Math.random() > 0.6;
      
      if (teamId === 126) {
        activeLiveFixture.stats.shotsHome += 1;
        if (onTarget) activeLiveFixture.stats.shotsOnTargetHome += 1;
      } else {
        activeLiveFixture.stats.shotsAway += 1;
        if (onTarget) activeLiveFixture.stats.shotsOnTargetAway += 1;
      }

      const playerOptions = teamId === 126 ? ["Calleri", "Lucas Moura", "Luciano"] : ["Flaco López", "Raphael Veiga", "Estêvão"];
      const player = playerOptions[Math.floor(Math.random() * playerOptions.length)];

      activeLiveFixture.event = {
        type: 'FINALIZACAO',
        detail: `Finalização de ${player} (${teamName}) ${onTarget ? 'no ALVO!' : 'para fora!'}`,
        teamId,
        player
      };

      if (onTarget) {
        triggerAlerts('FINALIZACAO', teamId, 1, `Chute no alvo de ${player} (${teamName})`);
      }
    } else if (roll >= 0.16 && roll < 0.20) {
      // Card
      const teamId = Math.random() > 0.5 ? 126 : 121;
      const teamName = teamId === 126 ? "São Paulo FC" : "SE Palmeiras";
      
      const isRed = Math.random() > 0.92;
      if (teamId === 126) {
        if (isRed) activeLiveFixture.stats.cardsRedHome += 1;
        else activeLiveFixture.stats.cardsYellowHome += 1;
      } else {
        if (isRed) activeLiveFixture.stats.cardsRedAway += 1;
        else activeLiveFixture.stats.cardsYellowAway += 1;
      }

      const playerOptions = teamId === 126 ? ["Wellington", "Arboleda", "Alisson"] : ["Gustavo Gómez", "Richard Ríos", "Murilo"];
      const player = playerOptions[Math.floor(Math.random() * playerOptions.length)];

      activeLiveFixture.event = {
        type: 'CARTAO',
        detail: `Cartão ${isRed ? 'VERMELHO' : 'Amarelo'} para ${player} (${teamName})!`,
        teamId,
        player
      };

      triggerAlerts('CARTAO', teamId, 1, `Cartão para ${player} (${teamName})`);
    } else if (roll >= 0.20 && roll < 0.23) {
      // Goal!
      const teamId = Math.random() > 0.52 ? 126 : 121;
      const teamName = teamId === 126 ? "São Paulo FC" : "SE Palmeiras";
      
      if (teamId === 126) activeLiveFixture.homeScore += 1;
      else activeLiveFixture.awayScore += 1;

      const playerOptions = teamId === 126 ? ["Jonathan Calleri", "Lucas Moura", "Luciano"] : ["Flaco López", "Raphael Veiga", "Estêvão"];
      const player = playerOptions[Math.floor(Math.random() * playerOptions.length)];

      activeLiveFixture.event = {
        type: 'GOL',
        detail: `GOOOOL do ${teamName}! Marca ${player}! Placar: SPFC ${activeLiveFixture.homeScore} x ${activeLiveFixture.awayScore} PAL`,
        teamId,
        player
      };

      triggerAlerts('GOL', teamId, activeLiveFixture.homeScore + activeLiveFixture.awayScore, `Gol do ${teamName}! Placar: SPFC ${activeLiveFixture.homeScore} x ${activeLiveFixture.awayScore} PAL`);
    }
  }, 4000); // speedy simulator of 1 simulated minute every 4 seconds!
}

// Function to trigger Alerts for subscribers in real-time
function triggerAlerts(type: 'GOL' | 'CARTAO' | 'ESCANTEIO' | 'FINALIZACAO', teamId: number, currentMetricValue: number, alertDetail: string) {
  alertSubscribers.forEach(sub => {
    if (sub.fixtureId === 98765 && sub.metricType === type && !sub.triggered) {
      if (sub.thresholdValue === undefined || currentMetricValue >= sub.thresholdValue) {
        sub.triggered = true;
        sub.message = `[ALERTA DETECTADO] ${alertDetail}`;
      }
    }
  });
}

// Ensure simulator is started
startLiveSimulator();

// ============================================================================
// DATABASE SEED ENRICHMENT & CLASSIFICATION OVERRIDE
// ============================================================================

// 1. Tag all existing teams (Série A) with the proper division field
TEAMS_DATA.forEach(t => {
  (t as any).division = 'serie_a';
});

// 2. Expand database with a complete list of Série B & C Teams
const EXTRA_SERIE_B_C_TEAMS = [
  {
    id: 132,
    name: "Santos FC",
    shortName: "SAN",
    logo: "https://media.api-sports.io/football/teams/132.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.62,
    avgGoalsConceded: 0.88,
    avgShots: 14.8,
    avgShotsOnTarget: 5.4,
    avgCorners: 10.4,
    avgCornersFor: 6.3,
    avgCornersAgainst: 4.1,
    avgPossession: 56.4,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.08,
    bttsPercentage: 42,
    over25Percentage: 50,
    over15Percentage: 76,
    over35Percentage: 22,
    over05HTPercentage: 68,
    cleanSheetsPercentage: 45,
    avgFouls: 12.5,
    avgOffsides: 1.6,
    avgTackles: 16.8,
  },
  {
    id: 137,
    name: "Sport Recife",
    shortName: "SPO",
    logo: "https://media.api-sports.io/football/teams/137.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.55,
    avgGoalsConceded: 1.12,
    avgShots: 13.9,
    avgShotsOnTarget: 4.8,
    avgCorners: 10.9,
    avgCornersFor: 6.1,
    avgCornersAgainst: 4.8,
    avgPossession: 53.2,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.10,
    bttsPercentage: 52,
    over25Percentage: 51,
    over15Percentage: 78,
    over35Percentage: 24,
    over05HTPercentage: 66,
    cleanSheetsPercentage: 32,
    avgFouls: 13.4,
    avgOffsides: 1.4,
    avgTackles: 15.6,
  },
  {
    id: 142,
    name: "Ceará SC",
    shortName: "CEA",
    logo: "https://media.api-sports.io/football/teams/142.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.48,
    avgGoalsConceded: 1.22,
    avgShots: 13.5,
    avgShotsOnTarget: 4.6,
    avgCorners: 11.0,
    avgCornersFor: 5.8,
    avgCornersAgainst: 5.2,
    avgPossession: 51.5,
    avgCardsYellow: 2.6,
    avgCardsRed: 0.14,
    bttsPercentage: 54,
    over25Percentage: 49,
    over15Percentage: 75,
    over35Percentage: 21,
    over05HTPercentage: 63,
    cleanSheetsPercentage: 28,
    avgFouls: 14.2,
    avgOffsides: 1.7,
    avgTackles: 16.1,
  },
  {
    id: 143,
    name: "Goiás EC",
    shortName: "GOI",
    logo: "https://media.api-sports.io/football/teams/143.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.28,
    avgGoalsConceded: 1.05,
    avgShots: 12.6,
    avgShotsOnTarget: 4.1,
    avgCorners: 10.2,
    avgCornersFor: 5.5,
    avgCornersAgainst: 4.7,
    avgPossession: 49.1,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.11,
    bttsPercentage: 44,
    over25Percentage: 40,
    over15Percentage: 68,
    over35Percentage: 16,
    over05HTPercentage: 55,
    cleanSheetsPercentage: 38,
    avgFouls: 14.7,
    avgOffsides: 1.3,
    avgTackles: 16.5,
  },
  {
    id: 144,
    name: "Coritiba FC",
    shortName: "COR",
    logo: "https://media.api-sports.io/football/teams/144.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.35,
    avgGoalsConceded: 1.18,
    avgShots: 13.0,
    avgShotsOnTarget: 4.3,
    avgCorners: 10.6,
    avgCornersFor: 5.6,
    avgCornersAgainst: 5.0,
    avgPossession: 51.0,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.09,
    bttsPercentage: 48,
    over25Percentage: 44,
    over15Percentage: 71,
    over35Percentage: 19,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 32,
    avgFouls: 13.9,
    avgOffsides: 1.5,
    avgTackles: 16.0,
  },
  {
    id: 145,
    name: "América Mineiro",
    shortName: "AME",
    logo: "https://media.api-sports.io/football/teams/145.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.40,
    avgGoalsConceded: 1.14,
    avgShots: 13.2,
    avgShotsOnTarget: 4.5,
    avgCorners: 10.3,
    avgCornersFor: 5.5,
    avgCornersAgainst: 4.8,
    avgPossession: 52.5,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.07,
    bttsPercentage: 46,
    over25Percentage: 45,
    over15Percentage: 70,
    over35Percentage: 20,
    over05HTPercentage: 60,
    cleanSheetsPercentage: 34,
    avgFouls: 13.1,
    avgOffsides: 1.4,
    avgTackles: 15.8,
  },
  {
    id: 146,
    name: "Avaí FC",
    shortName: "AVA",
    logo: "https://media.api-sports.io/football/teams/146.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.15,
    avgGoalsConceded: 1.22,
    avgShots: 11.9,
    avgShotsOnTarget: 3.8,
    avgCorners: 10.0,
    avgCornersFor: 4.9,
    avgCornersAgainst: 5.1,
    avgPossession: 48.0,
    avgCardsYellow: 2.8,
    avgCardsRed: 0.15,
    bttsPercentage: 50,
    over25Percentage: 38,
    over15Percentage: 65,
    over35Percentage: 15,
    over05HTPercentage: 52,
    cleanSheetsPercentage: 27,
    avgFouls: 15.1,
    avgOffsides: 1.6,
    avgTackles: 16.4,
  },
  {
    id: 147,
    name: "Guarani FC",
    shortName: "GUA",
    logo: "https://media.api-sports.io/football/teams/147.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.08,
    avgGoalsConceded: 1.32,
    avgShots: 11.5,
    avgShotsOnTarget: 3.6,
    avgCorners: 9.8,
    avgCornersFor: 4.6,
    avgCornersAgainst: 5.2,
    avgPossession: 46.8,
    avgCardsYellow: 2.9,
    avgCardsRed: 0.16,
    bttsPercentage: 48,
    over25Percentage: 35,
    over15Percentage: 62,
    over35Percentage: 14,
    over05HTPercentage: 50,
    cleanSheetsPercentage: 22,
    avgFouls: 15.3,
    avgOffsides: 1.5,
    avgTackles: 15.2,
  },
  {
    id: 148,
    name: "Ponte Preta",
    shortName: "AAPP",
    logo: "https://media.api-sports.io/football/teams/148.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.10,
    avgGoalsConceded: 1.28,
    avgShots: 11.8,
    avgShotsOnTarget: 3.7,
    avgCorners: 10.1,
    avgCornersFor: 4.8,
    avgCornersAgainst: 5.3,
    avgPossession: 47.2,
    avgCardsYellow: 2.7,
    avgCardsRed: 0.14,
    bttsPercentage: 49,
    over25Percentage: 38,
    over15Percentage: 64,
    over35Percentage: 16,
    over05HTPercentage: 53,
    cleanSheetsPercentage: 24,
    avgFouls: 14.9,
    avgOffsides: 1.6,
    avgTackles: 15.9,
  },
  {
    id: 149,
    name: "Paysandu SC",
    shortName: "PAY",
    logo: "https://media.api-sports.io/football/teams/149.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.22,
    avgGoalsConceded: 1.24,
    avgShots: 12.1,
    avgShotsOnTarget: 3.9,
    avgCorners: 10.5,
    avgCornersFor: 5.1,
    avgCornersAgainst: 5.4,
    avgPossession: 48.9,
    avgCardsYellow: 2.6,
    avgCardsRed: 0.12,
    bttsPercentage: 51,
    over25Percentage: 42,
    over15Percentage: 68,
    over35Percentage: 18,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 25,
    avgFouls: 14.1,
    avgOffsides: 1.7,
    avgTackles: 15.5,
  },
  {
    id: 150,
    name: "Chapecoense",
    shortName: "CHA",
    logo: "https://media.api-sports.io/football/teams/150.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.18,
    avgGoalsConceded: 1.26,
    avgShots: 12.0,
    avgShotsOnTarget: 3.8,
    avgCorners: 10.3,
    avgCornersFor: 5.0,
    avgCornersAgainst: 5.3,
    avgPossession: 48.1,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.11,
    bttsPercentage: 48,
    over25Percentage: 39,
    over15Percentage: 66,
    over35Percentage: 16,
    over05HTPercentage: 54,
    cleanSheetsPercentage: 26,
    avgFouls: 13.8,
    avgOffsides: 1.5,
    avgTackles: 15.8,
  },
  {
    id: 151,
    name: "Vila Nova FC",
    shortName: "VIL",
    logo: "https://media.api-sports.io/football/teams/151.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.29,
    avgGoalsConceded: 1.20,
    avgShots: 12.4,
    avgShotsOnTarget: 4.0,
    avgCorners: 10.4,
    avgCornersFor: 5.3,
    avgCornersAgainst: 5.1,
    avgPossession: 49.8,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.10,
    bttsPercentage: 50,
    over25Percentage: 43,
    over15Percentage: 70,
    over35Percentage: 19,
    over05HTPercentage: 59,
    cleanSheetsPercentage: 28,
    avgFouls: 13.5,
    avgOffsides: 1.4,
    avgTackles: 15.4,
  },
  {
    id: 152,
    name: "Gavião Novorizontino",
    shortName: "NOV",
    logo: "https://media.api-sports.io/football/teams/135.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.34,
    avgGoalsConceded: 1.02,
    avgShots: 12.5,
    avgShotsOnTarget: 4.2,
    avgCorners: 10.2,
    avgCornersFor: 5.4,
    avgCornersAgainst: 4.8,
    avgPossession: 48.5,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.08,
    bttsPercentage: 42,
    over25Percentage: 40,
    over15Percentage: 71,
    over35Percentage: 17,
    over05HTPercentage: 55,
    cleanSheetsPercentage: 41,
    avgFouls: 13.1,
    avgOffsides: 1.3,
    avgTackles: 16.2,
  },
  {
    id: 153,
    name: "Mirassol FC",
    shortName: "MIR",
    logo: "https://media.api-sports.io/football/teams/127.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.31,
    avgGoalsConceded: 1.04,
    avgShots: 12.9,
    avgShotsOnTarget: 4.4,
    avgCorners: 10.7,
    avgCornersFor: 5.8,
    avgCornersAgainst: 4.9,
    avgPossession: 51.2,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.09,
    bttsPercentage: 45,
    over25Percentage: 43,
    over15Percentage: 74,
    over35Percentage: 19,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 36,
    avgFouls: 12.9,
    avgOffsides: 1.5,
    avgTackles: 15.8,
  },
  {
    id: 154,
    name: "Operário Ferroviário",
    shortName: "OPE",
    logo: "https://media.api-sports.io/football/teams/138.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.02,
    avgGoalsConceded: 0.95,
    avgShots: 11.2,
    avgShotsOnTarget: 3.4,
    avgCorners: 9.5,
    avgCornersFor: 4.8,
    avgCornersAgainst: 4.7,
    avgPossession: 47.9,
    avgCardsYellow: 2.8,
    avgCardsRed: 0.12,
    bttsPercentage: 35,
    over25Percentage: 26,
    over15Percentage: 55,
    over35Percentage: 10,
    over05HTPercentage: 43,
    cleanSheetsPercentage: 44,
    avgFouls: 14.8,
    avgOffsides: 1.6,
    avgTackles: 16.5,
  },
  {
    id: 155,
    name: "Brusque FC",
    shortName: "BRU",
    logo: "https://media.api-sports.io/football/teams/122.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 0.88,
    avgGoalsConceded: 1.15,
    avgShots: 10.5,
    avgShotsOnTarget: 3.1,
    avgCorners: 9.3,
    avgCornersFor: 4.5,
    avgCornersAgainst: 4.8,
    avgPossession: 46.2,
    avgCardsYellow: 2.9,
    avgCardsRed: 0.14,
    bttsPercentage: 38,
    over25Percentage: 24,
    over15Percentage: 58,
    over35Percentage: 9,
    over05HTPercentage: 41,
    cleanSheetsPercentage: 31,
    avgFouls: 15.6,
    avgOffsides: 1.4,
    avgTackles: 15.1,
  },
  {
    id: 156,
    name: "CRB Alagoas",
    shortName: "CRB",
    logo: "https://media.api-sports.io/football/teams/118.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.18,
    avgGoalsConceded: 1.28,
    avgShots: 11.8,
    avgShotsOnTarget: 3.8,
    avgCorners: 9.8,
    avgCornersFor: 4.9,
    avgCornersAgainst: 4.9,
    avgPossession: 49.0,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.11,
    bttsPercentage: 49,
    over25Percentage: 37,
    over15Percentage: 66,
    over35Percentage: 15,
    over05HTPercentage: 52,
    cleanSheetsPercentage: 26,
    avgFouls: 14.0,
    avgOffsides: 1.5,
    avgTackles: 15.4,
  },
  {
    id: 157,
    name: "Ituano FC",
    shortName: "ITU",
    logo: "https://media.api-sports.io/football/teams/124.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.05,
    avgGoalsConceded: 1.48,
    avgShots: 11.0,
    avgShotsOnTarget: 3.5,
    avgCorners: 9.4,
    avgCornersFor: 4.4,
    avgCornersAgainst: 5.0,
    avgPossession: 45.8,
    avgCardsYellow: 2.7,
    avgCardsRed: 0.15,
    bttsPercentage: 48,
    over25Percentage: 45,
    over15Percentage: 68,
    over35Percentage: 19,
    over05HTPercentage: 54,
    cleanSheetsPercentage: 20,
    avgFouls: 15.1,
    avgOffsides: 1.3,
    avgTackles: 14.9,
  },
  {
    id: 158,
    name: "Amazonas FC",
    shortName: "AMA",
    logo: "https://media.api-sports.io/football/teams/119.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.12,
    avgGoalsConceded: 1.16,
    avgShots: 11.5,
    avgShotsOnTarget: 3.7,
    avgCorners: 9.6,
    avgCornersFor: 4.7,
    avgCornersAgainst: 4.9,
    avgPossession: 47.5,
    avgCardsYellow: 2.6,
    avgCardsRed: 0.12,
    bttsPercentage: 44,
    over25Percentage: 35,
    over15Percentage: 62,
    over35Percentage: 14,
    over05HTPercentage: 48,
    cleanSheetsPercentage: 30,
    avgFouls: 13.9,
    avgOffsides: 1.5,
    avgTackles: 15.6,
  },
  {
    id: 159,
    name: "Botafogo-SP",
    shortName: "BSB",
    logo: "https://media.api-sports.io/football/teams/120.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 0.98,
    avgGoalsConceded: 1.25,
    avgShots: 11.1,
    avgShotsOnTarget: 3.4,
    avgCorners: 9.5,
    avgCornersFor: 4.5,
    avgCornersAgainst: 5.0,
    avgPossession: 46.5,
    avgCardsYellow: 2.8,
    avgCardsRed: 0.13,
    bttsPercentage: 41,
    over25Percentage: 32,
    over15Percentage: 60,
    over35Percentage: 12,
    over05HTPercentage: 46,
    cleanSheetsPercentage: 28,
    avgFouls: 14.6,
    avgOffsides: 1.4,
    avgTackles: 15.2,
  },
  {
    id: 160,
    name: "Clube do Remo",
    shortName: "REM",
    logo: "https://media.api-sports.io/football/teams/122.png",
    division: "serie_b_c",
    matchesPlayed: 38,
    avgGoalsScored: 1.21,
    avgGoalsConceded: 1.18,
    avgShots: 12.0,
    avgShotsOnTarget: 3.8,
    avgCorners: 10.3,
    avgCornersFor: 5.2,
    avgCornersAgainst: 5.1,
    avgPossession: 49.1,
    avgCardsYellow: 2.7,
    avgCardsRed: 0.13,
    bttsPercentage: 50,
    over25Percentage: 42,
    over15Percentage: 68,
    over35Percentage: 18,
    over05HTPercentage: 55,
    cleanSheetsPercentage: 28,
    avgFouls: 14.5,
    avgOffsides: 1.6,
    avgTackles: 16.0,
  }
];

const EXTRA_FEMININO_TEAMS = [
  {
    id: 901,
    name: "Corinthians Feminino",
    shortName: "COR-F",
    logo: "https://media.api-sports.io/football/teams/131.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 2.85,
    avgGoalsConceded: 0.65,
    avgShots: 17.8,
    avgShotsOnTarget: 7.9,
    avgCorners: 10.0,
    avgCornersFor: 7.2,
    avgCornersAgainst: 2.8,
    avgPossession: 64.2,
    avgCardsYellow: 1.5,
    avgCardsRed: 0.04,
    bttsPercentage: 35,
    over25Percentage: 75,
    over15Percentage: 92,
    over35Percentage: 48,
    over05HTPercentage: 82,
    cleanSheetsPercentage: 60,
    avgFouls: 10.2,
    avgOffsides: 2.1,
    avgTackles: 17.5,
  },
  {
    id: 902,
    name: "Ferroviária Feminino",
    shortName: "FER-F",
    logo: "https://media.api-sports.io/football/teams/124.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.95,
    avgGoalsConceded: 0.90,
    avgShots: 14.5,
    avgShotsOnTarget: 5.8,
    avgCorners: 10.0,
    avgCornersFor: 6.1,
    avgCornersAgainst: 3.9,
    avgPossession: 55.4,
    avgCardsYellow: 1.9,
    avgCardsRed: 0.06,
    bttsPercentage: 45,
    over25Percentage: 58,
    over15Percentage: 82,
    over35Percentage: 32,
    over05HTPercentage: 70,
    cleanSheetsPercentage: 46,
    avgFouls: 11.5,
    avgOffsides: 1.8,
    avgTackles: 16.9,
  },
  {
    id: 903,
    name: "Palmeiras Feminino",
    shortName: "PAL-F",
    logo: "https://media.api-sports.io/football/teams/121.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 2.45,
    avgGoalsConceded: 0.95,
    avgShots: 16.4,
    avgShotsOnTarget: 6.8,
    avgCorners: 10.2,
    avgCornersFor: 6.8,
    avgCornersAgainst: 3.4,
    avgPossession: 59.8,
    avgCardsYellow: 1.8,
    avgCardsRed: 0.05,
    bttsPercentage: 48,
    over25Percentage: 68,
    over15Percentage: 88,
    over35Percentage: 39,
    over05HTPercentage: 78,
    cleanSheetsPercentage: 48,
    avgFouls: 11.0,
    avgOffsides: 1.9,
    avgTackles: 17.0,
  },
  {
    id: 904,
    name: "São Paulo Feminino",
    shortName: "SPO-F",
    logo: "https://media.api-sports.io/football/teams/126.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 2.10,
    avgGoalsConceded: 1.05,
    avgShots: 14.8,
    avgShotsOnTarget: 5.9,
    avgCorners: 10.1,
    avgCornersFor: 6.0,
    avgCornersAgainst: 4.1,
    avgPossession: 56.1,
    avgCardsYellow: 2.0,
    avgCardsRed: 0.08,
    bttsPercentage: 50,
    over25Percentage: 60,
    over15Percentage: 84,
    over35Percentage: 30,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 39,
    avgFouls: 12.1,
    avgOffsides: 1.7,
    avgTackles: 16.2,
  },
  {
    id: 905,
    name: "Santos Feminino",
    shortName: "SAN-F",
    logo: "https://media.api-sports.io/football/teams/132.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.85,
    avgGoalsConceded: 1.25,
    avgShots: 13.9,
    avgShotsOnTarget: 5.2,
    avgCorners: 10.3,
    avgCornersFor: 5.5,
    avgCornersAgainst: 4.8,
    avgPossession: 52.4,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.10,
    bttsPercentage: 55,
    over25Percentage: 52,
    over15Percentage: 78,
    over35Percentage: 25,
    over05HTPercentage: 65,
    cleanSheetsPercentage: 32,
    avgFouls: 12.5,
    avgOffsides: 1.6,
    avgTackles: 15.9,
  },
  {
    id: 906,
    name: "Flamengo Feminino",
    shortName: "FLA-F",
    logo: "https://media.api-sports.io/football/teams/97.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.90,
    avgGoalsConceded: 1.10,
    avgShots: 14.2,
    avgShotsOnTarget: 5.4,
    avgCorners: 10.0,
    avgCornersFor: 5.8,
    avgCornersAgainst: 4.2,
    avgPossession: 54.0,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.07,
    bttsPercentage: 52,
    over25Percentage: 55,
    over15Percentage: 80,
    over35Percentage: 28,
    over05HTPercentage: 68,
    cleanSheetsPercentage: 38,
    avgFouls: 11.2,
    avgOffsides: 1.8,
    avgTackles: 16.0,
  },
  {
    id: 907,
    name: "Cruzeiro Feminino",
    shortName: "CRU-F",
    logo: "https://media.api-sports.io/football/teams/106.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.80,
    avgGoalsConceded: 1.15,
    avgShots: 13.8,
    avgShotsOnTarget: 5.1,
    avgCorners: 9.8,
    avgCornersFor: 5.4,
    avgCornersAgainst: 4.4,
    avgPossession: 53.5,
    avgCardsYellow: 2.0,
    avgCardsRed: 0.09,
    bttsPercentage: 50,
    over25Percentage: 50,
    over15Percentage: 78,
    over35Percentage: 24,
    over05HTPercentage: 64,
    cleanSheetsPercentage: 35,
    avgFouls: 12.0,
    avgOffsides: 1.5,
    avgTackles: 15.8,
  },
  {
    id: 908,
    name: "Real Brasília Feminino",
    shortName: "RBR-F",
    logo: "https://media.api-sports.io/football/teams/138.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.18,
    avgGoalsConceded: 1.45,
    avgShots: 11.0,
    avgShotsOnTarget: 3.6,
    avgCorners: 9.1,
    avgCornersFor: 4.1,
    avgCornersAgainst: 5.0,
    avgPossession: 46.2,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.12,
    bttsPercentage: 48,
    over25Percentage: 38,
    over15Percentage: 64,
    over35Percentage: 15,
    over05HTPercentage: 52,
    cleanSheetsPercentage: 24,
    avgFouls: 13.8,
    avgOffsides: 1.4,
    avgTackles: 15.1,
  },
  {
    id: 909,
    name: "Fluminense Feminino",
    shortName: "FLU-F",
    logo: "https://media.api-sports.io/football/teams/124.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.32,
    avgGoalsConceded: 1.35,
    avgShots: 12.1,
    avgShotsOnTarget: 4.1,
    avgCorners: 9.4,
    avgCornersFor: 4.6,
    avgCornersAgainst: 4.8,
    avgPossession: 48.9,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.10,
    bttsPercentage: 54,
    over25Percentage: 44,
    over15Percentage: 70,
    over35Percentage: 18,
    over05HTPercentage: 56,
    cleanSheetsPercentage: 26,
    avgFouls: 12.4,
    avgOffsides: 1.6,
    avgTackles: 15.4,
  },
  {
    id: 910,
    name: "Grêmio Feminino",
    shortName: "GRE-F",
    logo: "https://media.api-sports.io/football/teams/129.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.52,
    avgGoalsConceded: 1.28,
    avgShots: 12.8,
    avgShotsOnTarget: 4.5,
    avgCorners: 9.6,
    avgCornersFor: 4.9,
    avgCornersAgainst: 4.7,
    avgPossession: 50.5,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.11,
    bttsPercentage: 50,
    over25Percentage: 48,
    over15Percentage: 75,
    over35Percentage: 21,
    over05HTPercentage: 60,
    cleanSheetsPercentage: 30,
    avgFouls: 12.1,
    avgOffsides: 1.5,
    avgTackles: 15.6,
  },
  {
    id: 911,
    name: "Internacional Feminino",
    shortName: "INT-F",
    logo: "https://media.api-sports.io/football/teams/130.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.60,
    avgGoalsConceded: 1.25,
    avgShots: 13.0,
    avgShotsOnTarget: 4.8,
    avgCorners: 9.8,
    avgCornersFor: 5.1,
    avgCornersAgainst: 4.7,
    avgPossession: 51.0,
    avgCardsYellow: 2.0,
    avgCardsRed: 0.08,
    bttsPercentage: 48,
    over25Percentage: 46,
    over15Percentage: 72,
    over35Percentage: 20,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 32,
    avgFouls: 12.5,
    avgOffsides: 1.6,
    avgTackles: 16.0,
  },
  {
    id: 912,
    name: "Botafogo Feminino",
    shortName: "BOT-F",
    logo: "https://media.api-sports.io/football/teams/120.png",
    division: "feminino",
    matchesPlayed: 28,
    avgGoalsScored: 1.28,
    avgGoalsConceded: 1.32,
    avgShots: 11.8,
    avgShotsOnTarget: 3.9,
    avgCorners: 9.2,
    avgCornersFor: 4.4,
    avgCornersAgainst: 4.8,
    avgPossession: 48.0,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.11,
    bttsPercentage: 51,
    over25Percentage: 40,
    over15Percentage: 68,
    over35Percentage: 16,
    over05HTPercentage: 54,
    cleanSheetsPercentage: 27,
    avgFouls: 13.0,
    avgOffsides: 1.5,
    avgTackles: 15.3,
  }
];

// Curated elite European teams
const EXTRA_EUROPEAN_TEAMS = [
  // Espanha
  {
    id: 541,
    name: "Real Madrid CF",
    shortName: "RMD",
    country: "Espanha",
    logo: "https://media.api-sports.io/football/teams/541.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.32,
    avgGoalsConceded: 0.72,
    avgShots: 16.8,
    avgShotsOnTarget: 6.5,
    avgCorners: 6.1,
    avgCornersFor: 6.1,
    avgCornersAgainst: 3.8,
    avgPossession: 58.5,
    avgCardsYellow: 1.6,
    avgCardsRed: 0.05,
    bttsPercentage: 42,
    over25Percentage: 58,
    over15Percentage: 84,
    over35Percentage: 34,
    over05HTPercentage: 73,
    cleanSheetsPercentage: 50,
    avgFouls: 10.5,
    avgOffsides: 2.2,
    avgTackles: 14.8,
  },
  {
    id: 529,
    name: "FC Barcelona",
    shortName: "BAR",
    country: "Espanha",
    logo: "https://media.api-sports.io/football/teams/529.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.10,
    avgGoalsConceded: 1.05,
    avgShots: 15.9,
    avgShotsOnTarget: 5.8,
    avgCorners: 5.9,
    avgCornersFor: 5.9,
    avgCornersAgainst: 4.2,
    avgPossession: 61.2,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.08,
    bttsPercentage: 52,
    over25Percentage: 54,
    over15Percentage: 80,
    over35Percentage: 28,
    over05HTPercentage: 70,
    cleanSheetsPercentage: 40,
    avgFouls: 11.2,
    avgOffsides: 2.5,
    avgTackles: 15.1,
  },
  {
    id: 530,
    name: "Atlético de Madrid",
    shortName: "ATM",
    country: "Espanha",
    logo: "https://media.api-sports.io/football/teams/530.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.84,
    avgGoalsConceded: 0.98,
    avgShots: 12.8,
    avgShotsOnTarget: 4.9,
    avgCorners: 4.8,
    avgCornersFor: 4.8,
    avgCornersAgainst: 4.5,
    avgPossession: 51.5,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.12,
    bttsPercentage: 45,
    over25Percentage: 50,
    over15Percentage: 72,
    over35Percentage: 22,
    over05HTPercentage: 62,
    cleanSheetsPercentage: 44,
    avgFouls: 12.8,
    avgOffsides: 1.9,
    avgTackles: 16.5,
  },
  {
    id: 547,
    name: "Girona FC",
    shortName: "GIR",
    country: "Espanha",
    logo: "https://media.api-sports.io/football/teams/547.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.95,
    avgGoalsConceded: 1.18,
    avgShots: 13.5,
    avgShotsOnTarget: 5.1,
    avgCorners: 5.1,
    avgCornersFor: 5.1,
    avgCornersAgainst: 4.8,
    avgPossession: 55.8,
    avgCardsYellow: 1.9,
    avgCardsRed: 0.05,
    bttsPercentage: 58,
    over25Percentage: 56,
    over15Percentage: 82,
    over35Percentage: 30,
    over05HTPercentage: 68,
    cleanSheetsPercentage: 32,
    avgFouls: 11.0,
    avgOffsides: 1.6,
    avgTackles: 15.6,
  },
  // Inglaterra
  {
    id: 50,
    name: "Manchester City FC",
    shortName: "MCI",
    country: "Inglaterra",
    logo: "https://media.api-sports.io/football/teams/50.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.48,
    avgGoalsConceded: 0.85,
    avgShots: 18.2,
    avgShotsOnTarget: 6.9,
    avgCorners: 7.2,
    avgCornersFor: 7.2,
    avgCornersAgainst: 3.4,
    avgPossession: 64.8,
    avgCardsYellow: 1.4,
    avgCardsRed: 0.04,
    bttsPercentage: 52,
    over25Percentage: 62,
    over15Percentage: 88,
    over35Percentage: 38,
    over05HTPercentage: 78,
    cleanSheetsPercentage: 42,
    avgFouls: 9.8,
    avgOffsides: 1.8,
    avgTackles: 13.9,
  },
  {
    id: 42,
    name: "Arsenal FC",
    shortName: "ARS",
    country: "Inglaterra",
    logo: "https://media.api-sports.io/football/teams/42.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.30,
    avgGoalsConceded: 0.76,
    avgShots: 16.5,
    avgShotsOnTarget: 6.1,
    avgCorners: 6.8,
    avgCornersFor: 6.8,
    avgCornersAgainst: 3.5,
    avgPossession: 59.2,
    avgCardsYellow: 1.6,
    avgCardsRed: 0.05,
    bttsPercentage: 40,
    over25Percentage: 58,
    over15Percentage: 85,
    over35Percentage: 32,
    over05HTPercentage: 75,
    cleanSheetsPercentage: 48,
    avgFouls: 10.2,
    avgOffsides: 2.0,
    avgTackles: 15.2,
  },
  {
    id: 40,
    name: "Liverpool FC",
    shortName: "LIV",
    country: "Inglaterra",
    logo: "https://media.api-sports.io/football/teams/40.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.24,
    avgGoalsConceded: 1.02,
    avgShots: 18.9,
    avgShotsOnTarget: 6.7,
    avgCorners: 6.9,
    avgCornersFor: 6.9,
    avgCornersAgainst: 4.1,
    avgPossession: 60.5,
    avgCardsYellow: 1.7,
    avgCardsRed: 0.08,
    bttsPercentage: 58,
    over25Percentage: 60,
    over15Percentage: 86,
    over35Percentage: 35,
    over05HTPercentage: 76,
    cleanSheetsPercentage: 35,
    avgFouls: 11.4,
    avgOffsides: 2.3,
    avgTackles: 16.4,
  },
  {
    id: 49,
    name: "Chelsea FC",
    shortName: "CHE",
    country: "Inglaterra",
    logo: "https://media.api-sports.io/football/teams/49.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.95,
    avgGoalsConceded: 1.35,
    avgShots: 14.1,
    avgShotsOnTarget: 5.2,
    avgCorners: 5.6,
    avgCornersFor: 5.6,
    avgCornersAgainst: 4.9,
    avgPossession: 56.4,
    avgCardsYellow: 2.5,
    avgCardsRed: 0.08,
    bttsPercentage: 62,
    over25Percentage: 58,
    over15Percentage: 82,
    over35Percentage: 31,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 25,
    avgFouls: 11.8,
    avgOffsides: 1.7,
    avgTackles: 16.1,
  },
  {
    id: 33,
    name: "Manchester United FC",
    shortName: "MUN",
    country: "Inglaterra",
    logo: "https://media.api-sports.io/football/teams/33.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.52,
    avgGoalsConceded: 1.48,
    avgShots: 13.4,
    avgShotsOnTarget: 4.7,
    avgCorners: 5.2,
    avgCornersFor: 5.2,
    avgCornersAgainst: 6.2,
    avgPossession: 50.1,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.05,
    bttsPercentage: 54,
    over25Percentage: 52,
    over15Percentage: 78,
    over35Percentage: 26,
    over05HTPercentage: 66,
    cleanSheetsPercentage: 24,
    avgFouls: 11.1,
    avgOffsides: 1.9,
    avgTackles: 15.8,
  },
  // Alemanha
  {
    id: 157,
    name: "FC Bayern München",
    shortName: "FCB",
    country: "Alemanha",
    logo: "https://media.api-sports.io/football/teams/157.png",
    matchesPlayed: 34,
    avgGoalsScored: 2.62,
    avgGoalsConceded: 1.12,
    avgShots: 17.5,
    avgShotsOnTarget: 6.8,
    avgCorners: 6.4,
    avgCornersFor: 6.4,
    avgCornersAgainst: 3.5,
    avgPossession: 62.5,
    avgCardsYellow: 1.5,
    avgCardsRed: 0.06,
    bttsPercentage: 55,
    over25Percentage: 65,
    over15Percentage: 88,
    over35Percentage: 41,
    over05HTPercentage: 80,
    cleanSheetsPercentage: 35,
    avgFouls: 9.5,
    avgOffsides: 1.8,
    avgTackles: 14.5,
  },
  {
    id: 168,
    name: "Bayer 04 Leverkusen",
    shortName: "B04",
    country: "Alemanha",
    logo: "https://media.api-sports.io/football/teams/168.png",
    matchesPlayed: 34,
    avgGoalsScored: 2.50,
    avgGoalsConceded: 0.72,
    avgShots: 16.2,
    avgShotsOnTarget: 6.2,
    avgCorners: 6.1,
    avgCornersFor: 6.1,
    avgCornersAgainst: 3.2,
    avgPossession: 61.8,
    avgCardsYellow: 1.7,
    avgCardsRed: 0.03,
    bttsPercentage: 48,
    over25Percentage: 62,
    over15Percentage: 86,
    over35Percentage: 35,
    over05HTPercentage: 76,
    cleanSheetsPercentage: 45,
    avgFouls: 10.1,
    avgOffsides: 1.5,
    avgTackles: 15.2,
  },
  {
    id: 165,
    name: "Borussia Dortmund",
    shortName: "BVB",
    country: "Alemanha",
    logo: "https://media.api-sports.io/football/teams/165.png",
    matchesPlayed: 34,
    avgGoalsScored: 1.98,
    avgGoalsConceded: 1.22,
    avgShots: 14.2,
    avgShotsOnTarget: 5.1,
    avgCorners: 5.4,
    avgCornersFor: 5.4,
    avgCornersAgainst: 4.8,
    avgPossession: 55.4,
    avgCardsYellow: 1.9,
    avgCardsRed: 0.08,
    bttsPercentage: 52,
    over25Percentage: 55,
    over15Percentage: 82,
    over35Percentage: 30,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 32,
    avgFouls: 10.8,
    avgOffsides: 1.6,
    avgTackles: 15.5,
  },
  // Itália
  {
    id: 505,
    name: "Inter de Milão",
    shortName: "INT",
    country: "Itália",
    logo: "https://media.api-sports.io/football/teams/505.png",
    matchesPlayed: 38,
    avgGoalsScored: 2.25,
    avgGoalsConceded: 0.65,
    avgShots: 15.8,
    avgShotsOnTarget: 5.9,
    avgCorners: 6.0,
    avgCornersFor: 6.0,
    avgCornersAgainst: 3.5,
    avgPossession: 57.2,
    avgCardsYellow: 1.6,
    avgCardsRed: 0.03,
    bttsPercentage: 38,
    over25Percentage: 54,
    over15Percentage: 82,
    over35Percentage: 27,
    over05HTPercentage: 74,
    cleanSheetsPercentage: 54,
    avgFouls: 10.9,
    avgOffsides: 2.1,
    avgTackles: 14.9,
  },
  {
    id: 489,
    name: "AC Milan",
    shortName: "MIL",
    country: "Itália",
    logo: "https://media.api-sports.io/football/teams/489.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.92,
    avgGoalsConceded: 1.21,
    avgShots: 14.0,
    avgShotsOnTarget: 5.0,
    avgCorners: 5.1,
    avgCornersFor: 5.1,
    avgCornersAgainst: 4.5,
    avgPossession: 54.5,
    avgCardsYellow: 2.2,
    avgCardsRed: 0.10,
    bttsPercentage: 55,
    over25Percentage: 56,
    over15Percentage: 80,
    over32Percentage: 32,
    over05HTPercentage: 70,
    cleanSheetsPercentage: 33,
    avgFouls: 11.5,
    avgOffsides: 1.8,
    avgTackles: 15.6,
  },
  {
    id: 496,
    name: "Juventus FC",
    shortName: "JUV",
    country: "Itália",
    logo: "https://media.api-sports.io/football/teams/496.png",
    matchesPlayed: 38,
    avgGoalsScored: 1.48,
    avgGoalsConceded: 0.78,
    avgShots: 13.1,
    avgShotsOnTarget: 4.1,
    avgCorners: 5.0,
    avgCornersFor: 5.0,
    avgCornersAgainst: 3.8,
    avgPossession: 48.9,
    avgCardsYellow: 2.4,
    avgCardsRed: 0.05,
    bttsPercentage: 42,
    over25Percentage: 40,
    over15Percentage: 68,
    over35Percentage: 18,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 48,
    avgFouls: 12.3,
    avgOffsides: 1.6,
    avgTackles: 16.0,
  }
];

// Curated elite European superstar players
const EXTRA_EUROPEAN_PLAYERS = [
  // Real Madrid (teamId: 541)
  { id: 54101, name: "Vinicius Júnior", teamId: 541, teamName: "Real Madrid CF", position: "Atacante", matches: 34, goals: 21, assists: 11, shotsPerGame: 3.6, shotsOnTargetPerGame: 1.8, cornersWonPerGame: 1.8, yellowCards: 6, redCards: 0, rating: 7.95 },
  { id: 54102, name: "Kylian Mbappé", teamId: 541, teamName: "Real Madrid CF", position: "Atacante", matches: 32, goals: 24, assists: 8, shotsPerGame: 4.2, shotsOnTargetPerGame: 2.1, cornersWonPerGame: 0.8, yellowCards: 2, redCards: 0, rating: 7.88 },
  { id: 54103, name: "Jude Bellingham", teamId: 541, teamName: "Real Madrid CF", position: "Meio-campo", matches: 30, goals: 12, assists: 9, shotsPerGame: 2.5, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 1.1, yellowCards: 5, redCards: 0, rating: 7.82 },
  { id: 54104, name: "Federico Valverde", teamId: 541, teamName: "Real Madrid CF", position: "Meio-campo", matches: 35, goals: 6, assists: 7, shotsPerGame: 2.1, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 1.5, yellowCards: 3, redCards: 0, rating: 7.58 },

  // Barcelona (teamId: 529)
  { id: 52901, name: "Robert Lewandowski", teamId: 529, teamName: "FC Barcelona", position: "Atacante", matches: 35, goals: 23, assists: 6, shotsPerGame: 3.8, shotsOnTargetPerGame: 1.9, cornersWonPerGame: 0.2, yellowCards: 4, redCards: 0, rating: 7.72 },
  { id: 52902, name: "Lamine Yamal", teamId: 529, teamName: "FC Barcelona", position: "Atacante", matches: 34, goals: 10, assists: 12, shotsPerGame: 3.1, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 2.1, yellowCards: 3, redCards: 0, rating: 7.90 },
  { id: 52903, name: "Raphinha", teamId: 529, teamName: "FC Barcelona", position: "Atacante", matches: 31, goals: 12, assists: 11, shotsPerGame: 3.3, shotsOnTargetPerGame: 1.5, cornersWonPerGame: 2.4, yellowCards: 4, redCards: 0, rating: 7.80 },
  { id: 52904, name: "Pedri", teamId: 529, teamName: "FC Barcelona", position: "Meio-campo", matches: 28, goals: 5, assists: 8, shotsPerGame: 1.6, shotsOnTargetPerGame: 0.8, cornersWonPerGame: 1.3, yellowCards: 2, redCards: 0, rating: 7.55 },

  // Atletico de Madrid (teamId: 530)
  { id: 53001, name: "Antoine Griezmann", teamId: 530, teamName: "Atlético de Madrid", position: "Atacante", matches: 33, goals: 15, assists: 9, shotsPerGame: 2.6, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 2.2, yellowCards: 3, redCards: 0, rating: 7.68 },
  { id: 53002, name: "Julián Álvarez", teamId: 530, teamName: "Atlético de Madrid", position: "Atacante", matches: 32, goals: 11, assists: 5, shotsPerGame: 2.4, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 0.7, yellowCards: 2, redCards: 0, rating: 7.35 },

  // Girona (teamId: 547)
  { id: 54701, name: "Cristhian Stuani", teamId: 547, teamName: "Girona FC", position: "Atacante", matches: 30, goals: 10, assists: 2, shotsPerGame: 1.8, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 0.1, yellowCards: 6, redCards: 0, rating: 7.10 },

  // Manchester City (teamId: 50)
  { id: 50011, name: "Erling Haaland", teamId: 50, teamName: "Manchester City FC", position: "Atacante", matches: 33, goals: 31, assists: 5, shotsPerGame: 4.5, shotsOnTargetPerGame: 2.4, cornersWonPerGame: 0.1, yellowCards: 3, redCards: 0, rating: 7.92 },
  { id: 50012, name: "Kevin De Bruyne", teamId: 50, teamName: "Manchester City FC", position: "Meio-campo", matches: 25, goals: 7, assists: 15, shotsPerGame: 2.4, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 3.5, yellowCards: 2, redCards: 0, rating: 7.98 },
  { id: 50013, name: "Phil Foden", teamId: 50, teamName: "Manchester City FC", position: "Atacante", matches: 34, goals: 16, assists: 10, shotsPerGame: 3.2, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 1.6, yellowCards: 2, redCards: 0, rating: 7.78 },

  // Arsenal (teamId: 42)
  { id: 42011, name: "Bukayo Saka", teamId: 42, teamName: "Arsenal FC", position: "Atacante", matches: 33, goals: 15, assists: 11, shotsPerGame: 2.9, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 2.8, yellowCards: 4, redCards: 0, rating: 7.85 },
  { id: 42012, name: "Martin Ødegaard", teamId: 42, teamName: "Arsenal FC", position: "Meio-campo", matches: 32, goals: 10, assists: 10, shotsPerGame: 2.3, shotsOnTargetPerGame: 1.0, cornersWonPerGame: 3.2, yellowCards: 2, redCards: 0, rating: 7.80 },

  // Liverpool (teamId: 40)
  { id: 40011, name: "Mohamed Salah", teamId: 40, teamName: "Liverpool FC", position: "Atacante", matches: 34, goals: 22, assists: 13, shotsPerGame: 3.8, shotsOnTargetPerGame: 1.8, cornersWonPerGame: 2.0, yellowCards: 2, redCards: 0, rating: 7.90 },
  { id: 40012, name: "Luis Díaz", teamId: 40, teamName: "Liverpool FC", position: "Atacante", matches: 33, goals: 11, assists: 6, shotsPerGame: 2.7, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 1.5, yellowCards: 3, redCards: 0, rating: 7.45 },

  // Chelsea (teamId: 49)
  { id: 49011, name: "Cole Palmer", teamId: 49, teamName: "Chelsea FC", position: "Meio-campo", matches: 33, goals: 22, assists: 11, shotsPerGame: 3.4, shotsOnTargetPerGame: 1.6, cornersWonPerGame: 2.2, yellowCards: 7, redCards: 0, rating: 7.89 },

  // Manchester United (teamId: 33)
  { id: 33011, name: "Bruno Fernandes", teamId: 33, teamName: "Manchester United FC", position: "Meio-campo", matches: 35, goals: 12, assists: 9, shotsPerGame: 2.8, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 3.1, yellowCards: 8, redCards: 0, rating: 7.64 },

  // Bayern Munich (teamId: 157)
  { id: 15711, name: "Harry Kane", teamId: 157, teamName: "FC Bayern München", position: "Atacante", matches: 32, goals: 34, assists: 8, shotsPerGame: 4.1, shotsOnTargetPerGame: 2.0, cornersWonPerGame: 0.1, yellowCards: 2, redCards: 0, rating: 8.12 },
  { id: 15712, name: "Jamal Musiala", teamId: 157, teamName: "FC Bayern München", position: "Meio-campo", matches: 28, goals: 11, assists: 7, shotsPerGame: 2.5, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 1.9, yellowCards: 3, redCards: 0, rating: 7.85 },

  // Leverkusen (teamId: 168)
  { id: 16811, name: "Florian Wirtz", teamId: 168, teamName: "Bayer 04 Leverkusen", position: "Meio-campo", matches: 32, goals: 11, assists: 12, shotsPerGame: 2.3, shotsOnTargetPerGame: 1.1, cornersWonPerGame: 2.5, yellowCards: 3, redCards: 0, rating: 7.88 },

  // Dortmund (teamId: 165)
  { id: 16511, name: "Julian Brandt", teamId: 165, teamName: "Borussia Dortmund", position: "Meio-campo", matches: 32, goals: 8, assists: 11, shotsPerGame: 2.1, shotsOnTargetPerGame: 0.9, cornersWonPerGame: 2.8, yellowCards: 2, redCards: 0, rating: 7.52 },

  // Inter Milan (teamId: 505)
  { id: 50511, name: "Lautaro Martínez", teamId: 505, teamName: "Inter de Milão", position: "Atacante", matches: 33, goals: 24, assists: 4, shotsPerGame: 3.5, shotsOnTargetPerGame: 1.6, cornersWonPerGame: 0.2, yellowCards: 4, redCards: 0, rating: 7.78 },

  // AC Milan (teamId: 489)
  { id: 48911, name: "Rafael Leão", teamId: 489, teamName: "AC Milan", position: "Atacante", matches: 32, goals: 9, assists: 9, shotsPerGame: 2.8, shotsOnTargetPerGame: 1.2, cornersWonPerGame: 1.8, yellowCards: 4, redCards: 0, rating: 7.60 },

  // Juventus (teamId: 496)
  { id: 49611, name: "Dušan Vlahović", teamId: 496, teamName: "Juventus FC", position: "Atacante", matches: 31, goals: 16, assists: 3, shotsPerGame: 3.2, shotsOnTargetPerGame: 1.4, cornersWonPerGame: 0.1, yellowCards: 5, redCards: 0, rating: 7.38 }
];

// Custom National Teams (FIFA)
const EXTRA_NATIONAL_TEAMS = [
  {
    id: 1,
    name: "Seleção Brasileira",
    shortName: "BRA",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/1.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 2.15,
    avgGoalsConceded: 0.82,
    avgShots: 16.5,
    avgShotsOnTarget: 6.2,
    avgCorners: 6.8,
    avgCornersFor: 6.8,
    avgCornersAgainst: 3.2,
    avgPossession: 60.5,
    avgCardsYellow: 1.8,
    avgCardsRed: 0.05,
    bttsPercentage: 45,
    over25Percentage: 55,
    over15Percentage: 80,
    over35Percentage: 25,
    over05HTPercentage: 70,
    cleanSheetsPercentage: 48,
    avgFouls: 11.5,
    avgOffsides: 1.9,
    avgTackles: 15.2,
  },
  {
    id: 2,
    name: "Seleção Argentina",
    shortName: "ARG",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/2.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 1.95,
    avgGoalsConceded: 0.78,
    avgShots: 15.2,
    avgShotsOnTarget: 5.6,
    avgCorners: 6.1,
    avgCornersFor: 6.1,
    avgCornersAgainst: 3.5,
    avgPossession: 58.2,
    avgCardsYellow: 2.1,
    avgCardsRed: 0.06,
    bttsPercentage: 42,
    over25Percentage: 50,
    over15Percentage: 78,
    over35Percentage: 20,
    over05HTPercentage: 66,
    cleanSheetsPercentage: 52,
    avgFouls: 12.8,
    avgOffsides: 2.0,
    avgTackles: 16.1,
  },
  {
    id: 3,
    name: "Seleção Francesa",
    shortName: "FRA",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/3.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 2.05,
    avgGoalsConceded: 0.95,
    avgShots: 15.8,
    avgShotsOnTarget: 5.9,
    avgCorners: 5.8,
    avgCornersFor: 5.8,
    avgCornersAgainst: 3.8,
    avgPossession: 56.4,
    avgCardsYellow: 1.5,
    avgCardsRed: 0.04,
    bttsPercentage: 48,
    over25Percentage: 54,
    over15Percentage: 82,
    over35Percentage: 22,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 42,
    avgFouls: 10.9,
    avgOffsides: 1.7,
    avgTackles: 14.8,
  },
  {
    id: 4,
    name: "Seleção Espanhola",
    shortName: "ESP",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/4.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 2.10,
    avgGoalsConceded: 0.88,
    avgShots: 17.1,
    avgShotsOnTarget: 6.4,
    avgCorners: 6.4,
    avgCornersFor: 6.4,
    avgCornersAgainst: 3.1,
    avgPossession: 63.5,
    avgCardsYellow: 1.6,
    avgCardsRed: 0.03,
    bttsPercentage: 40,
    over25Percentage: 52,
    over15Percentage: 84,
    over35Percentage: 24,
    over05HTPercentage: 75,
    cleanSheetsPercentage: 46,
    avgFouls: 9.8,
    avgOffsides: 2.2,
    avgTackles: 13.9,
  },
  {
    id: 5,
    name: "Seleção Alemã",
    shortName: "GER",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/5.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 2.25,
    avgGoalsConceded: 1.15,
    avgShots: 16.9,
    avgShotsOnTarget: 6.1,
    avgCorners: 6.2,
    avgCornersFor: 6.2,
    avgCornersAgainst: 3.9,
    avgPossession: 59.8,
    avgCardsYellow: 1.7,
    avgCardsRed: 0.08,
    bttsPercentage: 55,
    over25Percentage: 62,
    over15Percentage: 86,
    over35Percentage: 32,
    over05HTPercentage: 78,
    cleanSheetsPercentage: 32,
    avgFouls: 10.2,
    avgOffsides: 1.8,
    avgTackles: 14.5,
  },
  {
    id: 6,
    name: "Seleção Inglesa",
    shortName: "ENG",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/6.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 1.90,
    avgGoalsConceded: 0.75,
    avgShots: 14.8,
    avgShotsOnTarget: 5.2,
    avgCorners: 5.7,
    avgCornersFor: 5.7,
    avgCornersAgainst: 3.4,
    avgPossession: 58.1,
    avgCardsYellow: 1.3,
    avgCardsRed: 0.02,
    bttsPercentage: 38,
    over25Percentage: 48,
    over15Percentage: 76,
    over35Percentage: 18,
    over05HTPercentage: 64,
    cleanSheetsPercentage: 55,
    avgFouls: 9.5,
    avgOffsides: 1.5,
    avgTackles: 15.0,
  },
  {
    id: 7,
    name: "Seleção Italiana",
    shortName: "ITA",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/7.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 1.55,
    avgGoalsConceded: 0.80,
    avgShots: 13.5,
    avgShotsOnTarget: 4.6,
    avgCorners: 5.2,
    avgCornersFor: 5.2,
    avgCornersAgainst: 4.1,
    avgPossession: 51.9,
    avgCardsYellow: 2.3,
    avgCardsRed: 0.08,
    bttsPercentage: 44,
    over25Percentage: 38,
    over15Percentage: 68,
    over35Percentage: 14,
    over05HTPercentage: 58,
    cleanSheetsPercentage: 50,
    avgFouls: 12.1,
    avgOffsides: 1.9,
    avgTackles: 16.2,
  },
  {
    id: 8,
    name: "Seleção Portuguesa",
    shortName: "POR",
    country: "Internacional",
    logo: "https://media.api-sports.io/football/teams/8.png",
    isNational: true,
    matchesPlayed: 40,
    avgGoalsScored: 2.20,
    avgGoalsConceded: 0.98,
    avgShots: 16.1,
    avgShotsOnTarget: 5.8,
    avgCorners: 6.0,
    avgCornersFor: 6.0,
    avgCornersAgainst: 3.6,
    avgPossession: 57.5,
    avgCardsYellow: 1.9,
    avgCardsRed: 0.05,
    bttsPercentage: 50,
    over25Percentage: 58,
    over15Percentage: 84,
    over35Percentage: 30,
    over05HTPercentage: 72,
    cleanSheetsPercentage: 40,
    avgFouls: 11.2,
    avgOffsides: 1.6,
    avgTackles: 14.9,
  }
];

function getTeamMetaData(name: string, country: string, division?: string): { state: string; city: string; league: string } {
  const n = name.toLowerCase();
  
  if (country === "Internacional") {
    return { state: "FIFA", city: "Sede Mundial", league: "Copa do Mundo FIFA" };
  }
  
  if (country === "Inglaterra") {
    let city = "Londres";
    let state = "Grande Londres";
    if (n.includes("manchester")) {
      city = "Manchester";
      state = "Greater Manchester";
    } else if (n.includes("liverpool")) {
      city = "Liverpool";
      state = "Merseyside";
    }
    return { state, city, league: "Premier League" };
  }
  
  if (country === "Espanha") {
    let city = "Madrid";
    let state = "Madrid (Espanha)";
    if (n.includes("barcelona")) {
      city = "Barcelona";
      state = "Catalunha";
    } else if (n.includes("girona")) {
      city = "Girona";
      state = "Catalunha";
    }
    return { state, city, league: "La Liga" };
  }
  
  if (country === "Alemanha") {
    let city = "Munique";
    let state = "Baviera";
    if (n.includes("dortmund")) {
      city = "Dortmund";
      state = "Renânia-Vestfália";
    } else if (n.includes("leverkusen")) {
      city = "Leverkusen";
      state = "Renânia-Vestfália";
    }
    return { state, city, league: "Bundesliga" };
  }
  
  if (country === "Itália") {
    let city = "Milão";
    let state = "Lombardia";
    if (n.includes("juventus")) {
      city = "Turim";
      state = "Piemonte";
    }
    return { state, city, league: "Serie A Italiana" };
  }
  
  // Brasil & Fallback
  let league = (division === "serie_b_c") ? "Brasileirão Série B" : "Brasileirão Série A";
  if (division === "feminino") {
    league = "Brasileiro Feminino";
  }
  
  let state = "SP";
  let city = "São Paulo";
  
  if (n.includes("são paulo") || n.includes("spfc")) {
    state = "SP"; city = "São Paulo";
  } else if (n.includes("palmeiras")) {
    state = "SP"; city = "São Paulo";
  } else if (n.includes("corinthians")) {
    state = "SP"; city = "São Paulo";
  } else if (n.includes("santos")) {
    state = "SP"; city = "Santos";
  } else if (n.includes("bragantino")) {
    state = "SP"; city = "Bragança Paulista";
  } else if (n.includes("ponte preta")) {
    state = "SP"; city = "Campinas";
  } else if (n.includes("guarani")) {
    state = "SP"; city = "Campinas";
  } else if (n.includes("novorizontino")) {
    state = "SP"; city = "Novo Horizonte";
  } else if (n.includes("mirassol")) {
    state = "SP"; city = "Mirassol";
  } else if (n.includes("ituan")) {
    state = "SP"; city = "Itu";
  } else if (n.includes("são bernardo")) {
    state = "SP"; city = "São Bernardo";
  } else if (n.includes("flamengo") || n.includes("mengo")) {
    state = "RJ"; city = "Rio de Janeiro";
  } else if (n.includes("vasco")) {
    state = "RJ"; city = "Rio de Janeiro";
  } else if (n.includes("botafogo")) {
    state = "RJ"; city = "Rio de Janeiro";
  } else if (n.includes("fluminense")) {
    state = "RJ"; city = "Rio de Janeiro";
  } else if (n.includes("grêmio") || n.includes("gremio")) {
    state = "RS"; city = "Porto Alegre";
  } else if (n.includes("internacional") || n.includes("inter")) {
    state = "RS"; city = "Porto Alegre";
  } else if (n.includes("juventude")) {
    state = "RS"; city = "Caxias do Sul";
  } else if (n.includes("cruzeiro")) {
    state = "MG"; city = "Belo Horizonte";
  } else if (n.includes("atlético mineiro") || n.includes("atletico mineiro") || n.includes("galo")) {
    state = "MG"; city = "Belo Horizonte";
  } else if (n.includes("fortaleza")) {
    state = "CE"; city = "Fortaleza";
  } else if (n.includes("ceará") || n.includes("ceara")) {
    state = "CE"; city = "Fortaleza";
  } else if (n.includes("bahia")) {
    state = "BA"; city = "Salvador";
  } else if (n.includes("vitória") || n.includes("vitoria")) {
    state = "BA"; city = "Salvador";
  } else if (n.includes("cuiabá") || n.includes("cuiaba")) {
    state = "MT"; city = "Cuiabá";
  } else if (n.includes("athletico") || n.includes("atletico paranaense")) {
    state = "PR"; city = "Curitiba";
  } else if (n.includes("coritiba")) {
    state = "PR"; city = "Curitiba";
  } else if (n.includes("criciúma") || n.includes("criciuma")) {
    state = "SC"; city = "Criciúma";
  } else if (n.includes("chapecoense")) {
    state = "SC"; city = "Chapecó";
  } else if (n.includes("sport recife") || n.includes("sport club")) {
    state = "PE"; city = "Recife";
  } else if (n.includes("goiás") || n.includes("goias")) {
    state = "GO"; city = "Goiânia";
  } else if (n.includes("atlético goianiense") || n.includes("atletico goianiense")) {
    state = "GO"; city = "Goiânia";
  } else if (n.includes("crb")) {
    state = "AL"; city = "Maceió";
  } else if (n.includes("csa")) {
    state = "AL"; city = "Maceió";
  } else if (n.includes("sampaio")) {
    state = "MA"; city = "São Luís";
  } else if (n.includes("abc")) {
    state = "RN"; city = "Natal";
  } else if (n.includes("operário") || n.includes("operario")) {
    state = "PR"; city = "Ponta Grossa";
  } else if (n.includes("brusque")) {
    state = "SC"; city = "Brusque";
  } else if (n.includes("amazonas")) {
    state = "AM"; city = "Manaus";
  } else if (n.includes("paysandu")) {
    state = "PA"; city = "Belém";
  } else if (n.includes("remo")) {
    state = "PA"; city = "Belém";
  } else if (n.includes("vila nova")) {
    state = "GO"; city = "Goiânia";
  } else if (n.includes("londrina")) {
    state = "PR"; city = "Londrina";
  } else if (n.includes("ferroviário") || n.includes("ferroviario")) {
    state = "CE"; city = "Fortaleza";
  } else if (n.includes("confiança") || n.includes("confianca")) {
    state = "SE"; city = "Aracaju";
  } else if (n.includes("figueirense")) {
    state = "SC"; city = "Florianópolis";
  } else if (n.includes("avaí") || n.includes("avai")) {
    state = "SC"; city = "Florianópolis";
  } else if (n.includes("aparecidense")) {
    state = "GO"; city = "Aparecida de Goiânia";
  }
  
  return { state, city, league };
}

// Enrich/Merge Extra leagues to the Master In-Memory Database
EXTRA_SERIE_B_C_TEAMS.forEach(t => {
  (t as any).country = 'Brasil';
  if (!TEAMS_DATA.some(exists => exists.id === t.id)) {
    TEAMS_DATA.push(t as any);
  }
});
EXTRA_FEMININO_TEAMS.forEach(t => {
  (t as any).country = 'Brasil';
  if (!TEAMS_DATA.some(exists => exists.id === t.id)) {
    TEAMS_DATA.push(t as any);
  }
});

EXTRA_EUROPEAN_TEAMS.forEach(t => {
  if (!TEAMS_DATA.some(exists => exists.id === t.id)) {
    TEAMS_DATA.push(t as any);
  }
});

// Append elite FIFA national teams
EXTRA_NATIONAL_TEAMS.forEach(t => {
  if (!TEAMS_DATA.some(exists => exists.id === t.id)) {
    TEAMS_DATA.push(t as any);
  }
});

EXTRA_EUROPEAN_PLAYERS.forEach(p => {
  if (!PLAYERS_DATA.some(exists => exists.id === p.id)) {
    PLAYERS_DATA.push(p as any);
  }
});

TEAMS_DATA.forEach(t => {
  if (!t.country) {
    (t as any).country = 'Brasil';
  }
  
  // Set accurate state, city, and default league if missing
  const meta = getTeamMetaData(t.name, t.country, t.division);
  if (!t.state) t.state = meta.state;
  if (!t.city) t.city = meta.city;
  if (!t.league) t.league = meta.league;
  if (t.isNational === undefined) {
    t.isNational = t.country === "Internacional";
  }
});

// ============================================================================
// ENDPOINTS
// ============================================================================

// Register newly created custom teams onto the backend
app.post("/api/football/teams", (req, res) => {
  const newTeam = req.body;
  if (!newTeam || !newTeam.id || !newTeam.name) {
    return res.status(400).json({ success: false, error: "Dados inválidos." });
  }
  const exists = TEAMS_DATA.some(t => t.id === newTeam.id);
  if (!exists) {
    TEAMS_DATA.push(newTeam);
  }
  res.json({ success: true, team: newTeam });
});

function adjustStatsForChampionship(team: any, championship: string) {
  const seed = (team.id || 100) + (championship || "Brasileirão Série A").length;
  
  let goalScoredMult = 1.0;
  let goalConcededMult = 1.0;
  let cardsMult = 1.0;
  let cornersMult = 1.0;
  let possessionMult = 1.0;
  let shotsMult = 1.0;

  const isCup = championship === "Copa do Brasil";
  const isLibertadores = championship === "Libertadores";
  const isSula = championship === "Sul-Americana";
  const isSerieB = championship === "Brasileirão Série B";

  if (isLibertadores) {
    goalScoredMult = 0.92;
    goalConcededMult = 0.88;
    cardsMult = 1.35;
    cornersMult = 0.95;
    possessionMult = 0.98;
    shotsMult = 0.94;
  } else if (isSula) {
    goalScoredMult = 1.12;
    goalConcededMult = 1.02;
    cardsMult = 1.20;
    cornersMult = 1.04;
    shotsMult = 1.08;
  } else if (isCup) {
    goalScoredMult = 0.86;
    goalConcededMult = 0.82;
    cardsMult = 1.28;
    cornersMult = 0.92;
    possessionMult = 1.00;
    shotsMult = 0.90;
  } else if (isSerieB) {
    const isSerieBActive = team.division === "serie_b_c";
    if (isSerieBActive) {
      goalScoredMult = 1.12;
      goalConcededMult = 0.94;
      possessionMult = 1.08;
    } else {
      goalScoredMult = 0.84;
      goalConcededMult = 1.25;
      possessionMult = 0.92;
    }
  }

  const deviation = (val: number, range: number) => {
    const pseudoRand = Math.sin(seed + val) * 0.5 + 0.5;
    return -range + pseudoRand * (range * 2);
  };

  const matchesPlayed = isCup ? Math.floor(6 + deviation(4, 2)) : (isLibertadores || isSula) ? Math.floor(10 + deviation(5, 2)) : 38;
  
  const avgGoalsScored = parseFloat(Math.max(0.4, (team.avgGoalsScored || 1.3) * goalScoredMult + deviation(1, 0.12)).toFixed(2));
  const avgGoalsConceded = parseFloat(Math.max(0.4, (team.avgGoalsConceded || 1.1) * goalConcededMult + deviation(2, 0.12)).toFixed(2));
  const avgShots = parseFloat(Math.max(8, (team.avgShots || 12) * shotsMult + deviation(3, 1.0)).toFixed(1));
  const avgShotsOnTarget = parseFloat(Math.max(2.5, (team.avgShotsOnTarget || 4) * shotsMult + deviation(4, 0.4)).toFixed(1));
  const avgCorners = parseFloat(Math.max(4, (team.avgCorners || 5.5) * cornersMult + deviation(5, 0.5)).toFixed(1));
  const avgCornersFor = parseFloat(Math.max(2, (team.avgCornersFor || (team.avgCorners ? team.avgCorners * 0.5 : 2.5)) * cornersMult + deviation(15, 0.4)).toFixed(1));
  const avgCornersAgainst = parseFloat(Math.max(2, (team.avgCornersAgainst || (team.avgCorners ? team.avgCorners * 0.5 : 2.5)) * cornersMult + deviation(16, 0.4)).toFixed(1));
  const avgPossession = parseFloat(Math.min(68, Math.max(38, (team.avgPossession || 50) * possessionMult + deviation(6, 2.5))).toFixed(1));
  const avgCardsYellow = parseFloat(Math.max(1, (team.avgCardsYellow || 2.4) * cardsMult + deviation(7, 0.3)).toFixed(1));
  const avgCardsRed = parseFloat(Math.max(0.02, (team.avgCardsRed || 0.15) * cardsMult + deviation(8, 0.04)).toFixed(2));
  
  const avgFouls = parseFloat(Math.max(8, (team.avgFouls || 13.5) + deviation(9, 1.2)).toFixed(1));
  const avgOffsides = parseFloat(Math.max(0.5, (team.avgOffsides || 1.7) + deviation(10, 0.3)).toFixed(1));
  const avgTackles = parseFloat(Math.max(10, (team.avgTackles || 15.5) + deviation(11, 1.2)).toFixed(1));
  
  const avgDangerousAttacks = Math.floor(55 + avgShots * 3.1 + deviation(12, 5));
  const avgExpectedGoals = parseFloat(Math.max(0.5, avgGoalsScored * 0.95 + deviation(13, 0.10)).toFixed(2));
  const avgExpectedGoalsAgainst = parseFloat(Math.max(0.5, avgGoalsConceded * 1.02 + deviation(14, 0.10)).toFixed(2));

  const ratio = avgGoalsScored / (avgGoalsScored + avgGoalsConceded || 1);
  let wins = Math.floor(matchesPlayed * ratio * 0.96);
  let losses = Math.floor(matchesPlayed * (1 - ratio) * 0.96);
  let draws = matchesPlayed - wins - losses;
  if (draws < 0) {
    draws = 0;
    wins = matchesPlayed - losses;
  }
  const points = wins * 3 + draws;
  const aproveitamento = matchesPlayed > 0 ? parseFloat(((points / (matchesPlayed * 3)) * 100).toFixed(1)) : 0;

  const homeMatches = Math.ceil(matchesPlayed / 2);
  const homeRatio = Math.min(0.9, ratio + 0.15);
  let homeWins = Math.floor(homeMatches * homeRatio);
  let homeLosses = Math.floor(homeMatches * (1 - homeRatio));
  let homeDraws = Math.max(0, homeMatches - homeWins - homeLosses);
  
  const awayMatches = matchesPlayed - homeMatches;
  const awayRatio = Math.max(0.1, ratio - 0.15);
  let awayWins = Math.floor(awayMatches * awayRatio);
  let awayLosses = Math.floor(awayMatches * (1 - awayRatio));
  let awayDraws = Math.max(0, awayMatches - awayWins - awayLosses);

  const avgGoalsHomeScored = parseFloat(Math.max(0.5, avgGoalsScored * 1.2).toFixed(2));
  const avgGoalsHomeConceded = parseFloat(Math.max(0.3, avgGoalsConceded * 0.8).toFixed(2));
  const avgGoalsAwayScored = parseFloat(Math.max(0.3, avgGoalsScored * 0.8).toFixed(2));
  const avgGoalsAwayConceded = parseFloat(Math.max(0.5, avgGoalsConceded * 1.2).toFixed(2));

  const avgCornersHome = parseFloat(Math.max(3, avgCorners * 1.15).toFixed(1));
  const avgCornersAway = parseFloat(Math.max(2, avgCorners * 0.85).toFixed(1));
  const avgPossessionHome = parseFloat(Math.min(70, Math.max(35, avgPossession * 1.05)).toFixed(1));
  const avgPossessionAway = parseFloat(Math.min(70, Math.max(35, avgPossession * 0.95)).toFixed(1));

  const LEAGUE_AVG_SC_HOME = 1.35;
  const LEAGUE_AVG_CD_HOME = 1.10;
  const homeOffensiveForce = Math.round((avgGoalsHomeScored / LEAGUE_AVG_SC_HOME) * 100);
  const homeDefensiveForce = Math.round((LEAGUE_AVG_CD_HOME / (avgGoalsHomeConceded || 0.5)) * 100);

  const awayOffensiveForce = Math.round((avgGoalsAwayScored / LEAGUE_AVG_CD_HOME) * 100);
  const awayDefensiveForce = Math.round((LEAGUE_AVG_SC_HOME / (avgGoalsAwayConceded || 0.5)) * 100);

  const bttsPercentage = Math.round(Math.min(95, Math.max(15, (team.bttsPercentage || 50) + (isLibertadores ? -8 : isSula ? 5 : isCup ? -12 : deviation(21, 6)))));
  const over25Percentage = Math.round(Math.min(95, Math.max(10, (team.over25Percentage || 45) + (isLibertadores ? -10 : isSula ? 8 : isCup ? -15 : deviation(22, 6)))));
  const over15Percentage = Math.round(Math.min(99, Math.max(30, (team.over15Percentage || 70) + (isLibertadores ? -5 : isSula ? 4 : isCup ? -10 : deviation(23, 6)))));
  const over35Percentage = Math.round(Math.max(5, (team.over35Percentage || 20) + (isLibertadores ? -6 : isCup ? -10 : deviation(24, 4))));
  const cleanSheetsPercentage = Math.round(Math.min(95, Math.max(5, (team.cleanSheetsPercentage || 30) + (isLibertadores ? 6 : isCup ? 10 : deviation(25, 5)))));

  return {
    ...team,
    matchesPlayed,
    wins,
    draws,
    losses,
    aproveitamento,
    avgGoalsScored,
    avgGoalsConceded,
    avgShots,
    avgShotsOnTarget,
    avgCorners,
    avgCornersFor,
    avgCornersAgainst,
    avgPossession,
    avgCardsYellow,
    avgCardsRed,
    avgFouls,
    avgOffsides,
    avgTackles,
    avgDangerousAttacks,
    avgExpectedGoals,
    avgExpectedGoalsAgainst,
    bttsPercentage,
    over25Percentage,
    over15Percentage,
    over35Percentage,
    cleanSheetsPercentage,
    homeStats: {
      wins: homeWins,
      draws: homeDraws,
      losses: homeLosses,
      avgGoalsScored: avgGoalsHomeScored,
      avgGoalsConceded: avgGoalsHomeConceded,
      avgCorners: avgCornersHome,
      avgPossession: avgPossessionHome,
      offensiveForce: homeOffensiveForce,
      defensiveForce: homeDefensiveForce
    },
    awayStats: {
      wins: awayWins,
      draws: awayDraws,
      losses: awayLosses,
      avgGoalsScored: avgGoalsAwayScored,
      avgGoalsConceded: avgGoalsAwayConceded,
      avgCorners: avgCornersAway,
      avgPossession: avgPossessionAway,
      offensiveForce: awayOffensiveForce,
      defensiveForce: awayDefensiveForce
    }
  };
}

function generateH2HMatches(tHome: any, tAway: any, championship: string) {
  const list: any[] = [];
  const seedBase = tHome.id * tAway.id + championship.length;

  for (let i = 1; i <= 6; i++) {
    const isHome = i % 2 !== 0;
    const homeTeamEntity = isHome ? tHome : tAway;
    const awayTeamEntity = isHome ? tAway : tHome;

    const pseudoRandGoalsHome = Math.abs(Math.sin(seedBase + i * 3) * 3);
    const pseudoRandGoalsAway = Math.abs(Math.cos(seedBase + i * 7) * 2.5);

    const homeGoals = Math.max(0, Math.floor(homeTeamEntity.avgGoalsScored * 0.9 + pseudoRandGoalsHome * 0.4));
    const awayGoals = Math.max(0, Math.floor(awayTeamEntity.avgGoalsScored * 0.8 + pseudoRandGoalsAway * 0.4));

    list.push({
      id: `h2h-${tHome.id}-${tAway.id}-${i}`,
      date: `2025-0${10 - i}-15`,
      championship,
      homeTeamId: homeTeamEntity.id,
      homeTeamName: homeTeamEntity.name,
      awayTeamId: awayTeamEntity.id,
      awayTeamName: awayTeamEntity.name,
      homeScore: homeGoals,
      awayScore: awayGoals,
      shotsHome: Math.floor(homeTeamEntity.avgShots + Math.sin(i) * 3),
      shotsAway: Math.floor(awayTeamEntity.avgShots + Math.cos(i) * 3),
      shotsOnTargetHome: Math.floor(homeTeamEntity.avgShotsOnTarget + Math.sin(i) * 1.5),
      shotsOnTargetAway: Math.floor(awayTeamEntity.avgShotsOnTarget + Math.cos(i) * 1.5),
      cornersHome: Math.floor(homeTeamEntity.avgCornersFor + Math.sin(i) * 2),
      cornersAway: Math.floor(awayTeamEntity.avgCornersFor + Math.cos(i) * 2),
      possessionHome: Math.floor(homeTeamEntity.avgPossession / (homeTeamEntity.avgPossession + awayTeamEntity.avgPossession) * 100),
      possessionAway: 100 - Math.floor(homeTeamEntity.avgPossession / (homeTeamEntity.avgPossession + awayTeamEntity.avgPossession) * 100),
      cardsYellowHome: Math.floor(homeTeamEntity.avgCardsYellow + Math.sin(i * 4) * 1.5),
      cardsYellowAway: Math.floor(awayTeamEntity.avgCardsYellow + Math.cos(i * 4) * 1.5)
    });
  }
  return list;
}

function generateTeamMatchesList(teamId: number, name: string, championship: string, avgScored: number, avgConceded: number): any[] {
  let opponents = ["São Paulo FC", "SE Palmeiras", "SC Corinthians Paulista", "CR Flamengo", "EC Bahia", "Botafogo FR", "Vasco da Gama", "Cruzeiro EC", "Grêmio FBPA", "Internacional", "Fortaleza EC", "Athletico-PR", "Cuiabá EC", "Atlético Mineiro", "Fluminense FC", "Vitória", "Juventude", "Criciúma EC", "Red Bull Bragantino", "Sport Recife"];
  
  if (championship === "Premier League") {
    opponents = ["Manchester City FC", "Arsenal FC", "Liverpool FC", "Chelsea FC", "Manchester United FC", "Tottenham Hotspur", "Aston Villa", "Newcastle United", "West Ham United", "Everton FC"];
  } else if (championship === "La Liga") {
    opponents = ["Real Madrid CF", "FC Barcelona", "Atlético de Madrid", "Girona FC", "Real Sociedad", "Athletic Club", "Sevilla FC", "Real Betis", "Valencia CF", "Villarreal CF"];
  } else if (championship === "Bundesliga") {
    opponents = ["FC Bayern München", "Bayer 04 Leverkusen", "Borussia Dortmund", "RB Leipzig", "VfB Stuttgart", "Eintracht Frankfurt", "SC Freiburg", "TSG Hoffenheim", "Werder Bremen", "Wolfsburg"];
  } else if (championship === "Serie A Italiana") {
    opponents = ["Inter de Milão", "AC Milan", "Juventus FC", "SSC Napoli", "AS Roma", "SS Lazio", "Atalanta BC", "ACF Fiorentina", "Bologna FC", "Torino FC"];
  } else if (championship === "Champions League") {
    opponents = ["Real Madrid CF", "Manchester City FC", "FC Bayern München", "FC Barcelona", "Arsenal FC", "Inter de Milão", "Bayer 04 Leverkusen", "Paris Saint-Germain", "Atlético de Madrid", "Borussia Dortmund", "AC Milan", "Juventus FC"];
  }

  const list: any[] = [];
  const seedBase = teamId + championship.length;

  for (let i = 1; i <= 20; i++) {
    const isHome = i % 2 === 0;
    let opp = opponents[(seedBase + i) % opponents.length];
    if (opp.toLowerCase().includes(name.substring(0, 5).toLowerCase())) {
      opp = opponents[(seedBase + i + 1) % opponents.length];
    }

    const pseudoRandScored = Math.abs(Math.sin(seedBase + i) * 2.8);
    const pseudoRandConceded = Math.abs(Math.cos(seedBase + i * 2) * 2.4);

    let gs = Math.floor(avgScored * 0.8 + pseudoRandScored * 0.5);
    if (gs < 0) gs = 0;
    let gc = Math.floor(avgConceded * 0.8 + pseudoRandConceded * 0.5);
    if (gc < 0) gc = 0;

    list.push({
      id: `m-team-${teamId}-${championship.substring(0, 3)}-${i}`,
      date: `2026-05-${Math.max(1, 23 - i)}`,
      opponent: opp,
      championship,
      isHome,
      goalsScored: gs,
      goalsConceded: gc,
      corners: Math.max(1, Math.floor(4.5 + Math.sin(seedBase + i) * 3)),
      shots: Math.max(5, Math.floor(11.2 + Math.cos(seedBase + i) * 4)),
      yellowCards: Math.max(0, Math.floor(2.0 + Math.sin(seedBase + i * 1.5) * 2.2))
    });
  }
  return list;
}

function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

function calculatePoissonMatchProbabilities(avgGoalsScoredHome: number, avgGoalsConcededHome: number, avgGoalsScoredAway: number, avgGoalsConcededAway: number) {
  const LEAGUE_AVG_GOALS = 1.30;
  const homeExpectedGoals = (avgGoalsScoredHome * avgGoalsConcededAway) / LEAGUE_AVG_GOALS;
  const awayExpectedGoals = (avgGoalsScoredAway * avgGoalsConcededHome) / LEAGUE_AVG_GOALS;

  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const prob = poisson(h, homeExpectedGoals) * poisson(a, awayExpectedGoals);
      if (h > a) pHomeWin += prob;
      else if (h === a) pDraw += prob;
      else pAwayWin += prob;
    }
  }

  const sumProb = pHomeWin + pDraw + pAwayWin || 1;
  const pctHome = parseFloat(((pHomeWin / sumProb) * 100).toFixed(1));
  const pctDraw = parseFloat(((pDraw / sumProb) * 100).toFixed(1));
  const pctAway = parseFloat(((pAwayWin / sumProb) * 100).toFixed(1));

  const p00 = poisson(0, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p10 = poisson(1, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p01 = poisson(0, homeExpectedGoals) * poisson(1, awayExpectedGoals);
  const p20 = poisson(2, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p02 = poisson(0, homeExpectedGoals) * poisson(2, awayExpectedGoals);
  const p11 = poisson(1, homeExpectedGoals) * poisson(1, awayExpectedGoals);
  const pctOver25 = parseFloat(((1 - (p00 + p10 + p01 + p20 + p02 + p11)) * 100).toFixed(1));

  const pctBTTS = parseFloat(((1 - poisson(0, homeExpectedGoals)) * (1 - poisson(0, awayExpectedGoals)) * 100).toFixed(1));

  return {
    homeWin: `${Math.round(pctHome)}%`,
    draw: `${Math.round(pctDraw)}%`,
    awayWin: `${Math.round(pctAway)}%`,
    over25: `${Math.round(pctOver25)}%`,
    btts: `${Math.round(pctBTTS)}%`
  };
}

// 1. Teams List & their general stats averages (adjusted by championship)
app.get("/api/football/teams", (req, res) => {
  const championship = req.query.championship as string || "Brasileirão Série A";
  
  let filteredTeams = TEAMS_DATA;
  
  if (championship === "Premier League") {
    filteredTeams = TEAMS_DATA.filter(t => t.country === "Inglaterra");
  } else if (championship === "La Liga") {
    filteredTeams = TEAMS_DATA.filter(t => t.country === "Espanha");
  } else if (championship === "Bundesliga") {
    filteredTeams = TEAMS_DATA.filter(t => t.country === "Alemanha");
  } else if (championship === "Serie A Italiana") {
    filteredTeams = TEAMS_DATA.filter(t => t.country === "Itália");
  } else if (championship === "Champions League") {
    filteredTeams = TEAMS_DATA.filter(t => ["Inglaterra", "Espanha", "Alemanha", "Itália"].includes(t.country));
  } else if (championship === "Brasileirão Série B") {
    filteredTeams = TEAMS_DATA.filter(t => t.division === "serie_b_c");
  } else {
    // Default Brasileirão Série A, Libertadores, Copa do Brasil, Sul-Americana, etc.
    filteredTeams = TEAMS_DATA.filter(t => t.division !== "serie_b_c" && t.division !== "feminino" && (!t.country || t.country === "Brasil"));
  }
  
  const adjustedTeams = filteredTeams.map(t => adjustStatsForChampionship(t, championship));
  res.json({ success: true, teams: adjustedTeams });
});

// 2. Filtered Players by team
app.get("/api/football/players", (req, res) => {
  const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : null;
  if (teamId) {
    const players = PLAYERS_DATA.filter(p => p.teamId === teamId);
    res.json({ success: true, players });
  } else {
    res.json({ success: true, players: PLAYERS_DATA });
  }
});

// 3. Historical Confrontations adjusted by championship
app.get("/api/football/fixtures/history", (req, res) => {
  const t1 = req.query.team1 ? parseInt(req.query.team1 as string) : null;
  const t2 = req.query.team2 ? parseInt(req.query.team2 as string) : null;
  const championship = req.query.championship as string || "Brasileirão Série A";

  if (t1 && t2) {
    const tHome = TEAMS_DATA.find(t => t.id === t1);
    const tAway = TEAMS_DATA.find(t => t.id === t2);
    if (tHome && tAway) {
      const matches = generateH2HMatches(tHome, tAway, championship);
      res.json({ success: true, matches });
    } else {
      res.status(444).json({ error: "Times não encontrados" });
    }
  } else {
    res.json({ success: true, matches: HISTORICAL_MATCHES });
  }
});

// 3.5 Single Team Fixtures List by Championship
app.get("/api/football/team-fixtures", (req, res) => {
  const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : null;
  const championship = req.query.championship as string || "Brasileirão Série A";
  
  if (!teamId) {
    return res.status(400).json({ error: "teamId é obrigatório" });
  }
  const teamObj = TEAMS_DATA.find(t => t.id === teamId);
  if (!teamObj) {
    return res.status(404).json({ error: "Time não encontrado" });
  }
  const adjusted = adjustStatsForChampionship(teamObj, championship);
  const matches = generateTeamMatchesList(teamId, teamObj.name, championship, adjusted.avgGoalsScored, adjusted.avgGoalsConceded);
  res.json({ success: true, matches });
});

// 3.8 Advanced sports comparison report in requested formal schema format
app.get("/api/football/comparison-report", (req, res) => {
  const t1 = req.query.homeTeamId ? parseInt(req.query.homeTeamId as string) : null;
  const t2 = req.query.awayTeamId ? parseInt(req.query.awayTeamId as string) : null;
  const championship = req.query.championship as string || "Brasileirão Série A";

  if (!t1 || !t2) {
    return res.status(400).json({ error: "homeTeamId e awayTeamId são obrigatórios" });
  }

  const baseHome = TEAMS_DATA.find(t => t.id === t1);
  const baseAway = TEAMS_DATA.find(t => t.id === t2);

  if (!baseHome || !baseAway) {
    return res.status(404).json({ error: "Times de destino não encontrados" });
  }

  const homeAdjusted = adjustStatsForChampionship(baseHome, championship);
  const awayAdjusted = adjustStatsForChampionship(baseAway, championship);

  const predictions = calculatePoissonMatchProbabilities(
    homeAdjusted.avgGoalsScored,
    homeAdjusted.avgGoalsConceded,
    awayAdjusted.avgGoalsScored,
    awayAdjusted.avgGoalsConceded
  );

  res.json({
    championship,
    homeTeam: homeAdjusted.name,
    awayTeam: awayAdjusted.name,
    stats: {
      goalsPerGame: { home: homeAdjusted.avgGoalsScored, away: awayAdjusted.avgGoalsScored, championshipAvg: 1.30 },
      shotsPerGame: { home: homeAdjusted.avgShots, away: awayAdjusted.avgShots, championshipAvg: 13.5 },
      shotsOnTarget: { home: homeAdjusted.avgShotsOnTarget, away: awayAdjusted.avgShotsOnTarget, championshipAvg: 4.5 },
      corners: { home: homeAdjusted.avgCorners, away: awayAdjusted.avgCorners, championshipAvg: 5.5 },
      possession: { home: homeAdjusted.avgPossession, away: awayAdjusted.avgPossession, championshipAvg: 50.0 },
      yellowCards: { home: homeAdjusted.avgCardsYellow, away: awayAdjusted.avgCardsYellow, championshipAvg: 2.4 }
    },
    predictions
  });
});

// 4. Live score status
app.get("/api/football/live", (req, res) => {
  res.json({ 
    success: true, 
    liveMatch: activeLiveFixture,
    alerts: alertSubscribers.filter(a => a.triggered).reverse() // recently triggered first
  });
});

// 5. Create Live Notification Alerts Subscription
app.post("/api/football/alerts/subscribe", (req, res) => {
  const { metricType, thresholdValue } = req.body;
  if (!metricType) {
    return res.status(400).json({ error: "metricType is required" });
  }

  const newSub = {
    id: "sub-" + Date.now(),
    fixtureId: 98765,
    metricType,
    thresholdValue: thresholdValue ? parseInt(thresholdValue) : undefined,
    triggered: false,
    message: ""
  };

  alertSubscribers.push(newSub);
  res.json({ success: true, subscriber: newSub, msg: "Alerta configurado com sucesso! Você será avisado quando as estatísticas corresponderem." });
});

// 6. Action to force-trigger simulated events for quick UI alerts checking
app.post("/api/football/live/force-event", (req, res) => {
  const { eventType } = req.body;
  if (!activeLiveFixture) return res.json({ error: "Sem partida rodando" });

  if (eventType === 'GOL') {
    activeLiveFixture.homeScore += 1;
    activeLiveFixture.event = {
      type: 'GOL',
      detail: `FORÇADO: GOOOU do São Paulo FC! Calleri empurra para as redes! Placar: SPFC ${activeLiveFixture.homeScore} x ${activeLiveFixture.awayScore} PAL`,
      teamId: 126,
      player: "Jonathan Calleri"
    };
    triggerAlerts('GOL', 126, activeLiveFixture.homeScore + activeLiveFixture.awayScore, `Forçado: Gol do São Paulo FC! Placar: SPFC ${activeLiveFixture.homeScore} x ${activeLiveFixture.awayScore} PAL`);
  } else if (eventType === 'ESCANTEIO') {
    activeLiveFixture.stats.cornersHome += 1;
    activeLiveFixture.event = {
      type: 'ESCANTEIO',
      detail: "FORÇADO: Escanteio polêmico marcado na área do Palmeiras!",
      teamId: 126
    };
    const totalCorners = activeLiveFixture.stats.cornersHome + activeLiveFixture.stats.cornersAway;
    triggerAlerts('ESCANTEIO', 126, totalCorners, `Forçado: Escanteio para São Paulo. Total de escanteios: ${totalCorners}`);
  } else if (eventType === 'CARTAO') {
    activeLiveFixture.stats.cardsYellowAway += 1;
    activeLiveFixture.event = {
      type: 'CARTAO',
      detail: "FORÇADO: Cartão Amarelo para Richard Ríos devido a reclamações!",
      teamId: 121,
      player: "Richard Ríos"
    };
    triggerAlerts('CARTAO', 121, 1, "Forçado: Cartão para Richard Ríos (Palmeiras)");
  }

  res.json({ success: true, fixture: activeLiveFixture });
});

// 7. PREDICTION ALGORITHM power-boosted by server-side Gemini Model AI
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, championship = "Brasileirão Série A" } = req.body;
    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: "Por favor, selecione ambos os times para análise." });
    }

    const tHome = TEAMS_DATA.find(t => t.id === parseInt(homeTeamId));
    const tAway = TEAMS_DATA.find(t => t.id === parseInt(awayTeamId));

    if (!tHome || !tAway) {
      return res.status(404).json({ error: "Times não encontrados." });
    }

    const homeAdjusted = adjustStatsForChampionship(tHome, championship);
    const awayAdjusted = adjustStatsForChampionship(tAway, championship);

    // Capture dynamic historical matches based on this tournament
    const h2h = generateH2HMatches(homeAdjusted, awayAdjusted, championship);

    // Capture top players in each team
    let topHomePlayers = PLAYERS_DATA.filter(p => p.teamId === homeAdjusted.id).slice(0, 3);
    let topAwayPlayers = PLAYERS_DATA.filter(p => p.teamId === awayAdjusted.id).slice(0, 3);

    // Auto-generate high-quality reference player stats if none exist
    if (topHomePlayers.length === 0) {
      topHomePlayers = [
        { name: homeAdjusted.id >= 900 ? "Gabriela Santos" : "Rodrigo Silva", goals: Math.floor(homeAdjusted.avgGoalsScored * 8), rating: 7.45, shotsPerGame: 2.8 },
        { name: homeAdjusted.id >= 900 ? "Juliana Oliveira" : "Renato Souza", goals: Math.floor(homeAdjusted.avgGoalsScored * 4), rating: 7.15, shotsPerGame: 1.9 }
      ] as any;
    }
    if (topAwayPlayers.length === 0) {
      topAwayPlayers = [
        { name: awayAdjusted.id >= 900 ? "Letícia Nascimento" : "Gabriel Barbosa", goals: Math.floor(awayAdjusted.avgGoalsScored * 8), rating: 7.40, shotsPerGame: 2.7 },
        { name: awayAdjusted.id >= 900 ? "Beatriz Alves" : "Vitor Augusto", goals: Math.floor(awayAdjusted.avgGoalsScored * 4), rating: 7.10, shotsPerGame: 1.8 }
      ] as any;
    }

    const statsContext = {
      championship,
      homeTeam: {
        name: homeAdjusted.name,
        avgGoalsScored: homeAdjusted.avgGoalsScored,
        avgGoalsConceded: homeAdjusted.avgGoalsConceded,
        avgShots: homeAdjusted.avgShots,
        avgShotsOnTarget: homeAdjusted.avgShotsOnTarget,
        avgCorners: homeAdjusted.avgCorners,
        avgPossession: homeAdjusted.avgPossession,
        bttsPercentage: homeAdjusted.bttsPercentage,
        over25Percentage: homeAdjusted.over25Percentage,
        over15Percentage: homeAdjusted.over15Percentage,
        topPlayers: topHomePlayers.map(p => ({ name: p.name, goals: p.goals, rating: p.rating, shotsPerGame: p.shotsPerGame }))
      },
      awayTeam: {
        name: awayAdjusted.name,
        avgGoalsScored: awayAdjusted.avgGoalsScored,
        avgGoalsConceded: awayAdjusted.avgGoalsConceded,
        avgShots: awayAdjusted.avgShots,
        avgShotsOnTarget: awayAdjusted.avgShotsOnTarget,
        avgCorners: awayAdjusted.avgCorners,
        avgPossession: awayAdjusted.avgPossession,
        bttsPercentage: awayAdjusted.bttsPercentage,
        over25Percentage: awayAdjusted.over25Percentage,
        over15Percentage: awayAdjusted.over15Percentage,
        topPlayers: topAwayPlayers.map(p => ({ name: p.name, goals: p.goals, rating: p.rating, shotsPerGame: p.shotsPerGame }))
      },
      headToHead: h2h.map(m => ({
        date: m.date,
        home: m.homeTeamName,
        away: m.awayTeamName,
        score: `${m.homeScore} - ${m.awayScore}`,
        shotsHome: m.shotsHome,
        shotsAway: m.shotsAway,
        cornersHome: m.cornersHome,
        cornersAway: m.cornersAway,
      }))
    };

    const promptMessage = `
Você é uma inteligência artificial especialista em análise de dados esportivos, precificação (odds fair) e estatísticas de futebol de alto nível para suporte a apostadores profissionais (+EV).
Analise detalhadamente o confronto a seguir no contexto específico do campeonato "${championship}" para embasamento de palpites estratégicos (apostas com valor esperado positivo).

Utilize os dados históricos e médias para:
1. Calcular os gols esperados (xG) para cada equipe com base na força ofensiva de um versus a vulnerabilidade defensiva do outro. Considere o peso tático inerente ao campeonato "${championship}".
2. Projetar linhas de probabilidade para Ambas Marcam (BTTS) e Over/Under 2.5 gols.
3. Sugerir de 2 a 3 bilhetes/apostas de valor onde a odd justa calculada (Fair Odd = 100 / Probabilidade) seja atrativa para o mercado (ex: Over de escanteios, chutes ao gol de jogadores-chave, ou mercados de cartões).
4. Indicar o jogador sob holofote (Player to Watch) adequado para mercados individuais (Player Props, ex: chutes ou finalizações).

DADOS DE ENTRADA DO CONFRONTO EM ${championship.toUpperCase()}:
${JSON.stringify(statsContext, null, 2)}

Produza um relatório altamente profissional estruturado exatamente no formato JSON especificado.
Toda a análise tática deve ser descrita em português elegante, conciso, e focado exclusivamente em dados, sem termos vazios ou clichês de inteligência artificial.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "homeTeam",
            "awayTeam",
            "overallAnalysis",
            "bttsProbability",
            "over25Probability",
            "expectedHomeGoals",
            "expectedAwayGoals",
            "predictedWinner",
            "recommendedBets",
            "playerToWatch"
          ],
          properties: {
            homeTeam: { type: Type.STRING },
            awayTeam: { type: Type.STRING },
            overallAnalysis: { type: Type.STRING, description: "Resumo analítico profundo do comportamento tático e tendências do confronto" },
            bttsProbability: { type: Type.INTEGER, description: "Probabilidade de Ambas Marcam (0 a 100)" },
            over25Probability: { type: Type.INTEGER, description: "Probabilidade de Mais de 2.5 gols ocorrerem (0 a 100)" },
            expectedHomeGoals: { type: Type.NUMBER, description: "Gols esperados (xG estimado/projetado) para o time MANDANTE" },
            expectedAwayGoals: { type: Type.NUMBER, description: "Gols esperados (xG estimado/projetado) para o time VISITANTE" },
            predictedWinner: { type: Type.STRING, description: "Nome do provável vencedor ou 'Empate'" },
            recommendedBets: {
              type: Type.ARRAY,
              description: "Lista de 2 a 3 sugestões de apostas baseadas em valor de mercado",
              items: {
                type: Type.OBJECT,
                required: ["market", "confidence", "oddEstimated", "justification"],
                properties: {
                  market: { type: Type.STRING, description: "Nome do mercado, ex: 'Mais de 9.5 Escanteios' ou 'Mais de 4.5 chutes no alvo do SPFC'" },
                  confidence: { type: Type.INTEGER, description: "Porcentagem de confiança de 0 a 100 baseada na força dos indicadores matemáticos" },
                  oddEstimated: { type: Type.NUMBER, description: "Odd justa recomendada, ex: 1.85" },
                  justification: { type: Type.STRING, description: "Explicação técnica embasada pelas estatísticas dos times" }
                }
              }
            },
            playerToWatch: {
              type: Type.OBJECT,
              required: ["name", "metric", "reason"],
              properties: {
                name: { type: Type.STRING, description: "Nome do jogador destaque" },
                metric: { type: Type.STRING, description: "Métrica-chave que justifica a atenção, ex: 'Média de 3.2 chutes por jogo'" },
                reason: { type: Type.STRING, description: "Explicação minuciosa de como este jogador influencia o resultado ou escanteios" }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json({ success: true, analysis: parsedData });
  } catch (error: any) {
    console.error("Gemini server analysis fail:", error);
    res.status(500).json({ error: "Erro ao gerar o relatório inteligente de predições da IA. Verifique as credenciais do Gemini nas configurações de Secrets do AI Studio." });
  }
});

// ============================================================================
// API-FOOTBALL v3 HIGH-FIDELITY COMPLIANT ENDPOINTS
// Reference Docs: https://www.api-football.com/documentation-v3
// ============================================================================

const API_V3_ENVELOPE = (endpoint: string, params: any, response: any) => ({
  get: endpoint,
  parameters: params,
  errors: [],
  results: Array.isArray(response) ? response.length : (response ? 1 : 0),
  paging: { current: 1, total: 1 },
  response: Array.isArray(response) ? response : [response].filter(Boolean)
});

// 1. Countries
app.get("/api/v3/countries", (req, res) => {
  const result = [
    { name: "Brazil", code: "BR", flag: "https://media.api-sports.io/flags/br.svg" },
    { name: "Argentina", code: "AR", flag: "https://media.api-sports.io/flags/ar.svg" },
    { name: "England", code: "GB", flag: "https://media.api-sports.io/flags/gb.svg" },
    { name: "Spain", code: "ES", flag: "https://media.api-sports.io/flags/es.svg" },
    { name: "Germany", code: "DE", flag: "https://media.api-sports.io/flags/de.svg" },
    { name: "Italy", code: "IT", flag: "https://media.api-sports.io/flags/it.svg" },
    { name: "Portugal", code: "PT", flag: "https://media.api-sports.io/flags/pt.svg" },
    { name: "International", code: "FIFA", flag: "https://media.api-sports.io/flags/world.svg" }
  ];
  res.json(API_V3_ENVELOPE("countries", req.query, result));
});

// 2. Seasons
app.get("/api/v3/seasons", (req, res) => {
  const result = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  res.json(API_V3_ENVELOPE("seasons", req.query, result));
});

// 3. Leagues
app.get("/api/v3/leagues", (req, res) => {
  const result = [
    { league: { id: 71, name: "Brasileirão Série A", type: "League", logo: "https://media.api-sports.io/football/leagues/71.png" }, country: { name: "Brazil", code: "BR" } },
    { league: { id: 72, name: "Brasileirão Série B", type: "League", logo: "https://media.api-sports.io/football/leagues/72.png" }, country: { name: "Brazil", code: "BR" } },
    { league: { id: 73, name: "Copa do Brasil", type: "Cup", logo: "https://media.api-sports.io/football/leagues/73.png" }, country: { name: "Brazil", code: "BR" } },
    { league: { id: 13, name: "Copa Libertadores", type: "Cup", logo: "https://media.api-sports.io/football/leagues/13.png" }, country: { name: "South America", code: "SA" } },
    { league: { id: 39, name: "Premier League", type: "League", logo: "https://media.api-sports.io/football/leagues/39.png" }, country: { name: "England", code: "GB" } },
    { league: { id: 140, name: "La Liga", type: "League", logo: "https://media.api-sports.io/football/leagues/140.png" }, country: { name: "Spain", code: "ES" } },
    { league: { id: 78, name: "Bundesliga", type: "League", logo: "https://media.api-sports.io/football/leagues/78.png" }, country: { name: "Germany", code: "DE" } },
    { league: { id: 135, name: "Serie A Italiana", type: "League", logo: "https://media.api-sports.io/football/leagues/135.png" }, country: { name: "Italy", code: "IT" } },
    { league: { id: 1, name: "Copa do Mundo FIFA", type: "Cup", logo: "https://media.api-sports.io/football/leagues/1.png" }, country: { name: "World", code: "FIFA" } }
  ];
  res.json(API_V3_ENVELOPE("leagues", req.query, result));
});

// 4. Standings
app.get("/api/v3/standings", (req, res) => {
  const championship = req.query.championship as string || "Brasileirão Série A";
  const adjusted = TEAMS_DATA.map(t => adjustStatsForChampionship(t, championship));
  const sorted = [...adjusted].sort((a, b) => {
    if (b.aproveitamento !== a.aproveitamento) return b.aproveitamento - a.aproveitamento;
    return b.avgGoalsScored - a.avgGoalsScored;
  });

  const standingsList = sorted.map((t, index) => ({
    rank: index + 1,
    team: { id: t.id, name: t.name, logo: t.logo || "https://media.api-sports.io/football/teams/unknown.png" },
    points: Math.round(t.wins * 3 + t.draws),
    goalsDiff: Math.round((t.avgGoalsScored - t.avgGoalsConceded) * t.matchesPlayed),
    all: { played: t.matchesPlayed, win: t.wins, draw: t.draws, lose: t.losses, goals: { for: Math.round(t.avgGoalsScored * t.matchesPlayed), against: Math.round(t.avgGoalsConceded * t.matchesPlayed) } },
    form: "VVEE" + (index % 2 === 0 ? "V" : "D")
  }));

  const result = {
    league: {
      id: 71,
      name: championship,
      country: "Brazil",
      logo: "https://media.api-sports.io/football/leagues/71.png",
      standings: [standingsList]
    }
  };
  res.json(API_V3_ENVELOPE("standings", req.query, result));
});

// 5. Teams
app.get("/api/v3/teams", (req, res) => {
  const teamId = req.query.id ? parseInt(req.query.id as string) : null;
  const list = TEAMS_DATA.map((t: any) => ({
    team: {
      id: t.id,
      name: t.name,
      code: t.shortName,
      country: t.country || "Brazil",
      founded: 1900 + (t.id % 120),
      logo: t.logo || "https://media.api-sports.io/football/teams/unknown.png",
      national: !!t.isNational,
      state: t.state || "-",
      city: t.city || "Metrópole",
      league: t.league || "Brasileirão Série A"
    },
    venue: {
      id: 1000 + t.id,
      name: t.stadium || "Estádio Arena Municipal",
      address: "Avenida do Futebol, s/n",
      city: t.city || "Metrópole",
      capacity: 40000 + (t.id % 5) * 10000,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/unknown.png"
    }
  }));

  const result = teamId ? list.filter(item => item.team.id === teamId) : list;
  res.json(API_V3_ENVELOPE("teams", req.query, result));
});

// 6. Livescore
app.get("/api/v3/livescore", (req, res) => {
  const result = activeLiveFixture ? [
    {
      fixture: {
        id: 98765,
        referee: "Wilton Sampaio",
        timezone: "America/Sao_Paulo",
        date: "2026-05-23T16:00:00-03:00",
        timestamp: Date.now(),
        periods: { first: null, second: null },
        venue: { id: 204, name: "Estádio Especial", city: "São Paulo" },
        status: { long: "In Progress", short: "1H", elapsed: activeLiveFixture.minute }
      },
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "", flag: "", season: 2026, round: "Rodada 1" },
      teams: {
        home: { id: 126, name: "São Paulo FC", logo: "", winner: null },
        away: { id: 121, name: "SE Palmeiras", logo: "", winner: null }
      },
      goals: { home: activeLiveFixture.homeScore, away: activeLiveFixture.awayScore },
      score: {
        halftime: { home: 0, away: 0 },
        fulltime: { home: activeLiveFixture.homeScore, away: activeLiveFixture.awayScore },
        extratime: { home: null, away: null },
        penalty: { home: null, away: null }
      },
      events: [
        { time: { elapsed: 12 }, team: { id: 126, name: "São Paulo FC" }, player: { id: 101, name: "Calleri" }, assist: { id: null, name: null }, type: "Goal", detail: "Normal Goal", comments: null }
      ]
    }
  ] : [
    {
      fixture: {
        id: 98766,
        referee: "Ramon Abatti",
        timezone: "America/Sao_Paulo",
        date: "2026-05-23T16:00:00-03:00",
        timestamp: Date.now(),
        periods: { first: null, second: null },
        venue: { id: 204, name: "Estádio Olimpico", city: "Porto Alegre" },
        status: { long: "Scheduled", short: "NS", elapsed: 0 }
      },
      league: { id: 71, name: "Brasileirão Série A", country: "Brazil", logo: "", flag: "", season: 2026, round: "Rodada 1" },
      teams: {
        home: { id: 123, name: "Grêmio FBPA", logo: "", winner: null },
        away: { id: 124, name: "CR Flamengo", logo: "", winner: null }
      },
      goals: { home: null, away: null },
      score: {
        halftime: { home: null, away: null },
        fulltime: { home: null, away: null }
      },
      events: []
    }
  ];
  res.json(API_V3_ENVELOPE("livescore", req.query, result));
});

// 7. Fixtures
app.get("/api/v3/fixtures", (req, res) => {
  const result = HISTORICAL_MATCHES.map((m: any) => ({
    fixture: { id: m.id, referee: "Claudio Cerdeira", timezone: "America/Sao_Paulo", date: m.date, timestamp: 1716480000, status: { long: "Match Finished", short: "FT", elapsed: 90 } },
    league: { id: 71, name: m.championship, country: "Brazil", season: 2025, round: "Regular Season" },
    teams: {
      home: { id: m.homeTeamId, name: m.homeTeamName, logo: "" },
      away: { id: m.awayTeamId, name: m.awayTeamName, logo: "" }
    },
    goals: { home: m.homeScore, away: m.awayScore },
    score: { halftime: { home: Math.floor(m.homeScore / 2), away: Math.floor(m.awayScore / 2) }, fulltime: { home: m.homeScore, away: m.awayScore } }
  }));
  res.json(API_V3_ENVELOPE("fixtures", req.query, result));
});

// 8. Head 2 Head
app.get("/api/v3/fixtures/headtohead", (req, res) => {
  const h2hStr = req.query.h2h as string || "126-121";
  const [t1, t2] = h2hStr.split("-").map(v => parseInt(v));
  const tHomeObj = TEAMS_DATA.find(t => t.id === t1) || TEAMS_DATA[0];
  const tAwayObj = TEAMS_DATA.find(t => t.id === t2) || TEAMS_DATA[1];
  const list = generateH2HMatches(tHomeObj, tAwayObj, "Brasileirão Série A");
  const result = list.map(m => ({
    fixture: { id: m.id, referee: "Ana Paula Oliveira", date: m.date, status: { long: "Finished", short: "FT" } },
    teams: { home: { id: m.homeTeamId, name: m.homeTeamName }, away: { id: m.awayTeamId, name: m.awayTeamName } },
    goals: { home: m.homeScore, away: m.awayScore }
  }));
  res.json(API_V3_ENVELOPE("fixtures/headtohead", req.query, result));
});

// 9. Events
app.get("/api/v3/fixtures/events", (req, res) => {
  const result = [
    { time: { elapsed: 15, extra: null }, team: { id: 126, name: "São Paulo", logo: "" }, player: { id: 1204, name: "Jonathan Calleri" }, assist: { id: 310, name: "Lucas Moura" }, type: "Goal", detail: "Normal Goal", comments: null },
    { time: { elapsed: 34, extra: null }, team: { id: 121, name: "Palmeiras", logo: "" }, player: { id: 981, name: "Richard Rios" }, assist: { id: null, name: null }, type: "Card", detail: "Yellow Card", comments: "Foul check" },
    { time: { elapsed: 65, extra: null }, team: { id: 121, name: "Palmeiras", logo: "" }, player: { id: 981, name: "Felipe Anderson" }, assist: { id: 111, name: "Veiga" }, type: "Goal", detail: "Header Goal", comments: null },
    { time: { elapsed: 81, extra: null }, team: { id: 126, name: "São Paulo", logo: "" }, player: { id: 541, name: "Alisson" }, assist: { id: null, name: null }, type: "subst", detail: "Substitution", comments: "Tactical switch" }
  ];
  res.json(API_V3_ENVELOPE("fixtures/events", req.query, result));
});

// 10. Line Ups
app.get("/api/v3/fixtures/lineups", (req, res) => {
  const result = [
    {
      team: { id: 126, name: "São Paulo FC", logo: "", colors: null },
      coach: { id: 4891, name: "Luis Zubeldía", photo: "" },
      formation: "4-2-3-1",
      startXI: [
        { player: { id: 9001, name: "Rafael", number: 23, pos: "G", grid: "1:1" } },
        { player: { id: 9002, name: "Rafinha", number: 13, pos: "D", grid: "2:1" } },
        { player: { id: 9003, name: "Arboleda", number: 5, pos: "D", grid: "2:2" } },
        { player: { id: 9004, name: "Alan Franco", number: 2, pos: "D", grid: "2:3" } },
        { player: { id: 9005, name: "Welington", number: 6, pos: "D", grid: "2:4" } },
        { player: { id: 9006, name: "Luiz Gustavo", number: 8, pos: "M", grid: "3:1" } },
        { player: { id: 9007, name: "Alisson", number: 25, pos: "M", grid: "3:2" } },
        { player: { id: 9008, name: "Lucas Moura", number: 7, pos: "M", grid: "4:1" } },
        { player: { id: 9009, name: "Luciano", number: 10, pos: "M", grid: "4:2" } },
        { player: { id: 9010, name: "Nestor", number: 11, pos: "M", grid: "4:3" } },
        { player: { id: 9011, name: "Jonathan Calleri", number: 9, pos: "F", grid: "5:1" } }
      ],
      substitutes: [
        { player: { id: 9012, name: "Jandrei", number: 1, pos: "G", grid: null } },
        { player: { id: 9013, name: "Ferreirinha", number: 47, pos: "F", grid: null } }
      ]
    },
    {
      team: { id: 121, name: "SE Palmeiras", logo: "", colors: null },
      coach: { id: 105, name: "Abel Ferreira", photo: "" },
      formation: "4-3-3",
      startXI: [
        { player: { id: 8001, name: "Weverton", number: 21, pos: "G", grid: "1:1" } },
        { player: { id: 8002, name: "Marcos Rocha", number: 2, pos: "D", grid: "2:1" } },
        { player: { id: 8003, name: "Gustavo Gómez", number: 15, pos: "D", grid: "2:2" } },
        { player: { id: 8004, name: "Murilo", number: 26, pos: "D", grid: "2:3" } },
        { player: { id: 8005, name: "Vanderlan", number: 6, pos: "D", grid: "2:4" } },
        { player: { id: 8006, name: "Aníbal Moreno", number: 5, pos: "M", grid: "3:1" } },
        { player: { id: 8007, name: "Richard Ríos", number: 27, pos: "M", grid: "3:2" } },
        { player: { id: 8008, name: "Raphael Veiga", number: 23, pos: "M", grid: "3:3" } },
        { player: { id: 8009, name: "Estêvão", number: 41, pos: "F", grid: "4:1" } },
        { player: { id: 8010, name: "Flaco López", number: 42, pos: "F", grid: "4:2" } },
        { player: { id: 8011, name: "Felipe Anderson", number: 9, pos: "F", grid: "4:3" } }
      ],
      substitutes: [
        { player: { id: 8012, name: "Marcelo Lomba", number: 1, pos: "G", grid: null } },
        { player: { id: 8013, name: "Rony", number: 10, pos: "F", grid: null } }
      ]
    }
  ];
  res.json(API_V3_ENVELOPE("fixtures/lineups", req.query, result));
});

// 11. Top Scorers
app.get("/api/v3/players/topscorers", (req, res) => {
  const result = [
    {
      player: { id: 450, name: "Pedro", firstname: "Pedro", lastname: "Guilherme", age: 28, nationality: "Brazil", photo: "" },
      statistics: [{ team: { id: 124, name: "Flamengo" }, league: { id: 71, name: "Série A" }, games: { appearances: 22, rating: "7.85" }, goals: { total: 16, assists: 4 } }]
    },
    {
      player: { id: 1204, name: "Jonathan Calleri", firstname: "Jonathan", lastname: "Calleri", age: 32, nationality: "Argentina", photo: "" },
      statistics: [{ team: { id: 126, name: "São Paulo FC" }, league: { id: 71, name: "Série A" }, games: { appearances: 24, rating: "7.62" }, goals: { total: 12, assists: 3 } }]
    },
    {
      player: { id: 810, name: "Estêvão", firstname: "Estêvão", lastname: "Willian", age: 19, nationality: "Brazil", photo: "" },
      statistics: [{ team: { id: 121, name: "Palmeiras" }, league: { id: 71, name: "Série A" }, games: { appearances: 23, rating: "7.92" }, goals: { total: 11, assists: 8 } }]
    },
    {
      player: { id: 620, name: "Hulk", firstname: "Givanildo", lastname: "Vieira", age: 39, nationality: "Brazil", photo: "" },
      statistics: [{ team: { id: 129, name: "Atlético Mineiro" }, league: { id: 71, name: "Série A" }, games: { appearances: 19, rating: "7.55" }, goals: { total: 10, assists: 5 } }]
    }
  ];
  res.json(API_V3_ENVELOPE("players/topscorers", req.query, result));
});

// 12. Players & Coaches
app.get("/api/v3/players", (req, res) => {
  const results = PLAYERS_DATA.map((p: any) => ({
    player: { id: p.id, name: p.name, age: p.age || 27, nationality: "Brazil" },
    statistics: [{ team: { id: p.teamId, name: p.teamName }, games: { rating: p.rating || "7.10" }, goals: { total: p.goals || 0 } }]
  }));
  res.json(API_V3_ENVELOPE("players", req.query, results));
});

app.get("/api/v3/coachs", (req, res) => {
  const result = [
    { id: 105, name: "Abel Ferreira", firstname: "Abel", lastname: "Ferreira", age: 47, nationality: "Portugal", team: { id: 121, name: "SE Palmeiras" }, career: [{ team: { name: "Palmeiras" }, start: "2020-10", end: null }] },
    { id: 4891, name: "Luis Zubeldía", firstname: "Luis", lastname: "Zubeldía", age: 45, nationality: "Argentina", team: { id: 126, name: "São Paulo FC" }, career: [{ team: { name: "São Paulo" }, start: "2024-04", end: null }] },
    { id: 102, name: "Filipe Luís", firstname: "Filipe", lastname: "Luís", age: 40, nationality: "Brazil", team: { id: 124, name: "CR Flamengo" }, career: [{ team: { name: "Flamengo" }, start: "2024-09", end: null }] }
  ];
  res.json(API_V3_ENVELOPE("coachs", req.query, result));
});

// 14. Transfers
app.get("/api/v3/transfers", (req, res) => {
  const result = [
    { player: { id: 251, name: "Felipe Anderson" }, transfer: { date: "2024-07-01", type: "Free Transfer", teams: { out: { id: 504, name: "Lazio" }, in: { id: 121, name: "Palmeiras" } } } },
    { player: { id: 1302, name: "Thiago Silva" }, transfer: { date: "2024-07-10", type: "Free Transfer", teams: { out: { id: 12, name: "Chelsea" }, in: { id: 127, name: "Fluminense" } } } },
    { player: { id: 911, name: "Bernard" }, transfer: { date: "2024-06-20", type: "Free Transfer", teams: { out: { id: 42, name: "Panathinaikos" }, in: { id: 129, name: "Atlético Mineiro" } } } }
  ];
  res.json(API_V3_ENVELOPE("transfers", req.query, result));
});

// 15. Trophies
app.get("/api/v3/trophies", (req, res) => {
  const result = [
    { league: "Copa Libertadores", country: "South America", season: "2020, 2021", place: "Winner" },
    { league: "Brasileirão Série A", country: "Brazil", season: "2022, 2023", place: "Winner" },
    { league: "Copa do Brasil", country: "Brazil", season: "2023", place: "Winner" },
    { league: "Copa Sul-Americana", country: "South America", season: "2012, 2022", place: "Winner" }
  ];
  res.json(API_V3_ENVELOPE("trophies", req.query, result));
});

// 16. Sidelined
app.get("/api/v3/sidelined", (req, res) => {
  const result = [
    { player: { id: 810, name: "Murilo (D - PAL)" }, type: "Suspenso", start: "2026-05-20", end: "2026-05-24" },
    { player: { id: 1205, name: "Pablo Maia (M - SPFC)" }, type: "Estiramento Coxa", start: "2026-04-10", end: "2026-06-15" },
    { player: { id: 450, name: "Pedro (F - FLA)" }, type: "Ruptura de Ligamento", start: "2025-09-04", end: "2026-06-30" }
  ];
  res.json(API_V3_ENVELOPE("sidelined", req.query, result));
});

// 17. Injuries
app.get("/api/v3/injuries", (req, res) => {
  const result = [
    { fixture: { id: 98765, date: "2026-05-23" }, league: { id: 71, name: "Brasileirão" }, team: { id: 126, name: "São Paulo FC" }, player: { id: 9005, name: "Welington", type: "Lesão Muscular" } },
    { fixture: { id: 98765, date: "2026-05-23" }, league: { id: 71, name: "Brasileirão" }, team: { id: 121, name: "SE Palmeiras" }, player: { id: 8011, name: "Felipe Anderson", type: "Pancada no Tornozelo" } }
  ];
  res.json(API_V3_ENVELOPE("injuries", req.query, result));
});

// 18. Inplay Odds
app.get("/api/v3/odds/live", (req, res) => {
  const scoreCombined = activeLiveFixture ? (activeLiveFixture.homeScore + activeLiveFixture.awayScore) : 0;
  const result = [
    {
      fixture: { id: 98765 },
      odds: [
        { id: 1, name: "Vencedor do Encontro", values: [{ value: "Home", odd: activeLiveFixture && activeLiveFixture.homeScore > activeLiveFixture.awayScore ? "1.45" : "2.60" }, { value: "Draw", odd: "3.10" }, { value: "Away", odd: "3.80" }] },
        { id: 5, name: "Próximo Gol", values: [{ value: "Home", odd: "1.80" }, { value: "No Goal", odd: "6.50" }, { value: "Away", odd: "2.40" }] },
        { id: 8, name: "Total Gols (Over / Under)", values: [{ value: `Over ${scoreCombined + 0.5}`, odd: "1.52" }, { value: `Under ${scoreCombined + 0.5}`, odd: "2.45" }] }
      ]
    }
  ];
  res.json(API_V3_ENVELOPE("odds/live", req.query, result));
});

// 19. Pre-match Odds
app.get("/api/v3/odds", (req, res) => {
  const result = [
    {
      fixture: { id: 98765, date: "2026-05-23" },
      bookmakers: [{
        id: 8, name: "Bet365",
        bets: [
          { name: "Resultados Finais", values: [{ value: "São Paulo", odd: "2.40" }, { value: "Empate", odd: "3.20" }, { value: "Palmeiras", odd: "3.00" }] },
          { name: "Ambas Marcam", values: [{ value: "Sim", odd: "1.80" }, { value: "Não", odd: "1.95" }] },
          { name: "Total de Gols 2.5", values: [{ value: "Over", odd: "2.10" }, { value: "Under", odd: "1.72" }] }
        ]
      }]
    }
  ];
  res.json(API_V3_ENVELOPE("odds", req.query, result));
});

// 20. Statistics
app.get("/api/v3/fixtures/statistics", (req, res) => {
  const result = [
    {
      team: { id: 126, name: "São Paulo FC" },
      statistics: [
        { type: "Shots on Goal", value: activeLiveFixture ? activeLiveFixture.stats.shotsOnTargetHome : 5 },
        { type: "Total Shots", value: activeLiveFixture ? Math.round(activeLiveFixture.stats.shotsOnTargetHome * 2.3) : 12 },
        { type: "Fouls", value: 14 },
        { type: "Corner Kicks", value: activeLiveFixture ? activeLiveFixture.stats.cornersHome : 6 },
        { type: "Ball Possession", value: activeLiveFixture ? `${activeLiveFixture.stats.possessionHome}%` : "52%" },
        { type: "Yellow Cards", value: activeLiveFixture ? activeLiveFixture.stats.cardsYellowHome : 2 }
      ]
    },
    {
      team: { id: 121, name: "SE Palmeiras" },
      statistics: [
        { type: "Shots on Goal", value: activeLiveFixture ? activeLiveFixture.stats.shotsOnTargetAway : 4 },
        { type: "Total Shots", value: activeLiveFixture ? Math.round(activeLiveFixture.stats.shotsOnTargetAway * 2.4) : 10 },
        { type: "Fouls", value: 16 },
        { type: "Corner Kicks", value: activeLiveFixture ? activeLiveFixture.stats.cornersAway : 4 },
        { type: "Ball Possession", value: activeLiveFixture ? `${100 - activeLiveFixture.stats.possessionHome}%` : "48%" },
        { type: "Yellow Cards", value: activeLiveFixture ? activeLiveFixture.stats.cardsYellowAway : 3 }
      ]
    }
  ];
  res.json(API_V3_ENVELOPE("fixtures/statistics", req.query, result));
});

// 21. Predictions
app.get("/api/v3/predictions", (req, res) => {
  const homeId = parseInt(req.query.home as string || "126");
  const awayId = parseInt(req.query.away as string || "121");
  const tHome = TEAMS_DATA.find(t => t.id === homeId) || TEAMS_DATA[0];
  const tAway = TEAMS_DATA.find(t => t.id === awayId) || TEAMS_DATA[1];
  const homeAdjusted = adjustStatsForChampionship(tHome, "Brasileirão Série A");
  const awayAdjusted = adjustStatsForChampionship(tAway, "Brasileirão Série A");

  const calc = calculatePoissonMatchProbabilities(
    homeAdjusted.avgGoalsScored,
    homeAdjusted.avgGoalsConceded,
    awayAdjusted.avgGoalsScored,
    awayAdjusted.avgGoalsConceded
  );

  const result = {
    predictions: {
      winner: { id: homeId, name: parseFloat(calc.homeWin) > parseFloat(calc.awayWin) ? tHome.name : tAway.name, comment: "Favorecido pelas médias calculadas" },
      under_over: calc.over25,
      btts: calc.btts,
      percent: { home: calc.homeWin, draw: calc.draw, away: calc.awayWin }
    },
    teams: {
      home: { id: tHome.id, name: tHome.name, last_5: { form: "WWDLD", att: "82%", def: "64%" } },
      away: { id: tAway.id, name: tAway.name, last_5: { form: "WWLLW", att: "74%", def: "52%" } }
    },
    comparison: {
      form: { home: "54%", away: "46%" },
      att: { home: "62%", away: "58%" },
      def: { home: "72%", away: "68%" },
      h2h: { home: "50%", away: "50%" }
    }
  };
  res.json(API_V3_ENVELOPE("predictions", req.query, result));
});

// Vite & Static Asset handling (Development vs Production middleware)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
