"use client";

import React, { useState } from "react";
import { 
  Plus, X, Bot, User, Code2, Users, Layout, 
  Sparkles, Check, ChevronDown, ChevronUp, Image as ImageIcon,
  Brain, MessageSquareCode, Target, Shield, Palette, Smile
} from "lucide-react";

interface CreateAgentModalProps {
  roles: any[];
  officeDesks: any[];
  onClose: () => void;
  onSave: (agentData: any) => Promise<void>;
}

export default function CreateAgentModal({ 
  roles, 
  officeDesks, 
  onClose, 
  onSave 
}: CreateAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"identity" | "persona" | "ocean" | "office">("identity");

  const [formData, setFormData] = useState({
    name: "",
    role: "development_agent",
    roleDefinitionId: "",
    icon: "Bot",
    color: "#4F9CF9",
    description: "",
    active: true,
    personality: "",
    context: "",
    guidelines: "",
    model: "gemini-3-flash-preview",
    temperature: 0.7,
    maxTokens: 4096,
    vibe: "Focused",
    emoji: "🤖",
    boundaries: "",
    operatingInstructions: "",
    openness: 0.7,
    conscientiousness: 0.8,
    extraversion: 0.5,
    agreeableness: 0.6,
    neuroticism: 0.2,
    officeDesk: "",
    officeWing: "Dev Wing",
    officeFloor: 1,
    avatarStyle: "pixel",
    socialTone: "Professional",
    standupBehavior: "Participant",
    computerType: "high-end-pc",
    connectors: ["github"],
    tools: ["code_editor", "browser_tool"]
  });

  const handleSave = async () => {
    if (!formData.name) {
      alert("Please provide a name for the agent.");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error creating agent");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const EMOJI_OPTIONS = ["🤖", "👨‍💻", "👩‍💻", "🦾", "⚡", "🧠", "🔍", "📐", "🚀", "🛡️", "📦"];
  const COLOR_OPTIONS = ["#4F9CF9", "#9333EA", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B8B85"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] rounded-2xl border border-[#E8E8E4] dark:border-[#252522] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E4] dark:border-[#252522]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 flex items-center justify-center">
              <Bot size={15} className="text-[#4F9CF9]" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">Create New Agent</h2>
              <p className="text-[11px] text-[#8B8B85]">Spawn a new specialized assistant in your factory.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] rounded-lg text-[#8B8B85] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-[#E8E8E4] dark:border-[#252522]">
           {[
             { id: "identity", label: "Identity", icon: User },
             { id: "persona", label: "Persona", icon: Brain },
             { id: "ocean", label: "AI Personality", icon: Sparkles },
             { id: "office", label: "Office & Social", icon: Layout },
           ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === tab.id
                  ? "bg-[#F7F7F5] dark:bg-[#1A1A18] text-[#1A1A18] dark:text-[#F0EFE9] border border-[#E8E8E4] dark:border-[#252522]"
                  : "text-[#8B8B85] hover:text-[#1A1A18] dark:hover:text-[#F0EFE9]"
                }`}
             >
                <tab.icon size={12} />
                {tab.label}
             </button>
           ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ── 1. IDENTITY ── */}
          {activeTab === "identity" && (
            <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Agent Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => updateField("name", e.target.value)}
                      placeholder="e.g. Architect-1"
                      className="edit-input w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Role Type</label>
                    <select 
                       value={formData.role} 
                       onChange={e => updateField("role", e.target.value)}
                       className="edit-input w-full"
                    >
                       <option value="requirements_agent">Requirements</option>
                       <option value="architecture_agent">Architect</option>
                       <option value="development_agent">Developer</option>
                       <option value="qa_agent">QA / Tester</option>
                       <option value="documentation_agent">Documentation</option>
                       <option value="devops_agent">DevOps</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Description</label>
                 <textarea 
                   rows={2} 
                   value={formData.description} 
                   onChange={e => updateField("description", e.target.value)}
                   className="edit-textarea w-full"
                   placeholder="Short overview of what this agent does..."
                 />
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Color Theme</label>
                    <div className="flex gap-2">
                       {COLOR_OPTIONS.map(c => (
                         <button 
                           key={c} 
                           onClick={() => updateField("color", c)}
                           className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? "border-[#1A1A18] dark:border-white" : "border-transparent"}`}
                           style={{ backgroundColor: c }}
                         />
                       ))}
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Vibe Emoji</label>
                    <div className="flex flex-wrap gap-2">
                       {EMOJI_OPTIONS.map(e => (
                         <button 
                           key={e} 
                           onClick={() => updateField("emoji", e)}
                           className={`w-8 h-8 rounded-lg flex items-center justify-center text-[16px] border ${formData.emoji === e ? "bg-[#F7F7F5] dark:bg-[#1A1A18] border-[#4F9CF9]" : "border-[#E8E8E4] dark:border-[#252522]"}`}
                         >
                           {e}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Model</label>
                     <select 
                       value={formData.model} 
                       onChange={e => updateField("model", e.target.value)}
                       className="edit-input w-full"
                     >
                       <option value="gemini-3-flash-preview">Gemini 3.1 Flash</option>
                       <option value="claude-3-5-sonnet@20240620">Claude 3.5 Sonnet</option>
                       <option value="gpt-4o">GPT-4o</option>
                     </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Temp</label>
                       <input 
                         type="number" 
                         step="0.1" 
                         value={formData.temperature} 
                         onChange={e => updateField("temperature", parseFloat(e.target.value))}
                         className="edit-input w-full"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Tokens</label>
                       <input 
                         type="number" 
                         value={formData.maxTokens} 
                         onChange={e => updateField("maxTokens", parseInt(e.target.value))}
                         className="edit-input w-full"
                       />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* ── 2. PERSONA ── */}
          {activeTab === "persona" && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#8B8B85]">
                     <Brain size={13}/>
                     <label className="text-[10px] font-bold uppercase tracking-widest">Core Personality Traits</label>
                  </div>
                  <textarea 
                    rows={4} 
                    value={formData.personality} 
                    onChange={e => updateField("personality", e.target.value)}
                    className="edit-textarea w-full"
                    placeholder="Witty, analytical, risk-averse..."
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#8B8B85]">
                     <User size={13}/>
                     <label className="text-[10px] font-bold uppercase tracking-widest">Expert Bio & Context</label>
                  </div>
                  <textarea 
                    rows={4} 
                    value={formData.context} 
                    onChange={e => updateField("context", e.target.value)}
                    className="edit-textarea w-full"
                    placeholder="10+ years of experience in distributed systems..."
                  />
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[#8B8B85]">
                     <Shield size={13}/>
                     <label className="text-[10px] font-bold uppercase tracking-widest">Boundaries & Constraints</label>
                  </div>
                  <textarea 
                    rows={3} 
                    value={formData.boundaries} 
                    onChange={e => updateField("boundaries", e.target.value)}
                    className="edit-textarea w-full"
                    placeholder="Never modifies database schemas without approval..."
                  />
               </div>
            </div>
          )}

          {/* ── 3. OCEAN PERSONALITY ── */}
          {activeTab === "ocean" && (
            <div className="space-y-10 py-6 animate-in fade-in zoom-in-95 duration-400">
              <div className="grid grid-cols-1 gap-12 max-w-lg mx-auto">
                {[
                  { field: "openness", label: "Openness", desc: "Curiosity vs Caution" },
                  { field: "conscientiousness", label: "Conscientiousness", desc: "Organization vs Carelessness" },
                  { field: "extraversion", label: "Extraversion", desc: "Outgoing vs Reserved" },
                  { field: "agreeableness", label: "Agreeableness", desc: "Compassionate vs Competitive" },
                  { field: "neuroticism", label: "Neuroticism (Stability)", desc: "Resilient vs Sensitive" },
                ].map(({ field, label, desc }) => (
                  <div key={field} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-[13px] font-bold text-[#1A1A18] dark:text-[#F0EFE9]">{label}</h4>
                        <p className="text-[10px] text-[#8B8B85]">{desc}</p>
                      </div>
                      <span className="text-[14px] font-mono font-bold text-[#4F9CF9]">{(formData as any)[field]}</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                       <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.05" 
                         value={(formData as any)[field]} 
                         onChange={e => updateField(field, parseFloat(e.target.value))} 
                         className="ocean-slider"
                       />
                       <div className="absolute top-8 w-full flex justify-between px-0.5">
                          <span className="text-[8px] font-bold text-[#B0B0A8]">LOW</span>
                          <span className="text-[8px] font-bold text-[#B0B0A8]">HIGH</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. OFFICE & SOCIAL ── */}
          {activeTab === "office" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Workstation Assignment</label>
                  <select 
                    value={formData.officeDesk} 
                    onChange={e => {
                      const desk = officeDesks.find(d => d.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        officeDesk: e.target.value,
                        officeWing: desk?.wing || prev.officeWing,
                        officeFloor: desk?.floor ?? prev.officeFloor
                      }));
                    }}
                    className="edit-input w-full"
                  >
                    <option value="">— Float (No Desk) —</option>
                    {officeDesks.map(d => (
                      <option key={d.id} value={d.id} disabled={d.occupied}>
                        {d.occupied ? `🔴 ${d.label} (${d.occupantName})` : `🟢 ${d.label}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Wing</label>
                  <input type="text" readOnly value={formData.officeWing} className="edit-input w-full bg-[#FAFAF8] cursor-not-allowed opacity-70" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Avatar Style</label>
                    <select 
                      value={formData.avatarStyle} 
                      onChange={e => updateField("avatarStyle", e.target.value)}
                      className="edit-input w-full"
                    >
                      <option value="pixel">Pixel Art (Clásico)</option>
                      <option value="3d">High Fidelity (Moderno)</option>
                      <option value="flat">Vectorial (Minimalista)</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Social Tone</label>
                    <select 
                      value={formData.socialTone} 
                      onChange={e => updateField("socialTone", e.target.value)}
                      className="edit-input w-full"
                    >
                      <option value="Professional">Profesional</option>
                      <option value="Friendly">Amigables / Chill</option>
                      <option value="Strict">Directo / Crítico</option>
                      <option value="Social">Social / Conversador</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Standup Behavior</label>
                    <select 
                      value={formData.standupBehavior} 
                      onChange={e => updateField("standupBehavior", e.target.value)}
                      className="edit-input w-full"
                    >
                      <option value="Participant">Regular Participant</option>
                      <option value="Leader">Session Leader</option>
                      <option value="Listener">Quiet Observer</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B85]">Hardware Setting</label>
                    <select 
                      value={formData.computerType} 
                      onChange={e => updateField("computerType", e.target.value)}
                      className="edit-input w-full"
                    >
                      <option value="high-end-pc">Alienware / PC Tower</option>
                      <option value="macbook">MacBook Pro M3</option>
                      <option value="laptop">Thin Laptop</option>
                      <option value="server">Rack Console</option>
                    </select>
                 </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3">
                 <Smile size={18} className="text-orange-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-orange-600 dark:text-orange-400 leading-relaxed">
                   <strong>Claw3D Sync:</strong> Estos ajustes alteran cómo el agente interactúa físicamente en la oficina virtual. El comportamiento OCEAN influirá en sus respuestas dinámicas y movimientos espontáneos.
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F7F5] dark:bg-[#1A1A18] border-t border-[#E8E8E4] dark:border-[#252522] flex items-center justify-between gap-4">
          <p className="text-[10px] text-[#8B8B85] max-w-[300px]">
             Saving this will spawn the agent immediately in the database and they will be ready for assignments.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-medium bg-white dark:bg-[#141413] border border-[#E8E8E4] dark:border-[#2A2A26] text-[#3A3A36] dark:text-[#C8C7BF] hover:bg-[#F0F0EC] dark:hover:bg-[#1E1E1C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-[12px] font-medium bg-[#4F9CF9] hover:bg-[#3D8EE8] text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Plus size={13} className="animate-spin" /> : <Plus size={13} />}
              Spawn Agent
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .edit-input { height: 2.25rem; padding: 0 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; font-weight: 500; background-color: #F7F7F5; border: 1px solid #E8E8E4; color: #1A1A18; transition: all 0.1s; }
        :global(.dark) .edit-input { background-color: #1A1A18; border-color: #2A2A26; color: #F0EFE9; }
        .edit-input:focus { outline: none; border-color: #4F9CF9; box-shadow: 0 0 0 2px rgba(79, 156, 249, 0.15); }
        .edit-textarea { padding: 0.625rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; resize: none; background-color: #F7F7F5; border: 1px solid #E8E8E4; color: #1A1A18; transition: all 0.1s; }
        :global(.dark) .edit-textarea { background-color: #1A1A18; border-color: #2A2A26; color: #F0EFE9; }
        .edit-textarea:focus { outline: none; border-color: #4F9CF9; box-shadow: 0 0 0 2px rgba(79, 156, 249, 0.15); }
        .ocean-slider { width: 100%; height: 6px; border-radius: 6px; background: #E8E8E4; outline: none; -webkit-appearance: none; }
        :global(.dark) .ocean-slider { background: #2A2A26; }
        .ocean-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #4F9CF9; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        :global(.dark) .ocean-slider::-webkit-slider-thumb { border-color: #1A1A18; }
      `}</style>
    </div>
  );
}
