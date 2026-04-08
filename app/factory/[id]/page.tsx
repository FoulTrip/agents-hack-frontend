"use client"



import React, { useEffect, useRef, useState } from "react";

import { useSession } from "next-auth/react";

import { useParams, useRouter } from "next/navigation";

import {
  X, Terminal, RefreshCw, Github, Plus, WifiOff,
  CheckCircle2, AlertCircle, BookOpen, FileText,
  Layout, ExternalLink, ChevronRight,
  Building2, User, Bot, Check, XCircle, Clock, PauseCircle, Info, CircleDot
} from "lucide-react";

import DashboardLayout from "../../dashboard_layout";

import { useSoftwareFactory } from "../../lib/softwareFactoryClient";

import { TeamVisualization } from "../../../components/TeamVisualization";

import { NotionRenderer } from 'react-notion-x';

import 'react-notion-x/src/styles.css';



// ─── Notion viewer ────────────────────────────────────────────────────────────



function NativeNotionViewer({ url }: { url: string }) {

  const [recordMap, setRecordMap] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    setLoading(true);

    setError("");

    fetch(`/api/notion?url=${encodeURIComponent(url)}`)

      .then(r => r.json())

      .then(data => {

        if (data.error) throw new Error(data.error);

        setRecordMap(data);

      })

      .catch(e => setError(e.message))

      .finally(() => setLoading(false));

  }, [url]);



  if (loading) return (

    <div className="h-full flex flex-col items-center justify-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44]">

      <RefreshCw size={16} strokeWidth={1.8} className="animate-spin" />

      <span className="text-[11px]">Renderizando documento…</span>

    </div>

  );



  if (error) return (

    <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">

      <AlertCircle size={16} strokeWidth={1.8} className="text-rose-500 dark:text-rose-400" />

      <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] max-w-xs">{error}</p>

      <button

        onClick={() => window.open(url, "_blank")}

        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#4F9CF9] text-white hover:bg-[#3D8EE8] transition-colors duration-150"

      >

        <ExternalLink size={12} strokeWidth={1.8} /> Abrir en Notion

      </button>

    </div>

  );



  if (!recordMap) return null;



  return (

    <div className="h-full w-full overflow-y-auto">

      <style dangerouslySetInnerHTML={{ __html: `.notion, .notion-page { background: transparent !important; font-size: 13px; } .notion-collection-header { display: none; }` }} />

      <NotionRenderer recordMap={recordMap} fullPage darkMode={false} disableHeader />

    </div>

  );

}



// ─── Page ─────────────────────────────────────────────────────────────────────



export default function FactoryStatusPage() {

  const { id } = useParams();

  const router = useRouter();

  const { data: session } = useSession();

  const accessToken = (session as any)?.accessToken;



  const {
    isRunning, isAwaitingApproval, approvalMessage, currentPhase, logs, docs, repoUrl, repoRefreshAt, result, error,
    connectToSession, isConnected, resume, startPipeline, approve, reject
  } = useSoftwareFactory({ token: accessToken });



  const [inputMessage, setInputMessage] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [agents, setAgents] = useState<any[]>([]);

  // Fetch configured agents for this session
  useEffect(() => {
    if (accessToken && id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/agents/session/${id}`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch(err => console.error("Error fetching agents:", err));
    }
  }, [accessToken, id]);

  const [isIframed, setIsIframed] = useState(false);
  const [stackblitzLoading, setStackblitzLoading] = useState(false);
  const [stackblitzFrameKey, setStackblitzFrameKey] = useState(0);

  const logsRef = useRef<HTMLDivElement | null>(null);
  const stackblitzLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  useEffect(() => {

    setIsIframed(window.self !== window.top);

  }, []);



  // Compute active phase from logs

  const computedPhase = React.useMemo(() => {

    if (result) return 4;

    if (currentPhase) return currentPhase;

    for (let i = logs.length - 1; i >= 0; i--) {

      const t = logs[i].toLowerCase();

      if (t.includes("fase 3") || t.includes("developer agent")) return 3;

      if (t.includes("fase 2") || t.includes("architect agent")) return 2;

      if (t.includes("fase 1") || t.includes("advisor agent")) return 1;

    }

    return logs.length > 0 ? 1 : null;

  }, [currentPhase, logs, result]);



  const allDocs = [...(docs || []), ...(result?.notionDocs || result?.docs || [])]

    .filter((v, i, a) => a.findIndex(t => (t.id && t.id === v.id) || (t.url && t.url === v.url)) === i);



  const normalizeRepoUrl = (value?: string | null) => {
    const raw = (value || "").trim().replace(/^['"]+|['"]+$/g, "").replace(/\.git$/, "").replace(/\/$/, "");
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const normalized = raw
        .replace("http://", "https://")
        .replace("www.github.com/", "github.com/")
        .replace("https://www.github.com/", "https://github.com/");
      const match = normalized.match(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/i);
      return match ? normalized : null;
    }
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw)) return null;
    return `https://github.com/${raw}`;
  };

  const activeRepoUrl =
    normalizeRepoUrl(repoUrl) ||
    normalizeRepoUrl(result?.repoUrl) ||
    normalizeRepoUrl(result?.repoFullName);

  const stackblitzRepoSlug = React.useMemo(() => {
    if (!activeRepoUrl) return null;
    const match = activeRepoUrl.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i);
    if (!match?.[1]) return null;
    return match[1].replace(/\.git$/, "").replace(/\/$/, "");
  }, [activeRepoUrl]);



  useEffect(() => {

    if (!selectedArtifact && allDocs.length > 0) setSelectedArtifact(allDocs[0]);

  }, [allDocs.length, selectedArtifact]);



  useEffect(() => {

    if (accessToken && id) connectToSession(id as string);

  }, [accessToken, id, connectToSession]);



  useEffect(() => {

    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;

  }, [logs]);

  useEffect(() => {
    if (!stackblitzRepoSlug) return;
    setStackblitzLoading(true);
    setStackblitzFrameKey((prev) => prev + 1);
  }, [stackblitzRepoSlug, repoRefreshAt]);

  useEffect(() => {
    return () => {
      if (stackblitzLoadTimeoutRef.current) clearTimeout(stackblitzLoadTimeoutRef.current);
    };
  }, []);



  const handleApprove = async () => {

    setApproving(true);

    // Ocultar overlay optimistamente mientras se procesa

    try { await approve(); } catch (e) { console.error(e); }

    // El overlay se cierra cuando el WS recibe el mensaje 'approved'

    // Si falla la red, lo reactivamos

    finally {

      // Damos 3s para que llegue el WS approved; si no, dejamos el estado al WS

      setTimeout(() => setApproving(false), 3000);

    }

  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setRejecting(true);
    try { 
      await reject(feedback); 
      setFeedback(""); 
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRejecting(false), 3000);
    }
  };

  const sessionShort = typeof id === "string" ? id.substring(0, 8) : "—";

  const isDone = !isRunning && (result || error || (!isConnected && logs.length > 0));



  // Status indicator

  const statusConfig = isAwaitingApproval

    ? { dot: "bg-amber-500 animate-pulse", label: "Esperando aprobación" }

    : isRunning

      ? { dot: "bg-emerald-500 animate-pulse", label: "Ejecutando" }

      : result

        ? { dot: "bg-[#4F9CF9]", label: "Completado" }

        : error

          ? { dot: "bg-rose-500", label: "Error detectado" }

          : { dot: "bg-[#B0B0A8] dark:bg-[#4A4A44]", label: isConnected ? "Conectado" : "Sincronizando…" };



  // Log line classifier
  const logClass = (log: string) => {
    if (log.startsWith("FASE —") || (log.includes("FASE") && !log.includes("🤖"))) 
      return "text-[#1A1A18] dark:text-[#F0EFE9] font-bold text-[14px] mt-6 mb-2 border-b border-[#E8E8E4] dark:border-[#252522] pb-1";
    if (log.startsWith("🧑 PROMPT") || log.includes("🧑 PROMPT")) 
      return "text-[#4F9CF9] font-semibold bg-[#4F9CF9]/5 px-3 py-2 rounded-md border border-[#4F9CF9]/10 my-2";
    if (log.includes("🤖 AGENTE") || log.startsWith("🤖")) 
      return "text-violet-600 dark:text-violet-400 font-medium py-1";
    if (log.startsWith("✅")) 
      return "text-emerald-600 dark:text-emerald-400 font-semibold py-1";
    if (log.startsWith("❌")) 
      return "text-rose-500 dark:text-rose-400 font-bold bg-rose-500/10 px-3 py-2 rounded-md border border-rose-500/20 my-1";
    if (log.startsWith("⏳")) 
      return "text-amber-500 dark:text-amber-400 py-1";
    if (log.includes("PAUSA")) 
      return "text-amber-600 dark:text-amber-500 font-bold bg-amber-500/10 px-3 py-2 rounded-md border border-amber-500/20 my-1";
    if (log.includes("[Error]") || log.includes("❌")) 
      return "text-rose-500 dark:text-rose-400 font-medium py-1";
    return "text-[#5C5C56] dark:text-[#A0A09A] py-0.5";
  };



  return (

    <DashboardLayout>

      <div className="flex flex-col gap-5 pb-6">



        {/* Contenido principal se moverá aquí */}



        {/* ── Header ── */}

        <div className="flex items-center justify-between shrink-0">

          <div className="space-y-1">

            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">

              Ejecución de desarollo
            </h1>

            <div className="flex items-center gap-2 flex-wrap">

              <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig.dot}`} />

              <span className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63]">

                {statusConfig.label}

              </span>

              <span className="text-[#E8E8E4] dark:text-[#252522]">·</span>

              <span className="text-[11px] font-mono text-[#B0B0A8] dark:text-[#4A4A44]">

                {sessionShort}

              </span>



              {isRunning && !isConnected && logs.length > 0 && (

                <button

                  onClick={() => resume(id as string)}

                  className="ml-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors duration-150"

                >

                  <RefreshCw size={10} strokeWidth={2} className="animate-spin" /> Reanudar

                </button>

              )}

              {!isConnected && isRunning && (

                <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">

                  <WifiOff size={11} strokeWidth={1.8} /> Reconectando…

                </span>

              )}

            </div>

          </div>



          <div className="flex items-center gap-2 shrink-0">

            {!isRunning && (

              <button

                onClick={() => router.push("/factory")}

                className="h-9 px-4 rounded-lg flex items-center gap-2 text-[12px] font-medium bg-[#4F9CF9] hover:bg-[#3D8EE8] text-white transition-colors duration-150 shadow-sm"

              >

                <Plus size={14} strokeWidth={2} /> Nuevo proyecto

              </button>

            )}

            <button

              onClick={() => router.push("/dashboard")}

              className="h-9 w-9 flex items-center justify-center rounded-lg text-[#8B8B85] dark:text-[#6B6B63] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9] border border-[#E8E8E4] dark:border-[#252522] transition-colors duration-150"

            >

              <X size={16} strokeWidth={1.8} />

            </button>

          </div>

        </div>



        {/* ── Claw3D 3D Engine iframe ── */}
        <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] overflow-hidden shrink-0" style={{ height: 600 }}>
          <div className="flex-1 relative bg-[#1a1a2e] dark:bg-[#0D0D1A]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pointer-events-none select-none z-0">
              <div className="w-12 h-12 rounded-xl bg-[#252540] flex items-center justify-center text-indigo-400">
                <Building2 size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#6B6B8A]">Oficina 3D no disponible</p>
                <p className="text-[11px] text-[#4A4A64] mt-1 max-w-xs">Inicia Claw3D en el puerto 3001 para ver la oficina virtual</p>
              </div>
            </div>
            <iframe
              src={`http://localhost:3001/office?sessionId=${id}&userId=${session?.user?.id}&token=${accessToken}`}
              className="w-full h-full border-none relative z-10"
              title="Claw3D Virtual Simulator"
              allow="clipboard-read; clipboard-write; microphone; camera"
            />
          </div>
        </div>

        {/* ── Team strip ── */}

        <div className="shrink-0">

          <TeamVisualization activePhase={computedPhase} agents={agents} />

        </div>



        {/* ── Contenido Principal (Aprobación, Logs, Artefactos) ── */}

        <div className="flex flex-col gap-4 min-h-0 flex-1">

          {/* El panel de aprobación se movió a la derecha de los logs */}

          {/* ── Columna de Trabajo (Logs + Artefactos) ── */}
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pb-10" style={{ scrollbarWidth: 'auto' }}>
            
            {/* Fila de Logs y Aprobación */}
            <div className="flex flex-col xl:flex-row gap-4 shrink-0">
              {/* Logs panel */}
              <div className="flex-1 flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] overflow-hidden min-w-0" style={{ height: 450 }}>
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal size={13} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                  <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                    Pipeline log
                  </span>
                </div>
                {result && <CheckCircle2 size={13} strokeWidth={2} className="text-emerald-500 dark:text-emerald-400" />}
                {error && <AlertCircle size={13} strokeWidth={2} className="text-rose-500 dark:text-rose-400" />}
                {isAwaitingApproval && <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                  <AlertCircle size={10} /> Awaiting Approval
                </div>}
              </div>

              {/* Log lines */}
              <div
                ref={logsRef}
                className="flex-1 overflow-y-auto px-5 py-4 font-mono text-[13px] leading-relaxed min-h-0 space-y-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,139,133,0.2) transparent" }}
              >
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44] font-sans">
                    <RefreshCw size={16} strokeWidth={1.8} className="animate-spin" />
                    <span className="text-[13px]">Sincronizando cluster…</span>
                  </div>
                ) : (
                  logs.map((log, i) => {
                    const cleanLog = log
                      .replace(/\[🧑 PROMPT\]/g, "PROMPT:")
                      .replace(/\[🤖 AGENTE\]/g, "AGENTE:")
                      .replace(/\[✅\]/g, "ÉXITO:")
                      .replace(/[✅❌⏳🧑🤖🏢]/g, "")
                      .trim();
                    if (!cleanLog) return null;

                    let Icon = CircleDot;
                    let iconColor = "text-[#8B8B85]";
                    if (log.startsWith("FASE —") || (log.includes("FASE") && !log.includes("🤖"))) { Icon = Info; iconColor = "text-[#1A1A18] dark:text-[#F0EFE9]"; }
                    else if (log.startsWith("🧑 PROMPT") || log.includes("🧑 PROMPT")) { Icon = User; iconColor = "text-[#4F9CF9]"; }
                    else if (log.includes("🤖 AGENTE") || log.startsWith("🤖")) { Icon = Bot; iconColor = "text-violet-600 dark:text-violet-400"; }
                    else if (log.startsWith("✅")) { Icon = Check; iconColor = "text-emerald-600 dark:text-emerald-400"; }
                    else if (log.startsWith("❌")) { Icon = XCircle; iconColor = "text-rose-500 dark:text-rose-400"; }
                    else if (log.startsWith("⏳")) { Icon = Clock; iconColor = "text-amber-500 dark:text-amber-400"; }
                    else if (log.includes("PAUSA")) { Icon = PauseCircle; iconColor = "text-amber-600 dark:text-amber-500"; }
                    else if (log.includes("[Error]") || log.includes("❌")) { Icon = XCircle; iconColor = "text-rose-500 dark:text-rose-400"; }

                    return (
                      <div key={i} className={`flex items-start gap-2.5 ${logClass(log)}`}>
                        <div className={`mt-[2px] shrink-0 ${iconColor}`}>
                          <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap break-words flex-1">
                          {cleanLog}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              {!result && !error && (
                <div className="px-3 py-3 border-t border-[#E8E8E4] dark:border-[#252522] shrink-0">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!inputMessage.trim() || isProcessing) return;
                      setIsProcessing(true);
                      try { await startPipeline(inputMessage, id as string); setInputMessage(""); }
                      catch (e) { console.error(e); }
                      finally { setIsProcessing(false); }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Añadir requerimientos adicionales…"
                      disabled={isProcessing}
                      className="flex-1 h-9 px-3 rounded-lg text-[12px] bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26] text-[#1A1A18] dark:text-[#F0EFE9] placeholder:text-[#C8C7BF] dark:placeholder:text-[#3A3A36] focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9] transition-all duration-150"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !inputMessage.trim()}
                      className="h-9 px-3 rounded-lg bg-[#4F9CF9] hover:bg-[#3D8EE8] text-white text-[12px] font-medium flex items-center justify-center transition-colors duration-150 disabled:opacity-40"
                    >
                      {isProcessing
                        ? <RefreshCw size={12} strokeWidth={2} className="animate-spin" />
                        : <ChevronRight size={14} strokeWidth={2} />
                      }
                    </button>
                  </form>
                </div>
              )}
              </div>

              {/* Panel de Aprobación Lateral */}
              {isAwaitingApproval && (
                <div className="w-full xl:w-[380px] flex flex-col rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 overflow-hidden shrink-0 animate-in fade-in slide-in-from-right duration-300" style={{ height: 'fit-content' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 bg-amber-500/10">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={13} className="text-amber-600 dark:text-amber-500" />
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                        Aprobación Requerida
                      </span>
                    </div>
                    {approving && <RefreshCw size={12} className="animate-spin text-amber-600" />}
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <p className="text-[12px] text-[#5C5C56] dark:text-[#F0EFE9] leading-relaxed italic">
                      "{approvalMessage || "Revisa los requerimientos y la arquitectura antes de proceder a la generación de código."}"
                    </p>
                    
                    <div className="space-y-2 mt-2">
                      <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-[12px] font-black tracking-wide transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                        {approving 
                          ? <><RefreshCw size={14} className="animate-spin" /> PROCESANDO...</> 
                          : <><CheckCircle2 size={16} /> APROBAR PROYECTO</>}
                      </button>

                      <form onSubmit={handleReject} className="relative mt-2">
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Introduce tus cambios o sugerencias..."
                          className="w-full text-[12px] rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-100 placeholder:text-amber-500/50 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all resize-none p-3 pr-10 min-h-[70px] outline-none"
                          rows={2}
                          disabled={rejecting || approving}
                        />
                        <button
                          type="submit"
                          disabled={!feedback.trim() || rejecting || approving}
                          className="absolute right-2 bottom-2 w-7 h-7 rounded-md bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition-colors flex items-center justify-center shadow-md shadow-amber-500/20"
                        >
                          {rejecting ? <RefreshCw size={12} className="animate-spin" /> : <ChevronRight size={14} strokeWidth={2} />}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Artifacts & Viewer panel */}
            <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] overflow-hidden min-h-[600px] shrink-0">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
                <BookOpen size={13} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                  Artefactos
                </span>
              </div>

              {/* Contenedor dividido para Artefactos y Previewer */}
              <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                {/* Columna de Lista de Documentos */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#E8E8E4] dark:border-[#252522] flex flex-col shrink-0">
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {allDocs.length === 0 ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44]">
                        <FileText size={14} strokeWidth={1.6} />
                        <p className="text-[11px]">Sin documentos aún…</p>
                      </div>
                    ) : (
                      allDocs.map((doc, idx) => {
                        const active = selectedArtifact?.url === doc.url;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedArtifact(doc)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors duration-150 ${active ? "bg-[#4F9CF9]/10 dark:bg-[#4F9CF9]/15 text-[#4F9CF9]" : "text-[#5C5C56] dark:text-[#8B8B85] hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]"}`}
                          >
                            <FileText size={12} strokeWidth={1.8} className="shrink-0" />
                            <span className="text-[11px] font-medium truncate">{doc.title || `Documento ${idx + 1}`}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Columna de Previewer (Notion / Code) */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedArtifact ? (
                      selectedArtifact.content ? (
                        <p className="text-[12px] text-[#5C5C56] dark:text-[#8B8B85] leading-relaxed whitespace-pre-wrap font-mono">
                          {selectedArtifact.content}
                        </p>
                      ) : selectedArtifact.url ? (
                        <NativeNotionViewer url={selectedArtifact.url} />
                      ) : null
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44]">
                        <Layout size={16} strokeWidth={1.6} />
                        <p className="text-[11px]">Selecciona un documento</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* ── Code Viewer Panel ── */}
            <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] overflow-hidden shrink-0 relative" style={{ height: 600 }}>
              {stackblitzRepoSlug && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button 
                    onClick={() => {
                        setStackblitzLoading(true);
                        setStackblitzFrameKey((prev) => prev + 1);
                    }}
                    className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                    title="Recargar visor"
                  >
                    <RefreshCw size={12} />
                  </button>
                  <a 
                    href={`https://stackblitz.com/github/${stackblitzRepoSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                    title="Abrir en StackBlitz"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {stackblitzRepoSlug ? (
                <>
                {stackblitzLoading && (
                  <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 bg-[#09090b]/85 backdrop-blur-sm">
                    <RefreshCw size={16} className="animate-spin text-emerald-400" />
                    <p className="text-[11px] text-white/70">Sincronizando repositorio en StackBlitz...</p>
                  </div>
                )}
                  <iframe
                    key={`${stackblitzRepoSlug}-${repoRefreshAt}-${stackblitzFrameKey}`}
                    src={`https://stackblitz.com/github/${stackblitzRepoSlug}?embed=1&theme=dark&view=editor&repo_refresh=${repoRefreshAt || 0}`}
                    className="w-full h-full border-0 bg-[#09090b]"
                    title="StackBlitz Viewer"
                    onLoad={() => {
                      if (stackblitzLoadTimeoutRef.current) clearTimeout(stackblitzLoadTimeoutRef.current);
                      stackblitzLoadTimeoutRef.current = setTimeout(() => {
                        setStackblitzLoading(false);
                      }, 300);
                    }}
                    allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; xr-spatial-tracking"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#1a1a2e] text-center px-10">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Github size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-[13px] font-medium">Esperando Repositorio</h3>
                    <p className="text-white/40 text-[11px] mt-1 max-w-[250px]">
                      El visor de código se activará automáticamente cuando el Agente de Desarrollo cree el repositorio en GitHub (Fase 3).
                    </p>
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mt-2">
                      <RefreshCw size={10} className="animate-spin text-emerald-400" />
                      <span className="text-[10px] text-white/60">Pipeline en curso...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>

  );

}
