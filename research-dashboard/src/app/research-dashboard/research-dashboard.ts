import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TrackByFunction,
  inject,
} from '@angular/core';
import {
  LucideDynamicIcon,
  LucideSearch,
  LucideDownloadCloud,
  LucideScale,
  LucideSparkles,
  LucideCheckCircle2,
  LucideXCircle,
  LucideLoader2,
  LucideRadio,
  LucideNetwork,
  LucideBookOpen,
  LucideRotateCcw,
  type LucideIconData,
} from '@lucide/angular';
import { Observable, Subscription } from 'rxjs';

import { dashboardAnimations } from './dashboard.animations';
import { AgentStreamService } from './agent-stream.service';
import {
  AgentLog,
  AgentState,
  CitationEdge,
  CitationNode,
  ResearchProject,
} from './research-interfaces';

interface SynthesisBlock {
  id: string;
  isHeading: boolean;
  text: string;
}

@Component({
  selector: 'app-research-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideCheckCircle2,
    LucideXCircle,
    LucideLoader2,
    LucideRadio,
    LucideNetwork,
    LucideBookOpen,
    LucideRotateCcw,
  ],
  templateUrl: './research-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: dashboardAnimations,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly stream = inject(AgentStreamService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly project$: Observable<ResearchProject> = this.stream.project$;
  readonly isRunning$: Observable<boolean> = this.stream.isRunning$;

  private synthesisCache = '';
  synthesisBlocks: SynthesisBlock[] = [];

  private sub = new Subscription();

  ngOnInit(): void {
    // SSR guard: skip starting timers on the server render pass.
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
  iconFor(agent: AgentState): LucideIconData {
    switch (agent.id) {
      case 'query-optimizer':
        return LucideSearch.icon;
      case 'paper-fetcher':
        return LucideDownloadCloud.icon;
      case 'evaluator':
        return LucideScale.icon;
      case 'synthesizer':
        return LucideSparkles.icon;
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
}
