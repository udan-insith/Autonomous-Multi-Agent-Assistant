/**
 * research-interfaces.ts
 * Strongly-typed domain model for the Autonomous Multi-Agent
 * Academic Research Dashboard.
 */

/** The four autonomous agents that make up the swarm. */
export type AgentId = 'query-optimizer' | 'paper-fetcher' | 'evaluator' | 'synthesizer';

/** Lifecycle state of a single agent, driven by WebSocket events. */
export type AgentStatus = 'idle' | 'working' | 'completed' | 'failed';

/** Severity used to color-code streaming terminal output. */
export type LogLevel = 'info' | 'success' | 'warning' | 'error';

/**
 * Static + dynamic description of one agent card in the swarm panel.
 */
export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  /** Lucide icon name rendered on the card. */
  icon: string;
  status: AgentStatus;
  /** 0-100, drives progress ring / bar where applicable. */
  progress: number;
  /** Short human-readable line describing current activity. */
  currentTask: string;
  /** Unix ms timestamp of the last state transition. */
  updatedAt: number;
}

/**
 * A single line emitted into the real-time streaming terminal.
 */
export interface AgentLog {
  id: string;
  agentId: AgentId;
  agentName: string;
  level: LogLevel;
  message: string;
  timestamp: number;
}

/**
 * A single node in the citation graph placeholder.
 */
export interface CitationNode {
  id: string;
  label: string;
  /** Normalized 0-1 position, resolved to px by the component. */
  x: number;
  y: number;
  /** Citation count / weight, drives node radius. */
  weight: number;
  discoveredAt: number;
}

/**
 * A directed edge between two citation nodes (paper -> cited paper).
 */
export interface CitationEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * A chunk of streamed synthesis text arriving over the WebSocket,
 * intended to be appended to the literature review canvas.
 */
export interface SynthesisChunk {
  id: string;
  text: string;
  /** True when this chunk starts a new section/heading. */
  isHeading: boolean;
  timestamp: number;
}

/**
 * Aggregate state for the whole research run, composed by the service
 * and consumed directly by the dashboard component.
 */
export interface ResearchProject {
  id: string;
  topic: string;
  startedAt: number;
  /** Overall run status derived from agent states. */
  status: 'running' | 'completed' | 'failed';
  agents: AgentState[];
  logs: AgentLog[];
  synthesis: string;
  citationNodes: CitationNode[];
  citationEdges: CitationEdge[];
}

/** Discriminated union of every event the mock/live WebSocket can emit. */
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
