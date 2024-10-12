import { animate, style, transition, trigger } from '@angular/animations';

export const deleteItemAnimation = trigger('deleteItemAnimation', [
    transition(':leave', [
        style({ height: '*', overflowY: 'hidden' }),
        animate('.15s', style({ height: '0' }))
    ])
]);
