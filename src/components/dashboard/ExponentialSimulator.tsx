"use client";

import React, { useState, useId } from "react";

export default function ExponentialSimulator() {
  const initialUsersInputId = useId();
  const growthRateInputId = useId();
  const monthsInputId = useId();
  const tourneyPresetSelectId = useId();
  const tourneyCapacityInputId = useId();
  const tourneyInitialInputId = useId();
  const tourneyRateInputId = useId();
  const tourneyDaysInputId = useId();

  // Modelo 1: Base de Jogadores
  const [initialUsers, setInitialUsers] = useState<number>(12000);
  const [monthlyRate, setMonthlyRate] = useState<number>(0.08);
  const [months, setMonths] = useState<number>(12);

  // Modelo 2: Vagas do Torneio
  const [capacity, setCapacity] = useState<number>(128);
  const [initialTourney, setInitialTourney] = useState<number>(88);
  const [dailyRate, setDailyRate] = useState<number>(0.45);
  const [days, setDays] = useState<number>(10);

  // U(t) = U0 * e^(r * t)
  const calculateUsers = (t: number): number => {
    return Math.round(initialUsers * Math.exp(monthlyRate * t));
  };

  // I(t) = V / (1 + ((V - I0) / I0) * e^(-r * t))
  const calculateTourneyFilling = (t: number): number => {
    if (initialTourney <= 0) return 0;
    const k = (capacity - initialTourney) / initialTourney;
    return Math.min(capacity, Math.round(capacity / (1 + k * Math.exp(-dailyRate * t))));
  };

  const handlePresetChange = (preset: string) => {
    if (preset === "cs2") {
      setCapacity(128);
      setInitialTourney(88);
      setDailyRate(0.45);
    } else if (preset === "valorant") {
      setCapacity(64);
      setInitialTourney(52);
      setDailyRate(0.5);
    }
  };

  let dayToFull: number | null = null;
  for (let d = 0; d <= days; d++) {
    if (calculateTourneyFilling(d) >= capacity * 0.98) {
      dayToFull = d;
      break;
    }
  }

  const finalUsers = calculateUsers(months);
  const finalRevenue = finalUsers * 15 * 0.1;

  return (
    <div className="space-y-8 text-zinc-100">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white">
          Dashboard de Projeções Exponenciais
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Simulações da escala da comunidade e lotação de torneios da arena VictoryHub.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Modelo 1 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-amber-400">
                👥 Escala de Jogadores Ativos
              </h2>
              <code className="text-xs bg-zinc-800 text-amber-300 px-2 py-1 rounded font-mono">
                U(t) = U₀ · e^(rt)
              </code>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Projeção exponencial contínua partindo dos 12.000 usuários iniciais.
            </p>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div>
                <label htmlFor={initialUsersInputId} className="text-xs text-zinc-400 block mb-1">
                  Base Inicial (U₀)
                </label>
                <input
                  id={initialUsersInputId}
                  type="number"
                  value={initialUsers}
                  onChange={(e) => setInitialUsers(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label htmlFor={growthRateInputId} className="text-xs text-zinc-400 block mb-1">
                  Taxa r (mês)
                </label>
                <input
                  id={growthRateInputId}
                  type="number"
                  step="0.01"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label htmlFor={monthsInputId} className="text-xs text-zinc-400 block mb-1">
                  Meses (t)
                </label>
                <input
                  id={monthsInputId}
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <span className="text-xs font-semibold text-zinc-400">Projeção Amostral:</span>
              {[0, Math.floor(months / 2), months].map((m) => {
                const val = calculateUsers(m);
                const pct = Math.min(100, Math.round((val / (finalUsers || 1)) * 100));
                return (
                  <div key={m} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Mês {m}</span>
                      <span className="font-semibold text-amber-400">{val.toLocaleString("pt-BR")} jogadores</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 bg-zinc-950/60 p-3.5 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Projeção Final:</span>
              <span className="font-bold text-amber-400">{finalUsers.toLocaleString("pt-BR")} jogadores</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Receita Est. (10% de R$ 15):</span>
              <span className="font-bold text-emerald-400">
                {finalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>
        </div>

        {/* Card Modelo 2 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-red-400">
                🏆 Preenchimento de Vagas (Logístico)
              </h2>
              <code className="text-xs bg-zinc-800 text-red-300 px-2 py-1 rounded font-mono">
                Saturação S-Curve
              </code>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Modela o limite máximo de vagas do torneio com saturação realista.
            </p>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="col-span-2">
                <label htmlFor={tourneyPresetSelectId} className="text-xs text-zinc-400 block mb-1">
                  Preset de Torneio
                </label>
                <select
                  id={tourneyPresetSelectId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-red-400"
                >
                  <option value="cs2">CS2 Championship (88 / 128 inscritos)</option>
                  <option value="valorant">Valorant Masters (52 / 64 inscritos)</option>
                </select>
              </div>
              <div>
                <label htmlFor={tourneyCapacityInputId} className="text-xs text-zinc-400 block mb-1">
                  Vagas Totais (V)
                </label>
                <input
                  id={tourneyCapacityInputId}
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor={tourneyInitialInputId} className="text-xs text-zinc-400 block mb-1">
                  Inscritos (I₀)
                </label>
                <input
                  id={tourneyInitialInputId}
                  type="number"
                  value={initialTourney}
                  onChange={(e) => setInitialTourney(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor={tourneyRateInputId} className="text-xs text-zinc-400 block mb-1">
                  Taxa Diária (r)
                </label>
                <input
                  id={tourneyRateInputId}
                  type="number"
                  step="0.05"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor={tourneyDaysInputId} className="text-xs text-zinc-400 block mb-1">
                  Dias (t)
                </label>
                <input
                  id={tourneyDaysInputId}
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <span className="text-xs font-semibold text-zinc-400">Projeção por Dia:</span>
              {[0, 1, 2, 3, Math.min(days, 5)].map((d) => {
                const filled = calculateTourneyFilling(d);
                const pct = Math.round((filled / (capacity || 1)) * 100);
                return (
                  <div key={d} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Dia {d}</span>
                      <span className="font-semibold text-red-400">{filled} / {capacity} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-300 ${pct >= 95 ? "bg-red-500" : "bg-orange-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 bg-zinc-950/60 p-3.5 rounded-lg flex items-center justify-between">
            <span className="text-sm text-zinc-400">Status de Vagas:</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${dayToFull !== null ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
              {dayToFull !== null ? `Lota no Dia ~${dayToFull}` : "Permanece com vagas"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Validação */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1">
          📋 Memória de Cálculo Passo a Passo
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Dados calculados para validação cruzada com o relatório escrito.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300 border border-zinc-800">
            <thead className="bg-zinc-800/80 text-xs uppercase text-zinc-400">
              <tr>
                <th className="p-3">Período (t)</th>
                <th className="p-3">U(t) [Usuários]</th>
                <th className="p-3">Receita R(t)</th>
                <th className="p-3">I(t) [Inscritos]</th>
                <th className="p-3">% Lotação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono text-xs">
              {[0, 1, 2, 3, 6, 12].map((t) => {
                const u = calculateUsers(t);
                const r = u * 15 * 0.1;
                const i = calculateTourneyFilling(t);
                const pct = ((i / (capacity || 1)) * 100).toFixed(1);
                return (
                  <tr key={t} className="hover:bg-zinc-800/40">
                    <td className="p-3 font-sans font-semibold text-white">t = {t}</td>
                    <td className="p-3 text-amber-400 font-bold">{u.toLocaleString("pt-BR")}</td>
                    <td className="p-3 text-emerald-400">{r.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="p-3 text-red-400">{i} / {capacity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${Number(pct) >= 90 ? "bg-red-500/20 text-red-300" : "bg-zinc-800 text-zinc-300"}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}