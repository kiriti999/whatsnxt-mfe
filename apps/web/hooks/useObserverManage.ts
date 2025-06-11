import { useEffect, useState } from 'react';


export function useObserverManage(
    ids: string[],
): string | undefined {
    const [activeId, setActiveId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handleScroll = () => {
            const headingElements = ids.map((slug) =>
                document.getElementById(slug)
            )
            const visibleHeadings = headingElements.filter((el) =>
                isElementInViewport(el)
            )
            if (visibleHeadings.length > 0 && visibleHeadings[0]) {
                setActiveId(visibleHeadings[0].id)
            }
        }

        document.addEventListener('scroll', handleScroll)

        // clean up the effect by removing the event listener
        return () => {
            document.removeEventListener('scroll', handleScroll)
        }
    }, [ids])

    const isElementInViewport = (el: HTMLElement | null) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    return activeId || ids[0];
}
