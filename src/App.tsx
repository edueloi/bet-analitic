/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TeamStats, PlayerStats, HistoricalMatch, LiveMatchUpdate, PredictionReport } from "./types";
import CompareStatsCard from "./components/CompareStatsCard";
import TeamSelector from "./components/TeamSelector";
import AIReportCard from "./components/AIReportCard";
import PlayerCompareTable from "./components/PlayerCompareTable";
import LiveAlertSection from "./components/LiveAlertSection";
import TeamRecentForm from "./components/TeamRecentForm";
import IndividualTeamsHub from "./components/IndividualTeamsHub";
import ApiExplorer from "./components/ApiExplorer";
import { Activity, Bell, User, BarChart4, ChevronRight, HelpCircle, Shield, Calendar, TrendingUp, Terminal } from "lucide-react";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'trends' | 'teams' | 'players' | 'live' | 'api_v3'>('trends');

  // Championship competitive environment scope
  const [activeChampionship, setActiveChampionship] = useState<string>("Brasileirão Série A");

  // Master Data States
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Selected Comparison Matchup (Default SPFC vs Palmeiras)
  const [homeTeamId, setHomeTeamId] = useState<number>(126);
  const [awayTeamId, setAwayTeamId] = useState<number>(121);
  const [historyMatches, setHistoryMatches] = useState<HistoricalMatch[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Prediction AI Report
  const [aiReport, setAiReport] = useState<PredictionReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Live Simulation state
  const [liveMatch, setLiveMatch] = useState<LiveMatchUpdate | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<any[]>([]);

  // 1. Fetch Master Data (re-fetched dynamically when championship competitive scope shifts)
  useEffect(() => {
    async function fetchMaster() {
      setLoadingMaster(true);
      try {
        const [resTeams, resPlayers] = await Promise.all([
          fetch(`/api/football/teams?championship=${encodeURIComponent(activeChampionship)}`),
          fetch("/api/football/players")
        ]);
        const dTeams = await resTeams.json();
        const dPlayers = await resPlayers.json();

        if (dTeams.success) {
          const loadedTeams = dTeams.teams;
          setTeams(loadedTeams);
          if (loadedTeams.length >= 2) {
            // Check if current home/away team exists in the newly loaded teams
            const homeExists = loadedTeams.some((t: any) => t.id === homeTeamId);
            const awayExists = loadedTeams.some((t: any) => t.id === awayTeamId);
            
            if (!homeExists || !awayExists) {
              setHomeTeamId(loadedTeams[0].id);
              setAwayTeamId(loadedTeams[1].id);
            }
          }
        }
        if (dPlayers.success) setPlayers(dPlayers.players);
      } catch (err) {
        console.error("Erro abrindo conexão master:", err);
      } finally {
        setLoadingMaster(false);
      }
    }
    fetchMaster();
  }, [activeChampionship]);

  // 2. Fetch Historical Head-to-Head matches for selected teams within current championship
  useEffect(() => {
    async function fetchHistory() {
      if (!homeTeamId || !awayTeamId) return;
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/football/fixtures/history?team1=${homeTeamId}&team2=${awayTeamId}&championship=${encodeURIComponent(activeChampionship)}`);
        const data = await res.json();
        if (data.success) {
          setHistoryMatches(data.matches);
        }
      } catch (err) {
        console.error("Erro ao puxar histórico:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
    // Flush previous report when matchup changes to prevent stale UI
    setAiReport(null);
  }, [homeTeamId, awayTeamId, activeChampionship]);

  // 3. Poll Simulated Live Match status and notifications
  useEffect(() => {
    async function fetchLiveStatus() {
      try {
        const res = await fetch("/api/football/live");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveMatch(data.liveMatch);
            setTriggeredAlerts(data.alerts);
          }
        }
      } catch (e) {
        // fail silently
      }
    }

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 4000); // 4s polling
    return () => clearInterval(interval);
  }, []);

  // Trigger Gemini AI generation
  const handleGenerateAIReport = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTeamId, awayTeamId, championship: activeChampionship })
      });
      const data = await response.json();
      if (data.success) {
        setAiReport(data.analysis);
      } else {
        alert(data.error || "Ocorreu um erro ao comunicar com a inteligência artificial.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão com o servidor de predição.");
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger events manually from UI for live match alerts demonstration
  const handleForceLiveEvent = async (type: 'GOL' | 'ESCANTEIO' | 'CARTAO') => {
    try {
      const res = await fetch("/api/football/live/force-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: type })
      });
      const data = await res.json();
      if (data.success) {
        setLiveMatch(data.fixture);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Find selected team entities from list
  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 antialiased" id="root-app-layout">
      
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30" id="main-header">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl md:text-2xl font-black tracking-tighter text-emerald-500 italic select-none" id="brand-logo-text">
              PITCH_INTEL <span className="text-[10px] font-mono text-slate-500 uppercase not-italic align-top ml-1">v2.4</span>
            </div>
          </div>

          {/* Quick Realtime Active alert notification pill */}
          <div className="flex items-center gap-4">
            {liveMatch && (
              <div 
                onClick={() => setActiveTab('live')}
                className="bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 rounded px-2.5 py-1 flex items-center gap-2 cursor-pointer text-[10px] font-mono font-bold text-rose-500 uppercase tracking-tighter animate-pulse"
                id="header-live-indicator"
              >
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full inline-block animate-ping" />
                Live • {liveMatch.homeScore} - {liveMatch.awayScore} ({liveMatch.minute}')
              </div>
            )}
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Model Status</span>
              <span className="text-xs font-mono text-emerald-400">100 REQ/DAY • ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* TABS SELECTOR MENU */}
      <nav className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-6" id="navigation-tabs">
        <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 overflow-x-auto scrollbar-none pb-2 border-b border-slate-900/80">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'trends' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm' : 'border-transparent bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            id="tab-btn-trends"
          >
            <BarChart4 className="w-3.5 h-3.5" />
            <span>Previsões & IA</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'teams' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm' : 'border-transparent bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            id="tab-btn-teams"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Times Individuais</span>
          </button>
          
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'players' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm' : 'border-transparent bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            id="tab-btn-players"
          >
            <User className="w-3.5 h-3.5" />
            <span>Jogadores</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 cursor-pointer relative whitespace-nowrap ${
              activeTab === 'live' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-extrabold shadow-sm' : 'border-transparent bg-slate-900/40 text-slate-450 hover:bg-slate-900 hover:text-rose-400'
            }`}
            id="tab-btn-live"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 ${activeTab === 'live' ? '' : 'hidden'}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>Central Ao Vivo</span>
            {triggeredAlerts.length > 0 && (
              <span className="bg-rose-600 text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded-full">
                {triggeredAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('api_v3')}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${
              activeTab === 'api_v3' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm' : 'border-transparent bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            id="tab-btn-api-v3"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulador Poisson & Duelos</span>
          </button>
        </div>
      </nav>

      {/* CORE WORKSPACE CONTENT AREA WITH TAB-ROUTE SWITCHING ROUTER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 space-y-8" id="core-workspace-layout">
        
        {/* GLOBAL CHAMPIONSHIP COMPETITIVE SCOPE SELECTOR */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4" id="championship-scope-selector">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Competição Reguladora Ativa
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              As estatísticas, tendências matemáticas (Poisson), confrontos diretos e o relatório da inteligência artificial generativa são recalibrados especificamente para as características táticas correspondentes ao campeonato selecionado.
            </p>
          </div>
          <select
            value={activeChampionship}
            onChange={(e) => setActiveChampionship(e.target.value)}
            className="bg-slate-950 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-extrabold rounded-xl px-4 py-3 text-xs tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500 md:max-w-xs cursor-pointer shrink-0 uppercase"
          >
            <option value="Brasileirão Série A">Brasileirão Série A 🇧🇷</option>
            <option value="Brasileirão Série B">Brasileirão Série B 🇧🇷</option>
            <option value="Libertadores">Copa Libertadores 🏆</option>
            <option value="Copa do Brasil">Copa do Brasil 🇧🇷</option>
            <option value="Sul-Americana">Copa Sul-Americana 🌎</option>
            <option value="Premier League">Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
            <option value="La Liga">La Liga 🇪🇸</option>
            <option value="Bundesliga">Bundesliga 🇩🇪</option>
            <option value="Serie A Italiana">Serie A Italiana 🇮🇹</option>
            <option value="Champions League">Champions League 🇪🇺</option>
          </select>
        </div>

        {loadingMaster ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" id="master-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-slate-400 text-sm font-mono">Carregando banco de dados de {activeChampionship}...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB: TEAM STATS COMPARATIVE AND GEMINI INTELLIGENCE */}
            {activeTab === 'trends' && (
              <motion.div
                key="trends-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                
                {/* 1. SELECTORS SECTION */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5" id="matchup-selector-segment">
                  <span className="text-[10px] tracking-widest font-mono text-slate-400 uppercase font-semibold">Configurar Confronto de Interesse</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Time Mandante (Home)</label>
                      <TeamSelector
                        selectedTeamId={homeTeamId}
                        onChange={setHomeTeamId}
                        teams={teams}
                        disabledId={awayTeamId}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Time Visitante (Away)</label>
                      <TeamSelector
                        selectedTeamId={awayTeamId}
                        onChange={setAwayTeamId}
                        teams={teams}
                        disabledId={homeTeamId}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. STATS COMPARE BLOCK */}
                {homeTeam && awayTeam && (
                  <CompareStatsCard homeTeam={homeTeam} awayTeam={awayTeam} />
                )}

                {/* 2.5 INDIVIDUAL RECENT FORM & RATES */}
                {teams.length > 0 && (
                  <TeamRecentForm teams={teams} initialTeamId={homeTeamId} activeChampionship={activeChampionship} />
                )}

                {/* 3. GEMINI AI PREDICTIONS GENERATOR */}
                {homeTeam && awayTeam && (
                  <AIReportCard
                    report={aiReport}
                    loading={aiLoading}
                    onGenerate={handleGenerateAIReport}
                    homeTeamName={homeTeam.name}
                    awayTeamName={awayTeam.name}
                  />
                )}

                {/* 4. HISTORICAL RECENT DERBY MATCHES (CONFRONTOS DIRETOS) */}
                <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl" id="historical-derbies-table">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Histórico Recente de Confrontos Diretos (Clássicos)
                  </h4>

                  {loadingHistory ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-mono">Consultando confrontos...</div>
                  ) : historyMatches.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
                      Nenhum histórico de clássico registrado entre esses dois times nas últimas temporadas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {historyMatches.map(m => (
                        <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition-all flex flex-col justify-between" id={`history-match-${m.id}`}>
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{activeChampionship}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                          </div>

                          <div className="flex justify-between items-center px-2 py-1">
                            <span className="text-xs font-bold text-slate-200">{m.homeTeamName.replace("SC ", "").replace("SE ", "").replace(" FC", "")}</span>
                            <span className="font-mono text-sm font-black text-white px-2 py-0.5 bg-slate-900 border border-slate-850 rounded">
                              {m.homeScore} - {m.awayScore}
                            </span>
                            <span className="text-xs font-bold text-slate-200 text-right">{m.awayTeamName.replace("SC ", "").replace("SE ", "").replace(" FC", "")}</span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900/65 grid grid-cols-3 text-center text-[10px] font-mono text-slate-400 gap-1.5">
                            <div>
                              <span>Finaliz:</span>
                              <span className="block font-bold mt-0.5 text-white">{m.shotsHome} x {m.shotsAway}</span>
                            </div>
                            <div className="border-x border-slate-900">
                              <span>Escant:</span>
                              <span className="block font-bold mt-0.5 text-white">{m.cornersHome} x {m.cornersAway}</span>
                            </div>
                            <div>
                              <span>Moisture:</span>
                              <span className="block font-bold mt-0.5 text-white">{m.possessionHome}% x {m.possessionAway}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB: INDIVIDUAL TEAMS DETAILS HUB */}
            {activeTab === 'teams' && (
              <motion.div
                key="teams-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <IndividualTeamsHub 
                  teams={teams} 
                  setTeams={setTeams} 
                  playersByTeam={players} 
                  setPlayers={setPlayers} 
                />
              </motion.div>
            )}

            {/* TAB: COMPARRATIVE PLAYERS ENGINE */}
            {activeTab === 'players' && (
              <motion.div
                key="players-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <PlayerCompareTable players={players} />
              </motion.div>
            )}

            {/* TAB: REAL-TIME MATCH ALERTS AND TRIGGERS NOTIFICATION SERVICE */}
            {activeTab === 'live' && (
              <motion.div
                key="live-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <LiveAlertSection
                  liveMatch={liveMatch}
                  triggeredAlerts={triggeredAlerts}
                  onForceEvent={handleForceLiveEvent}
                  onRefreshLive={() => {}}
                />
              </motion.div>
            )}

            {/* TAB: SIMULADOR DE CONFRONTOS POISSON */}
            {activeTab === 'api_v3' && (
              <motion.div
                key="api-v3-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <ApiExplorer teams={teams} />
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-8 px-4 mt-auto" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span>© 2026 BetStats Predictor S.A. Todos os direitos reservados.</span>
            <span className="text-[10px] text-slate-600">Este sistema constitui uma ferramenta informativa para suporte à tomada de decisões utilizando probabilidades matemáticas e inteligência artificial generativa.</span>
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>ENGINE: GEMINI 3.5 FLASH</span>
            <span className="text-emerald-500">•</span>
            <span>DATA SOURCE: API-FOOTBALL v3</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
