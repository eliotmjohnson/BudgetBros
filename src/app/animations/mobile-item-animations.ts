import { animate, style, transition, trigger } from '@angular/animations';

export const deleteItemAnimation = trigger('deleteItemAnimation', [
    transition(':leave', [
        style({ height: '*', overflowY: 'hidden' }),
        animate('.15s', style({ height: '0' }))
    ])
]);

export const deleteTransactionAnimation = trigger(
    'deleteTransactionAnimation',
    [
        transition(':leave', [
            style({ height: '*', minHeight: '4rem', overflowY: 'hidden' }),
            animate('.15s', style({ height: '0', minHeight: '0rem' }))
        ])
    ]
);
