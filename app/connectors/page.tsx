"use client"

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Save, Check, Loader2, Globe, AlertCircle
} from "lucide-react";
import DashboardLayout from "../dashboard_layout";

// ─── Real Logos ─────────────────────────────────────────────────────────────────

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.81 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-4.365-.75-4.365-3.665-.21-.48-.6-.82-1.185-1.185-.45-.27-1.11-.585-.015-1.065.76-.285 2.31-.405 3.615-.405s2.85.12 3.615.405c1.065-.48 1.74-.78 1.185-1.185-.585-.36-1.65-.645-2.13-.645-.645 2.52-.525 3.18.375 4.35.6.405 1.26.405 1.56.405.9 0 2.16-.405 3.615-.405 1.305 0 2.625.405 3.615.405.6 0 1.125-.15 1.56-.405.6.48.75 1.365.375 4.35-.27.285-.855.42-1.35.42-.645 0-1.23-.12-1.77-.48-1.215-.855-1.965-2.04-1.965-3.81 0-2.025 1.53-3.945 3.615-4.35-.435-.855-.405-1.965.135-4.185.405-.435.81-1.305.81-2.205v-.045c0-1.65.63-3.135 1.53-4.35-.81-.855-1.83-2.91-1.53-4.485 0-.015 0-.03-.015-.045C18.31 1.395 16.395.18 12 .18S5.685 1.395 4.5 3.315c.3 1.575-.72 3.63-1.53 4.485.9 1.215 1.53 2.7 1.53 4.35v.045c0 1.095.405 1.77.81 2.205.54 2.22.57 3.33.135 4.185C2.475 16.86 0 14.19 0 12s5.37-12 12-12Z"/>
    </svg>
  );
}

function NotionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.025.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v9.824c-.607.233-1.167.28-1.633.28l-11.546-.653c-.84-.047-1.26-.373-1.26-1.027V6.545c0-.7.374-1.166 1.214-1.12l13.124.74-.28.093zm-16.64 2.055l-.186.093-.888 14.337c-.047.607.233 1.027.98 1.074l11.409.56c.56.047.933-.14 1.213-.653l2.428-3.458-2.055 1.587-.28.233-2.055-1.073V13.58l.14.14c.094.607-.233 1.12-.98 1.166l-11.409.56c-.093-.047-.187-.047-.28-.047l-1.027-14.103.467-.187.607.513zm9.824 9.96l.094.046L13.624 21.07c-.42.373-.934.653-1.68.7l-4.664.233c-.56.047-.747-.093-.933-.513l-2.381-3.044 1.026-1.12 2.381 2.054.094-.094V17.65l-.14-.327c-.093-.42.14-1.026.793-1.073l3.044-.186c.093-.047.187 0 .28.047l-.374-.093z"/>
    </svg>
  );
}

function GoogleCloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="currentColor">
      <path d="M12.27 2.29v3.91h7.05c-.29 1.51-1.17 2.72-2.57 3.42l2.44 1.9c1.37-1.37 2.16-3.31 2.16-5.66s-1.31-4.57-3.08-5.57l-2.44 1.9c.98.98 1.56 2.29 1.56 3.91s-.58 2.93-1.56 3.71l-2.72-2.1V2.29h2.72zM4.82 9.67l2.23 1.9c.78-.78 1.56-1.37 2.57-1.37 1.37 0 2.05.58 2.05.58l2.05-2.05c-.78-.78-2.29-1.37-4.1-1.37-3.08 0-4.79 2.29-4.79 5.27s1.7 5.45 4.79 5.45c2.9 0 4.29-1.9 4.29-1.9l-2.23-1.9c-.98.98-2.05 1.56-2.05 3.51s1.07 2.71 2.05 2.71c2.05 0 3.51-1.56 4.29-3.12l-2.16-1.77c-.78.94-1.98 1.56-2.91 1.56-1.56 0-2.44-.72-2.72-1.37H4.82c-.78 0-1.37.37-1.9.98l1.9-1.56zM8.04 9.67l3.31-1.56c-.58-.98-1.17-1.56-1.95-1.56-.98 0-1.75.78-1.75 1.77s.78 1.77 1.75 1.77c.78 0 1.37-.58 1.85-1.56H8.04v2.14H11.3c.58-1.37.58-2.29 0-2.68-.37-.19-.78-.28-1.17-.28-.78.12-1.37.78-1.56 1.56l-.58-.27.55.27v.27H8.04V9.67zM7.06 11.16h2.05v1.77H7.06v-1.77zm1.35 3.12h2.05v1.77H8.41v-1.77z"/>
    </svg>
  );
}

export default function ConnectorsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken;

  const [userConfig, setUserConfig] = useState({
    githubToken:       "",
    notionToken:       "",
    notionWorkspaceId: "",
    gcpAccessToken:    "",
    gcpRefreshToken:   "",
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [saved, setSaved]       = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/config`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserConfig({
          githubToken:       data.githubToken       || "",
          notionToken:       data.notionToken       || "",
          notionWorkspaceId: data.notionWorkspaceId || "",
          gcpAccessToken:    data.gcpAccessToken    || "",
          gcpRefreshToken:   data.gcpRefreshToken   || "",
        });
      }
    } catch (e) {
      console.error("Error fetching config", e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) fetchConfig();
    else if (status === "unauthenticated") setLoading(false);
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, [accessToken, fetchConfig, status]);

  const saveConfig = async (fieldId: string) => {
    if (!accessToken) return;
    setSaving(fieldId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(userConfig),
      });
      if (resp.ok) {
        setSaved(fieldId);
        setTimeout(() => setSaved(null), 2500);
      }
    } catch (e) {
      alert("Error guardando conectores");
    } finally {
      setSaving(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">

        {/* ── Header ── */}
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
            Cloud Connectors
          </h1>
          <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
            Vincula tus ecosistemas externos para que los agentes puedan desplegar y documentar.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={20} strokeWidth={1.8} className="animate-spin text-[#B0B0A8] dark:text-[#4A4A44]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* ── GitHub ── */}
            <ConnectorCard
              icon={GitHubIcon}
              title="GitHub"
              description="El agente Developer crea repositorios y gestiona despliegues en tu cuenta personal."
              linked={!!userConfig.githubToken}
              accentClass="text-[#1A1A18] dark:text-[#F0EFE9]"
              accentBg="bg-[#F0F0EC] dark:bg-[#1E1E1C]"
            >
              <TokenField
                label="Personal Access Token (classic)"
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                value={userConfig.githubToken}
                onChange={(v) => setUserConfig({ ...userConfig, githubToken: v })}
                onSave={() => saveConfig("github")}
                saving={saving === "github"}
                saved={saved === "github"}
                fieldId="github"
              />
            </ConnectorCard>

            {/* ── Notion ── */}
            <ConnectorCard
              icon={NotionIcon}
              title="Notion"
              description="Sincroniza PRD, arquitectura y guías de usuario directamente en tu workspace."
              linked={!!userConfig.notionToken}
              accentClass="text-[#1A1A18] dark:text-[#F0EFE9]"
              accentBg="bg-[#F0F0EC] dark:bg-[#1E1E1C]"
            >
              <TokenField
                label="Integration Token"
                placeholder="secret_xxxxxxxxxxxxxxxx"
                value={userConfig.notionToken}
                onChange={(v) => setUserConfig({ ...userConfig, notionToken: v })}
                onSave={() => saveConfig("notionToken")}
                saving={saving === "notionToken"}
                saved={saved === "notionToken"}
                fieldId="notionToken"
              />
              <TokenField
                label="Workspace / Page ID"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={userConfig.notionWorkspaceId}
                onChange={(v) => setUserConfig({ ...userConfig, notionWorkspaceId: v })}
                onSave={() => saveConfig("notionWorkspaceId")}
                saving={saving === "notionWorkspaceId"}
                saved={saved === "notionWorkspaceId"}
                fieldId="notionWorkspaceId"
                type="text"
              />
            </ConnectorCard>

            {/* ── Google Cloud ── */}
            <ConnectorCard
              icon={GoogleCloudIcon}
              title="Google Cloud"
              description="El agente DevOps publica servicios en Cloud Run y aloja tu servidor en la nube."
              linked={!!userConfig.gcpRefreshToken}
              accentClass="text-[#1A1A18] dark:text-[#F0EFE9]"
              accentBg="bg-[#F0F0EC] dark:bg-[#1E1E1C]"
            >
              {userConfig.gcpRefreshToken ? (
                <div className="space-y-2">
                  <div className="
                    flex items-center gap-2 px-3 py-2.5 rounded-lg
                    bg-emerald-50 dark:bg-emerald-500/10
                    border border-emerald-200 dark:border-emerald-500/20
                  ">
                    <Check size={13} strokeWidth={2} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
                      API de Cloud vinculada
                    </span>
                  </div>
                  <button
                    onClick={() => setUserConfig({ ...userConfig, gcpAccessToken: "", gcpRefreshToken: "" })}
                    className="
                      w-full py-2 rounded-lg text-[11px] font-medium
                      text-[#8B8B85] dark:text-[#6B6B63]
                      hover:bg-rose-50 dark:hover:bg-rose-500/10
                      hover:text-rose-600 dark:hover:text-rose-400
                      border border-[#E8E8E4] dark:border-[#252522]
                      hover:border-rose-200 dark:hover:border-rose-500/20
                      transition-colors duration-150
                    "
                  >
                    Desconectar cuenta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#252522]">
                    <AlertCircle size={13} strokeWidth={1.8} className="text-[#B0B0A8] dark:text-[#4A4A44] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] leading-relaxed">
                      La conexión usa OAuth seguro. No se almacenan contraseñas.
                    </p>
                  </div>
                  <button
                    onClick={() => signIn("google-cloud", { callbackUrl: "/connectors" })}
                    className="
                      w-full py-2.5 rounded-lg text-[12px] font-medium
                      flex items-center justify-center gap-2
                      bg-white dark:bg-[#1A1A18]
                      border border-[#E8E8E4] dark:border-[#2A2A26]
                      text-[#1A1A18] dark:text-[#F0EFE9]
                      hover:bg-[#F7F7F5] dark:hover:bg-[#252522]
                      transition-colors duration-150 shadow-sm
                    "
                  >
                    <Globe size={14} strokeWidth={1.8} className="text-emerald-600 dark:text-emerald-400" />
                    Continuar con Google Cloud
                  </button>
                </div>
              )}
            </ConnectorCard>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Connector Card ──────────────────────────────────────────────────────────

function ConnectorCard({
  icon: Icon, title, description, linked,
  accentClass, accentBg, children,
}: {
  icon: any; title: string; description: string; linked: boolean;
  accentClass: string; accentBg: string; children: React.ReactNode;
}) {
  return (
    <div className="
      rounded-xl border border-[#E8E8E4] dark:border-[#252522]
      bg-white dark:bg-[#141413]
      p-5 flex flex-col gap-5
    ">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accentBg}`}>
            <Icon className={accentClass} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">{title}</p>
            <span className={`
              inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5
              ${linked
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-[#F0F0EC] dark:bg-[#1E1E1C] text-[#B0B0A8] dark:text-[#4A4A44]"
              }
            `}>
              {linked ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#8B8B85] dark:text-[#6B6B63] leading-relaxed -mt-2">
        {description}
      </p>

      {/* Divider */}
      <div className="h-px bg-[#F0F0EC] dark:bg-[#1E1E1C]" />

      {/* Fields */}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

// ─── Token Field ─────────────────────────────────────────────────────────────

function TokenField({
  label, placeholder, value, onChange, onSave, saving, saved, fieldId, type = "password",
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; onSave: () => void;
  saving: boolean; saved: boolean; fieldId: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            flex-1 h-9 px-3 rounded-lg text-[12px] font-mono min-w-0
            bg-[#F7F7F5] dark:bg-[#1A1A18]
            border border-[#E8E8E4] dark:border-[#2A2A26]
            text-[#1A1A18] dark:text-[#F0EFE9]
            placeholder:text-[#C8C7BF] dark:placeholder:text-[#3A3A36]
            focus:outline-none focus:ring-2 focus:ring-[#4F9CF9]/30 focus:border-[#4F9CF9]
            transition-all duration-150
          "
        />
        <button
          onClick={onSave}
          disabled={saving}
          className={`
            h-9 px-3 rounded-lg shrink-0 flex items-center justify-center
            text-[11px] font-medium transition-colors duration-150
            ${saved
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
              : "bg-[#4F9CF9] hover:bg-[#3D8EE8] text-white shadow-sm"
            }
            disabled:opacity-60
          `}
        >
          {saving
            ? <Loader2 size={13} strokeWidth={2} className="animate-spin" />
            : saved
            ? <Check size={13} strokeWidth={2.5} />
            : <Save size={13} strokeWidth={1.8} />
          }
        </button>
      </div>
    </div>
  );
}