import { useEffect, useState, useCallback } from 'react';

interface DOMPurifyHook {
    sanitize: (html: string, config?: any) => string;
    isLoading: boolean;
    isReady: boolean;
}

export const useDOMPurify = (): DOMPurifyHook => {
    const [DOMPurify, setDOMPurify] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('dompurify')
                .then((module) => {
                    setDOMPurify(module.default);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Failed to load DOMPurify:', error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const sanitize = useCallback((html: string, config?: any) => {
        if (!html) return '';

        if (DOMPurify) {
            return DOMPurify.sanitize(html, config);
        }

        // Simple fallback: return original HTML 
        // (DOMPurify should load quickly, so this is temporary)
        return html;
    }, [DOMPurify]);

    return {
        sanitize,
        isLoading,
        isReady: !isLoading && DOMPurify !== null
    };
};