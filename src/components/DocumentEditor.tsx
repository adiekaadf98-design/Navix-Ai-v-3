import { useState, useRef, useEffect } from 'react';
import { Download, FileText, Plus, Trash2, Menu, ChevronDown, Check, Save } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SavedDocument } from '../types';
import { getSavedDocuments, saveDocument, createNewDocument, deleteDocument } from '../utils/documentStorage';

interface DocumentEditorProps {
  onOpenSidebar?: () => void;
  activeDocumentId?: string;
  onSelectDocumentId?: (id: string) => void;
}

export function DocumentEditor({ 
  onOpenSidebar,
  activeDocumentId,
  onSelectDocumentId 
}: DocumentEditorProps = {}) {
  const [documents, setDocuments] = useState<SavedDocument[]>(() => getSavedDocuments());
  const [currentDocId, setCurrentDocId] = useState<string>(() => {
    if (activeDocumentId && documents.some(d => d.id === activeDocumentId)) {
      return activeDocumentId;
    }
    return documents[0]?.id || 'doc-default';
  });

  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync when activeDocumentId prop changes externally (e.g. from CommandPalette)
  useEffect(() => {
    if (activeDocumentId) {
      const refreshed = getSavedDocuments();
      setDocuments(refreshed);
      if (refreshed.some(d => d.id === activeDocumentId)) {
        setCurrentDocId(activeDocumentId);
      }
    }
  }, [activeDocumentId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find active document
  const activeDoc = documents.find(d => d.id === currentDocId) || documents[0] || {
    id: 'doc-default',
    title: 'Laporan Riset Navix AI',
    content: '# Laporan Riset Navix AI\n\nTulis hasil riset di sini...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'editor'
  };

  const handleTitleChange = (newTitle: string) => {
    const updated = { ...activeDoc, title: newTitle, updatedAt: new Date().toISOString() };
    saveDocument(updated);
    setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    showSavedFeedback();
  };

  const handleContentChange = (newContent: string) => {
    const updated = { ...activeDoc, content: newContent, updatedAt: new Date().toISOString() };
    saveDocument(updated);
    setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 1500);
  };

  const handleCreateNew = () => {
    const created = createNewDocument(`Laporan Baru ${documents.length + 1}`);
    const nextList = getSavedDocuments();
    setDocuments(nextList);
    setCurrentDocId(created.id);
    if (onSelectDocumentId) onSelectDocumentId(created.id);
    setIsDocDropdownOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (documents.length <= 1) return;
    deleteDocument(id);
    const remaining = documents.filter(d => d.id !== id);
    setDocuments(remaining);
    if (currentDocId === id) {
      setCurrentDocId(remaining[0].id);
      if (onSelectDocumentId) onSelectDocumentId(remaining[0].id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-neutral-200">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-800 shrink-0 bg-[#0a0a0a] z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenSidebar && (
            <button 
              onClick={onOpenSidebar}
              className="min-w-[36px] min-h-[36px] p-2 text-neutral-400 hover:text-white transition-all rounded-xl hover:bg-neutral-800/80 active:bg-neutral-800 active:scale-95 flex items-center justify-center cursor-pointer select-none shrink-0"
              title="Buka Menu Sidebar"
              aria-label="Buka Menu Sidebar"
            >
              <Menu size={18} />
            </button>
          )}

          {/* Document Selector Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Daftar Dokumen Tersimpan"
            >
              <FileText className="text-emerald-400 shrink-0" size={15} />
              <span className="hidden md:inline">Dokumen</span>
              <ChevronDown size={13} className="text-neutral-500" />
            </button>

            {isDocDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#11141c] border border-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs custom-scrollbar max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                  <span>Dokumen Tersimpan ({documents.length})</span>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
                  >
                    <Plus size={12} />
                    <span>Baru</span>
                  </button>
                </div>

                <div className="space-y-0.5 px-1">
                  {documents.map(doc => {
                    const isSelected = doc.id === currentDocId;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setCurrentDocId(doc.id);
                          if (onSelectDocumentId) onSelectDocumentId(doc.id);
                          setIsDocDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/20'
                            : 'hover:bg-neutral-800/60 text-neutral-300'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{doc.title}</span>
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
                            title="Hapus dokumen"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block shrink-0" />

          {/* Document Title Input */}
          <input 
            type="text" 
            value={activeDoc.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-transparent border-none text-sm sm:text-base font-medium text-white focus:outline-none focus:ring-0 placeholder-neutral-500 w-44 sm:w-72 truncate"
            placeholder="Judul Dokumen..."
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Saved Status Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 px-2 py-1 rounded bg-neutral-900/80 border border-neutral-800">
            {isSavedNotice ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Tersimpan</span>
              </>
            ) : (
              <>
                <Save size={12} className="text-neutral-500" />
                <span className="hidden sm:inline">Auto-saved</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors border border-neutral-700/60 cursor-pointer"
            title="Buat Dokumen Baru"
          >
            <Plus size={14} />
            <span>Dokumen Baru</span>
          </button>

          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col border-r border-neutral-800 bg-[#121212] lg:max-w-[50%]">
          <div className="px-4 py-2 bg-[#1a1a1a] border-b border-neutral-800 text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center justify-between">
            <span>Markdown Editor</span>
            <span className="text-[10px] text-neutral-500 font-mono">Real-time sync</span>
          </div>
          <textarea
            value={activeDoc.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 text-sm text-neutral-300 font-mono resize-none focus:outline-none custom-scrollbar"
            placeholder="Ketik konten dokumen dalam format markdown di sini..."
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col bg-[#1c1c1c] overflow-y-auto relative custom-scrollbar print-preview-area">
          <div className="sticky top-0 px-4 py-2 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-neutral-800 text-xs font-semibold tracking-wider text-neutral-400 uppercase z-10 print:hidden flex items-center justify-between">
            <span>Dokumen Preview (PDF Format)</span>
            <span className="text-[10px] text-neutral-500 font-mono">Rendered Output</span>
          </div>
          <div 
            ref={printRef}
            className="p-8 md:p-12 max-w-4xl mx-auto w-full print-content bg-white min-h-[1056px] shadow-2xl my-8 print:shadow-none print:my-0"
          >
            <div className="markdown-body prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-red-600 prose-p:text-neutral-800 prose-li:text-neutral-800">
              <Markdown remarkPlugins={[remarkGfm]}>
                {`# ${activeDoc.title}\n\n${activeDoc.content}`}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
