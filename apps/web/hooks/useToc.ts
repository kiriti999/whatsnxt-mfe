import { useCallback, useEffect, useRef } from 'react';
import sanitizeHtml from 'sanitize-html';

// Configure sanitize-html options to allow images and preserve code block attributes
const sanitizeOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'img', 'iframe', 'details', 'summary', 'hr'
  ],
  // Preserve class and data-language on <pre> and <code> so highlighting classes survive
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    div: ['class', 'style'],
    span: ['class', 'style'],
    p: ['class', 'style'],
    h1: ['class', 'style', 'id'],
    h2: ['class', 'style', 'id'],
    h3: ['class', 'style', 'id'],
    h4: ['class', 'style', 'id'],
    h5: ['class', 'style', 'id'],
    h6: ['class', 'style', 'id'],
    blockquote: ['class', 'style'],
    ul: ['class', 'style'],
    ol: ['class', 'style'],
    li: ['class', 'style'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style'],
    iframe: ['src', 'title', 'allow', 'allowfullscreen', 'width', 'height', 'style', 'class', 'frameborder', 'loading'],
    details: ['open', 'class', 'style'],
    summary: ['class', 'style'],
    hr: ['class', 'style'],
    pre: ['class', 'data-language', 'style'],
    code: ['class', 'data-language', 'style']
  },
  allowedClasses: {
    '*': ['lexical-*', 'language-*', 'hljs*']
  },
  allowedSchemes: ['http', 'https', 'data']
};

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
    const sanitizedDescription = sanitizeHtml(decodedDescription, sanitizeOptions);

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
