/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Shield, Activity, RefreshCw, Zap, Sparkles, 
  Check, Copy, Star, Search, Flame, AlertCircle, Save, Trash2, 
  TrendingUp, Dribbble, ArrowUpRight, CloudRain, Sun, Wind, ChevronRight
} from "lucide-react";
import { TeamStats } from "../types";
import { WIDGET_MATCHES, WidgetMatch } from "./WidgetData";
import TeamSelector from "./TeamSelector";

interface ApiExplorerProps {
  teams: TeamStats[];
}

interface SavedPrediction {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  predictedWinner: string;
  predictedScore: string;
  confidence: number;
  notes: string;
  date: string;
}

// Factorial helper
function factorialize(num: number): number {
  if (num < 0) return 1;
  if (num === 0) return 1;
  let res = 1;
  for (let i = 1; i <= num; i++) {
    res *= i;
  }
  return res;
}

// Poisson probability function
function poisson(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorialize(k);
}

export default function ApiExplorer({ teams }: ApiExplorerProps) {
  // Team selection states
  const [homeTeamId, setHomeTeamId] = useState<number>(teams[0]?.id || 126); // Default São Paulo
  const [awayTeamId, setAwayTeamId] = useState<number>(teams[1]?.id || 121); // Default Palmeiras

  // Match Simulation sliders & configurations
  const [homeAdvantage, setHomeAdvantage] = useState<number>(15); // +15% goals to home team by default
  const [weatherCondition, setWeatherCondition] = useState<"clear" | "rain" | "wind">("clear");
  const [homeModifier, setHomeModifier] = useState<number>(0); // Offensive bonus/defect
  const [awayModifier, setAwayModifier] = useState<number>(0); // Offensive bonus/defect
  const [defenseMultiplier, setDefenseMultiplier] = useState<number>(0); // Global defensive stiffness

  // Selection state for current tab
  const [activeTab, setActiveTab] = useState<"odds" | "exact_scores" | "in_play" | "saved">("odds");

  // Saved prediction states
  const [savedPredictions, setSavedPredictions] = useState<SavedPrediction[]>([]);
  const [userPredictionTip, setUserPredictionTip] = useState<string>("home");
  const [userConfidence, setUserConfidence] = useState<number>(4);
  const [userNotes, setUserNotes] = useState<string>("");
  const [isSavedPrompt, setIsSavedPrompt] = useState<boolean>(false);

  // In-play live scenario simulator states
  const [liveHomeGoals, setLiveHomeGoals] = useState<number>(0);
  const [liveAwayGoals, setLiveAwayGoals] = useState<number>(0);
  const [liveRedCardHome, setLiveRedCardHome] = useState<boolean>(false);
  const [liveRedCardAway, setLiveRedCardAway] = useState<boolean>(false);
  const [liveMinute, setLiveMinute] = useState<number>(0); // 0 to 90 min

  // Highlight Featured Match selection states
  const [selectedWidgetMatchId, setSelectedWidgetMatchId] = useState<string>("wm-2");
  const [activeWidgetTab, setActiveWidgetTab] = useState<"stats" | "lineups" | "events" | "players">("stats");

  // Load saved predictions from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pitch_intel_saved_preds");
      if (stored) {
        setSavedPredictions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Falha ao recuperar previsões", e);
    }
  }, []);

  const homeTeam = teams.find(t => t.id === homeTeamId) || teams[0];
  const awayTeam = teams.find(t => t.id === awayTeamId) || teams[1];

  // Recalculate if home and away team are the same to avoid collision
  useEffect(() => {
    if (homeTeamId === awayTeamId) {
      const remaining = teams.find(t => t.id !== homeTeamId);
      if (remaining) {
        setAwayTeamId(remaining.id);
      }
    }
  }, [homeTeamId, awayTeamId, teams]);

  // Handle Quick Select Match to load detailed statistics
  const applyFeaturedMatch = (m: WidgetMatch) => {
    const foundHome = teams.find(t => t.name.toLowerCase().includes(m.homeTeam.toLowerCase()) || m.homeTeam.toLowerCase().includes(t.name.toLowerCase()));
    const foundAway = teams.find(t => t.name.toLowerCase().includes(m.awayTeam.toLowerCase()) || m.awayTeam.toLowerCase().includes(t.name.toLowerCase()));
    
    if (foundHome) setHomeTeamId(foundHome.id);
    if (foundAway) setAwayTeamId(foundAway.id);
    
    // Reset Live Simulator on match load
    setLiveHomeGoals(0);
    setLiveAwayGoals(0);
    setLiveRedCardHome(false);
    setLiveRedCardAway(false);
    setLiveMinute(0);
  };

  const selectedWidgetMatch = WIDGET_MATCHES.find(m => m.id === selectedWidgetMatchId) || WIDGET_MATCHES[0];

  // WEATHER EFFECT MULTIPLIER
  const getWeatherFactor = () => {
    switch (weatherCondition) {
      case "rain": return 0.88; // -12% expected goals (slippery grass and ball control)
      case "wind": return 0.92; // -8% expected goals (aerodynamic disturbances)
      default: return 1.0;
    }
  };

  // POISSON ENGINE PROJECTIONS CALCULATOR
  const calculatePoissonAverages = () => {
    if (!homeTeam || !awayTeam) return { homeExpected: 1.5, awayExpected: 1.2 };

    // Standard baseline average goals in typical leagues
    const defaultBaseline = 1.35;

    // Expected goals scored (offensive force of A vs defensive weak of B)
    let homeExpected = homeTeam.avgGoalsScored * (awayTeam.avgGoalsConceded / defaultBaseline);
    let awayExpected = awayTeam.avgGoalsScored * (homeTeam.avgGoalsConceded / defaultBaseline);

    // Apply Home Advantage modifier
    homeExpected *= (1 + homeAdvantage / 100);

    // Apply Custom Slider modifiers
    homeExpected *= (1 + homeModifier / 100);
    awayExpected *= (1 + awayModifier / 100);

    // Apply Defensive stiffness offset
    if (defenseMultiplier !== 0) {
      const stiffness = 1 - (defenseMultiplier / 100);
      homeExpected *= stiffness;
      awayExpected *= stiffness;
    }

    // Weather impact
    const weatherF = getWeatherFactor();
    homeExpected *= weatherF;
    awayExpected *= weatherF;

    // Safety checks
    homeExpected = Math.max(0.1, Math.min(6.0, homeExpected));
    awayExpected = Math.max(0.1, Math.min(6.0, awayExpected));

    return {
      homeExpected,
      awayExpected
    };
  };

  const { homeExpected, awayExpected } = calculatePoissonAverages();

  // GENERATE COMBINED MATRIX AND PROBABILITIES
  const generateProbabilities = () => {
    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;

    let over15Prob = 0;
    let over25Prob = 0;
    let over35Prob = 0;
    let bttsProb = 0;

    // Max goals to compute in Poisson matrix (0 to 6 goals)
    const MAX_GOALS = 6;
    const scoreMatrix: { score: string; prob: number; homeVal: number; awayVal: number }[] = [];

    for (let h = 0; h <= MAX_GOALS; h++) {
      for (let a = 0; a <= MAX_GOALS; a++) {
        const hProb = poisson(homeExpected, h);
        const aProb = poisson(awayExpected, a);
        const combined = hProb * aProb;

        if (h > a) homeWinProb += combined;
        else if (h === a) drawProb += combined;
        else awayWinProb += combined;

        const totalGoals = h + a;
        if (totalGoals > 1.5) over15Prob += combined;
        if (totalGoals > 2.5) over25Prob += combined;
        if (totalGoals > 3.5) over35Prob += combined;

        if (h > 0 && a > 0) bttsProb += combined;

        scoreMatrix.push({
          score: `${h} - ${a}`,
          prob: combined,
          homeVal: h,
          awayVal: a
        });
      }
    }

    // Sort score combination list to find top exact scores
    const topExactScores = [...scoreMatrix]
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 8);

    // Dynamic Live Simulation Recalculator
    // Calculate live fair odds taking in consideration elapsed time and live scores
    const calculateLiveFairOdds = () => {
      // Linear projection based on remaining match seconds
      const elapsedFactor = Math.max(0, 90 - liveMinute) / 90;
      
      // Expected remaining goals for home and away
      let liveHomeExp = homeExpected * elapsedFactor;
      let liveAwayExp = awayExpected * elapsedFactor;

      // Red card modifier
      if (liveRedCardHome) {
        liveHomeExp *= 0.65; // -35% attacking force
        liveAwayExp *= 1.25; // +25% concession risk
      }
      if (liveRedCardAway) {
        liveAwayExp *= 0.65;
        liveHomeExp *= 1.25;
      }

      let liveHomeWin = 0;
      let liveDraw = 0;
      let liveAwayWin = 0;

      for (let hRem = 0; hRem <= 5; hRem++) {
        for (let aRem = 0; aRem <= 5; aRem++) {
          const hProb = poisson(liveHomeExp, hRem);
          const aProb = poisson(liveAwayExp, aRem);
          const combined = hProb * aProb;

          const totalHome = liveHomeGoals + hRem;
          const totalAway = liveAwayGoals + aRem;

          if (totalHome > totalAway) liveHomeWin += combined;
          else if (totalHome === totalAway) liveDraw += combined;
          else liveAwayWin += combined;
        }
      }

      // Safeguard normalisation
      const sum = liveHomeWin + liveDraw + liveAwayWin;
      if (sum > 0) {
        liveHomeWin /= sum;
        liveDraw /= sum;
        liveAwayWin /= sum;
      }

      return {
        liveHomeWin,
        liveDraw,
        liveAwayWin
      };
    };

    const liveProbs = calculateLiveFairOdds();

    return {
      homeWin: homeWinProb * 100,
      draw: drawProb * 100,
      awayWin: awayWinProb * 100,
      over15: over15Prob * 100,
      over25: over25Prob * 100,
      over35: over35Prob * 100,
      btts: bttsProb * 100,
      topScores: topExactScores,
      fullMatrix: scoreMatrix,
      liveProbs
    };
  };

  const results = generateProbabilities();

  const handleSavePrediction = () => {
    if (!homeTeam || !awayTeam) return;

    // Estimate scoreboard suggestion based on top score
    const topScore = results.topScores[0]?.score || "1 - 1";
    let scoreText = topScore;
    
    let label = "Empate";
    if (userPredictionTip === "home") label = homeTeam.name;
    else if (userPredictionTip === "away") label = awayTeam.name;

    const newPred: SavedPrediction = {
      id: "pred-" + Date.now(),
      homeTeam: homeTeam.name,
      homeLogo: homeTeam.logo,
      awayTeam: awayTeam.name,
      awayLogo: awayTeam.logo,
      predictedWinner: label,
      predictedScore: scoreText,
      confidence: userConfidence,
      notes: userNotes || "Análise Poisson de valor justo em odds da rodada.",
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    };

    const nextList = [newPred, ...savedPredictions];
    setSavedPredictions(nextList);
    localStorage.setItem("pitch_intel_saved_preds", JSON.stringify(nextList));
    
    // Reset notification and input
    setUserNotes("");
    setIsSavedPrompt(true);
    setTimeout(() => setIsSavedPrompt(false), 3000);
  };

  const handleDeletePrediction = (id: string) => {
    const nextList = savedPredictions.filter(p => p.id !== id);
    setSavedPredictions(nextList);
    localStorage.setItem("pitch_intel_saved_preds", JSON.stringify(nextList));
  };

  // Convert probability percentage directly into Decimal European Odds (1 / p)
  const toDecimalOdds = (percentage: number) => {
    if (percentage <= 0) return "99.00";
    const odds = 100 / percentage;
    return odds.toFixed(2);
  };

  // Auto pick smart tip of the match
  const getPitchIntelAdvice = () => {
    const scores = results.topScores;
    const mostLikely = scores[0];
    
    if (results.homeWin > 52) {
      return {
        text: `Vitória do ${homeTeam.name}`,
        sub: `Poisson prevê alto volume ofensivo para os mandantes (~${homeExpected.toFixed(2)} gols esperados). Entrada de valor em handicap -0.5 ou vitória seca.`,
        odds: toDecimalOdds(results.homeWin)
      };
    } else if (results.awayWin > 48) {
      return {
        text: `Vitória do ${awayTeam.name}`,
        sub: `O ${awayTeam.name} possui ataque avassalador diante do sistema do adversário em análises diretas de Poisson.`,
        odds: toDecimalOdds(results.awayWin)
      };
    } else {
      // Balanced draw advice
      const bttsValue = results.btts > 55;
      return {
        text: bttsValue ? "Ambos Marcam Sim" : "Empate ou Dupla Chance Fora",
        sub: `Confronto de forças extremamente equilibradas. Previsão de placar provável: ${mostLikely?.score}.`,
        odds: bttsValue ? toDecimalOdds(results.btts) : toDecimalOdds(results.draw + results.awayWin)
      };
    }
  };

  const pitchAdvice = getPitchIntelAdvice();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-8 text-left" id="prediction-hub-root">
      
      {/* PROFESSIONAL TITLE HEADER */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] tracking-wider rounded px-2.5 py-1 uppercase">Poisson Core v3.0</span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-emerald-400" />
                CENTRO DE PREVISÕES PRO E SIMULAÇÕES POISSON DE CONFRONTOS
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Nossa ferramenta para os usuários finais calcularem cenários de confrontos, visualizarem Fair Odds estimadas e guardarem as suas análises para as rodadas. Selecione dois clubes com suas bandeiras, ajuste as variáveis climáticas e veja a precisão matemática das predições!
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 shrink-0 select-none">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="font-mono text-[10px] text-left">
              <span className="text-slate-500 block font-bold leading-tight">MÓDULO DE CÁLCULO</span>
              <span className="text-emerald-400 font-extrabold uppercase tracking-wider">MATRIZ POISSON REAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* MATCHUP PICKER COMPONENT (HOME vs AWAY) WITH CLUB CRESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-850 relative">
        
        {/* Home Team Slot Selection */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">Equipe Mandante (Casa)</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">Gols Marcados: {homeTeam ? homeTeam.avgGoalsScored : 1.3} /j</span>
          </div>
          <TeamSelector 
            selectedTeamId={homeTeamId}
            onChange={setHomeTeamId}
            teams={teams}
            disabledId={awayTeamId}
          />
        </div>

        {/* Central VERSUS Badge */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center text-center py-2 lg:py-0">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950 font-black p-3.5 rounded-full shadow-lg shadow-emerald-500/10 flex items-center justify-center border-4 border-slate-900 shrink-0 select-none z-10 w-12 h-12">
            <span className="text-sm tracking-tighter">VS</span>
          </div>
          <p className="text-[9px] font-mono text-slate-500 font-bold uppercase mt-1 tracking-widest leading-none">Matriz Ativa</p>
        </div>

        {/* Away Team Slot Selection */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">Equipe Visitante (Fora)</span>
            <span className="text-[10px] font-mono font-bold text-amber-500">Gols Marcados: {awayTeam ? awayTeam.avgGoalsScored : 1.1} /j</span>
          </div>
          <TeamSelector 
            selectedTeamId={awayTeamId}
            onChange={setAwayTeamId}
            teams={teams}
            disabledId={homeTeamId}
          />
        </div>
      </div>

      {/* CORE ANALYSIS GRID (LEFT: CONTROL PANEL, RIGHT: CALCULATED PROJECTIONS & ODDS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="core-projection-compartment">
        
        {/* PANEL DE CONTROLE DE PARÂMETROS DE JOGO: SLIDERS & WEATHER (width 4/12) */}
        <div className="xl:col-span-4 space-y-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
          <div className="border-b border-slate-900 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Variáveis e Condicionantes
            </h3>
            <span className="text-[8px] bg-slate-900 text-slate-400 font-mono font-black rounded px-1.5 py-0.5">EDITÁVEL</span>
          </div>

          {/* Slider 1: Home Advantage parameter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-350 font-bold">Fator Vantagem de Casa</span>
              <span className="text-emerald-400 font-extrabold">+{homeAdvantage}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="40" 
              value={homeAdvantage} 
              onChange={(e) => setHomeAdvantage(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer select-none"
            />
            <p className="text-[9px] text-slate-500 font-mono italic leading-tight">Fator inflacionador de pressão de torcida e familiaridade com o estádio.</p>
          </div>

          {/* Slider 2: Shift offensive power to Home */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-350 font-bold">Ajuste de Força: {homeTeam?.name}</span>
              <span className={`font-extrabold ${homeModifier >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {homeModifier >= 0 ? `+${homeModifier}` : homeModifier}%
              </span>
            </div>
            <input 
              type="range" 
              min="-30" 
              max="30" 
              value={homeModifier} 
              onChange={(e) => setHomeModifier(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer select-none"
            />
            <p className="text-[9px] text-slate-500 font-mono italic leading-tight">Use para compensar reforços extras ou retorno de jogadores táticos.</p>
          </div>

          {/* Slider 3: Shift offensive power to Away */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-350 font-bold">Ajuste de Força: {awayTeam?.name}</span>
              <span className={`font-extrabold ${awayModifier >= 0 ? "text-amber-400" : "text-rose-500"}`}>
                {awayModifier >= 0 ? `+${awayModifier}` : awayModifier}%
              </span>
            </div>
            <input 
              type="range" 
              min="-30" 
              max="30" 
              value={awayModifier} 
              onChange={(e) => setAwayModifier(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer select-none"
            />
            <p className="text-[9px] text-slate-500 font-mono italic leading-tight">Simule desfalques urgentes no setor de criação ou lesão do artilheiro.</p>
          </div>

          {/* Slider 4: Match Stiffness (Defensiveness) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-350 font-bold">Foco Tático Defensivo</span>
              <span className="text-cyan-400 font-extrabold">+{defenseMultiplier}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="40" 
              value={defenseMultiplier} 
              onChange={(e) => setDefenseMultiplier(parseInt(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer select-none"
            />
            <p className="text-[9px] text-slate-500 font-mono italic leading-tight">Aumenta o rigor defensivo e compactação mútua no meio campo, reduzindo gols calculados.</p>
          </div>

          {/* Weather configuration selectors */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase tracking-wide">Clima do Dia da Partida</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setWeatherCondition("clear")}
                className={`py-2 px-1 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${weatherCondition === "clear" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-slate-900/60 border-slate-800 text-slate-500"}`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Ensolarado</span>
              </button>
              <button
                onClick={() => setWeatherCondition("rain")}
                className={`py-2 px-1 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${weatherCondition === "rain" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-slate-900/60 border-slate-800 text-slate-500"}`}
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>Chuvoso (-12%)</span>
              </button>
              <button
                onClick={() => setWeatherCondition("wind")}
                className={`py-2 px-1 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${weatherCondition === "wind" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-slate-900/60 border-slate-800 text-slate-500"}`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Ventos Fortes</span>
              </button>
            </div>
          </div>

          {/* Reset button parameters */}
          <button
            onClick={() => {
              setHomeAdvantage(15);
              setHomeModifier(0);
              setAwayModifier(0);
              setDefenseMultiplier(0);
              setWeatherCondition("clear");
            }}
            className="w-full bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 transition duration-200 font-mono text-[9px] font-bold tracking-widest text-slate-400 rounded-xl py-2 uppercase shrink-0"
          >
            Resetar Parâmetros Standard
          </button>
        </div>

        {/* PREDICTION ENGINE OUTPUTS COMPONENT (width 8/12) */}
        <div className="xl:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Custom Tabs selector for predictions */}
          <div className="flex border-b border-slate-800 pb-1 text-xs font-bold gap-4 sm:gap-6 overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab("odds")}
              className={`pb-2.5 transition-all uppercase cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "odds" ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Chances de Vitória & Odds Justas</span>
            </button>
            <button
              onClick={() => setActiveTab("exact_scores")}
              className={`pb-2.5 transition-all uppercase cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "exact_scores" ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
            >
              <Dribbble className="w-3.5 h-3.5 shrink-0" />
              <span>Placares Exatos Prováveis</span>
            </button>
            <button
              onClick={() => setActiveTab("in_play")}
              className={`pb-2.5 transition-all uppercase cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "in_play" ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Simulador Ao Vivo In-Play</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-2.5 transition-all uppercase cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === "saved" ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white-400"}`}
            >
              <Star className="w-3.5 h-3.5 shrink-0" />
              <span>Minhas Análises ({savedPredictions.length})</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: PREDICTION ODDS AND ADVICE */}
          {activeTab === "odds" && (
            <div className="space-y-4">
              
              {/* Projections stats calculated results summary banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Home Stats expected math goals summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-10 h-10 object-contain shrink-0" referrerPolicy="no-referrer" />
                  <div className="text-left font-mono text-[10px]">
                    <span className="text-slate-500 font-bold uppercase block">Média Projetada {homeTeam.shortName}</span>
                    <span className="text-emerald-400 font-black text-base">{homeExpected.toFixed(2)} <span className="text-xs text-slate-500">Gols Esperados</span></span>
                  </div>
                </div>

                {/* Away Stats expected math goals summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3">
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-10 h-10 object-contain shrink-0" referrerPolicy="no-referrer" />
                  <div className="text-left font-mono text-[10px]">
                    <span className="text-slate-500 font-bold uppercase block">Média Projetada {awayTeam.shortName}</span>
                    <span className="text-amber-400 font-black text-base">{awayExpected.toFixed(2)} <span className="text-xs text-slate-500">Gols Esperados</span></span>
                  </div>
                </div>

              </div>

              {/* THREE MAIN OUTCOMES (1X2 MATCH WINNER CHANCES) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Modelo de Resultado 1X2 Justo</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  {/* HOME WIN probabilities and odds */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase block truncate">Vitória {homeTeam.name}</span>
                      <p className="text-lg font-black text-emerald-400">{results.homeWin.toFixed(1)}%</p>
                    </div>
                    <div className="border-t border-slate-850/50 pt-1.5 mt-2 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">ODDS FAIR</span>
                      <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded font-black border border-slate-800">
                        @{toDecimalOdds(results.homeWin)}
                      </span>
                    </div>
                  </div>

                  {/* DRAW probabilities and odds */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase block">Estatística de Empate</span>
                      <p className="text-lg font-black text-slate-300">{results.draw.toFixed(1)}%</p>
                    </div>
                    <div className="border-t border-slate-850/50 pt-1.5 mt-2 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">ODDS FAIR</span>
                      <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-black border border-slate-800">
                        @{toDecimalOdds(results.draw)}
                      </span>
                    </div>
                  </div>

                  {/* AWAY WIN probabilities and odds */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase block truncate font-bold">Vitória {awayTeam.name}</span>
                      <p className="text-lg font-black text-amber-400">{results.awayWin.toFixed(1)}%</p>
                    </div>
                    <div className="border-t border-slate-850/50 pt-1.5 mt-2 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">ODDS FAIR</span>
                      <span className="bg-slate-950 text-amber-500 px-2 py-0.5 rounded font-black border border-slate-800">
                        @{toDecimalOdds(results.awayWin)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress-bar indicator for the 3 outcomes */}
                <div className="h-2 w-full bg-slate-900 rounded-full flex overflow-hidden">
                  <div style={{ width: `${results.homeWin}%` }} className="bg-emerald-500 h-full rounded-l-full shadow" />
                  <div style={{ width: `${results.draw}%` }} className="bg-slate-600 h-full" />
                  <div style={{ width: `${results.awayWin}%` }} className="bg-amber-400 h-full rounded-r-full shadow" />
                </div>
              </div>

              {/* OVER/UNDER GOALS & BOTH TEAMS TO SCORE MARKETS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Over Under options calculated percents */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5 text-left">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Gols Totais (Acima / Abaixo)</span>
                  
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {/* Over 1.5 Goals */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">🔥 +1.5 Gols na Partida</span>
                        <span className="text-emerald-400 font-black">{results.over15.toFixed(1)}% (@{toDecimalOdds(results.over15)})</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div style={{ width: `${results.over15}%` }} className="bg-emerald-500 h-full" />
                      </div>
                    </div>

                    {/* Over 2.5 Goals */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">⚽ +2.5 Gols na Partida</span>
                        <span className="text-emerald-400 font-black">{results.over25.toFixed(1)}% (@{toDecimalOdds(results.over25)})</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div style={{ width: `${results.over25}%` }} className="bg-emerald-500 h-full" />
                      </div>
                    </div>

                    {/* Over 3.5 Goals */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-400">⚡ +3.5 Gols na Partida</span>
                        <span className="text-emerald-400 font-black">{results.over35.toFixed(1)}% (@{toDecimalOdds(results.over35)})</span>
                      </div>
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div style={{ width: `${results.over35}%` }} className="bg-emerald-500 h-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Both Teams To Score (Ambos Marcam) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block mb-2.5">Ambos Marcam (BTTS)</span>
                    <div className="flex items-center justify-between font-mono bg-slate-900 p-3 rounded-lg border border-slate-850">
                      <div>
                        <span className="text-emerald-400 font-black text-xl block">{results.btts.toFixed(1)}%</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase block mt-0.5">Probabilidade SIM</span>
                      </div>
                      <div className="text-right">
                        <span className="bg-slate-950 font-black text-white px-2.5 py-1 rounded border border-slate-800 text-xs">
                          @{toDecimalOdds(results.btts)}
                        </span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase block mt-1">Odds Estimada</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] leading-relaxed text-slate-400 font-mono mt-3 border-t border-slate-900/60 pt-2.5">
                    * {results.btts > 52 ? "Recomendando Ambos Marcam SIM com base nos índices defensivos agressivos" : "Modelo sugere Ambos Marcam NÃO dado o equilíbrio e postura tática rígida"} das equipes.
                  </p>
                </div>

              </div>

              {/* INTEGRATED INTELLIGENT AI ADVICE BOX */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-slate-950 to-slate-955 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-mono font-extrabold uppercase text-emerald-400 tracking-wider">Palpite e Inteligência Poisson</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{pitchAdvice.text}</h4>
                  <p className="text-[9.5px] text-slate-400 leading-snug max-w-xl">{pitchAdvice.sub}</p>
                </div>
                <div className="bg-slate-900 p-2 px-3 border border-slate-800 rounded-lg shrink-0 text-center sm:text-right font-mono">
                  <span className="text-[8px] text-slate-550 block font-bold leading-none uppercase">ODDS RECOMENDADA</span>
                  <span className="text-emerald-400 font-extrabold text-sm tracking-tight inline-block mt-0.5">@{pitchAdvice.odds}</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2 CONTENT: EXACT SCORES MATRIX HEATMAP */}
          {activeTab === "exact_scores" && (
            <div className="space-y-5">
              
              {/* Dynamic Heatmap score outcome visualization */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block mb-1.5 text-left">As 8 Pontuações Mais Prováveis do Robô</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                  {results.topScores.map((sc, index) => {
                    const percentVal = (sc.prob * 100).toFixed(1);
                    return (
                      <div key={index} className="bg-slate-900 border border-slate-850/60 p-2.5 rounded-xl flex flex-col justify-between relative overflow-hidden">
                        {/* Number Indicator Rank */}
                        <span className="absolute right-2 top-1 text-[8px] font-black text-slate-700">#{index + 1}</span>
                        
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Placar</span>
                          <span className="text-white font-extrabold text-sm">{sc.score}</span>
                        </div>
                        <div className="border-t border-slate-850/50 pt-1 mt-1.5 flex justify-between items-center text-[10px]">
                          <span className="text-emerald-400 font-black">{percentVal}%</span>
                          <span className="text-slate-550 font-bold">@{toDecimalOdds(sc.prob * 100)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 4x4 matrix for expected score combinations to show complete Poisson matrix */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Matriz Combinatória de Alvos (0 a 3 Gols)</span>
                  <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Diferenças térmicas de calor no mapa ilustram chances exponenciais.</p>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[280px] grid grid-cols-5 gap-1.5 font-mono text-center text-[10px]">
                    {/* Header Row Column Titles */}
                    <div className="bg-slate-950 flex items-center justify-center text-[9px] text-slate-500 font-bold uppercase">Mandante (→)</div>
                    {[0, 1, 2, 3].map(h => (
                      <div key={h} className="bg-slate-900 text-slate-350 p-1 rounded font-bold">{h} Gols</div>
                    ))}

                    {/* Matrix Rows (0 to 3 Goals for Away) */}
                    {[0, 1, 2, 3].map(a => (
                      <React.Fragment key={a}>
                        {/* Row Title */}
                        <div className="bg-slate-900 text-slate-350 p-1 rounded font-bold flex items-center justify-center">{a} Fora</div>
                        
                        {/* Combination cells */}
                        {[0, 1, 2, 3].map(h => {
                          const prob = poisson(homeExpected, h) * poisson(awayExpected, a);
                          const probPct = (prob * 100).toFixed(1);
                          
                          // Heat color styling based on probability strength
                          let bgStyle = "bg-slate-900 border border-slate-850 text-slate-400";
                          if (prob > 0.09) bgStyle = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black";
                          else if (prob > 0.05) bgStyle = "bg-emerald-500/10 text-emerald-300 border border-emerald-550/20";

                          return (
                            <div key={h} className={`p-2.5 rounded-lg flex flex-col justify-center gap-0.5 ${bgStyle}`}>
                              <span className="text-[10px] font-bold block">{h}x{a}</span>
                              <span className="text-[8px] font-bold opacity-80">{probPct}%</span>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3 CONTENT: IN-PLAY GAME EVENT SIMULATOR */}
          {activeTab === "in_play" && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-5 text-left">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Simulador de Eventos do Confronto In-Play</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Simule ocorrências reais de cartões vermelhos ou gols e observe o cálculo instantâneo das Fair live Odds e nova linha de equilíbrio!</p>
              </div>

              {/* Controls Grid block for simulating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs border-y border-slate-900 py-4">
                
                {/* Home interactive simulation controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <img src={homeTeam.logo} alt="Home" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-white font-extrabold">{homeTeam.name} (Mandante)</span>
                  </div>

                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => setLiveHomeGoals(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold rounded-lg border border-slate-800 cursor-pointer"
                    >
                      Remover Gol
                    </button>
                    <button
                      onClick={() => setLiveHomeGoals(prev => prev + 1)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      + Adicionar Gol ({liveHomeGoals})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <label className="text-slate-400 font-bold select-none cursor-pointer flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={liveRedCardHome}
                        onChange={(e) => setLiveRedCardHome(e.target.checked)}
                        className="accent-rose-500 w-3.5 h-3.5 rounded bg-slate-900 outline-none"
                      />
                      <span>Cartão Vermelho Atribuído</span>
                    </label>
                  </div>
                </div>

                {/* Away interactive simulation controls */}
                <div className="space-y-4 border-l border-slate-900 pl-0 md:pl-5">
                  <div className="flex items-center gap-2">
                    <img src={awayTeam.logo} alt="Away" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-white font-extrabold">{awayTeam.name} (Visitante)</span>
                  </div>

                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => setLiveAwayGoals(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold rounded-lg border border-slate-800 cursor-pointer"
                    >
                      Remover Gol
                    </button>
                    <button
                      onClick={() => setLiveAwayGoals(prev => prev + 1)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      + Adicionar Gol ({liveAwayGoals})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <label className="text-slate-400 font-bold select-none cursor-pointer flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={liveRedCardAway}
                        onChange={(e) => setLiveRedCardAway(e.target.checked)}
                        className="accent-rose-500 w-3.5 h-3.5 rounded bg-slate-900 outline-none"
                      />
                      <span>Cartão Vermelho Atribuído</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Timeline minute slider simulator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">Instante Decorrido do Jogo</span>
                  <span className="text-emerald-400 font-black uppercase tracking-wider">{liveMinute === 0 ? "PRÉ-JOGO (0 MIN)" : liveMinute === 90 ? "FIM DE JOGO (90 MIN)" : `${liveMinute}' minutos`}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="90" 
                  value={liveMinute} 
                  onChange={(e) => setLiveMinute(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer select-none"
                />
              </div>

              {/* Dynamic Recalculated Live Probs */}
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-850 text-[10px] font-mono space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Resultado Atual Simulado</span>
                  <span className="text-rose-500 font-black animate-pulse bg-rose-500/10 px-1.5 rounded text-[9px]">{liveMinute}' Minutos</span>
                </div>

                <div className="text-center font-bold font-mono text-sm leading-none flex justify-center items-center gap-4 py-1 select-all">
                  <div className="flex items-center gap-1.5">
                    <img src={homeTeam.logo} alt="Logo" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                    <span>{homeTeam.shortName}</span>
                  </div>
                  <span className="bg-slate-950 font-black text-rose-500 px-3.5 py-1 rounded border border-slate-800 text-base shadow">
                    {liveHomeGoals} - {liveAwayGoals}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>{awayTeam.shortName}</span>
                    <img src={awayTeam.logo} alt="Logo" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-900 font-bold">
                  <div>
                    <span className="text-slate-500 block text-[9px] leading-tight">MÓDULO HOME</span>
                    <span className="text-white font-extrabold">{(results.liveProbs.liveHomeWin * 100).toFixed(1)}%</span>
                    <span className="text-[8px] text-slate-550 block font-normal">@{toDecimalOdds(results.liveProbs.liveHomeWin * 100)}</span>
                  </div>
                  <div className="border-x border-slate-800 px-2">
                    <span className="text-slate-500 block text-[9px] leading-tight font-bold">MÓDULO DRAW</span>
                    <span className="text-white font-extrabold">{(results.liveProbs.liveDraw * 100).toFixed(1)}%</span>
                    <span className="text-[8px] text-slate-550 block font-normal">@{toDecimalOdds(results.liveProbs.liveDraw * 100)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] leading-tight">MÓDULO AWAY</span>
                    <span className="text-white font-extrabold">{(results.liveProbs.liveAwayWin * 100).toFixed(1)}%</span>
                    <span className="text-[8px] text-slate-550 block font-normal">@{toDecimalOdds(results.liveProbs.liveAwayWin * 100)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4 CONTENT: MY SAVED PERSONAL PREDICTIONS LISTS */}
          {activeTab === "saved" && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
              
              {/* Form card to analyze and save prediction prediction */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-left space-y-3 font-mono">
                <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider block">Registar Novo Bilhete / Análise do Jogo</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Select candidate option */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Opção Indicada</label>
                    <select
                      value={userPredictionTip}
                      onChange={(e) => setUserPredictionTip(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                    >
                      <option value="home">Ganha Mandante ({homeTeam.name})</option>
                      <option value="draw">Empate do Confronto</option>
                      <option value="away">Ganha Visitante ({awayTeam.name})</option>
                    </select>
                  </div>

                  {/* Confidence selector input stars */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Nível de Confiança</label>
                    <div className="flex gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setUserConfidence(n)}
                          className="cursor-pointer font-bold focus:outline-none"
                        >
                          <Star className={`w-4.5 h-4.5 ${n <= userConfidence ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Notas da Análise e Fundamentação</label>
                  <input
                    type="text"
                    placeholder="Mencione desfalques, odds de abertura, fair lines detectadas..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                  />
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-slate-950/60">
                  <span className="text-[9px] text-slate-500">Modelo Poisson esperado: <strong className="text-emerald-400">{homeExpected.toFixed(1)}x{awayExpected.toFixed(1)}</strong></span>
                  <button
                    onClick={handleSavePrediction}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SALVAR BILHETE</span>
                  </button>
                </div>

                {isSavedPrompt && (
                  <div className="p-1 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9.5px] text-center font-bold animate-pulse">
                    Previsão cadastrada com sucesso! Persistindo nos arquivos locais do Pitch_Intel.
                  </div>
                )}
              </div>

              {/* Render Saved Prediction collection */}
              <div className="space-y-1.5 text-left font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Bilhetes de Previsão Ativos ({savedPredictions.length})</span>
                
                {savedPredictions.length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-slate-500 italic bg-slate-900 border border-slate-900 rounded-xl">Nenhum bilhete salvo. Formule uma análise no palpite acima e clique em salvar!</div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {savedPredictions.map((pred) => (
                      <div key={pred.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-[10px] gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 text-[8px] font-black rounded">{pred.predictedWinner}</span>
                            <span className="text-[9px] text-slate-400 block font-bold truncate max-w-[150px]">{pred.homeTeam} vs {pred.awayTeam}</span>
                            <span className="text-[8px] text-slate-550 ml-auto">{pred.date}</span>
                          </div>
                          <p className="text-slate-400/90 text-[9px] truncate max-w-lg leading-tight">Nota: {pred.notes}</p>
                        </div>

                        <div className="text-right flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-amber-400 font-extrabold text-[9px] block">★ Conf: {pred.confidence}/5</span>
                            <span className="text-slate-500 text-[8.5px] block font-bold whitespace-nowrap">Placar Poisson: {pred.predictedScore}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePrediction(pred.id)}
                            className="p-1 bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded border border-slate-800 transition duration-150 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
          
        </div>

      </div>

      {/* FOOTER WIDGET SECTION: REAL FEATURED MATCHES TIMELINES, STATS, TEAM SHEETS */}
      <div className="border-t border-slate-850 pt-8 text-left space-y-4">
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Destaques da Rodada Brasileira & Copa Libertadores</h3>
            <p className="text-[10px] text-slate-450 leading-tight">Clique nos jogos prontos da rodada para carregar suas respectivas escalações táticas oficiais e eventos ao vivo históricos.</p>
          </div>
          <span className="text-[9px] bg-slate-950/80 border border-slate-850 text-slate-400 font-mono font-bold px-2 py-1 rounded">SIMULAÇÃO COMPLETA DE POISSON V3</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-950 rounded-2xl border border-slate-850 p-4">
          
          {/* List of select matches available */}
          <div className="lg:col-span-5 max-h-[290px] overflow-y-auto pr-1 space-y-2">
            {[...WIDGET_MATCHES].map((m) => {
              const isSelected = m.id === selectedWidgetMatchId;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedWidgetMatchId(m.id);
                    applyFeaturedMatch(m);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected ? "bg-slate-900 border-emerald-500/30 text-white" : "bg-slate-900/40 border-slate-950 hover:border-slate-850 text-slate-300"}`}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono border-b border-slate-900/10 pb-1 shrink-0">
                    <span className="text-slate-400 font-bold truncate max-w-[140px] uppercase text-[8.5px] leading-tight">{m.leagueName}</span>
                    <span className={`${m.status === "AO VIVO" ? "text-emerald-400 font-extrabold animate-pulse bg-emerald-500/10 px-1 rounded text-[8.5px]" : "text-slate-500 font-bold"}`}>{m.status}</span>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-1 text-[11px] font-bold">
                    <div className="col-span-4 flex items-center gap-1 min-w-0">
                      <img src={m.homeLogo} alt={m.homeTeam} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                      <span className="truncate text-left font-extrabold">{m.homeTeam}</span>
                    </div>
                    
                    <div className="col-span-4 text-center font-mono">
                      <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded font-black text-[10px] text-emerald-400">
                        {m.homeScore} - {m.awayScore}
                      </span>
                    </div>

                    <div className="col-span-4 flex items-center justify-end gap-1 min-w-0 text-right">
                      <span className="truncate text-right font-extrabold">{m.awayTeam}</span>
                      <img src={m.awayLogo} alt={m.awayTeam} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed statistics of selected highlight match */}
          <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-900 pt-4 lg:pt-0 lg:pl-5 min-h-[290px]">
            
            <div className="space-y-3">
              {/* Event Cover Banner of highlight game */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-slate-950 to-slate-955 p-3 rounded-lg border border-slate-850 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <img src={selectedWidgetMatch.leagueLogo} alt="League" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">{selectedWidgetMatch.country}</span>
                    <h4 className="text-[11px] font-black text-white">{selectedWidgetMatch.leagueName}</h4>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-500">{selectedWidgetMatch.date} • {selectedWidgetMatch.time}</span>
              </div>

              {/* Tab Selector buttons */}
              <div className="flex border-b border-slate-900 pb-1 text-[9px] font-extrabold font-mono gap-4 tracking-wider leading-none shrink-0 uppercase select-none">
                <button
                  onClick={() => setActiveWidgetTab("stats")}
                  className={`pb-1.5 transition-all cursor-pointer ${activeWidgetTab === "stats" ? "text-emerald-400 border-b border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
                >
                  Comparativo de Estatísticas
                </button>
                <button
                  onClick={() => setActiveWidgetTab("lineups")}
                  className={`pb-1.5 transition-all cursor-pointer ${activeWidgetTab === "lineups" ? "text-emerald-400 border-b border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
                >
                  Escalações Táticas ({selectedWidgetMatch.lineups.home.formation} vs {selectedWidgetMatch.lineups.away.formation})
                </button>
                <button
                  onClick={() => setActiveWidgetTab("events")}
                  className={`pb-1.5 transition-all cursor-pointer ${activeWidgetTab === "events" ? "text-emerald-400 border-b border-emerald-500 font-extrabold" : "text-slate-500 hover:text-white"}`}
                >
                  Linha do Tempo ({selectedWidgetMatch.events.length})
                </button>
              </div>

              {/* Interactive target tab contents */}
              <div className="overflow-y-auto max-h-[160px] pr-1 pt-1 text-left scrollbar-thin">
                {activeWidgetTab === "stats" && (
                  <div className="space-y-3.5 text-[10px] font-mono">
                    {selectedWidgetMatch.statistics.map((st, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold leading-normal">
                          <span className="font-extrabold text-emerald-400">{st.home}</span>
                          <span className="uppercase text-slate-500 tracking-wider font-extrabold">{st.metric}</span>
                          <span className="font-extrabold text-amber-500">{st.away}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full flex overflow-hidden">
                          <div 
                            style={{ width: `${st.homePercent}%` }} 
                            className="bg-emerald-500 h-full rounded-l-full"
                          />
                          <div 
                            style={{ width: `${st.awayPercent}%` }} 
                            className="bg-amber-400 h-full rounded-r-full ml-auto"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeWidgetTab === "lineups" && (
                  <div className="grid grid-cols-2 gap-4 text-[9px] font-mono">
                    {/* Home sheet */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                        <span className="text-white font-extrabold truncate text-[9.5px]">{selectedWidgetMatch.homeTeam}</span>
                        <span className="text-emerald-400 font-black text-[9px]">{selectedWidgetMatch.lineups.home.formation}</span>
                      </div>
                      <div className="space-y-0.5 max-h-[140px] overflow-y-auto font-mono text-slate-400">
                        {selectedWidgetMatch.lineups.home.startXI.map(p => (
                          <div key={p.number} className="flex justify-between py-0.5 leading-tight hover:text-white">
                            <span><strong className="text-slate-500 font-bold pr-1">{p.number}</strong> {p.name}</span>
                            <span className="text-[7.5px] bg-slate-950 text-slate-500 px-1 rounded uppercase shrink-0">{p.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away sheet */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                        <span className="text-white font-extrabold truncate text-[9.5px]">{selectedWidgetMatch.awayTeam}</span>
                        <span className="text-amber-400 font-black text-[9px]">{selectedWidgetMatch.lineups.away.formation}</span>
                      </div>
                      <div className="space-y-0.5 max-h-[140px] overflow-y-auto font-mono text-slate-400">
                        {selectedWidgetMatch.lineups.away.startXI.map(p => (
                          <div key={p.number} className="flex justify-between py-0.5 leading-tight hover:text-white">
                            <span><strong className="text-slate-500 font-bold pr-1">{p.number}</strong> {p.name}</span>
                            <span className="text-[7.5px] bg-slate-950 text-slate-500 px-1 rounded uppercase shrink-0">{p.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeWidgetTab === "events" && (
                  <div className="space-y-3 font-mono">
                    {selectedWidgetMatch.events.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-xs italic">Nenhum evento registrado.</div>
                    ) : (
                      <div className="relative border-l border-slate-900 pl-4 ml-2 space-y-3 text-[9.5px]">
                        {selectedWidgetMatch.events.map((ev, i) => (
                          <div key={i} className="relative">
                            {/* Dot */}
                            <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 shrink-0" />
                            <div className="flex justify-between items-center gap-1.5 leading-snug">
                              <div>
                                <span className="font-extrabold text-white mr-1.5">{ev.elapsed}'</span>
                                <span className={`text-[8px] uppercase px-1 py-0.2 rounded font-black mr-1.5 ${ev.type === "Goal" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{ev.type}</span>
                                <span className="text-white font-black">{ev.player}</span>
                                {ev.assist && <span className="text-slate-550 text-[8px] block mt-0.5">Ass: {ev.assist}</span>}
                              </div>
                              <span className="text-slate-500 uppercase text-[8px] tracking-wider shrink-5">{ev.team}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer info under tatic stats */}
            <div className="border-t border-slate-900 pt-2.5 mt-3 text-[8.5px] font-mono text-slate-500 flex items-center justify-between shrink-0 uppercase select-none">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Cálculos de Previsão atualizados dinamicamente pelo motor analítico do sistema
              </span>
              <span className="font-black text-slate-500">PITCH_INTEL PRO</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
