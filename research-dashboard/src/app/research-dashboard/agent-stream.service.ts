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
