import { Component } from '@angular/core';
import { DashboardComponent } from './research-dashboard/research-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: `<app-research-dashboard />`,
})
export class App {}
