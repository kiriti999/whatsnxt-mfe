/**
 * Converts Lexical Editor JSON state to HTML string
 * Handles all Lexical node types and serializes to semantic HTML
 */

interface LexicalNode {
  type: string;
  [key: string]: any;
}

interface LexicalState {
  root?: {
    children?: LexicalNode[];
    direction?: string;
    format?: string;
    indent?: number;
    type: string;
  };
}

// Escape special HTML characters
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

// Apply text formatting to text content
const applyTextFormatting = (text: string, format: number): string => {
  // FORMAT_TEXT_COMMAND bitmasks
  const BOLD = 1;
  const ITALIC = 2;
  const UNDERLINE = 4;
  const STRIKETHROUGH = 8;
  const CODE = 16;
  const SUPERSCRIPT = 32;
  const SUBSCRIPT = 64;

  let html = escapeHtml(text);

  if (format & BOLD) html = `<strong>${html}</strong>`;
  if (format & ITALIC) html = `<em>${html}</em>`;
  if (format & UNDERLINE) html = `<u>${html}</u>`;
  if (format & STRIKETHROUGH) html = `<s>${html}</s>`;
  if (format & CODE) html = `<code>${html}</code>`;
  if (format & SUPERSCRIPT) html = `<sup>${html}</sup>`;
  if (format & SUBSCRIPT) html = `<sub>${html}</sub>`;

  return html;
};

// Convert a single Lexical node to HTML
const nodeToHtml = (node: LexicalNode): string => {
  switch (node.type) {
    case 'text': {
      const format = node.format || 0;
      const mode = node.mode || 'normal';
      let html = applyTextFormatting(node.text || '', format);

      if (mode === 'token') {
        html = `<code>${html}</code>`;
      }

      return html;
    }

    case 'paragraph': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const direction = node.direction ? ` dir="${node.direction}"` : '';

      // Handle text alignment via format
      let styleClass = '';
      if (node.format === 'left') styleClass = 'style="text-align:left"';
      if (node.format === 'center') styleClass = 'style="text-align:center"';
      if (node.format === 'right') styleClass = 'style="text-align:right"';
      if (node.format === 'justify') styleClass = 'style="text-align:justify"';

      return `<p${direction}${styleClass ? ' ' + styleClass : ''}>${children}</p>`;
    }

    case 'heading': {
      const level = node.tag?.replace('h', '') || '1';
      const children = node.children?.map(nodeToHtml).join('') || '';
      const direction = node.direction ? ` dir="${node.direction}"` : '';
      return `<h${level}${direction}>${children}</h${level}>`;
    }

    case 'quote': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      return `<blockquote>${children}</blockquote>`;
    }

    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      const children = node.children?.map(nodeToHtml).join('') || '';
      const start = node.start ? ` start="${node.start}"` : '';
      return `<${tag}${start}>${children}</${tag}>`;
    }

    case 'listitem': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const checked = node.checked;

      if (checked !== undefined && checked !== null) {
        const checkbox = `<input type="checkbox" ${checked ? 'checked' : ''} disabled />`;
        return `<li>${checkbox}${children}</li>`;
      }

      return `<li>${children}</li>`;
    }

    case 'link': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const url = node.url ? escapeHtml(node.url) : '#';
      const target = node.target ? ` target="${node.target}"` : '';
      const rel = node.rel ? ` rel="${node.rel}"` : '';
      return `<a href="${url}"${target}${rel}>${children}</a>`;
    }

    case 'code': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const language = node.language ? ` class="language-${node.language}"` : '';
      return `<pre><code${language}>${children}</code></pre>`;
    }

    case 'codeblock': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const language = node.language ? ` class="language-${node.language}"` : '';
      return `<pre><code${language}>${children}</code></pre>`;
    }

    case 'table': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      return `<table><tbody>${children}</tbody></table>`;
    }

    case 'tablerow': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      return `<tr>${children}</tr>`;
    }

    case 'tablecell':
    case 'tablecell-header': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      const colSpan = node.colSpan ? ` colspan="${node.colSpan}"` : '';
      const rowSpan = node.rowSpan ? ` rowspan="${node.rowSpan}"` : '';
      const tag = node.type === 'tablecell-header' ? 'th' : 'td';
      return `<${tag}${colSpan}${rowSpan}>${children}</${tag}>`;
    }

    case 'horizontalrule': {
      return '<hr />';
    }

    case 'image': {
      const src = node.src ? escapeHtml(node.src) : '';
      const alt = node.altText ? escapeHtml(node.altText) : '';
      const width = node.width ? ` width="${node.width}"` : '';
      const height = node.height ? ` height="${node.height}"` : '';
      return `<img src="${src}" alt="${alt}"${width}${height} />`;
    }

    case 'excalidraw': {
      // Fallback: preserve the Excalidraw data as a data attribute.
      // The full SVG is only available via Lexical's $generateHtmlFromNodes (EditorRefPlugin).
      // This fallback ensures data isn't silently lost when lexicalToHtml is used directly.
      const data = node.data || '[]';
      const width = node.width === undefined || node.width === 'inherit' ? 'inherit' : `${node.width}px`;
      const height = node.height === undefined || node.height === 'inherit' ? 'inherit' : `${node.height}px`;
      return `<span style="display:inline-block;width:${width};height:${height}" data-lexical-excalidraw-json="${escapeHtml(data)}"></span>`;
    }

    case 'inline-svg': {
      // Fallback: output the raw SVG wrapped in a figure element.
      // Primary path uses $generateHtmlFromNodes via EditorRefPlugin which calls InlineSvgNode.exportDOM().
      const svg = node.svg || '';
      const caption = node.caption ? `<figcaption>${escapeHtml(node.caption)}</figcaption>` : '';
      return `<figure data-lexical-inline-svg="true">${svg}${caption}</figure>`;
    }

    case 'code-highlight': {
      return escapeHtml(node.text || '');
    }

    case 'tab': {
      return '  ';
    }

    case 'linebreak':
    case 'br': {
      return '<br />';
    }

    case 'root': {
      const children = node.children?.map(nodeToHtml).join('') || '';
      return children;
    }

    default: {
      // Handle unknown node types by recursing through children
      if (node.children && Array.isArray(node.children)) {
        return node.children.map(nodeToHtml).join('');
      }
      return '';
    }
  }
};

/**
 * Main conversion function
 * Takes Lexical JSON state and converts to HTML string
 */
export const lexicalToHtml = (lexicalState: string | LexicalState): string => {
  try {
    // If it's a string, parse it
    let state: LexicalState;
    if (typeof lexicalState === 'string') {
      if (!lexicalState || lexicalState.trim() === '') {
        return '';
      }
      state = JSON.parse(lexicalState);
    } else {
      state = lexicalState;
    }

    // Ensure we have a valid state structure
    if (!state || !state.root || !state.root.children) {
      return '';
    }

    // Convert all root children to HTML
    const html = state.root.children.map(nodeToHtml).join('');

    return html;
  } catch (error) {
    // Check if it looks like HTML (contains tags)
    if (typeof lexicalState === 'string' && /<[a-z][\s\S]*>/i.test(lexicalState.trim())) {
      return lexicalState;
    }
    console.error('Error converting Lexical state to HTML:', error);
    return '';
  }
};

// Export for testing
export default lexicalToHtml;
