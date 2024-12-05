export const BASE_BE_URL = 'https://zzawerpkdw.us-east-2.awsapprunner.com';
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
