import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Checks key inputs to only allow
 * valid keystrokes when typing into
 * currency inputs
 *
 * @example
 * ```html
 *<!-- In Template -->
 * <input (keydown)="checkKeyValid($event)" />
 *
 * ```
 * ```ts
 * // In component
 * checkKeyValid(e: KeyboardEvent) {
 *     return checkCurrencyInputKeyValid(e, someValueHere);
 * }
 * ```
 */
export const checkCurrencyInputKeyValid = (
    e: KeyboardEvent,
    valueToCheck: number | string
) => {
    return (
        !!(
            (e.key === 'Backspace' && valueToCheck) ||
            (e.key === 'Enter' && valueToCheck) ||
            e.key.includes('Arrow')
        ) ||
        !(
            isNaN(Number(e.key)) ||
            e.key === ' ' ||
            (e.key === '0' && !valueToCheck)
        )
    );
};

/**
 * Converts inputted values into a currency input
 * to correct formatting to ensure currency is
 * being entered properly.
 *
 * Can be used in conjunction with form groups
 * to update form values programmatically or just return
 * the converted number to assign to a property or variable.
 */
export function addValueToCurrencyInput(e: Event): number;

export function addValueToCurrencyInput(amount: number): number;

export function addValueToCurrencyInput(
    e: Event,
    form?: FormGroup,
    controlName?: string
): void;

export function addValueToCurrencyInput(
    eventOrNumber: Event | number,
    form?: FormGroup,
    controlName?: string
): void | number {
    let amount: number | string;

    if (typeof eventOrNumber === 'number') {
        amount = eventOrNumber;
    } else {
        amount = (eventOrNumber.target as HTMLInputElement).value;
    }

    const reConvertedValue =
        Number(amount.toString().replace(/[^\d]/g, '')) / 100;

    if (form) {
        return form.patchValue({
            [controlName || 'amount']: reConvertedValue ?? 0
        });
    }

    return reConvertedValue;
}

export function stripCurrency(
    field?: string,
    form?: FormGroup,
    value?: string
) {
    return (
        Number(
            (form && field ? form.get(field)!.value : value).replace(
                /[^\d]/g,
                ''
            )
        ) / 100
    );
}

export function currencyRequiredValidator(control: AbstractControl) {
    if (control.value === '$0.00') {
        return {
            required: true
        };
    } else return null;
}
