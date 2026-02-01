import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createEditor, $getRoot } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';

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

    case 'paragraph':
      return `<p>${serializeChildren(node)}</p>`;

    case 'heading': {
      const level = node.__level || 1;
      return `<h${level}>${serializeChildren(node)}</h${level}>`;
    }

    case 'list':
      const tag = node.__listType === 'bullet' ? 'ul' : 'ol';
      return `<${tag}>${serializeChildren(node)}</${tag}>`;

    case 'listitem':
      return `<li>${serializeChildren(node)}</li>`;

    case 'quote':
      return `<blockquote>${serializeChildren(node)}</blockquote>`;

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

      return text;
    }

    case 'link':
      return `<a href="${escapeHtml(node.__url || '#')}">${serializeChildren(node)}</a>`;

    case 'image':
      return `<img src="${escapeHtml(node.__src || '')}" alt="${escapeHtml(
        node.__altText || ''
      )}" style="max-width: 100%; height: auto;" />`;

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
