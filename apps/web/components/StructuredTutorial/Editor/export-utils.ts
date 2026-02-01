import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createEditor, $getRoot } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { PageBreakNode } from './nodes/PageBreakNode';
import { DateNode } from './nodes/DateNode';
import { StickyNode } from './nodes/StickyNode';
import { CollapsibleContainerNode, CollapsibleTitleNode, CollapsibleContentNode } from './nodes/CollapsibleNodes';
import { LayoutContainerNode, LayoutItemNode } from './nodes/LayoutNodes';
import { YouTubeNode } from './nodes/YouTubeNode';

/**
 * Convert Lexical editor state to HTML
 */
export const lexicalToHtml = (lexicalState: string): string => {
  try {
    const editor = createEditor({
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        HorizontalRuleNode,
        PageBreakNode,
        DateNode,
        StickyNode,
        CollapsibleContainerNode,
        CollapsibleTitleNode,
        CollapsibleContentNode,
        LayoutContainerNode,
        LayoutItemNode,
        YouTubeNode,
      ],
      onError: (error) => console.error(error),
    });

    // Parse the state
    const state = typeof lexicalState === 'string' ? JSON.parse(lexicalState) : lexicalState;
    const editorState = editor.parseEditorState(state);

    let html = '';
    editorState.read(() => {
      const root = $getRoot();
      if (root) {
        html = serializeNodeToHtml(root);
      }
    });

    return html;
  } catch (error) {
    console.error('Error converting Lexical to HTML:', error);
    return '';
  }
};

/**
 * Serialize a Lexical node to HTML
 */
function serializeNodeToHtml(node: any): string {
  if (!node) return '';

  const type = node.__type;

  switch (type) {
    case 'root':
      return node.__children
        .map((childKey: string) => serializeNodeToHtml(node._parent._nodeMap.get(childKey)))
        .join('');

    case 'paragraph': {
      const style = node.__style || '';
      const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
      return `<p${styleAttr}>${serializeChildren(node)}</p>`;
    }

    case 'heading': {
      const level = node.__level || 1;
      const style = node.__style || '';
      const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
      return `<h${level}${styleAttr}>${serializeChildren(node)}</h${level}>`;
    }

    case 'list': {
      const tag = node.__listType === 'bullet' ? 'ul' : 'ol';
      const style = node.__style || '';
      const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
      return `<${tag}${styleAttr}>${serializeChildren(node)}</${tag}>`;
    }

    case 'listitem':
      return `<li>${serializeChildren(node)}</li>`;

    case 'quote': {
      const style = node.__style || '';
      const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
      return `<blockquote class="lexical-quote"${styleAttr}>${serializeChildren(node)}</blockquote>`;
    }

    case 'code': {
      const language = node.__language || 'plaintext';
      return `<pre><code class="language-${language}">${escapeHtml(
        serializeChildren(node)
      )}</code></pre>`;
    }

    case 'text': {
      let text = node.__text || '';
      text = escapeHtml(text);

      if (node.__format & 1) text = `<strong>${text}</strong>`; // Bold
      if (node.__format & 2) text = `<em>${text}</em>`; // Italic
      if (node.__format & 4) text = `<u>${text}</u>`; // Underline
      if (node.__format & 8) text = `<s>${text}</s>`; // Strikethrough
      if (node.__format & 16) text = `<code>${text}</code>`; // Code

      if (node.__style) {
        text = `<span style="${escapeHtml(node.__style)}">${text}</span>`;
      }

      return text;
    }

    case 'link':
      return `<a href="${escapeHtml(node.__url || '#')}">${serializeChildren(node)}</a>`;

    case 'image':
      return `<img src="${escapeHtml(node.__src || '')}" alt="${escapeHtml(
        node.__altText || ''
      )}" style="max-width: 100%; height: auto;" />`;

    case 'horizontalrule':
      return '<hr />';

    case 'pagebreak':
      return '<hr class="lexical-page-break" style="page-break-after: always; border: none; border-top: 2px dashed #ccc; margin: 2rem 0;" />';

    case 'date':
      return `<span class="lexical-date" style="background-color: #e7f5ff; padding: 2px 4px; border-radius: 4px; color: #1971c2; font-weight: 500;">${escapeHtml(node.__date)}</span>`;

    case 'sticky': {
      const colors = {
        yellow: { bg: '#fff9db', border: '#fab005' },
        pink: { bg: '#fff0f6', border: '#f06595' },
        blue: { bg: '#e7f5ff', border: '#228be6' },
        green: { bg: '#ebfbee', border: '#40c057' },
      };
      const color = (node.__color as 'yellow' | 'pink' | 'blue' | 'green') || 'yellow';
      const colorSet = colors[color];
      return `<div class="lexical-sticky-note lexical-sticky-note-${color}" style="background-color: ${colorSet.bg}; border-left: 5px solid ${colorSet.border}; padding: 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0;">${serializeChildren(node)}</div>`;
    }

    case 'collapsible-container': {
      const open = node.__open ? ' open' : '';
      return `<details class="lexical-collapsible-container"${open} style="border: 1px solid #dee2e6; border-radius: 4px; margin: 1rem 0;">${serializeChildren(node)}</details>`;
    }

    case 'collapsible-title':
      return `<summary class="lexical-collapsible-title" style="padding: 0.75rem 1rem; font-weight: bold; cursor: pointer; background-color: #f8f9fa;">${serializeChildren(node)}</summary>`;

    case 'collapsible-content':
      return `<div class="lexical-collapsible-content" style="padding: 1rem; border-top: 1px solid #dee2e6;">${serializeChildren(node)}</div>`;

    case 'layout-container':
      return `<div class="lexical-layout-container" style="display: grid; grid-template-columns: ${node.__templateColumns}; gap: 1rem; margin: 1rem 0;">${serializeChildren(node)}</div>`;

    case 'layout-item':
      return `<div class="lexical-layout-item" style="border: 1px dashed #ced4da; padding: 0.5rem; border-radius: 4px;">${serializeChildren(node)}</div>`;

    case 'youtube': {
      const videoId = node.__videoId || '';
      return `<div class="lexical-youtube" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; margin: 1rem 0;">
                <iframe 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                  src="https://www.youtube.com/embed/${videoId}" 
                  frameborder="0" 
                  allowfullscreen>
                </iframe>
              </div>`;
    }

    default:
      return serializeChildren(node);
  }
}

function serializeChildren(node: any): string {
  if (!node.__children || node.__children.length === 0) return '';

  return node.__children
    .map((childKey: string) => serializeNodeToHtml(node._parent._nodeMap.get(childKey)))
    .join('');
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Export Lexical content to PDF
 */
export const exportToPdf = async (
  lexicalState: string,
  filename: string = 'document.pdf',
  title?: string
): Promise<void> => {
  try {
    // Get HTML from Lexical state
    const htmlContent = lexicalToHtml(lexicalState);

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.5';
    document.body.appendChild(container);

    try {
      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');

      if (title) {
        pdf.setFontSize(16);
        pdf.text(title, 10, 10);
        position = 20;
        heightLeft -= 10;
      }

      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
        position += pageHeight - 10;

        if (heightLeft > 0) {
          pdf.addPage();
          position = 10;
        }
      }

      pdf.save(filename);
    } finally {
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

/**
 * Export Lexical content as plain text
 */
export const lexicalToPlainText = (lexicalState: string): string => {
  try {
    const state = JSON.parse(lexicalState);

    const extractText = (obj: any): string => {
      if (obj.__text) {
        return obj.__text;
      }
      if (obj.__children && Array.isArray(obj.__children)) {
        return obj.__children
          .map((childKey: string) => {
            const child = state.nodeMap[childKey] || findNodeInMap(state, childKey);
            return extractText(child);
          })
          .join('');
      }
      return '';
    };

    const root = state.nodeMap.root || Object.values(state.nodeMap)[0];
    return extractText(root);
  } catch (error) {
    console.error('Error converting to plain text:', error);
    return '';
  }
};

function findNodeInMap(state: any, key: string): any {
  for (const nodeKey in state.nodeMap) {
    if (state.nodeMap[nodeKey].__key === key) {
      return state.nodeMap[nodeKey];
    }
  }
  return null;
}

/**
 * Create a preview of content (first N words)
 */
export const getContentPreview = (lexicalState: string, wordCount: number = 50): string => {
  const plainText = lexicalToPlainText(lexicalState);
  const words = plainText.trim().split(/\s+/);
  return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
};
