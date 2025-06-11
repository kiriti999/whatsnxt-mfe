export function kConverter(input: any): string {
    const num = parseInput(input);
    if (isValidNumber(num)) {
        return formatNumber(num);
    } else {
        return formatThousand(num);
    }
}

function parseInput(input: any): number {
    return typeof input === 'number' ? input : parseInt(input);
}

function isValidNumber(num: number): boolean {
    return num < 1000 && num > 0;
}

function formatNumber(num: number): string {
    return num.toFixed(0);
}

function formatThousand(num: number): string {
    const s = (0.1 * Math.floor(num / 100)).toFixed(1);
    return s.replace('.0', '') + 'k';
}
