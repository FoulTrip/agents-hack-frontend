"use client"

import React from "react";
import { User, MessageSquare, Briefcase, ShieldCheck, Layers, Code2, ArrowRight } from "lucide-react";

interface TeamVisualizationProps {
  activePhase: number | null;
}

export function TeamVisualization({ activePhase }: TeamVisualizationProps) {
  const roleGroups = [
    {
      title: "Estrategia",
      roles: [
        { id: "advisor", label: "Advisor", icon: ShieldCheck, phaseId: 1 },
        { id: "experts", label: "Architects", icon: Layers, phaseId: 2 },
      ]
    },
    {
      title: "Ejecución",
      roles: [
        { id: "director", label: "Director", icon: Briefcase },
        { id: "devs", label: "Developers", icon: Code2, phaseId: 3 },
      ]
    },
    {
      title: "Entrega",
      roles: [
        { id: "spoc", label: "SPoC", icon: MessageSquare, phaseId: 4 },
        { id: "client", label: "Cliente", icon: User, phaseId: 4 },
      ]
    }
  ];

  return (
    <div className="w-full bg-[#0F172A]/40 rounded-[40px] border border-[#1E293B] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] bg-size-[20px_20px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4">
        {roleGroups.map((group, groupIdx) => (
          <React.Fragment key={group.title}>
            {/* Group Container */}
            <div className="flex-1 flex flex-col items-center gap-6 w-full">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-40">{group.title}</span>
              
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {group.roles.map((role) => {
                  const isDirector = role.id === "director";
                  // The role is lit if it's the director (active manager) or its phase <= current active phase
                  const isLit = activePhase ? (role.phaseId ? role.phaseId <= activePhase : isDirector) : false;
                  // It is the current phase if its phase === activePhase, or the director which is always current
                  const isCurrent = activePhase === role.phaseId || (isDirector && activePhase !== null && activePhase > 0);
                  const Icon = role.icon;
                  return (
                    <div key={role.id} className="flex flex-col items-center gap-3 group/role">
                      <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[28px] flex items-center justify-center border-2 transition-all duration-700 ${
                        isCurrent 
                        ? "bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-110 z-10" 
                        : isLit 
                           ? "bg-indigo-600/60 border-indigo-500/60 shadow-lg shadow-indigo-500/20"
                           : "bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600 hover:bg-slate-800"
                      }`}>
                        <Icon size={isCurrent ? 32 : 28} className={`${isLit ? "text-white" : "text-slate-600"} transition-all duration-500`} />
                        
                        {isLit && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0F172A] ${isCurrent ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-emerald-500/70'}`} />
                        )}

                        {/* Hover Effect */}
                        {!isLit && (
                          <div className="absolute inset-0 bg-indigo-500/0 group-hover/role:bg-indigo-500/5 transition-colors rounded-[28px]" />
                        )}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isCurrent ? "text-white" : isLit ? "text-indigo-200" : "text-slate-500"}`}>
                        {role.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connecting Arrow (Hidden on last group and mobile) */}
            {groupIdx < roleGroups.length - 1 && (
              <div className="hidden md:flex items-center text-slate-800">
                <ArrowRight size={20} className="animate-pulse" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
