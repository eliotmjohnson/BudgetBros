import { style, animate, trigger, transition } from '@angular/animations';

export const loaderOverlayAnimation = trigger('loaderOverlayAnimation', [
    transition(':leave', [animate('0.8s', style({ translate: '0rem 100rem' }))])
]);
