import { style, animate, trigger, transition } from '@angular/animations';

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
