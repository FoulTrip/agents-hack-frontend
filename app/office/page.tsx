"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Monitor, Bot, Brain, MapPin,
  Loader2, Zap, Shield, Terminal,
  Maximize2, X
} from "lucide-react";
import DashboardLayout from "../dashboard_layout";
import { useSoftwareFactory } from "../lib/softwareFactoryClient";

interface AgentLive {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: string;
  officeDesk: string;
  officeWing: string;
  activity: {
    task: string;
    thought: string;
    lastSeen: string | null;
  };
}

export default function OfficeHUDPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const { isAwaitingApproval, approvalMessage, approve, connectToSession } =
    useSoftwareFactory({ token: accessToken });

  const [agents, setAgents]               = useState<AgentLive[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded]   = useState(false);
  const [isFullscreen, setIsFullscreen]   = useState(false);

  useEffect(() => {
    if (selectedAgentId?.includes("_")) {
      connectToSession(selectedAgentId.split("_")[0]);
    }
  }, [selectedAgentId, connectToSession]);

  const fetchLiveAgents = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/agents/live`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setAgents(data);
        if (!selectedAgentId && data.length > 0) setSelectedAgentId(data[0].id);
      }
    } catch (e) {
      console.error("Error fetching live agents", e);
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedAgentId]);

  useEffect(() => {
    if (accessToken) {
      fetchLiveAgents();
      const interval = setInterval(fetchLiveAgents, 5000);
      return () => clearInterval(interval);
    }
  }, [accessToken, fetchLiveAgents]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">

        {/* ── Header ── */}
        {!isFullscreen && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
                Live HUD
              </h1>
              <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
                Monitoreo en tiempo real de activos agénticos.
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-medium text-[#5C5C56] dark:text-[#8B8B85] uppercase tracking-widest">
                Online
              </span>
              <span className="w-px h-3.5 bg-[#E8E8E4] dark:bg-[#252522]" />
              <span className="text-[11px] text-[#B0B0A8] dark:text-[#4A4A44]">
                {agents.length} agentes
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Agent list ── */}
          {!isFullscreen && (
            <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 lg:sticky lg:top-0 lg:self-start">
              {loading && agents.length === 0 ? (
                <div className="flex justify-center py-10 w-full">
                  <Loader2 size={18} strokeWidth={1.8} className="animate-spin text-[#B0B0A8] dark:text-[#4A4A44]" />
                </div>
              ) : (
                agents.map(agent => {
                  const active = selectedAgentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`
                        relative text-left px-4 py-3.5 rounded-xl border transition-colors duration-150
                        shrink-0 w-[220px] lg:w-full
                        ${active
                          ? "bg-white dark:bg-[#1A1A18] border-[#4F9CF9]/50 dark:border-[#4F9CF9]/40 shadow-sm"
                          : "bg-[#F7F7F5] dark:bg-[#141413] border-[#E8E8E4] dark:border-[#252522] hover:border-[#D0D0CC] dark:hover:border-[#3A3A36] hover:bg-white dark:hover:bg-[#1A1A18]"
                        }
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[#4F9CF9]" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl bg-white dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26] shrink-0">
                          {agent.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9] truncate">
                            {agent.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.status === "working" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            <span className="text-[10px] text-[#B0B0A8] dark:text-[#4A4A44] uppercase tracking-wide font-medium">
                              {agent.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ── Detail panel ── */}
          <div className={`flex-1 flex flex-col gap-5 ${isFullscreen ? "fixed inset-0 z-[100] bg-[#111110]" : ""}`}>
            {selectedAgent ? (
              <>
                {/* Identity + thought/task cards */}
                {!isFullscreen && (
                  <div className="flex flex-col gap-5">

                    {/* Identity card */}
                    <div className="rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522] flex items-center justify-center text-3xl shrink-0">
                          {selectedAgent.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-[18px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9] tracking-tight">
                              {selectedAgent.name}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/12 border border-[#4F9CF9]/20 text-[#4F9CF9]">
                              {selectedAgent.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin size={11} strokeWidth={1.8} className="text-[#B0B0A8] dark:text-[#4A4A44]" />
                            <p className="text-[12px] text-[#8B8B85] dark:text-[#6B6B63]">
                              {selectedAgent.officeWing} — Escritorio {selectedAgent.officeDesk || "9.04"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thought + Task */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                      {/* Neural stream */}
                      <div className="rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] flex flex-col overflow-hidden" style={{ height: 280 }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0EC] dark:border-[#1E1E1C] shrink-0">
                          <div className="flex items-center gap-2">
                            <Brain size={13} strokeWidth={1.8} className="text-violet-500 dark:text-violet-400" />
                            <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                              Neural stream
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                            <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#F9F9F8] dark:bg-[#1A1A18]">
                          <div className="flex gap-3">
                            <span className="text-violet-500 shrink-0 font-mono text-[12px] mt-0.5">❯</span>
                            <p className="text-[12px] font-mono text-[#5C5C56] dark:text-[#8B8B85] leading-relaxed">
                              {selectedAgent.activity.thought}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Active mission */}
                      <div className="rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] p-5 flex flex-col" style={{ height: 280 }}>
                        <div className="flex items-center gap-2 mb-4">
                          <Terminal size={13} strokeWidth={1.8} className="text-[#4F9CF9]" />
                          <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                            Misión activa
                          </span>
                        </div>
                        <div className="flex-1 flex items-center p-4 rounded-lg bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522] relative overflow-hidden">
                          <Zap size={48} strokeWidth={1.2} className="absolute right-3 bottom-2 text-[#4F9CF9] opacity-5" />
                          <p className="text-[13px] font-medium text-[#3A3A36] dark:text-[#C8C7BF] leading-relaxed relative z-10">
                            {selectedAgent.activity.task}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3D view ── */}
                <div className={`
                  rounded-xl border border-[#E8E8E4] dark:border-[#252522]
                  bg-white dark:bg-[#141413] flex flex-col overflow-hidden
                  transition-all duration-300
                  ${isFullscreen ? "rounded-none border-none h-full" : ""}
                `} style={!isFullscreen ? { height: 620 } : {}}>

                  {/* View header */}
                  {!isFullscreen && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} strokeWidth={1.8} className="text-emerald-500 dark:text-emerald-400" />
                        <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                          Infraestructura física 3D
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-medium text-[#B0B0A8] dark:text-[#4A4A44] uppercase tracking-widest">
                            Sensory feed
                          </span>
                        </div>
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="p-2 rounded-lg text-[#8B8B85] dark:text-[#6B6B63] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9] border border-[#E8E8E4] dark:border-[#252522] transition-colors duration-150"
                        >
                          <Maximize2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HITL approval alert */}
                  {isAwaitingApproval && (
                    <div className={`
                      mx-4 my-3 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4
                      bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20
                      ${isFullscreen ? "absolute bottom-6 left-6 right-6 z-50 bg-white/95 dark:bg-[#1A1A18]/95 backdrop-blur-md shadow-xl" : ""}
                    `}>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Shield size={14} strokeWidth={1.8} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-0.5">
                            Validación humana requerida
                          </p>
                          <p className="text-[12px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] leading-snug">
                            {approvalMessage || "Fase de arquitectura en espera de autorización."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={approve}
                        className="px-4 py-2 rounded-lg text-[11px] font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-150 shadow-sm shrink-0"
                      >
                        Desbloquear ejecución
                      </button>
                    </div>
                  )}

                  {/* Fullscreen close */}
                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="fixed top-5 right-5 z-[110] p-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors duration-150"
                    >
                      <X size={16} strokeWidth={1.8} />
                    </button>
                  )}

                  {/* iframe */}
                  <div className="flex-1 relative bg-[#04040a] min-h-0">
                    <iframe
                      src={`http://localhost:3001/office?dashboard=1&apiUrl=${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}&userId=${session?.user?.id}&token=${accessToken}&focus=${selectedAgent?.name}`}
                      className={`w-full h-full border-none transition-opacity duration-700 ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
                      title="TripKode Infra View"
                      allow="clipboard-read; clipboard-write; microphone; camera"
                      onLoad={() => setIframeLoaded(true)}
                    />

                    {/* Loading state */}
                    {!iframeLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#07070F]">
                        <div className="relative">
                          <Loader2 size={32} strokeWidth={1.8} className="animate-spin text-[#4F9CF9]" />
                          <Monitor size={14} strokeWidth={1.8} className="absolute inset-0 m-auto text-[#4F9CF9]" />
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] font-medium text-white">Inicializando stream sensorial</p>
                          <p className="text-[10px] text-[#6B6B63] font-mono mt-1">
                            Enlazando con {selectedAgent.officeWing}…
                          </p>
                        </div>
                      </div>
                    )}

                    {/* In-game badge */}
                    {iframeLoaded && (
                      <div className="absolute bottom-5 left-5 z-30 flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-2xl">{selectedAgent.emoji}</span>
                        <div className="border-l border-white/20 pl-3">
                          <p className="text-[12px] font-semibold text-white">{selectedAgent.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-white/50 font-mono tracking-widest">
                              DESK {selectedAgent.officeDesk || "9.04"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-[#E8E8E4] dark:border-[#252522] bg-[#FAFAF8] dark:bg-[#111110] text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F0F0EC] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522] flex items-center justify-center">
                  <Bot size={18} strokeWidth={1.6} className="text-[#B0B0A8] dark:text-[#4A4A44]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#3A3A36] dark:text-[#C8C7BF]">
                    Infraestructura en standby
                  </p>
                  <p className="text-[12px] text-[#B0B0A8] dark:text-[#4A4A44] mt-1 max-w-xs">
                    Selecciona un agente activo para iniciar el stream sensorial.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}