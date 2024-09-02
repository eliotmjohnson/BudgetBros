export const getMonth = (dateString: string) => {
    return new Date(dateString).getMonth() + 1;
};

export const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
};
