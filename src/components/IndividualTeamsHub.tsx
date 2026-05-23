/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TeamStats, PlayerStats } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Award, Percent, TrendingUp, Flame, Shield, Activity, 
  Target, AlertCircle, ChevronRight, HelpCircle, BarChart3,
  CheckCircle2, MinusCircle, XCircle, Plus, Sparkles, Filter, Check, Trash2
} from "lucide-react";

// Same historical database of the last 10 matches to keep cohesiveness
interface RecentMatch {
  id: string;
  date: string;
  opponent: string;
  isHome: boolean;
  goalsScored: number;
  goalsConceded: number;
  corners: number;
  shots: number;
  yellowCards: number;
}

const EXTENDED_RECENT_MATCHES: Record<number, RecentMatch[]> = {
  121: [ // SE Palmeiras
    { id: "p1", date: "2026-05-17", opponent: "EC Bahia", isHome: true, goalsScored: 2, goalsConceded: 1, corners: 8, shots: 17, yellowCards: 2 },
    { id: "p2", date: "2026-05-10", opponent: "Vasco da Gama", isHome: false, goalsScored: 1, goalsConceded: 0, corners: 6, shots: 14, yellowCards: 3 },
    { id: "p3", date: "2026-05-03", opponent: "Athletico-PR", isHome: true, goalsScored: 3, goalsConceded: 0, corners: 9, shots: 19, yellowCards: 1 },
    { id: "p4", date: "2026-04-25", opponent: "CR Flamengo", isHome: true, goalsScored: 2, goalsConceded: 2, corners: 8, shots: 15, yellowCards: 2 },
    { id: "p5", date: "2026-04-18", opponent: "Fluminense", isHome: false, goalsScored: 2, goalsConceded: 1, corners: 5, shots: 12, yellowCards: 4 },
    { id: "p6", date: "2026-04-12", opponent: "SC Corinthians", isHome: true, goalsScored: 3, goalsConceded: 1, corners: 9, shots: 19, yellowCards: 2 },
    { id: "p7", date: "2026-04-05", opponent: "Botafogo F.R.", isHome: false, goalsScored: 0, goalsConceded: 1, corners: 4, shots: 10, yellowCards: 3 },
    { id: "p8", date: "2026-03-29", opponent: "Red Bull Bragantino", isHome: true, goalsScored: 4, goalsConceded: 1, corners: 7, shots: 18, yellowCards: 1 },
    { id: "p9", date: "2026-03-22", opponent: "Grêmio FBPA", isHome: false, goalsScored: 2, goalsConceded: 0, corners: 6, shots: 13, yellowCards: 2 },
    { id: "p10", date: "2026-03-15", opponent: "São Paulo FC", isHome: false, goalsScored: 2, goalsConceded: 1, corners: 7, shots: 15, yellowCards: 3 }
  ],
  126: [ // São Paulo
    { id: "s1", date: "2026-05-18", opponent: "CR Flamengo", isHome: false, goalsScored: 1, goalsConceded: 2, corners: 5, shots: 12, yellowCards: 3 },
    { id: "s2", date: "2026-05-11", opponent: "EC Bahia", isHome: true, goalsScored: 2, goalsConceded: 1, corners: 7, shots: 16, yellowCards: 2 },
    { id: "s3", date: "2026-05-04", opponent: "Criciúma EC", isHome: false, goalsScored: 1, goalsConceded: 1, corners: 4, shots: 11, yellowCards: 4 },
    { id: "s4", date: "2026-04-27", opponent: "Cruzeiro EC", isHome: true, goalsScored: 2, goalsConceded: 0, corners: 8, shots: 15, yellowCards: 1 },
    { id: "s5", date: "2026-04-20", opponent: "Juventude", isHome: false, goalsScored: 0, goalsConceded: 0, corners: 3, shots: 9, yellowCards: 2 },
    { id: "s6", date: "2026-04-13", opponent: "Atlético Mineiro", isHome: true, goalsScored: 3, goalsConceded: 1, corners: 8, shots: 18, yellowCards: 2 },
    { id: "s7", date: "2026-04-06", opponent: "Athletico-PR", isHome: false, goalsScored: 1, goalsConceded: 2, corners: 5, shots: 13, yellowCards: 3 },
    { id: "s8", date: "2026-03-30", opponent: "Fortaleza EC", isHome: true, goalsScored: 2, goalsConceded: 0, corners: 6, shots: 14, yellowCards: 1 },
    { id: "s9", date: "2026-03-10", opponent: "SC Corinthians", isHome: true, goalsScored: 2, goalsConceded: 1, corners: 8, shots: 16, yellowCards: 3 },
    { id: "s10", date: "2026-03-03", opponent: "SE Palmeiras", isHome: true, goalsScored: 1, goalsConceded: 2, corners: 5, shots: 13, yellowCards: 4 }
  ]
};

// Curated Elite Series B & C Teams
const PRELOADED_B_C_TEAMS: TeamStats[] = [
  {
    id: 132,
    name: "Santos FC",
    shortName: "SAN",
    logo: "https://media.api-sports.io/football/teams/132.png",
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
  }
];

// Curated Elite Feminino Teams (Crucial request by user!)
const PRELOADED_FEMININO_TEAMS: TeamStats[] = [
  {
    id: 901,
    name: "Corinthians Feminino",
    shortName: "COR-F",
    logo: "https://media.api-sports.io/football/teams/131.png", // styled avatar in rendering
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
  }
];

// Fallback generator for other teams to stay consistent
function getTeamMatches(teamId: number, teamName: string, avgGoals: number, avgConceded: number): RecentMatch[] {
  if (EXTENDED_RECENT_MATCHES[teamId]) return EXTENDED_RECENT_MATCHES[teamId];

  const opponentList = ["São Paulo", "Palmeiras", "Corinthians", "Flamengo", "Bahia", "Botafogo", "Vasco", "Cruzeiro", "Grêmio", "Internacional"];
  const matches: RecentMatch[] = [];

  for (let i = 1; i <= 10; i++) {
    const isHome = i % 2 === 0;
    const opponent = opponentList[i % opponentList.length];
    
    // Generate scores near to the average goals
    let gs = Math.floor(avgGoals + (Math.random() * 2 - 1));
    if (gs < 0) gs = 0;
    let gc = Math.floor(avgConceded + (Math.random() * 2 - 1));
    if (gc < 0) gc = 0;

    matches.push({
      id: `m-gen-${teamId}-${i}`,
      date: `2026-04-${25 - i}`,
      opponent: opponent + " FC",
      isHome,
      goalsScored: gs,
      goalsConceded: gc,
      corners: Math.floor(5.5 + (Math.random() * 5 - 2.5)),
      shots: Math.floor(13.2 + (Math.random() * 6 - 3)),
      yellowCards: Math.floor(2.2 + (Math.random() * 3 - 1.5))
    });
  }
  return matches;
}

interface IndividualTeamsHubProps {
  teams: TeamStats[];
  setTeams?: React.Dispatch<React.SetStateAction<TeamStats[]>>;
  playersByTeam: PlayerStats[];
  setPlayers?: React.Dispatch<React.SetStateAction<PlayerStats[]>>;
}

export default function IndividualTeamsHub({ teams, setTeams, playersByTeam, setPlayers }: IndividualTeamsHubProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<'all' | 'serie_a' | 'serie_b_c' | 'feminino' | 'custom'>('serie_a');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // States for the creation engine popup/view
  const [showIndexer, setShowIndexer] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const [createdSigla, setCreatedSigla] = useState("");
  const [createdGender, setCreatedGender] = useState<"masculino" | "feminino">("masculino");
  const [createdTier, setCreatedTier] = useState("Série B");
  const [createdStyle, setCreatedStyle] = useState<"ofensivo" | "defensivo" | "cantos" | "fisico" | "equilibrado">("equilibrado");
  const [createdColor, setCreatedColor] = useState("bg-emerald-600");

  // Advanced Filter state variables
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "club" | "national">("all");

  // State variables for newly created index custom team
  const [createdCountry, setCreatedCountry] = useState<string>("Brasil");
  const [createdState, setCreatedState] = useState<string>("SP");
  const [createdCity, setCreatedCity] = useState<string>("São Paulo");
  const [createdLeague, setCreatedLeague] = useState<string>("Brasileirão Série B");

  const colorOptions = [
    { value: "bg-emerald-600", label: "Verde e Branco" },
    { value: "bg-rose-600", label: "Vermelho e Preto" },
    { value: "bg-blue-600", label: "Azul e Branco" },
    { value: "bg-amber-500", label: "Amarelo e Preto" },
    { value: "bg-purple-600", label: "Roxo e Branco" },
    { value: "bg-slate-300", label: "Brilhante Alvinegro" },
    { value: "bg-orange-500", label: "Laranja e Azul" }
  ];

  // Auto-merge preloaded series B/C and Feminino on load to seed master database
  useEffect(() => {
    if (setTeams) {
      setTeams(prevTeams => {
        const merged = [...prevTeams];
        let updated = false;

        PRELOADED_B_C_TEAMS.forEach(bt => {
          if (!merged.find(t => t.id === bt.id)) {
            merged.push(bt);
            updated = true;
          }
        });

        PRELOADED_FEMININO_TEAMS.forEach(ft => {
          if (!merged.find(t => t.id === ft.id)) {
            merged.push(ft);
            updated = true;
          }
        });

        return updated ? merged : prevTeams;
      });
    }

    if (setPlayers) {
      setPlayers(prevPlayers => {
        const merged = [...prevPlayers];
        let updated = false;

        const CUSTOM_PRE_SQUAD: PlayerStats[] = [
          { id: 132001, name: "Guilherme", teamId: 132, teamName: "Santos FC", position: "Atacante", matches: 34, goals: 12, assists: 6, shotsPerGame: 2.6, shotsOnTargetPerGame: 1.3, cornersWonPerGame: 1.2, yellowCards: 4, redCards: 0, rating: 7.42 },
          { id: 132002, name: "Diego Pituca", teamId: 132, teamName: "Santos FC", position: "Meio-campo", matches: 35, goals: 5, assists: 5, shotsPerGame: 1.4, shotsOnTargetPerGame: 0.6, cornersWonPerGame: 1.8, yellowCards: 8, redCards: 1, rating: 7.28 },
          { id: 901001, name: "Vic Albuquerque", teamId: 901, teamName: "Corinthians Feminino", position: "Meio-campo", matches: 26, goals: 14, assists: 8, shotsPerGame: 3.1, shotsOnTargetPerGame: 1.6, cornersWonPerGame: 2.3, yellowCards: 2, redCards: 0, rating: 7.85 },
          { id: 901002, name: "Gabi Portilho", teamId: 901, teamName: "Corinthians Feminino", position: "Atacante", matches: 25, goals: 10, assists: 11, shotsPerGame: 2.8, shotsOnTargetPerGame: 1.5, cornersWonPerGame: 1.4, yellowCards: 3, redCards: 0, rating: 7.72 }
        ];

        CUSTOM_PRE_SQUAD.forEach(ps => {
          if (!merged.find(p => p.id === ps.id)) {
            merged.push(ps);
            updated = true;
          }
        });

        return updated ? merged : prevPlayers;
      });
    }
  }, [setTeams, setPlayers]);

  // Assist autocomplete for sigla when user types createdName
  useEffect(() => {
    if (createdName.length >= 3 && !createdSigla) {
      const parts = createdName.split(" ");
      if (parts.length >= 2) {
        setCreatedSigla((parts[0][0] + parts[1][0] + (parts[2]?.[0] || parts[1]?.[1] || "C")).toUpperCase().slice(0, 3));
      } else {
        setCreatedSigla((createdName.slice(0, 3)).toUpperCase());
      }
    }
  }, [createdName]);

  // Filter teams based on selected active category AND search query
  const getTeamCategory = (t: TeamStats): 'serie_a' | 'serie_b_c' | 'feminino' | 'custom' => {
    if (t.division) return t.division;
    if (t.id >= 900 && t.id < 1000) return 'feminino';
    if (t.id >= 132 && t.id <= 199) return 'serie_b_c';
    if (t.id >= 10000) return 'custom';
    return 'serie_a';
  };

  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // 2. Country filter
    if (selectedCountry !== "all") {
      const countryStr = t.country || "Brasil";
      if (countryStr.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    }

    // 3. State filter
    if (selectedState !== "all") {
      const stateStr = t.state || "-";
      if (stateStr.toUpperCase() !== selectedState.toUpperCase()) return false;
    }

    // 4. League filter
    if (selectedLeague !== "all") {
      const teamLeague = t.league || "";
      if (teamLeague.toLowerCase() !== selectedLeague.toLowerCase()) return false;
    }

    // 5. Team type filter
    if (selectedType !== "all") {
      const isTeamNat = !!t.isNational;
      if (selectedType === "national" && !isTeamNat) return false;
      if (selectedType === "club" && isTeamNat) return false;
    }

    // If search or advanced filtering is active, bypass simple category layout tabs
    const isAnyAdvFilterActive = searchQuery.trim().length > 0 || selectedCountry !== "all" || selectedState !== "all" || selectedLeague !== "all" || selectedType !== "all";
    if (isAnyAdvFilterActive) return true;

    const cat = getTeamCategory(t);
    if (activeCategory === 'all') return true;
    return cat === activeCategory;
  });

  const customTeamsCount = teams.filter(t => getTeamCategory(t) === 'custom').length;

  // Primary Selected Team logic
  const currentTeamId = selectedTeamId !== null ? selectedTeamId : (filteredTeams[0]?.id || teams[0]?.id);
  const activeTeam = teams.find(t => t.id === currentTeamId);

  // Pull individual players for this team
  const activePlayers = playersByTeam.filter(p => p.teamId === currentTeamId);

  // Fallback matches timeline
  const matches = activeTeam ? getTeamMatches(activeTeam.id, activeTeam.name, activeTeam.avgGoalsScored, activeTeam.avgGoalsConceded) : [];

  // Index creator confirmation handler
  const handleIndexNewTeam = () => {
    if (!createdName.trim()) return;
    const sigla = createdSigla.trim() || createdName.slice(0, 3).toUpperCase();
    
    // Mathematical algorithm for realistic stats corresponding to athletic profile
    const id = Math.floor(10000 + Math.random() * 89999);
    const isOffensive = createdStyle === 'ofensivo';
    const isDefensive = createdStyle === 'defensivo';
    const isCorners = createdStyle === 'cantos';
    const isPhysical = createdStyle === 'fisico';

    let avgGoalsScored = 1.30;
    let avgGoalsConceded = 1.25;
    let avgShots = 12.5;
    let avgShotsOnTarget = 4.2;
    let avgCornersFor = 5.2;
    let avgCornersAgainst = 5.0;
    let avgPossession = 50;
    let avgCardsYellow = 2.4;
    let avgCardsRed = 0.11;
    let avgFouls = 14.1;
    let avgTackles = 15.8;

    if (isOffensive) {
      avgGoalsScored = 1.78;
      avgGoalsConceded = 1.35;
      avgShots = 14.9;
      avgShotsOnTarget = 5.5;
      avgPossession = 54.5;
    } else if (isDefensive) {
      avgGoalsScored = 0.95;
      avgGoalsConceded = 0.88;
      avgShots = 10.4;
      avgShotsOnTarget = 3.3;
      avgPossession = 45.1;
    } else if (isCorners) {
      avgCornersFor = 7.1;
      avgCornersAgainst = 4.7;
      avgShots = 13.5;
    } else if (isPhysical) {
      avgCardsYellow = 3.2;
      avgCardsRed = 0.18;
      avgFouls = 17.5;
      avgTackles = 17.8;
    }

    const bttsVal = isOffensive ? 58 : isDefensive ? 32 : 48;
    const over15Val = isOffensive ? 85 : isDefensive ? 62 : 72;
    const over25Val = isOffensive ? 62 : isDefensive ? 30 : 45;
    const over35Val = isOffensive ? 28 : isDefensive ? 11 : 18;
    const overHt = isOffensive ? 75 : isDefensive ? 50 : 60;
    const cleanS = isDefensive ? 45 : isOffensive ? 22 : 30;

    const newTeam: TeamStats = {
      id,
      name: createdName,
      shortName: sigla.slice(0, 3).toUpperCase(),
      logo: `custom-badge:${createdColor}`, // Embedded color for gradient badges
      division: "custom",
      country: createdCountry,
      state: createdState,
      city: createdCity || "Cidade Metropolitana",
      league: createdLeague,
      isNational: createdCountry === "Internacional",
      matchesPlayed: 38,
      avgGoalsScored,
      avgGoalsConceded,
      avgShots,
      avgShotsOnTarget,
      avgCorners: parseFloat((avgCornersFor + avgCornersAgainst).toFixed(1)),
      avgCornersFor,
      avgCornersAgainst,
      avgPossession,
      avgCardsYellow,
      avgCardsRed,
      bttsPercentage: bttsVal,
      over25Percentage: over25Val,
      over15Percentage: over15Val,
      over35Percentage: over35Val,
      over05HTPercentage: overHt,
      cleanSheetsPercentage: cleanS,
      avgFouls,
      avgOffsides: 1.5,
      avgTackles
    };

    // Synchronize newly created custom team with the backend in-memory DB
    fetch("/api/football/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeam)
    }).catch(err => console.error("Falha ao salvar time no backend:", err));

    // Auto-spawn 2 high-quality reference star players matching gender
    const isFem = createdGender === 'feminino';
    const firstNamesMale = ["Thiago", "Renato", "Vitor", "Gabriel", "Rodrigo", "Lucas", "Mateus", "Felipe", "Breno", "Gustavo"];
    const lastNamesMale = ["Silva", "Souza", "Augusto", "Barbosa", "Melo", "Santos", "Ribeiro", "Cardoso", "Lima", "Batista"];
    
    const firstNamesFem = ["Gabriela", "Mariana", "Letícia", "Andressa", "Vitória", "Tamires", "Beatriz", "Luana", "Thaís", "Juliana"];
    const lastNamesFem = ["Santos", "Oliveira", "Nascimento", "Custódio", "Zaneratto", "Vieira", "Brandão", "Alves", "Sousa"];

    const r1_first = isFem ? firstNamesFem[Math.floor(Math.random() * firstNamesFem.length)] : firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
    const r1_last = isFem ? lastNamesFem[Math.floor(Math.random() * lastNamesFem.length)] : lastNamesMale[Math.floor(Math.random() * lastNamesMale.length)];
    
    const r2_first = isFem ? firstNamesFem[Math.floor(Math.random() * firstNamesFem.length)] : firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
    const r2_last = isFem ? lastNamesFem[Math.floor(Math.random() * lastNamesFem.length)] : lastNamesMale[Math.floor(Math.random() * lastNamesMale.length)];

    const starPlayer1: PlayerStats = {
      id: Math.floor(200000 + Math.random() * 700000),
      name: `${r1_first} ${r1_last}`,
      teamId: id,
      teamName: createdName,
      position: "Atacante",
      matches: 33,
      goals: isOffensive ? 15 : 8,
      assists: 5,
      shotsPerGame: isOffensive ? 3.2 : 2.1,
      shotsOnTargetPerGame: isOffensive ? 1.5 : 0.9,
      cornersWonPerGame: 0.8,
      yellowCards: 3,
      redCards: 0,
      rating: isOffensive ? 7.55 : 7.10
    };

    const starPlayer2: PlayerStats = {
      id: Math.floor(200000 + Math.random() * 700000),
      name: `${r2_first} ${r2_last}`,
      teamId: id,
      teamName: createdName,
      position: "Meio-campo",
      matches: 31,
      goals: 4,
      assists: isOffensive || isCorners ? 10 : 5,
      shotsPerGame: 1.8,
      shotsOnTargetPerGame: 0.8,
      cornersWonPerGame: isCorners ? 2.8 : 1.4,
      yellowCards: isPhysical ? 8 : 4,
      redCards: 0,
      rating: isCorners ? 7.40 : 7.05
    };

    if (setTeams) {
      setTeams(prev => [...prev, newTeam]);
    }
    if (setPlayers) {
      setPlayers(prev => [...prev, starPlayer1, starPlayer2]);
    }

    // Set active selection to the newly indexed team
    setSelectedTeamId(id);
    
    // Clean states & close form panel
    setCreatedName("");
    setCreatedSigla("");
    setShowIndexer(false);
  };

  // Helper renderer to display standard logo OR custom inline badges seamlessly
  const renderLogo = (logoString: string, teamName: string, sizeClass = "w-5 h-5") => {
    if (logoString && logoString.startsWith("custom-badge:")) {
      const colorHex = logoString.split(":")[1] || "bg-emerald-600";
      return (
        <div className={`${sizeClass} rounded-lg flex items-center justify-center text-[10px] font-black font-mono text-white ${colorHex} border border-slate-700 shadow-sm leading-none shrink-0`}>
          {teamName.substring(0, 2).toUpperCase()}
        </div>
      );
    }
    return <img src={logoString} alt={teamName} className={`${sizeClass} object-contain shrink-0`} referrerPolicy="no-referrer" />;
  };

  return (
    <div className="space-y-6" id="individual-teams-hub-widget">
      
      {/* Intro section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Dossiê Estatístico Completo (780+ Clubes do Brasil)
          </h3>
          <div className="h-1 w-12 bg-amber-500 mt-2"></div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed max-w-2xl">
            Auditador estatístico do futebol brasileiro. Indexe e explore instantaneamente as taxas de probabilidade exatas em mais de 780 equipes masculinas, femininas e regionais do país. Perfeito para predições realistas em tempo real!
          </p>
        </div>
        <button
          onClick={() => {
            setShowIndexer(!showIndexer);
            setSelectedTeamId(null); // Clear selection to focus on indexer
          }}
          className="relative z-10 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500 hover:to-teal-500 hover:text-white border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Indexar Novo Clube (780+)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Search Filter & Interactive Teams Directory */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          
          {/* Search Input Filter */}
          <div>
            <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5 flex justify-between">
              <span>Buscador Geral de Equipes</span>
              <span className="text-slate-400 font-normal">{filteredTeams.length} encontrados</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="PROCURAR EX: PALMEIRAS, SANTOS, CRB..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const filtered = teams.filter(t => 
                    t.name.toLowerCase().includes(e.target.value.toLowerCase()) || 
                    t.shortName.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (filtered.length > 0) {
                    setSelectedTeamId(filtered[0].id);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold placeholder-slate-600 uppercase"
              />
            </div>
          </div>

          {/* Advanced Multi-Filter Grid */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <span className="block text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest">Filtros Avançados (API V3)</span>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Country Selection */}
              <div>
                <label className="block text-[8px] text-slate-500 font-bold uppercase mb-1">País / Região</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState("all"); // Reset state since it's country dependent
                  }}
                  className="w-full bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                >
                  <option value="all">Mundial (Todos)</option>
                  <option value="Brasil">Brasil 🇧🇷</option>
                  <option value="Inglaterra">Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
                  <option value="Espanha">Espanha 🇪🇸</option>
                  <option value="Alemanha">Alemanha 🇩🇪</option>
                  <option value="Itália">Itália 🇮🇹</option>
                  <option value="Internacional">Seleções FIFA 🌍</option>
                </select>
              </div>

              {/* League Selection */}
              <div>
                <label className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Liga / Torneio</label>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                >
                  <option value="all">Todas as Ligas</option>
                  <option value="Brasileirão Série A">Série A (Brasil)</option>
                  <option value="Brasileirão Série B">Série B (Brasil)</option>
                  <option value="Brasileiro Feminino">Feminino (Brasil)</option>
                  <option value="Premier League">Premier League 🏴</option>
                  <option value="La Liga">La Liga 🇪🇸</option>
                  <option value="Bundesliga">Bundesliga 🇩🇪</option>
                  <option value="Serie A Italiana">Serie A 🇮🇹</option>
                  <option value="Copa do Mundo FIFA">Copa do Mundo 🏆</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Type Selection */}
              <div>
                <label className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Tipo de Equipe</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                >
                  <option value="all">Todos Tipos</option>
                  <option value="club">Clubes</option>
                  <option value="national">Seleções Nacionais</option>
                </select>
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-[8px] text-slate-500 font-bold uppercase mb-1">Estado (BR)</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={selectedCountry !== "all" && selectedCountry !== "Brasil"}
                  className="w-full bg-slate-900 border border-slate-850 hover:border-slate-700 text-[10px] text-slate-300 disabled:opacity-40 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                >
                  <option value="all">Todos Estados</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="RS">Rio Grande do Sul (RS)</option>
                  <option value="BA">Bahia (BA)</option>
                  <option value="CE">Ceará (CE)</option>
                  <option value="PE">Pernambuco (PE)</option>
                  <option value="PR">Paraná (PR)</option>
                  <option value="SC">Santa Catarina (SC)</option>
                  <option value="MT">Mato Grosso (MT)</option>
                  <option value="GO">Goiás (GO)</option>
                  <option value="AL">Alagoas (AL)</option>
                  <option value="MA">Maranhão (MA)</option>
                  <option value="RN">Rio Grande do Norte (RN)</option>
                  <option value="PA">Pará (PA)</option>
                  <option value="AM">Amazonas (AM)</option>
                  <option value="SE">Sergipe (SE)</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedCountry !== "all" || selectedState !== "all" || selectedLeague !== "all" || selectedType !== "all") && (
              <button
                onClick={() => {
                  setSelectedCountry("all");
                  setSelectedState("all");
                  setSelectedLeague("all");
                  setSelectedType("all");
                }}
                className="w-full text-center py-1 text-[9px] text-rose-400 hover:text-rose-350 font-bold bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition"
              >
                Limpar Filtros Avançados / Mostrar Tudo
              </button>
            )}
          </div>

          {/* Quick-select scrollable category selection bar */}
          <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-850 scrollbar-none text-[10px] uppercase font-bold text-slate-500">
            <button
              onClick={() => { setActiveCategory('serie_a'); setSelectedTeamId(null); }}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${activeCategory === 'serie_a' ? 'bg-slate-800 text-white font-extrabold' : 'hover:bg-slate-950/40 hover:text-slate-300'}`}
            >
              Série A
            </button>
            <button
              onClick={() => { setActiveCategory('serie_b_c'); setSelectedTeamId(null); }}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${activeCategory === 'serie_b_c' ? 'bg-slate-800 text-white font-extrabold' : 'hover:bg-slate-950/40 hover:text-slate-300'}`}
            >
              Séries B & C
            </button>
            <button
              onClick={() => { setActiveCategory('feminino'); setSelectedTeamId(null); }}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${activeCategory === 'feminino' ? 'bg-slate-800 text-white font-extrabold' : 'hover:bg-slate-950/40 hover:text-slate-300'}`}
            >
              Feminino
            </button>
            <button
              onClick={() => { setActiveCategory('custom'); setSelectedTeamId(null); }}
              className={`px-2.5 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 ${activeCategory === 'custom' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold' : 'hover:bg-slate-950/40 hover:text-slate-300'}`}
            >
              Criados ({customTeamsCount})
            </button>
          </div>

          {/* Quick-select list directory of clubs */}
          <div className="pt-1">
            <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">
              Diretório de Clubes ({filteredTeams.length})
            </span>
            
            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 text-xs">
              {filteredTeams.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[11px] space-y-3">
                  <p className="italic">Nenhum clube de elite correspondente.</p>
                  {searchQuery.trim().length > 0 && (
                    <button
                      onClick={() => {
                        setCreatedName(searchQuery);
                        setShowIndexer(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 font-mono font-extrabold rounded-lg uppercase text-[9px] transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Indexar "{searchQuery}" Agora!
                    </button>
                  )}
                </div>
              ) : (
                filteredTeams.map(t => {
                  const isSelected = t.id === currentTeamId;
                  const categoryName = getTeamCategory(t) === 'feminino' ? 'Feminino' : getTeamCategory(t) === 'serie_b_c' ? 'Série B & C' : getTeamCategory(t) === 'custom' ? 'Indexado' : 'Série A';
                  
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTeamId(t.id);
                        setShowIndexer(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-white font-bold' 
                          : 'bg-transparent border border-transparent text-slate-400 hover:bg-slate-950/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {renderLogo(t.logo, t.name, "w-6 h-6")}
                        <div className="truncate">
                          <span className="uppercase tracking-tight text-[11px] block truncate">{t.name}</span>
                          <span className="text-[8px] text-slate-500 font-medium tracking-wider">{categoryName}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-bold">{t.shortName}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Massive Stats Dashboard */}
        <div className="lg:col-span-8">
          
          <AnimatePresence mode="wait">
            {showIndexer ? (
              
              /* PREVENT BLUSH: THE MASTER PRO-BET INDEXER FORM CARD */
              <motion.div
                key="indexer-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Indexador de Futebol do Brasil (780+ Clubes)</h4>
                      <p className="text-[10px] text-slate-500">Insira as configurações básicas para calcular dados pro-bet realistas do clube no banco de dados.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowIndexer(false);
                      setSelectedTeamId(teams[0]?.id || null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white uppercase font-mono tracking-widest bg-slate-950 border border-slate-850 px-2.5 py-1 rounded"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Nome Completo do Clube</label>
                    <input
                      type="text"
                      placeholder="Ex: América Futebol Clube, São Bento..."
                      value={createdName}
                      onChange={(e) => setCreatedName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold placeholder-slate-700"
                    />
                  </div>

                  {/* Acronym block */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Sigla (3 Letras)</label>
                    <input
                      type="text"
                      placeholder="Ex: AME, SBO, ÍBI"
                      maxLength={3}
                      value={createdSigla}
                      onChange={(e) => setCreatedSigla(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold placeholder-slate-700"
                    />
                  </div>

                  {/* Gender selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black block">Gênero Profissional</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCreatedGender("masculino")}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold uppercase cursor-pointer transition ${createdGender === 'masculino' ? 'bg-emerald-500/10 border-emerald-500/45 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                      >
                        🚹 Masculino
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreatedGender("feminino")}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-bold uppercase cursor-pointer transition ${createdGender === 'feminino' ? 'bg-emerald-500/10 border-emerald-500/45 text-white' : 'bg-slate-950/40 border-slate-850 text-slate-500 hover:text-slate-300'}`}
                      >
                        🚺 Feminino
                      </button>
                    </div>
                  </div>

                  {/* Tier selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Categoria Principal</label>
                    <select
                      value={createdTier}
                      onChange={(e) => setCreatedTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="Série A">Série A (Brasil)</option>
                      <option value="Série B">Série B (Brasil)</option>
                      <option value="Série C">Série C (Brasil)</option>
                      <option value="Feminino Elite">Feminino Elite</option>
                      <option value="Internacional">Internacional / Europa</option>
                    </select>
                  </div>

                  {/* Custom Country */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">País / Região</label>
                    <select
                      value={createdCountry}
                      onChange={(e) => setCreatedCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="Brasil">Brasil 🇧🇷</option>
                      <option value="Inglaterra">Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
                      <option value="Espanha">Espanha 🇪🇸</option>
                      <option value="Alemanha">Alemanha 🇩🇪</option>
                      <option value="Itália">Itália 🇮🇹</option>
                      <option value="Portugal">Portugal 🇵🇹</option>
                      <option value="Internacional">Seleção Internacional 🌍</option>
                    </select>
                  </div>

                  {/* Custom State */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Estado (BR / Região)</label>
                    <input
                      type="text"
                      placeholder="Ex: SP, RJ, MG, DF (ou - para exterior)"
                      value={createdState}
                      onChange={(e) => setCreatedState(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold placeholder-slate-750"
                    />
                  </div>

                  {/* Custom City */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Cidade Sede</label>
                    <input
                      type="text"
                      placeholder="Ex: Campinas, Santos, Madrid..."
                      value={createdCity}
                      onChange={(e) => setCreatedCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold placeholder-slate-750"
                    />
                  </div>

                  {/* Custom League */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Liga / Campeonato</label>
                    <select
                      value={createdLeague}
                      onChange={(e) => setCreatedLeague(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="Brasileirão Série A">Brasileirão Série A</option>
                      <option value="Brasileirão Série B">Brasileirão Série B</option>
                      <option value="Brasileiro Feminino">Brasileiro Feminino</option>
                      <option value="Premier League">Premier League 🏴</option>
                      <option value="La Liga">La Liga 🇪🇸</option>
                      <option value="Bundesliga">Bundesliga 🇩🇪</option>
                      <option value="Serie A Italiana">Serie A Italiana 🇮🇹</option>
                      <option value="Copa do Mundo FIFA">Copa do Mundo FIFA 🏆</option>
                    </select>
                  </div>
                </div>

                {/* Tactical preset profiles */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black block">
                    Perfil Tático De Desempenho (Direcionador de Algoritmo)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {[
                      { value: "ofensivo", label: "⚽ Super Ofensivo", desc: "Altas taxas de Over 2.5 e BTTS" },
                      { value: "defensivo", label: "🛡️ Muralha", desc: "Baixo gols, altos Clean Sheets" },
                      { value: "cantos", label: "📐 Rei dos Cantos", desc: "Especialista em escanteios" },
                      { value: "fisico", label: "🦹 Jogo Físico", desc: "Média alta de cartões e faltas" },
                      { value: "equilibrado", label: "⚖️ Equilibrado", desc: "Valores médios balanceados" }
                    ].map(st => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setCreatedStyle(st.value as any)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${createdStyle === st.value ? 'bg-emerald-500/10 border-emerald-500/45 text-white shadow' : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:text-white'}`}
                      >
                        <span className="font-bold uppercase block">{st.label}</span>
                        <span className="text-[9px] text-slate-500 mt-1 block leading-tight">{st.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color shield preset selection */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black block">Cor Dominante do Escudo (Identidade Visual)</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(co => (
                      <button
                        key={co.value}
                        type="button"
                        onClick={() => setCreatedColor(co.value)}
                        className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${createdColor === co.value ? 'bg-slate-950 border-emerald-500 text-white' : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:text-white'}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${co.value}`} />
                        <span>{co.label}</span>
                        {createdColor === co.value && <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirmation trigger */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleIndexNewTeam}
                    disabled={!createdName.trim()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-650 rounded-xl text-center text-xs font-black uppercase text-white tracking-widest shadow-lg hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] transition duration-200 cursor-pointer"
                  >
                    Indexar Clube na IA & Ativar Estatísticas
                  </button>
                </div>
              </motion.div>

            ) : activeTeam ? (
              
              /* MASTER STATS VISUALIZATION CONTAINER */
              <motion.div
                key={activeTeam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* Active Club Name Card Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-2 shadow-inner shrink-0">
                      {renderLogo(activeTeam.logo, activeTeam.name, "w-11 h-11")}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <span>{activeTeam.name}</span>
                        {activeTeam.isNational && (
                          <span className="px-1.5 py-0.5 text-[8px] tracking-wide font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">Seleção</span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                        <span>{activeTeam.shortName}</span>
                        <span>•</span>
                        <span className="text-slate-300">{activeTeam.country || "Brasil"}</span>
                        {activeTeam.state && activeTeam.state !== "-" && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{activeTeam.city ? `${activeTeam.city} - ${activeTeam.state}` : activeTeam.state}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-teal-400 font-extrabold">{activeTeam.league || (activeTeam.id >= 10000 ? `${createdTier} (Custom)` : activeTeam.id >= 900 ? "Feminino Elite" : activeTeam.id >= 132 ? "Série B & C" : "Série A - Elite")}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{activeTeam.matchesPlayed} Jogos</span>
                        {activeTeam.id >= 10000 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500 uppercase">Perfil: {createdStyle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 text-center">
                    <div className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2min-w-[76px]">
                      <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest">Gols Feitos</span>
                      <span className="text-base font-black font-mono text-emerald-400">{(activeTeam.avgGoalsScored * activeTeam.matchesPlayed).toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 min-w-[76px]">
                      <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-widest">Gols Sofridos</span>
                      <span className="text-base font-black font-mono text-rose-500">{(activeTeam.avgGoalsConceded * activeTeam.matchesPlayed).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* STATS PERCENTAGE MATRIX GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  
                  {/* BTTS */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <Percent className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Ambas Marcam</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{activeTeam.bttsPercentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Sim (BTTS)</p>
                  </div>

                  {/* Over 1.5 */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Over 1.5</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{activeTeam.over15Percentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Total Gols</p>
                  </div>

                  {/* Over 2.5 */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <Flame className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Over 2.5</span>
                    <span className="text-2xl font-black font-mono text-rose-500 mt-1 block">{activeTeam.over25Percentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Total Gols</p>
                  </div>

                  {/* Over 3.5 */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Over 3.5</span>
                    <span className="text-2xl font-black font-mono text-orange-400 mt-1 block">{activeTeam.over35Percentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Total Gols</p>
                  </div>

                  {/* Over 0.5 HT */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Over 0.5 HT</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">{activeTeam.over05HTPercentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Gol 1T (Halftime)</p>
                  </div>

                  {/* Clean Sheet */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center hover:border-slate-700/80 transition-all">
                    <div className="flex text-slate-500 justify-center mb-1">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Jogos s/ Sofrer</span>
                    <span className="text-2xl font-black font-mono text-indigo-400 mt-1 block">{activeTeam.cleanSheetsPercentage}%</span>
                    <p className="text-[9px] text-slate-450 mt-1 uppercase font-bold">Clean Sheet</p>
                  </div>

                </div>

                {/* THREE DETAILED METRIC BLOCKS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Escanteios */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <span className="w-1.5 h-3 bg-teal-500 rounded" />
                      Cantos (Escanteios)
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Soma Média Total</span>
                        <span className="font-mono text-white font-black">{activeTeam.avgCorners} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Marcados / A Favor</span>
                        <span className="font-mono text-emerald-400 font-extrabold">{activeTeam.avgCornersFor} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Sofridos / Contra</span>
                        <span className="font-mono text-rose-500 font-extrabold">{activeTeam.avgCornersAgainst} / jogo</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                          <span>A Favor: {activeTeam.avgCornersFor}</span>
                          <span>Contra: {activeTeam.avgCornersAgainst}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(activeTeam.avgCornersFor / ((activeTeam.avgCornersFor + activeTeam.avgCornersAgainst) || 1)) * 100}%` }} />
                          <div className="bg-rose-500 h-full" style={{ width: `${(activeTeam.avgCornersAgainst / ((activeTeam.avgCornersFor + activeTeam.avgCornersAgainst) || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chutes */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <span className="w-1.5 h-3 bg-emerald-500 rounded" />
                      Finalizações & Posse
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Chutes Totais</span>
                        <span className="font-mono text-white font-black">{activeTeam.avgShots} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Chutes no Alvo</span>
                        <span className="font-mono text-emerald-400 font-extrabold">{activeTeam.avgShotsOnTarget} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Posse de Bola Média</span>
                        <span className="font-mono text-white font-black">{activeTeam.avgPossession}%</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 mb-1 uppercase">
                          <span>Eficiência no Alvo</span>
                          <span>{((activeTeam.avgShotsOnTarget / (activeTeam.avgShots || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(activeTeam.avgShotsOnTarget / (activeTeam.avgShots || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disciplinar */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <span className="w-1.5 h-3 bg-amber-500 rounded" />
                      Faltas & Cartões
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Faltas Cometidas</span>
                        <span className="font-mono text-amber-500 font-extrabold">{activeTeam.avgFouls} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Média Desarmes</span>
                        <span className="font-mono text-emerald-400 font-extrabold">{activeTeam.avgTackles} / jogo</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Amarelos por partida</span>
                        <span className="font-mono text-amber-400 font-extrabold">{activeTeam.avgCardsYellow}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Impedimentos</span>
                        <span className="font-mono text-white font-black">{activeTeam.avgOffsides} / jogo</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* SQUAD REFERRAL STARS FOR SPORT BETTING AND COMPARATIVE ANALYSES */}
                {activePlayers.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Destaques do Elenco & Referências de Jogadores (Props de Apostas)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePlayers.map(p => (
                        <div key={p.id} className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors">
                          <div>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-max">
                              {p.position}
                            </span>
                            <h5 className="text-xs font-black text-white mt-2 uppercase tracking-tight">{p.name}</h5>
                            <p className="text-[10px] text-slate-500 font-medium font-mono mt-1">
                              {p.matches} Partidas • Rating: <span className="text-amber-500">{p.rating.toFixed(2)}</span>
                            </p>
                          </div>

                          <div className="text-right font-mono text-[10px] text-slate-400 font-bold space-y-1">
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-500 uppercase">Gols/Assist:</span>
                              <span className="text-white">{p.goals}G / {p.assists}A</span>
                            </div>
                            <div className="flex justify-between gap-6 pb-0.5 border-b border-slate-900">
                              <span className="text-slate-500 uppercase">Chutes (Alvo):</span>
                              <span className="text-emerald-400">{p.shotsPerGame} ({p.shotsOnTargetPerGame})</span>
                            </div>
                            <div className="flex justify-between gap-6">
                              <span className="text-slate-500 uppercase">Canto Conced:</span>
                              <span className="text-teal-400">{p.cornersWonPerGame}/jogo</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HISTORIC CHRONOLOGICAL TIMELINE SCORECARDS */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-4">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Série Temporal dos Últimos 10 Jogos no Banco de Dados
                    </h4>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Simulações de Resultados Históricos</span>
                  </div>

                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1" id="extended-match-scroller">
                    {matches.map((m) => {
                      const isWin = m.goalsScored > m.goalsConceded;
                      const isDraw = m.goalsScored === m.goalsConceded;
                      const over25 = (m.goalsScored + m.goalsConceded) > 2.5;
                      const btts = m.goalsScored > 0 && m.goalsConceded > 0;

                      return (
                        <div
                          key={m.id}
                          className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-slate-800 transition"
                        >
                          {/* Timeline Left */}
                          <div className="flex items-center gap-3">
                            {isWin ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : isDraw ? (
                              <MinusCircle className="w-5 h-5 text-slate-500 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            )}
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 block">{m.date} • {m.isHome ? "MANDANTE" : "VISITANTE"}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-extrabold text-white uppercase">{activeTeam.shortName}</span>
                                <span className="font-mono text-slate-500">vs</span>
                                <span className="font-semibold text-slate-300 uppercase">{m.opponent.replace("SC ", "").replace("SE ", "").replace(" FC", "")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Timeline Right Stats */}
                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-900 pt-2 md:pt-0">
                            
                            <div className="flex gap-4 font-mono text-[9px] text-slate-500 font-bold uppercase">
                              <div>
                                <span>Cantos: </span>
                                <span className="text-teal-400">{m.corners}</span>
                              </div>
                              <div className="border-l border-slate-850 pl-4">
                                <span>Chutes: </span>
                                <span className="text-white">{m.shots}</span>
                              </div>
                              <div className="border-l border-slate-850 pl-2">
                                <span>Cartão: </span>
                                <span className="text-amber-500">{m.yellowCards}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {over25 && (
                                <span className="text-[8px] bg-rose-950/25 text-rose-500 border border-rose-900/30 px-1 py-0.5 rounded font-mono font-bold">O2.5</span>
                              )}
                              {btts && (
                                <span className="text-[8px] bg-emerald-950/25 text-emerald-400 border border-emerald-900/30 px-1 py-0.5 rounded font-mono font-bold">BTTS</span>
                              )}

                              <div className="font-mono font-black bg-slate-900 border border-slate-850 px-2.5 py-1 rounded text-white min-w-[50px] text-center">
                                {m.isHome ? `${m.goalsScored} - ${m.goalsConceded}` : `${m.goalsConceded} - ${m.goalsScored}`}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 italic">
                Selecione um clube do diretório tático à esquerda para exibir o dossiê detalhado.
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
