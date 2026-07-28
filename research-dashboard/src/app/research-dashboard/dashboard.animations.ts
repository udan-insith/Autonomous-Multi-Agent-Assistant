import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const agentStateAnimation = trigger('agentStateAnimation', [
  state('idle', style({ transform: 'scale(1)', boxShadow: '0 0 0 rgba(16,185,129,0)' })),
  state('completed', style({ transform: 'scale(1)', boxShadow: '0 0 24px rgba(16,185,129,0.25)' })),
  state('failed', style({ transform: 'scale(1)', boxShadow: '0 0 24px rgba(244,63,94,0.25)' })),
]);
