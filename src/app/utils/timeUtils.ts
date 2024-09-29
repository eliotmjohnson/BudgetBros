export const getMonth = (dateString: string) => {
    return new Date(dateString).getMonth() + 1;
};

export const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
};

/**
 * This util gets the date with a "hardcoded"
 * timezone offset so that only the date gets
 * used to fetch data, etc. and not get messed up
 * because of timezone offsets
 */
export const getTodayMidnight = () => {
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = now.getMonth();
    const localDate = now.getDate();

    const adjustedDate = new Date(localYear, localMonth, localDate, 0);

    return adjustedDate;
};
