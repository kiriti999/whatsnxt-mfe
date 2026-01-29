import { useCallback, useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';

// Configure sanitize-html options to allow images and preserve code block attributes
const sanitizeOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ],
  // Preserve class and data-language on <pre> and <code> so highlighting classes survive
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    // Allow id on headings so we can link to them
    h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style'],
    pre: ['class', 'data-language'],
    code: ['class', 'data-language']
  },
  allowedSchemes: ['http', 'https', 'data']
};

export const useAddIdsToHeadings = (
  desc: string,
  onHeadingsExtracted?: (headings: { ref: HTMLElement; text: string; id: string }[]) => void
) => {
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
    const sanitizedDescription = sanitizeHtml(decodedDescription, sanitizeOptions);

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedDescription, 'text/html');

    // Function to add unique IDs to headings
    const addUniqueIdsToHeadings = (doc: Document) => {
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        // Only add ID if not already present
        if (!heading.id) {
          heading.id =
            heading.textContent?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || '';
        }
      });
    };

    // Add unique IDs to headings
    addUniqueIdsToHeadings(doc);

    // Convert paragraphs that are actually code blocks back into proper <pre><code>
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    paragraphs.forEach((p) => {
      // If paragraph contains exactly one child and it's a CODE element, convert it
      if (p.children.length === 1 && p.children[0].tagName === 'CODE') {
        const codeEl = p.children[0] as HTMLElement;

        // Heuristics: treat as block code if code text contains a newline or has a language class
        const text = codeEl.textContent || '';
        const hasNewline = text.includes('\n');
        const classAttr = codeEl.getAttribute('class') || '';
        const hasLangClass = /language-/.test(classAttr);

        if (hasNewline || hasLangClass) {
          const pre = doc.createElement('pre');
          const newCode = doc.createElement('code');

          // Copy attributes from original code element
          Array.from(codeEl.attributes).forEach((attr) => {
            newCode.setAttribute(attr.name, attr.value);
          });

          // Set the text content (preserve inner text exactly)
          newCode.textContent = codeEl.textContent;
          pre.appendChild(newCode);

          p.replaceWith(pre);
        }
      }
    });

    // Serialize the DOM back to an HTML string
    const modifiedDescription = doc.body.innerHTML;

    // Set the modified HTML string to the container
    containerRef.current.innerHTML = modifiedDescription;

    // Extract headings immediately
    if (onHeadingsExtracted) {
      const contentEl = containerRef.current;
      const headings = Array.from(
        contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
      ).map((heading) => ({
        ref: heading as HTMLElement,
        text: heading.textContent || '',
        id: heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '_') || ''
      }))
        // Filter out the main blog title to avoid duplication in TOC
        .filter(h => h.id !== 'blog-title');

      onHeadingsExtracted(headings);
    }
    // Client-side: run highlight.js on any <pre><code> blocks so they get span classes
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import so this only runs in the browser and doesn't bloat server bundles
        import('highlight.js/lib/common')
          .then((mod) => {
            const hljs: any = (mod && (mod.default || mod));
            const contentEl = containerRef.current;
            if (!contentEl || !hljs || typeof hljs.highlightElement !== 'function') return;

            const codeBlocks = Array.from(contentEl.querySelectorAll('pre code')) as HTMLElement[];
            codeBlocks.forEach((codeEl) => {
              try {
                // If the block is marked as plaintext, allow auto-detection
                const classAttr = codeEl.getAttribute('class') || '';
                const text = codeEl.textContent || '';

                if (/language-(?:plain|plaintext)/.test(classAttr) || classAttr.trim() === '') {
                  // Use auto-detection
                  const result = hljs.highlightAuto ? hljs.highlightAuto(text) : null;
                  if (result && result.value) {
                    codeEl.innerHTML = result.value;
                    // Update classes to include detected language if available
                    codeEl.classList.add('hljs');
                    if (result.language) {
                      codeEl.classList.add(`language-${result.language}`);
                    }
                  }
                } else {
                  hljs.highlightElement(codeEl as any);
                }
              } catch (e) {
                // fall back to highlightAuto if highlightElement fails
                try {
                  const text = codeEl.textContent || '';
                  const result = hljs.highlightAuto ? hljs.highlightAuto(text) : null;
                  if (result && result.value) {
                    codeEl.innerHTML = result.value;
                    codeEl.classList.add('hljs');
                    if (result.language) {
                      codeEl.classList.add(`language-${result.language}`);
                    }
                  }
                } catch (er) {
                  // ignore
                }
              }
            });
          })
          .catch((err) => {
            console.warn('highlight.js import failed:', err);
          });
      } catch (e) {
        // ignore
      }
    }
  }, [desc, containerRef]); // Removed onHeadingsExtracted dependency to avoid loop if callback unstable

  return { containerRef };
}

// Deprecated: Logic merged into useAddIdsToHeadings
export const useContentRefAndHeadings = (
  loading: unknown,
  item: unknown,
  onHeadingsExtractedCallback: (arg0: { ref: Element; text: string; id: string }[]) => void,
) => {
  return useRef<HTMLDivElement>(null);
};

export const useHandleScroll = (contentRef: any, setActiveHeading: any) => {
  const activeHeadingRef = useRef<Element | null>(null);

  const handleScroll = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const headings: NodeListOf<Element> = content.querySelectorAll(
      'h1, h2, h3, h4, h5, h6',
    );
    // Use window scroll position or content position relative to viewport
    // Since we are likely scrolling the window, checking bounding rect is correct
    // but the logic here compares to contentTop.
    // If contentTop is scrolling off screen (negative), then relativeTop grows?
    // Let's rely on standard current viewport check.

    // Simple heuristic: First header that is above a certain threshold, or the one crossing it.

    let closestHeading: Element | null = null;
    let closestHeadingDistance = Number.MAX_VALUE;

    // We want the header that is closest to the top of the viewport (can be slightly above or below)
    const offset = 150; // Offset for sticky header/sidebar

    headings.forEach((heading) => {
      const { top } = heading.getBoundingClientRect();
      const distance = Math.abs(top - offset);

      if (distance < closestHeadingDistance) {
        closestHeadingDistance = distance;
        closestHeading = heading;
      }

      // Alternative: Last header that passed the top
      // if (top < offset) { currentActive = heading; }
    });

    // Better logic: Active heading is the last one that is above the cutoff
    let active = null;
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const { top } = heading.getBoundingClientRect();
      if (top <= offset) {
        active = heading;
      } else {
        break; // Headings are ordered, so once we find one below offset, we stop
      }
    }

    if (active && activeHeadingRef.current !== active) {
      activeHeadingRef.current = active;
      setActiveHeading(active);
    } else if (!active && headings.length > 0 && activeHeadingRef.current !== headings[0]) {
      // Default to first if none scrolled past
      // activeHeadingRef.current = headings[0];
      // setActiveHeading(headings[0]);
    }

  }, [contentRef, setActiveHeading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]); // Removed contentRef dependncy for the listener attach/detach to be stable
};
