/**
 * NAVIX OPEN-SOURCE ENGINE CORE: DOCLING ADAPTATION
 * Adapted from IBM Docling (https://github.com/docling-project/docling)
 * License: MIT
 * 
 * Provides hierarchical document model parsing, tabular understanding,
 * semantic chunking with metadata inheritance, and CommonMark export.
 */

export type DoclingNodeType = 
  | 'document'
  | 'heading'
  | 'paragraph'
  | 'table'
  | 'code_block'
  | 'list_item'
  | 'key_value'
  | 'divider';

export interface DoclingTableData {
  headers: string[];
  rows: string[][];
  numColumns: number;
  numRows: number;
}

export interface DoclingNode {
  id: string;
  type: DoclingNodeType;
  level?: number; // For headings (1-6)
  text: string;
  children?: DoclingNode[];
  tableData?: DoclingTableData;
  metadata?: Record<string, any>;
}

export interface DoclingDocument {
  title: string;
  root: DoclingNode;
  totalWords: number;
  totalCharacters: number;
  readingTimeMinutes: number;
  ariScore: number;
  readingLevel: string;
  headingsCount: number;
  tablesCount: number;
  codeBlocksCount: number;
  chunks: DoclingChunk[];
}

export interface DoclingChunk {
  chunkIndex: number;
  sectionTitle: string;
  content: string;
  tokenCountEstimate: number;
  nodeTypes: DoclingNodeType[];
}

export class DoclingCoreEngine {
  /**
   * Parses raw text, markdown, CSV, or HTML-like text into a hierarchical DoclingDocument
   */
  public static parse(content: string, title: string = 'Dokumen Navix AI'): DoclingDocument {
    const cleanText = (content || '').trim();
    const lines = cleanText.split('\n');

    const root: DoclingNode = {
      id: 'doc-root',
      type: 'document',
      text: title,
      children: []
    };

    let headingsCount = 0;
    let tablesCount = 0;
    let codeBlocksCount = 0;

    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBuffer: string[] = [];

    let inTable = false;
    let tableBuffer: string[] = [];

    const flushCodeBlock = () => {
      if (codeBuffer.length > 0) {
        codeBlocksCount++;
        root.children!.push({
          id: `code-${codeBlocksCount}`,
          type: 'code_block',
          text: codeBuffer.join('\n'),
          metadata: { language: codeBlockLang || 'plaintext' }
        });
        codeBuffer = [];
        inCodeBlock = false;
        codeBlockLang = '';
      }
    };

    const flushTable = () => {
      if (tableBuffer.length >= 2) {
        tablesCount++;
        const tableData = this.parseTableBuffer(tableBuffer);
        root.children!.push({
          id: `tbl-${tablesCount}`,
          type: 'table',
          text: tableBuffer.join('\n'),
          tableData
        });
      } else if (tableBuffer.length === 1) {
        root.children!.push({
          id: `p-${root.children!.length + 1}`,
          type: 'paragraph',
          text: tableBuffer[0]
        });
      }
      tableBuffer = [];
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Code Block Fence
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          if (inTable) flushTable();
          inCodeBlock = true;
          codeBlockLang = trimmed.replace(/^```/, '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // 2. Table row detection (markdown table or CSV row)
      const isMarkdownTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
      const isCsvRow = !trimmed.startsWith('#') && trimmed.includes(',') && !trimmed.includes(' ');

      if (isMarkdownTableRow || isCsvRow) {
        inTable = true;
        tableBuffer.push(trimmed);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // 3. Empty line
      if (trimmed.length === 0) {
        continue;
      }

      // 4. Headings
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        headingsCount++;
        const level = headingMatch[1].length;
        root.children!.push({
          id: `h-${headingsCount}`,
          type: 'heading',
          level,
          text: headingMatch[2].trim()
        });
        continue;
      }

      // 5. Divider
      if (/^(\*\*\*|---|___)$/.test(trimmed)) {
        root.children!.push({
          id: `div-${root.children!.length + 1}`,
          type: 'divider',
          text: '---'
        });
        continue;
      }

      // 6. List items
      if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        root.children!.push({
          id: `li-${root.children!.length + 1}`,
          type: 'list_item',
          text: trimmed.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '').trim()
        });
        continue;
      }

      // 7. Key-Value pairs
      const kvMatch = trimmed.match(/^([A-Za-z0-9_\s]{2,30}):\s+(.+)$/);
      if (kvMatch && !trimmed.startsWith('http') && !trimmed.includes('::')) {
        root.children!.push({
          id: `kv-${root.children!.length + 1}`,
          type: 'key_value',
          text: trimmed,
          metadata: { key: kvMatch[1].trim(), value: kvMatch[2].trim() }
        });
        continue;
      }

      // 8. Standard paragraph
      root.children!.push({
        id: `p-${root.children!.length + 1}`,
        type: 'paragraph',
        text: trimmed
      });
    }

    if (inCodeBlock) flushCodeBlock();
    if (inTable) flushTable();

    // Compute metrics
    const words = cleanText.split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    const totalCharacters = cleanText.length;
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    const ariScore = Math.round(4.71 * (totalCharacters / (totalWords || 1)) + 0.5 * (totalWords / sentenceCount) - 21.43);
    const readingLevel = ariScore <= 8 
      ? 'Mudah Dipahami (Umum)' 
      : ariScore <= 14 
      ? 'Menengah (Profesional/Mahasiswa)' 
      : 'Tingkat Lanjut (Akademik/Spesialis)';

    // Compute Docling hierarchical chunks
    const chunks = this.createSemanticChunks(root);

    return {
      title,
      root,
      totalWords,
      totalCharacters,
      readingTimeMinutes,
      ariScore: Math.max(1, ariScore),
      readingLevel,
      headingsCount,
      tablesCount,
      codeBlocksCount,
      chunks
    };
  }

  /**
   * Parses markdown or CSV table buffer into structured DoclingTableData
   */
  private static parseTableBuffer(buffer: string[]): DoclingTableData {
    const isMarkdown = buffer[0].includes('|');
    if (isMarkdown) {
      const cleanRows = buffer
        .filter(row => !row.replace(/[\s|:-]/g, '').length === false || !row.includes('---'))
        .map(row => row.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));

      const headers = cleanRows[0] || [];
      const rows = cleanRows.slice(1);
      return {
        headers,
        rows,
        numColumns: headers.length,
        numRows: rows.length
      };
    } else {
      // CSV parse
      const rows = buffer.map(r => r.split(',').map(c => c.trim()));
      const headers = rows[0] || [];
      return {
        headers,
        rows: rows.slice(1),
        numColumns: headers.length,
        numRows: rows.length - 1
      };
    }
  }

  /**
   * Produces semantic chunks bounded by token count and heading hierarchy
   */
  private static createSemanticChunks(root: DoclingNode, targetChunkWords: number = 300): DoclingChunk[] {
    const chunks: DoclingChunk[] = [];
    let currentSection = 'Pengantar';
    let currentBuffer: string[] = [];
    let currentTypes: Set<DoclingNodeType> = new Set();
    let currentWordCount = 0;

    const flushChunk = () => {
      if (currentBuffer.length > 0) {
        chunks.push({
          chunkIndex: chunks.length + 1,
          sectionTitle: currentSection,
          content: currentBuffer.join('\n\n'),
          tokenCountEstimate: Math.ceil(currentWordCount * 1.3),
          nodeTypes: Array.from(currentTypes)
        });
        currentBuffer = [];
        currentTypes.clear();
        currentWordCount = 0;
      }
    };

    for (const node of root.children || []) {
      if (node.type === 'heading') {
        if (currentWordCount > 50) {
          flushChunk();
        }
        currentSection = node.text;
      }

      const nodeWords = node.text.split(/\s+/).filter(Boolean).length;
      currentBuffer.push(node.text);
      currentTypes.add(node.type);
      currentWordCount += nodeWords;

      if (currentWordCount >= targetChunkWords) {
        flushChunk();
      }
    }

    flushChunk();
    return chunks;
  }

  /**
   * Exports Docling document to pristine CommonMark Markdown
   */
  public static toMarkdown(doc: DoclingDocument): string {
    const lines: string[] = [];
    lines.push(`# ${doc.title}\n`);

    for (const node of doc.root.children || []) {
      switch (node.type) {
        case 'heading':
          lines.push(`${'#'.repeat(node.level || 2)} ${node.text}`);
          break;
        case 'paragraph':
          lines.push(`${node.text}\n`);
          break;
        case 'code_block':
          lines.push(`\`\`\`${node.metadata?.language || ''}\n${node.text}\n\`\`\`\n`);
          break;
        case 'list_item':
          lines.push(`• ${node.text}`);
          break;
        case 'divider':
          lines.push('---\n');
          break;
        case 'table':
          if (node.tableData && node.tableData.headers.length > 0) {
            lines.push(`| ${node.tableData.headers.join(' | ')} |`);
            lines.push(`| ${node.tableData.headers.map(() => '---').join(' | ')} |`);
            for (const row of node.tableData.rows) {
              lines.push(`| ${row.join(' | ')} |`);
            }
            lines.push('');
          } else {
            lines.push(node.text + '\n');
          }
          break;
        default:
          lines.push(`${node.text}\n`);
      }
    }

    return lines.join('\n');
  }
}
