"use client";

import React, { useState } from "react";
import {
  ShieldOff, X, Database, Code2, Target, BookOpen,
  Plus, Check, ChevronDown, ChevronUp, Link
} from "lucide-react";

interface UserGlobalContext {
  id?: string;
  techStack: string[];
  codingStyle?: string;
  namingConventions?: any;
  constraints: string[];
  documentationLinks: string[];
}

interface GovernanceModalProps {
  globalContext: UserGlobalContext | null;
  setGlobalContext: (ctx: UserGlobalContext) => void;
  onClose: () => void;
  onSave: () => void;
}

// ── Tech Stack catalog ──────────────────────────────────────────────────────
const TECH_GROUPS = [
  {
    label: "Frontend",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400",
    items: ["Next.js", "React", "Vue.js", "Nuxt", "SvelteKit", "Astro", "TailwindCSS", "Styled Components"],
  },
  {
    label: "Backend",
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-violet-400",
    items: ["FastAPI", "NestJS", "Express", "Django", "Laravel", "Spring Boot", "Hono", "tRPC"],
  },
  {
    label: "Bases de Datos",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Supabase", "PlanetScale", "Firestore"],
  },
  {
    label: "ORM / BFF",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400",
    items: ["Prisma", "Drizzle ORM", "TypeORM", "Mongoose", "SQLAlchemy", "GraphQL", "REST"],
  },
  {
    label: "Cloud / DevOps",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400",
    items: ["Docker", "Kubernetes", "GitHub Actions", "Vercel", "GCP", "AWS", "Terraform"],
  },
  {
    label: "IA / ML",
    color: "text-pink-500",
    bg: "bg-pink-500/10 border-pink-500/25 text-pink-600 dark:text-pink-400",
    items: ["Google ADK", "LangChain", "OpenAI API", "Vertex AI", "Hugging Face", "Anthropic"],
  },
];

// ── Coding Style presets ────────────────────────────────────────────────────
const CODE_STYLES = [
  {
    id: "clean",
    label: "Clean Code + SOLID",
    desc: "Funciones pequeñas, tipado estricto, nombres descriptivos. Sin magia ni abreviaciones.",
    icon: "✨",
  },
  {
    id: "functional",
    label: "Funcional Puro",
    desc: "Inmutabilidad, funciones puras, composición en lugar de clases. Sin efectos secundarios ocultos.",
    icon: "λ",
  },
  {
    id: "hexagonal",
    label: "Arquitectura Hexagonal",
    desc: "Puertos y adaptadores. Lógica de negocio completamente desacoplada de la infraestructura.",
    icon: "⬡",
  },
  {
    id: "pragmatic",
    label: "Pragmático",
    desc: "Código que funciona, se entiende rápido y es fácil de mantener. Evitar sobreingeniería.",
    icon: "🚀",
  },
  {
    id: "custom",
    label: "Personalizado",
    desc: "Define tu propio estilo con reglas específicas.",
    icon: "✏️",
  },
];

// ── Constraints catalog ─────────────────────────────────────────────────────
const CONSTRAINT_OPTIONS = [
  "No usar librerías sin soporte LTS activo",
  "Todo código debe incluir manejo de errores explícito",
  "Variables en inglés, comentarios en español",
  "Priorizar rendimiento sobre legibilidad solo cuando haya métricas que lo justifiquen",
  "Cero dependencias no auditadas en producción",
  "Toda función debe tener máximo 30 líneas",
  "Prohibido usar `any` en TypeScript",
  "Tests obligatorios antes de PR aprobada",
  "Sin secretos hardcodeados en el código",
  "Preferir tipos explícitos sobre inferencia implícita",
  "Documentar todas las funciones públicas con JSDoc / docstring",
  "Rate limiting obligatorio en todas las APIs públicas",
];

// ── Quick doc links ─────────────────────────────────────────────────────────
const DOC_LINKS = [
  { label: "Next.js Docs", url: "https://nextjs.org/docs" },
  { label: "FastAPI Docs", url: "https://fastapi.tiangolo.com" },
  { label: "Prisma Docs", url: "https://www.prisma.io/docs" },
  { label: "MongoDB Docs", url: "https://www.mongodb.com/docs" },
  { label: "Google ADK", url: "https://google.github.io/adk-docs/" },
  { label: "TailwindCSS", url: "https://tailwindcss.com/docs" },
];

export default function GovernanceModal({
  globalContext,
  setGlobalContext,
  onClose,
  onSave,
}: GovernanceModalProps) {
  const ctx = globalContext ?? {
    techStack: [], codingStyle: "", constraints: [], documentationLinks: [],
  };

  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    const style = ctx.codingStyle || "";
    if (style.includes("SOLID")) return "clean";
    if (style.includes("Funcional") || style.includes("functional")) return "functional";
    if (style.includes("Hexagonal") || style.includes("hexagonal")) return "hexagonal";
    if (style.includes("Pragmático") || style.includes("pragmatic")) return "pragmatic";
    if (style) return "custom";
    return "clean";
  });
  const [customStyle, setCustomStyle] = useState(
    selectedStyleId === "custom" ? ctx.codingStyle || "" : ""
  );
  const [customDocUrl, setCustomDocUrl] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Frontend");

  const toggleTech = (tech: string) => {
    const current = ctx.techStack;
    const updated = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech];
    setGlobalContext({ ...ctx, techStack: updated });
  };

  const selectStyle = (id: string) => {
    setSelectedStyleId(id);
    if (id !== "custom") {
      const preset = CODE_STYLES.find((s) => s.id === id);
      setGlobalContext({ ...ctx, codingStyle: `${preset?.label}: ${preset?.desc}` });
    } else {
      setGlobalContext({ ...ctx, codingStyle: customStyle });
    }
  };

  const toggleConstraint = (rule: string) => {
    const current = ctx.constraints;
    const updated = current.includes(rule)
      ? current.filter((c) => c !== rule)
      : [...current, rule];
    setGlobalContext({ ...ctx, constraints: updated });
  };

  const addDocLink = (url: string) => {
    if (!url.trim() || ctx.documentationLinks.includes(url.trim())) return;
    setGlobalContext({ ...ctx, documentationLinks: [...ctx.documentationLinks, url.trim()] });
    setCustomDocUrl("");
  };

  const removeDocLink = (url: string) => {
    setGlobalContext({ ...ctx, documentationLinks: ctx.documentationLinks.filter((l) => l !== url) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] rounded-2xl border border-[#E8E8E4] dark:border-[#252522] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E4] dark:border-[#252522]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldOff size={15} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">Factory Rules & Governance</h2>
              <p className="text-[11px] text-[#8B8B85]">Define las leyes que todos los agentes deben cumplir.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] rounded-lg text-[#8B8B85] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── 1. Tech Stack ── */}
          <section className="px-6 py-5 space-y-4 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-emerald-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#C8C7BF]">
                Ecosistema Tecnológico
              </h3>
              {ctx.techStack.length > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {ctx.techStack.length} seleccionadas
                </span>
              )}
            </div>

            {/* Selected chips */}
            {ctx.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ctx.techStack.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTech(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-colors"
                  >
                    <Check size={9} />
                    {t}
                    <X size={9} />
                  </button>
                ))}
              </div>
            )}

            {/* Groups */}
            <div className="space-y-2">
              {TECH_GROUPS.map((group) => (
                <div key={group.label} className="rounded-xl border border-[#E8E8E4] dark:border-[#252522] overflow-hidden">
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F7F7F5] dark:bg-[#1A1A18] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] transition-colors"
                  >
                    <span className={`text-[11px] font-bold ${group.color}`}>{group.label}</span>
                    {expandedGroup === group.label ? <ChevronUp size={13} className="text-[#8B8B85]" /> : <ChevronDown size={13} className="text-[#8B8B85]" />}
                  </button>
                  {expandedGroup === group.label && (
                    <div className="p-3 flex flex-wrap gap-1.5 bg-white dark:bg-[#141413]">
                      {group.items.map((tech) => {
                        const active = ctx.techStack.includes(tech);
                        return (
                          <button
                            key={tech}
                            onClick={() => toggleTech(tech)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                              active
                                ? group.bg
                                : "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#2A2A26] text-[#8B8B85] hover:border-[#D0D0CC] dark:hover:border-[#3A3A36]"
                            }`}
                          >
                            {active && <Check size={9} className="inline mr-1" />}
                            {tech}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. Coding Style ── */}
          <section className="px-6 py-5 space-y-3 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
            <div className="flex items-center gap-2">
              <Code2 size={13} className="text-violet-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#C8C7BF]">
                Estilo de Código & Patrones
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CODE_STYLES.map((style) => {
                const active = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => selectStyle(style.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? "bg-violet-500/10 border-violet-500/30 shadow-sm"
                        : "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#252522] hover:border-[#D0D0CC] dark:hover:border-[#3A3A36]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px]">{style.icon}</span>
                      <span className={`text-[12px] font-bold ${active ? "text-violet-600 dark:text-violet-400" : "text-[#1A1A18] dark:text-[#F0EFE9]"}`}>
                        {style.label}
                      </span>
                      {active && <Check size={11} className="ml-auto text-violet-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#8B8B85] leading-relaxed">{style.desc}</p>
                  </button>
                );
              })}
            </div>
            {selectedStyleId === "custom" && (
              <textarea
                rows={3}
                value={customStyle}
                onChange={(e) => {
                  setCustomStyle(e.target.value);
                  setGlobalContext({ ...ctx, codingStyle: e.target.value });
                }}
                placeholder="Describe tu estilo de código aquí..."
                className="w-full px-3 py-2 rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-[#F7F7F5] dark:bg-[#1A1A18] text-[12px] text-[#1A1A18] dark:text-[#F0EFE9] focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              />
            )}
          </section>

          {/* ── 3. Constraints ── */}
          <section className="px-6 py-5 space-y-3 border-b border-[#F0F0EC] dark:border-[#1E1E1C]">
            <div className="flex items-center gap-2">
              <Target size={13} className="text-red-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#C8C7BF]">
                Restricciones & Reglas
              </h3>
              {ctx.constraints.length > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  {ctx.constraints.length} activas
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {CONSTRAINT_OPTIONS.map((rule) => {
                const active = ctx.constraints.includes(rule);
                return (
                  <button
                    key={rule}
                    onClick={() => toggleConstraint(rule)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-[12px] ${
                      active
                        ? "bg-red-500/5 border-red-500/20 text-[#1A1A18] dark:text-[#F0EFE9]"
                        : "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#252522] text-[#8B8B85] hover:border-[#D0D0CC] dark:hover:border-[#3A3A36]"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                      active ? "bg-red-500 border-red-500" : "border-[#D0D0CC] dark:border-[#3A3A36]"
                    }`}>
                      {active && <Check size={9} className="text-white" />}
                    </div>
                    {rule}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 4. Documentation Links ── */}
          <section className="px-6 py-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-amber-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#C8C7BF]">
                Documentación de Referencia
              </h3>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-1.5">
              {DOC_LINKS.map((doc) => {
                const active = ctx.documentationLinks.includes(doc.url);
                return (
                  <button
                    key={doc.url}
                    onClick={() => active ? removeDocLink(doc.url) : addDocLink(doc.url)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      active
                        ? "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400"
                        : "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#252522] text-[#8B8B85] hover:border-amber-500/30"
                    }`}
                  >
                    <Link size={9} />
                    {doc.label}
                    {active && <X size={9} />}
                  </button>
                );
              })}
            </div>

            {/* Custom URL */}
            <div className="flex gap-2">
              <input
                value={customDocUrl}
                onChange={(e) => setCustomDocUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDocLink(customDocUrl)}
                placeholder="https://docs.myframework.com..."
                className="flex-1 h-9 px-3 rounded-xl border border-[#E8E8E4] dark:border-[#252522] bg-[#F7F7F5] dark:bg-[#1A1A18] text-[12px] text-[#1A1A18] dark:text-[#F0EFE9] placeholder:text-[#B0B0A8] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
              />
              <button
                onClick={() => addDocLink(customDocUrl)}
                className="h-9 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Added links list */}
            {ctx.documentationLinks.length > 0 && (
              <div className="space-y-1">
                {ctx.documentationLinks.map((url) => (
                  <div key={url} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522]">
                    <Link size={10} className="text-[#8B8B85] shrink-0" />
                    <span className="text-[11px] text-[#3A3A36] dark:text-[#C8C7BF] truncate flex-1">{url}</span>
                    <button onClick={() => removeDocLink(url)} className="text-[#8B8B85] hover:text-red-500 transition-colors shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F7F5] dark:bg-[#1A1A18] border-t border-[#E8E8E4] dark:border-[#252522] flex items-center justify-between gap-4">
          <p className="text-[10px] text-[#8B8B85]">
            Estas reglas se inyectan automáticamente en todos los agentes al inicio de cada tarea.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-medium bg-white dark:bg-[#141413] border border-[#E8E8E4] dark:border-[#2A2A26] text-[#3A3A36] dark:text-[#C8C7BF] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-xl text-[12px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-2"
            >
              <Check size={13} />
              Guardar Gobernanza
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
