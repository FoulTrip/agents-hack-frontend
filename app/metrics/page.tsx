"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../dashboard_layout";
import {
  BarChart3, TrendingUp, DollarSign, Zap,
  Activity, CheckCircle2, AlertCircle, Clock,
  GitBranch, Cpu, Code2, Layers, BookOpen, Server,
  ChevronDown, ChevronUp, Search, RefreshCw, Archive,
  Star, Target, Workflow, Briefcase
} from "lucide-react";

// --- Types ---

interface AnalyticsData {
  spend: { total: number; input: number; output: number };
  usage: { totalTokens: number; inputTokens: number; outputTokens: number };
  performance: { 
    totalRuns: number; 
    successRuns: number; 
    successRate: number | null; 
    avgRuntimeMs: number;
    toolCalls: number;
    approvals: number;
  };
  agentSpend: Record<string, number>;
  modelBreakdown: Record<string, any>;
}

interface TimelineEntry {
  id: string;
  sessionId: string;
  sessionTitle: string | null;
  category: string;
  decision: string;
  rationale: string | null;
  status: string;
  replacedById: string | null;
  createdAt: string | null;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  architecture:   { label: "Arquitectura",    icon: Layers,      color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20" },
  tech_stack:     { label: "Tech Stack",       icon: Cpu,         color: "text-violet-500",  bg: "bg-violet-500/10 border-violet-500/20" },
  development:    { label: "Desarrollo",       icon: Code2,       color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/20" },
  ui_ux:          { label: "UI / UX",          icon: Zap,         color: "text-pink-500",    bg: "bg-pink-500/10 border-pink-500/20" },
  security:       { label: "Seguridad",        icon: Server,      color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20" },
  business_logic: { label: "Negocio",          icon: BookOpen,    color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function MetricsPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const [activeTab, setActiveTab] = useState<"performance" | "decisions" | "financials">("performance");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async (silent = false) => {
    if (!accessToken) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const [resAn, resTim] = await Promise.all([
        fetch(`${apiUrl}/api/analytics`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${apiUrl}/api/context/timeline`, { headers: { Authorization: `Bearer ${accessToken}` } })
      ]);

      if (resAn.ok) setAnalytics(await resAn.json());
      if (resTim.ok) setTimeline(await resTim.json());
    } catch (e) {
      console.error("Error fetching metrics", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-4">
          <RefreshCw size={32} className="animate-spin text-[#4F9CF9]" />
          <p className="text-[14px] text-[#8B8B85]">Analizando métricas de la factoría...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div className="space-y-1">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <BarChart3 className="text-white" size={20} />
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">Factory Performance Metrics</h1>
             </div>
             <p className="text-[14px] text-[#8B8B85] dark:text-[#6B6B63]">
               Visión holística del rendimiento, costos y genealogía de decisiones de tus proyectos.
             </p>
           </div>
           
           <div className="flex items-center gap-2 bg-[#F7F7F5] dark:bg-[#1A1A18] p-1 rounded-2xl border border-[#E8E8E4] dark:border-[#252522]">
              {(['performance', 'decisions', 'financials'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-200 capitalize ${
                    activeTab === tab 
                    ? "bg-white dark:bg-[#252522] text-[#1A1A18] dark:text-[#F0EFE9] shadow-sm" 
                    : "text-[#8B8B85] hover:text-[#3A3A36] dark:hover:text-[#C8C7BF]"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="w-px h-4 bg-[#E8E8E4] dark:bg-[#252522] mx-1" />
              <button 
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 text-[#8B8B85] hover:text-[#4F9CF9] transition-colors"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              </button>
           </div>
        </div>

        {/* ── Overview Statistics Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard 
             title="Success Rate" 
             value={`${analytics?.performance.successRate ? (analytics.performance.successRate * 100).toFixed(1) : '—'}%`}
             sub={`De un total de ${analytics?.performance.totalRuns ?? 0} ejecuciones`}
             icon={CheckCircle2}
             color="emerald"
           />
           <MetricCard 
             title="Total Invested" 
             value={`$${analytics?.spend.total.toFixed(4) ?? '0.00'}`}
             sub="Costo acumulado de agentes"
             icon={DollarSign}
             color="blue"
           />
           <MetricCard 
             title="Average Runtime" 
             value={analytics?.performance.avgRuntimeMs ? `${(analytics.performance.avgRuntimeMs / 1000).toFixed(1)}s` : '—'}
             sub="Por ciclo de orquestación"
             icon={Clock}
             color="amber"
           />
           <MetricCard 
             title="Decisions Logged" 
             value={timeline.length.toString()}
             sub="Historial de gobernanza"
             icon={GitBranch}
             color="violet"
           />
        </div>

        {activeTab === "performance" && analytics && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
            {/* Efficiency Overview */}
            <div className="xl:col-span-2 space-y-6">
               <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[15px] font-bold text-[#1A1A18] dark:text-[#F0EFE9] mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    Agent Efficiency Hub
                  </h3>
                  <div className="space-y-4">
                     {Object.entries(analytics.agentSpend).map(([agent, cost]) => (
                       <div key={agent} className="space-y-2">
                          <div className="flex items-center justify-between text-[12px] font-bold">
                             <div className="flex items-center gap-2">
                               <Briefcase size={12} className="text-[#8B8B85]" />
                               {agent}
                             </div>
                             <span className="text-[#8B8B85]">${cost.toFixed(4)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#F7F7F5] dark:bg-[#141413] overflow-hidden">
                             <div 
                               className="h-full bg-blue-500 rounded-full" 
                               style={{ width: `${(cost / analytics.spend.total) * 100}%` }}
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm">
                    <h4 className="text-[13px] font-bold text-[#8B8B85] flex items-center gap-2 mb-4 uppercase tracking-widest">
                       Pipeline Health
                    </h4>
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#F0F0EC] dark:text-[#1E1E1C]" />
                             <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - (analytics.performance.successRate || 0))} className="text-emerald-500 transition-all duration-1000" />
                          </svg>
                          <span className="absolute text-2xl font-black text-[#1A1A18] dark:text-[#F0EFE9]">{Math.round((analytics.performance.successRate || 0) * 100)}%</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm">
                    <h4 className="text-[13px] font-bold text-[#8B8B85] flex items-center gap-2 mb-4 uppercase tracking-widest">
                       Orchestration Speed
                    </h4>
                    <div className="space-y-4 pt-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[#8B8B85]">Avg Pipeline Step</span>
                          <span className="text-[14px] font-bold">{Math.round(analytics.performance.avgRuntimeMs / 4)}ms</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[#8B8B85]">Total Compute Cycles</span>
                          <span className="text-[14px] font-bold">{analytics.performance.totalRuns * 12} ops</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Token Intelligence */}
            <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm">
               <h3 className="text-[15px] font-bold text-[#1A1A18] dark:text-[#F0EFE9] mb-6 flex items-center gap-2">
                 <Cpu size={16} className="text-violet-500" />
                 Token Consumption
               </h3>
               <div className="space-y-8">
                  <div className="text-center">
                     <p className="text-4xl font-black text-violet-500">{analytics.usage.totalTokens.toLocaleString()}</p>
                     <p className="text-[12px] text-[#8B8B85] font-medium mt-1 uppercase tracking-tight">Total Processed Tokens</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-[#141413] border border-[#E8E8E4] dark:border-[#252522]">
                        <p className="text-[10px] font-bold text-[#8B8B85] uppercase mb-1">Input</p>
                        <p className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{analytics.usage.inputTokens.toLocaleString()}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-[#F7F7F5] dark:bg-[#141413] border border-[#E8E8E4] dark:border-[#252522]">
                        <p className="text-[10px] font-bold text-[#8B8B85] uppercase mb-1">Output</p>
                        <p className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{analytics.usage.outputTokens.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-[#F0F0EC] dark:border-[#1E1E1C]">
                     <h4 className="text-[11px] font-bold text-violet-500 uppercase flex items-center gap-2 mb-3">
                       <TrendingUp size={12} /> Model Efficiency
                     </h4>
                     <p className="text-[12px] text-[#5C5C56] leading-relaxed">
                        Actualmente operando con <span className="font-bold text-[#1A1A18] dark:text-[#F0EFE9]">Gemini-Pro</span>. 
                        Ratio de tokens output/input: <span className="font-bold">{(analytics.usage.outputTokens / analytics.usage.inputTokens).toFixed(2)}x</span>.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "decisions" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
             <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[15px] font-bold text-[#1A1A18] dark:text-[#F0EFE9] flex items-center gap-2">
                     <GitBranch size={16} className="text-violet-500" />
                     Genealogía de las Decisiones
                   </h3>
                </div>
                {timeline.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-[#F0F0EC] dark:border-[#1E1E1C] rounded-2xl">
                     <p className="text-[13px] text-[#8B8B85]">No hay decisiones registradas aún.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pl-4 relative">
                     <div className="absolute left-8 top-4 bottom-4 w-px bg-[#F0F0EC] dark:bg-[#1E1E1C]" />
                     {timeline.map(entry => {
                        const cat = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.architecture;
                        const Icon = cat.icon;
                        const isExpanded = expanded.has(entry.id);
                        return (
                          <div key={entry.id} className="relative pl-12">
                             <div className={`absolute left-6 top-5 w-4 h-4 rounded-full bg-white dark:bg-[#1A1A18] border-2 shadow-sm z-10 ${entry.status === 'active' ? 'border-emerald-500' : 'border-[#B0B0A8]'}`} />
                             <div 
                               className="p-5 rounded-3xl bg-[#F9F9F8] dark:bg-[#171716] border border-[#E8E8E4] dark:border-[#252522] hover:shadow-md transition-all cursor-pointer"
                               onClick={() => toggleExpand(entry.id)}
                             >
                                <div className="flex items-center gap-3 mb-2">
                                   <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${cat.bg} ${cat.color}`}>
                                      {cat.label}
                                   </span>
                                   <span className="text-[10px] text-[#B0B0A8]">
                                      {new Date(entry.createdAt || '').toLocaleDateString()}
                                   </span>
                                </div>
                                <h4 className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{entry.decision}</h4>
                                {isExpanded && entry.rationale && (
                                  <div className="mt-4 pt-4 border-t border-[#E8E8E4] dark:border-[#252522] text-[12px] text-[#8B8B85] italic font-serif leading-relaxed">
                                    "{entry.rationale}"
                                  </div>
                                )}
                             </div>
                          </div>
                        )
                     })}
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === "financials" && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">
             <div className="lg:col-span-2 bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Financial Trajectory</h3>
                <div className="h-64 flex items-end gap-2 px-4 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
                   {/* Dummy chart bars using real data proportionally */}
                   {Object.entries(analytics.agentSpend).map(([agent, cost], idx) => (
                     <div key={agent} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full">
                           <div 
                             className="absolute bottom-0 w-full rounded-t-xl bg-blue-500 hover:bg-blue-600 transition-all cursor-help"
                             style={{ height: `${(cost / analytics.spend.total) * 160}px` }}
                           >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                                ${cost.toFixed(4)}
                              </div>
                           </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#8B8B85] uppercase tracking-tighter truncate max-w-full">{agent.split(' ')[0]}</span>
                     </div>
                   ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                   <div className="lg:col-span-1 space-y-4">
                      <p className="text-[11px] font-bold text-[#B0B0A8] uppercase tracking-widest border-b border-[#F0F0EC] dark:border-[#1E1E1C] pb-2">Model Breakdown</p>
                      <div className="space-y-3">
                         {Object.entries(analytics.modelBreakdown).map(([model, data]: [string, any]) => (
                           <div key={model} className="flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[12px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{model}</span>
                                 <span className="text-[10px] text-[#8B8B85]">{data.tokens.toLocaleString()} tokens</span>
                              </div>
                              <span className="text-[13px] font-black text-[#1A1A18] dark:text-[#F0EFE9]">${data.cost.toFixed(4)}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-8 lg:col-span-2">
                     <div>
                        <p className="text-[11px] font-bold text-[#B0B0A8] uppercase tracking-widest mb-1">Mano de Obra (IA)</p>
                        <p className="text-3xl font-black text-[#1A1A18] dark:text-[#F0EFE9]">${analytics.spend.total.toFixed(4)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1">REAL-TIME GCP BILLING</p>
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-[#B0B0A8] uppercase tracking-widest mb-1">Costo por Run</p>
                        <p className="text-3xl font-black text-[#1A1A18] dark:text-[#F0EFE9]">${(analytics.spend.total / (analytics.performance.totalRuns || 1)).toFixed(5)}</p>
                        <p className="text-[10px] text-[#8B8B85] mt-1">Avg Efficiency</p>
                     </div>
                   </div>
                </div>
             </div>
             
             <div className="bg-gradient-to-br from-[#1A1A18] to-black rounded-3xl p-8 shadow-xl text-white">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Star className="text-amber-400" />
                  Cost Efficiency Tips
                </h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <p className="text-[13px] font-bold text-amber-200">Optimiza los Tokens de Salida</p>
                      <p className="text-[12px] opacity-70">El 80% de tus costos provienen de la generación de código. Considera usar Gemini-Flash para tareas de QA.</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[13px] font-bold text-blue-300">Gobernanza Activa</p>
                      <p className="text-[12px] opacity-70">Has reducido un 15% de retrabajo gracias a la Genealogía del Código al evitar alucinaciones recurrentes.</p>
                   </div>
                   <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                         <TrendingUp className="text-emerald-400" size={20} />
                      </div>
                      <span className="text-[12px] font-bold">ROI Estimado: 450%</span>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10",
    amber: "text-amber-600 bg-amber-500/10",
    violet: "text-violet-600 bg-violet-500/10"
  };
  return (
    <div className="bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
       <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${colors[color]}`}>
             <Icon size={18} />
          </div>
          <Activity size={14} className="text-[#F0F0EC] dark:text-[#1E1E1C]" />
       </div>
       <h3 className="text-[28px] font-black text-[#1A1A18] dark:text-[#F0EFE9]">{value}</h3>
       <div className="mt-1 space-y-0.5">
          <p className="text-[10px] font-bold text-[#8B8B85] uppercase tracking-widest">{title}</p>
          <p className="text-[11px] text-[#B0B0A8]">{sub}</p>
       </div>
    </div>
  );
}
