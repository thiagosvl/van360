export const formatDate = (date: string | Date) => {
    const d = new Date(date + "T00:00:00");
    return d;
};

export const formatDateToBR = (date: string | Date): string => {
    const newDate = new Date(date + "T00:00:00");
    return newDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};