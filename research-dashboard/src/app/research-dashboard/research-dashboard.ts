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

import { dashboardAnimations } from './dashboard.animations';
import { AgentStreamService } from './agent-stream.service';
import {
  AgentLog,
  AgentState,
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
