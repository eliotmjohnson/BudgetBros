import { FormGroup } from '@angular/forms';

/**
 * Checks key inputs to only allow
 * valid keystrokes when typing into
 * currency inputs
 */
export const checkCurrencyInputKeyValid = (
    e: KeyboardEvent,
    valueToCheck: number
) => {
    return (
        !!(
            (e.key === 'Backspace' && valueToCheck) ||
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

export function addValueToCurrencyInput(
    e: Event,
    form: FormGroup,
    controlName?: string
): void;

export function addValueToCurrencyInput(
    e: Event,
    form?: FormGroup,
    controlName?: string
): void | number {
    const input = e.target as HTMLInputElement;

    const reConvertedValue = Number(input.value.replace(/[^\d]/g, '')) / 100;

    if (form) {
        return form.patchValue({
            [controlName || 'amount']: reConvertedValue ?? 0
        });
    }

    return reConvertedValue;
}
