/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TeamStats } from "../types";
import { 
  Shield, Target, Award, Flag, Activity, TrendingUp, 
  Coins, ChevronRight, HelpCircle, Sparkles, Scale, Info, CheckCircle2, AlertTriangle
} from "lucide-react";

// Standard Poisson Solver
function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 1; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

interface CompareStatsCardProps {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
}

export default function CompareStatsCard({ homeTeam, awayTeam }: CompareStatsCardProps) {
  // Tabs for the center column
  const [centerTab, setCenterTab] = useState<'stats' | 'pricing'>('stats');

  // Interactive Calculator States
  const [selectedMarket, setSelectedMarket] = useState<'home' | 'draw' | 'away' | 'over25' | 'btts'>('home');
  const [marketOdd, setMarketOdd] = useState<number>(2.10);
  const [bankroll, setBankroll] = useState<number>(1000);
  const [kellyFraction, setKellyFraction] = useState<number>(0.5); // Default to Half-Kelly for risk mitigation

  // Poisson Maths calculations
  const LEAGUE_AVG_GOALS = 1.30;
  // Expected goals for home and away based on attack vs defensive ratios
  const homeExpectedGoals = (homeTeam.avgGoalsScored * awayTeam.avgGoalsConceded) / LEAGUE_AVG_GOALS;
  const awayExpectedGoals = (awayTeam.avgGoalsScored * homeTeam.avgGoalsConceded) / LEAGUE_AVG_GOALS;

  // Let's compute standard 1X2 Probabilities using a 6x6 score grid
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

  // Over 2.5 goals probability
  const p00 = poisson(0, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p10 = poisson(1, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p01 = poisson(0, homeExpectedGoals) * poisson(1, awayExpectedGoals);
  const p20 = poisson(2, homeExpectedGoals) * poisson(0, awayExpectedGoals);
  const p02 = poisson(0, homeExpectedGoals) * poisson(2, awayExpectedGoals);
  const p11 = poisson(1, homeExpectedGoals) * poisson(1, awayExpectedGoals);
  const pctOver25 = parseFloat(((1 - (p00 + p10 + p01 + p20 + p02 + p11)) * 100).toFixed(1));

  // Both Teams to Score (BTTS) probability
  const pctBTTS = parseFloat(((1 - poisson(0, homeExpectedGoals)) * (1 - poisson(0, awayExpectedGoals)) * 100).toFixed(1));

  // Projected Corners estimate
  const projectedHomeCorners = (homeTeam.avgCornersFor + awayTeam.avgCornersAgainst) / 2;
  const projectedAwayCorners = (awayTeam.avgCornersFor + homeTeam.avgCornersAgainst) / 2;
  const totalProjectedCorners = projectedHomeCorners + projectedAwayCorners;

  // Projected Cards estimate
  const totalProjectedYellowCards = homeTeam.avgCardsYellow + awayTeam.avgCardsYellow;

  // Fair Odds computed from model
  const fairOddsMap = {
    home: pctHome > 0 ? 100 / pctHome : 0,
    draw: pctDraw > 0 ? 100 / pctDraw : 0,
    away: pctAway > 0 ? 100 / pctAway : 0,
    over25: pctOver25 > 0 ? 100 / pctOver25 : 0,
    btts: pctBTTS > 0 ? 100 / pctBTTS : 0
  };

  const selectedProb = {
    home: pctHome,
    draw: pctDraw,
    away: pctAway,
    over25: pctOver25,
    btts: pctBTTS
  }[selectedMarket];

  const selectedFairOdd = fairOddsMap[selectedMarket];

  // Mathematical Expected Value (EV%)
  const expectedValuePercentage = ((selectedProb / 100) * marketOdd - 1) * 100;

  // Kelly Stake Recommendation
  const decimalProb = selectedProb / 100;
  const rawKellyStake = (decimalProb * marketOdd - 1) / (marketOdd - 1);
  const recommendedKellyStake = rawKellyStake > 0 ? rawKellyStake * kellyFraction : 0;
  const recommendedStakeCash = bankroll * recommendedKellyStake;

  // Utility progress bar renderer
  const renderProgressBar = (
    label: string,
    homeValue: number,
    awayValue: number,
    formatter: (v: number) => string,
    higherIsBetter: boolean = true
  ) => {
    const total = homeValue + awayValue === 0 ? 1 : homeValue + awayValue;
    const homePercent = (homeValue / total) * 100;

    const isHomeBetter = higherIsBetter ? homeValue > awayValue : homeValue < awayValue;
    const isAwayBetter = higherIsBetter ? awayValue > homeValue : awayValue < homeValue;

    return (
      <div className="mb-4 last:mb-0" id={`stat-row-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className={`font-mono text-[11px] w-14 text-left ${isHomeBetter ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
            {formatter(homeValue)}
          </span>
          <span className="text-slate-400 font-bold tracking-wider text-[9px] uppercase font-sans">{label}</span>
          <span className={`font-mono text-[11px] w-14 text-right ${isAwayBetter ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
            {formatter(awayValue)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-850 rounded overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${homePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${
              isHomeBetter ? "bg-emerald-500" : "bg-slate-700"
            }`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - homePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${
              isAwayBetter ? "bg-rose-500" : "bg-slate-800"
            }`}
          />
        </div>
      </div>
    );
  };

  const getAprovedPercentage = (team: TeamStats) => {
    // Basic weight calculation of team performance
    const score = (team.avgGoalsScored * 25) + (team.avgShotsOnTarget * 8) + (team.avgCorners * 4);
    return Math.min(100, Math.round(score));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="compare-stats-container">
      
      {/* LEFT: Home Team Badge Card */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative" id="home-team-side">
        <img
          src={homeTeam.logo}
          alt={homeTeam.name}
          className="w-16 h-16 object-contain mb-4 transform hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight min-h-[40px] flex items-center justify-center">
          {homeTeam.name}
        </h3>
        <span className="text-[9px] font-mono text-emerald-400 mt-2 px-2.5 py-0.5 bg-emerald-950/20 border border-emerald-950/50 rounded uppercase tracking-wider font-bold">
          MANDANTE • {homeTeam.shortName}
        </span>

        <div className="mt-6 grid grid-cols-3 gap-1 w-full border-t border-slate-800/80 pt-5">
          <div className="text-center">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Gols/Jogo</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{homeTeam.avgGoalsScored}</span>
          </div>
          <div className="text-center border-x border-slate-800/50">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Chut/Jogo</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{homeTeam.avgShots}</span>
          </div>
          <div className="text-center">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Cantos</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{homeTeam.avgCorners}</span>
          </div>
        </div>

        <div className="w-full mt-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <div className="flex justify-between items-center text-[9px] text-slate-450 mb-1 font-bold">
            <span>FORÇA OFENSIVA</span>
            <span className="font-mono text-emerald-400 font-bold">{getAprovedPercentage(homeTeam)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${getAprovedPercentage(homeTeam)}%` }} />
          </div>
        </div>
      </div>

      {/* CENTER: Tabbed Direct Comparison OR Precision Pricing Fair Odds Simulator */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[450px]" id="metric-comparison-bars">
        
        <div>
          {/* Main SubTab selector Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCenterTab('stats')}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                  centerTab === 'stats' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-550 hover:text-slate-350 border border-transparent'
                }`}
              >
                Médias da Liga
              </button>
              <button
                onClick={() => setCenterTab('pricing')}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  centerTab === 'pricing' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-555 hover:text-slate-355 border border-transparent'
                }`}
              >
                <Coins className="w-3 h-3 text-amber-500" />
                Precificação (Fair Odds)
              </button>
            </div>
            
            <span className="text-[8px] font-mono bg-slate-950 text-slate-550 border border-slate-850 px-2 py-0.5 rounded font-black tracking-widest uppercase">
              Poisson Engine v1.0
            </span>
          </div>

          <AnimatePresence mode="wait">
            {centerTab === 'stats' ? (
              <motion.div
                key="stats-subtab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="text-[10px] uppercase font-bold text-slate-550 flex items-center gap-1 tracking-wider mb-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Comparação Direta de Desempenho
                </div>
                
                {renderProgressBar("Gols Marcados", homeTeam.avgGoalsScored, awayTeam.avgGoalsScored, (v) => v.toFixed(2))}
                {renderProgressBar("Gols Sofridos", homeTeam.avgGoalsConceded, awayTeam.avgGoalsConceded, (v) => v.toFixed(2), false)}
                {renderProgressBar("Finalizações", homeTeam.avgShots, awayTeam.avgShots, (v) => v.toFixed(1))}
                {renderProgressBar("Chutes no Alvo", homeTeam.avgShotsOnTarget, awayTeam.avgShotsOnTarget, (v) => v.toFixed(1))}
                {renderProgressBar("Escanteios Cedidos", homeTeam.avgCorners, awayTeam.avgCorners, (v) => v.toFixed(1))}
                {renderProgressBar("Posse de Bola", homeTeam.avgPossession, awayTeam.avgPossession, (v) => `${v.toFixed(0)}%`)}
                {renderProgressBar("Cartões Amarelos", homeTeam.avgCardsYellow, awayTeam.avgCardsYellow, (v) => v.toFixed(1), false)}
              </motion.div>
            ) : (
              <motion.div
                key="pricing-subtab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Mathematical Poisson Distributions & Estimated Fair Odds */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    Probabilidades Estimadas & Fair Odds (Poisson)
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                    
                    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                      <span className="block text-[8px] text-slate-550 uppercase font-black tracking-tighter truncate">Mandante</span>
                      <span className="block text-xs font-black text-white mt-0.5">{pctHome}%</span>
                      <span className="block text-[8px] text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded leading-none mt-1">@{fairOddsMap.home.toFixed(2)}</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                      <span className="block text-[8px] text-slate-550 uppercase font-black tracking-tighter truncate">Empate</span>
                      <span className="block text-xs font-black text-white mt-0.5">{pctDraw}%</span>
                      <span className="block text-[8px] text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded leading-none mt-1">@{fairOddsMap.draw.toFixed(2)}</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                      <span className="block text-[8px] text-slate-550 uppercase font-black tracking-tighter truncate">Visitante</span>
                      <span className="block text-xs font-black text-white mt-0.5">{pctAway}%</span>
                      <span className="block text-[8px] text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded leading-none mt-1">@{fairOddsMap.away.toFixed(2)}</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                      <span className="block text-[8px] text-slate-550 uppercase font-black tracking-tighter truncate">Over 2.5</span>
                      <span className="block text-xs font-black text-white mt-0.5">{pctOver25}%</span>
                      <span className="block text-[8px] text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded leading-none mt-1">@{fairOddsMap.over25.toFixed(2)}</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded">
                      <span className="block text-[8px] text-slate-550 uppercase font-black tracking-tighter truncate">BTTS Sim</span>
                      <span className="block text-xs font-black text-white mt-0.5">{pctBTTS}%</span>
                      <span className="block text-[8px] text-emerald-400 font-bold bg-slate-950 px-1 py-0.5 rounded leading-none mt-1">@{fairOddsMap.btts.toFixed(2)}</span>
                    </div>

                  </div>

                  {/* Math Summary Badges */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-450 font-mono font-bold bg-slate-900/60 p-2 rounded-lg border border-slate-900/50">
                    <div className="flex justify-between items-center px-1">
                      <span>Projeção xG:</span>
                      <span className="text-white font-black">{(homeExpectedGoals + awayExpectedGoals).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-x border-slate-800 px-2">
                      <span>Projeção Escanteios:</span>
                      <span className="text-white font-black">{totalProjectedCorners.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span>Projeção Cartões:</span>
                      <span className="text-white font-black">{totalProjectedYellowCards.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE VALUE BET CALCULATOR SECTION */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      Calculador de Aposta de Valor (EV) & Gestão de Banca
                    </span>
                  </div>

                  {/* Inputs and Selects */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <label className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold block mb-1">Mercado de Entrada</label>
                      <select
                        value={selectedMarket}
                        onChange={(e: any) => setSelectedMarket(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold uppercase"
                      >
                        <option value="home">Vitória {homeTeam.shortName}</option>
                        <option value="draw">Empate</option>
                        <option value="away">Vitória {awayTeam.shortName}</option>
                        <option value="over25">Over 2.5 Gols</option>
                        <option value="btts">Ambas Marcam (BTTS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold block mb-1">Odd Oferecida (Bet)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        max="20.00"
                        value={marketOdd}
                        onChange={(e) => setMarketOdd(parseFloat(e.target.value) || 1.01)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-bold block mb-1">Banca Total (R$)</label>
                      <input
                        type="number"
                        step="10"
                        min="1"
                        value={bankroll}
                        onChange={(e) => setBankroll(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Fractional Kelly stake selection profile */}
                  <div className="flex items-center gap-4 border-t border-slate-900 pt-2 bg-slate-900/10 px-2 py-1 bg-slate-950 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Gestão Recomendada:</span>
                    <div className="flex gap-2">
                      {[
                        { label: "Quarter (25%)", val: 0.25 },
                        { label: "Half (50%)", val: 0.5 },
                        { label: "Full (100%)", val: 1.0 }
                      ].map((multiplier) => (
                        <button
                          key={multiplier.label}
                          onClick={() => setKellyFraction(multiplier.val)}
                          className={`text-[8px] font-mono tracking-tight font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition ${
                            kellyFraction === multiplier.val
                              ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                              : "text-slate-500 hover:text-slate-400 border border-transparent"
                          }`}
                        >
                          {multiplier.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculations Result Output */}
                  <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                    
                    {/* EV outcome */}
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase font-black tracking-widest block">Expected Value (+EV)</span>
                      {expectedValuePercentage > 0 ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-mono text-slate-100 font-black tracking-tight text-[11px]">
                            VALOR: <span className="text-emerald-400 font-extrabold">+{expectedValuePercentage.toFixed(1)}%</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-mono text-slate-400 font-bold tracking-tight text-[11px]">
                            Sem Valor: <span className="text-rose-500 font-extrabold">{expectedValuePercentage.toFixed(1)}%</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Kelly suggestion stake */}
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 font-mono uppercase font-black tracking-widest block">Stake Recomendado</span>
                      {expectedValuePercentage > 0 && recommendedKellyStake > 0 ? (
                        <div className="mt-0.5 flex flex-col font-mono text-[11px]">
                          <span className="font-black text-emerald-400 whitespace-nowrap">
                            R$ {recommendedStakeCash.toFixed(2)}
                          </span>
                          <span className="text-[8px] text-slate-450 font-bold">
                            ({(recommendedKellyStake * 100).toFixed(1)}% da Banca)
                          </span>
                        </div>
                      ) : (
                        <span className="block mt-0.5 font-black text-rose-550 text-[11px] font-mono uppercase tracking-tight">R$ 0.00 (Evitar)</span>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl text-center border border-slate-850 font-mono mt-4">
          <div>
            <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Ambas Marcam</span>
            <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">{homeTeam.bttsPercentage}% / {awayTeam.bttsPercentage}%</span>
          </div>
          <div className="border-x border-slate-850">
            <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Over 2.5 Gols</span>
            <span className="text-xs font-semibold text-rose-500 mt-0.5 block">{homeTeam.over25Percentage}% / {awayTeam.over25Percentage}%</span>
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Over 1.5 Gols</span>
            <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">{homeTeam.over15Percentage}% / {awayTeam.over15Percentage}%</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Away Team Badge Card */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative" id="away-team-side">
        <img
          src={awayTeam.logo}
          alt={awayTeam.name}
          className="w-16 h-16 object-contain mb-4 transform hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight min-h-[40px] flex items-center justify-center">
          {awayTeam.name}
        </h3>
        <span className="text-[9px] font-mono text-rose-500 mt-2 px-2.5 py-0.5 bg-rose-950/20 border border-rose-950/50 rounded uppercase tracking-wider font-bold">
          VISITANTE • {awayTeam.shortName}
        </span>

        <div className="mt-6 grid grid-cols-3 gap-1 w-full border-t border-slate-800/80 pt-5">
          <div className="text-center">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Gols/Jogo</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{awayTeam.avgGoalsScored}</span>
          </div>
          <div className="text-center border-x border-slate-800/50">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Chut/Jogo</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{awayTeam.avgShots}</span>
          </div>
          <div className="text-center">
            <span className="block text-slate-500 text-[8px] tracking-wider uppercase font-mono font-bold">Cantos</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{awayTeam.avgCorners}</span>
          </div>
        </div>

        <div className="w-full mt-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <div className="flex justify-between items-center text-[9px] text-slate-450 mb-1 font-bold">
            <span>FORÇA OFENSIVA</span>
            <span className="font-mono text-emerald-400 font-bold">{getAprovedPercentage(awayTeam)}%</span>
          </div>
          <div className="w-full bg-slate-850 h-1 rounded overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${getAprovedPercentage(awayTeam)}%` }} />
          </div>
        </div>
      </div>

    </div>
  );
}

