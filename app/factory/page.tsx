'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
  Rocket, FileText, Upload, X, Sparkles, Loader2,
  ChevronRight, Users, Code2, TestTube2, BookOpen,
  Server, Layers, ShieldCheck, Brain, AlertCircle, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../dashboard_layout';

// ─── Config maps ─────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, any> = {
  requirements_agent:  ShieldCheck,
  architecture_agent:  Layers,
  development_agent:   Code2,
  qa_agent:            TestTube2,
  documentation_agent: BookOpen,
  devops_agent:        Server,
};

const AGENT_ACCENT: Record<string, { dot: string; bg: string; text: string }> = {
  requirements_agent:  { dot: "bg-emerald-500", bg: "bg-emerald-500/8 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  architecture_agent:  { dot: "bg-[#4F9CF9]",   bg: "bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/10",   text: "text-[#4F9CF9]" },
  development_agent:   { dot: "bg-amber-500",    bg: "bg-amber-500/8 dark:bg-amber-500/10",    text: "text-amber-600 dark:text-amber-400" },
  qa_agent:            { dot: "bg-violet-500",   bg: "bg-violet-500/8 dark:bg-violet-500/10",  text: "text-violet-600 dark:text-violet-400" },
  documentation_agent: { dot: "bg-cyan-500",     bg: "bg-cyan-500/8 dark:bg-cyan-500/10",      text: "text-cyan-600 dark:text-cyan-400" },
  devops_agent:        { dot: "bg-rose-500",      bg: "bg-rose-500/8 dark:bg-rose-500/10",      text: "text-rose-600 dark:text-rose-400" },
};

const AGENT_NAMES: Record<string, string> = {
  requirements_agent:  'Advisor Agent',
  architecture_agent:  'Architect Agent',
  development_agent:   'Developer Agent',
  qa_agent:            'QA Agent',
  documentation_agent: 'Docs Agent',
  devops_agent:        'DevOps Agent',
};

const COMPLEXITY_CONFIG = {
  low:    { label: 'Baja complejidad',  cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
  medium: { label: 'Media complejidad', cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  high:   { label: 'Alta complejidad',  cls: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" },
};

interface ProjectBrief {
  title: string;
  summary: string;
  prompt: string;
  agents: { role: string; task: string }[];
  tags: string[];
  complexity: 'low' | 'medium' | 'high';
  estimatedPhases: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FactoryInputPage() {
  const router      = useRouter();
  const { data: session } = useSession();
  const { sessions, setSessions, refreshSessions } = useSidebar();
  const accessToken = (session as any)?.accessToken;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText]         = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [brief, setBrief]       = useState<ProjectBrief | null>(null);
  const [error, setError]       = useState('');
  const [step, setStep]         = useState<'input' | 'brief'>('input');

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === 'application/pdf') setFile(selected);
  };

  const handleAnalyze = async () => {
    if (!text.trim() && !file) return;
    setAnalyzing(true);
    setError('');
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      if (text.trim()) fd.append('text', text);
      const resp = await fetch('/api/parse-document', { method: 'POST', body: fd });
      const data = await resp.json();
      if (!resp.ok || data.error) throw new Error(data.error || 'Error al analizar');
      setBrief(data.brief);
      setStep('brief');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLaunch = async () => {
    if (!brief) return;
    setLaunching(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const resp = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ prompt: brief.prompt, title: brief.title, agentTasks: brief.agents }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const newSession = {
          sessionId: data.session_id,
          title: brief.title || 'Nueva sesión',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        if (!sessions.some((s) => s?.sessionId === data.session_id)) {
          setSessions([newSession, ...sessions]);
        }
        await refreshSessions();
        router.push(`/factory/${data.session_id}`);
      } else {
        throw new Error('Error al lanzar el pipeline');
      }
    } catch (e: any) {
      setError(e.message);
      setLaunching(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">

        {/* ── Header ── */}
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
            {step === 'input' ? 'Describe tu proyecto' : brief?.title}
          </h1>
          <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] leading-relaxed">
            {step === 'input'
              ? 'Adjunta un PDF o describe tu proyecto. Los agentes lo analizarán y mostrarán el plan antes de ejecutar.'
              : brief?.summary}
          </p>
        </div>

        {/* ══ STEP: INPUT ══════════════════════════════════════════════════════ */}
        {step === 'input' && (
          <div className="space-y-5">

            {/* PDF drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative rounded-xl border-2 border-dashed p-6 cursor-pointer
                transition-colors duration-150 text-center
                ${dragOver
                  ? 'border-[#4F9CF9] bg-[#4F9CF9]/5 dark:bg-[#4F9CF9]/8'
                  : file
                    ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5'
                    : 'border-[#E8E8E4] dark:border-[#252522] hover:border-[#4F9CF9]/50 dark:hover:border-[#4F9CF9]/40 bg-[#FAFAF8] dark:bg-[#1A1A18]'
                }
              `}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />

              {file ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={16} strokeWidth={1.8} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[13px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] truncate">{file.name}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB · PDF listo para análisis
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1.5 rounded-lg text-[#B0B0A8] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-150 shrink-0"
                  >
                    <X size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F0EC] dark:bg-[#252522] flex items-center justify-center mx-auto">
                    <Upload size={16} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#3A3A36] dark:text-[#C8C7BF]">
                      Arrastra tu brief en PDF aquí
                    </p>
                    <p className="text-[11px] text-[#B0B0A8] dark:text-[#4A4A44] mt-0.5">
                      o haz clic para seleccionar · Solo archivos .pdf
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#F0F0EC] dark:bg-[#1E1E1C]" />
              <span className="text-[10px] font-semibold text-[#B0B0A8] dark:text-[#4A4A44] uppercase tracking-widest">
                o describe tu proyecto
              </span>
              <div className="flex-1 h-px bg-[#F0F0EC] dark:bg-[#1E1E1C]" />
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                placeholder={`Como PM, describe qué necesitas construir:\n\nEj: Necesitamos un sistema de reservas para restaurantes con panel de administración, app móvil para clientes y notificaciones en tiempo real...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="
                  w-full px-4 py-3.5 rounded-xl text-[13px] leading-relaxed resize-none min-h-[180px]
                  bg-[#F7F7F5] dark:bg-[#1A1A18]
                  border border-[#E8E8E4] dark:border-[#2A2A26]
                  text-[#1A1A18] dark:text-[#F0EFE9]
                  placeholder:text-[#C8C7BF] dark:placeholder:text-[#3A3A36]
                  focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
                  transition-all duration-150
                "
              />
              {text && (
                <button
                  onClick={() => setText('')}
                  className="absolute top-3 right-3 p-1 rounded-lg text-[#B0B0A8] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9] hover:bg-[#EFEFEC] dark:hover:bg-[#252522] transition-colors duration-150"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              )}
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="
                  px-4 py-2 rounded-lg text-[12px] font-medium
                  text-[#8B8B85] dark:text-[#6B6B63]
                  hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C]
                  hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
                  transition-colors duration-150
                "
              >
                Cancelar
              </button>

              <button
                onClick={handleAnalyze}
                disabled={(!text.trim() && !file) || analyzing}
                className="
                  h-9 px-5 rounded-lg flex items-center gap-2 text-[12px] font-medium
                  bg-[#4F9CF9] hover:bg-[#3D8EE8]
                  text-white shadow-sm transition-colors duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {analyzing ? (
                  <>
                    <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                    Analizando…
                  </>
                ) : (
                  <>
                    <Sparkles size={13} strokeWidth={1.8} />
                    Analizar proyecto
                    <ChevronRight size={13} strokeWidth={1.8} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP: BRIEF ══════════════════════════════════════════════════════ */}
        {step === 'brief' && brief && (
          <div className="space-y-6">

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {brief.complexity && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${COMPLEXITY_CONFIG[brief.complexity].cls}`}>
                  {COMPLEXITY_CONFIG[brief.complexity].label}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#252522] text-[#5C5C56] dark:text-[#8B8B85]">
                {brief.estimatedPhases} fases
              </span>
              {brief.tags?.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold border bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/10 border-[#4F9CF9]/20 text-[#4F9CF9]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Agent plan */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} strokeWidth={1.8} className="text-[#8B8B85] dark:text-[#6B6B63]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
                  Plan por agente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brief.agents?.map((a) => {
                  const Icon   = AGENT_ICONS[a.role] || Brain;
                  const accent = AGENT_ACCENT[a.role] || { dot: "bg-slate-400", bg: "bg-[#F7F7F5] dark:bg-[#1A1A18]", text: "text-[#5C5C56] dark:text-[#8B8B85]" };
                  const name   = AGENT_NAMES[a.role] || a.role;
                  return (
                    <div
                      key={a.role}
                      className={`
                        flex items-start gap-3 p-4 rounded-xl
                        border border-[#E8E8E4] dark:border-[#252522]
                        bg-white dark:bg-[#141413]
                      `}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent.bg}`}>
                        <Icon size={14} strokeWidth={1.8} className={accent.text} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-semibold ${accent.text}`}>{name}</p>
                        <p className="text-[12px] text-[#5C5C56] dark:text-[#8B8B85] mt-1 leading-relaxed">
                          {a.task}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt preview */}
            <details className="group">
              <summary className="
                cursor-pointer select-none list-none
                flex items-center gap-2
                text-[11px] font-semibold uppercase tracking-widest
                text-[#B0B0A8] dark:text-[#4A4A44]
                hover:text-[#5C5C56] dark:hover:text-[#8B8B85]
                transition-colors duration-150
              ">
                <ChevronRight size={12} strokeWidth={2} className="transition-transform duration-150 group-open:rotate-90" />
                Ver prompt completo del pipeline
              </summary>
              <div className="
                mt-3 p-4 rounded-xl
                bg-[#F7F7F5] dark:bg-[#1A1A18]
                border border-[#E8E8E4] dark:border-[#252522]
                text-[11px] text-[#5C5C56] dark:text-[#8B8B85]
                font-mono leading-relaxed whitespace-pre-wrap
              ">
                {brief.prompt}
              </div>
            </details>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-[#F0F0EC] dark:border-[#1E1E1C]">
              <button
                onClick={() => { setStep('input'); setBrief(null); setError(''); }}
                className="
                  px-4 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2
                  text-[#8B8B85] dark:text-[#6B6B63]
                  hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C]
                  hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]
                  transition-colors duration-150
                "
              >
                <X size={13} strokeWidth={1.8} />
                Editar brief
              </button>

              <button
                onClick={handleLaunch}
                disabled={launching}
                className="
                  h-9 px-5 rounded-lg flex items-center gap-2 text-[12px] font-medium
                  bg-[#4F9CF9] hover:bg-[#3D8EE8]
                  text-white shadow-sm transition-colors duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {launching ? (
                  <>
                    <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                    Lanzando equipo…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} strokeWidth={2} />
                    Activar equipo de agentes
                    <Rocket size={13} strokeWidth={1.8} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
      <AlertCircle size={14} strokeWidth={1.8} className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
      <p className="text-[12px] font-medium text-rose-600 dark:text-rose-400 leading-relaxed">{message}</p>
    </div>
  );
}
