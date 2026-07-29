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
}
