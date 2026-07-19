import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TrackByFunction,
} from '@angular/core';
import {
  LucideAngularModule,
  Search,
  DownloadCloud,
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Radio,
  Network,
  BookOpen,
  Play,
  RotateCcw,
} from 'lucide-angular';
import { Observable, Subscription } from 'rxjs';

import { dashboardAnimations } from './dashboard.animations';/**
 * research-dashboard.ts
 * (This is the renamed dashboard.component.ts — Angular's newer CLI
 * schematics generate files without the ".component" segment.)
 */
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, TrackByFunction } from '@angular/core';
import { LucideAngularModule, Search, DownloadCloud, Scale, Sparkles, CheckCircle2, XCircle, Loader2, Radio, Network, BookOpen, Play, RotateCcw } from 'lucide-angular';
import { Observable, Subscription } from 'rxjs';

import { dashboardAnimations } from './dashboard.animations';
import { AgentStreamService } from './agent-stream.service';
import { AgentLog, AgentState, CitationEdge, CitationNode, ResearchProject } from './research-interfaces';

interface SynthesisBlock {
  id: string;
  isHeading: boolean;
  text: string;
}

/** Structural type for a lucide-angular icon data array, avoids an `any`. */
type IconRef = typeof Search;

@Component({
  selector: 'app-research-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './research-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: dashboardAnimations,
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly ICONS = {
    search: Search,
    fetch: DownloadCloud,
    evaluate: Scale,
    synthesize: Sparkles,
    check: CheckCircle2,
    fail: XCircle,
    spinner: Loader2,
    stream: Radio,
    graph: Network,
    review: BookOpen,
    play: Play,
    restart: RotateCcw,
  };

  readonly project$: Observable<ResearchProject> = this.stream.project$;
  readonly isRunning$: Observable<boolean> = this.stream.isRunning$;

  private synthesisCache = '';
  synthesisBlocks: SynthesisBlock[] = [];

  private sub = new Subscription();

  constructor(
    private readonly stream: AgentStreamService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    // Guard against SSR: the mock stream uses RxJS timers that must
    // only run in the browser, or the server render and the first
    // client hydration pass will disagree on what's on screen.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.stream.connect('Autonomous Multi-Agent Literature Synthesis');

    this.sub.add(
      this.project$.subscribe((project) => {
        if (project.synthesis !== this.synthesisCache) {
          this.synthesisCache = project.synthesis;
          this.synthesisBlocks = this.toBlocks(project.synthesis);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.stream.disconnect();
  }

  restartRun(): void {
    this.synthesisCache = '';
    this.synthesisBlocks = [];
    this.stream.connect('Autonomous Multi-Agent Literature Synthesis');
  }

  private toBlocks(raw: string): SynthesisBlock[] {
    return raw
      .split(/(?=## )/g)
      .filter((s) => s.trim().length > 0)
      .map((segment, i) => {
        const isHeading = segment.trim().startsWith('## ');
        return {
          id: `block-${i}`,
          isHeading,
          text: isHeading ? segment.replace(/^##\s*/, '').trim() : segment.trim(),
        };
      });
  }

  iconFor(agent: AgentState): IconRef {
    switch (agent.id) {
      case 'query-optimizer':
        return this.ICONS.search;
      case 'paper-fetcher':
        return this.ICONS.fetch;
      case 'evaluator':
        return this.ICONS.evaluate;
      case 'synthesizer':
        return this.ICONS.synthesize;
    }
  }

  statusLabel(status: AgentState['status']): string {
    switch (status) {
      case 'idle':
        return 'Idle';
      case 'working':
        return 'Working';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Retrying';
    }
  }

  nodePx(node: CitationNode, size = 480): { cx: number; cy: number } {
    return { cx: node.x * size, cy: node.y * size };
  }

  edgePoints(edge: CitationEdge, nodes: CitationNode[], size = 480): { x1: number; y1: number; x2: number; y2: number } | null {
    const center = { x: size / 2, y: size / 2 };
    const target = nodes.find((n) => n.label === edge.target);
    if (!target) return null;
    const t = this.nodePx(target, size);
    return { x1: center.x, y1: center.y, x2: t.cx, y2: t.cy };
  }

  logLevelClasses(level: AgentLog['level']): string {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-violet-300';
    }
  }

  trackAgent: TrackByFunction<AgentState> = (_, a) => a.id;
  trackLog: TrackByFunction<AgentLog> = (_, l) => l.id;
  trackNode: TrackByFunction<CitationNode> = (_, n) => n.id;
  trackEdge: TrackByFunction<CitationEdge> = (_, e) => e.id;
  trackBlock: TrackByFunction<SynthesisBlock> = (_, b) => b.id;
}

  CitationEdge,
  CitationNode,
  ResearchProject,
} from './research-interfaces';
@Component({
  selector: 'app-research-dashboard',
  imports: [],
  templateUrl: './research-dashboard.html',
  styleUrl: './research-dashboard.css',
})
export class ResearchDashboard {}
