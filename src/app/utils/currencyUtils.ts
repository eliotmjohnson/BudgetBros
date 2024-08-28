import { FormGroup } from '@angular/forms';

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
            [controlName || 'amount']:
                reConvertedValue !== 0 ? reConvertedValue : 0
        });
    }

    return reConvertedValue;
}
