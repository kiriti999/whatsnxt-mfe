export const generateKey = (value: string, index: number): string => {
    return `${value}-${index}`;
}