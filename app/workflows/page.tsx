"use client"

import React, { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import {
  Workflow, Plus, Loader2, Bot,
  Trash2, Edit3, Save, ArrowUp, ArrowDown,
  Layout, Github, Database, X, ChevronDown, ChevronUp,
  Settings, User, Sparkles, Brain, Target, ShieldOff, Image as ImageIcon, Upload,
  MapPin, Users, MessageSquareCode
} from "lucide-react";
import DashboardLayout from "../dashboard_layout";
import GovernanceModal from "@/components/dashboard/GovernanceModal";
import CreateAgentModal from "@/components/dashboard/CreateAgentModal";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  active: boolean;
  tools: string[];
  connectors: string[];
  
  // Basic Persona
  personality?: string;
  context?: string;
  guidelines?: string;
  
  // Model Settings
  model?: string;
  avatarUrl?: string;
  temperature?: number;
  maxTokens?: number;

  // Claw3D Identity
  vibe?: string;
  emoji?: string;
  boundaries?: string;
  operatingInstructions?: string;

  // Big Five (0-1)
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;

  // Claw3D Office Social
  officeDesk?: string;
  officeWing?: string;
  officeFloor?: number;
  avatarStyle?: string;
  socialTone?: string;
  standupBehavior?: string;
  computerType?: string;
  status?: string;
  avatarProfile?: any;
  roleDefinitionId?: string;
}

interface StandupMeeting {
  id?: string;
  title: string;
  description?: string;
  location: string;
  cron?: string;
  time?: string;
  agenda?: string; // JSON string
  active: boolean;
}

interface WorkSchedule {
  id?: string;
  daysEnabled: string[];
  startHour: string;
  endHour: string;
  timezone: string;
  agentOverrides?: string;
}

interface UserGlobalContext {
  id?: string;
  techStack: string[];
  codingStyle?: string;
  namingConventions?: any;
  constraints: string[];
  documentationLinks: string[];
}

interface AgentRoleDefinition {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  systemPrompt?: string;
  personality?: string;
  context?: string;
  guidelines?: string;
  boundaries?: string;
  instructions?: string;
  isDefault: boolean;
}

const CONNECTOR_CONFIG = [
  { key: "github", label: "GitHub", icon: Github, activeClass: "bg-[#4F9CF9]/10 dark:bg-[#4F9CF9]/15 border-[#4F9CF9]/30 text-[#4F9CF9]" },
  { key: "notion", label: "Notion", icon: Layout, activeClass: "bg-violet-500/10 dark:bg-violet-500/15 border-violet-500/30 text-violet-500" },
  { key: "google-cloud", label: "Google Cloud", icon: Database, activeClass: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
];

const MODEL_CONFIG: Record<string, string> = {
  "gemini-3-flash-preview": "Gemini-3.1",
  "claude-3-5-sonnet@20240620": "Claude sonnet 4.6",
};

const ROLE_SLUGS = [
  { value: "requirements_agent", label: "Advisor / Requirements" },
  { value: "architecture_agent", label: "Architect" },
  { value: "development_agent", label: "Developer" },
  { value: "qa_agent", label: "QA / Tester" },
  { value: "documentation_agent", label: "Tech Writer / Docs" },
  { value: "devops_agent", label: "DevOps / Infrastructure" },
  { value: "custom", label: "Custom Role..." },
];

export default function WorkflowsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken;

  const [agents, setAgents]           = useState<Agent[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [officeDesks, setOfficeDesks] = useState<any[]>([]);
  const [roles, setRoles] = useState<AgentRoleDefinition[]>([]);
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<AgentRoleDefinition> | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const [schedule, setSchedule] = useState<WorkSchedule | null>(null);
  const [meetings, setMeetings] = useState<StandupMeeting[]>([]);
  const [isManagingSchedule, setIsManagingSchedule] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Partial<StandupMeeting> | null>(null);

  const [globalContext, setGlobalContext] = useState<UserGlobalContext | null>(null);
  const [isManagingContext, setIsManagingContext] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  const fetchGlobalContext = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/context/global`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) setGlobalContext(await resp.json());
    } catch (e) {
      console.error("Error fetching global context", e);
    }
  }, [accessToken]);

  const fetchSchedule = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/schedules/work`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSchedule(data);
      }
    } catch (e) {
      console.error("Error fetching schedule", e);
    }
  }, [accessToken]);

  const fetchMeetings = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/schedules/meetings`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) setMeetings(await resp.json());
    } catch (e) {
      console.error("Error fetching meetings", e);
    }
  }, [accessToken]);

  const fetchAgents = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/agents`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) setAgents(await resp.json());
    } catch (e) {
      console.error("Error fetching agents", e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchDesks = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/agents/desks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) setOfficeDesks(await resp.json());
    } catch (e) {
      console.error("Error fetching desks", e);
    }
  }, [accessToken]);

  const fetchRoles = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/agents/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) setRoles(await resp.json());
    } catch (e) {
      console.error("Error fetching roles", e);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) { 
      fetchAgents(); 
      fetchDesks();
      fetchRoles();
      fetchSchedule();
      fetchMeetings();
      fetchGlobalContext();
    }
    else if (status === "unauthenticated") setLoading(false);
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, [accessToken, fetchAgents, fetchDesks, fetchRoles, fetchSchedule, fetchMeetings, fetchGlobalContext, status]);


  const toggleAgent = async (agent: Agent) => {
    const updated = { ...agent, active: !agent.active };
    setAgents(agents.map((a) => (a.id === agent.id ? updated : a)));
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    await fetch(`${apiUrl}/api/user/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(updated),
    });
  };

  const moveAgent = async (index: number, direction: "up" | "down") => {
    const newAgents = [...agents];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAgents.length) return;
    [newAgents[index], newAgents[targetIndex]] = [newAgents[targetIndex], newAgents[index]];
    const updated = newAgents.map((a, i) => ({ ...a, order: i + 1 }));
    setAgents(updated);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    for (const a of updated) {
      await fetch(`${apiUrl}/api/user/agents/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(a),
      });
    }
  };

  const saveEdit = async () => {
    if (!editingAgent) return;
    setSaving(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    await fetch(`${apiUrl}/api/user/agents/${editingAgent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(editingAgent),
    });
    setAgents(agents.map((a) => (a.id === editingAgent.id ? editingAgent : a)));
    setEditingAgent(null);
    setSaving(false);
  };

  const handleGeneratePrompt = async () => {
    if (!editingRole?.name || !accessToken) return;
    setIsGeneratingPrompt(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/agents/roles/generate-prompt?name=${encodeURIComponent(editingRole.name)}&description=${encodeURIComponent(editingRole.description || "")}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setEditingRole({ ...editingRole, systemPrompt: data.prompt });
      }
    } catch (e) {
      console.error("Error generating prompt", e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const toggleConnector = (key: string) => {
    if (!editingAgent) return;
    const cons = editingAgent.connectors.includes(key)
      ? editingAgent.connectors.filter((c) => c !== key)
      : [...editingAgent.connectors, key];
    setEditingAgent({ ...editingAgent, connectors: cons });
  };

  const handleUploadClick = () => {
    if (!(window as any).cloudinary || !editingAgent) return;
    
    (window as any).cloudinary.openUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqluumk10",
        uploadPreset: "software_factory",
        sources: ["local", "url", "camera"],
        multiple: false,
        theme: "minimal"
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setEditingAgent({ ...editingAgent, avatarUrl: result.info.secure_url });
        }
      }
    );
  };
  const handleSaveRole = async () => {
    if (!editingRole || !accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const method = editingRole.id ? "PATCH" : "POST";
    const url = editingRole.id ? `${apiUrl}/api/user/agents/roles/${editingRole.id}` : `${apiUrl}/api/user/agents/roles`;
    
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(editingRole),
    });
    if (resp.ok) {
        fetchRoles();
        setEditingRole(null);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/user/agents/roles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resp.ok) fetchRoles();
  };

  const handleSaveSchedule = async (newSchedule: WorkSchedule) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/user/schedules/work`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(newSchedule),
    });
    if (resp.ok) {
        setSchedule(await resp.json());
    }
  };

  const handleSaveMeeting = async (meeting: Partial<StandupMeeting>) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const method = meeting.id ? "PATCH" : "POST";
    const url = meeting.id ? `${apiUrl}/api/user/schedules/meetings/${meeting.id}` : `${apiUrl}/api/user/schedules/meetings`;
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(meeting),
    });
    if (resp.ok) {
        fetchMeetings();
        setEditingMeeting(null);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/user/schedules/meetings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resp.ok) fetchMeetings();
  };

  const handleSaveGlobalContext = async (ctx: UserGlobalContext) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/context/global`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(ctx),
    });
    if (resp.ok) setGlobalContext(await resp.json());
  };

  const handleCreateAgent = async (agentData: any) => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/user/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(agentData),
    });
    if (resp.ok) {
        fetchAgents();
    }
  };

  return (
    <DashboardLayout>
      <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="lazyOnload" />
      <div className="space-y-8 pb-16">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1A1A18] dark:text-[#F0EFE9]">
              Agentic Workflows
            </h1>
            <p className="text-[13px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5">
              Orquestación y personalización de tu equipo de agentes autónomos.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsManagingContext(true)}
               className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-xl text-[13px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] hover:bg-[#F5F5F3] dark:hover:bg-[#252522] transition-colors shadow-sm"
             >
               <ShieldOff className="w-4 h-4 text-emerald-500" />
               Factory Governance
             </button>
             <button 
               onClick={() => setIsManagingSchedule(true)}
               className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A18] border border-[#E2E2E0] dark:border-[#2A2A26] rounded-xl text-[13px] font-medium text-[#1A1A18] dark:text-[#F0EFE9] hover:bg-[#F5F5F3] dark:hover:bg-[#252522] transition-colors shadow-sm"
             >
               <Users className="w-4 h-4 text-[#8B8B85]" />
               Schedules & Meetings
             </button>
             <button 
               onClick={() => setIsManagingRoles(true)}
               className="h-9 px-4 rounded-lg flex items-center gap-2 bg-[#F0F0EC] dark:bg-[#1E1E1C] text-[#3A3A36] dark:text-[#C8C7BF] text-[12px] font-medium border border-[#E8E8E4] dark:border-[#2A2A26] hover:bg-[#E8E8E4] dark:hover:bg-[#2A2A26] transition-colors"
             >
               <Settings size={14} />
               Manage Roles
             </button>
             <button 
               onClick={() => setIsCreatingAgent(true)}
               className="
               h-9 px-4 rounded-lg flex items-center gap-2
               bg-[#4F9CF9] hover:bg-[#3D8EE8]
               text-white text-[12px] font-medium
               transition-colors duration-150 shadow-sm shrink-0
             ">
               <Plus size={14} strokeWidth={2.2} />
               Add Agent
             </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={20} strokeWidth={1.8} className="animate-spin text-[#B0B0A8] dark:text-[#4A4A44]" />
          </div>
        ) : agents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={index}
                total={agents.length}
                isEditing={editingAgent?.id === agent.id}
                editingAgent={editingAgent}
                saving={saving}
                onToggle={() => toggleAgent(agent)}
                onMoveUp={() => moveAgent(index, "up")}
                onMoveDown={() => moveAgent(index, "down")}
                onEdit={() => setEditingAgent(agent)}
                onCancelEdit={() => setEditingAgent(null)}
                onSaveEdit={saveEdit}
                onEditChange={setEditingAgent}
                onToggleConnector={toggleConnector}
                onUploadAvatar={handleUploadClick}
                officeDesks={officeDesks}
                roles={roles}
              />
            ))}
          </div>
        )}

        {/* ── Create Agent Modal ── */}
        {isCreatingAgent && (
          <CreateAgentModal
            roles={roles}
            officeDesks={officeDesks}
            onClose={() => setIsCreatingAgent(false)}
            onSave={handleCreateAgent}
          />
        )}
        
        {/* ── Factory Governance Modal ── */}
        {isManagingContext && (
          <GovernanceModal
            globalContext={globalContext}
            setGlobalContext={setGlobalContext}
            onClose={() => setIsManagingContext(false)}
            onSave={() => { if (globalContext) handleSaveGlobalContext(globalContext); setIsManagingContext(false); }}
          />
        )}

        {/* ── Role Management Modal ── */}
        {isManagingSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#141413] rounded-2xl border border-[#E8E8E4] dark:border-[#252522] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
               <div className="flex items-center justify-between p-4 border-b border-[#E8E8E4] dark:border-[#252522]">
                  <h2 className="text-sm font-bold flex items-center gap-2 text-[#1A1A18] dark:text-[#F0EFE9]">
                    <Users size={16} className="text-[#4F9CF9]"/>
                    Agent Operations & Scheduling
                  </h2>
                  <button onClick={() => setIsManagingSchedule(false)} className="p-1.5 hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] rounded-lg transition-colors text-[#8B8B85]">
                    <X size={18} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* General Work Schedule */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 border-b border-[#F0F0EC] dark:border-[#1E1E1C] pb-2">
                        <Layout size={14} className="text-[#8B8B85]"/>
                        <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#F0EFE9]">Horario de Oficina</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[11px] font-semibold text-[#8B8B85]">Días Laborables</label>
                           <div className="flex flex-wrap gap-2">
                              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(day => (
                                 <button 
                                    key={day}
                                    onClick={() => {
                                       const current = schedule?.daysEnabled || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
                                       const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                                       handleSaveSchedule({...schedule!, daysEnabled: updated, startHour: schedule?.startHour || "09:00", endHour: schedule?.endHour || "18:00", timezone: schedule?.timezone || "UTC"});
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                       (schedule?.daysEnabled || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]).includes(day)
                                       ? "bg-[#4F9CF9] border-[#4F9CF9] text-white shadow-sm"
                                       : "bg-white dark:bg-[#1A1A18] border-[#DCDCD8] dark:border-[#2A2A26] text-[#8B8B85]"
                                    }`}
                                 >
                                    {day.substring(0,3)}
                                 </button>
                              ))}
                           </div>
                           <p className="text-[10px] text-[#8B8B85] italic pt-1">
                              * Los agentes solo aparecerán en la oficina durante los días seleccionados.
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-[#8B8B85]">Entrada</label>
                              <input 
                                 type="time" 
                                 value={schedule?.startHour || "09:00"} 
                                 onChange={e => handleSaveSchedule({...schedule!, startHour: e.target.value, daysEnabled: schedule?.daysEnabled || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], endHour: schedule?.endHour || "18:00", timezone: schedule?.timezone || "UTC"})}
                                 className="edit-input w-full"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-[#8B8B85]">Salida</label>
                              <input 
                                 type="time" 
                                 value={schedule?.endHour || "18:00"} 
                                 onChange={e => handleSaveSchedule({...schedule!, endHour: e.target.value, daysEnabled: schedule?.daysEnabled || ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], startHour: schedule?.startHour || "09:00", timezone: schedule?.timezone || "UTC"})}
                                 className="edit-input w-full"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Meetings & Standups */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between border-b border-[#F0F0EC] dark:border-[#1E1E1C] pb-2">
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-[#4F9CF9]"/>
                           <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#3A3A36] dark:text-[#F0EFE9]">Eventos & Reuniones</h3>
                        </div>
                        <button 
                           onClick={() => setEditingMeeting({ title: "Daily Standup", location: "CONFERENCE_ROOM", active: true, time: "09:00" })}
                           className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4F9CF9]/10 text-[#4F9CF9] text-[10px] font-bold border border-[#4F9CF9]/20 hover:bg-[#4F9CF9]/15 transition-all"
                        >
                           <Plus size={12}/> AGREGAR EVENTO
                        </button>
                     </div>

                     {editingMeeting ? (
                        <div className="p-5 bg-[#F9F9F7] dark:bg-[#1A1A18] rounded-2xl border border-[#4F9CF9]/20 space-y-4 animate-in zoom-in-95 duration-200">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-[#8B8B85]">Título del Evento</label>
                                 <input value={editingMeeting.title || ""} onChange={e => setEditingMeeting({...editingMeeting, title: e.target.value})} className="edit-input w-full" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[10px] font-bold text-[#8B8B85]">Hora</label>
                                 <input type="time" value={editingMeeting.time || "09:00"} onChange={e => setEditingMeeting({...editingMeeting, time: e.target.value})} className="edit-input w-full" />
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#8B8B85]">Ubicación en Oficina</label>
                              <select value={editingMeeting.location || "CONFERENCE_ROOM"} onChange={e => setEditingMeeting({...editingMeeting, location: e.target.value})} className="edit-input w-full">
                                 <option value="CONFERENCE_ROOM">Sala de Conferencias</option>
                                 <option value="TECH_LOUNGE">Tech Lounge</option>
                                 <option value="OPEN_WORK_AREA">Zona Abierta</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#8B8B85]">Agenda del Standup (IA Context)</label>
                              <textarea 
                                 rows={3} 
                                 placeholder="Ej: Reunión de los viernes para hablar sobre problemas de rendimiento y mejoras para la semana siguiente."
                                 value={editingMeeting.description || ""} 
                                 onChange={e => setEditingMeeting({...editingMeeting, description: e.target.value})} 
                                 className="edit-textarea w-full" 
                              />
                           </div>
                           <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingMeeting(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-[#141413] border border-[#E8E8E4] dark:border-[#2A2A26] text-[#3A3A36] dark:text-[#C8C7BF]">Cancelar</button>
                              <button onClick={() => handleSaveMeeting(editingMeeting)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#4F9CF9] text-white">Guardar Evento</button>
                           </div>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 gap-2">
                           {meetings.length === 0 ? (
                              <div className="text-center py-8 text-[#8B8B85] text-[11px] italic">No hay reuniones programadas</div>
                           ) : (
                              meetings.map(m => (
                                 <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26] shadow-sm">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-[#4F9CF9]/10 flex items-center justify-center text-[#4F9CF9]">
                                          <Users size={16}/>
                                       </div>
                                       <div>
                                          <p className="text-[11px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{m.title}</p>
                                          <div className="flex items-center gap-2 text-[9px] text-[#8B8B85] font-medium mt-0.5">
                                             <span className="bg-[#E8E8E4] dark:bg-[#252522] px-1.5 rounded uppercase">{m.time}</span>
                                             <span className="text-[#4F9CF9] uppercase">{m.location.replace("_"," ")}</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <button onClick={() => setEditingMeeting(m)} className="p-1.5 hover:bg-[#F5F5F3] dark:hover:bg-[#252522] rounded text-[#8B8B85] transition-colors"><Edit3 size={12}/></button>
                                       <button onClick={() => handleDeleteMeeting(m.id!)} className="p-1.5 hover:bg-rose-500/10 rounded text-rose-500 transition-colors"><Trash2 size={12}/></button>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     )}
                  </div>
               </div>
               
               <div className="p-4 bg-[#F7F7F5] dark:bg-[#1A1A18] border-t border-[#E8E8E4] dark:border-[#252522]">
                  <p className="text-[10px] text-[#8B8B85] text-center">
                     Claw3D Engine sincronizará estos horarios con los movimientos de los agentes en tiempo real.
                  </p>
               </div>
            </div>
          </div>
        )}

        {isManagingRoles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#141413] rounded-2xl border border-[#E8E8E4] dark:border-[#252522] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
               <div className="flex items-center justify-between p-4 border-b border-[#E8E8E4] dark:border-[#252522]">
                  <h2 className="text-sm font-bold flex items-center gap-2 text-[#1A1A18] dark:text-[#F0EFE9]">
                    <ShieldOff size={16} className="text-[#4F9CF9]"/>
                    Role Definitions
                  </h2>
                  <button onClick={() => {setIsManagingRoles(false); setEditingRole(null);}} className="p-1.5 hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] rounded-lg transition-colors text-[#8B8B85]">
                    <X size={18} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {editingRole ? (
                     <div className="space-y-4 bg-[#F9F9F7] dark:bg-[#1A1A18] p-5 rounded-2xl border border-[#E8E8E4] dark:border-[#2A2A26] shadow-sm animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#8B8B85] ml-1">Role Name</label>
                              <input 
                                value={editingRole.name || ""} 
                                onChange={e => setEditingRole({...editingRole, name: e.target.value})} 
                                className="h-10 px-3 w-full rounded-xl border border-[#DCDCD8] dark:border-[#3A3A35] bg-white dark:bg-[#141413] text-[#1A1A18] dark:text-[#F0EFE9] text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#4F9CF9]/20 transition-all shadow-inner" 
                                placeholder="Software Engineer" 
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#8B8B85] ml-1">Slug / Identity ID</label>
                              <select 
                                 value={ROLE_SLUGS.some(s => s.value === editingRole.slug) ? editingRole.slug : "custom"} 
                                 onChange={e => {
                                    const val = e.target.value;
                                    if (val !== "custom") setEditingRole({...editingRole, slug: val});
                                 }} 
                                 className="h-10 px-2 w-full rounded-xl border border-[#DCDCD8] dark:border-[#3A3A35] bg-white dark:bg-[#141413] text-[#1A1A18] dark:text-[#F0EFE9] text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#4F9CF9]/20 transition-all shadow-sm"
                              >
                                 {ROLE_SLUGS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                              {(!ROLE_SLUGS.some(s => s.value === editingRole.slug) || editingRole.slug === "custom") && (
                                 <input 
                                   value={editingRole.slug || ""} 
                                   onChange={e => setEditingRole({...editingRole, slug: e.target.value})} 
                                   className="h-10 px-3 w-full rounded-xl border border-[#DCDCD8] dark:border-[#3A3A35] bg-white dark:bg-[#141413] text-[#1A1A18] dark:text-[#F0EFE9] text-[12px] font-medium outline-none mt-2 focus:ring-2 focus:ring-[#4F9CF9]/20 transition-all shadow-inner" 
                                   placeholder="custom_slug" 
                                 />
                              )}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase text-[#8B8B85] ml-1">Role Description</label>
                           <input 
                             value={editingRole.description || ""} 
                             onChange={e => setEditingRole({...editingRole, description: e.target.value})} 
                             className="h-10 px-3 w-full rounded-xl border border-[#DCDCD8] dark:border-[#3A3A35] bg-white dark:bg-[#141413] text-[#1A1A18] dark:text-[#F0EFE9] text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#4F9CF9]/20 transition-all shadow-inner" 
                             placeholder="What describes this role?"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <div className="flex items-center justify-between ml-1">
                              <label className="text-[10px] font-bold uppercase text-[#8B8B85]">System Prompt Template</label>
                              <button 
                                onClick={handleGeneratePrompt}
                                disabled={isGeneratingPrompt || !editingRole.name}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4F9CF9]/5 hover:bg-[#4F9CF9]/10 text-[9px] font-bold text-[#4F9CF9] border border-[#4F9CF9]/20 transition-all disabled:opacity-50"
                              >
                                {isGeneratingPrompt ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10}/>}
                                GENERATE COMPLETELY WITH AI
                              </button>
                           </div>
                           <textarea 
                             rows={6} 
                             value={editingRole.systemPrompt || ""} 
                             onChange={e => setEditingRole({...editingRole, systemPrompt: e.target.value})} 
                             className="p-4 w-full rounded-2xl border border-[#DCDCD8] dark:border-[#3A3A35] bg-white dark:bg-[#141413] text-[#1A1A18] dark:text-[#F0EFE9] text-[12px] font-medium leading-relaxed outline-none focus:ring-2 focus:ring-[#4F9CF9]/20 transition-all shadow-inner resize-none" 
                             placeholder="Configure the core system instructions here. Use placeholders or broad instructions for the AI behavior." 
                           />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                           <button onClick={() => setEditingRole(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-[#252522] border border-[#E8E8E4] dark:border-[#2A2A26] text-[#3A3A36] dark:text-[#C8C7BF]">Cancel</button>
                           <button onClick={handleSaveRole} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#4F9CF9] text-white">Save Role</button>
                        </div>
                     </div>
                  ) : (
                     <button 
                        onClick={() => setEditingRole({ icon: "Cpu", color: "#6366F1", isDefault: false })}
                        className="w-full py-4 border-2 border-dashed border-[#E8E8E4] dark:border-[#2A2A26] rounded-xl flex flex-col items-center gap-1 hover:border-[#4F9CF9] hover:bg-[#4F9CF9]/5 transition-all text-[#8B8B85] hover:text-[#4F9CF9]"
                     >
                        <Plus size={20} />
                        <span className="text-[11px] font-bold uppercase">Define New Role</span>
                     </button>
                  )}

                  <div className="space-y-2">
                    {roles.map(role => (
                       <div key={role.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26]">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-[#252522] border border-[#E8E8E4] dark:border-[#2A2A26]">
                                <Bot size={16} style={{ color: role.color }}/>
                             </div>
                             <div>
                                <p className="text-[12px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{role.name}</p>
                                <p className="text-[10px] text-[#8B8B85]">{role.slug}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1">
                             <button onClick={() => setEditingRole(role)} className="p-1.5 hover:bg-[#E8E8E4] dark:hover:bg-[#252522] rounded text-[#8B8B85] transition-colors"><Edit3 size={12}/></button>
                             <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-rose-500 transition-colors"><Trash2 size={12}/></button>
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Agent Card ──────────────────────────────────────────────────────────────

function AgentCard({
  agent, index, total, isEditing, editingAgent, saving,
  onToggle, onMoveUp, onMoveDown, onEdit, onCancelEdit, onSaveEdit, onEditChange, onToggleConnector, onUploadAvatar,
  officeDesks, roles
}: {
  agent: Agent; index: number; total: number; isEditing: boolean;
  editingAgent: Agent | null; saving: boolean;
  onToggle: () => void; onMoveUp: () => void; onMoveDown: () => void;
  onEdit: () => void; onCancelEdit: () => void; onSaveEdit: () => void;
  onEditChange: (a: Agent) => void; onToggleConnector: (key: string) => void;
  onUploadAvatar: () => void;
  officeDesks: any[];
  roles: AgentRoleDefinition[];

}) {
  const ea = editingAgent;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className={`
      rounded-xl border transition-colors duration-150
      bg-white dark:bg-[#141413]
      ${isEditing
        ? "border-[#4F9CF9]/40 dark:border-[#4F9CF9]/30 shadow-md shadow-[#4F9CF9]/5"
        : "border-[#E8E8E4] dark:border-[#252522] hover:border-[#D8D8D4] dark:hover:border-[#2E2E2A]"
      }
      ${!agent.active && !isEditing ? "opacity-50" : ""}
    `}>
      <div className="flex items-center gap-4 p-4">
        {/* Order controls */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 rounded text-[#B0B0A8] dark:text-[#4A4A44] hover:text-[#4F9CF9] disabled:opacity-20 transition-colors duration-150">
            <ArrowUp size={12} strokeWidth={2} />
          </button>
          <span className="text-[10px] font-semibold text-[#B0B0A8] dark:text-[#4A4A44] w-5 text-center">{index + 1}</span>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 rounded text-[#B0B0A8] dark:text-[#4A4A44] hover:text-[#4F9CF9] disabled:opacity-20 transition-colors duration-150">
            <ArrowDown size={12} strokeWidth={2} />
          </button>
        </div>

        {/* Agent icon / Avatar */}
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border"
          style={{ backgroundColor: `${agent.color}18`, borderColor: `${agent.color}40` }}
        >
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">{agent.emoji || "🤖"}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[#1A1A18] dark:text-[#F0EFE9]">{agent.name}</span>
            <span className="text-[10px] font-medium text-[#4F9CF9] bg-[#4F9CF9]/8 dark:bg-[#4F9CF9]/12 px-2 py-0.5 rounded-full">{agent.role}</span>
            <span className="text-[10px] font-medium text-[#8B8B85] bg-[#F0F0EC] dark:bg-[#1E1E1C] px-2 py-0.5 rounded-full uppercase tracking-tighter">
               {agent.officeWing || "Core"} | {MODEL_CONFIG[agent.model as any] || agent.model}
            </span>
          </div>
          <p className="text-[11px] text-[#8B8B85] dark:text-[#6B6B63] mt-0.5 truncate">{agent.description}</p>
        </div>

        {/* Controls */}
        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onToggle} className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${agent.active ? "bg-[#4F9CF9]" : "bg-[#E8E8E4] dark:bg-[#2A2A26]"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${agent.active ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <button onClick={onEdit} className="p-2 rounded-lg text-[#8B8B85] dark:text-[#6B6B63] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9] transition-colors duration-150">
              <Edit3 size={14} strokeWidth={1.8} />
            </button>
            <button className="p-2 rounded-lg text-[#B0B0A8] dark:text-[#4A4A44] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-150">
              <Trash2 size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {isEditing && (
          <button onClick={onCancelEdit} className="p-2 rounded-lg text-[#B0B0A8] dark:text-[#4A4A44] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] transition-colors duration-150 shrink-0">
            <X size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {isEditing && ea && (
        <div className="border-t border-[#E8E8E4] dark:border-[#252522] p-5 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2 shrink-0">
               <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">Avatar</label>
               <div 
                  onClick={onUploadAvatar}
                  className="group relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-[#E8E8E4] dark:border-[#2A2A26] hover:border-[#4F9CF9] transition-all flex items-center justify-center bg-[#F7F7F5] dark:bg-[#1A1A18]"
               >
                  {ea.avatarUrl ? (
                    <img src={ea.avatarUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                  ) : (
                    <Upload className="text-[#B0B0A8] dark:text-[#4A4A44] group-hover:text-[#4F9CF9]" size={20} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold">CARGAR</span>
                  </div>
               </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">Nombre</label>
                <input value={ea.name} onChange={(e) => onEditChange({ ...ea, name: e.target.value })} className="edit-input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">Modelo IA</label>
                <select value={ea.model || "gemini-3-flash-preview"} onChange={(e) => onEditChange({ ...ea, model: e.target.value })} className="edit-input w-full appearance-none">
                  <option value="gemini-3-flash-preview">Gemini-3.1</option>
                  <option value="claude-3-5-sonnet@20240620">Claude sonnet 4.6</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">Emoji / Color</label>
                <div className="flex gap-2">
                  <input value={ea.emoji || ""} onChange={(e) => onEditChange({ ...ea, emoji: e.target.value })} className="edit-input w-20 text-center" />
                  <input type="color" value={ea.color} onChange={(e) => onEditChange({ ...ea, color: e.target.value })} className="h-9 w-full rounded-lg cursor-pointer bg-transparent" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0A8] dark:text-[#4A4A44]">Rol del Agente</label>
                <div className="flex gap-2">
                    <select 
                        value={ea.roleDefinitionId || ""} 
                        onChange={(e) => {
                            const roleId = e.target.value;
                            const roleDef = roles.find(r => r.id === roleId);
                            if (roleDef) {
                                onEditChange({ 
                                    ...ea, 
                                    roleDefinitionId: roleId,
                                    role: roleDef.slug,
                                    description: roleDef.description || ea.description,
                                    personality: roleDef.personality || ea.personality,
                                    guidelines: roleDef.guidelines || ea.guidelines
                                });
                            } else {
                                onEditChange({ ...ea, roleDefinitionId: "" });
                            }
                        }} 
                        className="edit-input flex-1"
                    >
                        <option value="">Custom Role</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {!ea.roleDefinitionId && (
                        <input value={ea.role} onChange={(e) => onEditChange({ ...ea, role: e.target.value })} className="edit-input flex-1" placeholder="Slug del rol" />
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Social/Office Wing Settings (Claw3D) */}
          <div className="p-4 bg-[#F7F7F5] dark:bg-[#1A1A18] rounded-xl border border-[#E8E8E4] dark:border-[#2A2A26] space-y-4">
             <div className="flex items-center gap-2 mb-2 text-[#3A3A36] dark:text-[#F0EFE9]">
                <MapPin size={14} className="text-[#4F9CF9]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Configuración de Oficina & Social (Claw3D)</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8B8B85]">Ala de Oficina (Wing)</label>
                  <input value={ea.officeWing || ""} onChange={(e) => onEditChange({...ea, officeWing: e.target.value})} className="edit-input w-full" placeholder="Ej: Tech, Strategy" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8B8B85]">Piso (Floor)</label>
                  <input type="number" value={ea.officeFloor || 1} onChange={(e) => onEditChange({...ea, officeFloor: parseInt(e.target.value)})} className="edit-input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8B8B85]">Escritorio</label>
                  <select
                    value={ea.officeDesk || ""}
                    onChange={(e) => {
                      const desk = officeDesks.find(d => d.id === e.target.value);
                      onEditChange({...ea,
                        officeDesk: e.target.value || undefined,
                        officeWing: desk?.wing || ea.officeWing,
                        officeFloor: desk?.floor ?? ea.officeFloor
                      });
                    }}
                    className="edit-input w-full"
                  >
                    <option value="">— Sin asignar —</option>
                    {officeDesks.map((d: any) => (
                      <option key={d.id} value={d.id} disabled={d.occupied && d.id !== ea.officeDesk}>
                        {d.occupied && d.id !== ea.officeDesk
                          ? `🔴 ${d.label} (${d.occupantName})`
                          : `🟢 ${d.label}`
                        }
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8B8B85]">Estado Inicial</label>
                  <select value={ea.status || "idle"} onChange={(e) => onEditChange({...ea, status: e.target.value})} className="edit-input w-full">
                    <option value="idle">Inactivo (Idle)</option>
                    <option value="working">Trabajando</option>
                    <option value="sitting">Sentado</option>
                    <option value="walking">Caminando</option>
                    <option value="dancing">Bailando 💃</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-[#8B8B85]">Computador</label>
                  <select value={ea.computerType || "high-end-pc"} onChange={(e) => onEditChange({...ea, computerType: e.target.value})} className="edit-input w-full">
                    <option value="high-end-pc">PC High-End</option>
                    <option value="macbook">MacBook Pro</option>
                    <option value="laptop">Laptop Estándar</option>
                    <option value="workstation">Workstation</option>
                  </select>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2 text-[#8B8B85]">
                      <Users size={12}/>
                      <label className="text-[10px] font-semibold">Comportamiento en Standups</label>
                   </div>
                   <select value={ea.standupBehavior || "Participant"} onChange={(e) => onEditChange({...ea, standupBehavior: e.target.value})} className="edit-input w-full">
                      <option value="Leader">Líder (Facilita la sesión)</option>
                      <option value="Participant">Participante (Habla y opina)</option>
                      <option value="Listener">Oyente (Solo escucha)</option>
                      <option value="Observer">Observador (Toma notas)</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2 text-[#8B8B85]">
                      <ImageIcon size={12}/>
                      <label className="text-[10px] font-semibold">Estilo de Avatar 3D</label>
                   </div>
                   <select value={ea.avatarStyle || "pixel"} onChange={(e) => onEditChange({...ea, avatarStyle: e.target.value})} className="edit-input w-full">
                      <option value="3d">Modelado 3D (High Res)</option>
                      <option value="pixel">Pixel Art (Retro)</option>
                      <option value="emoji">Emoji Animado</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Personality & Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { field: "personality", label: "Rasgos de Persona", icon: <Brain size={12}/> },
              { field: "context",     label: "Biografía Experta", icon: <User size={12}/> },
              { field: "guidelines",  label: "Protocolos",  icon: <MessageSquareCode size={12}/> },
            ].map(({ field, label, icon }) => (
              <div key={field} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#B0B0A8] dark:text-[#4A4A44]">
                  {icon}
                  <label className="text-[10px] font-semibold uppercase tracking-widest">{label}</label>
                </div>
                <textarea rows={4} value={(ea as any)[field] || ""} onChange={(e) => onEditChange({ ...ea, [field]: e.target.value })} className="edit-textarea w-full" />
              </div>
            ))}
          </div>

          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-[11px] font-semibold text-[#4F9CF9] hover:text-[#3D8EE8] transition-colors">
            {showAdvanced ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            {showAdvanced ? "Ocultar configuraciones avanzadas" : "Mostrar configuraciones de IA & OCEAN"}
          </button>

          {showAdvanced && (
            <div className="space-y-6 pt-2 border-t border-[#F0F0EC] dark:border-[#1E1E1C] animate-in fade-in duration-300">
              {/* OCEAN Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { field: "openness", label: "Apertura" },
                  { field: "conscientiousness", label: "Responsabilidad" },
                  { field: "extraversion", label: "Extraversión" },
                  { field: "agreeableness", label: "Amabilidad" },
                  { field: "neuroticism", label: "Estabilidad" },
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-[#3A3A36] dark:text-[#C8C7BF]">{label}</label>
                      <span className="text-[10px] text-[#4F9CF9] font-mono">{(ea as any)[field] || 0.5}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={(ea as any)[field] || 0.5} onChange={(e) => onEditChange({ ...ea, [field]: parseFloat(e.target.value) })} className="w-full accent-[#4F9CF9]" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5"><label className="text-[10px] font-bold">Temperatura</label><input type="range" min="0" max="1" step="0.1" value={ea.temperature || 0.7} onChange={(e) => onEditChange({ ...ea, temperature: parseFloat(e.target.value) })} className="w-full" /></div>
                 <div className="space-y-1.5"><label className="text-[10px] font-bold">Tokens</label><input type="number" value={ea.maxTokens || 4096} onChange={(e) => onEditChange({ ...ea, maxTokens: parseInt(e.target.value) })} className="edit-input w-full" /></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F0F0EC] dark:border-[#1E1E1C]">
            <div className="flex items-center gap-2 flex-wrap">
              {CONNECTOR_CONFIG.map(({ key, label, icon: Icon, activeClass }) => {
                const active = ea.connectors.includes(key);
                return (
                  <button key={key} onClick={() => onToggleConnector(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${active ? activeClass : "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#E8E8E4] dark:border-[#2A2A26] text-[#8B8B85]"}`}>
                    <Icon size={12} strokeWidth={1.8} />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onCancelEdit} className="px-4 py-2 rounded-lg text-[12px] font-medium bg-[#F7F7F5] dark:bg-[#1A1A18] border border-[#E8E8E4] dark:border-[#2A2A26]">Cancelar</button>
              <button onClick={onSaveEdit} disabled={saving} className="px-4 py-2 rounded-lg text-[12px] font-medium bg-[#4F9CF9] hover:bg-[#3D8EE8] text-white flex items-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Actualizar Agente
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .edit-input { height: 2.25rem; padding: 0 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 500; background-color: #F7F7F5; border: 1px solid #E8E8E4; color: #1A1A18; transition: all 0.15s; }
        :global(.dark) .edit-input { background-color: #1A1A18; border-color: #2A2A26; color: #F0EFE9; }
        .edit-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(79, 156, 249, 0.3); border-color: #4F9CF9; }
        .edit-textarea { padding: 0.625rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; resize: none; background-color: #F7F7F5; border: 1px solid #E8E8E4; color: #1A1A18; transition: all 0.15s; }
        :global(.dark) .edit-textarea { background-color: #1A1A18; border-color: #2A2A26; color: #F0EFE9; }
        .edit-textarea:focus { outline: none; box-shadow: 0 0 0 2px rgba(79, 156, 249, 0.3); border-color: #4F9CF9; }
      `}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#E8E8E4] dark:border-[#252522] py-16 flex flex-col items-center gap-4 text-center">
      <Bot size={16} className="text-[#B0B0A8] dark:text-[#4A4A44]" />
      <p className="text-[13px] font-medium text-[#3A3A36] dark:text-[#C8C7BF]">Sin agentes configurados</p>
    </div>
  );
}