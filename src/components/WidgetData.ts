/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.5
 */

import { 
  Globe, Calendar, Trophy, List, Shield, Activity, RefreshCw, Layers, 
  Users, Zap, ExternalLink, HelpCircle, DollarSign, ArrowRightLeft, Sparkles 
} from "lucide-react";

export interface WidgetMatch {
  id: string;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  country: string;
  countryCode: string;
  date: string;
  time: string;
  status: "FT" | "AO VIVO" | "PEN" | "1H" | "ND";
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  penaltyScore?: string;
  events: Array<{
    elapsed: number;
    team: string;
    player: string;
    type: "Goal" | "Card" | "subst";
    detail: string;
    assist?: string;
  }>;
  lineups: {
    home: {
      formation: string;
      coach: string;
      startXI: Array<{ number: number; name: string; pos: string }>;
    };
    away: {
      formation: string;
      coach: string;
      startXI: Array<{ number: number; name: string; pos: string }>;
    };
  };
  statistics: Array<{
    metric: string;
    home: string;
    away: string;
    homePercent: number;
    awayPercent: number;
  }>;
  players: Array<{
    name: string;
    rating: string;
    goals: number;
    assists: number;
    team: string;
  }>;
}

export const COUNTRIES_LIST = [
  { name: "Brasil", flag: "https://media.api-sports.io/flags/br.svg", count: 8 },
  { name: "América do Sul", flag: "https://media.api-sports.io/flags/sa.svg", count: 4 },
  { name: "Argentina", flag: "https://media.api-sports.io/flags/ar.svg", count: 2 },
  { name: "Espanha", flag: "https://media.api-sports.io/flags/es.svg", count: 2 },
  { name: "França", flag: "https://media.api-sports.io/flags/fr.svg", count: 1 },
  { name: "Mundo", flag: "https://media.api-sports.io/flags/world.svg", count: 3 }
];

export const ENDPOINTS_CATALOG = [
  {
    id: "countries",
    name: "1. Países (Countries)",
    path: "/api/v3/countries",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-countries",
    category: "Cadastros",
    desc: "Retorna a lista de países disponíveis e ativos para cobertura conceitual e geolocalização de clubes.",
    icon: Globe,
    params: []
  },
  {
    id: "seasons",
    name: "2. Temporadas (Seasons)",
    path: "/api/v3/seasons",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-seasons",
    category: "Estacionário",
    desc: "Retorna todos os anos de temporadas esportivas históricas e ativas cobertos no motor analítico do sistema.",
    icon: Calendar,
    params: []
  },
  {
    id: "leagues",
    name: "3. Ligas & Copas (Leagues)",
    path: "/api/v3/leagues",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-leagues",
    category: "Cadastros",
    desc: "Lista de campeonatos registrados (ex: Brasileirão Série A, Série B, Libertadores, Copa do Brasil) com seus metadados.",
    icon: Trophy,
    params: []
  },
  {
    id: "standings",
    name: "4. Classificação (Standings)",
    path: "/api/v3/standings",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-standings",
    category: "Estatísticas & Modelagem",
    desc: "Obtém a tabela de classificação e pontuação geral atualizada dinamicamente com base nas simulações táticas de cada campeonato.",
    icon: List,
    params: [
      {
        name: "championship",
        type: "select" as const,
        description: "Nome do campeonato a recalcular a classificação",
        defaultValue: "Brasileirão Série A",
        options: [
          { label: "Brasileirão Série A", value: "Brasileirão Série A" },
          { label: "Brasileirão Série B", value: "Brasileirão Série B" },
          { label: "Libertadores", value: "Libertadores" },
          { label: "Copa do Brasil", value: "Copa do Brasil" },
          { label: "Sul-Americana", value: "Sul-Americana" }
        ]
      }
    ]
  },
  {
    id: "teams",
    name: "5. Clubes & Estádios (Teams)",
    path: "/api/v3/teams",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-teams",
    category: "Cadastros",
    desc: "Obtém informações cadastrais detalhadas dos clubes, fundação, dados do estádio/arena principal e capacidade física.",
    icon: Shield,
    params: [
      {
        name: "id",
        type: "select" as const,
        description: "ID do time específico de futebol do Brasil",
        defaultValue: "126",
        options: [
          { label: "São Paulo FC", value: "126" },
          { label: "SE Palmeiras", value: "121" },
          { label: "SC Corinthians Paulista", value: "131" },
          { label: "CR Flamengo", value: "97" }
        ]
      }
    ]
  },
  {
    id: "livescore",
    name: "6. Placar ao Vivo (Livescore)",
    path: "/api/v3/livescore",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-fixtures",
    category: "Live & Odds",
    desc: "Monitoramento de placares, minutos decorridos e eventos táticos críticos em tempo real da simulação ativa.",
    icon: Activity,
    params: []
  },
  {
    id: "fixtures",
    name: "7. Calendário de Jogos (Fixtures)",
    path: "/api/v3/fixtures",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-fixtures",
    category: "Confrontos",
    desc: "Lista global de datas de rodadas concluídas, arbitragem e placares oficiais do campeonato.",
    icon: Layers,
    params: []
  },
  {
    id: "headtohead",
    name: "8. Confronto Direto (Head 2 Head)",
    path: "/api/v3/fixtures/headtohead",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-fixtures-h2h",
    category: "Confrontos",
    desc: "Confrontos diretos históricos (H2H) computados entre duas equipes, indicando médias de escanteios, gols e cartões pretéritos.",
    icon: RefreshCw,
    params: [
      {
        name: "h2h",
        type: "select" as const,
        description: "Times em confronto (Mandante - Visitante)",
        defaultValue: "126-121",
        options: [
          { label: "São Paulo vs Palmeiras", value: "126-121" },
          { label: "São Paulo vs Flamengo", value: "126-97" },
          { label: "Palmeiras vs Flamengo", value: "121-97" },
          { label: "São Paulo vs Corinthians", value: "126-131" }
        ]
      }
    ]
  },
  {
    id: "events",
    name: "9. Eventos da Partida (Events)",
    path: "/api/v3/fixtures/events",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-fixtures-events",
    category: "Confrontos",
    desc: "Linha do tempo minuciosa de gols, assistências, cartões disciplinares amarelos/vermelhos e substituições táticas.",
    icon: Zap,
    params: [
      { name: "fixture", type: "number" as const, description: "ID do jogo simulado", defaultValue: "98765" }
    ]
  },
  {
    id: "lineups",
    name: "10. Escalações Táticas (Line Ups)",
    path: "/api/v3/fixtures/lineups",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-fixtures-lineups",
    category: "Confrontos",
    desc: "Escalações titulares em campo com desenho tático detalhado (ex: 4-3-3, 4-2-3-1), números de camisas, capitães e suplentes.",
    icon: Users,
    params: [
      { name: "fixture", type: "number" as const, description: "ID do jogo", defaultValue: "98765" }
    ]
  },
  {
    id: "topscorers",
    name: "11. Artilharia / Goleadores (Top Scorers)",
    path: "/api/v3/players/topscorers",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-players-topscorers",
    category: "Estatísticas & Modelagem",
    desc: "Artilharia conceitual do campeonato e estatísticas de eficiência ofensiva (gols por minuto, pênaltis convertidos, notas do ano).",
    icon: Trophy,
    params: []
  },
  {
    id: "players",
    name: "12. Atletas & Perfis (Players & Coaches)",
    path: "/api/v3/players",
    docUrl: "https://www.api-football.com/documentation-v3#operation/get-players",
    category: "Cadastros",
    desc: "Perfil completo de atletas, idade, nacionalidade, média de gols, média de chutes por partida e pontuações consolidadas.",
    icon: Users,
    params: []
  }
];

export const WIDGET_MATCHES: WidgetMatch[] = [
  {
    id: "wm-1",
    leagueId: 1,
    leagueName: "World Cup - Final",
    leagueLogo: "https://media.api-sports.io/football/leagues/1.png",
    country: "Mundo",
    countryCode: "world",
    date: "18 Dez 2024",
    time: "16:00",
    status: "PEN",
    homeTeam: "Argentina",
    homeLogo: "https://media.api-sports.io/football/teams/9.png",
    awayTeam: "França",
    awayLogo: "https://media.api-sports.io/football/teams/10.png",
    homeScore: 3,
    awayScore: 3,
    penaltyScore: "4 - 2",
    events: [
      { elapsed: 23, team: "Argentina", player: "L. Messi", type: "Goal", detail: "Golo de Pênalti" },
      { elapsed: 36, team: "Argentina", player: "Angel Di María", type: "Goal", detail: "Gol Normal", assist: "Mac Allister" },
      { elapsed: 80, team: "França", player: "K. Mbappé", type: "Goal", detail: "Golo de Pênalti" },
      { elapsed: 81, team: "França", player: "K. Mbappé", type: "Goal", detail: "Gol de Voleio", assist: "Thuram" },
      { elapsed: 108, team: "Argentina", player: "L. Messi", type: "Goal", detail: "Rebote de Curto" },
      { elapsed: 118, team: "França", player: "K. Mbappé", type: "Goal", detail: "Golo de Pênalti" }
    ],
    lineups: {
      home: {
        formation: "4-3-3",
        coach: "Lionel Scaloni",
        startXI: [
          { number: 23, name: "Emiliano Martínez", pos: "G" },
          { number: 26, name: "Nahuel Molina", pos: "D" },
          { number: 13, name: "Cristian Romero", pos: "D" },
          { number: 19, name: "Nicolás Otamendi", pos: "D" },
          { number: 3, name: "Nicolás Tagliafico", pos: "D" },
          { number: 7, name: "Rodrigo De Paul", pos: "M" },
          { number: 24, name: "Enzo Fernández", pos: "M" },
          { number: 20, name: "Alexis Mac Allister", pos: "M" },
          { number: 10, name: "Lionel Messi", pos: "F" },
          { number: 9, name: "Julián Álvarez", pos: "F" },
          { number: 11, name: "Angel Di María", pos: "F" }
        ]
      },
      away: {
        formation: "4-3-3",
        coach: "Didier Deschamps",
        startXI: [
          { number: 1, name: "Hugo Lloris", pos: "G" },
          { number: 5, name: "Jules Koundé", pos: "D" },
          { number: 4, name: "Raphaël Varane", pos: "D" },
          { number: 18, name: "Dayot Upamecano", pos: "D" },
          { number: 22, name: "Theo Hernández", pos: "D" },
          { number: 8, name: "Aurélien Tchouaméni", pos: "M" },
          { number: 14, name: "Adrien Rabiot", pos: "M" },
          { number: 7, name: "Antoine Griezmann", pos: "M" },
          { number: 11, name: "Ousmane Dembélé", pos: "F" },
          { number: 9, name: "Olivier Giroud", pos: "F" },
          { number: 10, name: "Kylian Mbappé", pos: "F" }
        ]
      }
    },
    statistics: [
      { metric: "Chutes no Alvo", home: "9", away: "5", homePercent: 64, awayPercent: 36 },
      { metric: "Chutes fora do Alvo", home: "5", away: "6", homePercent: 45, awayPercent: 55 },
      { metric: "Posse de Bola", home: "46%", away: "54%", homePercent: 46, awayPercent: 54 },
      { metric: "Escanteios", home: "6", away: "5", homePercent: 55, awayPercent: 45 },
      { metric: "Faltas", home: "26", away: "19", homePercent: 58, awayPercent: 42 },
      { metric: "Impedimentos", home: "4", away: "4", homePercent: 50, awayPercent: 50 },
      { metric: "Cartões Amarelos", home: "4", away: "3", homePercent: 57, awayPercent: 43 },
      { metric: "Cartões Vermelhos", home: "0", away: "0", homePercent: 0, awayPercent: 0 },
      { metric: "Defesas de Goleiro", home: "2", away: "6", homePercent: 25, awayPercent: 75 }
    ],
    players: [
      { name: "Lionel Messi", rating: "9.5", goals: 2, assists: 0, team: "Argentina" },
      { name: "Kylian Mbappé", rating: "9.1", goals: 3, assists: 0, team: "França" },
      { name: "Angel Di María", rating: "8.2", goals: 1, assists: 0, team: "Argentina" },
      { name: "Enzo Fernández", rating: "7.9", goals: 0, assists: 0, team: "Argentina" }
    ]
  },
  {
    id: "wm-2",
    leagueId: 71,
    leagueName: "Brasileirão Série A",
    leagueLogo: "https://media.api-sports.io/football/leagues/71.png",
    country: "Brasil",
    countryCode: "br",
    date: "Sab, 16:30",
    time: "16:30",
    status: "AO VIVO",
    homeTeam: "Palmeiras",
    homeLogo: "https://media.api-sports.io/football/teams/121.png",
    awayTeam: "São Paulo",
    awayLogo: "https://media.api-sports.io/football/teams/126.png",
    homeScore: 1,
    awayScore: 1,
    events: [
      { elapsed: 14, team: "São Paulo", player: "Jonathan Calleri", type: "Goal", detail: "Golo de Cabeça", assist: "Lucas Moura" },
      { elapsed: 35, team: "Palmeiras", player: "Raphael Veiga", type: "Card", detail: "Cartão Amarelo" },
      { elapsed: 58, team: "Palmeiras", player: "Flaco López", type: "Goal", detail: "Gol Normal", assist: "Estêvão" }
    ],
    lineups: {
      home: {
        formation: "4-2-3-1",
        coach: "Abel Ferreira",
        startXI: [
          { number: 21, name: "Weverton", pos: "G" },
          { number: 2, name: "Marcos Rocha", pos: "D" },
          { number: 15, name: "Gustavo Gómez", pos: "D" },
          { number: 26, name: "Murilo", pos: "D" },
          { number: 6, name: "Vanderlan", pos: "D" },
          { number: 5, name: "Aníbal Moreno", pos: "M" },
          { number: 27, name: "Richard Ríos", pos: "M" },
          { number: 23, name: "Raphael Veiga", pos: "M" },
          { number: 41, name: "Estêvão", pos: "F" },
          { number: 42, name: "Flaco López", pos: "F" },
          { number: 9, name: "Felipe Anderson", pos: "F" }
        ]
      },
      away: {
        formation: "4-2-3-1",
        coach: "Luis Zubeldía",
        startXI: [
          { number: 23, name: "Rafael", pos: "G" },
          { number: 13, name: "Rafinha", pos: "D" },
          { number: 5, name: "Robert Arboleda", pos: "D" },
          { number: 2, name: "Alan Franco", pos: "D" },
          { number: 6, name: "Welington", pos: "D" },
          { number: 8, name: "Luiz Gustavo", pos: "M" },
          { number: 25, name: "Alisson", pos: "M" },
          { number: 7, name: "Lucas Moura", pos: "M" },
          { number: 10, name: "Luciano", pos: "M" },
          { number: 11, name: "Rodrigo Nestor", pos: "M" },
          { number: 9, name: "Jonathan Calleri", pos: "F" }
        ]
      }
    },
    statistics: [
      { metric: "Chutes no Alvo", home: "6", away: "4", homePercent: 60, awayPercent: 40 },
      { metric: "Chutes fora do Alvo", home: "8", away: "5", homePercent: 61, awayPercent: 39 },
      { metric: "Posse de Bola", home: "52%", away: "48%", homePercent: 52, awayPercent: 48 },
      { metric: "Escanteios", home: "7", away: "4", homePercent: 63, awayPercent: 37 },
      { metric: "Faltas", home: "16", away: "12", homePercent: 57, awayPercent: 43 },
      { metric: "Cartões Amarelos", home: "2", away: "1", homePercent: 66, awayPercent: 34 }
    ],
    players: [
      { name: "Estêvão", rating: "8.2", goals: 0, assists: 1, team: "Palmeiras" },
      { name: "Jonathan Calleri", rating: "8.0", goals: 1, assists: 0, team: "São Paulo" },
      { name: "Lucas Moura", rating: "7.7", goals: 0, assists: 1, team: "São Paulo" }
    ]
  },
  {
    id: "wm-3",
    leagueId: 71,
    leagueName: "Brasileirão Série A",
    leagueLogo: "https://media.api-sports.io/football/leagues/71.png",
    country: "Brasil",
    countryCode: "br",
    date: "Ontem",
    time: "20:00",
    status: "FT",
    homeTeam: "Flamengo",
    homeLogo: "https://media.api-sports.io/football/teams/97.png",
    awayTeam: "Corinthians",
    awayLogo: "https://media.api-sports.io/football/teams/131.png",
    homeScore: 3,
    awayScore: 1,
    events: [
      { elapsed: 12, team: "Flamengo", player: "Pedro", type: "Goal", detail: "Gol Normal", assist: "Gerson" },
      { elapsed: 31, team: "Corinthians", player: "Yuri Alberto", type: "Card", detail: "Cartão Amarelo" },
      { elapsed: 45, team: "Flamengo", player: "Gerson", type: "Goal", detail: "Chute de Fora", assist: "Arrascaeta" },
      { elapsed: 61, team: "Corinthians", player: "Rodrigo Garro", type: "Goal", detail: "Falta Direta" },
      { elapsed: 83, team: "Flamengo", player: "Arrascaeta", type: "Goal", detail: "Normal Gol", assist: "Pedro" }
    ],
    lineups: {
      home: {
        formation: "4-3-3",
        coach: "Filipe Luís",
        startXI: [
          { number: 1, name: "Rossi", pos: "G" },
          { number: 2, name: "Guillermo Varela", pos: "D" },
          { number: 3, name: "Fabrício Bruno", pos: "D" },
          { number: 4, name: "Léo Pereira", pos: "D" },
          { number: 6, name: "Ayrton Lucas", pos: "D" },
          { number: 8, name: "Gerson", pos: "M" },
          { number: 5, name: "Erick Pulgar", pos: "M" },
          { number: 14, name: "Giorgian De Arrascaeta", pos: "M" },
          { number: 11, name: "Everton Cebolinha", pos: "F" },
          { number: 9, name: "Pedro", pos: "F" },
          { number: 27, name: "Bruno Henrique", pos: "F" }
        ]
      },
      away: {
        formation: "4-2-3-1",
        coach: "Ramón Díaz",
        startXI: [
          { number: 12, name: "Hugo Souza", pos: "G" },
          { number: 23, name: "Fagner", pos: "D" },
          { number: 4, name: "André Ramalho", pos: "D" },
          { number: 3, name: "Félix Torres", pos: "D" },
          { number: 46, name: "Hugo", pos: "D" },
          { number: 8, name: "Raniele", pos: "M" },
          { number: 25, name: "Breno Bidon", pos: "M" },
          { number: 10, name: "Rodrigo Garro", pos: "M" },
          { number: 7, name: "Igor Coronado", pos: "M" },
          { number: 11, name: "Ángel Romero", pos: "F" },
          { number: 9, name: "Yuri Alberto", pos: "F" }
        ]
      }
    },
    statistics: [
      { metric: "Chutes no Alvo", home: "9", away: "4", homePercent: 69, awayPercent: 31 },
      { metric: "Chutes fora do Alvo", home: "6", away: "5", homePercent: 55, awayPercent: 45 },
      { metric: "Posse de Bola", home: "58%", away: "42%", homePercent: 58, awayPercent: 42 },
      { metric: "Escanteios", home: "8", away: "3", homePercent: 72, awayPercent: 28 },
      { metric: "Faltas", home: "12", away: "18", homePercent: 40, awayPercent: 60 },
      { metric: "Cartões Amarelos", home: "1", away: "4", homePercent: 20, awayPercent: 80 }
    ],
    players: [
      { name: "Pedro", rating: "8.9", goals: 1, assists: 1, team: "Flamengo" },
      { name: "Gerson", rating: "8.5", goals: 1, assists: 1, team: "Flamengo" },
      { name: "Rodrigo Garro", rating: "8.0", goals: 1, assists: 0, team: "Corinthians" }
    ]
  },
  {
    id: "wm-4",
    leagueId: 72,
    leagueName: "Brasileirão Série B",
    leagueLogo: "https://media.api-sports.io/football/leagues/72.png",
    country: "Brasil",
    countryCode: "br",
    date: "12 Jun 2024",
    time: "19:00",
    status: "FT",
    homeTeam: "Santos FC",
    homeLogo: "https://media.api-sports.io/football/teams/132.png",
    awayTeam: "Sport Recife",
    awayLogo: "https://media.api-sports.io/football/teams/137.png",
    homeScore: 2,
    awayScore: 0,
    events: [
      { elapsed: 22, team: "Santos FC", player: "Guilherme", type: "Goal", detail: "Chute Cruzado", assist: "Otero" },
      { elapsed: 67, team: "Santos FC", player: "Julio Furch", type: "Goal", detail: "Gol Normal", assist: "Schmidt" }
    ],
    lineups: {
      home: {
        formation: "4-4-2",
        coach: "Fábio Carille",
        startXI: [
          { number: 1, name: "Gabriel Brazão", pos: "G" },
          { number: 4, name: "Gil", pos: "D" },
          { number: 2, name: "Jair", pos: "D" },
          { number: 3, name: "Escobar", pos: "D" },
          { number: 10, name: "Chermont", pos: "D" },
          { number: 8, name: "Schmidt", pos: "M" },
          { number: 5, name: "Diego Pituca", pos: "M" },
          { number: 20, name: "Giuliano", pos: "M" },
          { number: 7, name: "Otero", pos: "M" },
          { number: 11, name: "Guilherme", pos: "F" },
          { number: 9, name: "Julio Furch", pos: "F" }
        ]
      },
      away: {
        formation: "4-3-3",
        coach: "Pepa",
        startXI: [
          { number: 1, name: "Caíque França", pos: "G" },
          { number: 2, name: "Igor Cariús", pos: "D" },
          { number: 3, name: "Rafael Thyere", pos: "D" },
          { number: 4, name: "Chico", pos: "D" },
          { number: 6, name: "Felipinho", pos: "D" },
          { number: 5, name: "Felipe", pos: "M" },
          { number: 8, name: "Fabricio Domínguez", pos: "M" },
          { number: 10, name: "Lucas Lima", pos: "M" },
          { number: 7, name: "Chrystian Barletta", pos: "F" },
          { number: 9, name: "Gustavo Coutinho", pos: "F" },
          { number: 11, name: "Zé Roberto", pos: "F" }
        ]
      }
    },
    statistics: [
      { metric: "Chutes no Alvo", home: "6", away: "2", homePercent: 75, awayPercent: 25 },
      { metric: "Chutes fora do Alvo", home: "7", away: "4", homePercent: 63, awayPercent: 37 },
      { metric: "Posse de Bola", home: "52%", away: "48%", homePercent: 52, awayPercent: 48 },
      { metric: "Escanteios", home: "5", away: "2", homePercent: 71, awayPercent: 29 },
      { metric: "Faltas", home: "14", away: "11", homePercent: 56, awayPercent: 44 }
    ],
    players: [
      { name: "Guilherme", rating: "8.3", goals: 1, assists: 0, team: "Santos FC" },
      { name: "Schmidt", rating: "7.7", goals: 0, assists: 1, team: "Santos FC" }
    ]
  },
  {
    id: "wm-5",
    leagueId: 13,
    leagueName: "Copa Libertadores",
    leagueLogo: "https://media.api-sports.io/football/leagues/13.png",
    country: "América do Sul",
    countryCode: "sa",
    date: "14 Mai 2024",
    time: "21:30",
    status: "FT",
    homeTeam: "Palmeiras",
    homeLogo: "https://media.api-sports.io/football/teams/121.png",
    awayTeam: "River Plate",
    awayLogo: "https://media.api-sports.io/football/teams/14.png",
    homeScore: 2,
    awayScore: 2,
    events: [
      { elapsed: 9, team: "River Plate", player: "Miguel Borja", type: "Goal", detail: "Gol de Área" },
      { elapsed: 35, team: "Palmeiras", player: "Murilo", type: "Goal", detail: "Cabeçada Forte" },
      { elapsed: 54, team: "River Plate", player: "Claudio Echeverri", type: "Goal", detail: "Individual individual" },
      { elapsed: 88, team: "Palmeiras", player: "Rony", type: "Goal", detail: "Gol de Bicicleta!" }
    ],
    lineups: {
      home: {
        formation: "3-5-2",
        coach: "Abel Ferreira",
        startXI: [
          { number: 21, name: "Weverton", pos: "G" },
          { number: 15, name: "Gustavo Gómez", pos: "D" },
          { number: 26, name: "Murilo", pos: "D" },
          { number: 3, name: "Kaeso Naves", pos: "D" },
          { number: 2, name: "Mayke", pos: "M" },
          { number: 6, name: "Joao Piquerez", pos: "M" },
          { number: 5, name: "Aníbal Moreno", pos: "M" },
          { number: 27, name: "Richard Ríos", pos: "M" },
          { number: 23, name: "Raphael Veiga", pos: "M" },
          { number: 10, name: "Rony", pos: "F" },
          { number: 42, name: "Flaco López", pos: "F" }
        ]
      },
      away: {
        formation: "4-3-1-2",
        coach: "Marcelo Gallardo",
        startXI: [
          { number: 1, name: "Franco Armani", pos: "G" },
          { number: 2, name: "Fabricio Bustos", pos: "D" },
          { number: 3, name: "Germán Pezzella", pos: "D" },
          { number: 14, name: "Paulo Díaz", pos: "D" },
          { number: 24, name: "Marcos Acuña", pos: "D" },
          { number: 5, name: "Matías Kranevitter", pos: "M" },
          { number: 8, name: "Maxi Meza", pos: "M" },
          { number: 10, name: "Manuel Lanzini", pos: "M" },
          { number: 19, name: "Claudio Echeverri", pos: "M" },
          { number: 9, name: "Miguel Borja", pos: "F" },
          { number: 11, name: "Facundo Colidio", pos: "F" }
        ]
      }
    },
    statistics: [
      { metric: "Chutes no Alvo", home: "7", away: "6", homePercent: 54, awayPercent: 46 },
      { metric: "Total de Chutes", home: "16", away: "14", homePercent: 53, awayPercent: 47 },
      { metric: "Faltas", home: "15", away: "16", homePercent: 48, awayPercent: 52 },
      { metric: "Escanteios", home: "7", away: "5", homePercent: 58, awayPercent: 42 },
      { metric: "Posse de Bola", home: "54%", away: "46%", homePercent: 54, awayPercent: 46 }
    ],
    players: [
      { name: "Rony", rating: "8.6", goals: 1, assists: 0, team: "Palmeiras" },
      { name: "Miguel Borja", rating: "8.1", goals: 1, assists: 0, team: "River Plate" }
    ]
  }
];
