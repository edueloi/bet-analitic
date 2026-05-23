/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { PredictionReport } from "../types";
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Flame, Target, TrendingUp } from "lucide-react";

interface AIReportCardProps {
  report: PredictionReport | null;
  loading: boolean;
  onGenerate: () => void;
  homeTeamName: string;
  awayTeamName: string;
}

export default function AIReportCard({ report, loading, onGenerate, homeTeamName, awayTeamName }: AIReportCardProps) {
  return (
    <div className="bg-slate-900/85 backdrop-blur border border-slate-800 rounded-2xl p-6 relative overflow-hidden" id="ai-prediction-report-card">
      {/* Decorative vector */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
            AI Prediction Hub
          </h3>
          <div className="h-1 w-12 bg-amber-500 mt-2"></div>
          <p className="text-[11px] text-slate-400 mt-2 max-w-2xl font-medium tracking-wide">
            Modelos estatísticos históricos e tendências recentes de confrontos processados em tempo real pela inteligência artificial.
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase text-xs tracking-[0.15em] px-6 py-3.5 rounded-xl transition-colors duration-300 shadow-md shadow-emerald-500/10 cursor-pointer z-10"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"
              />
              PROCESSANDO...
            </>
          ) : report ? (
            "Atualizar IA Report"
          ) : (
            "Gerar Relatório Completo IA"
          )}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center" id="ai-loading-state">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-emerald-500/30 mb-4"
          >
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <span className="text-white font-medium text-sm">Calculando probabilidades, gols esperados (xG) e escanteios...</span>
          <span className="text-xs text-slate-400 mt-2 max-w-md">
            Unindo finalizações de {homeTeamName} e {awayTeamName}, retrospectiva histórica e fatores climáticos simulados para gerar o ticket de apostas.
          </span>
        </div>
      )}

      {!loading && !report && (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 p-6" id="ai-empty-state">
          <HelpCircle className="w-12 h-12 text-slate-600 mb-3" />
          <h4 className="text-white font-bold text-sm">Sem Relatório Ativo</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Clique no botão acima para submeter as estatísticas comparativas de {homeTeamName} x {awayTeamName} ao modelo **Gemini 3.5**.
          </p>
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6" id="ai-loaded-data">
          
          {/* Top Prediction Probabilities */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] tracking-widest uppercase font-sans font-bold text-slate-500">Vencedor Projetado</span>
              <span className="text-base font-black text-emerald-400 mt-2 tracking-tight uppercase truncate">{report.predictedWinner}</span>
              <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Target className="w-3.5 h-3.5 text-slate-500" /> Poisson Simulation Engine
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-sans font-bold text-slate-500 mb-2">
                <span>Ambas Marcam</span>
                <span className="font-mono text-[11px] text-slate-300 font-bold">{report.bttsProbability}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-850 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${report.bttsProbability}%` }} />
              </div>
              <span className="block text-[10px] text-slate-400 font-mono mt-2 text-right">BTTS Sim</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-sans font-bold text-slate-500 mb-2">
                <span>Mais de 2.5 Gols</span>
                <span className="font-mono text-[11px] text-slate-300 font-bold">{report.over25Probability}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-850 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${report.over25Probability}%` }} />
              </div>
              <span className="block text-[10px] text-slate-400 font-mono mt-2 text-right">Over 2.5 Gols</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] tracking-widest uppercase font-sans font-bold text-slate-500">Placar Esperado (xG)</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl font-bold text-slate-100 font-mono italic tracking-tighter">{report.expectedHomeGoals.toFixed(1)}</span>
                <span className="text-slate-500 text-xs font-mono font-bold">vs</span>
                <span className="text-3xl font-bold text-slate-100 font-mono italic tracking-tighter">{report.expectedAwayGoals.toFixed(1)}</span>
              </div>
              <span className="block text-[10px] text-slate-400 font-mono mt-2 truncate">{report.homeTeam} x {report.awayTeam}</span>
            </div>

          </div>

          {/* Overall Analysis description */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase font-sans mb-3 flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Análise Geral e Modelo Tático Estimado
            </h4>
            <div className="text-sm text-slate-350 leading-relaxed font-serif italic max-w-none text-left whitespace-pre-line border-l-2 border-emerald-500 pl-4 py-1">
              "{report.overallAnalysis}"
            </div>
          </div>

          {/* Recommended Bet coupons / tickets */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 tracking-wider uppercase font-sans mb-4">
              🎯 Sugestões de Bilhetes / Entradas Recomendadas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.recommendedBets.map((bet, index) => (
                <div
                  key={index}
                  className="bg-slate-900 hover:bg-slate-850/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300"
                  id={`bet-coupon-${index}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-white tracking-tight leading-tight">{bet.market}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        bet.confidence >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        bet.confidence >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20 font-semibold'
                      }`}>
                        {bet.confidence}% CONFIANÇA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-450 mt-3 line-clamp-3 leading-relaxed">
                      {bet.justification}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center bg-slate-950/40 px-2 py-1.5 rounded-lg">
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">Odd Recomendada</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">@{bet.oddEstimated.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spotlight Highlight Player */}
          {report.playerToWatch && (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-450 border border-emerald-500/10 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-black">Jogador sob Holofote</span>
                  <h5 className="text-base font-black text-white mt-0.5">{report.playerToWatch.name}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-2xl">{report.playerToWatch.reason}</p>
                </div>
              </div>
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto text-left md:text-right">
                <span className="block text-[8px] font-mono uppercase text-slate-500 tracking-widest font-black">Métrica Recomendada</span>
                <span className="text-[11px] text-slate-350 font-mono font-bold mt-1 block">{report.playerToWatch.metric}</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
