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
  transition('* => working', [
    animate(
      '350ms cubic-bezier(0.22, 1, 0.36, 1)',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.03)', offset: 0.5 }),
        style({ transform: 'scale(1.0)', offset: 1 }),
      ]),
    ),
  ]),
  transition('* => completed', [
    style({ boxShadow: '0 0 0 rgba(16,185,129,0)' }),
    animate('420ms cubic-bezier(0.22, 1, 0.36, 1)'),
  ]),

  transition('* => failed', [
    animate(
      '520ms cubic-bezier(.36,.07,.19,.97)',
      keyframes([
        style({ transform: 'translate3d(0,0,0)', offset: 0 }),
        style({ transform: 'translate3d(-6px,0,0)', offset: 0.15 }),
        style({ transform: 'translate3d(5px,0,0)', offset: 0.3 }),
        style({ transform: 'translate3d(-4px,0,0)', offset: 0.45 }),
        style({ transform: 'translate3d(4px,0,0)', offset: 0.6 }),
        style({ transform: 'translate3d(-2px,0,0)', offset: 0.75 }),
        style({ transform: 'translate3d(2px,0,0)', offset: 0.9 }),
        style({ transform: 'translate3d(0,0,0)', offset: 1 }),
      ]),
    ),
  ]),
]);

export const checkmarkAnimation = trigger('checkmarkAnimation', [
  transition(':enter', [
    style({ transform: 'translate3d(0,-12px,0) scale(0.6)', opacity: 0 }),
    animate(
      '380ms 60ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }),
    ),
  ]),
  transition(':leave', [
    animate('160ms ease-in', style({ transform: 'translate3d(0,-8px,0) scale(0.8)', opacity: 0 })),
  ]),
]);
