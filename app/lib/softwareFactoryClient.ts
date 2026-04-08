/**
 * Software Factory - API Client for Frontend
 * 
 * Este archivo contiene funciones para conectar tu componente React
 * con el backend de Software Factory (FastAPI + WebSocket)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ===========================================
// Tipos / Interfaces
// ===========================================

export interface Phase {
  id: number;
  label: string;
  icon: string;
  agent: string;
  color: string;
  output: string;
}

export interface PipelineStatus {
  session_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  current_phase: number | null;
  completed_phases: number[];
  logs: string[];
  result: any;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateResponse {
  session_id: string;
  status: 'started';
  message: string;
  websocket_url: string;
}

export interface AgentActivity {
  id: string;
  agentName: string;
  agentRole: string;
  status: string;
  model?: string;
  taskDescription?: string;
  thoughtProcess?: string;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  costEstimate?: number;
  startTime?: string;
  endTime?: string;
}

export interface WebSocketMessage {
  type: string;
  session_id?: string;
  phase_id?: number;
  phase_label?: string;
  phase_color?: string;
  agent_label?: string;
  logs?: string[];
  done?: boolean;
  result?: any;
  error?: string;
  message?: string;
  status?: string;
  current_phase?: number;
  completed_phases?: number[];
  currentPhase?: number;
  completedPhases?: number[];
  project?: any;
  notionDoc?: any;
  notionDocType?: string;
  history?: Array<{ id: string; role: string; content: string; createdAt: string | null }>;
  docs?: any[];
  repoUrl?: string;
  repoFullName?: string;
  repoRefreshAt?: string;
  refreshAt?: string;
  githubRepos?: Array<{ name?: string; url?: string; fullName?: string }>;
  agentActivities?: AgentActivity[];
  pipelineLogs?: Array<{
    type: string;
    message: string;
    detail?: string;
    level: string;
    phaseId?: number;
    phaseLabel?: string;
    agentName?: string;
    agentRole?: string;
    createdAt?: string;
  }>;
}

function sanitizeRepoToken(value: string): string {
  return (value || "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");
}

function toRepoUrl(raw?: string | null, fullName?: string | null): string | null {
  const candidate = sanitizeRepoToken(raw || "");
  if (candidate) {
    if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
      const normalized = candidate
        .replace("http://", "https://")
        .replace("www.github.com/", "github.com/")
        .replace("https://www.github.com/", "https://github.com/");
      const match = normalized.match(/^https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/i);
      if (!match?.[1]) return null;
      return `https://github.com/${match[1]}`;
    }
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate)) {
      return null;
    }
    return `https://github.com/${candidate}`;
  }
  const full = sanitizeRepoToken(fullName || "");
  if (!full || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(full)) return null;
  return `https://github.com/${full}`;
}

function resolveRepoUrl(message: WebSocketMessage): string | null {
  const direct = toRepoUrl(message.repoUrl, message.repoFullName);
  if (direct) return direct;

  const fromProject = toRepoUrl(message.project?.repoUrl, message.project?.repoFullName);
  if (fromProject) return fromProject;

  const fromResult = toRepoUrl(message.result?.repoUrl, message.result?.repoFullName);
  if (fromResult) return fromResult;

  if (Array.isArray(message.githubRepos) && message.githubRepos.length > 0) {
    const latest = message.githubRepos[message.githubRepos.length - 1];
    const fromRepos = toRepoUrl(latest?.url, latest?.fullName);
    if (fromRepos) return fromRepos;
  }

  const textSources: string[] = [];
  if (typeof message.message === "string") textSources.push(message.message);
  if (Array.isArray(message.logs)) textSources.push(...message.logs.filter((x): x is string => typeof x === "string"));
  if (Array.isArray(message.history)) textSources.push(...message.history.map((h) => h.content || ""));
  if (Array.isArray(message.pipelineLogs)) {
    for (const pl of message.pipelineLogs) {
      if (typeof pl.message === "string") textSources.push(pl.message);
      if (typeof pl.detail === "string") textSources.push(pl.detail);
    }
  }

  const extractFromText = (text: string): string | null => {
    const byUrl = text.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?)/i);
    if (byUrl?.[1]) return byUrl[1];

    const byLabel = text.match(/(?:repo(?:sitorio)?|repository)\s*[:=]?\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?)/i);
    if (byLabel?.[1]) return byLabel[1];

    return null;
  };

  for (const src of textSources) {
    const candidateFullName = extractFromText(src);
    const byText = toRepoUrl(undefined, candidateFullName);
    if (byText) return byText;
  }

  return null;
}

// Colores de las fases (debe coincidir con el backend)
export const PHASE_COLORS: Record<number, string> = {
  1: '#7C9A92', // Requirements
  2: '#8B9DC3', // Architecture
  3: '#C4956A', // Development
  4: '#9B7EC8', // QA
  5: '#7BA3A0', // Docs
  6: '#B5896F', // DevOps
};

export const PHASES: Phase[] = [
  { id: 1, label: 'Requirements', icon: 'FileText', agent: 'requirements_agent', color: '#7C9A92', output: 'notion' },
  { id: 2, label: 'Architecture', icon: 'Layers', agent: 'architecture_agent', color: '#8B9DC3', output: 'notion' },
  { id: 3, label: 'Development', icon: 'Code2', agent: 'development_agent', color: '#C4956A', output: 'github' },
  { id: 4, label: 'QA & Tests', icon: 'TestTube2', agent: 'qa_agent', color: '#9B7EC8', output: 'github' },
  { id: 5, label: 'Docs', icon: 'BookOpen', agent: 'documentation_agent', color: '#7BA3A0', output: 'both' },
  { id: 6, label: 'DevOps', icon: 'Server', agent: 'devops_agent', color: '#B5896F', output: 'github' },
];

// ===========================================
// API Client (sin hooks)
// ===========================================

class SoftwareFactoryClient {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private reconnectTimeoutRef: NodeJS.Timeout | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Inicia un nuevo pipeline de generación
   */
  async generate(prompt: string, token?: string, projectName?: string, webhookUrl?: string, sessionId?: string): Promise<GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ 
        prompt, 
        project_name: projectName,
        webhook_url: webhookUrl,
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error iniciando pipeline');
    }

    return response.json();
  }

  /**
   * Obtiene el estado de una sesión
   */
  async getStatus(sessionId: string, token?: string): Promise<PipelineStatus> {
    const response = await fetch(`${this.baseUrl}/api/status/${sessionId}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Sesión no encontrada');
    }

    return response.json();
  }

  /**
   * Lista todas las sesiones
   */
  async listSessions(token?: string): Promise<{ total: number; sessions: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    return response.json();
  }

  /**
   * Elimina una sesión
   */
  async deleteSession(sessionId: string, token?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Error eliminando sesión');
    }
  }

  /**
   * Conecta al WebSocket para updates en tiempo real
   */
  connectWebSocket(sessionId: string, onMessage: (msg: WebSocketMessage) => void, onClose?: () => void): void {
    this.disconnectWebSocket();

    const wsUrl = this.baseUrl.replace('http', 'ws') + `/api/ws/${sessionId}`;
    console.log('Conectando WebSocket:', wsUrl);
    
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log('WebSocket conectado:', sessionId);
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessage(message);
      } catch (e) {
        console.error('Error parseando mensaje WebSocket:', e);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket desconectado');
      if (onClose) onClose();
    };
  }

  /**
   * Desconecta el WebSocket
   */
  disconnectWebSocket(): void {
    if (this.reconnectTimeoutRef) {
      clearTimeout(this.reconnectTimeoutRef);
      this.reconnectTimeoutRef = null;
    }
    if (this.wsConnection) {
      this.wsConnection.onclose = null; // Prevent triggering reconnect callback on intentional close
      this.wsConnection.onerror = null;
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Instancia por defecto
export const apiClient = new SoftwareFactoryClient();

// ===========================================
// React Hook: useSoftwareFactory
// ===========================================

interface UseSoftwareFactoryOptions {
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

interface UseSoftwareFactoryReturn {
  // Estado
  isConnected: boolean;
  isRunning: boolean;
  isAwaitingApproval: boolean;
  approvalMessage: string | null;
  currentPhase: number | null;
  completedPhases: number[];
  logs: string[];
  result: any;
  error: string | null;
  sessionId: string | null;
  
  docs: any[];
  repoUrl: string | null;
  repoRefreshAt: number;
  
  // Acciones
  startPipeline: (prompt: string, projectName?: string) => Promise<void>;
  connectToSession: (sessionId: string) => void;
  listSessions: () => Promise<any[]>;
  disconnect: () => void;
  clearSession: () => void;
  resume: (sessionId: string) => Promise<void>;
  approve: () => Promise<void>;
  reject: (feedback: string) => Promise<void>;
}

export function useSoftwareFactory(options: UseSoftwareFactoryOptions = {}): UseSoftwareFactoryReturn {
  const { 
    token,
    autoReconnect = true,
    reconnectInterval = 5000 
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [client] = useState(() => new SoftwareFactoryClient(baseUrl));
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAwaitingApproval, setIsAwaitingApproval] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [docs, setDocs] = useState<any[]>([]);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [repoRefreshAt, setRepoRefreshAt] = useState<number>(0);

  const touchRepoFromMessage = useCallback((message: WebSocketMessage) => {
    const resolvedRepo = resolveRepoUrl(message);
    if (!resolvedRepo) return;
    setRepoUrl(resolvedRepo);
    const refreshRaw = (message.repoRefreshAt || message.refreshAt || "").trim();
    const parsed = refreshRaw ? Date.parse(refreshRaw) : NaN;
    setRepoRefreshAt(Number.isFinite(parsed) ? parsed : Date.now());
  }, []);

  // Manejar mensajes WebSocket
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('WS Message:', message);

    switch (message.type) {
      case 'session_state':
        setIsConnected(true);
        if (message.status) sessionStatusRef.current = message.status;
        if (message.currentPhase !== undefined) setCurrentPhase(message.currentPhase);
        if (message.completedPhases) setCompletedPhases(message.completedPhases);

        if (message.status === 'completed') {
          setIsRunning(false);
          setResult(message.result || { resumed: true });
        } else if (message.status === 'failed') {
          setIsRunning(false);
          setError(message.error || 'Pipeline fallido.');
        } else if (message.status === 'running' || message.status === 'started' || message.status === 'approved') {
          setIsRunning(true);
          setIsAwaitingApproval(false);
        } else if (message.status === 'awaiting_approval') {
          setIsRunning(true);
          setIsAwaitingApproval(true);
        }
        
        // 1. Prioridad: PipelineLogs persistidos (el sistema de base de datos)
        if (message.pipelineLogs && Array.isArray(message.pipelineLogs) && message.pipelineLogs.length > 0) {
          const formattedLogs = message.pipelineLogs.map(log => {
            const msg = log.message || "";
            if (log.type === 'phase_start') return `FASE — ${log.phaseLabel || log.agentName || 'Nueva Fase'}`;
            if (log.type === 'agent_thought' || log.type === 'agent_log') return `🤖 ${msg}`;
            if (log.type === 'agent_tool_call') return `🔧 ${msg}`;
            if (log.type === 'agent_tool_result') return `✅ ${msg}`;
            if (log.type === 'awaiting_approval') return `[⚠️] ${msg}`;
            if (log.type === 'hitl_approved') return `[✅] ${msg}`;
            if (log.type === 'pipeline_error') return `[❌] ${msg}`;
            return msg;
          }).filter(l => l.length > 0);
          setLogs(formattedLogs);
        }
        // 2. Fallback: Reconstruir desde agentActivities
        else if (message.agentActivities && Array.isArray(message.agentActivities) && message.agentActivities.length > 0) {
          const reconstructed: string[] = [];
          for (const act of message.agentActivities) {
            reconstructed.push(`FASE — ${act.agentName}`);
            if (act.taskDescription) reconstructed.push(`🧑 PROMPT: ${act.taskDescription}`);
            if (act.thoughtProcess) {
              const lines = act.thoughtProcess.split('\n').filter((l: string) => l.trim());
              reconstructed.push(...lines);
            }
            const statusEmoji = act.status === 'completed' ? '✅' : act.status === 'failed' ? '❌' : '⏳';
            reconstructed.push(`${statusEmoji} ${act.agentName} — ${act.status}`);
          }
          setLogs(reconstructed);
        } 
        // 3. Última opción: Historial de mensajes
        else if (message.history && Array.isArray(message.history)) {
          const historyLogs = message.history.map((h: any) => `[${h.role === 'user' ? '🧑 PROMPT' : '🤖 AGENTE'}] ${h.content}`);
          setLogs(historyLogs);
        }
        if (message.docs && Array.isArray(message.docs)) {
          setDocs(message.docs);
        }
        touchRepoFromMessage(message);
        break;

      case 'pipeline_start':
        setIsRunning(true);
        setIsAwaitingApproval(false);
        setError(null);
        setLogs(message.logs || []);
        break;

      case 'awaiting_approval':
        setIsAwaitingApproval(true);
        setApprovalMessage(message.message || "Awaiting Human Approval...");
        setLogs(prev => [...prev, `[✅] PAUSA: ${message.message}`]);
        break;

      case 'approved':
        setIsAwaitingApproval(false);
        setApprovalMessage(null);
        setLogs(prev => [...prev, `[✅] ${message.message}`]);
        break;

      case 'phase_start':
        setIsAwaitingApproval(false);
        setCurrentPhase(message.phase_id ?? null);
        setLogs(prev => [...prev, ...(message.logs || [])]);
        break;

      case 'phase_complete':
        setCompletedPhases(prev => (message.phase_id && !prev.includes(message.phase_id)) ? [...prev, message.phase_id] : prev);
        setLogs(prev => [...prev, ...(message.logs || [])]);
        if (message.docs && Array.isArray(message.docs) && message.docs.length > 0) setDocs(message.docs);
        else if (message.notionDoc) setDocs(prev => [...prev, message.notionDoc]);
        touchRepoFromMessage(message);
        break;

      case 'repo_update':
        touchRepoFromMessage(message);
        break;

      case 'agent_log':
      case 'agent_tool_call':
      case 'agent_tool_result':
        // Logs de streaming en tiempo real de los agentes (pensamientos y herramientas)
        if (message.logs && Array.isArray(message.logs)) {
          setLogs(prev => [...prev, ...((message.logs || []) as string[])]);
        }
        break;

      case 'pipeline_complete':
        setIsRunning(false);
        setIsAwaitingApproval(false);
        setResult(message.result);
        if (message.result?.docs) setDocs(prev => [...prev, ...message.result.docs]);
        touchRepoFromMessage(message);
        break;

      case 'pipeline_error':
        setIsRunning(false);
        setIsAwaitingApproval(false);
        setError(message.error || 'Error desconocido');
        break;
    }
  }, [touchRepoFromMessage]);

  const sessionStatusRef = useRef<string | null>(null);

  const connectToSession = useCallback((sid: string) => {
    setSessionId(sid);
    const attemptConnect = () => {
      if (sessionStatusRef.current === 'completed' || sessionStatusRef.current === 'failed') return;
      client.connectWebSocket(sid, handleWebSocketMessage, () => {
        if (sessionStatusRef.current === 'completed' || sessionStatusRef.current === 'failed') return;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => attemptConnect(), 3000);
      });
    };
    attemptConnect();
  }, [client, handleWebSocketMessage]);

  const listSessions = useCallback(async () => {
    try {
      const data: any = await client.listSessions(token);
      return Array.isArray(data) ? data : (data.sessions || []);
    } catch (e) {
      return [];
    }
  }, [client, token]);

  const startPipeline = useCallback(async (prompt: string, projectName?: string) => {
    try {
      setError(null);
      setLogs([]);
      setResult(null);
      setCompletedPhases([]);
      const response = await client.generate(prompt, token, projectName);
      setSessionId(response.session_id);
      setIsRunning(true);
      client.connectWebSocket(response.session_id, handleWebSocketMessage);
    } catch (e: any) {
      setError(e.message || 'Error iniciando pipeline');
      setIsRunning(false);
    }
  }, [client, handleWebSocketMessage, token]);

  const disconnect = useCallback(() => {
    client.disconnectWebSocket();
    setIsConnected(false);
  }, [client]);

  const clearSession = useCallback(() => {
    disconnect();
    setSessionId(null);
    setIsRunning(false);
    setCurrentPhase(null);
    setCompletedPhases([]);
    setLogs([]);
    setResult(null);
    setError(null);
  }, [disconnect]);

  const resume = useCallback(async (sid: string) => {
    setIsRunning(true);
    setError(null);
    try {
      await client.generate("", token, undefined, undefined, sid);
    } catch (e: any) {
      setError(e.message || "Error reanudando la sesión");
      setIsRunning(false);
    }
  }, [client, token]);

  const approve = useCallback(async () => {
    if (!sessionId) return;
    try {
      const resp = await fetch(`${baseUrl}/api/approve/${sessionId}`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (!resp.ok) throw new Error("Approval failed");
    } catch (e) {
      console.error(e);
    }
  }, [baseUrl, sessionId, token]);

  const reject = useCallback(async (feedback: string) => {
    if (!sessionId) return;
    try {
      const resp = await fetch(`${baseUrl}/api/reject/${sessionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ message: feedback })
      });
      if (!resp.ok) throw new Error("Rejection failed");
    } catch (e) {
      console.error(e);
    }
  }, [baseUrl, sessionId, token]);

  useEffect(() => {
    return () => {
      client.disconnectWebSocket();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [client]);

  return {
    isConnected,
    isRunning,
    isAwaitingApproval,
    approvalMessage,
    currentPhase,
    completedPhases,
    logs,
    docs,
    repoUrl,
    repoRefreshAt,
    result,
    error,
    sessionId,
    startPipeline,
    connectToSession,
    listSessions,
    disconnect,
    clearSession,
    resume,
    approve,
    reject
  };
}

// ===========================================
// Utilidades
// ===========================================

/**
 * Genera un nombre de proyecto basado en el prompt
 */
export function generateProjectName(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('tarea') || p.includes('task')) return 'task-manager-api';
  if (p.includes('ecommerce') || p.includes('tienda')) return 'ecommerce-platform';
  if (p.includes('blog')) return 'blog-cms-api';
  if (p.includes('chat')) return 'realtime-chat-app';
  if (p.includes('inventario')) return 'inventory-system';
  if (p.includes('juego') || p.includes('game')) return 'game-project';
  if (p.includes('iot') || p.includes('sensor')) return 'iot-dashboard';
  if (p.includes('ml') || p.includes('machine learning')) return 'ml-pipeline';
  
  const words = prompt.split(' ').slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return words || 'my-project';
}

/**
 * Detecta el tipo de proyecto basado en el prompt
 */
export function detectProjectType(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('api') || p.includes('rest') || p.includes('backend')) return 'api';
  if (p.includes('juego') || p.includes('game') || p.includes('pygame')) return 'game';
  if (p.includes('app') && (p.includes('móvil') || p.includes('mobile') || p.includes('react native'))) return 'mobile';
  if (p.includes('web') || p.includes('frontend') || p.includes('react')) return 'web';
  if (p.includes('ml') || p.includes('machine learning') || p.includes('scikit')) return 'ml';
  if (p.includes('electron') || p.includes('escritorio') || p.includes('desktop')) return 'desktop';
  if (p.includes('solidity') || p.includes('smart contract') || p.includes('ethereum')) return 'blockchain';
  if (p.includes('iot') || p.includes('sensor') || p.includes('streamlit')) return 'iot';
  return 'general';
}

export default SoftwareFactoryClient;
