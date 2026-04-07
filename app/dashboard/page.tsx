"use client"

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Code2, Workflow, ArrowRight, Activity, Cpu,
  Globe, Clock, Plus, Rocket,
  CheckCircle2, XCircle, RefreshCw,
  Search, Github, Box, BarChart2, Zap
} from "lucide-react";
import DashboardLayout from "../dashboard_layout";
import { useSidebar } from "../../context/SidebarContext";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;
  const { sessions, isLoadingSessions: loading, userConfig } = useSidebar();

  const activeProjectsCount  = sessions.filter((s: any) => s.status === "running").length;
  const completedCount       = sessions.filter((s: any) => s.status === "completed").length;
  const agentsCount          = 6;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
              Bienvenido, {session?.user?.name?.split(" ")[0] || "Usuario"}
            </h1>
            <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
              Monitoreo en tiempo real de tu infraestructura agéntica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search
                size={14}
                strokeWidth={1.8}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0A8] dark:text-[#4A4A44] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar automatización..."
                className="
                  h-9 pl-8 pr-4 w-56 rounded-lg text-[12px]
                  bg-[#F7F7F5] dark:bg-[#1A1A18]
                  border border-[#E8E8E4] dark:border-[#2A2A26]
                  text-[#1A1A18] dark:text-[#F0EFE9]
                  placeholder:text-[#B0B0A8] dark:placeholder:text-[#4A4A44]
                  focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
                  transition-all duration-150
                "
              />
            </div>

            {/* New Project */}
            <button
              onClick={() => router.push("/factory")}
              className="
                h-9 px-4 rounded-lg flex items-center gap-2
                bg-[#4F9CF9] hover:bg-[#3D8EE8]
                text-white text-[12px] font-medium
                transition-colors duration-150 shadow-sm
              "
            >
              <Plus size={14} strokeWidth={2.2} />
              Nuevo proyecto
            </button>
          </div>
        </div>

        {/* ── 3D Office Engine (Global Overview) ── */}
        <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] overflow-hidden bg-[#1a1a2e] dark:bg-[#0D0D1A]" style={{ height: 600 }}>
          <div className="flex-1 relative">
            <iframe
              src={`http://localhost:3001/office?dashboard=1&userId=${session?.user?.id || ''}&token=${accessToken || ''}`}
              className="w-full h-full border-none relative z-10"
              title="Claw3D Global Infrastructure Overview"
              allow="clipboard-read; clipboard-write; microphone; camera"
            />
          </div>
        </div>

        {/* ── Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Proyectos activos"
            value={activeProjectsCount}
            icon={Activity}
            trend="+2 desde ayer"
            accentClass="text-[#4F9CF9]"
            bgClass="bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/10"
          />
          <MetricCard
            title="Deployments"
            value={completedCount}
            icon={Rocket}
            trend="100% success rate"
            accentClass="text-emerald-500 dark:text-emerald-400"
            bgClass="bg-emerald-500/8 dark:bg-emerald-500/10"
          />
          <MetricCard
            title="Agentes vinculados"
            value={agentsCount}
            icon={Cpu}
            trend="Cluster online"
            accentClass="text-violet-500 dark:text-violet-400"
            bgClass="bg-violet-500/8 dark:bg-violet-500/10"
          />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Quick actions + Activity */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard
                title="Software Factory"
                description="Lanzar pipeline autónomo"
                icon={Code2}
                onClick={() => router.push("/factory")}
                accentClass="text-[#4F9CF9]"
                bgClass="bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/10 hover:bg-[#4F9CF9]/14 dark:hover:bg-[#4F9CF9]/16"
                borderClass="border-[#4F9CF9]/15 dark:border-[#4F9CF9]/20"
              />
              <ActionCard
                title="Agentic Workflows"
                description="Gestionar orquestación"
                icon={Workflow}
                onClick={() => router.push("/workflows")}
                accentClass="text-violet-500 dark:text-violet-400"
                bgClass="bg-violet-500/8 dark:bg-violet-500/10 hover:bg-violet-500/14 dark:hover:bg-violet-500/16"
                borderClass="border-violet-500/15 dark:border-violet-500/20"
              />
            </div>

            {/* Activity table */}
            <div className="
              rounded-xl border border-[#E8E8E4] dark:border-[#252522]
              bg-white dark:bg-[#141413]
              overflow-hidden
            ">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E4] dark:border-[#252522]">
                <div className="flex items-center gap-2">
                  <Clock size={14} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                  <h3 className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                    Actividad reciente
                  </h3>
                </div>
                <button
                  onClick={() => router.push("/factory")}
                  className="
                    text-[11px] font-medium text-[#4F9CF9]
                    hover:text-[#3D8EE8] transition-colors duration-150
                  "
                >
                  Ver todos
                </button>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <RefreshCw size={20} strokeWidth={1.8} className="animate-spin text-[#B0B0A8] dark:text-[#4A4A44]" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522] flex items-center justify-center">
                    <Box size={16} strokeWidth={1.6} className="text-[#B0B0A8] dark:text-[#4A4A44]" />
                  </div>
                  <p className="text-[12px] text-[#B0B0A8] dark:text-[#4A4A44]">
                    Sin ejecuciones recientes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F0EC] dark:divide-[#1E1E1C]">
                  {sessions.slice(0, 6).map((sess: any) => (
                    <SessionRow
                      key={sess.sessionId}
                      sess={sess}
                      onClick={() => router.push(`/factory/${sess.sessionId}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Trend + Connectors */}
          <div className="space-y-6">

            {/* Deployment trend */}
            <div className="
              rounded-xl border border-[#E8E8E4] dark:border-[#252522]
              bg-white dark:bg-[#141413] p-5 space-y-4
            ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 size={14} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                  <h3 className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                    Deployment trend
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Mini bar chart */}
              <div className="h-24 flex items-end gap-1.5">
                {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-[#4F9CF9]/20 dark:bg-[#4F9CF9]/15 hover:bg-[#4F9CF9]/40 dark:hover:bg-[#4F9CF9]/35 transition-colors duration-150"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <div className="pt-3 border-t border-[#F0F0EC] dark:border-[#1E1E1C] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#1A1A18] dark:text-[#F0EFE9]">Avg sync time</p>
                  <p className="text-[10px] text-[#B0B0A8] dark:text-[#4A4A44] mt-0.5">Últimas 24h</p>
                </div>
                <span className="text-[18px] font-semibold text-[#4F9CF9]">1.2s</span>
              </div>
            </div>

            {/* Active connectors */}
            <div className="
              rounded-xl border border-[#E8E8E4] dark:border-[#252522]
              bg-white dark:bg-[#141413] p-5 space-y-4
            ">
              <div className="flex items-center gap-2">
                <Zap size={14} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <h3 className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                  Conectores activos
                </h3>
              </div>

              <div className="space-y-2">
                <ConnectorRow
                  label="GitHub"
                  icon={Github}
                  linked={!!userConfig?.githubToken}
                  onClick={() => router.push("/connectors")}
                />
                <ConnectorRow
                  label="Notion"
                  icon={Activity}
                  linked={!!userConfig?.notionToken}
                  onClick={() => router.push("/connectors")}
                />
                <ConnectorRow
                  label="Google Cloud"
                  icon={Globe}
                  linked={!!userConfig?.gcpRefreshToken}
                  onClick={() => router.push("/connectors")}
                />
              </div>

              <button
                onClick={() => router.push("/connectors")}
                className="
                  w-full py-2 rounded-lg text-[11px] font-medium
                  text-[#8B8B85] dark:text-[#6B6B63]
                  hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18]
                  hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
                  border border-[#E8E8E4] dark:border-[#252522]
                  transition-colors duration-150
                "
              >
                Gestionar conectores
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({ title, value, icon: Icon, trend, accentClass, bgClass }: any) {
  return (
    <div className="
      rounded-xl border border-[#E8E8E4] dark:border-[#252522]
      bg-white dark:bg-[#141413] p-5
      flex items-start justify-between gap-4
    ">
      <div className="space-y-3">
        <p className="text-[11px] font-medium text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-wide">
          {title}
        </p>
        <p className={`text-[28px] font-semibold leading-none tracking-tight ${accentClass}`}>
          {value}
        </p>
        <p className="text-[11px] text-[#B0B0A8] dark:text-[#4A4A44]">{trend}</p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon size={16} strokeWidth={1.8} className={accentClass} />
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, onClick, accentClass, bgClass, borderClass }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full text-left p-5 rounded-xl border
        flex items-center gap-4
        transition-colors duration-150
        ${bgClass} ${borderClass}
      `}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/60 dark:bg-black/20`}>
        <Icon size={16} strokeWidth={1.8} className={accentClass} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">{title}</p>
        <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">{description}</p>
      </div>
      <ArrowRight
        size={14}
        strokeWidth={1.8}
        className={`shrink-0 ${accentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-150`}
      />
    </button>
  );
}

function SessionRow({ sess, onClick }: { sess: any; onClick: () => void }) {
  const statusIcon =
    sess.status === "completed" ? (
      <CheckCircle2 size={13} strokeWidth={1.8} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
    ) : sess.status === "failed" ? (
      <XCircle size={13} strokeWidth={1.8} className="text-rose-500 dark:text-rose-400 shrink-0" />
    ) : (
      <RefreshCw size={13} strokeWidth={1.8} className="text-amber-500 dark:text-amber-400 animate-spin shrink-0" />
    );

  return (
    <div
      onClick={onClick}
      className="
        group flex items-center gap-3 px-5 py-3.5 cursor-pointer
        hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18]
        transition-colors duration-150
      "
    >
      {statusIcon}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] truncate">
          {sess.title}
        </p>
        {sess.initialPrompt && (
          <p className="text-[11px] text-[#B0B0A8] dark:text-[#4A4A44] truncate mt-0.5">
            {sess.initialPrompt}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63]">
          {new Date(sess.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
        </p>
      </div>
      <ArrowRight
        size={13}
        strokeWidth={1.8}
        className="text-[#B0B0A8] dark:text-[#4A4A44] opacity-0 group-hover:opacity-100 group-hover:text-[#4F9CF9] transition-all duration-150 shrink-0"
      />
    </div>
  );
}

function ConnectorRow({ label, icon: Icon, linked, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18]
        transition-colors duration-150
      "
    >
      <div className={`
        w-7 h-7 rounded-md flex items-center justify-center shrink-0
        ${linked
          ? "bg-[#4F9CF9]/10 dark:bg-[#4F9CF9]/15"
          : "bg-[#F0F0EC] dark:bg-[#1E1E1C]"
        }
      `}>
        <Icon
          size={14}
          strokeWidth={1.8}
          className={linked ? "text-[#4F9CF9]" : "text-[#B0B0A8] dark:text-[#4A4A44]"}
        />
      </div>
      <span className="flex-1 text-left text-[12px] font-medium text-[#3A3A36] dark:text-[#C8C7BF]">
        {label}
      </span>
      <span className={`
        text-[10px] font-semibold px-2 py-0.5 rounded-full
        ${linked
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-[#F0F0EC] dark:bg-[#1E1E1C] text-[#B0B0A8] dark:text-[#4A4A44]"
        }
      `}>
        {linked ? "Linked" : "Offline"}
      </span>
    </button>
  );
}