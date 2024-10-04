import {
    style,
    animate,
    trigger,
    transition,
    state
} from '@angular/animations';

export const addTransactionModalAnimation = trigger(
    'addTransactionModalAnimation',
    [transition(':leave', [animate('0.2s', style({ translate: '0rem 96vh' }))])]
);

export const budgetTransactionModalAnimation = trigger(
    'budgetTransactionModalAnimation',
    [
        transition(':leave', [
            animate(
                '0.4s cubic-bezier(0.4, 1, 0.4, 1)',
                style({ translate: '100vw' })
            )
        ])
    ]
);

export const dimmerAnimation = trigger('dimmerAnimation', [
    state('lightDim', style({ opacity: 0.15 })),
    state('darkDim', style({ opacity: 0.5 })),
    transition('* => lightDim', [
        style({ opacity: 0 }),
        animate('0.4s ease', style({ opacity: 0.15 }))
    ]),
    transition('* => darkDim', [
        style({ opacity: 0 }),
        animate('.4s ease', style({ opacity: 0.5 }))
    ]),
    transition('darkDim => void', style({ opacity: 0 })),
    transition(':leave', [animate('0.4s ease', style({ opacity: 0 }))])
]);
