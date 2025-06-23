// currencyHelper.ts - Make this completely self-contained
export function kConverter(input: any): string {
    // Handle edge cases first
    if (input === null || input === undefined || input === '') {
        return '0';
    }

    // Parse input safely
    let num: number;
    if (typeof input === 'number') {
        num = input;
    } else if (typeof input === 'string') {
        const parsed = parseFloat(input);
        num = isNaN(parsed) ? 0 : parsed;
    } else {
        num = 0;
    }

    // Handle negative numbers
    if (num < 0) {
        return '0';
    }

    // Format based on size
    if (num < 1000 && num >= 0) {
        return Math.floor(num).toString();
    } else {
        const thousands = num / 1000;
        const formatted = thousands.toFixed(1);
        return formatted.replace('.0', '') + 'k';
    }
}

// Additional helper functions (self-contained)
export function formatCurrency(amount: number, currency = '₹'): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return `${currency}0`;
    }

    return `${currency}${kConverter(amount)}`;
}

export function parseCurrencyInput(input: string): number {
    if (!input || typeof input !== 'string') {
        return 0;
    }

    const cleaned = input.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}