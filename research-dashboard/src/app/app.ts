import { Component } from '@angular/core';
import { LucideCheckCircle2 } from '@lucide/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideCheckCircle2],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center gap-3">
      <svg lucideCheckCircle2 class="h-8 w-8 text-emerald-400"></svg>
      <p class="text-emerald-400 text-xl font-bold">Tailwind + Lucide are working</p>
    </div>
  `,
})
export class App {}
