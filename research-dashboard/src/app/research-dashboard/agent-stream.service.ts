import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, concat, of, timer } from 'rxjs';
import { concatMap, delay, scan, shareReplay, tap } from 'rxjs/operators';
import {
  AgentId,
  AgentLog,
  AgentState,
  AgentStreamEvent,
  CitationEdge,
  CitationNode,
  LogLevel,
  ResearchProject,
  SynthesisChunk,
} from './research-interfaces';

const AGENT_SEED: AgentState[] = [
  {
    id: 'query-optimizer',
    name: 'Query Optimizer',
    role: 'Reformulates & expands the research question',
    icon: 'search',
    status: 'idle',
    progress: 0,
    currentTask: 'Awaiting instructions…',
    updatedAt: Date.now(),
  },
  {
    id: 'paper-fetcher',
    name: 'Paper Fetcher',
    role: 'Retrieves candidate papers from academic indices',
    icon: 'download-cloud',
    status: 'idle',
    progress: 0,
    currentTask: 'Awaiting instructions…',
    updatedAt: Date.now(),
  },
  {
    id: 'evaluator',
    name: 'Evaluator',
    role: 'Scores relevance & methodological quality',
    icon: 'scale',
    status: 'idle',
    progress: 0,
    currentTask: 'Awaiting instructions…',
    updatedAt: Date.now(),
  },
  {
    id: 'synthesizer',
    name: 'Synthesizer',
    role: 'Drafts the literature review from evaluated sources',
    icon: 'sparkles',
    status: 'idle',
    progress: 0,
    currentTask: 'Awaiting instructions…',
    updatedAt: Date.now(),
  },
];

const SYNTHESIS_SENTENCES: Array<{ text: string; heading: boolean }> = [
  { text: '## 1. Introduction', heading: true },
  {
    text: 'Recent advances in retrieval-augmented generation have reframed how literature reviews are assembled. ',
    heading: false,
  },
  {
    text: 'Autonomous agent pipelines now decompose the task into query formulation, retrieval, evaluation, and synthesis. ',
    heading: false,
  },
  {
    text: 'This shift mirrors earlier moves from manual indexing toward embedding-based semantic search. ',
    heading: false,
  },
  { text: '## 2. Methodology Trends', heading: true },
  {
    text: 'Across the corpus, vector-similarity retrieval is consistently paired with a cross-encoder re-ranking stage. ',
    heading: false,
  },
  {
    text: 'Several papers report diminishing returns beyond a context window of roughly forty retrieved passages. ',
    heading: false,
  },
  {
    text: 'Evaluator agents increasingly rely on rubric-based scoring rather than single scalar relevance. ',
    heading: false,
  },
  { text: '## 3. Open Questions', heading: true },
  {
    text: 'Attribution fidelity — ensuring synthesized claims trace back to a specific source — remains only partially solved. ',
    heading: false,
  },
  {
    text: 'Multi-agent coordination overhead grows non-linearly once more than four specialized agents are introduced. ',
    heading: false,
  },
];

const LOG_TEMPLATES: Array<{ agentId: AgentId; level: LogLevel; message: string }> = [
  {
    agentId: 'query-optimizer',
    level: 'info',
    message: 'Expanding query with 6 semantically related terms…',
  },
  {
    agentId: 'query-optimizer',
    level: 'success',
    message: 'Optimized query ready: "RAG literature synthesis agents 2024-2026"',
  },
  {
    agentId: 'paper-fetcher',
    level: 'info',
    message: 'Querying arXiv, Semantic Scholar, and OpenAlex indices…',
  },
  {
    agentId: 'paper-fetcher',
    level: 'info',
    message: 'Fetched batch of 24 candidate papers (page 1/3)…',
  },
  { agentId: 'paper-fetcher', level: 'success', message: 'Retrieved 71 candidate papers total.' },
  {
    agentId: 'evaluator',
    level: 'info',
    message: '[Evaluator] Computing embedding vectors for candidate set…',
  },
  {
    agentId: 'evaluator',
    level: 'info',
    message: '[Evaluator] Vector distance matched at 0.89 for "Agentic Retrieval Pipelines"',
  },
  {
    agentId: 'evaluator',
    level: 'warning',
    message: '[Evaluator] Low methodological score (0.31) — flagging for exclusion',
  },
  {
    agentId: 'evaluator',
    level: 'success',
    message: '[Evaluator] 18 papers passed relevance threshold (>0.75)',
  },
  {
    agentId: 'synthesizer',
    level: 'info',
    message: '[Synthesizer] Clustering evaluated sources into 3 thematic groups…',
  },
  { agentId: 'synthesizer', level: 'info', message: '[Synthesizer] Drafting section 2 of 3…' },
  {
    agentId: 'synthesizer',
    level: 'success',
    message: '[Synthesizer] Draft synthesis complete, 812 words.',
  },
];

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

@Injectable({ providedIn: 'root' })
export class AgentStreamService implements OnDestroy {
  private readonly eventsSubject = new Subject<AgentStreamEvent>();
  readonly events$: Observable<AgentStreamEvent> = this.eventsSubject.asObservable();

  readonly project$: Observable<ResearchProject> = this.events$.pipe(
    scan((project, event) => this.reduce(project, event), this.initialProject()),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
