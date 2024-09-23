import { style, animate, trigger, transition } from '@angular/animations';

export const addTransactionModalAnimation = trigger(
    'addTransactionModalAnimation',
    [
        transition(':leave', [
            animate(
                '0.6s cubic-bezier(0.25, 1, 0.25, 1)',
                style({ translate: '0rem 96vh' })
            )
        ])
    ]
);

export const budgetTransactionModalAnimation = trigger(
    'budgetTransactionModalAnimation',
    [
        transition(':leave', [
            animate(
                '0.6s cubic-bezier(0.29, 1, 0.29, 1)',
                style({ translate: '100vw' })
            )
        ])
    ]
);
