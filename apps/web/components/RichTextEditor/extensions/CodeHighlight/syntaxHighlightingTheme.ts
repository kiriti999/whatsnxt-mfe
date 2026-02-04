/**
 * Comprehensive syntax highlighting theme for code blocks
 * Supports highlight.js and lowlight with a dark VS Code-inspired theme
 * 
 * Color Palette (VS Code Dark+):
 * - Keywords: #569CD6 (light blue)
 * - Strings: #CE9178 (orange)
 * - Numbers/Constants: #B5CEA8 (light green)
 * - Comments: #6A9955 (green)
 * - Functions: #DCDCAA (yellow)
 * - Types/Classes: #4EC9B0 (cyan)
 * - Attributes: #9CDCFE (light cyan)
 */

export const syntaxHighlightingTheme = `
  /* ====== Base Code Block Styles ====== */
  pre,
  .hljs,
  .lexical-code-block {
    display: block !important;
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    border-radius: 6px !important;
    margin: 1rem 0 !important;
    padding: 1rem !important;
    overflow-x: auto !important;
    border: 1px solid #333 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
    font-size: 14px !important;
    /* line-height: 1.3 !important; */
  }

  /* Code inside pre blocks */
  pre code,
  .hljs code,
  .lexical-code-block code {
    background-color: transparent !important;
    color: inherit !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0px !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
  }

  /* ====== Syntax Highlighting Colors (VS Code Theme) ====== */
  
  /* Ensure all spans in code blocks inherit proper styling */
  pre span,
  code span {
    font-family: inherit !important;
    font-size: inherit !important;
    line-height: inherit !important;
  }

  /* Keywords */
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-literal,
  .hljs-section,
  .hljs-title,
  span.hljs-keyword,
  span.hljs-selector-tag,
  span.hljs-literal,
  span.hljs-section,
  span.hljs-title {
    color: #569CD6 !important; /* Light blue */
  }

  /* Strings */
  .hljs-string,
  span.hljs-string {
    color: #CE9178 !important; /* Orange */
  }

  /* Numbers and booleans */
  .hljs-number,
  span.hljs-number,
  .hljs-literal,
  span.hljs-literal {
    color: #B5CEA8 !important; /* Light green */
  }

  /* Comments */
  .hljs-comment,
  span.hljs-comment {
    color: #6A9955 !important; /* Green */
    font-style: italic !important;
  }

  /* Built-in functions and attributes */
  .hljs-built_in,
  .hljs-builtin-name,
  span.hljs-built_in,
  span.hljs-builtin-name {
    color: #DCDCAA !important; /* Yellow */
  }

  /* Classes, types, and interfaces */
  .hljs-class,
  span.hljs-class {
    color: #4EC9B0 !important; /* Cyan */
  }

  /* Function names */
  .hljs-function,
  span.hljs-function {
    color: #DCDCAA !important; /* Yellow */
  }

  /* Attributes and properties */
  .hljs-attr,
  .hljs-attribute,
  span.hljs-attr,
  span.hljs-attribute {
    color: #9CDCFE !important; /* Light cyan */
  }

  /* Operators */
  .hljs-operator,
  .hljs-symbol,
  span.hljs-operator,
  span.hljs-symbol {
    color: #569CD6 !important; /* Light blue */
  }

  /* Punctuation */
  .hljs-punctuation,
  span.hljs-punctuation {
    color: #d4d4d4 !important; /* Default */
  }

  /* Tags (HTML/XML) */
  .hljs-tag,
  span.hljs-tag {
    color: #569CD6 !important; /* Light blue */
  }

  .hljs-tag .hljs-name,
  .hljs-tag .hljs-attr,
  span.hljs-tag span.hljs-name,
  span.hljs-tag span.hljs-attr {
    color: #9CDCFE !important; /* Light cyan */
  }

  /* Regular expressions */
  .hljs-regexp,
  span.hljs-regexp {
    color: #CE9178 !important; /* Orange */
  }

  /* Templates and special syntax */
  .hljs-template-string,
  .hljs-template-tag,
  span.hljs-template-string,
  span.hljs-template-tag {
    color: #CE9178 !important; /* Orange */
  }

  /* Variables and identifiers */
  .hljs-variable,
  span.hljs-variable {
    color: #9CDCFE !important; /* Light cyan */
  }

  /* Meta information */
  .hljs-meta,
  span.hljs-meta {
    color: #569CD6 !important; /* Light blue */
  }

  /* Type annotation */
  .hljs-type,
  span.hljs-type {
    color: #4EC9B0 !important; /* Cyan */
  }

  /* Subst - for template literals */
  .hljs-subst,
  span.hljs-subst {
    color: #d4d4d4 !important; /* Default */
  }

  /* ====== Language-Specific Highlights ====== */

  /* TypeScript/JavaScript specific */
  .language-typescript .hljs-keyword,
  .language-jsx .hljs-keyword,
  .language-tsx .hljs-keyword,
  .language-javascript .hljs-keyword {
    color: #569CD6 !important;
  }

  /* Python specific */
  .language-python .hljs-keyword {
    color: #569CD6 !important;
  }

  .language-python .hljs-string {
    color: #CE9178 !important;
  }

  /* SQL specific */
  .language-sql .hljs-keyword {
    color: #569CD6 !important;
    font-weight: bold !important;
  }

  /* Bash/Shell specific */
  .language-bash .hljs-string,
  .language-shell .hljs-string {
    color: #CE9178 !important;
  }

  /* CSS specific */
  .language-css .hljs-selector-id,
  .language-css .hljs-selector-class {
    color: #9CDCFE !important;
  }

  .language-scss .hljs-variable {
    color: #DCDCAA !important;
  }

  /* JSON specific */
  .language-json .hljs-attr {
    color: #9CDCFE !important;
  }

  /* HTML specific */
  .language-html .hljs-tag,
  .language-xml .hljs-tag {
    color: #569CD6 !important;
  }

  .language-html .hljs-attr,
  .language-xml .hljs-attr {
    color: #9CDCFE !important;
  }

  /* ====== Line Numbers and Copy Button Support ====== */
  
  pre[data-line-numbers] {
    padding-left: 3em !important;
  }

  pre[data-line-numbers]::before {
    content: attr(data-line-numbers);
    position: absolute;
    left: 0;
    top: 0;
    background: #252526;
    color: #858585;
    padding: 1.5em 0.5em;
    text-align: right;
    width: 2.5em;
    border-right: 1px solid #3e3e42;
    user-select: none;
  }

  pre[data-copy] {
    position: relative;
  }

  pre[data-copy]::after {
    content: 'Copy';
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    padding: 0.25em 0.75em;
    background: #569CD6;
    color: #1e1e1e;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  pre:hover[data-copy]::after {
    opacity: 1;
  }

  /* ====== General Code Container Styles ====== */

  /* Code blocks in content */
  #blog-content pre,
  .rte pre,
  [class*="rte"] pre {
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    border-radius: 0px !important;
    overflow-x: auto !important;
    border: 1px solid #333 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  }

  /* Code inside pre blocks */
  #blog-content pre code,
  .rte pre code,
  [class*="rte"] pre code {
    background-color: transparent !important;
    color: inherit !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
  }

  /* Standalone code elements */
  code:not(pre code):not(.lexical-code-block),
  #blog-content code:not(pre code):not(.lexical-code-block),
  .rte code:not(pre code):not(.lexical-code-block),
  [class*="rte"] code:not(pre code):not(.lexical-code-block) {
    background-color: #f5f5f5 !important;
    color: #333 !important;
    padding: 0.2em 0.4em !important;
    margin: 0 !important;
    display: inline !important;
    border-radius: 4px !important;
    font-size: 0.85em !important;
    border: 1px solid #ddd !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
  }

  /* Dark mode inline code */
  body.dark code:not(pre code):not(.lexical-code-block),
  body.dark #blog-content code:not(pre code):not(.lexical-code-block),
  body.dark .rte code:not(pre code):not(.lexical-code-block) {
    background-color: #2d2d30 !important;
    color: #ce9178 !important;
    border: 1px solid #3e3e42 !important;
  }

  /* ====== Accessibility ====== */
  
  /* Focus styles for keyboard navigation */
  pre:focus,
  code:focus {
    outline: 2px solid #569CD6 !important;
    outline-offset: 2px !important;
  }

  /* Selection styles */
  pre::selection,
  code::selection {
    background-color: #569CD6 !important;
    color: #1e1e1e !important;
  }

  /* ====== Mobile responsiveness ====== */
  
  @media (max-width: 768px) {
    pre,
    .hljs {
      padding: 1em !important;
      font-size: 13px !important;
      border-radius: 6px !important;
      margin: 1em 0 !important;
    }

    pre[data-line-numbers] {
      padding-left: 2.5em !important;
    }

    pre[data-line-numbers]::before {
      width: 2em !important;
      padding: 1em 0.25em !important;
    }
  }

  /* ====== Print styles ====== */
  
  @media print {
    pre,
    .hljs {
      background-color: #ffffff !important;
      color: #000000 !important;
      border: 1px solid #cccccc !important;
      page-break-inside: avoid;
    }

    .hljs-keyword {
      color: #0000ff !important;
    }

    .hljs-string {
      color: #008000 !important;
    }

    .hljs-comment {
      color: #008000 !important;
    }
  }
`;

export default syntaxHighlightingTheme;
