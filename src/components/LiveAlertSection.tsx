/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LiveMatchUpdate } from "../types";
import { Bell, Play, Pause, RefreshCw, Zap, Flag, Target, AlertCircle, Sparkles, Volume2 } from "lucide-react";

interface LiveAlertSectionProps {
  liveMatch: LiveMatchUpdate | null;
  triggeredAlerts: Array<{
    id: string;
    metricType: string;
    triggered: boolean;
    message: string;
  }>;
  onForceEvent: (type: 'GOL' | 'ESCANTEIO' | 'CARTAO') => void;
  onRefreshLive: () => void;
}

export default function LiveAlertSection({ liveMatch, triggeredAlerts, onForceEvent, onRefreshLive }: LiveAlertSectionProps) {
  const [metricType, setMetricType] = useState<'GOL' | 'CARTAO' | 'ESCANTEIO' | 'FINALIZACAO'>('ESCANTEIO');
  const [thresholdValue, setThresholdValue] = useState<string>("10");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribersMsg, setSubscribersMsg] = useState("");
  const [activeWatchers, setActiveWatchers] = useState<Array<{type: string, val?: number}>>([
    { type: "GOL" },
    { type: "ESCANTEIO", val: 10 },
    { type: "CARTAO" }
  ]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const response = await fetch("/api/football/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metricType, thresholdValue })
      });
      const data = await response.json();
      if (data.success) {
        setSubscribersMsg(data.msg);
        setActiveWatchers(prev => [...prev, { type: metricType, val: thresholdValue ? parseInt(thresholdValue) : undefined }]);
        setTimeout(() => setSubscribersMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  // Sound Alert simulation (using standard Web Audio API simple diagnostic beep so it works safely in iFrame!)
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // AudioContext could be blocked by permission constraints, fail silently
    }
  };

  // Beep whenever a new alert triggers
  useEffect(() => {
    if (triggeredAlerts.length > 0) {
      playAlertSound();
    }
  }, [triggeredAlerts]);

  if (!liveMatch) {
    return (
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-slate-500 animate-spin mb-3" />
        <span className="text-sm text-slate-400">Verificando conexões em tempo real...</span>
      </div>
    );
  }

  // Calculate live statistical charts
  const totalShots = liveMatch.stats.shotsHome + liveMatch.stats.shotsAway;
  const shotsHomePercent = totalShots === 0 ? 50 : (liveMatch.stats.shotsHome / totalShots) * 100;

  const totalCorners = liveMatch.stats.cornersHome + liveMatch.stats.cornersAway;
  const cornersHomePercent = totalCorners === 0 ? 50 : (liveMatch.stats.cornersHome / totalCorners) * 100;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="realtime-alerts-wrapper">
      
      {/* 1. Live Match Center (8 cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between" id="live-match-center">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.25em]">Live Arena</h3>
            </div>
            <span className="font-mono text-[10px] bg-slate-950 text-slate-350 px-2.5 py-1 rounded border border-slate-800">
              {liveMatch.minute}' DE JOGO
            </span>
          </div>

          {/* Scores banner */}
          <div className="grid grid-cols-3 items-center text-center bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden mb-6">
            <div className="flex flex-col items-center justify-center">
              <img src={liveMatch.homeLogo} alt={liveMatch.homeTeam} className="w-10 h-10 object-contain mb-2 filter grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              <span className="text-xs font-black uppercase tracking-tight text-white truncate max-w-[120px]">{liveMatch.homeTeam}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-white font-mono italic tracking-tighter">{liveMatch.homeScore}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800">VS</span>
                <span className="text-4xl font-extrabold text-white font-mono italic tracking-tighter">{liveMatch.awayScore}</span>
              </div>
              <span className="text-[9px] text-slate-450 font-mono mt-3 uppercase tracking-widest font-bold">Simulado Tact-Grid</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <img src={liveMatch.awayLogo} alt={liveMatch.awayTeam} className="w-10 h-10 object-contain mb-2 filter grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
              <span className="text-xs font-black uppercase tracking-tight text-white truncate max-w-[120px]">{liveMatch.awayTeam}</span>
            </div>
          </div>

          {/* Incident News ticker with animation */}
          <AnimatePresence mode="wait">
            {liveMatch.event && (
              <motion.div
                key={liveMatch.minute + (liveMatch.event.player || "")}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-xl mb-6 border flex items-center gap-3 ${
                  liveMatch.event.type === 'GOL' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  liveMatch.event.type === 'CARTAO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-slate-950 border-slate-800 text-slate-350'
                }`}
              >
                {liveMatch.event.type === 'GOL' ? <Target className="w-4 h-4 shrink-0" /> :
                 liveMatch.event.type === 'CARTAO' ? <AlertCircle className="w-4 h-4 shrink-0" /> :
                 <Flag className="w-4 h-4 shrink-0" />}
                <div>
                  <span className="text-[9px] font-mono tracking-wider block font-bold uppercase text-slate-500">LANCE RECENTE • {liveMatch.minute}'</span>
                  <p className="text-xs mt-1 leading-relaxed font-semibold">{liveMatch.event.detail}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mini-bars of live actions stats in game */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono mb-1.5">
                <span>Finalizações ({liveMatch.stats.shotsHome})</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Chutes Totais</span>
                <span>({liveMatch.stats.shotsAway}) Finalizações</span>
              </div>
              <div className="w-full bg-slate-850 h-1 rounded overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${shotsHomePercent}%` }} />
                <div className="bg-slate-700 h-full" style={{ width: `${100 - shotsHomePercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono mb-1.5">
                <span>Escanteios ({liveMatch.stats.cornersHome})</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Total Cantos: {totalCorners}</span>
                <span>({liveMatch.stats.cornersAway}) Escanteios</span>
              </div>
              <div className="w-full bg-slate-850 h-1 rounded overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${cornersHomePercent}%` }} />
                <div className="bg-slate-700 h-full" style={{ width: `${100 - cornersHomePercent}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex-wrap">
              <div className="text-left">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Aparatos de Teste Rápido (Lances do Jogo)</span>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => onForceEvent('GOL')} className="text-[9px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 px-2.5 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider">🎯 Gol</button>
                  <button onClick={() => onForceEvent('ESCANTEIO')} className="text-[9px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-400 px-2.5 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider">🚩 Cantos</button>
                  <button onClick={() => onForceEvent('CARTAO')} className="text-[9px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 px-2.5 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider">🟨 Cartão</button>
                </div>
              </div>
              <div className="md:border-l border-slate-800 pl-0 md:pl-4 flex flex-col justify-center">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black">Histórico de Cartões</span>
                <div className="flex items-center gap-4 mt-2 font-mono">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm inline-block" /> {liveMatch.stats.cardsYellowHome} - {liveMatch.stats.cardsYellowAway}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                    <span className="w-2.5 h-3.5 bg-rose-500 rounded-sm inline-block" /> {liveMatch.stats.cardsRedHome} - {liveMatch.stats.cardsRedAway}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-555 font-bold uppercase tracking-wider text-center">
          Atualizando a cada 4 segundos • Simulação baseada em dados táticos reais
        </div>
      </div>

      {/* 2. Notification Center (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6" id="alerts-subscription-box">
        
        {/* Subscribe form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.25em] flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-emerald-400" />
            Configurar Alertas
          </h4>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-serif italic">
            Receba chamados sonoros e notificações do painel assim que qualquer indicador estatístico atingir o threshold cadastrado.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div>
              <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Métrica do Jogo</label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="ESCANTEIO">Soma de Escanteios</option>
                <option value="GOL">Qualquer Gol Marcado</option>
                <option value="CARTAO">Cartão Amarelo/Vermelho</option>
                <option value="FINALIZACAO">Chute no Alvo</option>
              </select>
            </div>

            {metricType === 'ESCANTEIO' && (
              <div>
                <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Quantidade Mínima (Threshold)</label>
                <input
                  type="number"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono focus:ring-1 focus:ring-emerald-500 font-black"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={subscribing}
              className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black uppercase text-xs tracking-widest py-2.5 rounded-xl transition cursor-pointer"
            >
              {subscribing ? "Salvando..." : "Subscrever Indicador"}
            </button>
          </form>

          {subscribersMsg && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-wider"
            >
              {subscribersMsg}
            </motion.div>
          )}

          {/* Active Watch List */}
          <div className="mt-5 border-t border-slate-800 pt-4">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2.5">Suas Subscrições Ativas:</span>
            <div className="flex flex-wrap gap-2">
              {activeWatchers.map((w, i) => (
                <span key={i} className="text-[9px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  🔔 {w.type} {w.val ? `>= ${w.val}` : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live trigger history list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col justify-between min-h-[220px]" id="live-notifications-log">
          <div>
            <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase font-sans mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Logs de Alertas Disparados
            </h4>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1" id="triggered-alerts-scroller">
              <AnimatePresence initial={false}>
                {triggeredAlerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-650 text-xs italic font-serif">
                    Nenhum alerta disparado até agora. Use o simulador tático para testar lances!
                  </div>
                ) : (
                  triggeredAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-start gap-2.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="block text-[8px] text-slate-500 font-mono font-bold">ALERTA DISPARADO</span>
                        <p className="text-slate-300 font-semibold mt-0.5">{alert.message}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {triggeredAlerts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[9px] text-emerald-400 uppercase font-mono font-bold tracking-wider justify-center bg-emerald-500/5 py-1.5 rounded-lg border border-emerald-500/10">
              <Volume2 className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              Sinal sonoro de @AI_Predictor disparado!
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
