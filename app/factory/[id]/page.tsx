"use client"

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  X, Terminal, RefreshCw, Github, Plus, WifiOff,
  CheckCircle2, AlertCircle, BookOpen, FileText,
  Layout, ExternalLink, ChevronRight
} from "lucide-react";
import DashboardLayout from "../../dashboard_layout";
import { useSoftwareFactory } from "../../lib/softwareFactoryClient";
import { TeamVisualization } from "../../../components/TeamVisualization";
import { NotionRenderer } from 'react-notion-x';
import 'react-notion-x/src/styles.css';

// ─── Notion viewer ────────────────────────────────────────────────────────────

function NativeNotionViewer({ url }: { url: string }) {
  const [recordMap, setRecordMap] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

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
  const { id }    = useParams();
  const router    = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const {
    isRunning, isAwaitingApproval, approvalMessage, currentPhase, logs, docs, repoUrl, result, error,
    connectToSession, isConnected, resume, startPipeline, approve
  } = useSoftwareFactory({ token: accessToken });

  const [inputMessage, setInputMessage]       = useState("");
  const [isProcessing, setIsProcessing]       = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [approving, setApproving]             = useState(false);
  const [isIframed, setIsIframed]             = useState(false);
  const logsRef = useRef<HTMLDivElement | null>(null);

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
    .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
    
  const activeRepoUrl = repoUrl || result?.repoUrl;

  useEffect(() => {
    if (!selectedArtifact && allDocs.length > 0) setSelectedArtifact(allDocs[0]);
  }, [allDocs.length, selectedArtifact]);

  useEffect(() => {
    if (accessToken && id) connectToSession(id as string);
  }, [accessToken, id, connectToSession]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const handleApprove = async () => {
    setApproving(true);
    try { await approve(); } catch (e) { console.error(e); }
    finally { setApproving(false); }
  };

  const sessionShort = typeof id === "string" ? id.substring(0, 8) : "—";
  const isDone       = !isRunning && (result || error || (!isConnected && logs.length > 0));

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
    if (log.includes("🧑 PROMPT"))  return "text-[#4F9CF9]";
    if (log.includes("🤖 AGENTE"))  return "text-violet-600 dark:text-violet-400";
    if (log.includes("✅"))         return "text-emerald-600 dark:text-emerald-400";
    if (log.includes("PAUSA"))      return "text-amber-600 dark:text-amber-400 font-bold";
    if (log.includes("FASE"))       return "text-[#1A1A18] dark:text-[#F0EFE9] font-semibold";
    return "text-[#5C5C56] dark:text-[#8B8B85]";
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5 pb-6" style={{ height: 'calc(100vh - 80px)' }}>

        {/* ── Approval Overlay ── */}
        {isAwaitingApproval && !isIframed && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-500">
             <div className="bg-white/80 dark:bg-[#1A1A18]/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-6 max-w-lg">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                   <AlertCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">Revisión Humana Requerida</p>
                   <p className="text-[12px] text-[#8B8B85] dark:text-[#6B6B63] truncate">{approvalMessage}</p>
                </div>
                <button
                   onClick={handleApprove}
                   disabled={approving}
                   className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-black transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                   {approving ? <RefreshCw size={14} className="animate-spin" /> : <ChevronRight size={16} />}
                   APROBAR Y CONTINUAR
                </button>
             </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
              Ejecución multi-agente
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

        {/* ── Team strip ── */}
        <div className="shrink-0">
          <TeamVisualization activePhase={computedPhase} />
        </div>

        {/* ── 2-column: Logs + Artifacts ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 min-h-0 flex-1">

          {/* Logs panel */}
          <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] overflow-hidden min-h-0">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
              <div className="flex items-center gap-2">
                <Terminal size={13} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                  Pipeline log
                </span>
              </div>
              {result && <CheckCircle2 size={13} strokeWidth={2} className="text-emerald-500 dark:text-emerald-400" />}
              {error  && <AlertCircle  size={13} strokeWidth={2} className="text-rose-500 dark:text-rose-400" />}
              {isAwaitingApproval && <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                 <AlertCircle size={10} /> Awaiting Approval
              </div>}
            </div>

            {/* Log lines */}
            <div
              ref={logsRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 font-mono text-[11px] leading-relaxed min-h-0"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,139,133,0.2) transparent" }}
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44]">
                  <RefreshCw size={16} strokeWidth={1.8} className="animate-spin" />
                  <span className="text-[11px]">Sincronizando cluster…</span>
                </div>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className={`${logClass(log)} leading-relaxed`}>
                    {log.replace(/\[🧑 PROMPT\]|\[🤖 AGENTE\]|\[✅\]/g, "").trim()}
                  </p>
                ))
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
                    className="
                      flex-1 h-9 px-3 rounded-lg text-[12px]
                      bg-[#F7F7F5] dark:bg-[#1A1A18]
                      border border-[#E8E8E4] dark:border-[#2A2A26]
                      text-[#1A1A18] dark:text-[#F0EFE9]
                      placeholder:text-[#C8C7BF] dark:placeholder:text-[#3A3A36]
                      focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
                      transition-all duration-150
                    "
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

          {/* Artifacts panel */}
          <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] overflow-hidden min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] shrink-0">
              <BookOpen size={13} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
              <span className="text-[11px] font-semibold text-[#8B8B85] dark:text-[#6B6B63] uppercase tracking-widest">
                Artefactos
              </span>
            </div>

            {/* Doc list */}
            <div className="shrink-0 border-b border-[#E8E8E4] dark:border-[#252522] overflow-y-auto" style={{ maxHeight: 120 }}>
              {allDocs.length === 0 ? (
                <div className="py-5 flex flex-col items-center gap-2 text-[#B0B0A8] dark:text-[#4A4A44]">
                  <FileText size={14} strokeWidth={1.6} />
                  <p className="text-[11px]">Sin documentos aún…</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {allDocs.map((doc, idx) => {
                    const active = selectedArtifact?.url === doc.url;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedArtifact(doc)}
                        className={`
                          w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                          transition-colors duration-150
                          ${active
                            ? "bg-[#4F9CF9]/10 dark:bg-[#4F9CF9]/15 text-[#4F9CF9]"
                            : "text-[#5C5C56] dark:text-[#8B8B85] hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]"
                          }
                        `}
                      >
                        <FileText size={12} strokeWidth={1.8} className="shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                          {doc.title || `Documento ${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Doc preview */}
            <div className="flex-1 overflow-y-auto min-h-0 p-3">
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

            {/* Repo link & CodeSandbox */}
            {isDone && activeRepoUrl && (
              <div className="border-t border-[#E8E8E4] dark:border-[#252522] shrink-0 min-h-[250px] bg-[#1a1a2e] flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-[#F7F7F5] dark:bg-[#1A1A18] border-b border-[#E8E8E4] dark:border-[#252522]">
                  <span className="text-[11px] font-semibold text-[#8B8B85] flex items-center gap-2">
                    <Github size={12} /> CodeSandbox Viewer
                  </span>
                  <button
                    onClick={() => window.open(activeRepoUrl, "_blank")}
                    className="text-[10px] bg-[#4F9CF9] text-white px-2 py-1 rounded hover:bg-[#3D8EE8] transition-colors"
                  >
                    Abrir Externo
                  </button>
                </div>
                {activeRepoUrl.includes("github.com") ? (
                  <iframe 
                    src={`https://codesandbox.io/embed/github/${activeRepoUrl.split('github.com/')[1].replace(/\.git$/, '')}?fontsize=14&hidenavigation=1&theme=dark`}
                    className="w-full flex-1 border-0"
                    title="CodeSandbox"
                    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-[11px] text-[#8B8B85]">Repositorio no soportado para CodeSandbox nativo.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Claw3D 3D Engine iframe ── */}
        <div className="flex flex-col rounded-xl border border-[#E8E8E4] dark:border-[#252522] overflow-hidden shrink-0" style={{ height: 800 }}>
          {/* iframe header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E4] dark:border-[#252522] bg-white dark:bg-[#141413] shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[12px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">
                Claw3D Virtual Office
              </p>
            </div>
          </div>

          <div className="flex-1 relative bg-[#1a1a2e] dark:bg-[#0D0D1A]">
            {/* Fallback visible behind the iframe when Claw3D is offline */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pointer-events-none select-none z-0">
              <div className="w-12 h-12 rounded-xl bg-[#252540] flex items-center justify-center text-2xl">🏢</div>
              <div>
                <p className="text-[13px] font-semibold text-[#6B6B8A]">Oficina 3D no disponible</p>
                <p className="text-[11px] text-[#4A4A64] mt-1 max-w-xs">
                  Inicia Claw3D en el puerto 3001 para ver la oficina virtual
                </p>
                <code className="mt-2 inline-block text-[10px] bg-[#1E1E3A] text-[#4F9CF9] px-3 py-1.5 rounded-lg font-mono">
                  npm run dev -- --p 3001
                </code>
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


      </div>
    </DashboardLayout>
  );
}