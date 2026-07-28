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

const SYNTHESIS_SENTENCES:Array<{ text: string; heading: boolean }> = [
  { text: '## 1. Introduction', heading: true },
  { text: 'Recent advances in retrieval-augmented generation have reframed how literature reviews are assembled. ', heading: false },
  { text: 'Autonomous agent pipelines now decompose the task into query formulation, retrieval, evaluation, and synthesis. ', heading: false },
  { text: 'This shift mirrors earlier moves from manual indexing toward embedding-based semantic search. ', heading: false },
  { text: '## 2. Methodology Trends', heading: true },
  { text: 'Across the corpus, vector-similarity retrieval is consistently paired with a cross-encoder re-ranking stage. ', heading: false },
  { text: 'Several papers report diminishing returns beyond a context window of roughly forty retrieved passages. ', heading: false },
  { text: 'Evaluator agents increasingly rely on rubric-based scoring rather than single scalar relevance. ', heading: false },
  { text: '## 3. Open Questions', heading: true },
  { text: 'Attribution fidelity — ensuring synthesized claims trace back to a specific source — remains only partially solved. ', heading: false },
  { text: 'Multi-agent coordination overhead grows non-linearly once more than four specialized agents are introduced. ', heading: false },
];
