import { useCallback, useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';

export const useAddIdsToHeadings = (desc: string) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !desc) return;

    // Safely decode the description or use it as-is if decoding fails
    let decodedDescription;
    try {
      decodedDescription = decodeURI(desc);
    } catch (error) {
      console.warn('Failed to decode description URI, using as-is:', error);
      decodedDescription = desc;
    }

    // Sanitize the description
    const sanitizedDescription = sanitizeHtml(decodedDescription);

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedDescription, 'text/html');

    // Function to add unique IDs to headings
    const addUniqueIdsToHeadings = (doc: Document) => {
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        heading.id =
          heading.textContent?.toLowerCase().replace(/\s+/g, '_') || '';
      });
    };

    // Add unique IDs to headings
    addUniqueIdsToHeadings(doc);

    // Serialize the DOM back to an HTML string
    const modifiedDescription = doc.body.innerHTML;

    // Set the modified HTML string to the container
    containerRef.current.innerHTML = modifiedDescription;
  }, [desc, containerRef]);

  return { containerRef };
}

export const useContentRefAndHeadings = (
  loading: unknown,
  item: unknown,
  onHeadingsExtractedCallback: (arg0: { ref: Element; text: string }[]) => void,
) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      const content = contentRef.current;
      if (content !== null) {
        const headings = Array.from(
          content.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        ).map((heading) => ({
          ref: heading,
          text: heading.textContent || '',
          id: heading.textContent?.toLowerCase().replace(/\s+/g, '_') || '',
        }));
        headings.shift();
        onHeadingsExtractedCallback(headings);
      }
    }
  }, [loading, item, onHeadingsExtractedCallback]);

  return contentRef;
};

export const useHandleScroll = (contentRef: any, setActiveHeading: any) => {
  const activeHeadingRef = useRef<Element | null>(null);

  const handleScroll = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const contentTop: number = content.getBoundingClientRect().top;
    const headings: NodeListOf<Element> = content.querySelectorAll(
      'h1, h2, h3, h4, h5, h6',
    );
    let closestHeading: Element | null = null;
    let closestHeadingDistance = Number.MAX_VALUE;
    headings.forEach((heading) => {
      const { top } = heading.getBoundingClientRect();
      const relativeTop: number = top - contentTop;
      if (relativeTop >= 0 && relativeTop < closestHeadingDistance) {
        closestHeadingDistance = relativeTop;
        closestHeading = heading;
      }
    });
    if (closestHeading && activeHeadingRef.current !== closestHeading) {
      activeHeadingRef.current = closestHeading;
      setActiveHeading(closestHeading);
    }
  }, [contentRef, setActiveHeading]);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (content) {
        content.removeEventListener('scroll', handleScroll);
      }
    };
  }, [contentRef.current, handleScroll]);
};
