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

  private readonly runningSubject = new BehaviorSubject<boolean>(false);
  readonly isRunning$ = this.runningSubject.asObservable();

  private activeSubscription: { unsubscribe: () => void } | null = null;

  private initialProject(): ResearchProject {
    return {
      id: nextId('project'),
      topic: 'Autonomous Multi-Agent Literature Synthesis',
      startedAt: Date.now(),
      status: 'running',
      agents: AGENT_SEED.map((a) => ({ ...a })),
      logs: [],
      synthesis: '',
      citationNodes: [],
      citationEdges: [],
    };
  }

  connect(topic = 'Autonomous Multi-Agent Literature Synthesis'): void {
    this.activeSubscription?.unsubscribe();
    this.runningSubject.next(true);
    this.activeSubscription = this.buildMockEvents(topic)
      .pipe(tap((event) => this.eventsSubject.next(event)))
      .subscribe({ complete: () => this.runningSubject.next(false) });
  }

  disconnect(): void {
    this.activeSubscription?.unsubscribe();
    this.activeSubscription = null;
    this.runningSubject.next(false);
  }

  private reduce(project: ResearchProject, event: AgentStreamEvent): ResearchProject {
    switch (event.type) {
      case 'agent-status':
        return {
          ...project,
          agents: project.agents.map((a) =>
            a.id === event.payload.agentId
              ? {
                  ...a,
                  status: event.payload.status,
                  progress: event.payload.progress,
                  currentTask: event.payload.currentTask,
                  updatedAt: Date.now(),
                }
              : a,
          ),
        };
      case 'log':
        return { ...project, logs: [...project.logs, event.payload].slice(-200) };
      case 'synthesis-chunk':
        return { ...project, synthesis: project.synthesis + event.payload.text };
      case 'citation-node':
        return { ...project, citationNodes: [...project.citationNodes, event.payload] };
      case 'citation-edge':
        return { ...project, citationEdges: [...project.citationEdges, event.payload] };
      case 'run-complete':
        return { ...project, status: 'completed' };
      default:
        return project;
    }
  }

  private buildMockEvents(topic: string): Observable<AgentStreamEvent> {
    const agentSequence: AgentId[] = [
      'query-optimizer',
      'paper-fetcher',
      'evaluator',
      'synthesizer',
    ];
    const steps: Array<Observable<AgentStreamEvent>> = [];

    agentSequence.forEach((agentId, agentIndex) => {
      const name = AGENT_SEED.find((a) => a.id === agentId)!.name;

      steps.push(
        of<AgentStreamEvent>({
          type: 'agent-status',
          payload: {
            agentId,
            status: 'working',
            progress: 5,
            currentTask: `Starting ${name.toLowerCase()} pass…`,
          },
        }).pipe(delay(agentIndex === 0 ? 400 : 200)),
      );

      const logsForAgent = LOG_TEMPLATES.filter((l) => l.agentId === agentId);
      logsForAgent.forEach((tpl, i) => {
        const progress = Math.round(((i + 1) / (logsForAgent.length + 1)) * 100);
        steps.push(
          of<AgentStreamEvent>({
            type: 'log',
            payload: {
              id: nextId('log'),
              agentId,
              agentName: name,
              level: tpl.level,
              message: tpl.message,
              timestamp: Date.now(),
            },
          }).pipe(delay(500 + Math.random() * 500)),
        );
        steps.push(
          of<AgentStreamEvent>({
            type: 'agent-status',
            payload: {
              agentId,
              status: 'working',
              progress,
              currentTask: tpl.message.replace(/^\[.*?\]\s*/, ''),
            },
          }).pipe(delay(50)),
        );
      });

      if (agentId === 'paper-fetcher') {
        const nodeLabels = [
          'Lewis et al. 2020',
          'Shuster 2023',
          'Agentic RAG 2025',
          'Chen & Wu 2024',
          'Multi-Agent Synth 2026',
        ];
        nodeLabels.forEach((label, i) => {
          steps.push(
            of<AgentStreamEvent>({
              type: 'citation-node',
              payload: {
                id: nextId('node'),
                label,
                x: 0.5 + 0.35 * Math.cos((i / nodeLabels.length) * 2 * Math.PI),
                y: 0.5 + 0.35 * Math.sin((i / nodeLabels.length) * 2 * Math.PI),
                weight: 4 + Math.round(Math.random() * 20),
                discoveredAt: Date.now(),
              },
            }).pipe(delay(350)),
          );
          if (i > 0) {
            steps.push(
              of<AgentStreamEvent>({
                type: 'citation-edge',
                payload: { id: nextId('edge'), source: 'root', target: nodeLabels[i] },
              }).pipe(delay(50)),
            );
          }
        });
      }

      if (agentId === 'synthesizer') {
        SYNTHESIS_SENTENCES.forEach((chunk) => {
          steps.push(
            of<AgentStreamEvent>({
              type: 'synthesis-chunk',
              payload: {
                id: nextId('chunk'),
                text: chunk.text,
                isHeading: chunk.heading,
                timestamp: Date.now(),
              },
            }).pipe(delay(chunk.heading ? 600 : 260)),
          );
        });
      }

      steps.push(
        of<AgentStreamEvent>({
          type: 'agent-status',
          payload: { agentId, status: 'completed', progress: 100, currentTask: 'Done.' },
        }).pipe(delay(300)),
      );
    });

    steps.push(
      of<AgentStreamEvent>({ type: 'run-complete', payload: { completedAt: Date.now() } }).pipe(
        delay(200),
      ),
    );

    if (Math.random() < 0.35) {
      steps.splice(
        agentSequence.indexOf('evaluator') * 6 + 2,
        0,
        of<AgentStreamEvent>({
          type: 'agent-status',
          payload: {
            agentId: 'evaluator',
            status: 'failed',
            progress: 40,
            currentTask: 'Rate limit hit, retrying…',
          },
        }).pipe(delay(700)),
        timer(900).pipe(
          concatMap(() =>
            of<AgentStreamEvent>({
              type: 'agent-status',
              payload: {
                agentId: 'evaluator',
                status: 'working',
                progress: 45,
                currentTask: 'Resumed after retry.',
              },
            }),
          ),
        ),
      );
    }

    return concat(...steps);
  }

  ngOnDestroy(): void {
    this.activeSubscription?.unsubscribe();
    this.eventsSubject.complete();
  }
}
