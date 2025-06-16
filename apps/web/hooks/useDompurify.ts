import { useEffect, useState } from 'react';

export const useDOMPurify = () => {
    const [DOMPurify, setDOMPurify] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('dompurify').then((module) => {
                setDOMPurify(module.default);
            });
        }
    }, []);

    return DOMPurify;
};