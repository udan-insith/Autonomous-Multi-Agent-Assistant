export type AgentId = 'query-optimizer' | 'paper-fetcher' | 'evaluator' | 'synthesizer';
export type AgentStatus = 'idle' | 'working' | 'completed' | 'failed';
export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  status: AgentStatus;
  progress: number;
  currentTask: string;
  updatedAt: number;
}

export interface AgentLog {
  id: string;
  agentId: AgentId;
  agentName: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}
export interface CitationNode {
  id: string;
  label: string;
  x: number;
  y: number;
  weight: number;
  discoveredAt: number;
}

export interface CitationEdge {
  id: string;
  source: string;
  target: string;
}

export interface SynthesisChunk {
  id: string;
  text: string;
  isHeading: boolean;
  timestamp: number;
}

export interface ResearchProject {
  id: string;
  topic: string;
  startedAt: number;
  status: 'running' | 'completed' | 'failed';
  agents: AgentState[];
  logs: AgentLog[];
  synthesis: string;
  citationNodes: CitationNode[];
  citationEdges: CitationEdge[];
}

export type AgentStreamEvent =
  | {
      type: 'agent-status';
      payload: { agentId: AgentId; status: AgentStatus; progress: number; currentTask: string };
    }
  | { type: 'log'; payload: AgentLog }
  | { type: 'synthesis-chunk'; payload: SynthesisChunk }
  | { type: 'citation-node'; payload: CitationNode }
  | { type: 'citation-edge'; payload: CitationEdge }
  | { type: 'run-complete'; payload: { completedAt: number } };
