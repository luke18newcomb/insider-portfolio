"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

// Exact historical dataset mapped from Aug 21, 2025 to Aug 6, 2026
const HISTORICAL_PERFORMANCE = [
  { date: "Aug 21, 2025", portfolio: 100.0, voo: 100.0 },
  { date: "Sep 2025",     portfolio: 125.88, voo: 105.03 },
  { date: "Oct 2025",     portfolio: 116.12, voo: 106.85 },
  { date: "Nov 2025",     portfolio: 130.24, voo: 107.54 },
  { date: "Dec 2025",     portfolio: 136.83, voo: 107.52 },
  { date: "Jan 2026",     portfolio: 151.31, voo: 109.17 },
  { date: "Feb 2026",     portfolio: 160.59, voo: 109.15 },
  { date: "Mar 2026",     portfolio: 150.33, voo: 103.34 },
  { date: "Apr 2026",     portfolio: 158.66, voo: 113.71 },
  { date: "May 2026",     portfolio: 164.11, voo: 118.43 },
  { date: "Jun 2026",     portfolio: 161.10, voo: 118.06 },
  { date: "Jul 2026",     portfolio: 167.38, voo: 118.38 },
  { date: "Aug 6, 2026",  portfolio: 178.22, voo: 121.77 },
];

interface RebalanceLog {
  week: string;
  weightPerAsset: string;
  buys: {
    ticker: string;
    insider: string;
    title: string;
    amount: string;
  }[];
}

const DEFAULT_LOG: RebalanceLog = {
  week: "Aug 03, 2026",
  weightPerAsset: "25.00%",
  buys: [
    { ticker: "CRWL", insider: "Insider Buyer", title: "Director / Executive", amount: " > $1.00M" },
    { ticker: "ARTV", insider: "Insider Buyer", title: "Director / Officer", amount: " > $1.00M" },
    { ticker: "PNFP", insider: "Pinnacle Financial Insider", title: "Director / 10% Owner", amount: " > $1.00M" },
    { ticker: "MUD", insider: "Insider Buyer", title: "Executive Officer", amount: " > $1.00M" },
  ]
};

export default function InsiderDashboard() {
  const [activeLog, setActiveLog] = useState<RebalanceLog>(DEFAULT_LOG);

  useEffect(() => {
    async function loadLatestData() {
      try {
        const res = await fetch("/data/portfolio.json");
        if (res.ok) {
          const data = await res.json();
          if (data && data.transactions_included) {
            setActiveLog({
              week: data.rebalance_date || "Latest Rebalance",
              weightPerAsset: `${data.target_weight_pct?.toFixed(2)}%` || "25.00%",
              buys: data.transactions_included.map((t: any) => ({
                ticker: t.ticker,
                insider: t.insiderName,
                title: t.title,
                amount: t.totalValue > 0 ? `$${(t.totalValue / 1000000).toFixed(2)}M` : "> $1.00M"
              }))
            });
          }
        }
      } catch (err) {
        // Fallback to active holdings
      }
    }
    loadLatestData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{"$1M+"} Insider Portfolio</h1>
            <p className="text-sm text-slate-400 mt-1">
              Automated equal-weight strategy tracking open-market {"$1M+"} SEC Form 4 buy filings over 7-day windows.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-Rebalanced Mondays at Market Open
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Return</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">+78.22%</p>
            <span className="text-xs text-slate-500">Since Aug 21, 2025 Inception</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Benchmark ($VOO)</span>
            <p className="text-2xl font-bold text-slate-300 mt-1">+21.77%</p>
            <span className="text-xs text-emerald-400 font-medium">+56.45% Alpha vs S&P 500</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Holdings</span>
            <p className="text-2xl font-bold text-white mt-1">{activeLog.buys.length} Tickers</p>
            <span className="text-xs text-slate-500">{activeLog.weightPerAsset} Split per Asset</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Next Rebalance</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">Monday 9:30 AM</p>
            <span className="text-xs text-slate-500">Scanning 7-Day SEC EDGAR Feed</span>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Performance Trajectory vs VOO</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400 rounded"></span> Insider Strategy (+78.22%)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-slate-400 rounded"></span> $VOO (+21.77%)
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_PERFORMANCE}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[90, 190]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="portfolio" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="voo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Active Holdings Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Active Portfolio Positions</h2>
              <p className="text-xs text-slate-400">Current allocation log date: {activeLog.week}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4">Insider & Title</th>
                  <th className="py-3 px-4">Filing Purchase Size</th>
                  <th className="py-3 px-4 text-right">Target Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeLog.buys.map((buy, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{buy.ticker}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{buy.insider}</div>
                      <div className="text-xs text-slate-400">{buy.title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">{buy.amount}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-indigo-400">{activeLog.weightPerAsset}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}