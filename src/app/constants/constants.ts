export const BASE_BE_URL = 'http://localhost:8080';
export const BE_API_URL = `${BASE_BE_URL}/api`;

export const UNPROTECTED_ROUTES = [
    'login',
    'session-refresh',
    'register'
] as const;

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export enum Features {
    FUND,
    DUE_DATE
}
