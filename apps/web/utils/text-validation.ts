
// Utility functions for validating text content
export const phoneRegex = /(\+?\d{1,4}[\s-]?)?(\(?\d{3,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4,6}|\b\d{10,12}\b/g;
export const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Number words mapping
const numberWords = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
};

// Convert number words to digits for detection
const convertNumberWordsToDigits = (text: string): string => {
    let converted = text.toLowerCase();

    // Replace number words with digits (with word boundaries)
    Object.entries(numberWords).forEach(([word, digit]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        converted = converted.replace(regex, digit);
    });

    // Also check for sequences without spaces (like "onetwo" -> "12")
    Object.entries(numberWords).forEach(([word, digit]) => {
        const regex = new RegExp(word, 'g');
        converted = converted.replace(regex, digit);
    });

    return converted;
};

// Check for sequences of 7+ consecutive digits (likely phone numbers)
const hasPhoneSequence = (text: string): boolean => {
    // Remove spaces, dashes, dots, parentheses
    const cleaned = text.replace(/[\s\-\.\(\)]/g, '');
    // Check for 7 or more consecutive digits
    return /\d{7,}/g.test(cleaned);
};

export const validateTextContent = (text: string): { isValid: boolean; message?: string } => {
    // Check regular phone number patterns
    if (phoneRegex.test(text)) {
        return {
            isValid: false,
            message: 'Phone numbers are not allowed in this field. Use the contact features instead.'
        };
    }

    // Convert number words to digits and check for phone patterns
    const convertedText = convertNumberWordsToDigits(text);
    if (phoneRegex.test(convertedText) || hasPhoneSequence(convertedText)) {
        return {
            isValid: false,
            message: 'Phone numbers (including those written as words) are not allowed in this field. Use the contact features instead.'
        };
    }

    // Check for email addresses
    if (emailRegex.test(text)) {
        return {
            isValid: false,
            message: 'Email addresses are not allowed in this field. Use the contact features instead.'
        };
    }

    return { isValid: true };
};
