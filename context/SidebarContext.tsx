
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from "next-auth/react";

interface UserConfig {
  githubToken?: string;
  notionToken?: string;
  notionWorkspaceId?: string;
  gcpAccessToken?: string;
  gcpRefreshToken?: string;
}

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  sessions: any[];
  setSessions: (sessions: any[]) => void;
  isLoadingSessions: boolean;
  refreshSessions: () => Promise<void>;
  userConfig: UserConfig | null;
  refreshConfig: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;
  const [isOpen, setIsOpen] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (!isInitialized.current) {
        if (window.innerWidth >= 1024) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
        isInitialized.current = true;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const refreshSessions = useCallback(async () => {
    if (!accessToken) return;
    setIsLoadingSessions(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/sessions`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
        cache: "no-store"
      });
      if (resp.ok) {
        const data = await resp.json();
        setSessions(data);
      }
    } catch (e) {
      console.error("Error refreshing sessions in context:", e);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [accessToken]);

  const refreshConfig = useCallback(async () => {
    if (!accessToken) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const resp = await fetch(`${apiUrl}/api/user/config`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setUserConfig(data);
      }
    } catch (e) {
      console.error("Error refreshing user config in context:", e);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      refreshSessions();
      refreshConfig();
    } else {
      setSessions([]);
      setUserConfig(null);
    }
  }, [accessToken, refreshSessions, refreshConfig]);

  return (
    <SidebarContext.Provider value={{ 
      isOpen, setIsOpen, toggle, 
      sessions, setSessions, 
      isLoadingSessions, refreshSessions,
      userConfig, refreshConfig
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
