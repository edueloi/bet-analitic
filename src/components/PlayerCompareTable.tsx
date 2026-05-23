/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { PlayerStats } from "../types";
import { User, Award, Shield, Target, Activity, CheckSquare } from "lucide-react";

interface PlayerCompareTableProps {
  players: PlayerStats[];
}

export default function PlayerCompareTable({ players }: PlayerCompareTableProps) {
  const [playerOneId, setPlayerOneId] = useState<number>(1002); // Jonathan Calleri (default)
  const [playerTwoId, setPlayerTwoId] = useState<number>(2001); // Raphael Veiga (default)

  const p1 = players.find(p => p.id === playerOneId) || players[0];
  const p2 = players.find(p => p.id === playerTwoId) || players[1];

  const compareMetrics = (
    label: string,
    v1: number,
    v2: number,
    formatter: (v: number) => string,
    higherIsBetter: boolean = true
  ) => {
    const isV1Better = higherIsBetter ? v1 > v2 : v1 < v2;
    const isV2Better = higherIsBetter ? v2 > v1 : v2 < v1;

    return (
      <tr className="border-b border-slate-800 hover:bg-slate-900/40 transition-colors" id={`compare-row-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <td className={`p-3 font-mono text-xs w-28 text-left ${isV1Better ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
          {formatter(v1)}
        </td>
        <td className="p-3 text-slate-400 font-bold text-center text-[10px] uppercase tracking-wider bg-slate-950 col-span-1">
          {label}
        </td>
        <td className={`p-3 font-mono text-xs w-28 text-right ${isV2Better ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
          {formatter(v2)}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6" id="player-comparison-widget">
      <div className="border-b border-slate-800 pb-4 mb-5 gap-4">
        <div>
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">
            Player Head-to-Head
          </h3>
          <div className="h-1 w-12 bg-amber-500 mt-2"></div>
          <p className="text-[11px] text-slate-400 mt-2">
            Analise o desempenho histórico, finalizações e médias de criação individual para embasar apostas em mercados de jogadores (Player Props).
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Selecione o Jogador A</label>
          <select
            value={playerOneId}
            onChange={(e) => setPlayerOneId(parseInt(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamName.replace(" Paulista", "").replace(" FC", "").replace("SE ", "")}) - {p.position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Selecione o Jogador B</label>
          <select
            value={playerTwoId}
            onChange={(e) => setPlayerTwoId(parseInt(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamName.replace(" Paulista", "").replace(" FC", "").replace("SE ", "")}) - {p.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Player Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Player 1 Profile Card */}
        <div className="lg:col-span-3 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            {p1.position}
          </span>
          <h4 className="text-sm font-black text-white mt-3 uppercase tracking-tight">{p1.name}</h4>
          <span className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">{p1.teamName}</span>

          <div className="mt-5 w-full bg-slate-900/60 p-3 rounded-xl border border-slate-850">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-bold">
              <span>SofaScore Rating</span>
              <span className="font-mono text-emerald-400 font-bold">{p1.rating.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(p1.rating / 10) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-3 text-left w-20 text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Jogador A</th>
                <th className="p-3 text-center text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Métrica Histórica</th>
                <th className="p-3 text-right w-20 text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Jogador B</th>
              </tr>
            </thead>
            <tbody>
              {compareMetrics("Partidas Jogadas", p1.matches, p2.matches, (v) => v.toString())}
              {compareMetrics("Gols Marcados", p1.goals, p2.goals, (v) => v.toString())}
              {compareMetrics("Assistências Realizadas", p1.assists, p2.assists, (v) => v.toString())}
              {compareMetrics("Finalizações por jogo", p1.shotsPerGame, p2.shotsPerGame, (v) => v.toFixed(1))}
              {compareMetrics("Chutes no Alvo / partida", p1.shotsOnTargetPerGame, p2.shotsOnTargetPerGame, (v) => v.toFixed(1))}
              {compareMetrics("Escanteios Conquistados", p1.cornersWonPerGame, p2.cornersWonPerGame, (v) => v.toFixed(1))}
              {compareMetrics("Cartões Amarelos", p1.yellowCards, p2.yellowCards, (v) => v.toString(), false)}
              {compareMetrics("Cartões Vermelhos", p1.redCards, p2.redCards, (v) => v.toString(), false)}
            </tbody>
          </table>
        </div>

        {/* Player 2 Profile Card */}
        <div className="lg:col-span-3 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            {p2.position}
          </span>
          <h4 className="text-sm font-black text-white mt-3 uppercase tracking-tight">{p2.name}</h4>
          <span className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-tighter">{p2.teamName}</span>

          <div className="mt-5 w-full bg-slate-900/60 p-3 rounded-xl border border-slate-850">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-bold">
              <span>SofaScore Rating</span>
              <span className="font-mono text-emerald-400 font-bold">{p2.rating.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(p2.rating / 10) * 100}%` }} />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-5 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-xs text-slate-300 leading-relaxed font-serif italic">
        💡 <strong className="not-italic font-sans text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">Dica de Entrada (Props):</strong> Chutes no alvo e finalizações são ótimas métricas para o mercado de finalizadores com excelente margem. Compare o volume de chutes de <strong>{p1.name}</strong> ({p1.shotsPerGame}/jogo) contra <strong>{p2.name}</strong> ({p2.shotsPerGame}/jogo) para selecionar sua linha de aposta com melhor respaldo matemático.
      </div>

    </div>
  );
}
