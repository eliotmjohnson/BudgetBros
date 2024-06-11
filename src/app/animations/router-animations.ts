import {
    animate,
    animation,
    group,
    query,
    style,
    transition,
    trigger,
    useAnimation
} from '@angular/animations';

const positionPages = animation([
    query(
        ':enter, :leave',
        style({ position: 'absolute', left: 0, top: 0, width: '100%' }),
        { optional: true }
    )
]);

export const routerAnimations = trigger('routerAnimations', [
    transition('void => *', []),
    transition('* => budget', [
        useAnimation(positionPages),
        query(':enter', style({ translate: '0 20rem', opacity: 0 }), {
            optional: true
        }),
        query(':leave', animate('.2s', style({ opacity: 0 })), {
            optional: true
        }),
        query(
            ':enter',
            animate('.4s', style({ translate: '0 0', opacity: 1 })),
            {
                optional: true
            }
        )
    ]),
    transition('* <=> *', [
        useAnimation(positionPages),
        query(':enter', style({ opacity: '0' }), { optional: true }),
        group([
            query(':enter', animate('.2s', style({ opacity: '1' })), {
                optional: true
            }),
            query(':leave', animate('.2s', style({ opacity: '0' })), {
                optional: true
            })
        ])
    ])
]);
